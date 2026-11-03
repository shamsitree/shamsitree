import assert from 'node:assert/strict';
import { KinshipEngine } from '../src/utils/kinshipEngine';
import type { FamilyMember, FamilyUnion, FamilyChild } from '../src/types/family';

let passed = 0;
const test = (name: string, fn: () => void) => { fn(); passed++; console.log('PASS', name); };
const member = (id: string, gender: 'male' | 'female' | 'other' = 'male'): FamilyMember => ({id, full_name: id, tree_id: 't', gender});
const union = (id: string, a: string, b: string | null): FamilyUnion => ({id, tree_id:'t',partner1_id:a,partner2_id:b,relationship_type:b?'spouse':'single_parent',marriage_status:'married'});
const link = (u: string, child: string, type = 'biological'): FamilyChild => ({id:u+child,tree_id:'t',family_union_id:u,child_id:child,relationship_type:type});

// Two marriages plus a separate adoptive branch, like the user's demo.
const members = [member('father'),member('mother1','female'),member('mother2','female'),member('son'),member('daughter','female'),member('grandfather'),member('grandmother','female'),member('adoptedSon'),member('adoptiveFather'),member('biologicalDaughter','female'),member('grandson'),member('otherMother','female')];
const unions = [union('one','father','mother1'),union('two','father','mother2'),union('gp','grandfather','grandmother'),union('adoption','adoptiveFather',null),union('bio','adoptiveFather','otherMother'),union('grandchild','biologicalDaughter',null)];
const children = [link('one','son'),link('two','daughter'),link('gp','father'),link('adoption','adoptedSon','adopted'),link('bio','biologicalDaughter'),link('grandchild','grandson')];
const before = JSON.stringify({members,unions,children});
const engine = new KinshipEngine(members,unions,children);
const rel = (a:string,b:string) => engine.calculateRelationship(a,b)!;

test('both biological mothers remain biological mothers',()=>{
  assert.equal(rel('son','mother1').relationshipEn,'Mother');
  assert.equal(rel('daughter','mother2').relationshipEn,'Mother');
});
test('paternal half-sibling labels preserved in both directions',()=>{
  assert.equal(rel('son','daughter').relationshipEn,'Paternal Half-Sister');
  assert.equal(rel('daughter','son').relationshipEn,'Paternal Half-Brother');
});
test('father other wife becomes step-mother without modifying parentage',()=>{
  assert.match(rel('son','mother2').relationshipEn,/^Step-Mother/);
  assert.match(rel('daughter','mother1').relationshipEn,/^Step-Mother/);
  assert.deepEqual(engine.getParents('son').map(x=>x.id),['father','mother1']);
});
test('step-mother reverse relation is step-son or step-daughter',()=>{
  assert.match(rel('mother2','son').relationshipEn,/^Step-Son/);
  assert.match(rel('mother1','daughter').relationshipEn,/^Step-Daughter/);
});
test('step-mother has explicit Urdu and Hindi labels',()=>{
  assert.match(rel('son','mother2').relationshipUr,/سوتیلی/);
  assert.match(rel('son','mother2').relationshipHi,/सौतेली/);
});
test('direct adopted parent/child labels remain unchanged',()=>{
  assert.equal(rel('adoptedSon','adoptiveFather').relationshipEn,'Adoptive Parent');
  assert.equal(rel('adoptiveFather','adoptedSon').relationshipEn,'Adopted Child');
});
test('adoptive siblings are qualified in both directions',()=>{
  assert.equal(rel('biologicalDaughter','adoptedSon').relationshipEn,'Brother (through adoption)');
  assert.equal(rel('adoptedSon','biologicalDaughter').relationshipEn,'Sister (through adoption)');
});
test('indirect maternal uncle and nephew retain adoption qualifier',()=>{
  assert.equal(rel('grandson','adoptedSon').relationshipEn,'Maternal Uncle (Mamu) (through adoption)');
  assert.equal(rel('adoptedSon','grandson').relationshipEn,"Nephew (Sister's son) (through adoption)");
});
test('indirect adoption qualifier appears in Urdu and Hindi',()=>{
  assert.match(rel('grandson','adoptedSon').relationshipUr,/گود/);
  assert.match(rel('grandson','adoptedSon').relationshipHi,/गोद/);
});
test('biological relationships elsewhere remain unqualified',()=>{
  assert.equal(rel('grandson','adoptiveFather').relationshipEn,'Maternal Grandfather');
  assert.equal(rel('son','grandfather').relationshipEn,'Paternal Grandfather');
});
test('foster sibling qualifier is not silently converted to adoption',()=>{
  const e = new KinshipEngine(members,unions,children.map(c=>c.child_id==='adoptedSon'?{...c,relationship_type:'foster'}:c));
  assert.equal(e.calculateRelationship('biologicalDaughter','adoptedSon')!.relationshipEn,'Brother (through foster parentage)');
});
test('two recorded parent sets do not turn adopted siblings into blood half-siblings',()=>{
  const ms=[member('dad'),member('m1','female'),member('m2','female'),member('a'),member('b','female')];
  const e=new KinshipEngine(ms,[union('u1','dad','m1'),union('u2','dad','m2')],[link('u1','a'),link('u2','b','adopted')]);
  const r=e.calculateRelationship('a','b')!;
  assert.equal(r.relationshipEn,'Sister (through adoption)');
  assert.ok(!r.relationshipUr.includes('مائیں مختلف'));
  assert.ok(!r.relationshipHi.includes('माताएं अलग'));
});
test('mother other husband becomes step-father and reverse step-child',()=>{
  const e=new KinshipEngine([member('m','female'),member('h'),member('c','female')],[union('old','m',null),union('new','m','h')],[link('old','c')]);
  assert.match(e.calculateRelationship('c','h')!.relationshipEn,/^Step-Father/);
  assert.match(e.calculateRelationship('h','c')!.relationshipEn,/^Step-Daughter/);
});
test('unrelated person is not inferred as a step-parent',()=>{
  const e=new KinshipEngine([...members,member('stranger','female')],unions,children);
  assert.equal(e.calculateRelationship('son','stranger')!.degreeOfSeparation,-1);
});

