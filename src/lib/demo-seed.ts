import { supabase } from "@/integrations/supabase/client";

// Seeds a demo organization, attaches the current user as org admin,
// and inserts 3 virtual learners with realistic IEP objectives and evidence rows.
// Idempotent-ish: skips creating learners if they already exist for this user.

type AgeBand = "0-5" | "6-9" | "10-12" | "13-15" | "16-18" | "18+";

function dobForAge(yearsAgo: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsAgo);
  return d.toISOString().slice(0, 10);
}

function bandFromAge(age: number): AgeBand {
  if (age < 6) return "0-5";
  if (age < 10) return "6-9";
  if (age < 13) return "10-12";
  if (age < 16) return "13-15";
  if (age < 19) return "16-18";
  return "18+";
}

const LEARNERS = [
  {
    first_name: "ليان",
    last_name: "النموذجية",
    age: 14,
    support: { intensity: "moderate", domains: { communication: 2, daily_living: 2, behavior: 1 } },
    objectives: [
      {
        indicator_id: "IND_ST_D2_P1_ROU_13-15",
        scenario_id: "SC_INDEPENDENT_APT",
        goal: "تُتقن ليان روتين الصباح المنزلي عبر 5 خطوات متتالية باستقلالية رقمية ≥ 90% في 3 جلسات متتابعة.",
        evidence: [0.55, 0.62, 0.7, 0.78],
      },
      {
        indicator_id: "IND_ST_D5_P1_LEI_13-15",
        scenario_id: "SC_COMMUNITY_NAV",
        goal: "تختار ليان نشاطاً ترفيهياً مفضّلاً وتوثّق ممارسته 3 مرات أسبوعياً لمدة شهر.",
        evidence: [0.6, 0.72, 0.82],
      },
    ],
  },
  {
    first_name: "محمد",
    last_name: "النموذجي",
    age: 17,
    support: { intensity: "high", domains: { communication: 3, vocational: 3, behavior: 2 } },
    objectives: [
      {
        indicator_id: "IND_ST_D1_P2_PAC_16-18",
        scenario_id: "SC_CAFE_IMMERSIVE",
        goal: "يحافظ محمد على إيقاع إنتاجي متواصل لمدة 60 دقيقة في مقهى التدريب الغامر مع IC ≥ 90% في 3 ورديات متتالية.",
        evidence: [0.45, 0.52, 0.58, 0.65, 0.71],
      },
      {
        indicator_id: "IND_ST_D2_P2_BUD_16-18",
        scenario_id: "SC_INDEPENDENT_APT",
        goal: "يخطّط محمد ميزانية أسبوعية وظيفية لمشتريات الشقة في ضوء سقف مالي محدد.",
        evidence: [0.4, 0.5, 0.55],
      },
      {
        indicator_id: "IND_ST_D3_P3_TRN_16-18",
        scenario_id: "SC_COMMUNITY_NAV",
        goal: "يكمل محمد رحلة عامة كاملة (ذهاب + إياب) باستخدام تطبيقات النقل الذكية في 4 رحلات متتالية.",
        evidence: [0.5, 0.6, 0.68, 0.75],
      },
    ],
  },
  {
    first_name: "نورة",
    last_name: "النموذجية",
    age: 19,
    support: { intensity: "low", domains: { communication: 1, vocational: 1, daily_living: 1 } },
    objectives: [
      {
        indicator_id: "IND_ST_D1_P2_QA_18PLUS",
        scenario_id: "SC_RETAIL_DIGITAL",
        goal: "تطبّق نورة قائمة تحقق الجودة الذاتية قبل تسليم 5 طلبات متتالية في بيئة البيع الرقمية.",
        evidence: [0.78, 0.85, 0.92, 0.95, 0.93],
      },
      {
        indicator_id: "IND_ST_D2_P2_DIG_18PLUS",
        scenario_id: "SC_INDEPENDENT_APT",
        goal: "تنفّذ نورة تحويلاً بنكياً رقمياً آمناً عبر التطبيق دون مساعدة في 3 معاملات.",
        evidence: [0.82, 0.9, 0.94],
      },
      {
        indicator_id: "IND_ST_D3_P3_NAV_18PLUS",
        scenario_id: "SC_COMMUNITY_NAV",
        goal: "تصل نورة إلى وجهة جديدة وتحلّ انحرافاً واحداً في المسار باستقلالية تامة.",
        evidence: [0.85, 0.92, 0.95],
      },
    ],
  },
] as const;

