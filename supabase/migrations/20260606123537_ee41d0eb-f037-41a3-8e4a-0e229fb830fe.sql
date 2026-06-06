
-- Enums
DO $$ BEGIN
  CREATE TYPE evidence_level AS ENUM ('Evidence-Based', 'Research-Based', 'Promising');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE age_band_tier AS ENUM ('0-5', '6-9', '10-12', '13-15', '16-18', '18+');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Layer 1: Destinations
CREATE TABLE public.destinations (
  destination_id VARCHAR(10) PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  engine_function TEXT NOT NULL
);
GRANT SELECT ON public.destinations TO authenticated;
GRANT ALL ON public.destinations TO service_role;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read destinations" ON public.destinations FOR SELECT TO authenticated USING (true);

-- Layer 2: Pathways
CREATE TABLE public.pathways (
  pathway_id VARCHAR(15) PRIMARY KEY,
  destination_id VARCHAR(10) REFERENCES public.destinations(destination_id) ON DELETE RESTRICT,
  title_en VARCHAR(150) NOT NULL,
  title_ar VARCHAR(150) NOT NULL,
  deconstruction_text TEXT NOT NULL
);
GRANT SELECT ON public.pathways TO authenticated;
GRANT ALL ON public.pathways TO service_role;
ALTER TABLE public.pathways ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read pathways" ON public.pathways FOR SELECT TO authenticated USING (true);

-- Layer 3: Transition Stations
CREATE TABLE public.transition_stations (
  station_id VARCHAR(20) PRIMARY KEY,
  pathway_id VARCHAR(15) REFERENCES public.pathways(pathway_id) ON DELETE RESTRICT,
  name_en VARCHAR(150) NOT NULL,
  name_ar VARCHAR(150) NOT NULL,
  functional_description TEXT NOT NULL,
  progression_logic_json JSONB NOT NULL DEFAULT '{}'::jsonb
);
GRANT SELECT ON public.transition_stations TO authenticated;
GRANT ALL ON public.transition_stations TO service_role;
ALTER TABLE public.transition_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read stations" ON public.transition_stations FOR SELECT TO authenticated USING (true);

-- Layer 4: Age Expectations
CREATE TABLE public.age_expectations (
  expectation_id BIGSERIAL PRIMARY KEY,
  station_id VARCHAR(20) REFERENCES public.transition_stations(station_id) ON DELETE CASCADE,
  age_band age_band_tier NOT NULL,
  expected_behavior_ar TEXT NOT NULL,
  expected_behavior_en TEXT NOT NULL,
  CONSTRAINT unique_station_age UNIQUE (station_id, age_band)
);
GRANT SELECT ON public.age_expectations TO authenticated;
GRANT ALL ON public.age_expectations TO service_role;
ALTER TABLE public.age_expectations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read age_expectations" ON public.age_expectations FOR SELECT TO authenticated USING (true);

-- Layer 5: Indicators
CREATE TABLE public.indicators (
  indicator_id VARCHAR(25) PRIMARY KEY,
  expectation_id BIGINT REFERENCES public.age_expectations(expectation_id) ON DELETE CASCADE,
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  evidence_tag evidence_level NOT NULL DEFAULT 'Promising',
  mastery_logic_rules JSONB NOT NULL DEFAULT '{}'::jsonb
);
GRANT SELECT ON public.indicators TO authenticated;
GRANT ALL ON public.indicators TO service_role;
ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read indicators" ON public.indicators FOR SELECT TO authenticated USING (true);

-- Layer 6: Scenarios
CREATE TABLE public.scenarios (
  scenario_id VARCHAR(30) PRIMARY KEY,
  title_ar VARCHAR(100) NOT NULL,
  title_en VARCHAR(100) NOT NULL,
  context_library_type VARCHAR(50) NOT NULL,
  task_analysis_template JSONB NOT NULL DEFAULT '{}'::jsonb
);
GRANT SELECT ON public.scenarios TO authenticated;
GRANT ALL ON public.scenarios TO service_role;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read scenarios" ON public.scenarios FOR SELECT TO authenticated USING (true);

