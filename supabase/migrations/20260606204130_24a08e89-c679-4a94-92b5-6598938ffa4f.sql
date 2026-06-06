
-- 1) Security definer helpers to avoid recursive RLS on profiles
CREATE OR REPLACE FUNCTION public.check_user_is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uuid AND role = 'admin'::app_role
  ) OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_uuid AND is_org_admin = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_org(user_uuid uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.is_user_org_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_org_admin FROM public.profiles WHERE id = user_uuid), false);
$$;

-- 2) Drop legacy / recursive policies on profiles
DROP POLICY IF EXISTS "Org admins view org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admins to read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "المشرفين يمكنهم القراءة" ON public.profiles;
DROP POLICY IF EXISTS "Users manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles securely" ON public.profiles;

-- 3) Safe, non-recursive policies
CREATE POLICY "Users can manage their own profile"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Org admins can read org profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    public.is_user_org_admin(auth.uid())
    AND organization_id IS NOT NULL
    AND organization_id = public.get_user_org(auth.uid())
  );

CREATE POLICY "Platform admins can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
