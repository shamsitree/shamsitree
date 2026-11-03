/** Calendar dates only. No UTC parsing, Date(string), or timezone conversion. */
export function todayISO(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}
export function validISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y,m,d]=value.split('-').map(Number);
  if(y<1||m<1||m>12||d<1)return false;
  const leap=y%4===0&&(y%100!==0||y%400===0);
  return d<=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31][m-1];
}
export function displayDate(value: string): string {
  if(!value)return '';
  if(!validISODate(value))return value; // Never silently rewrite a legacy value.
  const [y,m,d]=value.split('-');return `${d}/${m}/${y}`;
}
export function parseDateInput(text: string): {iso: string; error: string} {
  if(!text.trim())return {iso:'',error:''};
  const match=text.trim().match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  if(!match)return {iso:'',error:'Use DD/MM/YYYY, for example 19/04/1980.'};
  const iso=`${match[3]}-${match[2].padStart(2,'0')}-${match[1].padStart(2,'0')}`;
  return validISODate(iso)?{iso,error:''}:{iso:'',error:'This calendar date does not exist.'};
}
export function dateRangeError(iso: string,min?:string,max?:string):string {
  if(!iso)return '';
  if(!validISODate(iso))return 'Please enter a valid date.';
  if(Number(iso.slice(0,4))<1800||Number(iso.slice(0,4))>2100)return 'Year must be between 1800 and 2100.';
  if(min&&iso<min)return `Date cannot be before ${displayDate(min)}.`;
  if(max&&iso>max)return `Date cannot be after ${displayDate(max)}.`;
  return '';
}
export function validateLifeDates(dob:string,dod:string,today=todayISO()):string {
  return dateRangeError(dob,undefined,today)||dateRangeError(dod,dob||undefined,today);
}
