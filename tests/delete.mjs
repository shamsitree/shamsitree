import {readFileSync} from 'node:fs';import {stripTypeScriptTypes} from 'node:module';import assert from 'node:assert/strict';
const source=stripTypeScriptTypes(readFileSync(new URL('../src/utils/safeMemberDelete.ts',import.meta.url),'utf8')).replace('export ','');
const remove=new Function(source+';return safeMemberDelete')();
let n=0;
for(const scenario of ['parent','child','read-error','no-row','success']){
 let writes=0;
 const client={from(table){const q={select(){return q},eq(){return q},or(){return q},limit(){return q},delete(){writes++;return q},then(resolve){resolve(table==='family_members'?{data:scenario==='no-row'?[]:[{id:'x'}]}:{data:(scenario==='parent'&&table==='family_unions')||(scenario==='child'&&table==='family_children')?[{id:'r'}]:[],error:scenario==='read-error'?new Error('offline'):null})}};return q}};
 if(scenario==='success')await remove(client,'t','x');else await assert.rejects(()=>remove(client,'t','x'));
 assert.equal(writes,['success','no-row'].includes(scenario)?1:0);console.log('PASS deletion',scenario);n++;
}
console.log(n,'delete checks passed');
