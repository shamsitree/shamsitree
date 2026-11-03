# Validation — 3 November 2026

## Changes

Compatible esbuild/Vite dependencies and npm lockfile; test runner without IPC;
one RPC for member/relationship saves; family-scoped relationship policies.
Applied Supabase migration: `unified_atomic_member_save_and_family_access`.
The new RPC is SECURITY INVOKER with an empty search path; anonymous execution is denied.
Only the committed response changes the React app state. No delete/recreate rollback.

## Passed

- 61 local automated checks (including 6 new client checks).
- TypeScript and production Vite build.
- 11 live PostgreSQL test groups:
  1. Abdul Mannan → Anwar Kamal, two marriages, Abdul Ghani under Ruhi Kamal and
     Sidra Kamal under Ruhi Fakhir.
  2. Stable draft retry creates no duplicate member or child link.
  3. Relationship failure rolls back member and spouse-union inserts.
  4. Circular ancestry fails and member-field edits roll back.
  5. Adding a mother changes only the selected child, preserving sibling parentage.
  6. Parent reassignment preserves other marriages and children.
  7. Invited editor can save.
  8. Viewer reads but cannot RPC-save, update a union, or delete child links.
  9. Unrelated user cannot access the family or create cross-family unions.
  10. Anonymous RPC execution denied.
  11. All fixture rows roll back; original row counts unchanged.
- REST smoke check: anonymous RPC call returns HTTP 401 / SQLSTATE 42501.
- Catalog checks: function is invoker, authenticated execution allowed, anonymous
  execution denied, zero unrestricted relationship policies remain.

Database tests use existing identity IDs with database-local role/JWT subject
simulation, not passwords. No accounts were modified. All fixture writes roll back.
After tests: family_trees=1, family_members=0, family_unions=0, family_children=0.

## Limits

- No owner-account browser login, deployed save/reload check, GitHub push, or Vercel deployment.
- RPC calls serialize per family with a transaction advisory lock. No concurrent-session
  stress test was run. Older clients writing directly do not participate in that lock.
- Photo uploads remain separate; a failed member save may leave an uploaded photo.
- `public.memories` remains missing; cross-tree connection remains an in-memory demo.
- Existing standalone HTML and nested operational archives retain their older save logic.
- Security advisors show the same pre-existing warnings before and after: 9 mutable
  function search paths, 23 anonymous-callable and 23 authenticated-callable legacy
  SECURITY DEFINER functions, and disabled leaked-password protection. The new RPC
  adds none of those warnings. Legacy function review remains outside this change.

Advisor references:
https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable
https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
