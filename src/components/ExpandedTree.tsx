import React,{useState} from 'react';
import type {FamilyMember,FamilyUnion,FamilyChild} from '../types/family';
type Props={members:FamilyMember[];unions:FamilyUnion[];children:FamilyChild[];rootId:string;onSelect:(m:FamilyMember)=>void};
function Branch({data,id,direction,seen}: {data:Props;id:string;direction:'up'|'down';seen:string[]}) {
  const [open,setOpen]=useState(seen.length<2);
  const m=data.members.find(m=>m.id===id);
  if(!m)return null;
  if(seen.includes(id))return <p>Repeated ancestor reference: {m.full_name}</p>;
  const groups=direction==='up'
    ? data.children.filter(c=>c.child_id===id).map(c=>({u:data.unions.find(u=>u.id===c.family_union_id),kind:c.relationship_type}))
    : data.unions.filter(u=>u.partner1_id===id||u.partner2_id===id).map(u=>({u,kind:''}));
  return <div className="border-l-2 border-emerald-200 pl-3 my-3">
    {direction==='up' && open && groups.map(({u,kind})=>u&&<div key={u.id}><small>{kind} parents</small>{[u.partner1_id,u.partner2_id].filter(Boolean).map(p=><Branch key={p} data={data} id={p!} direction={direction} seen={[...seen,id]}/>)}</div>)}
    <div className="flex gap-2 items-center"><button className={`border rounded-lg p-2 ${m.gender==='female'?'bg-pink-50':'bg-blue-50'}`} onClick={()=>data.onSelect(m)}>{m.full_name}</button>
    {groups.length>0&&<button aria-expanded={open} className="text-sm underline" onClick={()=>setOpen(!open)}>{open?'Collapse':'Expand'} {direction==='up'?'ancestors':'descendants'}</button>}</div>
    {direction==='down' && open && groups.map(({u})=>u&&<section key={u.id} data-expanded-union={u.id} className="border rounded-lg p-2 my-2">
      <h3 className="font-bold text-sm">{u.partner2_id ? 'With '+data.members.find(m=>m.id===(u.partner1_id===id?u.partner2_id:u.partner1_id))?.full_name:'One known parent'}</h3>
      {data.children.filter(c=>c.family_union_id===u.id).map(c=><div key={c.id}><small>{c.relationship_type}</small><Branch data={data} id={c.child_id} direction={direction} seen={[...seen,id]}/></div>)}
    </section>)}
  </div>;
}
export function ExpandedTree(props:Props){return <section className="no-print bg-white border rounded-xl p-4 overflow-auto"><h2 className="font-bold">Generations — expand any branch</h2><Branch key={'up'+props.rootId} data={props} id={props.rootId} direction="up" seen={[]}/><hr/><Branch key={'down'+props.rootId} data={props} id={props.rootId} direction="down" seen={[]}/></section>;}
