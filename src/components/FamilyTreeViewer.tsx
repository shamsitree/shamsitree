import React,{useEffect,useId,useMemo,useState} from 'react';
import type {FamilyMember,FamilyUnion,FamilyChild,SupportedLanguage} from '../types/family';
import {photoFor} from '../utils/photoStorage';
import {indexFamily,familyScene,type FamilyIndex} from '../utils/familyViewModel';
import {Printer,Plus,TreePine,Images,GitBranch,Leaf,Heart} from 'lucide-react';

type Mode='classic'|'heritage'|'album';
interface Props{members:FamilyMember[];unions:FamilyUnion[];children:FamilyChild[];currentUserId?:string;language:SupportedLanguage;onSelectMember:(member:FamilyMember)=>void;onAddRelative:(member:FamilyMember,kind:'father'|'mother'|'spouse'|'child',union?:FamilyUnion)=>void;onOpenAddMember:()=>void;}
interface CardProps{member:FamilyMember;focus?:boolean;label?:string;onChoose:(member:FamilyMember)=>void;mode:Mode;}
function PersonCard({member,focus,label,onChoose,mode}:CardProps){
 return <div className={`person-card ${member.gender} ${focus?'focus-card':''}`} role="button" tabIndex={0} aria-label={`${focus?'View details for':'Explore'} ${member.full_name}`} onClick={()=>onChoose(member)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onChoose(member);}}}>
  {label&&<span className="person-relation">{label}</span>}
  <img src={photoFor(member)} alt="" loading="lazy" decoding="async"/>
  <div className="person-copy"><div className="person-name">{member.full_name}</div><small>{member.biradari||'Shamsi'}</small>{mode==='album'&&<span className="album-caption">{member.date_of_birth?member.date_of_birth.slice(0,4):'A chapter in our family'}{member.date_of_death?' — '+member.date_of_death.slice(0,4):''}</span>}</div>
 </div>;
}
class ViewBoundary extends React.Component<{children:React.ReactNode;fallback:React.ReactNode},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?this.props.fallback:this.props.children;}
}
interface SceneProps extends Pick<Props,'onAddRelative'>{index:FamilyIndex;focusId:string;mode:Mode;depth:number;limit:number;simple:boolean;onChoose:(member:FamilyMember)=>void;onMore:()=>void;branchesId:string;}
function FamilyScene({index,focusId,mode,depth,limit,simple,onChoose,onAddRelative,onMore,branchesId}:SceneProps){
 const scene=useMemo(()=>familyScene(index,focusId,depth,limit),[index,focusId,depth,limit]);
 if(!scene.focus)return null;
 const focus=scene.focus;
 const father=scene.parents.find(p=>p.gender==='male'),mother=scene.parents.find(p=>p.gender==='female');
 const addChild=()=>{if(scene.branches.length===1)onAddRelative(focus,'child',scene.branches[0].union);else if(scene.branches.length>1&&typeof document!=='undefined')document.getElementById(branchesId)?.scrollIntoView({behavior:'auto',block:'center'});else onAddRelative(focus,'child');};
 return <section className={`family-canvas view-${mode} ${simple?'simple-decoration':''}`} data-view={mode} aria-label={`${mode==='album'?'Family Album':mode==='heritage'?'Heritage':'Classic'} family tree`}>

  <div className="scene-heading"><span>{mode==='heritage'?'ROOTED IN LOVE':mode==='album'?'THE FAMILY COLLECTION':'FAMILY LINEAGE'}</span><h3>{mode==='heritage'?'Every branch, a story':mode==='album'?'A lifetime of belonging':'Our connected generations'}</h3><p>{mode==='heritage'?'From deep roots to new beginnings.':mode==='album'?'People, portraits and the chapters we share.':'Choose a relative to explore. Choose the focus card to open details.'}</p></div>
  <div className="tree-content">
   {scene.elders.length>0&&<div className="elder-section"><h4>Earlier generations</h4><div className="elder-row">{scene.elders.map(({member,via})=><PersonCard key={member.id} member={member} label={`Parent of ${via}`} mode={mode} onChoose={onChoose}/>)}</div></div>}
   <div className="parents-section"><h4>{mode==='album'?'The previous chapter':'Parents'}</h4><div className="parents-row">
    {scene.parents.map(p=><PersonCard key={p.id} member={p} label={p.gender==='male'?'Father':p.gender==='female'?'Mother':'Parent'} onChoose={onChoose} mode={mode}/>)}
    {!father&&<button className="add-parent" onClick={()=>onAddRelative(focus,'father')}>+ Add Father</button>}
    {!mother&&<button className="add-parent" onClick={()=>onAddRelative(focus,'mother')}>+ Add Mother</button>}
   </div><div className="root-connector" aria-hidden="true"/></div>
   <div className="focus-section"><PersonCard member={focus} focus label="★ Focus person" mode={mode} onChoose={onChoose}/><div className="root-actions"><button onClick={()=>onAddRelative(focus,'spouse')}><Heart size={14}/><span>+ Add Spouse</span></button><button onClick={addChild}><Plus size={14}/><span>{scene.branches.length>1?'Choose child branch':'+ Add Child'}</span></button></div></div>
   <div className="root-connector" aria-hidden="true"/>
   <div className="branch-section" id={branchesId}><h4>{mode==='album'?'Household albums':'Marriage & child branches'}</h4><p className="branch-help">Add a child inside the correct household to keep marriage branches separate.</p><div className="marriage-grid">
    {scene.branches.map(branch=><article className="marriage-branch" key={branch.union.id} data-union-id={branch.union.id} aria-label={branch.spouse?`Family with ${branch.spouse.full_name}`:'Other recorded child branch'}>
     <div className="branch-heading"><span>{branch.spouse?(mode==='album'?'A shared chapter':branch.spouse.gender==='female'?'Wife':'Spouse'):'Other recorded children'}</span><span>{branch.total} {branch.total===1?'child':'children'}</span></div>
     {branch.spouse&&<PersonCard member={branch.spouse} mode={mode} onChoose={onChoose}/>}
     <div className="children-connector" aria-hidden="true"/>
     <div className="branch-children">{branch.kids.map(({member,kind})=><div className="descendant-group" key={member.id}><PersonCard member={member} label={`${kind!=='biological'?kind+' ':''}${member.gender==='male'?'Son':member.gender==='female'?'Daughter':'Child'}`} mode={mode} onChoose={onChoose}/>
      {depth>1&&(index.unionsByPerson.get(member.id)||[]).some(u=>(index.linksByUnion.get(u.id)||[]).length>0)&&<div className="next-generation"><span>Next generation</span>{(index.unionsByPerson.get(member.id)||[]).flatMap(u=>index.offspring(u.id).slice(0,4).map(({member:k})=><button key={u.id+k.id} onClick={()=>onChoose(k)}>{k.full_name}</button>))}<small>Explore this child to continue their branches.</small></div>}
     </div>)}</div>
     {!branch.total&&<p className="empty-branch">A new chapter is waiting. No children recorded here.</p>}
     {branch.total>branch.kids.length&&<button className="show-more" onClick={onMore}>Show more children ({branch.total-branch.kids.length} remaining)</button>}
     <button className="branch-add" onClick={()=>onAddRelative(focus,'child',branch.union)}><Plus size={14}/><span>{branch.spouse?'Add Child':'Add another child'}</span></button>
    </article>)}
   </div>{!scene.branches.length&&<p className="empty-branch">No children added yet. Add a spouse or child to extend this family.</p>}</div>
  </div>
 </section>;
}
export const FamilyTreeViewer:React.FC<Props>=({members,unions,children,currentUserId,language,onSelectMember,onAddRelative,onOpenAddMember})=>{
 const [mode,setMode]=useState<Mode>('classic'),[focusId,setFocusId]=useState(()=>members.find(m=>currentUserId&&m.created_by===currentUserId&&/\[Family Role:\s*Self\]/i.test(m.notes||''))?.id||members[0]?.id||'');
 const [depth,setDepth]=useState(2),[limit,setLimit]=useState(20),[lowPower,setLowPower]=useState(false),[minimal,setMinimal]=useState(false);
 const branchesId=useId();
 const index=useMemo(()=>indexFamily(members,unions,children),[members,unions,children]);
 const focus=index.people.get(focusId)||members[0];
 useEffect(()=>{if(typeof window==='undefined')return;const media=window.matchMedia?.('(prefers-reduced-motion: reduce)');const update=()=>setLowPower((typeof navigator!=='undefined'&&navigator.hardwareConcurrency<=4)||!!media?.matches);update();media?.addEventListener?.('change',update);return()=>media?.removeEventListener?.('change',update);},[]);
 if(!focus)return <section className="empty-tree"><TreePine size={40}/><h3>Your Family Tree is Empty</h3><p>Add your first family member to start your unified tree.</p><button onClick={onOpenAddMember}>Add First Member</button></section>;
 const choose=(m:FamilyMember)=>{if(m.id===focus.id)onSelectMember(m);else{setFocusId(m.id);setLimit(20);}};
 const shared={index,focusId:focus.id,depth,limit,simple:minimal||lowPower||members.length>120,onChoose:choose,onAddRelative,onMore:()=>setLimit(n=>n+20),branchesId};
 const fallback=<><p role="alert">This decorative view could not load. Classic is available below.</p><FamilyScene {...shared} mode="classic"/></>;
 return <div className="phase5-tree" lang={language}>
  <div className="tree-toolbar"><div className="focus-control"><label htmlFor={`${branchesId}-focus`}>Focus Person:</label><select id={`${branchesId}-focus`} aria-label="Focus Person" value={focus.id} onChange={e=>{setFocusId(e.target.value);setLimit(20);}}>{members.map(m=><option key={m.id} value={m.id}>{m.full_name} ({m.gender})</option>)}</select></div>
   <div className="view-tabs" role="group" aria-label="Family tree design">{([['classic','Classic',GitBranch],['heritage','Heritage',Leaf],['album','Family Album',Images]] as const).map(([value,label,Icon])=><button key={value} aria-pressed={mode===value} onClick={()=>setMode(value)}><Icon size={16}/>{label}</button>)}</div>
   <button className="print-tree" title="Print Tree" onClick={()=>window.print()}><Printer size={16}/><span>Print Tree</span></button>
  </div>
  <div className="tree-options"><label>Generations <select aria-label="Visible generations" value={depth} onChange={e=>setDepth(Number(e.target.value))}><option value="1">Parents & children</option><option value="2">Include grandparents</option><option value="3">More ancestors</option></select></label>{mode==='heritage'&&<label><input type="checkbox" checked={minimal} onChange={e=>setMinimal(e.target.checked)}/> Minimal decoration</label>}<span>Explore any card to continue through a large family.</span></div>
  <ViewBoundary key={mode} fallback={fallback}><FamilyScene {...shared} mode={mode}/></ViewBoundary>
 </div>;
};
