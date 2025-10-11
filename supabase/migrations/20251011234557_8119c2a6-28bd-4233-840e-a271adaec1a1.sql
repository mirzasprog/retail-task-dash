-- Update task_templates table to include frequency and days of week
ALTER TABLE public.task_templates 
  ADD COLUMN IF NOT EXISTS frequency text NOT NULL DEFAULT 'DAILY',
  ADD COLUMN IF NOT EXISTS dow text[] DEFAULT ARRAY[]::text[];

-- Add check constraint for frequency values
ALTER TABLE public.task_templates
  ADD CONSTRAINT task_templates_frequency_check 
  CHECK (frequency IN ('DAILY', 'WEEKLY', 'CUSTOM'));

-- Add comment for clarity
COMMENT ON COLUMN public.task_templates.frequency IS 'Task recurrence pattern: DAILY, WEEKLY, or CUSTOM';
COMMENT ON COLUMN public.task_templates.dow IS 'Days of week (for WEEKLY/CUSTOM): MON, TUE, WED, THU, FRI, SAT, SUN';

-- Create index for active templates
CREATE INDEX IF NOT EXISTS idx_task_templates_active 
  ON public.task_templates(created_by) 
  WHERE created_by IS NOT NULL;

-- Insert some example templates for different frequencies
INSERT INTO public.task_templates (title, description, category, priority, frequency, dow, requires_image, requires_gps)
VALUES
  ('Morning Opening Checklist', 'Complete store opening procedures', 'operations', 'high', 'DAILY', ARRAY[]::text[], false, false),
  ('Closing Cash Reconciliation', 'Verify and reconcile cash drawer', 'finance', 'high', 'DAILY', ARRAY[]::text[], false, false),
  ('Fresh Produce Quality Check', 'Inspect and rotate fresh produce', 'quality', 'high', 'WEEKLY', ARRAY['TUE', 'WED', 'FRI'], true, false),
  ('Shelf Audit - Aisles 1-5', 'Check pricing and stock levels', 'inventory', 'medium', 'WEEKLY', ARRAY['MON', 'THU'], false, false),
  ('Bakery Temperature Log', 'Record refrigeration temperatures', 'compliance', 'high', 'DAILY', ARRAY[]::text[], false, false),
  ('Weekly Deep Clean', 'Deep cleaning of store areas', 'maintenance', 'medium', 'WEEKLY', ARRAY['SUN'], true, false),
  ('Promotional Display Setup', 'Set up weekly promotional displays', 'marketing', 'medium', 'WEEKLY', ARRAY['MON'], true, false)
ON CONFLICT (id) DO NOTHING;

-- Create function to check if template should run today
CREATE OR REPLACE FUNCTION public.should_create_task_today(
  template_frequency text,
  template_dow text[]
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  current_dow text;
BEGIN
  -- Get current day of week (MON, TUE, etc.)
  current_dow := UPPER(TO_CHAR(CURRENT_DATE, 'DY'));
  
  -- DAILY templates always run
  IF template_frequency = 'DAILY' THEN
    RETURN true;
  END IF;
  
  -- WEEKLY and CUSTOM templates run on specified days
  IF template_frequency IN ('WEEKLY', 'CUSTOM') THEN
    RETURN current_dow = ANY(template_dow);
  END IF;
  
  RETURN false;
END;
$$;