export async function seedDemoInstitution() {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) throw new Error("يجب تسجيل الدخول أولاً");
  const userId = userData.user.id;

  // 1) ensure organization
  const slug = `himam-demo-${userId.slice(0, 8)}`;
  let orgId: string | null = null;
  const { data: existing } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing?.id) {
    orgId = existing.id;
  } else {
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .insert({
        name: "مؤسسة همم النموذجية",
        slug,
        description: "مؤسسة تجريبية لعرض محرك الانتقال للحياة المستقلة والوكالة المهنية.",
        industry: "transition_education",
        size: "demo",
      })
      .select("id")
      .single();
    if (orgErr) throw orgErr;
    orgId = org.id;
  }

  // 2) attach user profile to org as admin
  const { error: profErr } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      organization_id: orgId,
      is_org_admin: true,
      full_name: userData.user.email?.split("@")[0] ?? "مستخدم تجريبي",
      job_title: "منسّق الانتقال",
    });
  if (profErr) throw profErr;

  // 3) seed learners + objectives + evidence
  for (const L of LEARNERS) {
    const fullName = `${L.first_name} ${L.last_name}`;
    const { data: existingLearner } = await supabase
      .from("learners")
      .select("learner_id")
      .eq("owner_id", userId)
      .eq("first_name", L.first_name)
      .eq("last_name", L.last_name)
      .maybeSingle();
    let learnerId = existingLearner?.learner_id ?? null;
    if (!learnerId) {
      const { data: ln, error: lnErr } = await supabase
        .from("learners")
        .insert({
          first_name: L.first_name,
          last_name: L.last_name,
          date_of_birth: dobForAge(L.age),
          current_age_band: bandFromAge(L.age) as any,
          support_intensity_profile: L.support as any,
        })
        .select("learner_id")
        .single();
      if (lnErr) throw new Error(`${fullName}: ${lnErr.message}`);
      learnerId = ln.learner_id;
    }

    for (const obj of L.objectives) {
      const { data: existingObj } = await supabase
        .from("individual_objectives")
        .select("objective_id")
        .eq("learner_id", learnerId)
        .eq("indicator_id", obj.indicator_id)
        .maybeSingle();
      let objectiveId = existingObj?.objective_id ?? null;
      if (!objectiveId) {
        const { data: o, error: oErr } = await supabase
          .from("individual_objectives")
          .insert({
            learner_id: learnerId,
            indicator_id: obj.indicator_id,
            target_scenario_id: obj.scenario_id,
            generated_iep_goal_ar: obj.goal,
            is_active: true,
          })
          .select("objective_id")
          .single();
        if (oErr) throw new Error(`${fullName}/${obj.indicator_id}: ${oErr.message}`);
        objectiveId = o.objective_id;

        // seed evidence (back-date timestamps)
        const rows = obj.evidence.map((score, i) => ({
          objective_id: objectiveId!,
          evaluator_id: userId,
          independence_score: score,
          task_analysis_payload: { completed: 7, total: 7 } as any,
          context_verification_metadata: {
            scenario_id: obj.scenario_id,
            recorded_at: new Date(Date.now() - (obj.evidence.length - i) * 86400_000 * 3).toISOString(),
          } as any,
        }));
        const { error: evErr } = await supabase.from("evidence_records").insert(rows);
        if (evErr) throw new Error(`evidence ${fullName}: ${evErr.message}`);
      }
    }
  }

  return { orgId, learners: LEARNERS.length };
}