-- Create storage bucket for task photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-photos',
  'task-photos',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- RLS policies for task photos storage
CREATE POLICY "Users can view task photos from their store"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'task-photos' AND
    (
      -- Extract store_id from path: store_id/task_id/filename
      (storage.foldername(name))[1]::uuid IN (
        SELECT get_user_store_id(auth.uid())
        UNION
        SELECT unnest(ARRAY(SELECT get_user_region_stores(auth.uid())))
      )
      OR has_role(auth.uid(), 'hq_administrator')
    )
  );

CREATE POLICY "Users can upload task photos for their store"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'task-photos' AND
    (storage.foldername(name))[1]::uuid = get_user_store_id(auth.uid())
  );

CREATE POLICY "Users can delete task photos from their store"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'task-photos' AND
    (storage.foldername(name))[1]::uuid = get_user_store_id(auth.uid())
  );

-- Add task scheduling rules table
CREATE TABLE IF NOT EXISTS public.task_scheduling_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  schedule_pattern jsonb NOT NULL, -- { "days": ["TUE", "WED"], "time": "09:00" }
  store_group text, -- null means applies to all stores
  region_id uuid REFERENCES public.regions(id),
  active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_scheduling_rules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "HQ can manage scheduling rules"
  ON public.task_scheduling_rules
  FOR ALL
  USING (has_role(auth.uid(), 'hq_administrator'));

CREATE POLICY "Everyone can view active scheduling rules"
  ON public.task_scheduling_rules
  FOR SELECT
  USING (active = true);

-- Add SLA tracking table
CREATE TABLE IF NOT EXISTS public.task_sla_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  violation_type text NOT NULL, -- 'overdue', 'critical_delayed'
  severity text NOT NULL, -- 'warning', 'critical'
  hours_delayed numeric NOT NULL,
  notified_at timestamp with time zone,
  notified_users uuid[],
  resolved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_sla_violations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view SLA violations for accessible tasks"
  ON public.task_sla_violations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_sla_violations.task_id
      AND (
        t.store_id = get_user_store_id(auth.uid())
        OR has_role(auth.uid(), 'regional_supervisor')
        OR has_role(auth.uid(), 'hq_administrator')
      )
    )
  );

-- Create function to check and create SLA violations
CREATE OR REPLACE FUNCTION public.check_task_sla_violations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  task_record RECORD;
  hours_late numeric;
BEGIN
  -- Check for critical tasks that are overdue
  FOR task_record IN
    SELECT t.*, 
           EXTRACT(EPOCH FROM (now() - (t.due_date + INTERVAL '23 hours 59 minutes')))/3600 as hours_overdue
    FROM tasks t
    WHERE t.status != 'completed'
    AND t.due_date < CURRENT_DATE
    AND t.priority = 'high'
  LOOP
    hours_late := task_record.hours_overdue;
    
    -- Create violation if > 2 hours late and not already recorded
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

-- Create trigger to update task scheduling rules updated_at
CREATE TRIGGER update_task_scheduling_rules_updated_at
  BEFORE UPDATE ON public.task_scheduling_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add index for SLA violation queries
CREATE INDEX idx_task_sla_violations_task_id ON public.task_sla_violations(task_id);
CREATE INDEX idx_task_sla_violations_created_at ON public.task_sla_violations(created_at DESC);
