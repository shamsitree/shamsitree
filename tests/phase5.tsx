import React,{useState} from 'react';
import {create,act} from 'react-test-renderer';
import assert from 'node:assert/strict';
import {parseDateInput,displayDate,validISODate,validateLifeDates,todayISO} from '../src/utils/dateInput';
import {localPlaces,isLocalityQuery,photonPlaces,searchPlaces} from '../src/utils/placeSearch';
import {SmartDateInput} from '../src/components/form/SmartDateInput';
import {PlaceAutocomplete} from '../src/components/form/PlaceAutocomplete';
import {FamilyTreeViewer} from '../src/components/FamilyTreeViewer';
import {sampleFamily,restoreSample,SANDBOX_KEY} from '../src/data/phase5Family';
import {saveSandboxMember} from '../src/utils/sandboxSave';
import {indexFamily,familyScene} from '../src/utils/familyViewModel';
import {KinshipEngine} from '../src/utils/kinshipEngine';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
let passed=0;
async function test(name:string,fn:()=>unknown){await fn();passed++;console.log('PASS Phase5',name);}
await test('manual Indian dates preserve ISO calendar day',()=>{assert.equal(parseDateInput('19/04/1980').iso,'1980-04-19');assert.equal(displayDate('1980-04-19'),'19/04/1980');assert.equal(parseDateInput('1-2-2000').iso,'2000-02-01');});
await test('leap-year and invalid dates reject rollover',()=>{assert.ok(validISODate('2000-02-29'));assert.ok(!validISODate('1900-02-29'));assert.ok(!validISODate('2025-02-29'));assert.ok(parseDateInput('31/04/2000').error);assert.ok(parseDateInput('01/01/0000').error);});
await test('clear, partial input and date restrictions',()=>{assert.equal(parseDateInput('').iso,'');assert.ok(parseDateInput('19/04/19').error);assert.ok(validateLifeDates('2000-01-01','1999-12-31','2026-11-03'));assert.ok(validateLifeDates('2030-01-01','','2026-11-03'));assert.equal(validateLifeDates('2000-01-01','2000-01-01','2026-11-03'),'');assert.equal(todayISO(new Date(2020,0,2)),'2020-01-02');});
await test('typed, calendar and clear controls share one date value',async()=>{
 let value='',error='',view:any;
 const update=(v:string)=>{value=v;view.update(<SmartDateInput label="Birth" value={value} max="2026-11-03" onChange={update} onErrorChange={v=>{error=v;}}/>);};
 await act(async()=>{view=create(<SmartDateInput label="Birth" value="" max="2026-11-03" onChange={update} onErrorChange={v=>{error=v;}}/>);});
 await act(async()=>view.root.findByProps({'aria-label':'Birth'}).props.onChange({target:{value:'29/02/2000',setCustomValidity(){}}}));assert.equal(value,'2000-02-29');
 await act(async()=>view.root.findByProps({'aria-label':'Birth'}).props.onChange({target:{value:'31/02/2000',setCustomValidity(){}}}));assert.ok(error);assert.equal(value,'2000-02-29');
 await act(async()=>view.root.findByProps({'aria-label':'Birth calendar'}).props.onChange({target:{value:'2001-03-04'}}));assert.equal(value,'2001-03-04');assert.equal(error,'');
 await act(async()=>view.root.findByProps({'aria-label':'Clear Birth'}).props.onClick());assert.equal(value,'');await act(async()=>view.unmount());
});
await test('Rampur is ambiguous and Uttar Pradesh suggestion is available offline',()=>{const places=localPlaces('Rampur');assert.ok(places.some(p=>p.label==='Rampur, Uttar Pradesh, India'));assert.ok(places.length>=2);assert.ok(localPlaces('London').length);});
await test('private street numbers/emails never trigger online place requests',async()=>{assert.ok(!isLocalityQuery('12 Main Street, Delhi'));assert.ok(!isLocalityQuery('name@example.com'));let calls=0;assert.deepEqual(await searchPlaces('12 Main Street',new AbortController().signal,(async()=>{calls++;}) as any),[]);assert.equal(calls,0);});
await test('Photon labels deduplicate locality parts and reject premises',()=>{const rows=photonPlaces({features:[{properties:{name:'Rampur',city:'Rampur',state:'Uttar Pradesh',country:'India',osm_id:1,osm_type:'R',osm_key:'place'}},{properties:{name:'Home',housenumber:'12'}},{properties:{name:'Shop',osm_key:'shop'}}]});assert.equal(rows.length,1);assert.equal(rows[0].label,'Rampur, Uttar Pradesh, India');assert.deepEqual(photonPlaces(null),[]);});
await test('provider errors are visible, not silently accepted',async()=>{await assert.rejects(()=>searchPlaces('Uncached Place Alpha',new AbortController().signal,(async()=>({ok:false})) as any),/unavailable/);});
await test('place selection works with keyboard and keeps arbitrary manual input',async()=>{
 let view:any,chosen='';function Harness(){const [value,setValue]=useState('');return <PlaceAutocomplete label="Place" value={value} onChange={v=>{chosen=v;setValue(v);}}/>;}
 await act(async()=>{view=create(<Harness/>);});let input=()=>view.root.findByProps({role:'combobox'});
 await act(async()=>input().props.onChange({target:{value:'Rampur'}}));assert.ok(view.root.findAllByProps({role:'option'}).length>=2);
 await act(async()=>input().props.onKeyDown({key:'ArrowDown',preventDefault(){}}));
 await act(async()=>input().props.onKeyDown({key:'Enter',preventDefault(){}}));assert.equal(chosen,'Rampur, Uttar Pradesh, India');
 await act(async()=>input().props.onChange({target:{value:'My custom address with no match'}}));assert.equal(chosen,'My custom address with no match');await act(async()=>view.unmount());
});
await test('online lookup is opt-in, debounced and aborts on unmount',async()=>{
 const original=globalThis.fetch;let calls=0,signal:AbortSignal|undefined,view:any;
 globalThis.fetch=(async(_url:any,options:any)=>{calls++;signal=options.signal;return new Promise(()=>{});}) as any;
 function Harness(){const [v,setV]=useState('Unknown Village');return <PlaceAutocomplete label="Online" value={v} onChange={setV}/>;}
 try{await act(async()=>{view=create(<Harness/>);});assert.equal(calls,0);
 await act(async()=>view.root.findByProps({type:'checkbox'}).props.onChange({target:{checked:true}}));assert.equal(calls,0);
 await act(async()=>{await new Promise(r=>setTimeout(r,440));});assert.equal(calls,1);
 await act(async()=>view.unmount());assert.ok(signal?.aborted);
 }finally{globalThis.fetch=original;}
});
const fixture=sampleFamily(),initial=JSON.stringify(fixture);
await test('same shared model keeps both mandatory marriage branches separate',()=>{
 const scene=familyScene(indexFamily(fixture.members,fixture.unions,fixture.children),'anwar');
 assert.deepEqual(scene.branches.find(b=>b.spouse?.id==='ruhi1')!.kids.map(k=>k.member.id),['ghani']);
 assert.deepEqual(scene.branches.find(b=>b.spouse?.id==='ruhi2')!.kids.map(k=>k.member.id),['sidra']);
 assert.equal(new KinshipEngine(fixture.members,fixture.unions,fixture.children).calculateRelationship('ghani','sidra')!.relationshipEn,'Paternal Half-Sister');
});
await test('three actual designs retain focus, callback branch and original data',async()=>{
 let view:any,selected='';await act(async()=>{view=create(<FamilyTreeViewer {...fixture} currentUserId="sample-owner" language="en" onSelectMember={()=>{}} onAddRelative={(_m,_r,u)=>{selected=u?.id||'';}} onOpenAddMember={()=>{}}/>);});
 for(const [button,mode] of [['Classic','classic'],['Heritage','heritage'],['Family Album','album']]){
 await act(async()=>view.root.findAll((n:any)=>n.type==='button'&&n.children.includes(button))[0].props.onClick());
 assert.ok(view.root.findAllByProps({'data-view':mode}).length);assert.equal(view.root.findByProps({'aria-label':'Focus Person'}).props.value,'anwar');
 const branches=view.root.findAll((n:any)=>n.type==='article'&&n.props['data-union-id']);assert.equal(branches.length,2);
 const branch=branches.find((n:any)=>n.props['data-union-id']==='marriage2');const add=branch.findAll((n:any)=>n.type==='button'&&n.findAll((x:any)=>x.type==='span'&&x.children[0]==='Add Child').length)[0];await act(async()=>add.props.onClick());assert.equal(selected,'marriage2');
 }
 assert.equal(JSON.stringify(fixture),initial);await act(async()=>view.unmount());
});
await test('preview save, edit, reload and half-sibling persistence use only local snapshots',()=>{
 const next=saveSandboxMember(fixture,{id:'test-child',full_name:'Preview child',gender:'male',date_of_birth:'2020-02-29',birthplace:'Rampur, Uttar Pradesh, India'},{},{targetMember:fixture.members[0],relationType:'child',union:fixture.unions.find(u=>u.id==='marriage2')});
 const restored=restoreSample(JSON.stringify(next));assert.ok(restored.members.some(m=>m.id==='test-child'));
 assert.equal(restored.children.find(c=>c.child_id==='test-child')!.family_union_id,'marriage2');
 const edited=saveSandboxMember(restored,{id:'test-child',full_name:'Edited preview child',gender:'male'});
 assert.equal(edited.children.find(c=>c.child_id==='test-child')!.family_union_id,'marriage2');assert.equal(JSON.stringify(fixture),initial);
 assert.equal(new KinshipEngine(edited.members,edited.unions,edited.children).calculateRelationship('ghani','sidra')!.relationshipEn,'Paternal Half-Sister');
 assert.equal(SANDBOX_KEY,'shamsitree.phase5.sample.v1');assert.equal(restoreSample('{broken').members.length,fixture.members.length);
});
await test('large-family scene is bounded and indexing is linear',()=>{
 const family=sampleFamily();for(let i=0;i<1200;i++){family.members.push({id:'large'+i,tree_id:'phase5-sample',full_name:'Large sample '+i,gender:'male'});family.children.push({id:'cl'+i,tree_id:'phase5-sample',family_union_id:'marriage1',child_id:'large'+i,relationship_type:'biological'});}
 const start=performance.now();const index=indexFamily(family.members,family.unions,family.children);const scene=familyScene(index,'anwar',2,20);const elapsed=performance.now()-start;
 assert.equal(scene.branches.find(b=>b.union.id==='marriage1')!.kids.length,20);assert.equal(scene.branches.find(b=>b.union.id==='marriage1')!.total,1201);assert.ok(elapsed<1000);console.log(`PERF 1209 members: index + bounded scene ${elapsed.toFixed(2)} ms`);
});
console.log(`${passed} Phase 5 checks passed`);
