-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('store_manager', 'regional_supervisor', 'hq_administrator');

-- Create enum for task status
CREATE TYPE public.task_status AS ENUM ('not_started', 'in_progress', 'completed');

-- Create enum for task priority
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Create enum for order categories
CREATE TYPE public.order_category AS ENUM ('produce', 'bakery', 'dairy', 'meat', 'frozen', 'dry_goods', 'other');

-- Create regions table
CREATE TABLE public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create stores table
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  region_id UUID REFERENCES public.regions(id) ON DELETE CASCADE NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create task templates table
CREATE TABLE public.task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority task_priority NOT NULL DEFAULT 'medium',
  requires_image BOOLEAN DEFAULT false,
  requires_gps BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.task_templates(id) ON DELETE SET NULL,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'not_started',
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  comments TEXT,
  image_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create task_history table for audit trail
CREATE TABLE public.task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  action TEXT NOT NULL,
  old_status task_status,
  new_status task_status,
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create KPIs table
CREATE TABLE public.kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  sales_amount DECIMAL(12, 2),
  shrinkage_percent DECIMAL(5, 2),
  availability_percent DECIMAL(5, 2),
  sco_uptime_percent DECIMAL(5, 2),
  queue_time_minutes DECIMAL(5, 2),
  cash_variance_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(store_id, date)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  category order_category NOT NULL,
  order_date DATE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  notes TEXT,
  items JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create AI suggestions table
CREATE TABLE public.ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  rationale TEXT,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  region_id UUID REFERENCES public.regions(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user's store_id
CREATE OR REPLACE FUNCTION public.get_user_store_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT store_id FROM public.profiles WHERE id = _user_id
$$;

-- Create function to get user's region stores
CREATE OR REPLACE FUNCTION public.get_user_region_stores(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id
  FROM public.stores s
  JOIN public.profiles p ON p.id = _user_id
  WHERE s.region_id = (SELECT region_id FROM public.stores WHERE id = p.store_id)
$$;

-- RLS Policies for regions
CREATE POLICY "Everyone can view regions" ON public.regions FOR SELECT USING (true);
CREATE POLICY "Only HQ can manage regions" ON public.regions FOR ALL USING (public.has_role(auth.uid(), 'hq_administrator'));

-- RLS Policies for stores
CREATE POLICY "Everyone can view stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Only HQ can manage stores" ON public.stores FOR ALL USING (public.has_role(auth.uid(), 'hq_administrator'));

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "HQ can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'hq_administrator'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Only HQ can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'hq_administrator'));

-- RLS Policies for task_templates
CREATE POLICY "Everyone can view task templates" ON public.task_templates FOR SELECT USING (true);
CREATE POLICY "HQ can manage task templates" ON public.task_templates FOR ALL USING (public.has_role(auth.uid(), 'hq_administrator'));

-- RLS Policies for tasks
CREATE POLICY "Store managers can view own store tasks" ON public.tasks FOR SELECT 
  USING (store_id = public.get_user_store_id(auth.uid()) OR public.has_role(auth.uid(), 'regional_supervisor') OR public.has_role(auth.uid(), 'hq_administrator'));

CREATE POLICY "Store managers can update own store tasks" ON public.tasks FOR UPDATE 
  USING (store_id = public.get_user_store_id(auth.uid()));

CREATE POLICY "HQ can manage all tasks" ON public.tasks FOR ALL 
  USING (public.has_role(auth.uid(), 'hq_administrator'));

-- RLS Policies for task_history
CREATE POLICY "Users can view task history for accessible tasks" ON public.task_history FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t 
      WHERE t.id = task_id AND (
        t.store_id = public.get_user_store_id(auth.uid()) OR 
        public.has_role(auth.uid(), 'regional_supervisor') OR 
        public.has_role(auth.uid(), 'hq_administrator')
      )
    )
  );

CREATE POLICY "Users can insert task history" ON public.task_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for kpis
CREATE POLICY "Store managers can view own store KPIs" ON public.kpis FOR SELECT 
  USING (store_id = public.get_user_store_id(auth.uid()) OR public.has_role(auth.uid(), 'regional_supervisor') OR public.has_role(auth.uid(), 'hq_administrator'));

CREATE POLICY "HQ can manage all KPIs" ON public.kpis FOR ALL 
  USING (public.has_role(auth.uid(), 'hq_administrator'));

-- RLS Policies for orders
CREATE POLICY "Store managers can view own store orders" ON public.orders FOR SELECT 
  USING (store_id = public.get_user_store_id(auth.uid()) OR public.has_role(auth.uid(), 'regional_supervisor') OR public.has_role(auth.uid(), 'hq_administrator'));

CREATE POLICY "Store managers can create orders for own store" ON public.orders FOR INSERT 
  WITH CHECK (store_id = public.get_user_store_id(auth.uid()) AND auth.uid() = created_by);

CREATE POLICY "HQ can manage all orders" ON public.orders FOR ALL 
  USING (public.has_role(auth.uid(), 'hq_administrator'));

-- RLS Policies for ai_suggestions
CREATE POLICY "Everyone can view AI suggestions" ON public.ai_suggestions FOR SELECT USING (true);
CREATE POLICY "HQ can manage AI suggestions" ON public.ai_suggestions FOR ALL USING (public.has_role(auth.uid(), 'hq_administrator'));

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.regions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.task_templates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.kpis FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data
INSERT INTO public.regions (name, code) VALUES
  ('Central Region', 'CR'),
  ('North Region', 'NR'),
  ('South Region', 'SR');

INSERT INTO public.stores (name, code, region_id, address) VALUES
  ('Store #001 - City Center', 'S001', (SELECT id FROM public.regions WHERE code = 'CR'), 'Main Street 123'),
  ('Store #002 - Mall West', 'S002', (SELECT id FROM public.regions WHERE code = 'CR'), 'West Boulevard 456'),
  ('Store #003 - North Plaza', 'S003', (SELECT id FROM public.regions WHERE code = 'NR'), 'North Avenue 789');