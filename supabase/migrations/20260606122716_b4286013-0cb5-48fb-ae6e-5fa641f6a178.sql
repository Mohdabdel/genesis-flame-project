-- Organizations
CREATE POLICY "Org members can view their org" ON public.organizations FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.profiles WHERE profiles.organization_id = organizations.id AND profiles.id = auth.uid()
    )
);

CREATE POLICY "Org admins can update their org" ON public.organizations FOR UPDATE TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.profiles WHERE profiles.organization_id = organizations.id AND profiles.id = auth.uid() AND profiles.is_org_admin = TRUE
    )
);

CREATE POLICY "Any authenticated can create org" ON public.organizations FOR INSERT TO authenticated WITH CHECK (TRUE);

-- Profiles
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Org admins view org profiles" ON public.profiles FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.organization_id = profiles.organization_id AND p.is_org_admin = TRUE
    )
);

-- User roles
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin')
) WITH CHECK (
    public.has_role(auth.uid(), 'admin')
);

-- Assessments
CREATE POLICY "Org members can manage assessments" ON public.assessments FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.profiles WHERE profiles.organization_id = assessments.organization_id AND profiles.id = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles WHERE profiles.organization_id = assessments.organization_id AND profiles.id = auth.uid()
    )
);

-- Assessment questions
CREATE POLICY "Org members can manage assessment questions" ON public.assessment_questions FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.assessments
        JOIN public.profiles ON profiles.organization_id = assessments.organization_id
        WHERE assessments.id = assessment_questions.assessment_id AND profiles.id = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.assessments
        JOIN public.profiles ON profiles.organization_id = assessments.organization_id
        WHERE assessments.id = assessment_questions.assessment_id AND profiles.id = auth.uid()
    )
);

-- Assessment responses
CREATE POLICY "Users manage own responses" ON public.assessment_responses FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Org members view responses" ON public.assessment_responses FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.assessments
        JOIN public.profiles ON profiles.organization_id = assessments.organization_id
        WHERE assessments.id = assessment_responses.assessment_id AND profiles.id = auth.uid()
    )
);

-- Projects
CREATE POLICY "Org members manage projects" ON public.projects FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.profiles WHERE profiles.organization_id = projects.organization_id AND profiles.id = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles WHERE profiles.organization_id = projects.organization_id AND profiles.id = auth.uid()
    )
);

-- Project tasks
CREATE POLICY "Org members manage tasks" ON public.project_tasks FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.projects
        JOIN public.profiles ON profiles.organization_id = projects.organization_id
        WHERE projects.id = project_tasks.project_id AND profiles.id = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projects
        JOIN public.profiles ON profiles.organization_id = projects.organization_id
        WHERE projects.id = project_tasks.project_id AND profiles.id = auth.uid()
    )
);

-- Training modules
CREATE POLICY "Published modules viewable by authenticated" ON public.training_modules FOR SELECT TO authenticated USING (is_published = TRUE);
CREATE POLICY "Admins manage training modules" ON public.training_modules FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin')
) WITH CHECK (
    public.has_role(auth.uid(), 'admin')
);

-- Training progress
CREATE POLICY "Users manage own training progress" ON public.training_progress FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Invitations
CREATE POLICY "Org admins manage invitations" ON public.invitations FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.profiles WHERE profiles.organization_id = invitations.organization_id AND profiles.id = auth.uid() AND profiles.is_org_admin = TRUE
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles WHERE profiles.organization_id = invitations.organization_id AND profiles.id = auth.uid() AND profiles.is_org_admin = TRUE
    )
);

-- Fix: revoke public execute on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, PUBLIC;

GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated, service_role;