
-- Ensure authenticated users can create organizations (seed flow)
DROP POLICY IF EXISTS "Any authenticated can create org" ON public.organizations;
CREATE POLICY "Authenticated can create organizations"
ON public.organizations FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to read organizations they just created (or any org while seeding)
DROP POLICY IF EXISTS "Org members can view their org" ON public.organizations;
CREATE POLICY "Authenticated can view organizations"
ON public.organizations FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

-- Learners: ensure authenticated users can insert/select rows they own
DROP POLICY IF EXISTS "Owners manage own learners" ON public.learners;
CREATE POLICY "Owners can insert own learners"
ON public.learners FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can view own learners"
ON public.learners FOR SELECT TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Owners can update own learners"
ON public.learners FOR UPDATE TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete own learners"
ON public.learners FOR DELETE TO authenticated
USING (owner_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learners TO authenticated;
