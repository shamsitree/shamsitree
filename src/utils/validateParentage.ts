import type { FamilyUnion, FamilyChild } from '../types/family';
/** Validate an intended biological parent assignment without mutating records. */
export function validateParentage(childId: string, parentIds: string[], unions: FamilyUnion[], children: FamilyChild[]) {
  if (new Set(parentIds).size !== parentIds.length) throw new Error('Father and mother must be different people.');
  if (parentIds.includes(childId)) throw new Error('A person cannot be their own parent.');
  const descendants = new Set<string>();
  const queue = [childId];
  while (queue.length) {
    const id = queue.pop()!;
    for (const u of unions.filter(u => u.partner1_id === id || u.partner2_id === id)) {
      for (const link of children.filter(c => c.family_union_id === u.id)) {
        if (!descendants.has(link.child_id)) { descendants.add(link.child_id); queue.push(link.child_id); }
      }
    }
  }
  if (parentIds.some(id => descendants.has(id))) throw new Error('This would create circular ancestry.');
  const links = children.filter(c => c.child_id === childId);
  for (const link of links) {
    const u = unions.find(u => u.id === link.family_union_id);
    if (!u) throw new Error('Existing parentage is incomplete; reload and review it.');
    const existing = [u.partner1_id, u.partner2_id].filter(Boolean);
    if (parentIds.some(id => !existing.includes(id))) throw new Error('Changing existing parentage requires an atomic relationship update. Existing records were preserved.');
  }
}