const routes: Record<string,[string,string]> = {
  FFF:['پردادا','परदादा'],FFM:['پردادی','परदादी'],FMF:['دادی کے والد','दादी के पिता'],FMM:['دادی کی والدہ','दादी की माता'],
  MFF:['نانا کے والد','नाना के पिता'],MFM:['نانا کی والدہ','नाना की माता'],MMF:['پرنانا','परनाना'],MMM:['پرنانی','परनानी']
};
for (const [route,terms] of Object.entries(routes)) test('three-generation lineage route '+route,()=>{
  const ms=[member('root'),...route.split('').map((g,i)=>member('p'+i,g==='F'?'male':'female'))];
  const us=route.split('').map((_,i)=>union('u'+i,'p'+i,null));
  const cs=route.split('').map((_,i)=>link('u'+i,i===0?'root':'p'+(i-1)));
  const e=new KinshipEngine(ms,us,cs),r=e.calculateRelationship('root','p2')!;
  assert.equal(r.relationshipEn,route.endsWith('F')?'Great-Grandfather':'Great-Grandmother');
  assert.equal(r.relationshipUr,terms[0]);assert.equal(r.relationshipHi,terms[1]);
  assert.equal(r.reverseRelationshipEn,'Great-Grandson');
});
test('more than three generations and gender-neutral ancestors supported',()=>{
  const ms=Array.from({length:7},(_,i)=>member(String(i),i===6?'other':'male'));
  const us=Array.from({length:6},(_,i)=>union('u'+i,String(i+1),null));
  const cs=Array.from({length:6},(_,i)=>link('u'+i,String(i)));
  const e=new KinshipEngine(ms,us,cs);
  assert.equal(e.calculateRelationship('0','6')!.relationshipEn,'Great-Great-Great-Great-Grandparent');
  assert.equal(e.calculateRelationship('6','0')!.relationshipEn,'Great-Great-Great-Great-Grandson');
});
test('great-granddaughter has a female descendant label',()=>{
  const ms=[member('a'),member('b'),member('c'),member('d','female')];
  const e=new KinshipEngine(ms,[union('u1','a',null),union('u2','b',null),union('u3','c',null)],[link('u1','b'),link('u2','c'),link('u3','d')]);
  const r=e.calculateRelationship('a','d')!;
  assert.equal(r.relationshipEn,'Great-Granddaughter');assert.equal(r.relationshipUr,'پڑپوتی');assert.equal(r.relationshipHi,'परपोती');
});
test('adoption is retained across a great-grandparent path',()=>{
  const ms=[member('a'),member('b'),member('c'),member('d')];
  const e=new KinshipEngine(ms,[union('u1','a',null),union('u2','b',null),union('u3','c',null)],[link('u1','b'),link('u2','c','adopted'),link('u3','d')]);
  assert.equal(e.calculateRelationship('d','a')!.relationshipEn,'Great-Grandfather (through adoption)');
  assert.equal(e.calculateRelationship('a','d')!.relationshipEn,'Great-Grandson (through adoption)');
});
test('every demo pair remains reciprocal and no input records are mutated',()=>{
  for(const a of members)for(const b of members){const r=rel(a.id,b.id),reverse=rel(b.id,a.id);assert.equal(r.reverseRelationshipEn,reverse.relationshipEn);}
  assert.equal(JSON.stringify({members,unions,children}),before);
});
console.log(`${passed} new kinship label checks passed`);
