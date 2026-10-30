import type { FamilyTree, FamilyMember, FamilyUnion, FamilyChild } from '../types/family';
// Fictional labels only; these records exist in memory, never in Supabase.
export const previewUser = { id: 'preview-owner', email: 'preview@example.invalid' };
export const previewTree: FamilyTree = { id: 'preview-tree', owner_user_id: previewUser.id, name: 'Sample family — visual preview only', tree_code: 'PREVIEW-ONLY' };
export const previewMembers: FamilyMember[] = [
 ['p1','Sample Parent','male'], ['p2','Sample Spouse A','female'],
 ['p3','Sample Spouse B','female'], ['p4','Sample Child A','male'],
 ['p5','Sample Child B','female'], ['p6','Sample Grandparent','male']
].map(([id,full_name,gender]) => ({ id, full_name, gender: gender as FamilyMember['gender'], tree_id: previewTree.id, notes: 'Fictional preview record. Not a real family member.' }));
export const previewUnions: FamilyUnion[] = [
 {id:'u1',tree_id:previewTree.id,partner1_id:'p1',partner2_id:'p2',relationship_type:'spouse',marriage_status:'married'},
 {id:'u2',tree_id:previewTree.id,partner1_id:'p1',partner2_id:'p3',relationship_type:'spouse',marriage_status:'married'},
 {id:'u3',tree_id:previewTree.id,partner1_id:'p6',partner2_id:null,relationship_type:'single_parent',marriage_status:'unknown'}
];
export const previewChildren: FamilyChild[] = [['u1','p4'],['u2','p5'],['u3','p1']].map(([family_union_id,child_id],i)=>({id:'c'+i,tree_id:previewTree.id,family_union_id,child_id,relationship_type:'biological'}));
