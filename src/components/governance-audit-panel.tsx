import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ShieldCheck, Gavel, Loader2 } from "lucide-react";

type Severity = "critical" | "warning" | "info";

type AuditFinding = {
  code: string;
  severity: Severity;
  title_ar: string;
  detail_ar: string;
  predictor_en: string;
};

function ageYears(dob?: string | null): number | null {
  if (!dob) return null;
  const t = new Date(dob).getTime();
  if (Number.isNaN(t)) return null;
  return (Date.now() - t) / (365.25 * 24 * 3600 * 1000);
}

// Classify a scenario as community-based vs classroom-bound.
function isCommunityScenario(ctxType?: string | null): boolean {
  if (!ctxType) return false;
  const v = ctxType.toLowerCase();
  return (
    v.includes("community") ||
    v.includes("workplace") ||
    v.includes("employer") ||
    v.includes("work") ||
    v.includes("civic") ||
    v.includes("home") ||
    v.includes("public") ||
    v.includes("مجتمع") ||
    v.includes("عمل") ||
    v.includes("منزل")
  );
}
function isWorkScenario(ctxType?: string | null): boolean {
  if (!ctxType) return false;
  const v = ctxType.toLowerCase();
  return v.includes("work") || v.includes("employer") || v.includes("workplace") || v.includes("عمل");
}

const SEV_STYLES: Record<Severity, { border: string; bg: string; icon: string; badge: string; label: string }> = {
  critical: { border: "border-destructive/60", bg: "bg-destructive/5", icon: "text-destructive", badge: "destructive", label: "حرج" },
  warning: { border: "border-warning/60", bg: "bg-warning/5", icon: "text-warning", badge: "secondary", label: "تحذير" },
  info: { border: "border-primary/40", bg: "bg-primary/5", icon: "text-primary", badge: "outline", label: "ملاحظة" },
};

