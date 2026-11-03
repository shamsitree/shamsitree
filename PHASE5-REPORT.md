# ShamsiTree Phase 5 review

Upgrade based on main `5c9f30b4fa96f9c97c74d3522abd5bb0cfee9bf6`. Backup: `backup/before-phase5-20261103`. Development: `phase5-smart-form-tree`. Production is not approved for rollout.

## Changes
The existing MemberModal remains the single form. Dates now accept DD/MM/YYYY text, native calendar selection and clearing, with leap-year, future-date and life-order validation. Database values remain YYYY-MM-DD; calendar dates are never parsed through UTC.

Birth Place and Current Residence retain free typing. Offline suggestions include ambiguous Rampur results. Optional worldwide Photon lookup uses a 400ms debounce, cancellation, timeout and keyboard controls. Online lookup is opt-in: do not enter private street addresses for online searching. No secret API key is required. Photon’s public demo has no availability SLA; use a managed or self-hosted service if traffic grows. Public Nominatim is deliberately not used for autocomplete. See https://github.com/komoot/photon and https://operations.osmfoundation.org/policies/nominatim/ .

Before: Classic, Heritage and Album differed mainly in styling. After: Classic uses compact genealogy cards and straight connectors; Heritage adds a lazy SVG trunk, branches, leaves and flowers with sage cards; Album uses large portrait frames and separate household album pages. All share one indexed union/child model. Large families render a bounded initial child list and allow exploration. Decorations simplify for large families, low CPU counts and reduced motion. Classic is the error fallback.

## Safety and preview
No relationship-engine, production RPC, schema, RLS or authentication changes. No production data writes or migrations. The preview uses an editable local sample family and browser-local persistence, with local photos capped at 2MB. It reuses the existing form, dashboard and details components. Its CSP blocks production Supabase and its build uses a dummy Supabase URL plus the existing preview-only guard. Sample photographs start with attractive placeholders; local uploads can exercise real portraits.

IMPORTANT: This branch is a review build. Before any separately approved production rollout, disable VITE_PHASE5_SANDBOX and VITE_ENABLE_PREVIEW_ONLY, use production environment configuration, and restore the existing production Supabase connect-src entries alongside Photon in vercel.json. Do not promote this isolated review deployment as production.

## Executed verification
- Combined automated suite: 102 checks pass (88 existing plus 14 focused Phase5 checks).
- TypeScript: npm run lint passes (tsc --noEmit).
- Vite production build: passes. Review bundle CSS 53.06kB / gzip11.10kB, entry JS221.66kB / gzip69.47kB, lazy sandbox310.70kB / gzip83.81kB, lazy decoration1.69kB / gzip0.85kB.
- Date typing/calendar/clearing, invalid dates and leap years: component/pure-function tests pass.
- Address manual/keyboard selection, opt-in debounce, cancellation, failure and privacy guards: tests pass.
- Anwar’s Ghani/Ruhi Kamal and Sidra/Ruhi Fakhir branches, shared father and half siblings: pass.
- All three views retain focus, callbacks and input data: pass.
- Local sample save/edit/serialization/reload: pass.
- Node benchmark: 1209 members, indexed bounded scene 1.26ms in one recorded run; not a mobile/browser performance guarantee.

Chrome desktop visual checks confirmed distinct Classic, Heritage and Album layouts, correct visible marriage branches, invalid-date save blocking, leap-day text synchronization, Rampur keyboard selection and sample persistence after reload. Expired preview access triggered the Classic fallback successfully; renewing access restored Heritage. Calendar input now handles both native input and change events. Live provider availability, physical mobile devices, print hardware and full production persistence are not claimed by these automated checks. Production records must never be used for destructive testing. Native calendar UI depends on the browser.

## Changed files
MemberModal.tsx, FamilyTreeViewer.tsx, index.css, main.tsx, package.json, vercel.json; new SmartDateInput.tsx, PlaceAutocomplete.tsx, HeritageDecoration.tsx, Phase5Sandbox.tsx, dateInput.ts, placeSearch.ts, familyViewModel.ts, sandboxSave.ts, phase5Family.ts, tests/phase5.tsx and this report.

## Rollback
Production is unchanged, so no production rollback is needed. Remove the preview branch alias/deployment to retire the review. Source backup is backup/before-phase5-20261103 at the baseline SHA above. If changes are later merged with explicit approval, revert the Phase5 commits through a reviewed PR and redeploy the known-good commit. No database rollback is required because Phase5 makes no schema or production data changes. Reset sample data only clears the isolated preview’s versioned browser-local sample.

Preview: https://shamsitree-phase5-preview.vercel.app/ (Vercel share access required; supplied separately). The review share link expires 10 November 2026 UTC.
