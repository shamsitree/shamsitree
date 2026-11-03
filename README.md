# ShamsiTree Unified 7.8

The existing Google AI unified dashboard and family viewer are preserved.

## Run

Tested on Node.js 24. Run `npm ci`, copy `.env.example` to `.env.local`, configure
Supabase URL/publishable key, then `npm run dev`. Keep `VITE_ENABLE_PREVIEW_ONLY=false`
for real email/password login and saving. Never put a service-role key in browser variables.
Use `npm test`, `npm run lint`, and `npm run build` for checks and production build.

## Atomic member saving

The React app now calls `save_unified_member` once per save. Member fields, spouse
branches and child links commit together or roll back together. Stable draft IDs make
retries reuse the same person. No member is deleted/recreated to undo a failed save.
Changing one child's parentage preserves sibling parentage and shared marriage records.

Applied to project `qhobvzbjbsbtmorllnjz` on 3 November 2026:
- `database/relationship_access.sql`: family-scoped read/write permissions.
- `database/atomic_member_save.sql`: authenticated, SECURITY INVOKER transaction function.

These files preserve the applied SQL source; do not replay the access-policy script on
this same project. It expects the original policy names. A different database first
needs the full existing ShamsiTree schema and `has_tree_access` function.

## Validation and deployment

See `VALIDATION.md`. Live database tests in `tests/database-atomic.sql` roll back all
fixtures. They simulate authenticated identities inside PostgreSQL, without passwords.
This source ZIP has not been pushed to GitHub or deployed to Vercel. Publish the root
React/Vite app (`dist` output) with its Supabase environment variables, then test a real
user login, save and reload in the browser.

Photo upload is a separate storage operation. Memories still need the missing memories
table. Cross-tree connection remains an isolated simulation. The standalone HTML and
nested operational archives are older exports and do not use the new atomic save flow.
Use the root React/Vite application for this update.

## Backups

`backups/App.before-atomic.tsx.bak`, `backups/kinshipEngine.before-atomic.ts.bak` and
`backups/database-policy-audit.json` preserve the prior code and relationship policies.
The kinship engine was not changed. The original uploaded ZIP is also retained locally.
Restoring old relationship policies reopens the access issue; avoid routine restoration.
