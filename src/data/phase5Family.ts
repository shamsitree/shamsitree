import type {FamilyMember,FamilyUnion,FamilyChild} from '../types/family';
export interface SandboxFamily {version:1;members:FamilyMember[];unions:FamilyUnion[];children:FamilyChild[];}
export const SANDBOX_KEY='shamsitree.phase5.sample.v1';
export const SAMPLE_TREE={id:'phase5-sample',owner_user_id:'sample-owner',name:'Phase 5 sample family',tree_code:'SAMPLE'};
export function sampleFamily():SandboxFamily{
 const members:FamilyMember[]=[['anwar','Anwar Kamal','male','1980-04-19'],['mannan','Abdul Mannan','male','1947-08-01'],['hajra','Hajra Begum','female','1955-02-03'],['ruhi1','Ruhi Kamal','female','1986-02-03'],['ruhi2','Ruhi Fakhir','female','1988-07-03'],['ghani','Abdul Ghani','male','2016-08-10'],['sidra','Sidra Kamal','female','2017-07-06'],['subhan','Abdul Subhan','male','1921-03-19'],['mehr','Mehrunnisa','female','1928-10-03']].map(([id,full_name,gender,date_of_birth])=>({id,full_name,gender:gender as FamilyMember['gender'],date_of_birth,tree_id:SAMPLE_TREE.id,created_by:'sample-owner',birthplace:'Rampur, Uttar Pradesh, India',notes:'Sample record for the isolated Phase 5 preview.'+(id==='anwar'?' [Family Role: Self]':''),biradari:'Shamsi'}));
 const unions:FamilyUnion[]=[['ancestors','subhan','mehr'],['parents','mannan','hajra'],['marriage1','anwar','ruhi1'],['marriage2','anwar','ruhi2']].map(([id,partner1_id,partner2_id])=>({id,tree_id:SAMPLE_TREE.id,partner1_id,partner2_id,relationship_type:'spouse',marriage_status:'married'}));
 const children:FamilyChild[]=[['ancestors','mannan'],['parents','anwar'],['marriage1','ghani'],['marriage2','sidra']].map(([family_union_id,child_id])=>({id:family_union_id+child_id,tree_id:SAMPLE_TREE.id,family_union_id,child_id,relationship_type:'biological'}));
 return {version:1,members,unions,children};
}
export function restoreSample(text:string|null):SandboxFamily{
 if(!text)return sampleFamily();
 try{const s=JSON.parse(text);if(s.version!==1||![s.members,s.unions,s.children].every(Array.isArray)||s.members.some((m:any)=>!m.id||typeof m.full_name!=='string'||m.tree_id!==SAMPLE_TREE.id))return sampleFamily();return s;}catch{return sampleFamily();}
}
