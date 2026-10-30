/** Retry-safe creation within one stable draft ID. Does not make relationship writes atomic. */
export async function createMemberOnce(client:any,payload:Record<string,unknown>){
 const lookup=()=>client.from('family_members').select('*').eq('id',payload.id).eq('tree_id',payload.tree_id).maybeSingle();
 const previous=await lookup();if(previous.error)throw previous.error;
 if(previous.data){
  // A retry resumes the same person. Apply the current draft fields without recreating it.
  const updated=await client.from('family_members').update(payload).eq('id',payload.id).eq('tree_id',payload.tree_id).select().single();
  if(updated.error)throw updated.error;return updated.data;
 }
 const inserted=await client.from('family_members').insert(payload).select().single();
 if(!inserted.error)return inserted.data;
 if(inserted.error.code==='23505'){
  const raced=await lookup();if(raced.error)throw raced.error;
  if(raced.data)return raced.data;
 }
 throw inserted.error;
}
