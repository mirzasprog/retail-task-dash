-- Create SyncLog table for tracking external API integrations
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  method text NOT NULL,
  status integer NOT NULL,
  latency_ms integer NOT NULL,
  payload_hash text,
  request_id text UNIQUE,
  error_message text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "HQ can view all sync logs"
  ON public.sync_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'hq_administrator'));

CREATE POLICY "System can insert sync logs"
  ON public.sync_logs
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster reporting by created_at
CREATE INDEX idx_sync_logs_created_at ON public.sync_logs(created_at DESC);

-- Create index for request_id lookups (idempotency)
CREATE INDEX idx_sync_logs_request_id ON public.sync_logs(request_id);

-- Create index for endpoint filtering
CREATE INDEX idx_sync_logs_endpoint ON public.sync_logs(endpoint);

-- Create idempotency cache table
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text UNIQUE NOT NULL,
  endpoint text NOT NULL,
  request_hash text NOT NULL,
  response_status integer NOT NULL,
  response_body jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL
);

-- Enable RLS
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Create policy for system access
CREATE POLICY "System can manage idempotency keys"
  ON public.idempotency_keys
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for idempotency key lookups
CREATE INDEX idx_idempotency_keys_key ON public.idempotency_keys(idempotency_key);

-- Create index for expiration cleanup
CREATE INDEX idx_idempotency_keys_expires_at ON public.idempotency_keys(expires_at);

-- Create function to clean up expired idempotency keys
CREATE OR REPLACE FUNCTION public.cleanup_expired_idempotency_keys()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.idempotency_keys
  WHERE expires_at < now();
END;
$$;
