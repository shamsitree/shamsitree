-- Replace permissive authenticated access with family-scoped permissions.
DROP POLICY family_unions_authenticated_select ON public.family_unions;
DROP POLICY family_unions_authenticated_insert ON public.family_unions;
DROP POLICY family_unions_authenticated_update ON public.family_unions;
DROP POLICY family_unions_authenticated_delete ON public.family_unions;
CREATE POLICY unions_read ON public.family_unions FOR SELECT TO authenticated USING (public.has_tree_access(tree_id,'viewer'));
CREATE POLICY unions_insert ON public.family_unions FOR INSERT TO authenticated WITH CHECK ((public.has_tree_access(tree_id,'editor')) AND (EXISTS (SELECT 1 FROM public.family_members m WHERE m.id=partner1_id AND m.tree_id=family_unions.tree_id) AND (partner2_id IS NULL OR EXISTS (SELECT 1 FROM public.family_members m WHERE m.id=partner2_id AND m.tree_id=family_unions.tree_id))));
CREATE POLICY unions_update ON public.family_unions FOR UPDATE TO authenticated USING (public.has_tree_access(tree_id,'editor')) WITH CHECK ((public.has_tree_access(tree_id,'editor')) AND (EXISTS (SELECT 1 FROM public.family_members m WHERE m.id=partner1_id AND m.tree_id=family_unions.tree_id) AND (partner2_id IS NULL OR EXISTS (SELECT 1 FROM public.family_members m WHERE m.id=partner2_id AND m.tree_id=family_unions.tree_id))));
CREATE POLICY unions_delete ON public.family_unions FOR DELETE TO authenticated USING (public.has_tree_access(tree_id,'editor'));
DROP POLICY family_children_authenticated_select ON public.family_children;
DROP POLICY family_children_authenticated_insert ON public.family_children;
DROP POLICY family_children_authenticated_update ON public.family_children;
DROP POLICY family_children_authenticated_delete ON public.family_children;
CREATE POLICY children_read ON public.family_children FOR SELECT TO authenticated USING (public.has_tree_access(tree_id,'viewer'));
CREATE POLICY children_insert ON public.family_children FOR INSERT TO authenticated WITH CHECK ((public.has_tree_access(tree_id,'editor')) AND (EXISTS (SELECT 1 FROM public.family_members m WHERE m.id=child_id AND m.tree_id=family_children.tree_id) AND EXISTS (SELECT 1 FROM public.family_unions u WHERE u.id=family_union_id AND u.tree_id=family_children.tree_id AND child_id<>u.partner1_id AND (u.partner2_id IS NULL OR child_id<>u.partner2_id))));
CREATE POLICY children_update ON public.family_children FOR UPDATE TO authenticated USING (public.has_tree_access(tree_id,'editor')) WITH CHECK ((public.has_tree_access(tree_id,'editor')) AND (EXISTS (SELECT 1 FROM public.family_members m WHERE m.id=child_id AND m.tree_id=family_children.tree_id) AND EXISTS (SELECT 1 FROM public.family_unions u WHERE u.id=family_union_id AND u.tree_id=family_children.tree_id AND child_id<>u.partner1_id AND (u.partner2_id IS NULL OR child_id<>u.partner2_id))));
CREATE POLICY children_delete ON public.family_children FOR DELETE TO authenticated USING (public.has_tree_access(tree_id,'editor'));
