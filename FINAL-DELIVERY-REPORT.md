# ShamsiTree 13-style delivery — 4 November 2026

Preview source commit: 8ba1ead54f9198bc76df90567b9c8a2d52b7b489. Development branch feature/13-styles-final. No main merge, production deployment, database write or schema/security-policy change performed in this delivery.

## Completed implementation
Reused uploaded designs, authenticated unified application and transactional save. Fixed demo-first/empty-family fallback, real-ID selection, named user/tree-scoped browser views, readable natural-size genealogy cards, bounded scroll canvas and initial card positioning. Gallery choices support Enter/Space. Smart date numeric entry and 1800–2100 validation retained. PNG failure was reproduced as a Chrome tainted-canvas SecurityError. Replaced the failing export with on-device rendering, bounded canvas allocation, busy/error handling, and computed SVG card styles. Export library is lazy loaded (12.5kB /4.97kB gzip).

## Actual verification
PASS: clean npm ci before changes; pinned export dependency installation; final npm test suite, TypeScript and Vite build. Suite includes original genealogy/transactional safety, kinship/adoption/foster labels, adapter, supplied genealogy fixtures, all13 component server render and non-demo-ID exactly50-of100 selection/no mutation.
PASS Chrome across review builds: all13 styles keyboard switching without timeouts in the rerun; 50/100 selection; saved named50 view after refresh and reload; numeric date15081980 becomes15/08/1980; backspace; calendar leapday; year1799 error; natural-size cards readable and auto-positioned.
PASS final Chrome PNG: six-member file downloaded and visually opened with frames, colours, names, lines and half-sibling labels. 100-member export downloaded: 11638x1375 pixels,2296493 bytes. Download-event observer timed out even though the browser wrote the files; file existence and image inspection supplied the verification.
Final build READY. Existing preview has no production credentials or private family data; isolated fictional records are clearly labelled. Main App/auth/save source remains available for a later separately approved production configuration.

## Honest limitations
No physical mobile device/keyboard or mobile viewport emulation was available. Cursor-middle date editing, print output on hardware/PDF, every13-style PNG/photograph variant and every relationship-line geometry in all designs have not been exhaustively accepted. Browser Print action was exercised but no printable artifact was captured. Fan/radial ancestor views retain supplied subset semantics. Multi-parent adoption visualization is limited by the supplied studio model (one father,mother and relationshipType); engine tests do not prove all-style visual lineage coverage. Mouse-only interaction timeouts from earlier browser runs were not conclusively attributed; keyboard switching passed. Production login and real-data saving were deliberately not exercised by writing private records.

## Rollback
Retire this development preview or revert its commits on the development branch. No database rollback is needed. Do not promote review builds: dummy Supabase environment and preview CSP are intentional. Production rollout still requires explicit separate approval and production configuration validation.
