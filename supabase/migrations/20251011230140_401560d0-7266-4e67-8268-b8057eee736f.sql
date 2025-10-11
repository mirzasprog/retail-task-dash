-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove existing cron jobs if they exist
SELECT cron.unschedule('daily-task-generation') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-task-generation'
);

SELECT cron.unschedule('kpi-aggregation') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'kpi-aggregation'
);

-- Schedule daily task generation (runs every day at 1 AM)
SELECT cron.schedule(
  'daily-task-generation',
  '0 1 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://piwellpwjpkqwroyozkq.supabase.co/functions/v1/daily-task-generator',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpd2VsbHB3anBrcXdyb3lvemtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTM2ODMsImV4cCI6MjA3NTc2OTY4M30.tVR4FarTFbSrehiLFahBURL8FLq6ssZadtWy5simUuU"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Schedule KPI aggregation (runs every day at 2 AM)
SELECT cron.schedule(
  'kpi-aggregation',
  '0 2 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://piwellpwjpkqwroyozkq.supabase.co/functions/v1/kpi-aggregator',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpd2VsbHB3anBrcXdyb3lvemtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTM2ODMsImV4cCI6MjA3NTc2OTY4M30.tVR4FarTFbSrehiLFahBURL8FLq6ssZadtWy5simUuU"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);