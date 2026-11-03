import { PREVIEW_ONLY, PREVIEW_MESSAGE } from './previewMode';
import { createClient } from '@supabase/supabase-js';

const getEnv = () => {
  if (typeof import.meta !== 'undefined' && (import.meta as any)?.env) {
    return (import.meta as any).env;
  }
  if (typeof process !== 'undefined' && process?.env) {
    return process.env;
  }
  return {};
};

const env = getEnv();

export const SUPABASE_URL = env.VITE_SUPABASE_URL || "https://qhobvzbjbsbtmorllnjz.supabase.co";
export const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY || "sb_publishable_tRIMQFqiZu-tSRownnMMxQ_wjch-orJ";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  PREVIEW_ONLY
    ? {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: {
          fetch: async () => {
            throw new Error(PREVIEW_MESSAGE);
          },
        },
      }
    : {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
);

