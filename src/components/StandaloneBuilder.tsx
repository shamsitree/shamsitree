import React, {useState} from 'react';
import {FamilyTreeViewer} from './FamilyTreeViewer';
import {MemberModal} from './MemberModal';
import {MemberDetailModal} from './MemberDetailModal';
import {KinshipFinder} from './KinshipFinder';
import {saveToGraph, type Relation, type Parentage} from '../utils/familyGraph';
import {STORAGE_KEY, decodeTree, emptyTree, persistTree, type SavedTree} from '../utils/standaloneStorage';
import type {FamilyMember} from '../types/family';

function download(tree: SavedTree) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(tree,null,2)], {type:'application/json'}));
  const a = document.createElement('a'); a.href=url; a.download='ShamsiTree-Form-B.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(url),1000);
}
export function StandaloneBuilder({onExit}: {onExit:()=>void}) {
  const [initial] = useState(() => { try {const raw=localStorage.getItem(STORAGE_KEY); return {tree:raw?decodeTree(raw):emptyTree(),error:''};} catch(e) {return {tree:emptyTree(),error:'Saved tree could not be loaded. Existing storage was preserved. '+String(e)};} });
  const [tree,setTree] = useState(initial.tree);
  const [error,setError] = useState(initial.error);
  const [open,setOpen] = useState(false);
  const [editing,setEditing] = useState<FamilyMember|null>(null);
  const [detail,setDetail] = useState<FamilyMember|null>(null);
  const [relation,setRelation] = useState<Relation|null>(null);
  const [showKinship,setShowKinship] = useState(false);
  const commit = async (next: SavedTree) => {
    if (initial.error) throw new Error(initial.error);
    if (!navigator.locks) throw new Error('This browser cannot safely coordinate tree saves. Please use current Chrome or Edge.');
    await navigator.locks.request(STORAGE_KEY, () => {
      const saved = persistTree(localStorage,next,tree.revision); setTree(saved); setError('');
    });
  };
  const save = async (data: Partial<FamilyMember>, parentage?: Parentage) => {
    const existing=tree.members.find(m => m.id===data.id);
    const person={...existing,...data,tree_id:tree.treeId} as FamilyMember;
    const next=saveToGraph(tree,person,parentage,relation,3);
    await commit({...tree,...next});
  };
  const add=() => {setEditing(null);setRelation(null);setOpen(true);};
  return <div className="min-h-screen bg-emerald-50/30 text-gray-800">
    <header className="bg-emerald-800 text-white p-5 flex flex-wrap justify-between gap-3 no-print">
      <div><h1 className="text-2xl font-bold">🌳 ShamsiTree · Form B</h1><p className="text-sm">Independent family tree · {tree.members.length} members</p></div>
      <button onClick={onExit} className="border rounded-lg px-4 py-2">Back to Form A / account</button>
    </header>
    <main className="max-w-7xl mx-auto p-4 space-y-4">
      <section className="bg-white border rounded-xl p-4 space-y-3 no-print">
        <p>Your tree is saved in this browser on this device. It is separate from Form A and other families. Export a backup to keep a copy; clearing browser data removes the device copy.</p>
        <div className="flex flex-wrap gap-3">
          <button className="bg-emerald-700 text-white rounded-lg px-4 py-2" onClick={add}>Add a person</button>
          <button className="border rounded-lg px-4 py-2" onClick={() => download(tree)}>Export backup</button>
          <label className="border rounded-lg px-4 py-2 cursor-pointer">Import backup<input aria-label="Import Form B backup" className="sr-only" type="file" accept=".json" onChange={async e => {
            const file=e.target.files?.[0]; if(!file)return;
            try {if(file.size>20*1024*1024)throw new Error('Backup exceeds 20 MB.'); const imported=decodeTree(await file.text());
              if(tree.members.length && !confirm('Replace the device tree with this backup? Export the current tree first if needed.'))return;
              await commit(imported);
            }catch(err){setError(String(err));} finally {e.target.value='';}
          }}/></label>
          <button className="border rounded-lg px-4 py-2" onClick={()=>setShowKinship(!showKinship)}>{showKinship?'Hide':'Find'} family relationships</button>
          <span className="self-center text-sm" role="status">{tree.revision?'Saved on this device':'Start with any person'}</span>
        </div>
      </section>
      {error && <p role="alert" className="bg-red-50 border border-red-200 p-4">{error}</p>}
      {showKinship && <KinshipFinder members={tree.members} unions={tree.unions} children={tree.children} language="en"/>}
      <FamilyTreeViewer members={tree.members} unions={tree.unions} children={tree.children} language="en" spouseLimit={3}
        onSelectMember={setDetail} onOpenAddMember={add}
        onAddRelative={(targetMember,relationType,union)=>{setEditing(null);setRelation({targetMember,relationType,union});setOpen(true);}}/>
      <MemberModal standalone isOpen={open} member={editing} allMembers={tree.members} onSave={save} defaultRelation={relation}
        onClose={()=>{setOpen(false);setRelation(null);setEditing(null);}}/>
      <MemberDetailModal member={detail} allMembers={tree.members} unions={tree.unions} children={tree.children}
        onClose={()=>setDetail(null)} onEdit={m=>{setDetail(null);setEditing(m);setRelation(null);setOpen(true);}}
        onDelete={async id=>{try {
          if(tree.unions.some(u=>u.partner1_id===id||u.partner2_id===id)||tree.children.some(c=>c.child_id===id))throw new Error('This person has family links. Removal requires review; no records changed.');
          if(!confirm('Delete this unlinked person from the device tree?'))return;
          await commit({...tree,members:tree.members.filter(m=>m.id!==id)});setDetail(null);
        }catch(err){setError(String(err));}}}/>
    </main>
  </div>;
}
