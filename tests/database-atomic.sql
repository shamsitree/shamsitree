-- Live database tests. The inner exception subtransaction rolls back ALL fixture rows.
DO $$
DECLARE
  owner_id uuid; editor_id uuid; viewer_id uuid; stranger_id uuid;
  ta uuid:=gen_random_uuid(); tb uuid:=gen_random_uuid();
  mannan uuid:=gen_random_uuid(); anwar uuid:=gen_random_uuid();
  ruhi1 uuid:=gen_random_uuid(); ruhi2 uuid:=gen_random_uuid();
  ghani uuid:=gen_random_uuid(); sidra uuid:=gen_random_uuid();
  unknown_child uuid:=gen_random_uuid(); sibling uuid:=gen_random_uuid();
  extra_mother uuid:=gen_random_uuid(); failed_id uuid:=gen_random_uuid();
  union1 uuid; union2 uuid; response jsonb; n integer; oldname text;
  results jsonb:='[]'; counts_before jsonb; counts_after jsonb;
BEGIN
  SELECT owner_user_id INTO owner_id FROM public.family_trees ORDER BY created_at LIMIT 1;
  SELECT id INTO editor_id FROM auth.users WHERE id<>owner_id ORDER BY id LIMIT 1;
  SELECT id INTO viewer_id FROM auth.users WHERE id NOT IN(owner_id,editor_id) ORDER BY id LIMIT 1;
  SELECT id INTO stranger_id FROM auth.users WHERE id NOT IN(owner_id,editor_id,viewer_id) ORDER BY id LIMIT 1;
  IF stranger_id IS NULL THEN RAISE EXCEPTION 'Four existing identities required for scoped-access tests.'; END IF;
  SELECT jsonb_build_array((SELECT count(*) FROM public.family_trees),(SELECT count(*) FROM public.family_members),
    (SELECT count(*) FROM public.family_unions),(SELECT count(*) FROM public.family_children),(SELECT count(*) FROM public.tree_permissions)) INTO counts_before;
  BEGIN
    INSERT INTO public.family_trees(id,owner_user_id,name) VALUES(ta,owner_id,'__ROLLBACK_ONLY_ATOMIC_TEST__'),(tb,stranger_id,'__ROLLBACK_ONLY_ACCESS_TEST__');
    INSERT INTO public.tree_permissions(tree_id,user_id,role) VALUES(ta,editor_id,'editor'),(ta,viewer_id,'viewer');
    PERFORM set_config('request.jwt.claim.sub',owner_id::text,true);
    SET LOCAL ROLE authenticated;
    PERFORM public.save_unified_member(ta,jsonb_build_object('id',mannan,'full_name','Abdul Mannan','gender','male'));
    PERFORM public.save_unified_member(ta,jsonb_build_object('id',anwar,'full_name','Anwar Kamal','gender','male'),jsonb_build_object('fatherId',mannan));
    PERFORM public.save_unified_member(ta,jsonb_build_object('id',ruhi1,'full_name','Ruhi Kamal','gender','female'),jsonb_build_object('mode','spouse','targetId',anwar));
    PERFORM public.save_unified_member(ta,jsonb_build_object('id',ruhi2,'full_name','Ruhi Fakhir','gender','female'),jsonb_build_object('mode','spouse','targetId',anwar));
    SELECT id INTO STRICT union1 FROM public.family_unions WHERE tree_id=ta AND partner1_id=ruhi1 AND partner2_id=anwar;
    SELECT id INTO STRICT union2 FROM public.family_unions WHERE tree_id=ta AND partner1_id=ruhi2 AND partner2_id=anwar;
    PERFORM public.save_unified_member(ta,jsonb_build_object('id',ghani,'full_name','Abdul Ghani','gender','male'),jsonb_build_object('mode','child','targetId',anwar,'unionId',union1));
    PERFORM public.save_unified_member(ta,jsonb_build_object('id',sidra,'full_name','Sidra Kamal','gender','female'),jsonb_build_object('mode','child','targetId',anwar,'unionId',union2));
    IF (SELECT family_union_id FROM public.family_children WHERE child_id=ghani)<>union1 OR
       (SELECT family_union_id FROM public.family_children WHERE child_id=sidra)<>union2 THEN RAISE EXCEPTION 'Marriage branch mismatch'; END IF;
    results:=results||jsonb_build_array('PASS owner creates Anwar family with two separate marriage branches');
    PERFORM public.save_unified_member(ta,jsonb_build_object('id',ghani,'full_name','Abdul Ghani','gender','male'),jsonb_build_object('mode','child','targetId',anwar,'unionId',union1));
    IF (SELECT count(*) FROM public.family_children WHERE child_id=ghani)<>1 OR (SELECT count(*) FROM public.family_members WHERE id=ghani)<>1 THEN RAISE EXCEPTION 'Duplicate retry'; END IF;
    results:=results||jsonb_build_array('PASS retry preserves one member and one child link');
    BEGIN
      PERFORM public.save_unified_member(ta,jsonb_build_object('id',failed_id,'full_name','Must roll back','gender','male'),jsonb_build_object('spouseId',ruhi1,'fatherId',gen_random_uuid()));
      RAISE EXCEPTION 'TEST FAILED invalid parent accepted';
    EXCEPTION WHEN raise_exception THEN
      IF SQLERRM LIKE 'TEST FAILED%' THEN RAISE; END IF;
    END;
    IF EXISTS(SELECT 1 FROM public.family_members WHERE id=failed_id) OR EXISTS(SELECT 1 FROM public.family_unions WHERE partner1_id=failed_id OR partner2_id=failed_id) THEN RAISE EXCEPTION 'Partial insert survived'; END IF;
    results:=results||jsonb_build_array('PASS failed relationship rolls back member and spouse union inserts');
    BEGIN
      PERFORM public.save_unified_member(ta,jsonb_build_object('id',mannan,'full_name','Must not rename'),jsonb_build_object('fatherId',ghani));
      RAISE EXCEPTION 'TEST FAILED cycle accepted';
    EXCEPTION WHEN raise_exception THEN
      IF SQLERRM LIKE 'TEST FAILED%' THEN RAISE; END IF;
    END;
    IF (SELECT full_name FROM public.family_members WHERE id=mannan)<>'Abdul Mannan' THEN RAISE EXCEPTION 'Failed edit survived'; END IF;
    results:=results||jsonb_build_array('PASS circular ancestry rejected and member edit rolled back');
    PERFORM public.save_unified_member(ta,jsonb_build_object('id',unknown_child,'full_name','Single parent child','gender','male'),jsonb_build_object('fatherId',anwar));
    PERFORM public.save_unified_member(ta,jsonb_build_object('id',sibling,'full_name','Sibling preserved','gender','male'),jsonb_build_object('fatherId',anwar));
    PERFORM public.save_unified_member(ta,jsonb_build_object('id',extra_mother,'full_name','New mother','gender','female'),jsonb_build_object('mode','mother','targetId',unknown_child));
    IF (SELECT u.partner2_id FROM public.family_children c JOIN public.family_unions u ON u.id=c.family_union_id WHERE c.child_id=sibling) IS NOT NULL THEN RAISE EXCEPTION 'Sibling parentage overwritten'; END IF;
    IF NOT EXISTS(SELECT 1 FROM public.family_children c JOIN public.family_unions u ON u.id=c.family_union_id WHERE c.child_id=unknown_child AND (u.partner1_id=extra_mother OR u.partner2_id=extra_mother)) THEN RAISE EXCEPTION 'New mother missing'; END IF;
    results:=results||jsonb_build_array('PASS adding mother affects selected child only and preserves sibling');
    -- Atomic reassignment modifies only the child's link, never the shared marriage.
    PERFORM public.save_unified_member(ta,jsonb_build_object('id',unknown_child,'full_name','Single parent child'),jsonb_build_object('fatherId',anwar,'motherId',ruhi1));
    IF (SELECT family_union_id FROM public.family_children WHERE child_id=unknown_child)<>union1 OR
      (SELECT family_union_id FROM public.family_children WHERE child_id=sidra)<>union2 THEN RAISE EXCEPTION 'Reassignment changed other child'; END IF;
    results:=results||jsonb_build_array('PASS parent reassignment keeps other marriages and children unchanged');
    PERFORM set_config('request.jwt.claim.sub',editor_id::text,true);
    PERFORM public.save_unified_member(ta,jsonb_build_object('id',ghani,'full_name','Abdul Ghani edited'));
    IF (SELECT full_name FROM public.family_members WHERE id=ghani)<>'Abdul Ghani edited' THEN RAISE EXCEPTION 'Editor failed'; END IF;
    results:=results||jsonb_build_array('PASS invited editor can save');
    PERFORM set_config('request.jwt.claim.sub',viewer_id::text,true);
    IF NOT EXISTS(SELECT 1 FROM public.family_unions WHERE tree_id=ta) THEN RAISE EXCEPTION 'Viewer cannot read'; END IF;
    BEGIN
      PERFORM public.save_unified_member(ta,jsonb_build_object('id',ghani,'full_name','Viewer overwrite'));
      RAISE EXCEPTION 'TEST FAILED viewer saved';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    UPDATE public.family_unions SET marriage_status='divorced' WHERE id=union1;
    GET DIAGNOSTICS n=ROW_COUNT;
    IF n<>0 THEN RAISE EXCEPTION 'Viewer directly updated union'; END IF;
    DELETE FROM public.family_children WHERE child_id=ghani;
    GET DIAGNOSTICS n=ROW_COUNT;
    IF n<>0 THEN RAISE EXCEPTION 'Viewer deleted child'; END IF;
    results:=results||jsonb_build_array('PASS viewer reads but cannot RPC save, update unions or delete child links');
    PERFORM set_config('request.jwt.claim.sub',stranger_id::text,true);
    IF EXISTS(SELECT 1 FROM public.family_unions WHERE tree_id=ta) OR EXISTS(SELECT 1 FROM public.family_children WHERE tree_id=ta) THEN RAISE EXCEPTION 'Unrelated user can read'; END IF;
    BEGIN
      PERFORM public.save_unified_member(ta,jsonb_build_object('id',ghani,'full_name','Stranger overwrite'));
      RAISE EXCEPTION 'TEST FAILED stranger saved';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    BEGIN
      INSERT INTO public.family_unions(tree_id,partner1_id,partner2_id) VALUES(tb,ghani,sidra);
      RAISE EXCEPTION 'TEST FAILED cross-family union accepted';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    results:=results||jsonb_build_array('PASS unrelated user cannot read or write family; cross-family references rejected');
    SET LOCAL ROLE anon;
    BEGIN
      PERFORM public.save_unified_member(ta,jsonb_build_object('id',failed_id,'full_name','Anon'));
      RAISE EXCEPTION 'TEST FAILED anon called RPC';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    results:=results||jsonb_build_array('PASS anonymous RPC execution denied');
    RAISE EXCEPTION USING ERRCODE='Z0001',MESSAGE='Rollback all fixtures';
  EXCEPTION WHEN SQLSTATE 'Z0001' THEN NULL;
  END;
  SELECT jsonb_build_array((SELECT count(*) FROM public.family_trees),(SELECT count(*) FROM public.family_members),
    (SELECT count(*) FROM public.family_unions),(SELECT count(*) FROM public.family_children),(SELECT count(*) FROM public.tree_permissions)) INTO counts_after;
  IF counts_after<>counts_before THEN RAISE EXCEPTION 'Fixture cleanup mismatch'; END IF;
  results:=results||jsonb_build_array('PASS all fixture rows rolled back; original row counts unchanged');
  PERFORM set_config('shamsitree_test.results',results::text,false);
END $$;
SELECT current_setting('shamsitree_test.results')::jsonb AS test_results;
