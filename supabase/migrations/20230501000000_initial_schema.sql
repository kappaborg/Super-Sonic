-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create auth schema if not exists
CREATE SCHEMA IF NOT EXISTS auth;

-- Create users table if not using Supabase auth
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    encrypted_password TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles table - User profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Voice prints table - User voice authentication data
CREATE TABLE IF NOT EXISTS public.voice_prints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    voice_features NUMERIC[] NOT NULL, -- Changed from FLOAT[] for better precision
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used_at TIMESTAMPTZ,
    confidence_score NUMERIC(5,4), -- Changed from FLOAT for better precision
    UNIQUE(user_id)
);

-- Meetings table - Video/audio meetings
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    meeting_url TEXT,
    meeting_type TEXT NOT NULL DEFAULT 'audio',
    is_private BOOLEAN DEFAULT false,
    max_participants INT DEFAULT 10,
    require_voice_auth BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'scheduled' -- scheduled, active, completed, cancelled
);

-- Meeting participants
CREATE TABLE IF NOT EXISTS public.meeting_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'participant', -- host, participant, moderator
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    voice_auth_status TEXT, -- pending, success, failed
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(meeting_id, user_id)
);

-- Voice authentication attempts
CREATE TABLE IF NOT EXISTS public.voice_auth_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    success BOOLEAN NOT NULL,
    confidence_score FLOAT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organization members
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(organization_id, user_id)
);

-- Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes with better naming convention and INCLUDE clauses for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_include_name 
    ON public.profiles(user_id) 
    INCLUDE (name);

CREATE INDEX IF NOT EXISTS idx_voice_prints_user_id_include_status 
    ON public.voice_prints(user_id) 
    INCLUDE (is_active);

CREATE INDEX IF NOT EXISTS idx_meetings_host_id_include_status 
    ON public.meetings(host_id) 
    INCLUDE (status);

CREATE INDEX IF NOT EXISTS idx_meetings_start_time_include_status 
    ON public.meetings(start_time) 
    INCLUDE (status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_prints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create auto-updating updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        NEW.updated_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.voice_prints
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.meetings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create audit log trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_ip_address TEXT;
    v_user_agent TEXT;
BEGIN
    -- Get current user ID with error handling
    BEGIN
        v_user_id := NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    -- Get request metadata with error handling
    BEGIN
        v_ip_address := current_setting('app.request_ip', TRUE);
        v_user_agent := current_setting('app.user_agent', TRUE);
    EXCEPTION WHEN OTHERS THEN
        v_ip_address := NULL;
        v_user_agent := NULL;
    END;

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
            COALESCE(NEW.id, OLD.id),
            CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) 
                 WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD)
                 ELSE NULL END,
            CASE WHEN TG_OP = 'DELETE' THEN NULL 
                 ELSE to_jsonb(NEW) END,
            jsonb_build_object(
                'timestamp', extract(epoch from now()),
                'ip_address', v_ip_address,
                'user_agent', v_user_agent
            )
        );
    EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail the transaction
        RAISE WARNING 'Failed to create audit log: % - %', SQLERRM, SQLSTATE;
    END;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit log triggers to relevant tables
CREATE TRIGGER audit_profiles
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

CREATE TRIGGER audit_voice_prints
    AFTER INSERT OR UPDATE OR DELETE ON public.voice_prints
    FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

CREATE TRIGGER audit_meetings
    AFTER INSERT OR UPDATE OR DELETE ON public.meetings
    FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

CREATE TRIGGER audit_organizations
    AFTER INSERT OR UPDATE OR DELETE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

-- Comments
COMMENT ON TABLE public.profiles IS 'User profile information';
COMMENT ON TABLE public.voice_prints IS 'Voice authentication data for users';
COMMENT ON TABLE public.meetings IS 'Video/audio meetings information';
COMMENT ON TABLE public.meeting_participants IS 'Meeting participants and their roles';
COMMENT ON TABLE public.voice_auth_attempts IS 'Voice authentication attempt logs';
COMMENT ON TABLE public.organizations IS 'Organizations/teams information';
COMMENT ON TABLE public.organization_members IS 'Organization membership information';
COMMENT ON TABLE public.audit_logs IS 'Audit logs for tracking changes'; 