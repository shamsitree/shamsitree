import React,{useEffect,useId,useRef,useState} from 'react';
import {MapPin,Search} from 'lucide-react';
import {localPlaces,isLocalityQuery,searchPlaces,type PlaceSuggestion} from '../../utils/placeSearch';
interface Props {label:string;value:string;onChange:(value:string)=>void;placeholder?:string;}
export function PlaceAutocomplete({label,value,onChange,placeholder}:Props){
 const id=useId(),selected=useRef('');
 const [open,setOpen]=useState(false),[online,setOnline]=useState(false),[remote,setRemote]=useState<PlaceSuggestion[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(''),[active,setActive]=useState(-1);
 const options=[...localPlaces(value),...remote].filter((x,i,a)=>a.findIndex(y=>y.label===x.label)===i).slice(0,8);
 useEffect(()=>{
  setRemote([]);setError('');setActive(-1);setBusy(false);
  if(!online||!isLocalityQuery(value)||value===selected.current)return;
  const controller=new AbortController();
  let deadline:ReturnType<typeof setTimeout>|undefined;
  const timer=setTimeout(()=>{setBusy(true);deadline=setTimeout(()=>{controller.abort();setBusy(false);setError('Online search timed out. Keep typing manually or choose an offline suggestion.');},6500);searchPlaces(value,controller.signal).then(results=>{if(!controller.signal.aborted)setRemote(results);}).catch(err=>{if(!controller.signal.aborted)setError(err.message);}).finally(()=>{clearTimeout(deadline);if(!controller.signal.aborted)setBusy(false);});},400);
  return ()=>{clearTimeout(timer);clearTimeout(deadline);controller.abort();};
 },[value,online]);
 function choose(place:PlaceSuggestion){selected.current=place.label;onChange(place.label);setOpen(false);setActive(-1);}
 return <div className="place-autocomplete">
  <div className="place-input-row"><MapPin size={17} aria-hidden="true"/>
   <input role="combobox" aria-label={label} aria-autocomplete="list" aria-expanded={open&&options.length>0} aria-controls={`${id}-list`} aria-activedescendant={active>=0&&options[active]?`${id}-${active}`:undefined} autoComplete="off" placeholder={placeholder||'City, state, country — or any address'} value={value} onChange={e=>{selected.current='';onChange(e.target.value);setOpen(true);setActive(-1);}} onFocus={()=>setOpen(true)} onBlur={()=>setOpen(false)} onKeyDown={e=>{
    if(e.key==='ArrowDown'){e.preventDefault();setOpen(true);setActive(i=>Math.min(i+1,options.length-1));}
    if(e.key==='ArrowUp'){e.preventDefault();setActive(i=>Math.max(0,i-1));}
    if(e.key==='Escape'){e.preventDefault();setOpen(false);setActive(-1);}
    if(e.key==='Enter'&&open&&active>=0&&options[active]){e.preventDefault();choose(options[active]);}
   }}/><Search size={16} aria-hidden="true"/>
  </div>
  {open&&options.length>0&&<ul id={`${id}-list`} role="listbox" aria-label={`${label} suggestions`} className="place-results">{options.map((p,i)=><li key={p.id} id={`${id}-${i}`} role="option" aria-selected={i===active} className={i===active?'active':''} onPointerDown={e=>{e.preventDefault();choose(p);}} onClick={()=>choose(p)}>{p.label}<small>{p.source==='local'?'Offline suggestion':'OpenStreetMap / Photon'}</small></li>)}</ul>}
  <div className="field-help">Choose a place or keep your own text. Manual addresses are always allowed.</div>
  <label className="online-places"><input type="checkbox" checked={online} onChange={e=>setOnline(e.target.checked)}/> Worldwide locality suggestions</label>
  {online&&<p className="field-help">City/village names you type are sent to Photon. Keep house numbers and private street addresses manual. <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a></p>}
  <p role="status" className="field-help">{busy?'Searching places…':error||(online&&!isLocalityQuery(value)&&value.trim().length>=3?'Private/full address kept manual; no online lookup sent.':'')}</p>
 </div>;
}
