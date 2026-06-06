
-- Switch governance functions to SECURITY INVOKER (RLS on learners/objectives/evidence still applies)
ALTER FUNCTION public.calculate_learner_drc(BIGINT, VARCHAR) SECURITY INVOKER;
ALTER FUNCTION public.evaluate_gateway_routing(BIGINT) SECURITY INVOKER;

-- Revoke from public/anon, keep authenticated execute
REVOKE ALL ON FUNCTION public.get_evidence_weight(evidence_level) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.calculate_learner_drc(BIGINT, VARCHAR) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.evaluate_gateway_routing(BIGINT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_evidence_weight(evidence_level) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_learner_drc(BIGINT, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.evaluate_gateway_routing(BIGINT) TO authenticated;
