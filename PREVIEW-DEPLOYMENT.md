# Phase 4 isolated visual preview
Source: ShamsiTree_Phase4_Unified_Corrected(3).zip supplied by user.
Original React dashboard, tree, forms, relationship engine and themes retained.
Preview-only changes: fictional memory fixture; auth/load/save/delete/upload guards;
Supabase fetch disabled; no stored auth sessions; CSP connect-src self;
legacy public apps excluded from build because they connect to production.
Standalone export disabled in preview; tree printing retained.
No environment secrets required. Publishable Supabase key in original source is not a secret.
No SQL executed. Database proposal file is review-only.
Original archive backups, duplicate old HTML assets, patches, node_modules and dist are not uploaded.
Source of standalone 7.8 export is retained in public but is not deployed.
Build: npm ci, npm run build; Vite, output dist, Node 24.
Main recovery commit: 144548a768bf28764e314f9d5c2f697f997bda00.
Recovery branch: backup/pre-phase4-20261031.
Existing upstream limitations: quick-add parents guarded; no verified atomic saves or production RLS safety. This deployment does not repair these features.
