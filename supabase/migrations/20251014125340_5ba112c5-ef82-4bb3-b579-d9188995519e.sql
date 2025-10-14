-- Create store format enum
CREATE TYPE public.store_format AS ENUM ('maxi', 'super', 'small');

-- Add missing fields to stores table
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS manager_id uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS size_sqm numeric,
ADD COLUMN IF NOT EXISTS num_employees integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS format public.store_format DEFAULT 'super';

-- Add area_manager field to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_area_manager boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS managed_region_id uuid REFERENCES public.regions(id);

-- Add active status to profiles for user deactivation
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stores_manager ON public.stores(manager_id);
CREATE INDEX IF NOT EXISTS idx_stores_region ON public.stores(region_id);
CREATE INDEX IF NOT EXISTS idx_profiles_region ON public.profiles(managed_region_id);