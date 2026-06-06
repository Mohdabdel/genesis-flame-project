import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileDown, Printer, Loader2, ShieldCheck, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";

const TRACK_INFO: Record<string, { ar: string; en: string }> = {
  TRACK_1_COMPETITIVE_EMPLOYMENT: { ar: "التوظيف التنافسي المباشر", en: "Competitive Integrated Employment (CIE)" },
  TRACK_2_SUPPORTED_ENTREPRENEURSHIP: { ar: "المشاريع الريادية والإنتاج الأسري المدعوم", en: "Supported Family Enterprise" },
  TRACK_3_SUPPORTED_LIVING: { ar: "السكن والعيش المستقل المدعوم", en: "Supported Independent Living" },
  TRACK_4_CIVIC_HUB_ACCESS: { ar: "المشاركة المجتمعية والمواطنة الكاملة", en: "Civic Agency & Community Hub" },
  TRACK_5_INCLUSIVE_HIGHER_EDUCATION: { ar: "التعليم العالي والمستمر الشامل", en: "Inclusive Post-Secondary" },
  TRACK_6_BLENDED_PROFILE_MATRIX: { ar: "ملف المسارات المختلطة التكيفي", en: "Blended Support Profiles Matrix" },
};

const DEST_AR: Record<string, string> = { D1: "العمل والإنتاج", D2: "السكن المستقل", D3: "المشاركة المجتمعية", D4: "التعلم مدى الحياة", D5: "الرفاهية والصحة" };

function ageYears(dob?: string | null): number | null {
  if (!dob) return null;
  const t = new Date(dob).getTime();
  if (Number.isNaN(t)) return null;
  return (Date.now() - t) / (365.25 * 24 * 3600 * 1000);
}

function drcTone(v: number) {
  if (v >= 0.75) return { label: "جاهز", color: "#10b981" };
  if (v >= 0.5) return { label: "قيد التطوير", color: "#f59e0b" };
  return { label: "يحتاج تدخّل", color: "#ef4444" };
}

