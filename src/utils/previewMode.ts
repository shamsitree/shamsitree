// Live database access is opt-in. Preview deployments remain isolated by default.
const env = import.meta.env;
export const PREVIEW_ONLY = env.VITE_ENABLE_LIVE_SUPABASE !== 'true';
export const PREVIEW_MESSAGE = 'Visual preview only: saving, deleting, authentication and photo uploads are disabled. No production data is connected.';
