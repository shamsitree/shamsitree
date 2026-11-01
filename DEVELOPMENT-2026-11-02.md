# ShamsiTree development checkpoint — 2 November 2026

## Source and recovery

The actual default branch was empty of application files at commit `144548a768bf28764e314f9d5c2f697f997bda00` (Remove old ShamsiTree HTML before rebuilding Form A from scratch). Recovery branch: `recovery/before-development-2026-11-02`. Git history still preserves the earlier application. The production Vercel alias points to that same empty commit; READY alone did not establish a working application.

Compared the current Library deployment-ready archive, Unified Corrected (3), and the Safety Patch Working Copy. The deployment-ready and Corrected (3) React source trees match exactly. Restored the deployment-ready React/Vite application, including its dashboard, directory, kinship finder, memory module source, diagnostics and historical HTML. App.tsx and kinshipEngine.ts backups are under `backups/2026-11-02/`. Historical HTML is preserved in `archives/`, outside the public build, because it contains unaudited independent save paths. No smaller replacement demo was substituted.

Frontend: React 19, TypeScript, Vite, Tailwind. Backend: direct browser Supabase Auth/PostgREST/Storage; no application server or atomic save endpoint in this archive. Dependencies installed from package-lock.json via npm ci. No service-role key was found in the active client; its embedded key is publishable.

## Implemented

- Form B reachable without authentication, isolated from Supabase and other trees. Uses the existing tree viewer, profile editor, detail view and kinship finder.
- Versioned device persistence, explicit saved status, JSON export/import validation, quota failure propagation, stale-window rejection, Web Locks coordination. Device-only storage is clearly labelled; this is not cloud persistence or a service-worker offline application.
- Separate exact marriage/child links. Adding a second known parent updates only the selected child's association in one local snapshot; shared unions and siblings are never rewritten.
- Add Father/Mother/Spouse/Child, existing-person reuse, duplicate-name confirmation, required name, dates, local photo, biradari, notes and a small static city suggestion list. No Form B phone input.
- Cycle, cross-family, duplicate ID/link and ambiguous lineage checks. Form B limits spouses to three; the shared graph planner permits unlimited spouses for future Form A integration. Deep ancestry validation tested at 1,500 people.
- All cards open details, focus selector navigates relatives, zoom, scrolling, three themes and progressively expandable ancestor/descendant branches.
- Print/PDF uses a separate branch register with parenting pairs and exact children, avoiding horizontally clipped cards. It is not a complete graphical poster export; very large branches may still span pages.

## Live database findings (read-only)

Project `qhobvzbjbsbtmorllnjz` is ACTIVE_HEALTHY. Actual count queries returned zero members, zero unions and zero children. This does not establish that browser-local family trees or other archives are empty.

RLS is enabled, but all four policies on both family_unions and family_children allow authenticated users unconditionally. Storage write policies check only the family-photos bucket, not the owner; the bucket is public. The existing has_tree_access helper checks owner/editor/viewer roles. Legacy relationship tables and RPC functions coexist with the union model. Foreign keys cascade on member/union deletion. The misleading family_children_not_same_as_parent constraint checks only child_id IS NOT NULL. No uniqueness constraint on biological parentage was returned by the constraint inspection.

Security advisors also report mutable function search paths; see [Supabase guidance](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable). These legacy functions were not modified.

Cloud mutation paths in this new build are paused: member edits, deletions, relationship writes, automatic tree creation and photo/memory uploads. This protects users of this build but DOES NOT fix the live database or prevent direct API access/older clients. Authentication and existing tree reading remain available. New account authentication has not been end-to-end tested.

## Approval proposal

`database/REVIEW_ONLY_ownership_forward.sql` tightens the eight relationship policies using has_tree_access and same-tree endpoint checks, and three photo write policies using the existing user-ID folder convention. It changes policies only, does not delete/reassign records, and preserves public photo reading. The paired rollback script restores the original predicates, including their weaknesses. Both scripts end in ROLLBACK by default and have NOT been applied or executed against production.

Impact: unrelated authenticated users lose relationship access; viewers lose write access; uploads outside the signed-in user's folder stop working. Existing files remain. Legacy flat photo paths will need individual review before edits. Public photo privacy requires a separate approved change and signed-URL work.

Before applying: re-read current policies for drift; stage with owner/editor/viewer/unrelated users; confirm endpoint isolation and photo permissions; apply transactionally only with owner approval. Policy hardening alone does not supply atomic saves, idempotency, unique parentage or cycle enforcement. An audited transactional database operation is still required before enabling cloud relationship edits.

## Validation and limits

62 automated checks passed: 16 safety/kinship/pagination, 16 isolated historical reference-engine checks, 5 deletion mocks, 4 retry mocks, 5 viewer checks, 16 new graph/storage checks. TypeScript and Vite production build passed. These are not 62 live database tests. The critical six-person fixture is covered for exact branches, profile edits, rejected reassignment, retry, serialization/reload and shared-single-parent isolation.

Local Chromium installation failed because the downloaded archive was invalid. Browser/deployment verification status will be recorded after preview inspection. No real family records, schema, RLS policies or photos were changed.

Remaining: live atomic Form A builder, authenticated save/reload and multi-user integration tests, relationship/marriage replacement workflow, full graphical print layout, global location autocomplete, mobile-browser verification, and the voice-agent requirements (the supplied prompt ended at that heading). Do not describe this checkpoint as a complete production release.
