-- REVIEW ONLY: restores original permissive policies; security regression.
-- Use only for a deliberate rollback after review.
BEGIN;
ALTER POLICY family_unions_authenticated_select ON public.family_unions TO authenticated USING (true);
ALTER POLICY family_unions_authenticated_insert ON public.family_unions TO authenticated WITH CHECK (true);
ALTER POLICY family_unions_authenticated_update ON public.family_unions TO authenticated USING (true) WITH CHECK (true);
ALTER POLICY family_unions_authenticated_delete ON public.family_unions TO authenticated USING (true);
ALTER POLICY family_children_authenticated_select ON public.family_children TO authenticated USING (true);
ALTER POLICY family_children_authenticated_insert ON public.family_children TO authenticated WITH CHECK (true);
ALTER POLICY family_children_authenticated_update ON public.family_children TO authenticated USING (true) WITH CHECK (true);
ALTER POLICY family_children_authenticated_delete ON public.family_children TO authenticated USING (true);
ALTER POLICY "Users can upload family photos" ON storage.objects TO authenticated WITH CHECK (bucket_id = 'family-photos');
ALTER POLICY "Users can update family photos" ON storage.objects TO authenticated USING (bucket_id = 'family-photos') WITH CHECK (bucket_id = 'family-photos');
ALTER POLICY "Users can delete family photos" ON storage.objects TO authenticated USING (bucket_id = 'family-photos');
-- Change to COMMIT only after explicit owner approval and staging verification.
ROLLBACK;