export function ITPExportButton({
  learnerId,
  hasActivePlan,
}: {
  learnerId?: string | number | null;
  hasActivePlan?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedLearner = !!learnerId;
  // Strict guard: requires both an active learner profile AND verified active objectives.
  // When hasActivePlan is not provided (e.g. engine page), fall back to learner selection only.
  const enabled =
    hasActivePlan === undefined ? selectedLearner : selectedLearner && hasActivePlan;
  return (
    <>
      <Button
        variant="default"
        size="sm"
        disabled={!enabled}
        onClick={() => setOpen(true)}
        className={`gap-2 ${!enabled ? "opacity-50" : ""}`}
        title={
          !selectedLearner
            ? "اختر ملف متعلم أولاً"
            : hasActivePlan === false
              ? "لا توجد أهداف فردية نشطة لهذا المتعلم"
              : undefined
        }
      >
        <FileDown className="h-4 w-4" />
        استخراج وثيقة الانتقال المعتمدة والموحدة
        <span className="hidden md:inline opacity-70" dir="ltr">/ Export Official ITP Document</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0 itp-no-print">
          <DialogHeader className="sticky top-0 z-10 bg-background border-b p-4 itp-no-print">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <DialogTitle>وثيقة الانتقال المعتمدة والموحدة للطالب (ITP Official Document)</DialogTitle>
              <Button onClick={() => window.print()} className="gap-2">
                <Printer className="h-4 w-4" /> طباعة / حفظ PDF
              </Button>
            </div>
          </DialogHeader>
          {open && learnerId && <ITPDocument learnerId={Number(learnerId)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ITPDocument({ learnerId }: { learnerId: number }) {
  const { data: learner } = useQuery({
    queryKey: ["itp-learner", learnerId],
    queryFn: async () => (await supabase.from("learners").select("*").eq("learner_id", learnerId).maybeSingle()).data,
  });

  const { data: destinations } = useQuery({
    queryKey: ["destinations"],
    queryFn: async () => (await supabase.from("destinations").select("*").order("destination_id")).data ?? [],
  });

  const { data: objectives, isLoading: objLoading } = useQuery({
    queryKey: ["itp-objectives", learnerId],
    queryFn: async () => {
      const { data } = await supabase
        .from("individual_objectives")
        .select(
          "objective_id, generated_iep_goal_ar, target_scenario_id, is_active, created_at, indicators(indicator_id, description_ar, age_expectations(age_band, station_id, transition_stations(station_id, name_ar, pathway_id, pathways(pathway_id, title_ar, destination_id)))), evidence_records(evidence_id, independence_score, context_verification_metadata, timestamp)"
        )
        .eq("learner_id", learnerId)
        .eq("is_active", true)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  const { data: scenarioMap } = useQuery({
    queryKey: ["itp-scenarios"],
    queryFn: async () => {
      const { data } = await supabase.from("scenarios").select("scenario_id, title_ar, context_library_type");
      const m = new Map<string, { title: string; ctx: string | null }>();
      (data ?? []).forEach((s: any) => m.set(s.scenario_id, { title: s.title_ar, ctx: s.context_library_type }));
      return m;
    },
  });

  const { data: drc, isLoading: drcLoading } = useQuery({
    queryKey: ["itp-drc", learnerId],
    enabled: !!destinations,
    queryFn: async () => {
      const r: Record<string, number> = {};
      for (const d of destinations!) {
        const { data } = await supabase.rpc("calculate_learner_drc", { p_learner_id: learnerId, p_destination_id: d.destination_id });
        r[d.destination_id] = Number(data ?? 0);
      }
      return r;
    },
  });

  const age = ageYears(learner?.date_of_birth);
  const inTransition = age !== null && age >= 16;

  const { data: track } = useQuery({
    queryKey: ["itp-gateway", learnerId, inTransition],
    enabled: inTransition,
    queryFn: async () => {
      const { data } = await supabase.rpc("evaluate_gateway_routing", { p_learner_id: learnerId });
      return data as string | null;
    },
  });

  const ready = !objLoading && !drcLoading && learner && destinations;

  // success toast once
  useEffect(() => {
    if (ready) toast.success("تم تجميع وثيقة الانتقال المعتمدة والموحدة للطالب من قاعدة البيانات");
  }, [ready]);

  const d5 = drc?.D5 ?? null;
  const guardrail = d5 !== null && d5 < 0.5;

  // Build audit findings (mirror of GovernanceAuditPanel logic)
  const findings = useMemo(() => buildFindings({ age, objectives: objectives ?? [], scenarioMap }), [age, objectives, scenarioMap]);

  // Aggregate evidence stats
  const evidenceStats = useMemo(() => {
    let trials = 0;
    const scenarios = new Set<string>();
    let highTrials = 0;
    (objectives ?? []).forEach((o: any) => {
      const recs = (o.evidence_records ?? []) as any[];
      trials += recs.length;
      recs.forEach((r) => {
        if (r.context_verification_metadata?.scenario_id) scenarios.add(r.context_verification_metadata.scenario_id);
        if (Number(r.independence_score) >= 0.9) highTrials += 1;
      });
      if (o.target_scenario_id) scenarios.add(o.target_scenario_id);
    });
    return { trials, uniqueScenarios: scenarios.size, highTrials };
  }, [objectives]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin ml-2" /> جارٍ تجميع البيانات الرسمية...
      </div>
    );
  }

  const today = new Date().toLocaleDateString("ar-SA-u-ca-gregory", { year: "numeric", month: "long", day: "numeric" });
  const docId = `ITP-${learnerId}-${new Date().getFullYear()}`;

  return (
    <div className="itp-print-root bg-white text-black p-8 print:p-0 print:bg-white" dir="rtl" style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}>
      {/* Header */}
      <header className="border-b-2 border-black pb-4 mb-6 break-inside-avoid">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">وثيقة الانتقال المعتمدة والموحدة للطالب</h1>
            <p className="text-sm opacity-70" dir="ltr">ITP Official Document — Individualized Transition Program — Certified Record</p>
          </div>
          <div className="text-left text-xs space-y-0.5">
            <p><span className="opacity-60">رقم الوثيقة:</span> <span className="font-mono font-semibold">{docId}</span></p>
            <p><span className="opacity-60">تاريخ الإصدار:</span> {today}</p>
            <p className="opacity-60" dir="ltr">Himam Transition Engine v1.0</p>
          </div>
        </div>
      </header>

      {/* Learner block */}
      <section className="mb-6 break-inside-avoid">
        <SectionTitle ar="بيانات المتعلم" en="Learner Profile" />
        <div className="grid grid-cols-4 gap-3 text-sm">
          <Field label="الاسم الكامل" value={`${learner.first_name} ${learner.last_name}`} />
          <Field label="تاريخ الميلاد" value={learner.date_of_birth ?? "—"} />
          <Field label="العمر الزمني" value={age !== null ? `${Math.floor(age)} سنة` : "—"} />
          <Field label="الفئة العمرية" value={learner.current_age_band ?? "—"} />
        </div>
        {learner.support_intensity_profile && Object.keys(learner.support_intensity_profile).length > 0 && (
          <div className="mt-3 text-xs">
            <span className="font-semibold">ملف كثافة الدعم: </span>
            <span className="font-mono opacity-80">{JSON.stringify(learner.support_intensity_profile)}</span>
          </div>
        )}
      </section>

      {/* DRC bars */}
      <section className="mb-6 break-inside-avoid">
        <SectionTitle ar="معاملات الجاهزية التراكمية لوجهات الرشد الثابتة (DRC — D1..D5)" en="Destination Readiness Coefficients — Adult Life Destinations D1..D5" />
        <div className="space-y-2">
          {destinations!.map((d: any) => {
            const v = drc?.[d.destination_id] ?? 0;
            const tone = drcTone(v);
            return (
              <div key={d.destination_id} className="grid grid-cols-[80px_1fr_80px_90px] items-center gap-3 text-sm">
                <div className="font-mono font-bold">{d.destination_id}</div>
                <div className="relative h-5 rounded border border-black/30 bg-black/5 overflow-hidden">
                  <div className="absolute inset-y-0 right-0" style={{ width: `${Math.round(v * 100)}%`, background: tone.color }} />
                </div>
                <div className="font-mono text-left">{(v * 100).toFixed(0)}%</div>
                <div className="text-xs">{DEST_AR[d.destination_id] ?? d.name_ar}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Gateway recommendation */}
      <section className="mb-6 break-inside-avoid">
        <SectionTitle ar="بوابة الخروج التكيفية — محرك توصيات مسارات الرشد" en="Adaptive Exit Gateway — Adult Pathway Recommendation Engine" />
        {!inTransition && (
          <p className="text-sm opacity-70">نافذة الانتقال تبدأ في سن 16. لم تُحسب توصية حتمية بعد.</p>
        )}
        {inTransition && track && TRACK_INFO[track] && (
          <div className="border-2 border-black/80 rounded-lg p-4 flex items-start gap-3">
            <Sparkles className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <p className="font-mono text-xs opacity-70">{track}</p>
              <p className="text-lg font-bold">{TRACK_INFO[track].ar}</p>
              <p className="text-sm opacity-80" dir="ltr">{TRACK_INFO[track].en}</p>
            </div>
            <div className="text-xs text-left space-y-1">
              <div className="inline-flex items-center gap-1 border border-black px-2 py-0.5 rounded">شارة الحوكمة المعتمدة</div>
              {guardrail ? (
                <div className="inline-flex items-center gap-1 bg-black text-white px-2 py-0.5 rounded">
                  <ShieldAlert className="h-3 w-3" /> صمام الأمان الحوكمي (Rule 4) مُفعَّل
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 border border-black/60 px-2 py-0.5 rounded">
                  <ShieldCheck className="h-3 w-3" /> غير مُفعَّل
                </div>
              )}
            </div>
          </div>
        )}
        {/* Safety override log */}
        <div className="mt-2 text-xs border-r-2 border-black/40 pr-3">
          <p className="font-semibold">سجل صمام الأمان الحوكمي وحارس الكرامة (Rule 4 Enforcer):</p>
          <p>
            مؤشر الرفاهية والأمن النفسي D5 = {d5 !== null ? `${Math.round(d5 * 100)}%` : "—"} —
            {guardrail
              ? " [GOVERNANCE_BADGE]: تفعيل صمام الأمان الحوكمي وحارس الكرامة (Rule 4 Enforcer) نظراً لتدني مؤشرات الرفاهية والأمن النفسي (D5 < 0.50). تم تجميد مسارات التوجيه الإنتاجي والعمل الشاق مؤقتاً، وفرض مصفوفة الدعم الأسري والنفسي المتكامل كأولوية قصوى."
              : " ضمن العتبة الحوكمية. توصية بوابة الخروج التكيفية نشطة."}
          </p>
        </div>
      </section>

      {/* IEP objectives grouped by destination */}
      <section className="mb-6">
        <SectionTitle ar="الأهداف الفردية المشتقة حوكمياً (المنسوجة سياقياً)" en="Governance-Derived Individual Objectives — Destination → Pathway → Station → Indicator → Scenario" />
        {(objectives ?? []).length === 0 && <p className="text-sm opacity-70">لا توجد أهداف نشطة مسجّلة.</p>}
        <div className="space-y-3">
          {(objectives ?? []).map((o: any) => {
            const ind = o.indicators;
            const station = ind?.age_expectations?.transition_stations;
            const pathway = station?.pathways;
            const destId = pathway?.destination_id;
            const destAr = destId ? (DEST_AR[destId] ?? destinations!.find((d: any) => d.destination_id === destId)?.name_ar ?? destId) : "—";
            const sc = scenarioMap?.get(o.target_scenario_id);
            return (
              <div key={o.objective_id} className="border border-black/40 rounded-md p-3 break-inside-avoid text-sm">
                <div className="flex items-center gap-2 flex-wrap text-xs font-mono mb-2">
                  <Chip>{destId ?? "—"} · {destAr}</Chip>
                  <span>›</span>
                  <Chip>{pathway?.title_ar ?? "—"}</Chip>
                  <span>›</span>
                  <Chip>{station?.name_ar ?? "—"}</Chip>
                  <span>›</span>
                  <Chip>{ind?.indicator_id ?? "—"}</Chip>
                  <span>›</span>
                  <Chip>{sc?.title ?? o.target_scenario_id ?? "—"}{sc?.ctx ? ` (${sc.ctx})` : ""}</Chip>
                </div>
                <p className="leading-relaxed">{o.generated_iep_goal_ar}</p>
                {ind?.description_ar && (
                  <p className="text-xs opacity-70 mt-1">المؤشر: {ind.description_ar}</p>
                )}
                <div className="mt-2 text-xs opacity-70 flex gap-3 flex-wrap">
                  <span>محاولات مسجّلة: {(o.evidence_records ?? []).length}</span>
                  <span>≥90% استقلالية: {(o.evidence_records ?? []).filter((r: any) => Number(r.independence_score) >= 0.9).length}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Evidence & Context Verification Logs */}
      <section className="mb-6 break-inside-avoid">
        <SectionTitle ar="سجلات الأدلة والتحقق السياقي" en="Evidence & Context Verification Logs" />
        <div className="grid grid-cols-3 gap-3 text-sm">
          <Stat label="إجمالي المحاولات الموثّقة" value={evidenceStats.trials} />
          <Stat label="محاولات بمعامل استقلالية رقمي (IC) ≥ 90%" value={evidenceStats.highTrials} />
          <Stat label="بيئات سيناريوهات متمايزة (تعميم سياقي)" value={evidenceStats.uniqueScenarios} />
        </div>
      </section>

      {/* Governance audit */}
      <section className="mb-6 break-inside-avoid">
        <SectionTitle ar="سجل التدقيق والحوكمة" en="Governance & Compliance Audit" />
        {findings.length === 0 ? (
          <div className="border border-black/40 rounded p-3 text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> الخطة تستوفي المؤشرات التنبؤية للنجاح / متنبئات النجاح لـ NTACT:C القائمة على الدليل.
          </div>
        ) : (
          <ul className="space-y-2">
            {findings.map((f) => (
              <li key={f.code} className="border-r-4 border-black pr-3 text-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs">[{f.code}]</span>
                  <span className="font-semibold">{f.title_ar}</span>
                  <span className="text-[10px] uppercase border border-black/60 px-1.5 rounded">{f.severity}</span>
                </div>
                <p className="text-xs opacity-80 mt-0.5">{f.detail_ar}</p>
                <p className="text-[10px] opacity-60 font-mono" dir="ltr">↳ {f.predictor_en}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Signatures */}
      <section className="mt-10 break-inside-avoid">
        <div className="grid grid-cols-3 gap-8 text-xs">
          {["المخطط التربوي", "ولي الأمر", "المنسّق الانتقالي"].map((role) => (
            <div key={role} className="border-t border-black pt-2 text-center">
              <p className="font-semibold">{role}</p>
              <p className="opacity-60 mt-6">التوقيع: ____________________</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] opacity-60 text-center mt-6" dir="ltr">
          Generated by Himam Transition Engine · {docId} · {new Date().toISOString().split("T")[0]}
        </p>
      </section>
    </div>
  );
}

function SectionTitle({ ar, en }: { ar: string; en: string }) {
  return (
    <div className="mb-3 border-b border-black/60 pb-1">
      <h2 className="text-base font-bold">{ar}</h2>
      <p className="text-[10px] opacity-60 font-mono" dir="ltr">{en}</p>
    </div>
  );
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/30 rounded p-2">
      <p className="text-[10px] opacity-60">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border-2 border-black/60 rounded p-3 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-70 mt-1">{label}</p>
    </div>
  );
}
function Chip({ children }: { children: React.ReactNode }) {
  return <span className="border border-black/40 px-1.5 py-0.5 rounded bg-black/5">{children}</span>;
}

function buildFindings({ age, objectives, scenarioMap }: { age: number | null; objectives: any[]; scenarioMap?: Map<string, { ctx: string | null }> }) {
  const findings: { code: string; severity: string; title_ar: string; detail_ar: string; predictor_en: string }[] = [];
  const inTransition = age !== null && age >= 16;
  if (!inTransition) return findings;
  const total = objectives.length;
  if (total === 0) {
    findings.push({ code: "ALERT_PRED_00", severity: "critical", title_ar: "لا أهداف فردية مشتقة حوكمياً نشطة", detail_ar: "نافذة الانتقال الحرجة نشطة دون أي هدف فردي مشتق حوكمياً.", predictor_en: "NTACT:C — Governed Objectives coverage" });
    return findings;
  }
  let community = 0, work = 0;
  const destCounts: Record<string, number> = {};
  objectives.forEach((o) => {
    const ctx = (scenarioMap?.get(o.target_scenario_id)?.ctx ?? "").toLowerCase();
    if (/community|workplace|employer|work|civic|home|public|مجتمع|عمل|منزل/.test(ctx)) community += 1;
    if (/work|employer|workplace|عمل/.test(ctx)) work += 1;
    const destId = o.indicators?.age_expectations?.transition_stations?.pathways?.destination_id;
    if (destId) destCounts[destId] = (destCounts[destId] ?? 0) + 1;
  });
  if (community === 0) findings.push({ code: "ALERT_PRED_04", severity: "critical", title_ar: "اعتماد مفرط على البيئات الصفّية والمحاكاة النظرية", detail_ar: `[ALERT_PRED_04]: تم رصد اعتماد مفرط على البيئات الصفية والمحاكاة النظرية داخل نافذة الانتقال الحرجة (+16). الخطة الحالية تفتقر لوسوم البيئة الحقيقية (CBI). الإجراء المطلوب: ربط المهارة فوراً بسيناريو ميداني نشط. (${total} أهداف صفّية)`, predictor_en: "NTACT:C — Community-Based Instruction (CBI) absent" });
  else if (community / total < 0.3) findings.push({ code: "ALERT_PRED_04B", severity: "warning", title_ar: "تغطية مجتمعية محدودة", detail_ar: `${community}/${total} (${Math.round((community / total) * 100)}%) فقط في بيئات مجتمعية حقيقية (CBI). الموصى به حوكمياً 30% فأكثر.`, predictor_en: "NTACT:C — CBI below 30% threshold" });
  if (work === 0) findings.push({ code: "ALERT_PRED_01", severity: "critical", title_ar: "غياب خبرة العمل المأجور", detail_ar: "لا توجد سيناريوهات عمل/توظيف. خبرة العمل المأجور من أقوى متنبئات النجاح لـ NTACT:C.", predictor_en: "NTACT:C Success Predictor — Paid Work Experience missing" });
  if (!destCounts["D1"]) findings.push({ code: "ALERT_PRED_02", severity: "warning", title_ar: "لا أهداف في وجهة الرشد D1 (العمل والإنتاج)", detail_ar: "غياب التعاون بين الوكالات في وجهة الرشد الثابتة للعمل والإنتاج.", predictor_en: "NTACT:C — Interagency Collaboration / D1" });
  if (!destCounts["D3"] && !destCounts["D4"]) findings.push({ code: "ALERT_PRED_03", severity: "warning", title_ar: "غياب السكن المستقل والمشاركة المدنية", detail_ar: "لا تغطية في وجهتَي الرشد الثابتة D3 (السكن المستقل) أو D4 (المشاركة المدنية).", predictor_en: "NTACT:C — Independent Living & Civic" });
  return findings;
}