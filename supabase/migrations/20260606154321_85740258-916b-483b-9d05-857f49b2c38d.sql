
WITH ae AS (
  INSERT INTO public.age_expectations (station_id, age_band, expected_behavior_ar, expected_behavior_en) VALUES
  ('ST_D1_P1_EXP', '13-15'::age_band_tier, 'يستكشف ثلاثة مجالات مهنية بدعم موجَّه', 'Explores three vocational domains with guided support'),
  ('ST_D1_P3_SUP', '16-18'::age_band_tier, 'يتكيّف مع تعليمات المشرف داخل بيئة عمل حقيقية', 'Responds to supervisor directives in real workplace'),
  ('ST_D1_P2_PAC', '16-18'::age_band_tier, 'يحافظ على إيقاع إنتاجي متواصل لمدة ساعة', 'Sustains productive pace for one hour'),
  ('ST_D1_P2_QA',  '18+'::age_band_tier,   'يطبّق فحص جودة ذاتي قبل تسليم المنتج', 'Performs self quality-check before delivery'),
  ('ST_D2_P1_ROU', '13-15'::age_band_tier, 'يلتزم بروتين منزلي يومي بإشراف مرئي', 'Follows daily home routine with visual prompts'),
  ('ST_D2_P2_BUD', '16-18'::age_band_tier, 'يخطّط ميزانية أسبوعية وظيفية بسيطة', 'Plans simple weekly functional budget'),
  ('ST_D2_P2_DIG', '18+'::age_band_tier,   'يجري معاملات بنكية رقمية آمنة باستقلالية', 'Performs safe digital banking independently'),
  ('ST_D3_P3_TRN', '16-18'::age_band_tier, 'يستخدم تطبيقات النقل العامة لرحلة كاملة', 'Uses public transit apps for a complete trip'),
  ('ST_D3_P3_NAV', '18+'::age_band_tier,   'يتنقّل في فضاءات جديدة ويحلّ مشكلات المسار', 'Navigates new spaces and solves route problems'),
  ('ST_D5_P1_LEI', '13-15'::age_band_tier, 'يختار نشاطاً ترفيهياً مفضّلاً ويلتزم به', 'Selects and maintains a preferred leisure activity')
  RETURNING expectation_id, station_id, age_band
)
INSERT INTO public.indicators (indicator_id, expectation_id, description_ar, description_en, evidence_tag, mastery_logic_rules)
SELECT
  'IND_' || ae.station_id || '_' || replace(ae.age_band::text,'+','PLUS'),
  ae.expectation_id,
  CASE ae.station_id
    WHEN 'ST_D1_P1_EXP' THEN 'يحدّد ميوله المهنية عبر ثلاث محاولات استكشافية موجَّهة'
    WHEN 'ST_D1_P3_SUP' THEN 'ينفّذ تعليمات المشرف الميداني في 4 سيناريوهات متتالية بنسبة استقلالية ≥ 90%'
    WHEN 'ST_D1_P2_PAC' THEN 'يحافظ على إنتاجية ثابتة في وردية ميدانية مدتها 60 دقيقة'
    WHEN 'ST_D1_P2_QA'  THEN 'يطبّق قائمة تحقق الجودة الذاتية قبل تسليم 5 طلبات متتالية'
    WHEN 'ST_D2_P1_ROU' THEN 'يكمل روتين الصباح المنزلي (5 خطوات) باستقلالية رقمية ≥ 90%'
    WHEN 'ST_D2_P2_BUD' THEN 'يخطّط ميزانية أسبوعية للمشتريات في ضوء سقف مالي محدد'
    WHEN 'ST_D2_P2_DIG' THEN 'ينفّذ تحويلاً بنكياً رقمياً آمناً عبر التطبيق دون مساعدة'
    WHEN 'ST_D3_P3_TRN' THEN 'يكمل رحلة عامة كاملة (ذهاب + إياب) باستخدام تطبيقات النقل الذكية'
    WHEN 'ST_D3_P3_NAV' THEN 'يصل إلى وجهة جديدة ويحلّ انحرافاً واحداً في المسار باستقلالية'
    WHEN 'ST_D5_P1_LEI' THEN 'يختار نشاطاً ترفيهياً ويوثّق ممارسته 3 مرات في الأسبوع'
  END,
  'Indicator (auto-seeded)',
  'Evidence-Based'::evidence_level,
  '{"required_stable_trials":3,"min_independence_coefficient":0.90}'::jsonb
FROM ae
ON CONFLICT (indicator_id) DO NOTHING;
