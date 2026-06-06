
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.check_user_is_admin(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_org(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_user_org_admin(uuid) TO authenticated, anon;
