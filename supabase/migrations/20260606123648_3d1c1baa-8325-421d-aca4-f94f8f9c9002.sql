
-- New ENUM
DO $$ BEGIN
  CREATE TYPE post_school_track AS ENUM (
    'TRACK_1_COMPETITIVE_EMPLOYMENT',
    'TRACK_2_SUPPORTED_ENTREPRENEURSHIP',
    'TRACK_3_SUPPORTED_LIVING',
    'TRACK_4_CIVIC_HUB_ACCESS',
    'TRACK_5_INCLUSIVE_HIGHER_EDUCATION',
    'TRACK_6_BLENDED_PROFILE_MATRIX'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Update default mastery_logic_rules on indicators
ALTER TABLE public.indicators
  ALTER COLUMN mastery_logic_rules
  SET DEFAULT '{"min_independence_coefficient": 0.90, "required_stable_trials": 3}'::jsonb;

-- Function A: Evidence weight
CREATE OR REPLACE FUNCTION public.get_evidence_weight(v_level evidence_level)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  CASE v_level
    WHEN 'Evidence-Based' THEN RETURN 3.0;
    WHEN 'Research-Based' THEN RETURN 2.0;
    WHEN 'Promising'      THEN RETURN 1.0;
    ELSE RETURN 1.0;
  END CASE;
END;
$$;

-- Function B: Destination Readiness Coefficient
CREATE OR REPLACE FUNCTION public.calculate_learner_drc(p_learner_id BIGINT, p_destination_id VARCHAR(10))
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_numerator NUMERIC := 0;
  v_denominator NUMERIC := 0;
  v_rec RECORD;
  v_g_coefficient NUMERIC := 1.0;
  v_w_weight NUMERIC := 1.0;
  v_latest_score NUMERIC := 0;
BEGIN
  FOR v_rec IN
    SELECT io.objective_id, ind.evidence_tag,
           COUNT(DISTINCT er.evidence_id) AS total_trials,
           COUNT(DISTINCT io.target_scenario_id) AS unique_scenarios,
           AVG(er.independence_score) AS avg_score
    FROM public.individual_objectives io
    JOIN public.indicators ind ON io.indicator_id = ind.indicator_id
    JOIN public.age_expectations ae ON ind.expectation_id = ae.expectation_id
    JOIN public.transition_stations ts ON ae.station_id = ts.station_id
    JOIN public.pathways p ON ts.pathway_id = p.pathway_id
    LEFT JOIN public.evidence_records er ON io.objective_id = er.objective_id
    WHERE io.learner_id = p_learner_id
      AND p.destination_id = p_destination_id
      AND io.is_active = TRUE
    GROUP BY io.objective_id, ind.evidence_tag
  LOOP
    IF v_rec.total_trials IS NULL OR v_rec.total_trials = 0 THEN
      CONTINUE;
    END IF;

    v_latest_score := COALESCE(v_rec.avg_score, 0);
    v_w_weight := public.get_evidence_weight(v_rec.evidence_tag);

    IF v_rec.unique_scenarios > 2 THEN
      v_g_coefficient := 1.2;
    ELSIF v_rec.unique_scenarios = 1 THEN
      v_g_coefficient := 1.0;
    ELSE
      v_g_coefficient := 0.5;
    END IF;

    v_numerator := v_numerator + (v_latest_score * v_w_weight * v_g_coefficient);
    v_denominator := v_denominator + v_w_weight;
  END LOOP;

  IF v_denominator = 0 THEN
    RETURN 0.00;
  END IF;

  RETURN ROUND((v_numerator / v_denominator), 2);
END;
$$;

-- Function C: Gateway routing
CREATE OR REPLACE FUNCTION public.evaluate_gateway_routing(p_learner_id BIGINT)
RETURNS post_school_track
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  drc_d1 NUMERIC := 0;
  drc_d2 NUMERIC := 0;
  drc_d3 NUMERIC := 0;
  drc_d4 NUMERIC := 0;
  drc_d5 NUMERIC := 0;
BEGIN
  drc_d1 := public.calculate_learner_drc(p_learner_id, 'D1');
  drc_d2 := public.calculate_learner_drc(p_learner_id, 'D2');
  drc_d3 := public.calculate_learner_drc(p_learner_id, 'D3');
  drc_d4 := public.calculate_learner_drc(p_learner_id, 'D4');
  drc_d5 := public.calculate_learner_drc(p_learner_id, 'D5');

  IF drc_d5 < 0.50 THEN
    RETURN 'TRACK_6_BLENDED_PROFILE_MATRIX';
  END IF;

  IF drc_d1 >= 0.85 AND drc_d4 >= 0.80 AND drc_d2 >= 0.70 THEN
    RETURN 'TRACK_1_COMPETITIVE_EMPLOYMENT';
  ELSIF drc_d4 >= 0.85 AND drc_d1 >= 0.75 THEN
    RETURN 'TRACK_5_INCLUSIVE_HIGHER_EDUCATION';
  ELSIF drc_d1 >= 0.60 AND drc_d5 >= 0.75 AND drc_d2 < 0.70 THEN
    RETURN 'TRACK_2_SUPPORTED_ENTREPRENEURSHIP';
  ELSIF drc_d2 >= 0.65 AND drc_d4 >= 0.60 THEN
    RETURN 'TRACK_3_SUPPORTED_LIVING';
  ELSIF drc_d3 >= 0.70 AND drc_d5 >= 0.70 THEN
    RETURN 'TRACK_4_CIVIC_HUB_ACCESS';
  ELSE
    RETURN 'TRACK_6_BLENDED_PROFILE_MATRIX';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_evidence_weight(evidence_level) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_learner_drc(BIGINT, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.evaluate_gateway_routing(BIGINT) TO authenticated;