-- Learners
CREATE TABLE public.learners (
  learner_id BIGSERIAL PRIMARY KEY,
  owner_id UUID NOT NULL DEFAULT auth.uid(),
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  date_of_birth DATE NOT NULL,
  current_age_band age_band_tier NOT NULL,
  support_intensity_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learners TO authenticated;
GRANT ALL ON public.learners TO service_role;
ALTER TABLE public.learners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage own learners" ON public.learners FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Individual Objectives
CREATE TABLE public.individual_objectives (
  objective_id BIGSERIAL PRIMARY KEY,
  learner_id BIGINT REFERENCES public.learners(learner_id) ON DELETE CASCADE,
  indicator_id VARCHAR(25) REFERENCES public.indicators(indicator_id) ON DELETE RESTRICT,
  generated_iep_goal_ar TEXT NOT NULL,
  target_scenario_id VARCHAR(30) REFERENCES public.scenarios(scenario_id) ON DELETE RESTRICT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.individual_objectives TO authenticated;
GRANT ALL ON public.individual_objectives TO service_role;
ALTER TABLE public.individual_objectives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage objectives for owned learners" ON public.individual_objectives FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.learners l WHERE l.learner_id = individual_objectives.learner_id AND l.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.learners l WHERE l.learner_id = individual_objectives.learner_id AND l.owner_id = auth.uid()));

-- Evidence Records
CREATE TABLE public.evidence_records (
  evidence_id BIGSERIAL PRIMARY KEY,
  objective_id BIGINT REFERENCES public.individual_objectives(objective_id) ON DELETE CASCADE,
  evaluator_id VARCHAR(50) NOT NULL,
  independence_score NUMERIC(3,2) NOT NULL CHECK (independence_score >= 0.00 AND independence_score <= 1.00),
  task_analysis_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  context_verification_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence_records TO authenticated;
GRANT ALL ON public.evidence_records TO service_role;
ALTER TABLE public.evidence_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage evidence for owned learners" ON public.evidence_records FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.individual_objectives o
    JOIN public.learners l ON l.learner_id = o.learner_id
    WHERE o.objective_id = evidence_records.objective_id AND l.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.individual_objectives o
    JOIN public.learners l ON l.learner_id = o.learner_id
    WHERE o.objective_id = evidence_records.objective_id AND l.owner_id = auth.uid()
  ));

-- ============= Seed Data =============

INSERT INTO public.destinations (destination_id, name_en, name_ar, engine_function) VALUES
('D1', 'Work, Productivity, and Economic Participation', 'العمل، الإنتاجية والتمكين الاقتصادي', 'Aggregates vocational telemetry to guide pathways toward financial contribution or active work roles.'),
('D2', 'Independent Living and Daily Life Management', 'العيش المستقل وإدارة الحياة اليومية', 'Governs autonomy metrics across domestic, financial, and personal safety subsystems.'),
('D3', 'Community Participation, Citizenship, and Belonging', 'المشاركة المجتمعية، المواطنة والانتماء', 'Tracks network development, transit autonomy, and inclusion platform engagement.'),
('D4', 'Self-Determination and Personal Agency', 'تقرير المصير والوكالة الشخصية', 'Functions as the internal control engine, driving choice telemetry and self-advocacy.'),
('D5', 'Quality of Life and Wellbeing', 'جودة الحياة والرفاهية', 'Serves as the system-wide optimization index, ensuring actions align with health and life satisfaction.');

INSERT INTO public.pathways (pathway_id, destination_id, title_en, title_ar, deconstruction_text) VALUES
('P1.1', 'D1', 'Vocational Identity and Preference Mapping', 'الهوية المهنية ورسم الميول', 'Longitudinal evolution from early career curiosity to stable, data-backed choice representation.'),
('P1.2', 'D1', 'Universal Work Habits and Ergonomic Endurance', 'عادات العمل والتحمل الإرغونومي', 'Foundational workplace executive functioning, task pacing, and physical/sensory stamina.'),
('P1.3', 'D1', 'Immersive Work and Supported Employment Channels', 'قنوات العمل الغامر والتوظيف المدعوم', 'Transition via authentic community settings, job rotations, and customized corporate placement.'),
('P1.4', 'D1', 'Family Enterprise, Microenterprise, and Home Production', 'الريادة المصغرة والإنتاج الأسري', 'Incubation models leveraging family assets and cottage industries, critical for regional market alignment.'),
('P2.1', 'D2', 'Domestic Space Mastery and Security', 'إتقان المساحات المنزلية والنظم', 'Independent management of household routines, domestic appliance safety, and living space stability.'),
('P2.2', 'D2', 'Financial Autonomy and Resource Allocation', 'الاستقلال المالي وتخصيص الموارد', 'Telemetry moving from currency recognition to micro-budgeting, digital transactions, and allowance management.'),
('P2.3', 'D2', 'Personal Health Optimization and Self-Regulation', 'تحسين الصحة الشخصية والعافية', 'Healthcare navigation, medication routine adherence, and sensory/physical self-maintenance.'),
('P3.1', 'D3', 'Social Architecture and Peer Circles', 'الهندسة الاجتماعية وزراعة شبكات الأقران', 'Transitioning from structured social skills to reciprocal, organic friendships based on shared affinities.'),
('P3.2', 'D3', 'Civic Agency and Local/Religious Community Integration', 'الوكالة المدنية ومنصات الإدماج', 'Valued involvement in localized volunteer networks, cultural platforms, and religious institutions.'),
('P3.3', 'D3', 'Universal Mobility and Transit Navigation', 'التنقل العالمي وشبكات الوصول البيئي', 'Pedestrian safety, public transportation, ride-sharing literacy, and orientation tools.'),
('P4.1', 'D4', 'Volitional Agency and Long-Term Goal Management', 'الإرادة وهندسة الاختيار والتنظيم', 'Self-led goal tracking, collaborative problem-solving, and adaptive strategy adjustment.'),
('P4.2', 'D4', 'Systemic Self-Advocacy and Accommodations Defense', 'الدفاع النسقي عن الذات وحماية الحقوق', 'Communication of accommodation needs, rights literacy, and leading individual transition planning.'),
('P5.1', 'D5', 'Intrinsic Joy and Sensory Leisure Systems', 'البهجة الجوهرية ونظم الترفيه التكيفية', 'Cultivating personal hobbies and self-directed downtime choices optimized for sensory profiles.'),
('P5.2', 'D5', 'Cultural Belonging and Identity Validation', 'المعنى والاعتزاز بالهوية والانتماء', 'Interlocking the individual''s milestones with heritage pride and spiritual growth.'),
('P5.3', 'D5', 'Collaborative Family Transition and Vision Interlocking', 'الانتقال العائلي وتشابك الرؤى', 'Balancing parental guidance with the individual''s growing independence.');

INSERT INTO public.transition_stations (station_id, pathway_id, name_en, name_ar, functional_description, progression_logic_json) VALUES
('ST_D1_P1_EXP', 'P1.1', 'Exploration and Vocational Interest Mapping', 'الاستكشاف وتحديد الميول المهنية', 'Capability to interact with diverse vocational environments and identify preferences based on image matrices or hands-on exposure.', '{"fade_prompts": true}'),
('ST_D1_P1_PRO', 'P1.1', 'Self-Vocational Profile Representation', 'تمثيل الملف المهني الذاتي', 'Skill to communicate personal vocational strengths and necessary support needs to potential employment settings.', '{"fade_prompts": true}'),
('ST_D1_P2_PAC', 'P1.2', 'Work Pacing and Continuous Productivity', 'إيقاع العمل والإنتاجية المتواصلة', 'Maintaining a steady, non-declining task execution speed over specified time intervals aligned with workplace requirements.', '{"fade_prompts": true}'),
('ST_D1_P2_QA', 'P1.2', 'Self-Verification and Quality Control', 'التحقق الذاتي وضبط الجودة', 'Capability to review, self-correct, and validate the output of an assigned task against an external quality benchmark before submission.', '{"fade_prompts": true}'),
('ST_D1_P3_SUP', 'P1.3', 'Adaptation to Supervision and Criticism', 'التكيف مع الإشراف والتوجيه', 'Responding correctly to supervisor feedback and immediately modifying work behaviors based on professional notes.', '{"fade_prompts": true}'),
('ST_D1_P3_NAT', 'P1.3', 'Integration with Natural Workplace Networks', 'التكامل مع شبكات الدعم الطبيعية', 'Skill to interact with non-disabled co-workers and naturally leverage available workplace supports.', '{"fade_prompts": true}'),
('ST_D1_P4_VAL', 'P1.4', 'Financial Value Estimation and Exchange', 'تقدير القيمة والتبادل المالي', 'Understanding the economic relationship between task effort, output quality, and resultant wages or profit.', '{"fade_prompts": true}'),
('ST_D1_P4_INC', 'P1.4', 'Microenterprise Production Line Management', 'إدارة خط الإنتاج المنزلي/المصغر', 'Executing fabrication, assembly, or packaging steps for a micro-business product independently or with family backing.', '{"fade_prompts": true}'),
('ST_D2_P1_SYS', 'P2.1', 'Domestic and Environmental Subsystems Operation', 'تشغيل النظم المنزلية والبيئية', 'Secure execution of domestic appliance controls, emergency shutoffs, and environmental subsystem routines.', '{"fade_prompts": true}'),
('ST_D2_P1_ROU', 'P2.1', 'Residential Routine Maintenance', 'الحفاظ على روتين المسكن', 'Self-scheduling and executing daily domestic chores including cleaning, organization, and minor safety protocols.', '{"fade_prompts": true}'),
('ST_D2_P2_BUD', 'P2.2', 'Functional Budgeting and Procurement', 'الميزانية الوظيفية والتسوق', 'Procuring life necessities within financial limits, auditing invoices, and managing remaining currency.', '{"freq": "daily"}'),
('ST_D2_P2_DIG', 'P2.2', 'Secure Digital and Banking Transactions', 'التعامل الرقمي والبنكي الآمن', 'Utilizing smart applications or digital payment instruments safely while maintaining personal credential confidentiality.', '{"secure": true}'),
('ST_D2_P3_MED', 'P2.3', 'Health Autonomy and Prevention Routines', 'الاستقلالية والوقاية الصحية', 'Self-adherence to medication schedules, healthcare calendars, and baseline body wellness indicator monitoring.', '{"fade_prompts": true}'),
('ST_D2_P3_REG', 'P2.3', 'Self-Care and Sensory Regulation', 'الرعاية الذاتية والتنظيم الحسي', 'Practicing volitional self-regulation strategies to satisfy somatic and physical needs, mitigating burnout.', '{"fade_prompts": true}'),
('ST_D3_P1_NET', 'P3.1', 'Peer Network Cultivation and Maintenance', 'بناء وإدامة شبكات الصداقة', 'Initiating and sustaining reciprocal peer relationships outside of immediate family and clinical support networks.', '{"fade_prompts": true}'),
('ST_D3_P1_COM', 'P3.1', 'Contextual Social Communication', 'التواصل الاجتماعي السياقي', 'Modulating expressive communication styles based on public environment constraints and active participant profiles.', '{"fade_prompts": true}'),
('ST_D3_P2_ROL', 'P3.2', 'Civic and Cultural Role Fulfillment', 'أداء الأدوار المجتمعية والثقافية', 'Structured participation in volunteer, national, or religious initiatives as an active contributing member.', '{"fade_prompts": true}'),
('ST_D3_P3_NAV', 'P3.3', 'Autonomous Spatial and Environmental Navigation', 'التنقل الذاتي وإدارة الفضاء العام', 'Utilizing pedestrian paths, reading environmental signage, and safely arriving at target geographical landmarks.', '{"fade_prompts": true}'),
('ST_D3_P3_TRN', 'P3.3', 'Smart and Public Transit Navigation', 'استخدام نظم النقل الذكية والعامة', 'Booking and riding public transport or smart e-hailing applications (e.g., Uber/Careem) independently.', '{"fade_prompts": true}'),
('ST_D4_P1_GOA', 'P4.1', 'Volitional Goal Management and Problem Solving', 'إدارة الأهداف الذاتية وحل المشكلات', 'Formulating short-term goals, tracking execution progress, and applying alternative choices under obstacles.', '{"fade_prompts": true}'),
('ST_D4_P2_ADV', 'P4.2', 'Systemic Self-Advocacy and Accommodations Defense', 'الدفاع النسقي وطلب التسهيلات', 'Assertively and acceptably articulating personal needs and legally secured accommodations to facilitators.', '{"fade_prompts": true}'),
('ST_D5_P1_LEI', 'P5.1', 'Volitional Leisure Time Management', 'إدارة وقت الفراغ الاختياري', 'Independently selecting and initiating recreational activities aligned with personal preference during downtime.', '{"fade_prompts": true}'),
('ST_D5_P2_IDN', 'P5.2', 'Identity Documentation and Self-Pride', 'توثيق الهوية والاعتزاز بالذات', 'Behaviors reflecting appreciation of personal heritage, family values, and unique spiritual/personal journeys.', '{"fade_prompts": true}'),
('ST_D5_P3_INT', 'P5.3', 'Interlocked Vision and Family Transition', 'تكامل الرؤية المستقبلية المشتركة', 'Collaboratively balancing parental guidance with the individual''s burgeoning adult autonomy structures.', '{"fade_prompts": true}');
