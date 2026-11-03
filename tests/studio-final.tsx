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
for(const name of files){const m=await import('../src/components/tree-styles/'+name+'.tsx');const C=m[name];assert.ok(C,name);const html=renderToStaticMarkup(<C members={SAMPLE_MEMBERS} bridgeIds={new Set()} onSelectPerson={()=>{}}/>);assert.ok(html.length>100,name);if(name==='ClassicGenealogyTree')assert.ok(html.includes('max-width:none'),'large tree must retain natural size');console.log('PASS render supplied style',name);}
console.log('PASS real-ID 100-to-50 selection, clear, disconnected groups and no mutation');
