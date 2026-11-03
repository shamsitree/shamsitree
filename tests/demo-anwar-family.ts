import assert from 'node:assert/strict';
import { KinshipEngine } from '../src/utils/kinshipEngine';
import { validateParentage } from '../src/utils/validateParentage';
import type { FamilyMember, FamilyUnion, FamilyChild } from '../src/types/family';

// Realistic Anwar Kamal Demo Family structure
const treeId = 'test_tree_anwar_123';

const members: FamilyMember[] = [
  { id: 'abdul_mannan', tree_id: treeId, full_name: 'Abdul Mannan', gender: 'male', notes: 'Father of Anwar Kamal' },
  { id: 'ayesha_begum', tree_id: treeId, full_name: 'Ayesha Begum', gender: 'female', notes: 'Mother of Anwar Kamal' },
  { id: 'anwar_kamal', tree_id: treeId, full_name: 'Anwar Kamal', gender: 'male', notes: '[Family Role: Self] Main Person' },
  { id: 'ruhi_kamal', tree_id: treeId, full_name: 'Ruhi Kamal', gender: 'female', notes: 'First wife of Anwar Kamal' },
  { id: 'abdul_ghani', tree_id: treeId, full_name: 'Abdul Ghani', gender: 'male', notes: 'Child of first marriage' },
  { id: 'ruhi_fakhir', tree_id: treeId, full_name: 'Ruhi Fakhir', gender: 'female', notes: 'Second wife of Anwar Kamal' },
  { id: 'sidrah_kamal', tree_id: treeId, full_name: 'Sidrah Kamal', gender: 'female', notes: 'Child of second marriage' }
];

const unions: FamilyUnion[] = [
  // Parents of Anwar
  {
    id: 'union_parents',
    tree_id: treeId,
    partner1_id: 'abdul_mannan',
    partner2_id: 'ayesha_begum',
    relationship_type: 'spouse',
    marriage_status: 'married'
  },
  // First marriage: Anwar + Ruhi Kamal
  {
    id: 'union_marriage_1',
    tree_id: treeId,
    partner1_id: 'anwar_kamal',
    partner2_id: 'ruhi_kamal',
    relationship_type: 'spouse',
    marriage_status: 'married'
  },
  // Second marriage: Anwar + Ruhi Fakhir
  {
    id: 'union_marriage_2',
    tree_id: treeId,
    partner1_id: 'anwar_kamal',
    partner2_id: 'ruhi_fakhir',
    relationship_type: 'spouse',
    marriage_status: 'married'
  }
];

const children: FamilyChild[] = [
  // Anwar is child of Abdul Mannan & Ayesha Begum
  {
    id: 'child_link_anwar',
    tree_id: treeId,
    family_union_id: 'union_parents',
    child_id: 'anwar_kamal',
    relationship_type: 'biological'
  },
  // Abdul Ghani is child of Marriage 1 (Anwar & Ruhi Kamal)
  {
    id: 'child_link_ghani',
    tree_id: treeId,
    family_union_id: 'union_marriage_1',
    child_id: 'abdul_ghani',
    relationship_type: 'biological'
  },
  // Sidrah Kamal is child of Marriage 2 (Anwar & Ruhi Fakhir)
  {
    id: 'child_link_sidrah',
    tree_id: treeId,
    family_union_id: 'union_marriage_2',
    child_id: 'sidrah_kamal',
    relationship_type: 'biological'
  }
];

console.log('--- Testing Anwar Kamal Demo Family ---');

const engine = new KinshipEngine(members, unions, children);

// 1. Verify Parents of Anwar Kamal
const anwarParents = engine.getParents('anwar_kamal');
assert.equal(anwarParents.length, 2, 'Anwar must have exactly 2 parents');
const parentNames = anwarParents.map(p => p.full_name).sort();
assert.deepEqual(parentNames, ['Abdul Mannan', 'Ayesha Begum']);
console.log('✓ PASS: Both parents of Anwar Kamal (Abdul Mannan & Ayesha Begum) display correctly');

