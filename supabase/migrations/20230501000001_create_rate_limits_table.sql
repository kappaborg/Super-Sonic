-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rate limits table - For API request rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier TEXT NOT NULL, -- User ID or IP address
    timestamp BIGINT NOT NULL, -- Unix timestamp (seconds)
    expire_at BIGINT NOT NULL, -- Expiration date for cleanup (Unix timestamp)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    path TEXT, -- API endpoint path (optional)
    method TEXT, -- HTTP method (optional)
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata (e.g., user agent, headers)
    CONSTRAINT rate_limits_identifier_check CHECK (identifier IS NOT NULL)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_path 
ON rate_limits (identifier, path);

CREATE INDEX IF NOT EXISTS idx_rate_limits_timestamp_expire 
ON rate_limits (timestamp, expire_at);

CREATE INDEX IF NOT EXISTS idx_rate_limits_expire_at 
ON rate_limits (expire_at);

-- Enable Row Level Security (RLS)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "service_role_manage_rate_limits"
ON rate_limits
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_view_own_rate_limits"
ON rate_limits
FOR SELECT
TO authenticated
USING (identifier = auth.uid()::text);

-- Grant minimal required permissions
GRANT SELECT ON rate_limits TO authenticated;
GRANT INSERT, DELETE ON rate_limits TO authenticated;
GRANT INSERT ON rate_limits TO anon;

-- Add table comments
COMMENT ON TABLE rate_limits IS 'Stores rate limiting records for API requests';
COMMENT ON COLUMN rate_limits.identifier IS 'User ID or IP address for rate limiting';
COMMENT ON COLUMN rate_limits.timestamp IS 'Unix timestamp when the request was made';
COMMENT ON COLUMN rate_limits.expire_at IS 'Unix timestamp when this record should be cleaned up';
COMMENT ON COLUMN rate_limits.path IS 'API endpoint path for path-specific rate limiting';
COMMENT ON COLUMN rate_limits.method IS 'HTTP method for method-specific rate limiting';
COMMENT ON COLUMN rate_limits.metadata IS 'Additional request metadata for analysis';

/*
Note: The following commands should be executed manually in the Supabase SQL Editor
or automated using the Supabase hook system:

1. Enable pg_cron extension (requires superuser):
CREATE EXTENSION IF NOT EXISTS pg_cron;

2. Create a scheduled job to clean up expired records:
SELECT cron.schedule(
    'cleanup-rate-limits',
    '0 * * * *', -- Run every hour
    $$
    WITH deleted AS (
        DELETE FROM public.rate_limits
        WHERE expire_at < EXTRACT(EPOCH FROM NOW())
        RETURNING *
    )
    SELECT count(*) FROM deleted;
    $$
);

3. Monitor the cleanup job:
SELECT * FROM cron.job WHERE jobname = 'cleanup-rate-limits';
*/

-- Create function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier TEXT,
    p_path TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 100,
    p_window INTEGER DEFAULT 3600 -- 1 hour in seconds
) RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
    v_now BIGINT;
BEGIN
    -- Get current timestamp
    v_now := EXTRACT(EPOCH FROM NOW())::BIGINT;
    
    -- Count requests within window
    SELECT COUNT(*)
    INTO v_count
    FROM rate_limits
    WHERE identifier = p_identifier
    AND (p_path IS NULL OR path = p_path)
    AND timestamp > v_now - p_window;
    
    -- Return true if under limit
    RETURN v_count < p_limit;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't block request
    RAISE WARNING 'Error checking rate limit: % - %', SQLERRM, SQLSTATE;
    RETURN true;
END;
$$; 