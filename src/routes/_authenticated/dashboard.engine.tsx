import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { AlertTriangle, Compass, Target, Users, Sparkles, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { GovernanceAuditPanel } from "@/components/governance-audit-panel";

export const Route = createFileRoute("/_authenticated/dashboard/engine")({
  component: EnginePage,
});

const TRACK_INFO: Record<string, { ar: string; en: string }> = {
  TRACK_1_COMPETITIVE_EMPLOYMENT: { ar: "التوظيف التنافسي المباشر", en: "Competitive Integrated Employment (CIE)" },
  TRACK_2_SUPPORTED_ENTREPRENEURSHIP: { ar: "المشاريع الريادية والإنتاج الأسري المدعوم", en: "Supported Family Enterprise" },
  TRACK_3_SUPPORTED_LIVING: { ar: "مسار السكن والعيش المستقل المدعوم", en: "Supported Independent Living Tracks" },
  TRACK_4_CIVIC_HUB_ACCESS: { ar: "مسار المشاركة المجتمعية والمواطنة الكاملة", en: "Civic Agency & Community Hub Access" },
  TRACK_5_INCLUSIVE_HIGHER_EDUCATION: { ar: "التعليم العالي والمستمر الشامل", en: "Inclusive Post-Secondary Track" },
  TRACK_6_BLENDED_PROFILE_MATRIX: { ar: "ملف المسارات المختلطة التكيفي", en: "Blended Support Profiles Matrix" },
};

function drcTone(v: number) {
  if (v >= 0.75) return { ring: "stroke-emerald-500", bar: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500/40", glow: "from-emerald-500/15" };
  if (v >= 0.5) return { ring: "stroke-orange-500", bar: "bg-orange-500", text: "text-orange-500", border: "border-orange-500/40", glow: "from-orange-500/15" };
  return { ring: "stroke-red-500", bar: "bg-red-500", text: "text-red-500", border: "border-red-500/40", glow: "from-red-500/15" };
}

function DRCRing({ value }: { value: number }) {
  const tone = drcTone(value);
  const pct = Math.round(value * 100);
  const r = 32;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={r} className="fill-none stroke-muted" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={r}
          className={`fill-none ${tone.ring} transition-all duration-500`}
          strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${tone.text}`}>{pct}%</div>
    </div>
  );
}

function ageFromDob(dob?: string | null): number | null {
  if (!dob) return null;
  return (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000);
}

function EnginePage() {
  const [learnerId, setLearnerId] = useState<string>("");

  const { data: destinations, isLoading: destLoading } = useQuery({
    queryKey: ["destinations"],
    queryFn: async () => {
      const { data } = await supabase.from("destinations").select("*").order("destination_id");
      return data ?? [];
    },
  });

  const { data: learners } = useQuery({
    queryKey: ["learners"],
    queryFn: async () => {
      const { data } = await supabase.from("learners").select("*").order("learner_id");
      return data ?? [];
    },
  });

  const currentLearner = learners?.find((l: any) => String(l.learner_id) === learnerId);
  const learnerAge = ageFromDob(currentLearner?.date_of_birth);
  const inTransitionWindow = learnerAge !== null && learnerAge >= 16;

  const { data: drc, isLoading: drcLoading } = useQuery({
    queryKey: ["drc", learnerId, destinations?.map((d) => d.destination_id)],
    enabled: !!learnerId && !!destinations,
    queryFn: async () => {
      const result: Record<string, number> = {};
      for (const d of destinations!) {
        const { data, error } = await supabase.rpc("calculate_learner_drc", {
          p_learner_id: Number(learnerId),
          p_destination_id: d.destination_id,
        });
        if (error) { toast.error(`تعذّر حساب ${d.destination_id}: ${error.message}`); }
        result[d.destination_id] = Number(data ?? 0);
      }
      return result;
    },
  });

  const { data: track, isLoading: trackLoading } = useQuery({
    queryKey: ["gateway", learnerId],
    enabled: !!learnerId && inTransitionWindow,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("evaluate_gateway_routing", {
        p_learner_id: Number(learnerId),
      });
      if (error) toast.error("تعذّر حساب توصية البوّابة: " + error.message);
      return data as string | null;
    },
  });

  const { data: objectives } = useQuery({
    queryKey: ["objectives-cohort"],
    queryFn: async () => {
      const { data } = await supabase.from("individual_objectives").select("*, indicators(*, age_expectations(*, transition_stations(*, pathways(destination_id))))");
      return data ?? [];
    },
  });

  // Dignity guardrail (Rule 4): D5 wellbeing < 0.50
  const d5 = drc?.D5 ?? null;
  const guardrailActive = d5 !== null && d5 < 0.5;

  // Intelligence alerts
  const alerts: { level: "warn" | "error"; msg: string }[] = [];
  if (learners && objectives) {
    const learnerObjMap = new Map<number, number>();
    const learnerD1Map = new Map<number, boolean>();
    objectives.forEach((o: any) => {
      learnerObjMap.set(o.learner_id, (learnerObjMap.get(o.learner_id) ?? 0) + 1);
      const destId = o.indicators?.age_expectations?.transition_stations?.pathways?.destination_id;
      if (destId === "D1") learnerD1Map.set(o.learner_id, true);
    });
    learners.forEach((l: any) => {
      if (!learnerObjMap.has(l.learner_id)) {
        alerts.push({ level: "warn", msg: `المتعلم ${l.first_name} ${l.last_name}: لا توجد أهداف فردية مسجّلة بعد.` });
      }
      const age = ageFromDob(l.date_of_birth);
      if (age !== null && age >= 16 && !learnerD1Map.get(l.learner_id)) {
        alerts.push({
          level: "error",
          msg: `المتعلم ${l.first_name} ${l.last_name} (${Math.floor(age)} سنة): يفتقر إلى مهام في البيئات المهنية الخارجية (D1).`,
        });
      }
    });
  }
  if (guardrailActive) {
    alerts.push({ level: "error", msg: "حارس الكرامة (القاعدة 4) مُفعَّل: مؤشر الرفاهية D5 تحت 0.50 — أوقف توصية أي مسار مهني واعد بمراجعة شاملة." });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            محرك الانتقال — لوحة المشرف
          </h1>
          <p className="text-muted-foreground mt-1">قراءة جاهزية المتعلمين عبر الوجهات الخمس وتوجيه مسار ما بعد المدرسة.</p>
        </div>
        <div className="min-w-[240px]">
          <Select value={learnerId} onValueChange={setLearnerId}>
            <SelectTrigger>
              <SelectValue placeholder="اختر متعلماً لقراءة جاهزيته" />
            </SelectTrigger>
            <SelectContent>
              {learners?.map((l: any) => (
                <SelectItem key={l.learner_id} value={String(l.learner_id)}>
                  {l.first_name} {l.last_name} — {l.current_age_band}
                </SelectItem>
              ))}
              {(!learners || learners.length === 0) && (
                <div className="px-2 py-3 text-sm text-muted-foreground">لا يوجد متعلمون بعد</div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dignity Guardrail banner */}
      {learnerId && (
        <Card className={guardrailActive ? "border-2 border-destructive bg-destructive/5" : "border-2 border-emerald-500/40 bg-emerald-500/5"}>
          <CardContent className="flex items-start gap-3 py-4">
            {guardrailActive ? (
              <ShieldAlert className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-semibold">
                {guardrailActive ? "🚨 حارس الكرامة مُفعَّل (Rule 4 Enforcer)" : "حارس الكرامة: غير مُفعَّل"}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {guardrailActive
                  ? `مؤشر الرفاهية D5 = ${(d5! * 100).toFixed(0)}% — تحت العتبة الحرجة 50%. يتم تجميد توصية البوابة حتى مراجعة الفريق.`
                  : "مؤشر الرفاهية D5 يستوفي العتبة. التوصيات نشطة."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gateway recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            توصية البوّابة لما بعد المدرسة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!learnerId && <p className="text-sm text-muted-foreground">اختر متعلماً لعرض التوصية المحسوبة.</p>}
          {learnerId && !inTransitionWindow && (
            <p className="text-sm text-muted-foreground">
              نافذة الانتقال تبدأ من سن 16. عمر هذا المتعلم {learnerAge !== null ? Math.floor(learnerAge) : "—"} — لا توجد توصية بعد.
            </p>
          )}
          {learnerId && inTransitionWindow && (
            <div className="space-y-3">
              {trackLoading && <Skeleton className="h-14 w-full" />}
              {!trackLoading && track && TRACK_INFO[track] && (
                <div className="rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-transparent p-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="default" className="text-base px-3 py-1">
                      <Sparkles className="h-4 w-4 ml-1" />
                      {track.replace(/^TRACK_/, "T")}
                    </Badge>
                    {guardrailActive && (
                      <Badge variant="destructive">🚨 موقوفة بحارس الكرامة</Badge>
                    )}
                  </div>
                  <p className="text-lg font-bold">{TRACK_INFO[track].ar}</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">{TRACK_INFO[track].en}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">مبنية على معاملات DRC للوجهات الخمس وعتبات الحوكمة.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5 Destinations cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {destLoading && Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
        {destinations?.map((d: any) => {
          const score = drc?.[d.destination_id] ?? 0;
          const tone = drcTone(score);
          return (
            <Card
              key={d.destination_id}
              className={`border-2 ${tone.border} bg-gradient-to-br ${tone.glow} to-transparent`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono opacity-70">{d.destination_id}</span>
                  {learnerId && d.destination_id === "D5" && score < 0.5 && (
                    <Badge variant="destructive" className="text-[10px]">حرج</Badge>
                  )}
                </div>
                <CardTitle className="text-base leading-tight">{d.name_ar}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  {drcLoading && learnerId ? (
                    <Skeleton className="h-20 w-20 rounded-full" />
                  ) : (
                    <DRCRing value={learnerId ? score : 0} />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${tone.bar} transition-all duration-500`}
                        style={{ width: `${Math.round((learnerId ? score : 0) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {!learnerId ? "اختر متعلماً" : score >= 0.75 ? "جاهز" : score >= 0.5 ? "قيد التطوير" : "يحتاج تدخّل"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{d.engine_function}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cohort metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" />المتعلمون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{learners?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4" />الأهداف النشطة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{objectives?.filter((o: any) => o.is_active).length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" />تنبيهات الحوكمة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            سجل تنبيهات الذكاء النسقي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {alerts.length === 0 && <p className="text-sm text-muted-foreground">لا توجد تنبيهات حالياً — جميع الخطط تستوفي معايير الحوكمة.</p>}
          {alerts.map((a, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border p-3 bg-muted/30">
              <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${a.level === "error" ? "text-destructive" : "text-warning"}`} />
              <p className="text-sm">{a.msg}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <GovernanceAuditPanel learnerId={learnerId} />
    </div>
  );
}