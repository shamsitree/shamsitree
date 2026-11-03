import React,{useState} from 'react';
import {Navigation} from './Navigation';
import {Dashboard} from './Dashboard';
import {FamilyTreeViewer} from './FamilyTreeViewer';
import {MemberModal} from './MemberModal';
import {MemberDetailModal} from './MemberDetailModal';
import {KinshipFinder} from './KinshipFinder';
import {SAMPLE_TREE,SANDBOX_KEY,sampleFamily,restoreSample,type SandboxFamily} from '../data/phase5Family';
import {saveSandboxMember} from '../utils/sandboxSave';
import type {QuickRelation,MemberParentage} from '../utils/saveUnifiedMember';
import type {FamilyMember,SupportedLanguage} from '../types/family';
export default function Phase5Sandbox(){
 const [family,setFamily]=useState<SandboxFamily>(()=>{try{return restoreSample(localStorage.getItem(SANDBOX_KEY));}catch{return sampleFamily();}});
 const [tab,setTab]=useState('tree'),[lang,setLang]=useState<SupportedLanguage>('en'),[open,setOpen]=useState(false),[editing,setEditing]=useState<FamilyMember|null>(null),[details,setDetails]=useState<FamilyMember|null>(null),[quick,setQuick]=useState<QuickRelation|null>(null),[message,setMessage]=useState('');
 function commit(next:SandboxFamily){try{localStorage.setItem(SANDBOX_KEY,JSON.stringify(next));}catch{throw new Error('Browser storage is unavailable or full. Reduce photo size or enable storage. Nothing was saved.');}setFamily(next);}
 function add(){setEditing(null);setQuick(null);setOpen(true);}
 async function save(member:Partial<FamilyMember>,parents?:MemberParentage){commit(saveSandboxMember(family,member,parents,quick));setMessage('Saved in this browser only. Reload to verify persistence.');}
 function remove(id:string){if(family.unions.some(u=>u.partner1_id===id||u.partner2_id===id)||family.children.some(c=>c.child_id===id)){setMessage('This sample member has relationships. Removal blocked to preserve branches.');return;}commit({...family,members:family.members.filter(m=>m.id!==id)});setDetails(null);}
 return <div className="min-h-screen bg-slate-50">
  <div className="sandbox-banner"><strong>PHASE 5 · REVIEW PREVIEW</strong><span>Sample family · Saves stay in this browser · Production disconnected</span></div>
  <Navigation currentTab={tab} onSelectTab={setTab} language={lang} onChangeLanguage={setLang} onLogout={()=>setMessage('This isolated preview has no account login or production session.')} />
  <main className="max-w-7xl mx-auto px-3 sm:px-6 py-5">
   <div className="sandbox-actions"><p>Try dates, Rampur suggestions and all three designs. Changes use isolated browser storage.</p><button onClick={add}>+ Add Family Member</button><button onClick={()=>{commit(sampleFamily());setMessage('Sample restored in this browser.');}}>Reset sample</button></div>
   {message&&<p role="status" className="sandbox-message">{message}</p>}
   {tab==='dashboard'?<Dashboard tree={SAMPLE_TREE} members={family.members} unions={family.unions} language={lang} onOpenAddMember={add} onNavigateTab={setTab}/>:
    tab==='tree'?<FamilyTreeViewer members={family.members} unions={family.unions} children={family.children} currentUserId="sample-owner" language={lang} onSelectMember={setDetails} onAddRelative={(targetMember,relationType,union)=>{setEditing(null);setQuick({targetMember,relationType,union});setOpen(true);}} onOpenAddMember={add}/>:
    tab==='kinship'?<KinshipFinder members={family.members} unions={family.unions} children={family.children} language={lang}/>:
    tab==='members'?<section className="sample-directory"><h2>Sample members</h2>{family.members.map(m=><article key={m.id}><strong>{m.full_name}</strong><span>{m.date_of_birth||'Date not entered'} · {m.birthplace||'Place not entered'}</span><button onClick={()=>setDetails(m)}>Details</button><button onClick={()=>{setEditing(m);setQuick(null);setOpen(true);}}>Edit {m.full_name}</button></article>)}</section>:
    <section className="sample-directory"><h2>{tab==='tests'?'Isolated sample integrity':'Phase 5 preview scope'}</h2><p>{tab==='tests'?`${family.members.length} sample members, ${family.unions.length} marriage/parent unions and ${family.children.length} child links. Use Kinship Finder to inspect this sample.`:'Memories and account settings are outside this form/tree preview. No production data is loaded.'}</p></section>}
  </main>
  <MemberModal isOpen={open} onClose={()=>setOpen(false)} member={editing} allMembers={family.members} onSave={save} defaultRelation={quick} userId="sample-owner" localPhotoOnly/>
  <MemberDetailModal member={details} onClose={()=>setDetails(null)} onEdit={m=>{setDetails(null);setEditing(m);setQuick(null);setOpen(true);}} onDelete={remove} allMembers={family.members} unions={family.unions} children={family.children}/>
 </div>;
}
