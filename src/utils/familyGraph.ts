import type { FamilyMember, FamilyUnion, FamilyChild, ChildRelationshipType } from '../types/family';

export type Graph = { members: FamilyMember[]; unions: FamilyUnion[]; children: FamilyChild[] };
export type Relation = { targetMember: FamilyMember; relationType: 'father'|'mother'|'spouse'|'child'; union?: FamilyUnion };
export type Parentage = { fatherId?: string; motherId?: string; spouseId?: string; relationshipType?: ChildRelationshipType };
const parents = (u: FamilyUnion) => [u.partner1_id, u.partner2_id].filter(Boolean) as string[];
const same = (a: string[], b: string[]) => a.length === b.length && a.every(id => b.includes(id));

/** Validate a complete snapshot. Never repairs or guesses ambiguous parentage. */
export function validateGraph(g: Graph, treeId: string, spouseLimit = Infinity) {
  for (const rows of [g.members, g.unions, g.children]) {
    if (new Set(rows.map(r => r.id)).size !== rows.length) throw new Error('Duplicate record IDs.');
    if (rows.some(r => r.tree_id !== treeId)) throw new Error('Cross-family records are not allowed.');
  }
  const ids = new Set(g.members.map(m => m.id));
  const unionMap = new Map(g.unions.map(u => [u.id, u]));
  const links = new Set<string>();
  const lineages = new Set<string>();
  const edges = new Map<string, string[]>();
  for (const m of g.members) {
    if (!m.full_name?.trim()) throw new Error('Full name is required.');
    if (!['male','female','other'].includes(m.gender)) throw new Error('Invalid gender.');
    if (m.date_of_birth && m.date_of_death && m.date_of_birth > m.date_of_death) throw new Error('Death date cannot precede birth date.');
    const spouses = new Set(g.unions.filter(u => parents(u).includes(m.id)).flatMap(u => parents(u).filter(id => id !== m.id)));
    if (spouses.size > spouseLimit) throw new Error('Form B supports up to three spouses per person.');
  }
  for (const u of g.unions) {
    const ps = parents(u);
    if (!ps.length || new Set(ps).size !== ps.length || ps.some(id => !ids.has(id))) throw new Error('Invalid or missing union partners.');
  }
  for (const c of g.children) {
    if (!['biological','adopted','foster','step','other'].includes(c.relationship_type)) throw new Error('Invalid lineage type.');
    const u = unionMap.get(c.family_union_id);
    if (!u || !ids.has(c.child_id)) throw new Error('Missing child or parent union.');
    const key = c.family_union_id + ':' + c.child_id;
    const lineage = c.child_id + ':' + c.relationship_type;
    if (links.has(key)) throw new Error('Duplicate parent-child link.');
    if (lineages.has(lineage)) throw new Error('Ambiguous parentage: multiple unions for the same lineage. Review required.');
    links.add(key); lineages.add(lineage);
    for (const p of parents(u)) edges.set(p, [...(edges.get(p) || []), c.child_id]);
  }
  // Iterative topological check handles deep ancestry without a recursion limit.
  const incoming = new Map(g.members.map(m => [m.id, 0]));
  for (const cs of edges.values()) for (const c of cs) incoming.set(c, incoming.get(c)! + 1);
  const queue = [...incoming].filter(([,n]) => !n).map(([id]) => id);
  let visited = 0;
  while (queue.length) {
    const id = queue.pop()!; visited++;
    for (const c of edges.get(id) || []) { incoming.set(c, incoming.get(c)! - 1); if (!incoming.get(c)) queue.push(c); }
  }
  if (visited !== g.members.length) throw new Error('Circular ancestry or self-parent relationship.');
}

/** Plan on a copy; preserve shared unions and never replace an already-known parent. */
export function saveToGraph(original: Graph, member: FamilyMember, parentage: Parentage = {}, relation?: Relation | null, spouseLimit = Infinity): Graph {
  const g = structuredClone(original);
  const old = g.members.find(m => m.id === member.id);
  if (old) Object.assign(old, member); else g.members.push(member);
  const tree = member.tree_id;
  const ensureUnion = (ps: string[]) => {
    if (!ps.length || ps.length > 2) throw new Error('A parenting union must have one or two parents.');
    if (new Set(ps).size !== ps.length) throw new Error('Parents or partners must be different people.');
    let u = g.unions.find(u => same(parents(u), ps));
    if (!u) { u = {id: crypto.randomUUID(), tree_id: tree, partner1_id: ps[0], partner2_id: ps[1] || null, relationship_type: ps.length === 2 ? 'spouse' : 'single_parent', marriage_status: 'unknown'}; g.unions.push(u); }
    return u;
  };
  const link = (child: string, ps: string[], type: string, explicit?: FamilyUnion) => {
    const existing = g.children.filter(c => c.child_id === child && c.relationship_type === type);
    if (existing.length > 1) throw new Error('Ambiguous parentage; review required.');
    const previous = existing[0];
    const previousUnion = previous && g.unions.find(u => u.id === previous.family_union_id);
    if (previous && !previousUnion) throw new Error('Missing existing union.');
    if (previousUnion) {
      const known = parents(previousUnion);
      if (ps.every(id => known.includes(id)) && !explicit) return; // Omitted fields do not remove parents.
      if (!known.every(id => ps.includes(id))) throw new Error('Changing an already-known parent requires review. Existing branches preserved.');
    }
    const u = explicit ? g.unions.find(u => u.id === explicit.id) : ensureUnion(ps);
    if (!u || !same(parents(u), ps)) throw new Error('Selected marriage branch no longer matches. Reload.');
    if (previous) previous.family_union_id = u.id; // Only this child's link; never change siblings' union.
    else g.children.push({id: crypto.randomUUID(), tree_id: tree, family_union_id: u.id, child_id: child, relationship_type: type});
  };
  if (relation && !g.members.some(m => m.id === relation.targetMember.id)) throw new Error('Relative is no longer in this tree.');
  const kind = parentage.relationshipType || 'biological';
  if (relation?.relationType === 'father' || relation?.relationType === 'mother') {
    const current = g.children.filter(c => c.child_id === relation.targetMember.id && c.relationship_type === 'biological');
    const known = current.flatMap(c => parents(g.unions.find(u => u.id === c.family_union_id)!));
    const gender = relation.relationType === 'father' ? 'male' : 'female';
    if (member.gender !== gender) throw new Error('Parent gender does not match the selected role.');
    if (known.some(id => id !== member.id && g.members.find(m => m.id === id)?.gender === gender)) throw new Error('This parent is already recorded.');
    link(relation.targetMember.id, [...new Set([...known, member.id])], 'biological');
  } else if (relation?.relationType === 'child') {
    const ps = relation.union ? parents(relation.union) : [relation.targetMember.id];
    link(member.id, ps, kind, relation.union);
  } else if (relation?.relationType === 'spouse') {
    ensureUnion([relation.targetMember.id, member.id]);
  }
  if (!relation) {
    const ps = [parentage.fatherId, parentage.motherId].filter(Boolean) as string[];
    if (ps.length) link(member.id, ps, kind);
    if (parentage.spouseId) ensureUnion([member.id, parentage.spouseId]);
  }
  validateGraph(g, tree, spouseLimit);
  return g;
}
