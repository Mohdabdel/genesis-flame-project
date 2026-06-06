
-- Prevent self-elevation: only existing org admins can change is_org_admin
CREATE OR REPLACE FUNCTION public.prevent_org_admin_self_elevation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_is_admin boolean;
BEGIN
  IF NEW.is_org_admin IS DISTINCT FROM OLD.is_org_admin THEN
    SELECT COALESCE(p.is_org_admin, false) INTO caller_is_admin
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.organization_id = OLD.organization_id;

    IF NOT COALESCE(caller_is_admin, false) THEN
      NEW.is_org_admin := OLD.is_org_admin;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_org_admin_self_elevation ON public.profiles;
CREATE TRIGGER trg_prevent_org_admin_self_elevation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_org_admin_self_elevation();
