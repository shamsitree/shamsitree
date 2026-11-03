import type {FamilyMember,FamilyUnion} from '../types/family';
import {SAMPLE_TREE,type SandboxFamily} from '../data/phase5Family';
import type {MemberParentage,QuickRelation} from './saveUnifiedMember';
import {validateParentage} from './validateParentage';
/** Preview only. The production callback and atomic RPC are not changed. */
export function saveSandboxMember(before:SandboxFamily,payload:Partial<FamilyMember>,parentage:MemberParentage={},quick:QuickRelation|null=null):SandboxFamily{
 const s:SandboxFamily=JSON.parse(JSON.stringify(before));
 if(!payload.id||!payload.full_name?.trim())throw new Error('Name and member ID required.');
 const old=s.members.find(m=>m.id===payload.id);
 const member={...old,...payload,tree_id:SAMPLE_TREE.id,created_by:'sample-owner'} as FamilyMember;
 if(old)s.members=s.members.map(m=>m.id===member.id?member:m);else s.members.push(member);
 const known=(id:string)=>s.members.some(m=>m.id===id);
 function couple(a:string,b:string|null):FamilyUnion{
  if(!known(a)||(b&&!known(b))||a===b)throw new Error('Choose different people in this sample family.');
  let u=s.unions.find(u=>u.partner1_id===a&&u.partner2_id===b||b&&u.partner1_id===b&&u.partner2_id===a);
  if(!u){u={id:crypto.randomUUID(),tree_id:SAMPLE_TREE.id,partner1_id:a,partner2_id:b,relationship_type:b?'spouse':'single_parent',marriage_status:'unknown'};s.unions.push(u);}return u;
 }
 const spouse=quick?.relationType==='spouse'?quick.targetMember.id:!quick?parentage.spouseId:undefined;
 if(spouse)couple(member.id,spouse);
 let child=member.id,ids=[parentage.fatherId,parentage.motherId].filter(Boolean) as string[],chosen:FamilyUnion|undefined;
 if(quick?.relationType==='child'){
  chosen=quick.union?s.unions.find(u=>u.id===quick.union!.id):undefined;
  ids=chosen?[chosen.partner1_id,chosen.partner2_id].filter(Boolean) as string[]:[quick.targetMember.id];
 }else if(quick&&(quick.relationType==='father'||quick.relationType==='mother')){
  child=quick.targetMember.id;
  ids=s.children.filter(c=>c.child_id===child).flatMap(c=>{const u=s.unions.find(u=>u.id===c.family_union_id);return u?[u.partner1_id,u.partner2_id].filter(Boolean) as string[]:[];});
  if(ids.length>=2&&!ids.includes(member.id))throw new Error('Both parent slots are already occupied.');
  if(!ids.includes(member.id))ids.push(member.id);
 }else if(quick?.relationType==='spouse')ids=[];
 if(ids.length){
  if(ids.some(id=>!known(id)))throw new Error('Choose existing sample parents.');
  validateParentage(child,ids,s.unions,s.children.filter(c=>c.child_id!==child));
  chosen ||= couple(ids[0],ids[1]||null);
  const link=s.children.find(c=>c.child_id===child);
  const updated={id:link?.id||crypto.randomUUID(),tree_id:SAMPLE_TREE.id,child_id:child,family_union_id:chosen.id,relationship_type:quick&&(quick.relationType==='father'||quick.relationType==='mother')?(link?.relationship_type||'biological'):(parentage.relationshipType||link?.relationship_type||'biological')};
  s.children=s.children.filter(c=>c.child_id!==child);s.children.push(updated);
 }
 return s;
}
