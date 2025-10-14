-- Create table for historical daily sales data
CREATE TABLE IF NOT EXISTS public.daily_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id),
  date DATE NOT NULL,
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  current_year_sales NUMERIC NOT NULL DEFAULT 0,
  previous_year_sales NUMERIC NOT NULL DEFAULT 0,
  current_year_customers INTEGER NOT NULL DEFAULT 0,
  previous_year_customers INTEGER NOT NULL DEFAULT 0,
  sales_growth_percent NUMERIC,
  customer_growth_percent NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, date, hour)
);

-- Enable RLS
ALTER TABLE public.daily_sales ENABLE ROW LEVEL SECURITY;

-- Policies for daily_sales
CREATE POLICY "Store managers can view own store daily sales"
ON public.daily_sales
FOR SELECT
USING (
  store_id = get_user_store_id(auth.uid()) OR
  has_role(auth.uid(), 'regional_supervisor') OR
  has_role(auth.uid(), 'hq_administrator')
);

CREATE POLICY "HQ can manage all daily sales"
ON public.daily_sales
FOR ALL
USING (has_role(auth.uid(), 'hq_administrator'));

CREATE POLICY "Service role can manage daily sales"
ON public.daily_sales
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_daily_sales_store_date ON public.daily_sales(store_id, date DESC);
CREATE INDEX idx_daily_sales_date_hour ON public.daily_sales(date, hour);

-- Add trigger for updated_at
CREATE TRIGGER update_daily_sales_updated_at
BEFORE UPDATE ON public.daily_sales
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create table for Firebird database connection configurations
CREATE TABLE IF NOT EXISTS public.store_database_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) UNIQUE,
  database_type TEXT NOT NULL DEFAULT 'firebird',
  host TEXT NOT NULL,
  port INTEGER DEFAULT 3050,
  database_path TEXT NOT NULL,
  username TEXT DEFAULT 'sysdba',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for store configs
ALTER TABLE public.store_database_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HQ can manage store database configs"
ON public.store_database_configs
FOR ALL
USING (has_role(auth.uid(), 'hq_administrator'));

CREATE POLICY "Service role can read store database configs"
ON public.store_database_configs
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_store_database_configs_updated_at
BEFORE UPDATE ON public.store_database_configs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Function to calculate same day last year (accounting for leap years and weekday matching)
CREATE OR REPLACE FUNCTION public.calculate_previous_year_date(input_date DATE)
RETURNS DATE
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
DECLARE
  result_date DATE;
  input_dow INTEGER;
  result_dow INTEGER;
  day_diff INTEGER;
BEGIN
  -- Start by subtracting 364 days (52 weeks)
  result_date := input_date - INTERVAL '364 days';
  
  -- Handle leap year February 29th
  IF EXTRACT(MONTH FROM input_date) = 2 AND EXTRACT(DAY FROM input_date) = 29 THEN
    IF EXTRACT(YEAR FROM result_date) % 4 = 0 AND 
       (EXTRACT(YEAR FROM result_date) % 100 != 0 OR EXTRACT(YEAR FROM result_date) % 400 = 0) THEN
      result_date := input_date - INTERVAL '1 year';
    ELSE
      result_date := (input_date - INTERVAL '1 year') - INTERVAL '1 day';
    END IF;
  ELSE
    -- Ensure same day of week
    input_dow := EXTRACT(DOW FROM input_date);
    result_dow := EXTRACT(DOW FROM result_date);
    
    IF input_dow != result_dow THEN
      day_diff := input_dow - result_dow;
      result_date := result_date + (day_diff || ' days')::INTERVAL;
    END IF;
  END IF;
  
  RETURN result_date;
END;
$$;