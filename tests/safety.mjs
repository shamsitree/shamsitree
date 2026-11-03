import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import assert from 'node:assert/strict';
const load = (file, symbol) => {
 const source = readFileSync(new URL('../'+file, import.meta.url),'utf8').replace(/^import .*;\s*$/mg,'').replace(/export /g,'');
 return new Function(stripTypeScriptTypes(source)+'; return '+symbol)();
};
const loadAllRows = load('src/utils/loadAllRows.ts','loadAllRows');
const Engine = load('src/utils/kinshipEngine.ts','KinshipEngine');
let passed=0;
async function test(name, fn){await fn(); console.log('PASS:', name);passed++;}
const m=id=>({id,tree_id:'t',full_name:id,gender:'male'});
const u={id:'u',tree_id:'t',partner1_id:'p',partner2_id:null,relationship_type:'single_parent'};
const link=type=>({id:'l',tree_id:'t',family_union_id:'u',child_id:'c',relationship_type:type});
for (const [type,parent,child] of [['biological','Father','Son'],['adopted','Adoptive Parent','Adopted Child'],['foster','Foster Parent','Foster Child'],['step','Step-Parent','Step-Child']]) {
 await test(type+' direct labels in both directions',()=>{
 const e=new Engine([m('p'),m('c')],[u],[link(type)]);
 assert.equal(e.calculateRelationship('c','p').relationshipEn,parent);
 assert.equal(e.calculateRelationship('p','c').relationshipEn,child);
 });
}
await test('unconnected people stay unconnected',()=>assert.equal(new Engine([m('a'),m('b')],[],[]).calculateRelationship('a','b').degreeOfSeparation,-1));
await test('pagination loads all pages in id order',async()=>{
 const data=Array.from({length:1201},(_,id)=>({id}));let pages=0;
 const result=await loadAllRows(()=>({order(key,opts){assert.equal(key,'id');assert.equal(opts.ascending,true);return this;},async range(a,b){pages++;return {data:data.slice(a,b+1),error:null};}}));
 assert.equal(result.length,1201);assert.equal(pages,3);assert.equal(result[1200].id,1200);
});
await test('empty dataset',async()=>assert.deepEqual(await loadAllRows(()=>({order(){return this},async range(){return {data:[],error:null}}})),[]));
await test('later page failure rejects partial snapshot',async()=>{
 let calls=0;await assert.rejects(()=>loadAllRows(()=>({order(){return this},async range(){return ++calls===1?{data:[1,2],error:null}:{data:null,error:new Error('offline')}}}),2),/offline/);
});
await test('invalid response rejected',async()=>await assert.rejects(()=>loadAllRows(()=>({order(){return this},async range(){return {data:null,error:null}}})),/Invalid database response/));
await test('invalid page size rejected',async()=>await assert.rejects(()=>loadAllRows(()=>{},0),/Invalid page size/));
console.log(`${passed} checks passed. No live database operations executed.`);
const validate=load('src/utils/validateParentage.ts','validateParentage');
const people=['Abdul Mannan','Anwar Kamal','Ruhi Kamal','Ruhi Fakhir','Abdul Ghani','Sidra Kamal'].map((id,i)=>({...m(id),gender:[2,3,5].includes(i)?'female':'male'}));
const unions=[{...u,id:'ancestor',partner1_id:'Abdul Mannan'}, {...u,id:'marriage1',partner1_id:'Anwar Kamal',partner2_id:'Ruhi Kamal',relationship_type:'spouse'}, {...u,id:'marriage2',partner1_id:'Anwar Kamal',partner2_id:'Ruhi Fakhir',relationship_type:'spouse'}];
const children=[['ancestor','Anwar Kamal'],['marriage1','Abdul Ghani'],['marriage2','Sidra Kamal']].map(([family_union_id,child_id],i)=>({id:String(i),tree_id:'t',family_union_id,child_id,relationship_type:'biological'}));
const engine=new Engine(people,unions,children);
await test('Anwar example paternal half siblings both directions',()=>{
 assert.equal(engine.calculateRelationship('Abdul Ghani','Sidra Kamal').relationshipEn,'Paternal Half-Sister');
 assert.equal(engine.calculateRelationship('Sidra Kamal','Abdul Ghani').relationshipEn,'Paternal Half-Brother');
});
await test('Anwar children keep correct distinct mothers',()=>{
 assert.deepEqual(engine.getParents('Abdul Ghani').map(p=>p.id),['Anwar Kamal','Ruhi Kamal']);
 assert.deepEqual(engine.getParents('Sidra Kamal').map(p=>p.id),['Anwar Kamal','Ruhi Fakhir']);
});
await test('wrong mother assignment rejected without mutating unions',()=>{
 const before=JSON.stringify({unions,children});
 assert.throws(()=>validate('Abdul Ghani',['Anwar Kamal','Ruhi Fakhir'],unions,children),/atomic/);
 assert.equal(JSON.stringify({unions,children}),before);
});
await test('ancestor cycle rejected',()=>assert.throws(()=>validate('Abdul Mannan',['Abdul Ghani'],unions,children),/circular/));
await test('self parent rejected',()=>assert.throws(()=>validate('Abdul Ghani',['Abdul Ghani'],unions,children),/own parent/));
await test('same person in both parent slots rejected',()=>assert.throws(()=>validate('new',['Anwar Kamal','Anwar Kamal'],unions,children),/different/));
console.log('FINAL:',passed,'checks passed');