export function GovernanceAuditPanel({ learnerId }: { learnerId?: string | number | null }) {
  const id = learnerId ? Number(learnerId) : null;

  const { data: learner } = useQuery({
    queryKey: ["audit-learner", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await supabase.from("learners").select("*").eq("learner_id", id!).maybeSingle();
      return data;
    },
  });

  const { data: objectives, isLoading } = useQuery({
    queryKey: ["audit-objectives", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await supabase
        .from("individual_objectives")
        .select(
          "objective_id, target_scenario_id, is_active, indicators(indicator_id, age_expectations(station_id, transition_stations(pathway_id, pathways(destination_id))))"
        )
        .eq("learner_id", id!)
        .eq("is_active", true);
      return data ?? [];
    },
  });

  // Fallback: explicitly join scenarios via separate query (FK alias above may not exist).
  const { data: scenarioMap } = useQuery({
    queryKey: ["audit-scenarios-map"],
    queryFn: async () => {
      const { data } = await supabase.from("scenarios").select("scenario_id, context_library_type");
      const m = new Map<string, string | null>();
      (data ?? []).forEach((s: any) => m.set(s.scenario_id, s.context_library_type));
      return m;
    },
  });

  if (!id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gavel className="h-5 w-5 text-primary" />لوحة التدقيق وحوكمة الخطة</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">اختر متعلماً لتشغيل محرك التدقيق التنبؤي (NTACT:C Predictors).</p>
        </CardContent>
      </Card>
    );
  }

  const age = ageYears(learner?.date_of_birth);
  const inTransitionWindow = age !== null && age >= 16;

  const findings: AuditFinding[] = [];
  if (objectives) {
    const total = objectives.length;
    const destCounts: Record<string, number> = {};
    let communityCount = 0;
    let workCount = 0;
    objectives.forEach((o: any) => {
      const ctx = scenarioMap?.get(o.target_scenario_id) ?? null;
      if (isCommunityScenario(ctx)) communityCount += 1;
      if (isWorkScenario(ctx)) workCount += 1;
      const destId = o.indicators?.age_expectations?.transition_stations?.pathways?.destination_id;
      if (destId) destCounts[destId] = (destCounts[destId] ?? 0) + 1;
    });

    if (inTransitionWindow) {
      if (total === 0) {
        findings.push({
          code: "ALERT_PRED_00",
          severity: "critical",
          title_ar: "لا توجد أهداف فردية نشطة",
          detail_ar: `المتعلم في نافذة الانتقال (${Math.floor(age!)} سنة) دون أي هدف IEP نشط. ابدأ ببناء خطة قائمة على المؤشرات التنبؤية.`,
          predictor_en: "NTACT:C — Active IEP coverage",
        });
      } else {
        if (communityCount === 0) {
          findings.push({
            code: "ALERT_PRED_04",
            severity: "critical",
            title_ar: "اعتماد مفرط على البيئات الصفّية",
            detail_ar: `جميع الأهداف (${total}) مرتبطة بسيناريوهات صفّية بدون أي تعليم قائم على المجتمع (CBI). الدليل التنبؤي يربط CBI بنتائج توظيف وتعليم أعلى.`,
            predictor_en: "Community-Based Instruction (CBI) absent",
          });
        } else if (communityCount / total < 0.3) {
          findings.push({
            code: "ALERT_PRED_04B",
            severity: "warning",
            title_ar: "تغطية محدودة للسيناريوهات المجتمعية",
            detail_ar: `${communityCount}/${total} أهداف فقط في بيئات مجتمعية (${Math.round((communityCount / total) * 100)}%). الموصى به ≥ 30%.`,
            predictor_en: "Community CBI coverage below threshold",
          });
        }
        if (workCount === 0) {
          findings.push({
            code: "ALERT_PRED_01",
            severity: "critical",
            title_ar: "غياب خبرة العمل المأجور",
            detail_ar: "لا توجد أهداف ضمن سيناريوهات عمل/توظيف. خبرة العمل المأجور (Paid Work Experience) من أقوى المتنبئات بالتوظيف التنافسي بعد المدرسة.",
            predictor_en: "Paid Work Experience missing",
          });
        }
        if (!destCounts["D1"]) {
          findings.push({
            code: "ALERT_PRED_02",
            severity: "warning",
            title_ar: "لا أهداف في وجهة العمل (D1)",
            detail_ar: "نافذة الانتقال نشطة دون أي أهداف مرتبطة بوجهة العمل والإنتاج. راجع التعاون بين الوكالات (Interagency Collaboration).",
            predictor_en: "Interagency Collaboration / D1 coverage",
          });
        }
        if (!destCounts["D3"] && !destCounts["D4"]) {
          findings.push({
            code: "ALERT_PRED_03",
            severity: "warning",
            title_ar: "غياب أهداف المشاركة المجتمعية والسكن",
            detail_ar: "لا توجد أهداف في وجهتَي السكن المستقل (D3) أو المشاركة المدنية (D4). الانتقال الشامل يتطلب تغطية متعددة الوجهات.",
            predictor_en: "Independent Living & Community Participation coverage",
          });
        }
      }
    } else if (age !== null && age >= 14 && total > 0 && communityCount === 0) {
      findings.push({
        code: "ALERT_PRED_PRE",
        severity: "info",
        title_ar: "تهيئة مبكرة موصى بها",
        detail_ar: `العمر ${Math.floor(age)} سنة — يُنصح ببدء إدخال سيناريوهات مجتمعية تمهيداً لنافذة الانتقال في 16.`,
        predictor_en: "Pre-transition CBI seeding",
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gavel className="h-5 w-5 text-primary" />
          لوحة التدقيق وحوكمة الخطة
          <span className="text-xs font-normal text-muted-foreground mr-2" dir="ltr">Governance & Audit Panel</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-6 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin ml-2" /> جارٍ تحليل الخطة عبر متنبئات NTACT:C...
          </div>
        )}
        {!isLoading && findings.length === 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3">
            <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">الخطة تستوفي متنبئات الانتقال القائمة على الدليل</p>
              <p className="text-xs text-muted-foreground mt-0.5">لا توجد علامات تحسين مفعّلة حالياً.</p>
            </div>
          </div>
        )}
        {!isLoading && findings.map((f) => {
          const s = SEV_STYLES[f.severity];
          return (
            <div key={f.code} className={`rounded-lg border-2 ${s.border} ${s.bg} p-3 space-y-1.5`}>
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <ShieldAlert className={`h-4 w-4 ${s.icon}`} />
                  <span className="font-mono text-xs opacity-80">[{f.code}]</span>
                  <span className="font-semibold text-sm">{f.title_ar}</span>
                </div>
                <Badge variant={s.badge as any}>{s.label}</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.detail_ar}</p>
              <p className="text-[10px] text-muted-foreground/80 font-mono" dir="ltr">↳ Predictor: {f.predictor_en}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}