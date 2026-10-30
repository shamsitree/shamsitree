import React,{useState} from 'react';
import {MemoryRepository,parentsOf} from '../utils/relationshipWorkspace';
import type {Snapshot} from '../utils/relationshipWorkspace';
const fixture=():Snapshot=>({version:0,receipts:{},owners:{A:'alice',B:'bob'},proposals:[],people:[{id:'a',name:'Anwar Kamal',tree:'A'},{id:'b',name:'Abdul Ghani',tree:'B'}],unions:[]});
export default function Phase2Demo(){
 const [repo]=useState(()=>new MemoryRepository(fixture()));
 const [state,setState]=useState(repo.snapshot);const [message,setMessage]=useState('Two independent family records.');
 const act=(action:'propose'|'approve'|'reject'|'cancel')=>{try{
 const command=action==='propose'?{type:'propose' as const,proposal:{id:'connection',from:'A',to:'B',parent:'a',child:'b',status:'pending' as const,kind:'biological' as const}}:{type:'decision' as const,id:'connection',decision:action==='approve'?'approved' as const:action==='reject'?'rejected' as const:'cancelled' as const};
 setState(repo.commit(action==='approve'||action==='reject'?'bob':'alice',repo.snapshot.version,crypto.randomUUID(),command));setMessage('Action completed. Original people preserved.');
 }catch(e){setMessage((e as Error).message)}};
 return <main style={{maxWidth:800,margin:'40px auto',fontFamily:'Arial',padding:24}}>
 <h1>ShamsiTree — Phase 2 connection demo</h1><p><strong>Simulation only.</strong> Uses local memory; refresh resets everything. Actor buttons simulate owners, not authenticated access.</p>
 <div style={{display:'flex',gap:24}}>{state.people.map(p=><section key={p.id} style={{background:'#dbeafe',padding:20,borderRadius:16}}><h2>{p.name}</h2><p>Family {p.tree}</p></section>)}</div>
 <p>{parentsOf(state,'b').includes('a')?'Confirmed in demo: Anwar Kamal → son Abdul Ghani':'No approved cross-family relationship.'}</p>
 <p>Status: {state.proposals[0]?.status||'No request'}</p>
 <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
 <button onClick={()=>act('propose')}>Family A: propose father–son link</button>
 <button onClick={()=>act('approve')}>Family B: approve</button>
 <button onClick={()=>act('reject')}>Family B: reject</button>
 <button onClick={()=>act('cancel')}>Family A: cancel/disconnect</button>
 <button onClick={()=>{repo.snapshot=fixture();setState(repo.snapshot);setMessage('Reset demo')}}>Reset</button>
 </div><p role="status">{message}</p><p>Saved people: {state.people.length}. No person records are merged or deleted.</p>
 </main>
}
