-- Drop existing role enum and recreate with clear definitions
DROP TYPE IF EXISTS app_role CASCADE;
CREATE TYPE app_role AS ENUM ('admin', 'hq_administrator', 'regional_supervisor', 'store_manager');

-- Recreate user_roles table with one role per user constraint
DROP TABLE IF EXISTS user_roles CASCADE;
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role app_role NOT NULL
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the has_role function
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Update RLS policies for stores
DROP POLICY IF EXISTS "Everyone can view stores" ON public.stores;
DROP POLICY IF EXISTS "Only HQ can manage stores" ON public.stores;

CREATE POLICY "Everyone can view stores"
ON public.stores
FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage stores"
ON public.stores
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Update RLS policies for profiles
DROP POLICY IF EXISTS "HQ can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can create profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Admins and HQ can view all profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id 
  OR has_role(auth.uid(), 'admin') 
  OR has_role(auth.uid(), 'hq_administrator')
);

CREATE POLICY "Service role can create profiles"
ON public.profiles
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Update RLS policies for tasks
DROP POLICY IF EXISTS "Store managers can view own store tasks" ON public.tasks;
DROP POLICY IF EXISTS "Store managers can update own store tasks" ON public.tasks;
DROP POLICY IF EXISTS "Regional supervisors can create tasks for region stores" ON public.tasks;
DROP POLICY IF EXISTS "HQ can manage all tasks" ON public.tasks;

CREATE POLICY "Users can view accessible tasks"
ON public.tasks
FOR SELECT
USING (
  store_id = get_user_store_id(auth.uid())
  OR has_role(auth.uid(), 'regional_supervisor')
  OR has_role(auth.uid(), 'hq_administrator')
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Store managers can update own store tasks"
ON public.tasks
FOR UPDATE
USING (store_id = get_user_store_id(auth.uid()));

CREATE POLICY "Regional supervisors can create tasks for region stores"
ON public.tasks
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'regional_supervisor') 
  AND store_id IN (SELECT get_user_region_stores(auth.uid()))
);

CREATE POLICY "Admins and HQ can manage all tasks"
ON public.tasks
FOR ALL
USING (
  has_role(auth.uid(), 'admin') 
  OR has_role(auth.uid(), 'hq_administrator')
);

-- Update RLS policies for daily_sales
DROP POLICY IF EXISTS "Store managers can view own store daily sales" ON public.daily_sales;
DROP POLICY IF EXISTS "HQ can manage all daily sales" ON public.daily_sales;
DROP POLICY IF EXISTS "Service role can manage daily sales" ON public.daily_sales;

CREATE POLICY "Users can view accessible daily sales"
ON public.daily_sales
FOR SELECT
USING (
  store_id = get_user_store_id(auth.uid())
  OR has_role(auth.uid(), 'regional_supervisor')
  OR has_role(auth.uid(), 'hq_administrator')
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins and HQ can manage all daily sales"
ON public.daily_sales
FOR ALL
USING (
  has_role(auth.uid(), 'admin') 
  OR has_role(auth.uid(), 'hq_administrator')
);

CREATE POLICY "Service role can manage daily sales"
ON public.daily_sales
FOR ALL
USING (true)
WITH CHECK (true);

-- Update RLS policies for kpis
DROP POLICY IF EXISTS "Store managers can view own store KPIs" ON public.kpis;
DROP POLICY IF EXISTS "HQ can manage all KPIs" ON public.kpis;

CREATE POLICY "Users can view accessible KPIs"
ON public.kpis
FOR SELECT
USING (
  store_id = get_user_store_id(auth.uid())
  OR has_role(auth.uid(), 'regional_supervisor')
  OR has_role(auth.uid(), 'hq_administrator')
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins and HQ can manage all KPIs"
ON public.kpis
FOR ALL
USING (
  has_role(auth.uid(), 'admin') 
  OR has_role(auth.uid(), 'hq_administrator')
);

-- Update RLS policies for regions
DROP POLICY IF EXISTS "Everyone can view regions" ON public.regions;
DROP POLICY IF EXISTS "Only HQ can manage regions" ON public.regions;

CREATE POLICY "Everyone can view regions"
ON public.regions
FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage regions"
ON public.regions
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Update RLS policies for task_templates
DROP POLICY IF EXISTS "Everyone can view task templates" ON public.task_templates;
DROP POLICY IF EXISTS "HQ can manage task templates" ON public.task_templates;

CREATE POLICY "Everyone can view task templates"
ON public.task_templates
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage task templates"
ON public.task_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Update RLS policies for ai_suggestions
DROP POLICY IF EXISTS "Everyone can view AI suggestions" ON public.ai_suggestions;
DROP POLICY IF EXISTS "HQ can manage AI suggestions" ON public.ai_suggestions;

CREATE POLICY "Everyone can view AI suggestions"
ON public.ai_suggestions
FOR SELECT
USING (true);

CREATE POLICY "Admins and HQ can manage AI suggestions"
ON public.ai_suggestions
FOR ALL
USING (
  has_role(auth.uid(), 'admin') 
  OR has_role(auth.uid(), 'hq_administrator')
);

-- Update RLS policies for daily_category_sales
DROP POLICY IF EXISTS "Store managers can view own store category sales" ON public.daily_category_sales;
DROP POLICY IF EXISTS "HQ can manage all category sales" ON public.daily_category_sales;

CREATE POLICY "Users can view accessible category sales"
ON public.daily_category_sales
FOR SELECT
USING (
  store_id = get_user_store_id(auth.uid())
  OR has_role(auth.uid(), 'regional_supervisor')
  OR has_role(auth.uid(), 'hq_administrator')
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins and HQ can manage all category sales"
ON public.daily_category_sales
FOR ALL
USING (
  has_role(auth.uid(), 'admin') 
  OR has_role(auth.uid(), 'hq_administrator')
);

-- Update RLS policies for orders
DROP POLICY IF EXISTS "Store managers can view own store orders" ON public.orders;
DROP POLICY IF EXISTS "Store managers can create orders for own store" ON public.orders;
DROP POLICY IF EXISTS "HQ can manage all orders" ON public.orders;

CREATE POLICY "Users can view accessible orders"
ON public.orders
FOR SELECT
USING (
  store_id = get_user_store_id(auth.uid())
  OR has_role(auth.uid(), 'regional_supervisor')
  OR has_role(auth.uid(), 'hq_administrator')
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Store managers can create orders for own store"
ON public.orders
FOR INSERT
WITH CHECK (
  store_id = get_user_store_id(auth.uid()) 
  AND auth.uid() = created_by
);

CREATE POLICY "Admins and HQ can manage all orders"
ON public.orders
FOR ALL
USING (
  has_role(auth.uid(), 'admin') 
  OR has_role(auth.uid(), 'hq_administrator')
);

-- Assign roles to specified users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'mirza.sefer@mstart.eu'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'hq_administrator'
FROM auth.users
WHERE email = 'ensar.selimovic@mstart.eu'
ON CONFLICT (user_id) DO UPDATE SET role = 'hq_administrator';