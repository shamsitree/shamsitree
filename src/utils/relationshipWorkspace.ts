/** Isolated reference implementation. Never writes to Supabase. */
export type Person = {id:string; tree:string; name:string};
export type Union = {id:string; tree:string; parents:string[]; kind:'biological'|'adopted'|'foster'|'step'; children:string[]};
export type Proposal = {id:string; from:string; to:string; parent:string; child:string; status:'pending'|'approved'|'rejected'|'cancelled'; kind:Union['kind']};
export type Snapshot = {version:number; people:Person[]; unions:Union[]; owners:Record<string,string>; proposals:Proposal[]; receipts:Record<string,string>};
export type Command =
 | {type:'person'; person:Person}
 | {type:'parentage'; child:string; union:Union}
 | {type:'propose'; proposal:Proposal}
 | {type:'decision'; id:string; decision:'approved'|'rejected'|'cancelled'};
const fail=(message:string):never=>{throw new Error(message)};
export function parentsOf(s:Snapshot, child:string, kind:Union['kind']='biological'):string[]{
 return [...new Set([...s.unions.filter(u=>u.kind===kind&&u.children.includes(child)).flatMap(u=>u.parents),...s.proposals.filter(p=>p.status==='approved'&&p.kind===kind&&p.child===child).map(p=>p.parent)])];
}
export function validate(s:Snapshot){
 const ids=new Set(s.people.map(p=>p.id));
 if(ids.size!==s.people.length)fail('Duplicate person ID');
 if(new Set(s.unions.map(u=>u.id)).size!==s.unions.length)fail('Duplicate union ID');
 for(const u of s.unions){
  if(!u.parents.length||u.parents.length>2||new Set(u.parents).size!==u.parents.length)fail('Invalid parents');
  if(new Set(u.children).size!==u.children.length)fail('Duplicate child');
  for(const id of [...u.parents,...u.children])if(!s.people.some(p=>p.id===id&&p.tree===u.tree))fail('Cross-tree union or missing person');
 }
 for(const p of s.people){
  for(const kind of ['biological','adopted','foster','step'] as const){
   if(s.unions.filter(u=>u.kind===kind&&u.children.includes(p.id)).length>1)fail('Multiple unions for same parentage type');
  }
  if(parentsOf(s,p.id).length>2)fail('Too many biological parents');
  const spouses=new Set(s.unions.filter(u=>u.parents.includes(p.id)&&u.parents.length===2).flatMap(u=>u.parents.filter(id=>id!==p.id)));
  if(spouses.size>3)fail('Maximum three partners');
 }
 const visiting=new Set<string>(),done=new Set<string>();
 function walk(id:string){
  if(visiting.has(id))fail('Circular ancestry'); if(done.has(id))return;
  visiting.add(id);
  const parents=[...s.unions.filter(u=>u.children.includes(id)).flatMap(u=>u.parents),...s.proposals.filter(p=>p.status==='approved'&&p.child===id).map(p=>p.parent)];
  for(const parent of parents)walk(parent);
  visiting.delete(id);done.add(id);
 }
 for(const id of ids)walk(id);
}
export function applyCommand(original:Snapshot, actor:string, expectedVersion:number, requestId:string, command:Command):Snapshot {
 if(!requestId||!actor)fail('Identity and request ID required');
 const fingerprint=JSON.stringify({actor,command});
 if(original.receipts[requestId]){
  if(original.receipts[requestId]!==fingerprint)fail('Request ID reused for a different command');
  return original;
 }
 if(original.version!==expectedVersion)fail('Concurrent update: reload');
 const s:Snapshot=structuredClone(original);
 const own=(tree:string)=>{if(s.owners[tree]!==actor)fail('Not authorized')};
 if(command.type==='person'){
  own(command.person.tree);
  if(!command.person.name.trim())fail('Name required');
  const old=s.people.find(p=>p.id===command.person.id);
  if(old&&old.tree!==command.person.tree)fail('Person ownership cannot change');
  if(old)Object.assign(old,command.person);else s.people.push(command.person);
 }else if(command.type==='parentage'){
  own(command.union.tree);
  if(!s.people.some(p=>p.id===command.child&&p.tree===command.union.tree))fail('Missing child');
  const existing=s.unions.find(u=>u.id===command.union.id);
  if(existing&&(existing.tree!==command.union.tree||existing.kind!==command.union.kind||JSON.stringify([...existing.parents].sort())!==JSON.stringify([...command.union.parents].sort())))fail('Shared union cannot be overwritten');
  // Move only this child. Other marriages and siblings retain their records.
  for(const u of s.unions)if(u.kind===command.union.kind)u.children=u.children.filter(id=>id!==command.child);
  const target=s.unions.find(u=>u.id===command.union.id);
  if(target)target.children.push(command.child);
  else s.unions.push({...command.union,children:[command.child]});
 }else if(command.type==='propose'){
  const p=command.proposal;own(p.from);
  if(p.from===p.to||!s.owners[p.to]||p.status!=='pending')fail('Invalid proposal');
  if(!s.people.some(x=>x.id===p.parent&&x.tree===p.from)||!s.people.some(x=>x.id===p.child&&x.tree===p.to))fail('Invalid endpoints');
  if(s.proposals.some(x=>x.id===p.id||(['pending','approved'].includes(x.status)&&x.parent===p.parent&&x.child===p.child&&x.kind===p.kind)))fail('Duplicate proposal');
  s.proposals.push(p);
 }else{
  const p=s.proposals.find(p=>p.id===command.id);if(!p)fail('Missing proposal');
  const proposal=p!;
  if(command.decision==='cancelled')own(proposal.from);else own(proposal.to);
  if(proposal.status!=='pending'&&!(proposal.status==='approved'&&command.decision==='cancelled'))fail('Proposal already resolved');
  proposal.status=command.decision;
 }
 validate(s);s.version++;s.receipts[requestId]=fingerprint;return s;
}
/** Mock commit boundary: validates on a copy; failures publish no partial state. */
export class MemoryRepository {
 constructor(public snapshot:Snapshot){}
 commit(actor:string,version:number,key:string,command:Command,failBeforeCommit=false){
  const next=applyCommand(this.snapshot,actor,version,key,command);
  if(failBeforeCommit)fail('Simulated storage failure');
  this.snapshot=next;return next;
 }
}
export function candidates(s:Snapshot,name:string,allowedTrees:string[]){
 return s.people.filter(p=>allowedTrees.includes(p.tree)&&p.name.toLocaleLowerCase().includes(name.toLocaleLowerCase())).map(p=>({...p,verified:false}));
}
