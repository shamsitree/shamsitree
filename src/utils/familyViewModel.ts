import type {FamilyMember,FamilyUnion,FamilyChild} from '../types/family';
export function indexFamily(members:FamilyMember[],unions:FamilyUnion[],children:FamilyChild[]){
 const people=new Map(members.map(m=>[m.id,m]));
 const unionById=new Map(unions.map(u=>[u.id,u]));
 const unionsByPerson=new Map<string,FamilyUnion[]>(),linksByChild=new Map<string,FamilyChild[]>(),linksByUnion=new Map<string,FamilyChild[]>();
 for(const u of unions)for(const id of [u.partner1_id,u.partner2_id].filter(Boolean) as string[]){const list=unionsByPerson.get(id)||[];list.push(u);unionsByPerson.set(id,list);}
 for(const c of children){const byChild=linksByChild.get(c.child_id)||[];byChild.push(c);linksByChild.set(c.child_id,byChild);const byUnion=linksByUnion.get(c.family_union_id)||[];byUnion.push(c);linksByUnion.set(c.family_union_id,byUnion);}
 const parents=(id:string)=>{const ids=new Set<string>();for(const c of linksByChild.get(id)||[]){const u=unionById.get(c.family_union_id);if(u){ids.add(u.partner1_id);if(u.partner2_id)ids.add(u.partner2_id);}}return [...ids].map(x=>people.get(x)).filter(Boolean) as FamilyMember[];};
 const offspring=(uid:string)=>(linksByUnion.get(uid)||[]).map(link=>({member:people.get(link.child_id),kind:link.relationship_type})).filter(x=>x.member) as {member:FamilyMember;kind:string}[];
 return {people,parents,offspring,unionsByPerson,linksByUnion};
}
export type FamilyIndex=ReturnType<typeof indexFamily>;
export function familyScene(index:FamilyIndex,focusId:string,depth=2,limit=20){
 const focus=index.people.get(focusId);
 const parents=index.parents(focusId);
 const seen=new Set([focusId,...parents.map(p=>p.id)]);
 const elders:{member:FamilyMember;via:string}[]=[];
 let queue=parents.map(p=>({member:p,level:1}));
 while(queue.length&&elders.length<16){const p=queue.shift()!;if(p.level>=depth)continue;for(const elder of index.parents(p.member.id)){if(seen.has(elder.id))continue;seen.add(elder.id);elders.push({member:elder,via:p.member.full_name});queue.push({member:elder,level:p.level+1});}}
 const branches=(index.unionsByPerson.get(focusId)||[]).filter(u=>u.partner2_id||(index.linksByUnion.get(u.id)||[]).length).map(union=>{
  const spouseId=union.partner1_id===focusId?union.partner2_id:union.partner1_id;
  const allKids=index.offspring(union.id);
  return {union,spouse:spouseId?index.people.get(spouseId):undefined,kids:allKids.slice(0,limit),total:allKids.length};
 });
 return {focus,parents,elders,branches};
}
