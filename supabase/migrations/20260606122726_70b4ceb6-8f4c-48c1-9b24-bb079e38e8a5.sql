-- Fix 1: Restrict org creation to authenticated users (already restricted, but make it explicit)
DROP POLICY IF EXISTS "Any authenticated can create org" ON public.organizations;
CREATE POLICY "Any authenticated can create org" ON public.organizations FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- Fix 2: Prevent authenticated users from directly executing internal trigger functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated, PUBLIC;

-- Only service_role can manage these internally
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;