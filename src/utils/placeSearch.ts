export interface PlaceSuggestion {id:string;label:string;source:'local'|'photon';}
// Small, offline starting index, not a claim of complete geographic coverage.
const places=[
 'Rampur, Uttar Pradesh, India','Rampur, Himachal Pradesh, India','Rampur, Bihar, India',
 'Delhi, India','New Delhi, Delhi, India','Wazirabad, Delhi, India','Moradabad, Uttar Pradesh, India','Bareilly, Uttar Pradesh, India',
 'Lucknow, Uttar Pradesh, India','Hapur, Uttar Pradesh, India','Gajraula, Uttar Pradesh, India','Meerut, Uttar Pradesh, India',
 'Aligarh, Uttar Pradesh, India','Bijnor, Uttar Pradesh, India','Amroha, Uttar Pradesh, India','Sambhal, Uttar Pradesh, India',
 'Mumbai, Maharashtra, India','Pune, Maharashtra, India','Bengaluru, Karnataka, India','Hyderabad, Telangana, India',
 'Chennai, Tamil Nadu, India','Kolkata, West Bengal, India','Jaipur, Rajasthan, India','Bhopal, Madhya Pradesh, India',
 'Patna, Bihar, India','Srinagar, Jammu and Kashmir, India','Chandigarh, India','Ahmedabad, Gujarat, India',
 'Kochi, Kerala, India','Panaji, Goa, India','Guwahati, Assam, India','Dehradun, Uttarakhand, India',
 'Lahore, Punjab, Pakistan','Karachi, Sindh, Pakistan','Islamabad, Pakistan','Dhaka, Bangladesh','Kathmandu, Nepal',
 'Dubai, United Arab Emirates','Abu Dhabi, United Arab Emirates','Riyadh, Saudi Arabia','Jeddah, Saudi Arabia',
 'London, United Kingdom','Toronto, Ontario, Canada','New York, New York, United States','Sydney, New South Wales, Australia'
];
export function localPlaces(query:string):PlaceSuggestion[]{
 const q=query.trim().toLocaleLowerCase();if(q.length<2)return [];
 return places.filter(p=>p.toLocaleLowerCase().includes(q)).slice(0,6).map(label=>({id:'local:'+label,label,source:'local'}));
}
/** Online lookup is for locality names only, never precise/private address lines. */
export function isLocalityQuery(query:string):boolean {
 return query.trim().length>=3&&query.length<=80&&!/[\d@/\\#]/.test(query)&&query.split(',').length<=3;
}
export function photonPlaces(data:unknown):PlaceSuggestion[]{
 const features=(data as any)?.features;if(!Array.isArray(features))return [];
 const result:PlaceSuggestion[]=[];
 for(const f of features){const p=f?.properties;if(!p||typeof p.name!=='string')continue;
  // Do not offer house numbers or individual premises as locality suggestions.
  if(p.housenumber||['house','street'].includes(p.type)||(p.osm_key&&!['place','boundary'].includes(p.osm_key)))continue;
  const parts=[p.name,p.city||p.district||p.county,p.state,p.country].filter((x,i,a)=>typeof x==='string'&&x.trim()&&a.indexOf(x)===i);
  const label=parts.join(', ');if(!result.some(r=>r.label===label))result.push({id:`photon:${p.osm_type}:${p.osm_id}`,label,source:'photon'});
 }
 return result.slice(0,6);
}
const cache=new Map<string,PlaceSuggestion[]>();
export async function searchPlaces(query:string,signal:AbortSignal,fetcher:typeof fetch=fetch):Promise<PlaceSuggestion[]>{
 if(!isLocalityQuery(query))return [];
 const key=query.trim().toLocaleLowerCase();if(cache.has(key))return cache.get(key)!;
 const url=new URL('https://photon.komoot.io/api/');url.search=new URLSearchParams({q:query.trim(),limit:'6',lang:'en'}).toString();
 const response=await fetcher(url,{signal,credentials:'omit',referrerPolicy:'no-referrer'});
 if(!response.ok)throw new Error('Online suggestions unavailable. You can still type any address.');
 const results=photonPlaces(await response.json());
 if(cache.size>=40)cache.delete(cache.keys().next().value!);cache.set(key,results);return results;
}
