-- Allow regional supervisors to create tasks for stores in their region
CREATE POLICY "Regional supervisors can create tasks for region stores"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'regional_supervisor'::app_role) AND
  store_id IN (SELECT get_user_region_stores(auth.uid()))
);