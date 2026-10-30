import {createRoot} from 'react-dom/client';
import './index.css';
const root=createRoot(document.getElementById('root')!);
// The isolated demonstration is explicitly selected and does not load Supabase.
if(new URLSearchParams(location.search).get('demo')==='phase2'){
 import('./components/Phase2Demo').then(({default:Demo})=>root.render(<Demo />));
}else{
 import('./App').then(({default:App})=>root.render(<App />));
}
