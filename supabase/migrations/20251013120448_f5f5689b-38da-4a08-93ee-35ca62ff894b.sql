-- Create product categories table
CREATE TABLE public.product_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories
CREATE POLICY "Everyone can view product categories"
ON public.product_categories
FOR SELECT
USING (true);

-- Only HQ can manage categories
CREATE POLICY "HQ can manage product categories"
ON public.product_categories
FOR ALL
USING (has_role(auth.uid(), 'hq_administrator'::app_role));

-- Insert standard retail categories
INSERT INTO public.product_categories (name, code) VALUES
  ('Fruits and Vegetables', 'FRUITS_VEG'),
  ('Meat and Fish', 'MEAT_FISH'),
  ('Dairy Products', 'DAIRY'),
  ('Bakery', 'BAKERY'),
  ('Beverages', 'BEVERAGES'),
  ('Snacks and Sweets', 'SNACKS_SWEETS'),
  ('Frozen Foods', 'FROZEN'),
  ('Canned Goods', 'CANNED'),
  ('Household Items', 'HOUSEHOLD'),
  ('Personal Care', 'PERSONAL_CARE'),
  ('Other', 'OTHER');

-- Create daily category sales table
CREATE TABLE public.daily_category_sales (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES public.stores(id),
  date date NOT NULL,
  category_id uuid NOT NULL REFERENCES public.product_categories(id),
  sales_amount numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(store_id, date, category_id)
);

-- Enable RLS
ALTER TABLE public.daily_category_sales ENABLE ROW LEVEL SECURITY;

-- Store managers can view own store category sales
CREATE POLICY "Store managers can view own store category sales"
ON public.daily_category_sales
FOR SELECT
USING (
  store_id = get_user_store_id(auth.uid()) OR
  has_role(auth.uid(), 'regional_supervisor'::app_role) OR
  has_role(auth.uid(), 'hq_administrator'::app_role)
);

-- HQ can manage all category sales
CREATE POLICY "HQ can manage all category sales"
ON public.daily_category_sales
FOR ALL
USING (has_role(auth.uid(), 'hq_administrator'::app_role));