-- ============================================================================
-- FIX CUSTOM ACCESS TOKEN HOOK
-- ============================================================================
-- The hook needs SECURITY DEFINER and proper error handling

-- Drop and recreate the hook function with proper permissions
DROP FUNCTION IF EXISTS public.custom_access_token_hook(jsonb);

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- Initialize claims from event
  claims := event->'claims';

  -- Safely fetch the user role from the users table
  BEGIN
    SELECT role INTO user_role
    FROM public.users
    WHERE id = (event->>'user_id')::uuid;
  EXCEPTION
    WHEN OTHERS THEN
      -- If there's any error, default to student role
      user_role := 'student';
  END;

  -- Set the role claim
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
  ELSE
    claims := jsonb_set(claims, '{role}', '"student"');
  END IF;

  -- Update the event with new claims
  event := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$$;

-- Grant proper permissions
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- Grant the function permission to read from users table
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT SELECT ON public.users TO supabase_auth_admin;

-- Verify the function exists
SELECT
  'Function verification:' as check_type,
  proname as function_name,
  prosecdef as is_security_definer,
  'Function recreated successfully' as status
FROM pg_proc
WHERE proname = 'custom_access_token_hook';
