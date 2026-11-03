import React,{useEffect,useId,useRef,useState} from 'react';
import {CalendarDays,X} from 'lucide-react';
import {displayDate,parseDateInput,dateRangeError} from '../../utils/dateInput';
interface Props {label:string;value:string;onChange:(iso:string)=>void;min?:string;max?:string;onErrorChange?:(error:string)=>void;}
export function SmartDateInput({label,value,onChange,min,max,onErrorChange}:Props){
 const id=useId(),input=useRef<HTMLInputElement>(null),calendar=useRef<HTMLInputElement>(null);
 const [draft,setDraft]=useState(()=>displayDate(value));
 useEffect(()=>setDraft(displayDate(value)),[value]);
 const parsed=parseDateInput(draft),error=parsed.error||dateRangeError(parsed.iso,min,max);
 useEffect(()=>{input.current?.setCustomValidity(error);onErrorChange?.(error);},[error,onErrorChange]);
 function calendarChange(iso:string){if(!dateRangeError(iso,min,max)){setDraft(displayDate(iso));onChange(iso);}}
 function type(text:string){if(/^\d+$/.test(text)){const d=text.slice(0,8);text=d.slice(0,2)+(d.length>2?'/'+d.slice(2,4):'')+(d.length>4?'/'+d.slice(4):'');}const digits=text.replace(/\D/g,'');const formatted=/^\d*$/.test(text.replace(/\//g,'')) ? [digits.slice(0,2),digits.slice(2,4),digits.slice(4,8)].filter(Boolean).join('/') : text;setDraft(formatted);const p=parseDateInput(formatted);const err=p.error||dateRangeError(p.iso,min,max);input.current?.setCustomValidity(err);if(!err)onChange(p.iso);}
 return <div className="smart-date">
  <div className="smart-date-row">
   <input id={id} ref={input} aria-label={label} aria-invalid={!!error} aria-describedby={`${id}-help`} placeholder="DD/MM/YYYY" inputMode="numeric" autoComplete="off" value={draft} onChange={e=>type(e.target.value)} onBlur={()=>{if(!error)setDraft(displayDate(parsed.iso));}} />
   <label className="calendar-control" title={`Choose ${label} from calendar`}>
    <CalendarDays size={19} aria-hidden="true"/><span className="sr-only">Choose {label} from calendar</span>
    <input ref={calendar} type="date" aria-label={`${label} calendar`} value={value} min={min} max={max} onInput={e=>calendarChange(e.currentTarget.value)} onChange={e=>calendarChange(e.target.value)} onClick={e=>{try{e.currentTarget.showPicker?.();}catch{/* Native keyboard entry remains available. */}}}/>
   </label>
   <button type="button" aria-label={`Clear ${label}`} disabled={!draft} onClick={()=>{setDraft('');onChange('');input.current?.setCustomValidity('');}}><X size={16}/></button>
  </div>
  <p id={`${id}-help`} className={error?'field-error':'field-help'} aria-live="polite">{error||'Type DD/MM/YYYY or use the calendar.'}</p>
 </div>;
}
