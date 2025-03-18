-- Security functions
CREATE OR REPLACE FUNCTION public.check_user_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_meta JSONB;
BEGIN
    -- Get user metadata with error handling
    SELECT raw_user_meta_data INTO user_meta
    FROM auth.users
    WHERE id = user_id;

    IF user_meta IS NULL THEN
        RETURN false;
    END IF;

    RETURN user_meta->>'role' = required_role;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error checking user role: % - %', SQLERRM, SQLSTATE;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User authorization function
CREATE OR REPLACE FUNCTION public.authorize_user(user_id UUID, required_permissions TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    permission TEXT;
    user_meta JSONB;
BEGIN
    -- Get user metadata with error handling
    SELECT raw_user_meta_data INTO user_meta
    FROM auth.users
    WHERE id = user_id;

    IF user_meta IS NULL THEN
        RETURN false;
    END IF;

    user_role := user_meta->>'role';
    
    -- Check each required permission
    FOREACH permission IN ARRAY required_permissions
    LOOP
        -- Check permission against role permissions
        IF NOT EXISTS (
            SELECT 1
            FROM public.role_permissions rp
            WHERE rp.role = user_role
            AND permission = ANY(rp.permissions)
        ) THEN
            RETURN false;
        END IF;
    END LOOP;

    RETURN true;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error authorizing user: % - %', SQLERRM, SQLSTATE;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organization authorization function
CREATE OR REPLACE FUNCTION public.authorize_organization_action(
    org_id UUID,
    user_id UUID,
    required_role TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    IF org_id IS NULL OR user_id IS NULL OR required_role IS NULL THEN
        RETURN false;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM public.organization_members
        WHERE organization_id = org_id
        AND user_id = user_id
        AND role = required_role
    );
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error authorizing organization action: % - %', SQLERRM, SQLSTATE;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Meeting authorization function
CREATE OR REPLACE FUNCTION public.authorize_meeting_action(
    meeting_id UUID,
    user_id UUID,
    action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    is_host BOOLEAN;
    is_participant BOOLEAN;
    meeting_record public.meetings%ROWTYPE;
BEGIN
    IF meeting_id IS NULL OR user_id IS NULL OR action IS NULL THEN
        RETURN false;
    END IF;

    -- Get meeting record with error handling
    SELECT * INTO meeting_record
    FROM public.meetings
    WHERE id = meeting_id;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Check host status
    is_host := meeting_record.host_id = user_id;

    -- Check participant status with error handling
    SELECT EXISTS (
        SELECT 1 FROM public.meeting_participants
        WHERE meeting_id = meeting_id
        AND user_id = user_id
    ) INTO is_participant;

    -- Authorization check based on action
    CASE action
        WHEN 'view' THEN
            RETURN is_host OR is_participant OR NOT meeting_record.is_private;
        WHEN 'update' THEN
            RETURN is_host AND meeting_record.status != 'completed';
        WHEN 'delete' THEN
            RETURN is_host AND meeting_record.status = 'scheduled';
        WHEN 'join' THEN
            RETURN is_host OR (
                NOT meeting_record.is_private AND
                meeting_record.status = 'scheduled' AND
                meeting_record.start_time > now()
            );
        ELSE
            RETURN false;
    END CASE;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error authorizing meeting action: % - %', SQLERRM, SQLSTATE;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Voice authentication authorization function
CREATE OR REPLACE FUNCTION public.authorize_voice_auth(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    voice_print_exists BOOLEAN;
    recent_failed_attempts INTEGER;
BEGIN
    IF user_id IS NULL THEN
        RETURN false;
    END IF;

    -- Check if active voice print exists
    SELECT EXISTS (
        SELECT 1 FROM public.voice_prints
        WHERE user_id = user_id
        AND is_active = true
    ) INTO voice_print_exists;

    IF NOT voice_print_exists THEN
        RETURN false;
    END IF;

    -- Check recent failed attempts with error handling
    SELECT COUNT(*)
    INTO recent_failed_attempts
    FROM public.voice_auth_attempts
    WHERE user_id = user_id
    AND success = false
    AND created_at > NOW() - INTERVAL '1 hour';

    -- Allow if less than 5 failed attempts in the last hour
    RETURN recent_failed_attempts < 5;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error authorizing voice authentication: % - %', SQLERRM, SQLSTATE;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security policy application function
CREATE OR REPLACE FUNCTION public.apply_security_policy()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_ip_address TEXT;
    v_user_agent TEXT;
    v_metadata JSONB;
BEGIN
    -- Get current user ID with error handling
    BEGIN
        v_user_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    -- Get request metadata with error handling
    BEGIN
        v_ip_address := current_setting('request.headers', true)::jsonb->>'x-forwarded-for';
        v_user_agent := current_setting('request.headers', true)::jsonb->>'user-agent';
    EXCEPTION WHEN OTHERS THEN
        v_ip_address := NULL;
        v_user_agent := NULL;
    END;

    -- Build metadata
    v_metadata := jsonb_build_object(
        'ip_address', v_ip_address,
        'user_agent', v_user_agent,
        'timestamp', extract(epoch from now())
    );

    -- Insert audit log with error handling
    BEGIN
        INSERT INTO public.audit_logs (
            user_id,
            action,
            entity_type,
            entity_id,
            old_values,
            new_values,
            metadata
        ) VALUES (
            v_user_id,
            TG_OP,
            TG_TABLE_NAME,
            CASE
                WHEN TG_OP = 'DELETE' THEN OLD.id
                ELSE NEW.id
            END,
            CASE
                WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
                WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD)
                ELSE NULL
            END,
            CASE
                WHEN TG_OP = 'DELETE' THEN NULL
                ELSE to_jsonb(NEW)
            END,
            v_metadata
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to create audit log: % - %', SQLERRM, SQLSTATE;
    END;

    -- Return appropriate record
    CASE TG_OP
        WHEN 'DELETE' THEN RETURN OLD;
        ELSE RETURN NEW;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply security policy triggers
CREATE TRIGGER apply_security_policy_profiles
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.apply_security_policy();

CREATE TRIGGER apply_security_policy_voice_prints
    AFTER INSERT OR UPDATE OR DELETE ON public.voice_prints
    FOR EACH ROW EXECUTE FUNCTION public.apply_security_policy();

CREATE TRIGGER apply_security_policy_meetings
    AFTER INSERT OR UPDATE OR DELETE ON public.meetings
    FOR EACH ROW EXECUTE FUNCTION public.apply_security_policy();

CREATE TRIGGER apply_security_policy_organizations
    AFTER INSERT OR UPDATE OR DELETE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.apply_security_policy();

-- Create role permissions table if not exists
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT NOT NULL UNIQUE,
    permissions TEXT[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert or update default roles and permissions
INSERT INTO public.role_permissions (role, permissions) VALUES
    ('admin', ARRAY['all']),
    ('moderator', ARRAY['view', 'create', 'update']),
    ('user', ARRAY['view', 'create']),
    ('guest', ARRAY['view'])
ON CONFLICT (role) DO UPDATE
SET permissions = EXCLUDED.permissions,
    updated_at = now(); 