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
export const PREVIEW_ONLY = env.VITE_ENABLE_PREVIEW_ONLY === 'true';
export const PREVIEW_MESSAGE = 'Visual preview only: saving, deleting, authentication and photo uploads are disabled.';