// 2. Verify Spouses of Anwar Kamal
const anwarSpouses = engine.getSpouses('anwar_kamal');
assert.equal(anwarSpouses.length, 2, 'Anwar must have 2 distinct spouses');
const spouseNames = anwarSpouses.map(s => s.full_name).sort();
assert.deepEqual(spouseNames, ['Ruhi Fakhir', 'Ruhi Kamal']);
console.log('✓ PASS: Both wives appear separately (Ruhi Kamal & Ruhi Fakhir)');

// 3. Verify Abdul Ghani belongs strictly to first marriage
const ghaniParents = engine.getParents('abdul_ghani').map(p => p.full_name).sort();
assert.deepEqual(ghaniParents, ['Anwar Kamal', 'Ruhi Kamal']);
const ghaniMother = engine.getParents('abdul_ghani').find(p => p.gender === 'female');
assert.equal(ghaniMother?.full_name, 'Ruhi Kamal');
console.log('✓ PASS: Abdul Ghani belongs to first marriage branch (Anwar + Ruhi Kamal)');

// 4. Verify Sidrah Kamal belongs strictly to second marriage
const sidrahParents = engine.getParents('sidrah_kamal').map(p => p.full_name).sort();
assert.deepEqual(sidrahParents, ['Anwar Kamal', 'Ruhi Fakhir']);
const sidrahMother = engine.getParents('sidrah_kamal').find(p => p.gender === 'female');
assert.equal(sidrahMother?.full_name, 'Ruhi Fakhir');
console.log('✓ PASS: Sidrah Kamal belongs to second marriage branch (Anwar + Ruhi Fakhir)');

// 5. Verify Kinship relationships between children (Paternal Half-Siblings)
const ghaniToSidrah = engine.calculateRelationship('abdul_ghani', 'sidrah_kamal');
assert.ok(ghaniToSidrah, 'Relationship must exist between Ghani and Sidrah');
assert.equal(ghaniToSidrah.relationshipEn, 'Paternal Half-Sister');
console.log('✓ PASS: Abdul Ghani recognizes Sidrah Kamal as Paternal Half-Sister');

const sidrahToGhani = engine.calculateRelationship('sidrah_kamal', 'abdul_ghani');
assert.ok(sidrahToGhani, 'Relationship must exist between Sidrah and Ghani');
assert.equal(sidrahToGhani.relationshipEn, 'Paternal Half-Brother');
console.log('✓ PASS: Sidrah Kamal recognizes Abdul Ghani as Paternal Half-Brother');

// 6. Verify Grandfather / Grandchild relationship
const mannanToGhani = engine.calculateRelationship('abdul_mannan', 'abdul_ghani');
assert.ok(mannanToGhani, 'Relationship must exist between Mannan and Ghani');
assert.ok(mannanToGhani.relationshipEn.includes('Grandson'), 'Must be Grandson');
console.log('✓ PASS: Abdul Mannan recognizes Abdul Ghani as ' + mannanToGhani.relationshipEn);

// 7. Verify cycle rejection and safety guards
assert.throws(() => {
  validateParentage('abdul_mannan', ['abdul_ghani'], unions, children);
}, /circular/);
console.log('✓ PASS: Circular ancestry rejected (Abdul Mannan cannot have grandson as parent)');

// 8. Verify editing member without modifying relations preserves everything
const updatedGhani: FamilyMember = { ...members[4], phone: '+92 300 1234567', birthplace: 'Lahore' };
const updatedMembers = members.map(m => m.id === updatedGhani.id ? updatedGhani : m);
const newEngine = new KinshipEngine(updatedMembers, unions, children);
const relAfterEdit = newEngine.calculateRelationship('abdul_ghani', 'sidrah_kamal');
assert.ok(relAfterEdit, 'Relationship must exist after edit');
assert.equal(relAfterEdit.relationshipEn, 'Paternal Half-Sister');
console.log('✓ PASS: Editing a member preserves all relationship integrity');

console.log('ALL ANWAR KAMAL DEMO FAMILY CHECKS PASSED SUCCESSFULLY!');
