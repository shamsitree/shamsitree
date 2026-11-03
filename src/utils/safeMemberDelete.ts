/** Protect shared family branches. Server-side enforcement is also required. */
export async function safeMemberDelete(client:any, treeId:string, memberId:string){
 const [unions,children]=await Promise.all([
  client.from('family_unions').select('id').eq('tree_id',treeId).or(`partner1_id.eq.${memberId},partner2_id.eq.${memberId}`).limit(1),
  client.from('family_children').select('id').eq('tree_id',treeId).eq('child_id',memberId).limit(1)
 ]);
 if(unions.error)throw unions.error;if(children.error)throw children.error;
 if(!Array.isArray(unions.data)||!Array.isArray(children.data))throw new Error('Could not verify family relationships.');
 if(unions.data.length||children.data.length)throw new Error('This person has family relationships. Deletion is blocked to protect the family branches.');
 const result=await client.from('family_members').delete().eq('id',memberId).eq('tree_id',treeId).select('id');
 if(result.error)throw result.error;
 if(result.data?.length!==1)throw new Error('Member was not deleted. Refresh and check access.');
}
