-- Applied through Supabase migrations. SECURITY INVOKER keeps all RLS checks active.
CREATE OR REPLACE FUNCTION public.save_unified_member(
  p_tree_id uuid, p_member jsonb, p_relations jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_member public.family_members%ROWTYPE;
  v_existing public.family_members%ROWTYPE;
  v_union public.family_unions%ROWTYPE;
  v_old_union public.family_unions%ROWTYPE;
  v_link public.family_children%ROWTYPE;
  v_id uuid := (p_member->>'id')::uuid;
  v_child uuid;
  v_p1 uuid;
  v_p2 uuid;
  v_spouse uuid := nullif(p_relations->>'spouseId','')::uuid;
  v_target uuid := nullif(p_relations->>'targetId','')::uuid;
  v_mode text := coalesce(p_relations->>'mode','general');
  v_kind text := coalesce(p_relations->>'relationshipType','biological');
  v_count integer;
  v_changed_unions uuid[] := '{}';
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_tree_access(p_tree_id,'editor') THEN
    RAISE EXCEPTION 'You do not have permission to edit this family.' USING ERRCODE='42501';
  END IF;
  IF v_id IS NULL OR jsonb_typeof(p_member) <> 'object' THEN RAISE EXCEPTION 'A stable member ID is required.'; END IF;
  IF v_mode NOT IN ('general','father','mother','spouse','child') THEN RAISE EXCEPTION 'Unknown relationship action.'; END IF;
  IF v_kind NOT IN ('biological','adopted','foster','step') THEN RAISE EXCEPTION 'Unknown child relationship type.'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_object_keys(p_member) k WHERE k NOT IN
    ('id','full_name','gender','date_of_birth','date_of_death','phone','biradari','birthplace','current_residence','location','notes','profile_photo')) THEN
    RAISE EXCEPTION 'Unsupported member fields.';
  END IF;
  -- All calls for this family serialize until commit, including retries.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_tree_id::text, 0));
  SELECT * INTO v_existing FROM public.family_members WHERE id=v_id AND tree_id=p_tree_id;
  v_member := jsonb_populate_record(v_existing,p_member);
  IF nullif(btrim(v_member.full_name),'') IS NULL THEN RAISE EXCEPTION 'Full name is required.'; END IF;
  IF v_existing.id IS NULL THEN
    INSERT INTO public.family_members(id,tree_id,created_by,full_name,gender,date_of_birth,date_of_death,phone,biradari,birthplace,current_residence,location,notes,profile_photo)
    VALUES(v_id,p_tree_id,auth.uid(),btrim(v_member.full_name),v_member.gender,v_member.date_of_birth,v_member.date_of_death,v_member.phone,coalesce(v_member.biradari,'Shamsi'),v_member.birthplace,v_member.current_residence,v_member.location,v_member.notes,v_member.profile_photo)
    RETURNING * INTO v_member;
  ELSE
    UPDATE public.family_members SET full_name=btrim(v_member.full_name),gender=v_member.gender,
      date_of_birth=v_member.date_of_birth,date_of_death=v_member.date_of_death,phone=v_member.phone,
      biradari=v_member.biradari,birthplace=v_member.birthplace,current_residence=v_member.current_residence,
      location=v_member.location,notes=v_member.notes,profile_photo=v_member.profile_photo,updated_at=now()
    WHERE id=v_id AND tree_id=p_tree_id RETURNING * INTO v_member;
    IF NOT FOUND THEN RAISE EXCEPTION 'Member update denied.' USING ERRCODE='42501'; END IF;
  END IF;

  IF v_mode <> 'general' AND (v_target IS NULL OR NOT EXISTS(
    SELECT 1 FROM public.family_members WHERE id=v_target AND tree_id=p_tree_id)) THEN
    RAISE EXCEPTION 'The selected relative no longer belongs to this family.';
  END IF;
  IF v_mode='spouse' THEN v_spouse:=v_target; END IF;
  IF v_spouse IS NOT NULL THEN
    IF v_spouse=v_id OR NOT EXISTS(SELECT 1 FROM public.family_members WHERE id=v_spouse AND tree_id=p_tree_id) THEN
      RAISE EXCEPTION 'Choose a different spouse in the same family.';
    END IF;
    SELECT * INTO v_union FROM public.family_unions WHERE tree_id=p_tree_id AND
      ((partner1_id=v_id AND partner2_id=v_spouse) OR (partner1_id=v_spouse AND partner2_id=v_id)) ORDER BY id LIMIT 1;
    IF NOT FOUND THEN
      INSERT INTO public.family_unions(tree_id,partner1_id,partner2_id,relationship_type,marriage_status)
      VALUES(p_tree_id,v_id,v_spouse,'spouse','married') RETURNING * INTO v_union;
    END IF;
    v_changed_unions:=array_append(v_changed_unions,v_union.id);
  END IF;

  IF v_mode IN ('father','mother') THEN
    v_child:=v_target;
    SELECT count(*) INTO v_count FROM public.family_children WHERE tree_id=p_tree_id AND child_id=v_child;
    IF v_count>1 THEN RAISE EXCEPTION 'Multiple parentage records exist; review them before adding a parent.'; END IF;
    SELECT * INTO v_link FROM public.family_children WHERE tree_id=p_tree_id AND child_id=v_child;
    IF FOUND THEN
      v_kind:=v_link.relationship_type;
      SELECT * INTO STRICT v_old_union FROM public.family_unions WHERE id=v_link.family_union_id AND tree_id=p_tree_id;
      -- Adding a parent must never overwrite a complete couple or modify a sibling's parentage.
      IF v_id IN (v_old_union.partner1_id,v_old_union.partner2_id) THEN
        v_p1:=v_old_union.partner1_id; v_p2:=v_old_union.partner2_id;
      ELSIF v_old_union.partner2_id IS NOT NULL THEN
        RAISE EXCEPTION 'Both parent slots are already occupied. Existing family preserved.';
      ELSE
        IF EXISTS(SELECT 1 FROM public.family_members WHERE id=v_old_union.partner1_id
          AND gender=CASE WHEN v_mode='father' THEN 'male' ELSE 'female' END) THEN
          RAISE EXCEPTION 'That parent slot is already occupied. Existing family preserved.';
        END IF;
        v_p1:=v_old_union.partner1_id; v_p2:=v_id;
      END IF;
    ELSE v_p1:=v_id;
    END IF;
  ELSIF v_mode='child' THEN
    v_child:=v_id;
    IF nullif(p_relations->>'unionId','') IS NOT NULL THEN
      SELECT * INTO STRICT v_union FROM public.family_unions WHERE id=(p_relations->>'unionId')::uuid AND tree_id=p_tree_id;
      IF v_target NOT IN (v_union.partner1_id,coalesce(v_union.partner2_id,v_union.partner1_id)) THEN RAISE EXCEPTION 'Selected marriage does not belong to this parent.'; END IF;
      v_p1:=v_union.partner1_id; v_p2:=v_union.partner2_id;
    ELSE v_p1:=v_target;
    END IF;
  ELSIF v_mode='general' THEN
    v_child:=v_id;
    v_p1:=nullif(p_relations->>'fatherId','')::uuid;
    v_p2:=nullif(p_relations->>'motherId','')::uuid;
    IF v_p1 IS NULL THEN v_p1:=v_p2; v_p2:=NULL; END IF;
  END IF;

  IF v_p1 IS NOT NULL THEN
    IF v_child IN (v_p1,v_p2) OR v_p1=v_p2 THEN RAISE EXCEPTION 'A person cannot be their own parent; parents must be different.'; END IF;
    IF NOT EXISTS(SELECT 1 FROM public.family_members WHERE id=v_p1 AND tree_id=p_tree_id)
      OR (v_p2 IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.family_members WHERE id=v_p2 AND tree_id=p_tree_id)) THEN
      RAISE EXCEPTION 'Parents must belong to the same family.';
    END IF;
    IF EXISTS(
      WITH RECURSIVE descendants(id) AS (
        SELECT v_child UNION
        SELECT c.child_id FROM descendants d JOIN public.family_unions u ON (u.partner1_id=d.id OR u.partner2_id=d.id)
        JOIN public.family_children c ON c.family_union_id=u.id WHERE u.tree_id=p_tree_id AND c.tree_id=p_tree_id
      ) SELECT 1 FROM descendants WHERE id=v_p1 OR id=v_p2
    ) THEN RAISE EXCEPTION 'This would create circular ancestry.'; END IF;
    SELECT count(*) INTO v_count FROM public.family_children WHERE child_id=v_child AND tree_id=p_tree_id;
    IF v_count>1 THEN RAISE EXCEPTION 'Multiple parentage records exist; review them first.'; END IF;
    SELECT * INTO v_link FROM public.family_children WHERE child_id=v_child AND tree_id=p_tree_id;
    SELECT * INTO v_union FROM public.family_unions WHERE tree_id=p_tree_id AND
      ((partner1_id=v_p1 AND partner2_id IS NOT DISTINCT FROM v_p2) OR (v_p2 IS NOT NULL AND partner1_id=v_p2 AND partner2_id=v_p1))
      -- A quick-add to an explicit marriage must keep that exact branch.
      AND (v_mode<>'child' OR nullif(p_relations->>'unionId','') IS NULL OR id=(p_relations->>'unionId')::uuid)
      ORDER BY id LIMIT 1;
    IF NOT FOUND THEN
      INSERT INTO public.family_unions(tree_id,partner1_id,partner2_id,relationship_type,marriage_status)
      VALUES(p_tree_id,v_p1,v_p2,CASE WHEN v_p2 IS NULL THEN 'single_parent' ELSE 'spouse' END,'unknown') RETURNING * INTO v_union;
    END IF;
    v_changed_unions:=array_append(v_changed_unions,v_union.id);
    IF v_link.id IS NULL THEN
      INSERT INTO public.family_children(tree_id,family_union_id,child_id,relationship_type)
      VALUES(p_tree_id,v_union.id,v_child,v_kind) RETURNING * INTO v_link;
    ELSE
      UPDATE public.family_children SET family_union_id=v_union.id,relationship_type=v_kind
      WHERE id=v_link.id AND tree_id=p_tree_id RETURNING * INTO v_link;
      IF NOT FOUND THEN RAISE EXCEPTION 'Parentage update denied.' USING ERRCODE='42501'; END IF;
    END IF;
  END IF;
  RETURN jsonb_build_object('member',to_jsonb(v_member),'unions',coalesce((SELECT jsonb_agg(to_jsonb(u)) FROM public.family_unions u WHERE u.id=ANY(v_changed_unions)),'[]'::jsonb),
    'child',CASE WHEN v_link.id IS NULL THEN NULL ELSE to_jsonb(v_link) END);
END;
$$;
REVOKE ALL ON FUNCTION public.save_unified_member(uuid,jsonb,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.save_unified_member(uuid,jsonb,jsonb) TO authenticated;
