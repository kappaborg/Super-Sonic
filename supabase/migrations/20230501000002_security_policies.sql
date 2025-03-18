-- Enable auth extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "supabase_auth";

-- Profiles table policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Voice prints table policies with additional checks
CREATE POLICY "Users can view their own voice prints"
    ON public.voice_prints FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice prints"
    ON public.voice_prints FOR UPDATE
    USING (auth.uid() = user_id AND is_active = true)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice prints"
    ON public.voice_prints FOR INSERT
    WITH CHECK (auth.uid() = user_id AND NOT EXISTS (
        SELECT 1 FROM public.voice_prints
        WHERE user_id = auth.uid() AND is_active = true
    ));

-- Meetings table policies with additional checks
CREATE POLICY "Users can view meetings they are part of"
    ON public.meetings FOR SELECT
    USING (
        auth.uid() = host_id OR
        EXISTS (
            SELECT 1 FROM public.meeting_participants
            WHERE meeting_id = id AND user_id = auth.uid()
        ) OR
        (NOT is_private AND status = 'scheduled')
    );

CREATE POLICY "Users can create meetings"
    ON public.meetings FOR INSERT
    WITH CHECK (
        auth.uid() = host_id AND
        start_time > now() AND
        end_time > start_time
    );

CREATE POLICY "Hosts can update their meetings"
    ON public.meetings FOR UPDATE
    USING (auth.uid() = host_id AND status != 'completed')
    WITH CHECK (start_time > now() AND end_time > start_time);

CREATE POLICY "Hosts can delete their meetings"
    ON public.meetings FOR DELETE
    USING (auth.uid() = host_id AND status = 'scheduled');

-- Meeting participants table policies with additional checks
CREATE POLICY "Users can view meeting participants"
    ON public.meeting_participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.meetings m
            WHERE m.id = meeting_id AND (
                m.host_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.meeting_participants mp
                    WHERE mp.meeting_id = m.id AND mp.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can join meetings"
    ON public.meeting_participants FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.meetings m
            WHERE m.id = meeting_id AND (
                m.host_id = auth.uid() OR
                (NOT m.is_private AND m.status = 'scheduled' AND m.start_time > now())
            )
        ) AND
        NOT EXISTS (
            SELECT 1 FROM public.meeting_participants
            WHERE meeting_id = NEW.meeting_id AND user_id = NEW.user_id
        )
    );

CREATE POLICY "Users can update their own participation"
    ON public.meeting_participants FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Voice auth attempts table policies with rate limiting
CREATE POLICY "Users can view their own auth attempts"
    ON public.voice_auth_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert auth attempts"
    ON public.voice_auth_attempts FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        (
            SELECT COUNT(*) FROM public.voice_auth_attempts
            WHERE user_id = NEW.user_id
            AND success = false
            AND created_at > now() - interval '1 hour'
        ) < 5
    );

-- Organizations table policies with additional checks
CREATE POLICY "Users can view organizations they are members of"
    ON public.organizations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Organization admins can update"
    ON public.organizations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = id 
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = id 
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Organization owners can delete"
    ON public.organizations FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = id 
            AND user_id = auth.uid()
            AND role = 'owner'
        )
    );

-- Organization members table policies with granular permissions
CREATE POLICY "Users can view organization members"
    ON public.organization_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = organization_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Organization admins can insert members"
    ON public.organization_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = NEW.organization_id 
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        ) AND
        NEW.role != 'owner'
    );

CREATE POLICY "Organization admins can update members"
    ON public.organization_members FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = OLD.organization_id 
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        ) AND
        OLD.role != 'owner'
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = NEW.organization_id 
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        ) AND
        NEW.role != 'owner'
    );

CREATE POLICY "Organization admins can delete members"
    ON public.organization_members FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = organization_id 
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        ) AND
        OLD.role != 'owner'
    );

-- Audit logs table policies with restricted access
CREATE POLICY "Users can view their own audit logs"
    ON public.audit_logs FOR SELECT
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
            AND om.organization_id = (
                CASE 
                    WHEN entity_type = 'organizations' THEN entity_id::uuid
                    ELSE NULL
                END
            )
        )
    );

CREATE POLICY "System can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL OR
        current_setting('app.is_system', true)::boolean = true
    );

-- Grant minimal required permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.voice_prints TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.meetings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.meeting_participants TO authenticated;
GRANT INSERT ON public.voice_auth_attempts TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.organization_members TO authenticated;

-- Grant minimal permissions to anon users
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.organizations TO anon;
GRANT SELECT ON public.meetings TO anon
WHERE NOT is_private AND status = 'scheduled';

-- Helper functions with better error handling
CREATE OR REPLACE FUNCTION public.is_organization_member(org_id UUID, user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    IF org_id IS NULL OR user_id IS NULL THEN
        RETURN false;
    END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = org_id AND user_id = user_id
    );
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_organization_admin(org_id UUID, user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    IF org_id IS NULL OR user_id IS NULL THEN
        RETURN false;
    END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = org_id 
        AND user_id = user_id
        AND role IN ('owner', 'admin')
    );
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 