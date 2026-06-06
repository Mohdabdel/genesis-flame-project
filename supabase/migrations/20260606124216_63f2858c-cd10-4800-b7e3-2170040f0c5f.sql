
REVOKE ALL ON FUNCTION public.prevent_org_admin_self_elevation() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prevent_org_admin_self_elevation() FROM authenticated;
REVOKE ALL ON FUNCTION public.prevent_org_admin_self_elevation() FROM anon;
