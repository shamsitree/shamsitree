import type { FamilyMember, FamilyUnion, FamilyChild } from '../types/family';

/** Read-only bridge for the Google AI Design Studio. Never writes to Supabase. */
export interface StudioPerson {
 id:string; firstName:string; lastName:string; gender:'male'|'female'|'other';
 birthDate?:string; deathDate?:string; birthPlace?:string; isLiving:boolean;
 avatarUrl?:string; generation:number; bio?:string; spouses:Array<{spouseId:string;order:number;marriageStatus?:'current'|'divorced'|'widowed'}>;
 parentIds:string[]; fatherId?:string; motherId?:string; marriageBranchId?:string;
 relationshipType?:'biological'|'adopted'|'foster'; notes?:string;
}
export function toStudioPeople(members:readonly FamilyMember[], unions:readonly FamilyUnion[], links:readonly FamilyChild[]):StudioPerson[]{
 const byId=new Map(members.map(m=>[m.id,m]));
 const unionById=new Map(unions.map(u=>[u.id,u]));
 const result=new Map<string,StudioPerson>();
 for(const m of members){
  const parts=m.full_name.trim().split(/\s+/);
  result.set(m.id,{id:m.id,firstName:parts.shift()||m.full_name,lastName:parts.join(' '),gender:m.gender,
   birthDate:m.date_of_birth||undefined,deathDate:m.date_of_death||undefined,birthPlace:m.birthplace||undefined,
   isLiving:!m.date_of_death,avatarUrl:m.profile_photo||undefined,generation:1,bio:m.notes||undefined,
   spouses:[],parentIds:[],notes:m.notes||undefined});
 }
 for(const u of unions){
  if(u.relationship_type!=='spouse'||!u.partner2_id||!byId.has(u.partner1_id)||!byId.has(u.partner2_id))continue;
  const status=u.marriage_status==='divorced'?'divorced':u.marriage_status==='widowed'?'widowed':'current';
  for(const [a,b] of [[u.partner1_id,u.partner2_id],[u.partner2_id,u.partner1_id]]){
   const p=result.get(a)!; if(!p.spouses.some(s=>s.spouseId===b))p.spouses.push({spouseId:b,order:p.spouses.length+1,marriageStatus:status});
  }
 }
 for(const link of links){
  const child=result.get(link.child_id),u=unionById.get(link.family_union_id);
  if(!child||!u)continue;
  const parents=[u.partner1_id,u.partner2_id].filter((id):id is string=>!!id&&id!==child.id&&byId.has(id));
  for(const id of parents){if(!child.parentIds.includes(id))child.parentIds.push(id);
   const gender=byId.get(id)!.gender;if(gender==='male'&&!child.fatherId)child.fatherId=id;
   if(gender==='female'&&!child.motherId)child.motherId=id;
  }
  child.marriageBranchId=u.id;
  if(link.relationship_type==='biological'||link.relationship_type==='adopted'||link.relationship_type==='foster')child.relationshipType=link.relationship_type;
 }
 // Generation is display metadata, not a claim about missing ancestry.
 const pending=new Set(result.keys());
 for(let round=0;round<result.size&&pending.size;round++){
  let changed=false;
  for(const id of [...pending]){
   const p=result.get(id)!;
   if(p.parentIds.length===0){pending.delete(id);changed=true;continue;}
   if(p.parentIds.every(parent=>!pending.has(parent))){p.generation=1+Math.max(...p.parentIds.map(parent=>result.get(parent)?.generation||1));pending.delete(id);changed=true;}
  }
  if(!changed)break; // cyclic/invalid data: avoid infinite loops
 }
 return [...result.values()];
}
