-- Fix security warning: Add search_path to get_user_region_stores function
CREATE OR REPLACE FUNCTION public.get_user_region_stores(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id
  FROM public.stores s
  JOIN public.profiles p ON p.id = _user_id
  WHERE s.region_id = (SELECT region_id FROM public.stores WHERE id = p.store_id)
$$;