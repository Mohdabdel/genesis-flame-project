import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { AlertTriangle, Compass, Target, Users, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/engine")({
  component: EnginePage,
});

const DEST_COLORS: Record<string, string> = {
  D1: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
  D2: "from-sky-500/20 to-sky-500/5 border-sky-500/30",
  D3: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
  D4: "from-violet-500/20 to-violet-500/5 border-violet-500/30",
  D5: "from-rose-500/20 to-rose-500/5 border-rose-500/30",
};

const TRACK_LABEL: Record<string, string> = {
  TRACK_1_COMPETITIVE_EMPLOYMENT: "التوظيف التنافسي",
  TRACK_2_SUPPORTED_ENTREPRENEURSHIP: "الريادة المدعومة",
  TRACK_3_SUPPORTED_LIVING: "العيش المدعوم",
  TRACK_4_CIVIC_HUB_ACCESS: "الوصول المدني",
  TRACK_5_INCLUSIVE_HIGHER_EDUCATION: "التعليم العالي الدامج",
  TRACK_6_BLENDED_PROFILE_MATRIX: "المصفوفة المختلطة",
};

function EnginePage() {
  const [learnerId, setLearnerId] = useState<string>("");

  const { data: destinations } = useQuery({
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

  const { data: drc } = useQuery({
    queryKey: ["drc", learnerId, destinations?.map((d) => d.destination_id)],
    enabled: !!learnerId && !!destinations,
    queryFn: async () => {
      const result: Record<string, number> = {};
      for (const d of destinations!) {
        const { data } = await supabase.rpc("calculate_learner_drc", {
          p_learner_id: Number(learnerId),
          p_destination_id: d.destination_id,
        });
        result[d.destination_id] = Number(data ?? 0);
      }
      return result;
    },
  });

  const { data: track } = useQuery({
    queryKey: ["gateway", learnerId],
    enabled: !!learnerId,
    queryFn: async () => {
      const { data } = await supabase.rpc("evaluate_gateway_routing", {
        p_learner_id: Number(learnerId),
      });
      return data as string | null;
    },
  });

  const { data: objectives } = useQuery({
    queryKey: ["objectives-cohort"],
    queryFn: async () => {
      const { data } = await supabase.from("individual_objectives").select("*, indicators(*, age_expectations(*, transition_stations(*)))");
      return data ?? [];
    },
  });

  // Intelligence alerts: learners with no objectives, or with no D1/D3 coverage
  const alerts: { level: "warn" | "error"; msg: string }[] = [];
  if (learners && objectives) {
    const learnerObjMap = new Map<number, number>();
    objectives.forEach((o: any) => {
      learnerObjMap.set(o.learner_id, (learnerObjMap.get(o.learner_id) ?? 0) + 1);
    });
    learners.forEach((l: any) => {
      if (!learnerObjMap.has(l.learner_id)) {
        alerts.push({ level: "warn", msg: `المتعلم ${l.first_name} ${l.last_name}: لا توجد أهداف فردية مسجّلة بعد.` });
      }
    });
    if (objectives.length > 0) {
      const tags = new Set(objectives.flatMap((o: any) => o.indicators?.age_expectations?.transition_stations?.pathway_id?.split(".")?.[0] ?? []));
      if (!tags.has("P1")) alerts.push({ level: "warn", msg: "خطط الكوهورت تفتقر إلى وسوم العمل الخارجي (D1)." });
    }
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
          {learnerId && (
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="default" className="text-base px-4 py-2">
                <Sparkles className="h-4 w-4 ml-2" />
                {track ? TRACK_LABEL[track] ?? track : "جاري الحساب..."}
              </Badge>
              <p className="text-sm text-muted-foreground">مبنية على معاملات DRC للوجهات الخمس وعتبات الحوكمة.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5 Destinations cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {destinations?.map((d: any) => {
          const score = drc?.[d.destination_id] ?? 0;
          const pct = Math.round(score * 100);
          return (
            <Card
              key={d.destination_id}
              className={`bg-gradient-to-br ${DEST_COLORS[d.destination_id] ?? ""} border-2`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono opacity-70">{d.destination_id}</span>
                  <span className="text-xl font-bold">{pct}%</span>
                </div>
                <CardTitle className="text-base leading-tight">{d.name_ar}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={pct} className="h-2" />
                <p className="text-xs text-muted-foreground line-clamp-3">{d.engine_function}</p>
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
    </div>
  );
}