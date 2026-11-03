import type { FamilyMember, FamilyUnion, FamilyChild, ChildRelationshipType } from '../types/family';

export type MemberParentage = {
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  relationshipType?: ChildRelationshipType;
};
export type QuickRelation = {
  targetMember: FamilyMember;
  relationType: 'father' | 'mother' | 'spouse' | 'child';
  union?: FamilyUnion;
};
export type AtomicSaveResult = { member: FamilyMember; unions: FamilyUnion[]; child: FamilyChild | null };

/** One database transaction. No fallback to sequential writes or deletion-based rollback. */
export async function saveUnifiedMember(
  client: { rpc: (name: string, args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: any }> },
  treeId: string,
  member: Partial<FamilyMember>,
  parentage: MemberParentage = {},
  quickRelation: QuickRelation | null = null
): Promise<AtomicSaveResult> {
  if (!treeId || !member.id) throw new Error('A family and stable member ID are required.');
  // Ownership and actor identity come from the authenticated database session.
  const { tree_id, created_by, created_at, ...fields } = member;
  const relations = quickRelation ? {
    mode: quickRelation.relationType,
    targetId: quickRelation.targetMember.id,
    ...(quickRelation.relationType === 'child' && quickRelation.union ? { unionId: quickRelation.union.id } : {}),
    relationshipType: parentage.relationshipType || 'biological'
  } : { mode: 'general', ...parentage };
  const { data, error } = await client.rpc('save_unified_member', {
    p_tree_id: treeId, p_member: fields, p_relations: relations
  });
  if (error) {
    if (error.code === 'PGRST202') throw new Error('Atomic saving is unavailable. Apply database/atomic_member_save.sql before using this version.');
    throw new Error(error.message || 'Save could not be confirmed. Retry this same form; do not create another member.');
  }
  const result = data as AtomicSaveResult | null;
  if (!result?.member || result.member.id !== member.id || result.member.tree_id !== treeId || !Array.isArray(result.unions)) {
    throw new Error('Save response could not be confirmed. Retry this same form; do not create another member.');
  }
  return result;
}
