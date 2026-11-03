-- REVIEW ONLY. Not applied. Stage and test with owner/editor/viewer identities first.
-- Existing permissive policies must be REPLACED, not supplemented: policies OR together.
BEGIN;
ALTER TABLE public.family_unions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_children ENABLE ROW LEVEL SECURITY;
DROP POLICY family_unions_authenticated_select ON public.family_unions;
DROP POLICY family_unions_authenticated_insert ON public.family_unions;
DROP POLICY family_unions_authenticated_update ON public.family_unions;
DROP POLICY family_unions_authenticated_delete ON public.family_unions;
DROP POLICY family_children_authenticated_select ON public.family_children;
DROP POLICY family_children_authenticated_insert ON public.family_children;
DROP POLICY family_children_authenticated_update ON public.family_children;
DROP POLICY family_children_authenticated_delete ON public.family_children;
CREATE POLICY unions_read ON public.family_unions FOR SELECT TO authenticated USING (public.has_tree_access(tree_id,'viewer'));
CREATE POLICY unions_insert ON public.family_unions FOR INSERT TO authenticated WITH CHECK (public.has_tree_access(tree_id,'editor'));
CREATE POLICY unions_update ON public.family_unions FOR UPDATE TO authenticated USING (public.has_tree_access(tree_id,'editor')) WITH CHECK (public.has_tree_access(tree_id,'editor'));
CREATE POLICY unions_delete ON public.family_unions FOR DELETE TO authenticated USING (public.has_tree_access(tree_id,'editor'));
CREATE POLICY children_read ON public.family_children FOR SELECT TO authenticated USING (public.has_tree_access(tree_id,'viewer'));
CREATE POLICY children_insert ON public.family_children FOR INSERT TO authenticated WITH CHECK (public.has_tree_access(tree_id,'editor'));
CREATE POLICY children_update ON public.family_children FOR UPDATE TO authenticated USING (public.has_tree_access(tree_id,'editor')) WITH CHECK (public.has_tree_access(tree_id,'editor'));
CREATE POLICY children_delete ON public.family_children FOR DELETE TO authenticated USING (public.has_tree_access(tree_id,'editor'));
-- Abort by default: this is a review artifact, not an approved production migration.
ROLLBACK;
