import { PREVIEW_ONLY, PREVIEW_MESSAGE } from './previewMode';
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = "https://qhobvzbjbsbtmorllnjz.supabase.co";
export const SUPABASE_KEY = "sb_publishable_tRIMQFqiZu-tSRownnMMxQ_wjch-orJ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, PREVIEW_ONLY ? {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { fetch: async () => { throw new Error(PREVIEW_MESSAGE); } }
} : undefined);
