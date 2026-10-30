# Phase 4 Unified direction — partial completion
## Product decision
One unified family experience. Earlier separate Form A/B requirements are superseded. No separate forms introduced. Continue Phase 3 React source with Google's attached application as reference.

## Comparison and actual UI changes
GOOGLE-COMPARISON.txt compares reference with Phase 3 BEFORE edits. Dashboard, Navigation, original FamilyTreeViewer, Memories, detail modal and types were identical, so no replacement/redesign was needed.
FamilyTreeViewer: parent, spouse and child card clicks now change focus; focus card still opens details/edit/photos. Focus is green regardless of creator. Member dropdown preserved and given accessible label. Single-parent children remain visible even if other marriage branches exist (previous conditional hid them). Each marriage Add Child passes its specific union via App to MemberModal, which prefills the recorded parents. Uses existing gender-based father/mother slots; atypical/mixed parentage needs more work. No relation is written when navigating focus. Parents/descendants explored by successive focus, not unlimited simultaneous expansion. All source record identities preserved.
Existing Google dashboard counts, header, gender colors, kinship finder, memories, multilingual machinery, print/export preserved. Original standalone HTML remains unchanged; corrections are in src/main.tsx -> src/App.tsx and components.

## Tests actually executed
npm test: 46 checks pass (16 original safety, 16 isolated workspace, 5 delete, 4 retry, 5 real React component checks). npm run lint and npm run build pass.
New React component tests invoke actual card handlers: Abdul Ghani -> Anwar Kamal -> Abdul Mannan -> Anwar Kamal -> Sidra Kamal; focus card opens details; exact marriage callback passes second union; single-parent child still visible; fixture bytes unchanged after navigation. Existing engine checks verify Ghani/Sidra paternal half-siblings and correct mothers.
Component renderer is NOT a browser. No live database or isolated database save/reload journey executed. Earlier Chromium installation failed; browser testing remains unavailable. New test runner dependency deprecated warning, Node stripTypes experimental warning, Vite __dirname warning remain. Initial tsx CLI failed due IPC permissions; node --import tsx executed tests successfully. Missing renderer declarations corrected and final typecheck passed.

## Persistence/security
Phase 3 draft retry IDs, upload ID reuse, deletion reference checks and error handling retained. No new persistence writes/schema changes in Phase 4. Previous read-only database findings remain unresolved: permissive authenticated union/child RLS, cascading deletion, missing verified database transaction enforcement. The copied review SQL is NOT applied. Client checks do not prevent concurrent races. Quick-add Father/Mother and parent reassignment remain guarded. Full atomic save, existing-relative selection and every requested per-card action are NOT completed.

## Two-family status
Phase 2 memory workspace and demo retained as simulation only. Existing production connection functions were discovered in Phase 3 but not fully audited or integrated. No real cross-family proposal/approval/disconnect tested. No automatic identity merges.

## Readiness and remaining work
NOT production-ready. This is a genuine unified React UI correction milestone, not completion of the full Phase 4 scope. Need transactional backend and RLS migration reviewed/tested in isolated database, real save/reload and ownership tests, full quick-add/edit relative workflows, cross-family persistence, and browser mobile/print validation. No production data/auth/GitHub/Vercel change performed. To test locally: npm ci; npm test; npm run dev. Use isolated test configuration for save testing. Current source still points at existing Supabase project; do not enter real records for testing.
