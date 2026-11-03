/** Pure view-only selection; does not modify persisted family records. */
export function selectStudioMembers<T extends {id:string}>(members: readonly T[], selectedIds: readonly string[], limit=50): T[] {
 const allowed=new Set(members.map(member=>member.id));
 const seen=new Set<string>();
 const selected:T[]=[];
 const byId=new Map(members.map(member=>[member.id,member]));
 for(const id of selectedIds){
  if(!allowed.has(id)||seen.has(id))continue;
  seen.add(id);
  selected.push(byId.get(id)!);
  if(selected.length>=limit)break;
 }
 return selected;
}
export function firstStudioMembers<T extends {id:string}>(members:readonly T[], limit=50):string[]{
 return members.slice(0,Math.max(0,limit)).map(member=>member.id);
}
