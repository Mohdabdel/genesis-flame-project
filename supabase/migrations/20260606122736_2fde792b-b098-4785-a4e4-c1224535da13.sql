REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO service_role;