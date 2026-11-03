import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import assert from 'node:assert/strict';
import {SAMPLE_MEMBERS} from '../src/data/sampleFamily';
import {getFilteredMembers} from '../src/utils/treeLayout';
import {firstStudioMembers,selectStudioMembers} from '../src/utils/studioSelection';
import {TREE_STYLES} from '../src/components/tree-styles/styleRegistry';
const real=Object.values(SAMPLE_MEMBERS).map((p,i)=>({...p,id:'authorized-'+i,parentIds:[],spouses:[],fatherId:undefined,motherId:undefined}));
const ids=firstStudioMembers(real,50);assert.equal(selectStudioMembers(real,ids).length,50);
const map=Object.fromEntries(real.map(p=>[p.id,p]));const before=JSON.stringify(map);
const filtered=getFilteredMembers(map,{startPersonId:'',selectedMemberIds:ids,generationLimit:'all',activeMarriageBranches:{},includeSpouses:false,includeBridgeAncestors:false});
assert.equal(Object.keys(filtered.filtered).length,50);assert.equal(JSON.stringify(map),before);assert.ok(filtered.isDisconnected);
assert.equal(Object.keys(getFilteredMembers(map,{startPersonId:'',selectedMemberIds:[],generationLimit:'all',activeMarriageBranches:{},includeBridgeAncestors:false}).filtered).length,0);
const files=['ClassicGenealogyTree','NaturalLivingTree','RoyalHeritageTree','PhotoAlbumTree','CircularAncestryTree','FanChartTree','ModernMinimalistTree','TimelineFamilyTree','IslamicGeometricTree','StarryNightTree','VintageScrollTree','HorizontalLineageTree','InteractiveNetworkTree'];
assert.equal(TREE_STYLES.length,13);
for(const name of files){const m=await import('../src/components/tree-styles/'+name+'.tsx');const C=m[name];assert.ok(C,name);const html=renderToStaticMarkup(<C members={SAMPLE_MEMBERS} bridgeIds={new Set()} onSelectPerson={()=>{}}/>);assert.ok(html.length>100,name);if(name==='NaturalLivingTree'){const cards=[...html.matchAll(/<foreignObject[^>]*x="([^"]+)"[^>]*y="([^"]+)"[^>]*width="190"[^>]*height="90"/g)].map(m=>({x:Number(m[1]),y:Number(m[2])}));assert.equal(cards.length,100);for(let a=0;a<cards.length;a++)for(let b=a+1;b<cards.length;b++)assert.ok(Math.abs(cards[a].x-cards[b].x)>=190||Math.abs(cards[a].y-cards[b].y)>=90,'Natural tree cards overlap');}if(name==='ClassicGenealogyTree')assert.ok(html.includes('max-width:none'),'large tree must retain natural size');console.log('PASS render supplied style',name);}
console.log('PASS real-ID 100-to-50 selection, clear, disconnected groups and no mutation');

const {NaturalLivingTree}=await import('../src/components/tree-styles/NaturalLivingTree');
const natural=renderToStaticMarkup(<NaturalLivingTree members={SAMPLE_MEMBERS} bridgeIds={new Set()} onSelectPerson={()=>{}}/>);
for(const child of Object.values(SAMPLE_MEMBERS))for(const parent of child.parentIds){if(SAMPLE_MEMBERS[parent])assert.ok(natural.includes(`data-parent-id="${parent}" data-child-id="${child.id}"`),`missing natural parent edge ${parent}->${child.id}`);}
const {CircularAncestryTree}=await import('../src/components/tree-styles/CircularAncestryTree');
const circular=renderToStaticMarkup(<CircularAncestryTree members={SAMPLE_MEMBERS} bridgeIds={new Set()} onSelectPerson={()=>{}}/>);
const positions=[...circular.matchAll(/<foreignObject[^>]*x="([^"]+)"[^>]*y="([^"]+)"/g)].map(m=>m[1]+','+m[2]);assert.equal(positions.length,100);assert.equal(new Set(positions).size,100);
const {FanChartTree}=await import('../src/components/tree-styles/FanChartTree');
const sixth={...Object.values(SAMPLE_MEMBERS)[0],id:'sixth-test',firstName:'BeyondFive',lastName:'Regression',generation:6,parentIds:[],spouses:[]};
assert.ok(renderToStaticMarkup(<FanChartTree members={{...SAMPLE_MEMBERS,[sixth.id]:sixth}} bridgeIds={new Set()} onSelectPerson={()=>{}}/>).includes('BeyondFive'));
console.log('PASS every natural parent edge, 100 distinct radial positions and sixth-generation fan member');
