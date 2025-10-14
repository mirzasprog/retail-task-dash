-- Fix critical RLS policies for sync_logs and idempotency_keys
-- These tables should only be accessible by the system via service role, not by public users

-- Drop existing permissive policies
DROP POLICY IF EXISTS "System can insert sync logs" ON public.sync_logs;
DROP POLICY IF EXISTS "System can manage idempotency keys" ON public.idempotency_keys;

-- sync_logs: Only service role can insert, only HQ admins can view
CREATE POLICY "Service role can insert sync logs"
ON public.sync_logs
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "HQ can view sync logs"
ON public.sync_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'hq_administrator'::app_role));

-- idempotency_keys: Only service role can manage
CREATE POLICY "Service role can manage idempotency keys"
ON public.idempotency_keys
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add missing policies for notifications (system needs to create them)
CREATE POLICY "Service role can create notifications"
ON public.notifications
FOR INSERT
TO service_role
WITH CHECK (true);

-- Add missing policies for task_sla_violations (system needs to manage them)
CREATE POLICY "Service role can manage SLA violations"
ON public.task_sla_violations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add missing policy for profiles creation (handled by trigger)
CREATE POLICY "Service role can create profiles"
ON public.profiles
FOR INSERT
TO service_role
WITH CHECK (true);

-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_store_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT store_id FROM public.profiles WHERE id = _user_id
$$;

CREATE OR REPLACE FUNCTION public.get_user_region_stores(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT s.id
  FROM public.stores s
  JOIN public.profiles p ON p.id = _user_id
  WHERE s.region_id = (SELECT region_id FROM public.stores WHERE id = p.store_id)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_idempotency_keys()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.idempotency_keys
  WHERE expires_at < now();
END;
$$;

CREATE OR REPLACE FUNCTION public.check_task_sla_violations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  task_record RECORD;
  hours_late numeric;
BEGIN
  FOR task_record IN
    SELECT t.*, 
           EXTRACT(EPOCH FROM (now() - (t.due_date + INTERVAL '23 hours 59 minutes')))/3600 as hours_overdue
    FROM tasks t
    WHERE t.status != 'completed'
    AND t.due_date < CURRENT_DATE
    AND t.priority = 'high'
  LOOP
    hours_late := task_record.hours_overdue;
    
    IF hours_late > 2 AND NOT EXISTS (
      SELECT 1 FROM task_sla_violations
      WHERE task_id = task_record.id
      AND resolved_at IS NULL
    ) THEN
      INSERT INTO task_sla_violations (
        task_id,
        violation_type,
        severity,
        hours_delayed
      ) VALUES (
        task_record.id,
        'critical_delayed',
        CASE WHEN hours_late > 24 THEN 'critical' ELSE 'warning' END,
        hours_late
      );
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.should_create_task_today(template_frequency text, template_dow text[])
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
DECLARE
  current_dow text;
BEGIN
  current_dow := UPPER(TO_CHAR(CURRENT_DATE, 'DY'));
  
  IF template_frequency = 'DAILY' THEN
    RETURN true;
  END IF;
  
  IF template_frequency IN ('WEEKLY', 'CUSTOM') THEN
    RETURN current_dow = ANY(template_dow);
  END IF;
  
  RETURN false;
END;
$$;