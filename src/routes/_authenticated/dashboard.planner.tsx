import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronLeft, Network, UserPlus, Sparkles, CheckCircle2, Trophy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { GovernanceAuditPanel } from "@/components/governance-audit-panel";
import { ITPExportButton } from "@/components/itp-export";

type AgeBand = Database["public"]["Enums"]["age_band_tier"];

export const Route = createFileRoute("/_authenticated/dashboard/planner")({
  component: PlannerPage,
});

function computeAgeBand(dob: string | null | undefined): AgeBand | null {
  if (!dob) return null;
  const t = new Date(dob).getTime();
  if (Number.isNaN(t)) return null;
  const age = (Date.now() - t) / (365.25 * 24 * 3600 * 1000);
  if (age < 0) return null;
  if (age < 6) return "0-5";
  if (age < 10) return "6-9";
  if (age < 13) return "10-12";
  if (age < 16) return "13-15";
  if (age < 19) return "16-18";
  return "18+";
}

function PlannerPage() {
  const qc = useQueryClient();
  const [selectedLearner, setSelectedLearner] = useState<string>("");
  const [showCreateLearner, setShowCreateLearner] = useState(false);

  // form state
  const [destId, setDestId] = useState("");
  const [pathwayId, setPathwayId] = useState("");
  const [stationId, setStationId] = useState("");
  const [indicatorId, setIndicatorId] = useState("");
  const [scenarioId, setScenarioId] = useState("");
  const [iepGoal, setIepGoal] = useState("");

  const { data: destinations } = useQuery({
    queryKey: ["destinations"],
    queryFn: async () => (await supabase.from("destinations").select("*").order("destination_id")).data ?? [],
  });
  const { data: pathways } = useQuery({
    queryKey: ["pathways"],
    queryFn: async () => (await supabase.from("pathways").select("*").order("pathway_id")).data ?? [],
  });
  const { data: stations } = useQuery({
    queryKey: ["stations"],
    queryFn: async () => (await supabase.from("transition_stations").select("*").order("station_id")).data ?? [],
  });
  const { data: learners } = useQuery({
    queryKey: ["learners"],
    queryFn: async () => (await supabase.from("learners").select("*").order("learner_id")).data ?? [],
  });
  const { data: scenarios } = useQuery({
    queryKey: ["scenarios"],
    queryFn: async () => (await supabase.from("scenarios").select("*")).data ?? [],
  });

  const currentLearner = learners?.find((l: any) => String(l.learner_id) === selectedLearner);
  const ageBand = currentLearner ? computeAgeBand(currentLearner.date_of_birth) : null;

  const { data: ageExpectations } = useQuery({
    queryKey: ["age-expectations", stationId, ageBand],
    enabled: !!stationId && !!ageBand,
    queryFn: async () => {
      const { data } = await supabase
        .from("age_expectations")
        .select("*, indicators(*)")
        .eq("station_id", stationId)
        .eq("age_band", ageBand!);
      return data ?? [];
    },
  });

  const indicators = useMemo(
    () => (ageExpectations ?? []).flatMap((e: any) => e.indicators ?? []),
    [ageExpectations],
  );

  const canCreate = destId && pathwayId && stationId && indicatorId && scenarioId && iepGoal.trim() && selectedLearner;

  const createObjective = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("individual_objectives").insert({
        learner_id: Number(selectedLearner),
        indicator_id: indicatorId,
        target_scenario_id: scenarioId,
        generated_iep_goal_ar: iepGoal,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم إنشاء الهدف الفردي بنجاح");
      setIepGoal("");
      setIndicatorId("");
      setScenarioId("");
      qc.invalidateQueries({ queryKey: ["objectives-cohort"] });
    },
    onError: (e: any) => toast.error("تعذّر إنشاء الهدف: " + e.message),
  });

  // Mastery tracker: load objectives + recent evidence for the active learner
  const { data: masteryObjectives, isLoading: masteryLoading } = useQuery({
    queryKey: ["mastery-objectives", selectedLearner],
    enabled: !!selectedLearner,
    queryFn: async () => {
      const { data } = await supabase
        .from("individual_objectives")
        .select("objective_id, generated_iep_goal_ar, target_scenario_id, indicators(description_ar), evidence_records(evidence_id, independence_score, context_verification_metadata, timestamp)")
        .eq("learner_id", Number(selectedLearner))
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr] itp-no-print">
      {/* Sidebar tree */}
      <Card className="lg:sticky lg:top-4 self-start max-h-[calc(100vh-2rem)] overflow-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Network className="h-4 w-4 text-primary" />
            شجرة الإطار
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {destinations?.map((d: any) => (
            <Collapsible key={d.destination_id} defaultOpen={false}>
              <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md p-2 hover:bg-accent text-right">
                <ChevronDown className="h-3 w-3 shrink-0 transition-transform data-[state=closed]:-rotate-90" />
                <span className="font-medium">{d.name_ar}</span>
                <span className="text-xs text-muted-foreground mr-auto font-mono">{d.destination_id}</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="pr-4 space-y-1">
                {pathways?.filter((p: any) => p.destination_id === d.destination_id).map((p: any) => (
                  <Collapsible key={p.pathway_id}>
                    <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md p-1.5 hover:bg-accent text-right">
                      <ChevronLeft className="h-3 w-3 shrink-0 transition-transform data-[state=open]:rotate-[-90deg]" />
                      <span className="text-xs">{p.title_ar}</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pr-4 mt-1 space-y-0.5">
                      {stations?.filter((s: any) => s.pathway_id === p.pathway_id).map((s: any) => (
                        <div key={s.station_id} className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground cursor-default">
                          • {s.name_ar}
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ورشة المخطّط التربوي</h1>
            <p className="text-muted-foreground">حدّد المتعلم، ثم أنشئ هدفاً فردياً متسلسلاً عبر الهيكل الحاكم.</p>
          </div>
          <ITPExportButton learnerId={selectedLearner} />
        </div>

        {/* Learner picker */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">ملف المتعلم</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowCreateLearner((v) => !v)}>
              <UserPlus className="h-4 w-4 ml-1" /> إضافة متعلم
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {showCreateLearner && <CreateLearnerForm onDone={() => { setShowCreateLearner(false); qc.invalidateQueries({ queryKey: ["learners"] }); }} />}
            <Select value={selectedLearner} onValueChange={setSelectedLearner}>
              <SelectTrigger><SelectValue placeholder="اختر متعلماً" /></SelectTrigger>
              <SelectContent>
                {learners?.map((l: any) => (
                  <SelectItem key={l.learner_id} value={String(l.learner_id)}>
                    {l.first_name} {l.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentLearner && (
              <div className="flex items-center gap-3 flex-wrap rounded-lg bg-muted/40 p-3">
                <Badge variant="secondary">تاريخ الميلاد: {currentLearner.date_of_birth ?? "غير محدّد"}</Badge>
                <Badge>الفئة العمرية: {ageBand ?? "غير متاحة"}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* IEP Builder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />مولّد الهدف الفردي IEP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Step n={1} label="الوجهة">
              <Select value={destId} onValueChange={(v) => { setDestId(v); setPathwayId(""); setStationId(""); setIndicatorId(""); }} disabled={!selectedLearner}>
                <SelectTrigger><SelectValue placeholder="اختر وجهة حياتية" /></SelectTrigger>
                <SelectContent>{destinations?.map((d: any) => <SelectItem key={d.destination_id} value={d.destination_id}>{d.name_ar}</SelectItem>)}</SelectContent>
              </Select>
            </Step>
            <Step n={2} label="المسار النمائي" done={!!destId}>
              <Select value={pathwayId} onValueChange={(v) => { setPathwayId(v); setStationId(""); setIndicatorId(""); }} disabled={!destId}>
                <SelectTrigger><SelectValue placeholder="اختر مساراً" /></SelectTrigger>
                <SelectContent>{pathways?.filter((p: any) => p.destination_id === destId).map((p: any) => <SelectItem key={p.pathway_id} value={p.pathway_id}>{p.title_ar}</SelectItem>)}</SelectContent>
              </Select>
            </Step>
            <Step n={3} label="المحطة الانتقالية" done={!!pathwayId}>
              <Select value={stationId} onValueChange={(v) => { setStationId(v); setIndicatorId(""); }} disabled={!pathwayId}>
                <SelectTrigger><SelectValue placeholder="اختر محطة" /></SelectTrigger>
                <SelectContent>{stations?.filter((s: any) => s.pathway_id === pathwayId).map((s: any) => <SelectItem key={s.station_id} value={s.station_id}>{s.name_ar}</SelectItem>)}</SelectContent>
              </Select>
            </Step>
            <Step n={4} label={`المؤشر (مفلتر حسب الفئة ${ageBand ?? "—"})`} done={!!stationId}>
              <Select value={indicatorId} onValueChange={setIndicatorId} disabled={!stationId || indicators.length === 0}>
                <SelectTrigger><SelectValue placeholder={indicators.length === 0 ? "لا توجد مؤشرات لهذه الفئة العمرية" : "اختر مؤشراً"} /></SelectTrigger>
                <SelectContent>{indicators.map((i: any) => <SelectItem key={i.indicator_id} value={i.indicator_id}>{i.description_ar}</SelectItem>)}</SelectContent>
              </Select>
            </Step>
            <Step n={5} label="السيناريو" done={!!indicatorId}>
              <Select value={scenarioId} onValueChange={setScenarioId} disabled={!indicatorId}>
                <SelectTrigger><SelectValue placeholder={scenarios?.length ? "اختر سيناريو" : "لا توجد سيناريوهات بعد"} /></SelectTrigger>
                <SelectContent>{scenarios?.map((s: any) => <SelectItem key={s.scenario_id} value={s.scenario_id}>{s.title_ar}</SelectItem>)}</SelectContent>
              </Select>
            </Step>
            <div className="space-y-2">
              <Label>صياغة الهدف (IEP)</Label>
              <Textarea value={iepGoal} onChange={(e) => setIepGoal(e.target.value)} rows={3} placeholder="مثال: سيُتقن المتعلم استخدام تطبيق المواصلات الذكية باستقلالية في 4 رحلات متتالية..." />
            </div>
            <Button disabled={!canCreate || createObjective.isPending} onClick={() => createObjective.mutate()} className="w-full">
              {createObjective.isPending ? "جارٍ الحفظ..." : "إنشاء الهدف الفردي"}
            </Button>
          </CardContent>
        </Card>

        {/* Mastery Tracker */}
        {selectedLearner && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-primary" />متتبّع الإتقان والتعميم السياقي</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {masteryLoading && (
                <div className="flex items-center justify-center py-6 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin ml-2" /> جارٍ تحميل سجلات الأدلة...
                </div>
              )}
              {!masteryLoading && (masteryObjectives ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد أهداف نشطة لهذا المتعلم.</p>
              )}
              {(masteryObjectives ?? []).map((o: any) => {
                const records = (o.evidence_records ?? []) as any[];
                const sorted = [...records].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                const last3 = sorted.slice(0, 3);
                const threeStableHigh = last3.length === 3 && last3.every((r) => Number(r.independence_score) >= 0.90);
                const distinctScenarios = new Set(
                  records
                    .filter((r) => Number(r.independence_score) >= 0.90)
                    .map((r) => r.context_verification_metadata?.scenario_id)
                    .filter(Boolean),
                );
                const mastered = threeStableHigh && distinctScenarios.size >= 2;
                return (
                  <div key={o.objective_id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium flex-1">{o.generated_iep_goal_ar}</p>
                      {mastered ? (
                        <Badge className="bg-success text-success-foreground shrink-0">
                          <Trophy className="h-3 w-3 ml-1" /> متقَن
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="shrink-0">ناشئ</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>محاولات: {records.length}</span>
                      <span>•</span>
                      <span>آخر 3 ≥ 90%: {threeStableHigh ? "✓" : "—"}</span>
                      <span>•</span>
                      <span>سياقات متمايزة: {distinctScenarios.size}/2</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <GovernanceAuditPanel learnerId={selectedLearner} />
      </div>
    </div>
  );
}

function Step({ n, label, done, children }: { n: number; label: string; done?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>
          {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
        </span>
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

function CreateLearnerForm({ onDone }: { onDone: () => void }) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [dob, setDob] = useState("");
  const submit = async () => {
    if (!first || !last || !dob) return toast.error("جميع الحقول مطلوبة");
    const band = computeAgeBand(dob);
    if (!band) return toast.error("تاريخ ميلاد غير صالح");
    const { error } = await supabase.from("learners").insert({
      first_name: first,
      last_name: last,
      date_of_birth: dob,
      current_age_band: band,
    });
    if (error) return toast.error(error.message);
    toast.success("تمت إضافة المتعلم");
    onDone();
  };
  return (
    <div className="grid gap-3 sm:grid-cols-3 rounded-lg border p-3 bg-muted/20">
      <Input placeholder="الاسم الأول" value={first} onChange={(e) => setFirst(e.target.value)} />
      <Input placeholder="اسم العائلة" value={last} onChange={(e) => setLast(e.target.value)} />
      <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
      <Button onClick={submit} className="sm:col-span-3">حفظ المتعلم</Button>
    </div>
  );
}