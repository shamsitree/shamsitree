# ShamsiTree: first safety milestone, 30 October 2026

This archive contains limited, tested React changes. It is not a completed implementation of the master prompt. No production or database changes were made.

## Changes
- Paginate members, unions and child links in App and integrity checker using stable ID order; reject failed pages instead of accepting partial results. Member tree-selection counts now use an exact count query.
- Direct adopted, foster and step parent/child labels distinguish the recorded relationship type in English, Urdu and Hindi. Biological labels remain unchanged. Extended adoption-aware kinship remains unfinished; the existing union-level parentage model cannot describe mixed biological/adoptive parent roles reliably.
- Replace unconditional kinship PASS with actual internal-consistency comparisons over up to 20 members. This is not proof of genealogical correctness. Third-parent database rejection is explicitly SKIP because no rejection test was performed.
- Resolve npm peer dependency conflict: esbuild ^0.25.0 -> ^0.28.0, compatible with installed Vite 8.3.5; include package-lock.json. Existing bun.lock is unchanged and was not validated. Use npm for this snapshot.

## Verification
- node tests/safety.mjs: 10 checks PASS (direct biological/adopted/foster/step labels in both directions, disconnected people, 1201-row pagination, empty data, failed second page, malformed response, invalid page size).
- npm run lint: PASS (TypeScript noEmit).
- npm run build: PASS. Warnings: legacy __dirname Vite config and bundle above 500 kB. No browser/UI test executed.
- All four original backups compared byte-for-byte to uploaded ZIP: PASS. SHA-256 hashes are in backups/SHA256SUMS.txt. .bak suffix keeps backups out of TypeScript compilation.
- Initial npm installation failed on the original esbuild/Vite peer conflict. Installation passed after the dependency fix. Initial typecheck included backup source files and failed; excluding them via .bak filenames resolved those errors; final typecheck passed.
- No live authentication, uploads, RLS, database constraints, concurrent edits, save/delete, migrations or deployment tests executed.

## Explicitly unfinished / stop point
The master prompt requires stopping when safe rollback needs a database function/schema change. Add Father/Mother and multi-record save/delete need a verified database schema and a server-side transaction before a reliable atomic implementation can be made. Those write paths have deliberately not been modified. Existing partial-save and deletion risks remain. No delete-and-recreate rollback was added. Need current schema (columns, keys, constraints, policies and existing functions) to prepare the next implementation. Cross-tree identity links, approvals and disconnect behavior remain unimplemented.

Standalone public/ShamsiTree_7.8_Unified.html and 7.7 backup HTML are unchanged and do not contain these React fixes. The existing standalone download button still opens the old file. Use the React source for this milestone. No version label is claimed as a finished 7.8 release.

## Run / rollback
Use Node 24, npm ci, then npm run dev. Configure Supabase using the original .env.example instructions. Test in an isolated environment before production.
Restore a modified file by copying its corresponding backups/original/<path>.bak over it. Remove the newly added loadAllRows.ts if restoring App and TestRunner; restore package.json and remove the new package-lock.json to return to the original dependency files. New tests/report/patch can be removed independently. No data rollback is necessary because no live data was touched.
