# ShamsiTree Form A1 — Safe Migration Plan (Draft)

Status: Draft only. No SQL in this document has been applied to Supabase.
Target: existing Supabase project `qhobvzbjbsbtmorllnjz`.
Branch: `form-a1-foundation`.

## Current verified baseline

- Public tables include `family_members`, `family_trees`, `relationships`, `family_member_relationships`, `family_unions`, `family_children`, `tree_permissions`, and tree-connection tables.
- Main tables inspected currently report zero rows; re-check immediately before any migration.
- `family_members` requires `tree_id`, so person records are currently tree-scoped.
- `family_unions` requires `partner1_id`, permits nullable `partner2_id`, and stores union metadata.
- `family_children` requires `family_union_id`; this prevents representing parentage independently of a union.
- `relationships` permits only `parent`, `child`, `spouse`; `family_member_relationships` can store arbitrary relationship labels. These can disagree.
- Migration listing returned no recorded migrations. This is a warning to inspect how schema changes have been managed, not proof that no SQL history exists anywhere.
- Broad authenticated policies using unconditional `true` were observed on `family_unions` and `family_children`. Review all policies and app access patterns before modifying them.

## Migration principles

1. Do not alter or drop existing tables in the first migration.
2. Do not apply anything to production until a recovery/backup path and rollback plan are verified.
3. Add authoritative direct parent-child assertions while preserving current tables for compatibility.
4. Keep unions and union partners independent from parentage.
5. Do not automatically migrate generic relationship labels into authoritative parentage without a reviewed mapping; a label like “uncle” is not enough to infer all underlying people and generations.
6. Avoid a production identity-table conversion until the app has a verified membership model. Current `family_members.tree_id` means cross-tree person identity needs an explicit linking/identity design.
7. All new tables must have RLS enabled before being exposed through Supabase APIs.
8. New write paths must validate tree membership, authorization, same-tree references, self-parenting and cycles server-side.
9. Every schema change must have repeatable tests and a documented rollback or forward-fix strategy.

## Proposed additive phases

### Phase 0 — Complete inventory and recovery
- Export schema, policies, functions, triggers, indexes, storage bucket policies and current row counts.
- Review repository history and any app code that writes to the legacy relationship tables.
- Confirm a usable database backup or recovery point, and document how restoration would be tested.
- Re-check production counts and compare against expected empty state.
- No schema changes in this phase.

### Phase 1 — Additive core relationships (draft design)
Add new tables without removing legacy tables:
- `parent_child_relationships`: `id`, `tree_id`, `parent_member_id`, `child_member_id`, `parent_role`, `relationship_type`, `assertion_status`, `source_id`, `created_by`, `created_at`, `updated_at`.
- `union_partners`: `id`, `tree_id`, `union_id`, `member_id`, `partner_role`, `valid_from`, `valid_to`, `created_at`. This allows a junction model without deleting legacy partner columns.
- `relationship_sources`: source kind, description/reference, confidence/status, submitted_by, timestamps.
- `person_aliases`: tree-scoped alias rows linked to a member, language/script, alias type, normalized search form.
- `relationship_audit` or equivalent append-only event table for corrections and review decisions.

Exact column types, uniqueness constraints, foreign keys and indexes must be finalized after reviewing the complete schema and all existing app write paths. Use `family_members.id` in the first compatibility stage; cross-tree global identity is a later separately tested migration.

### Phase 2 — Security before app writes
- Replace any broad `USING (true)` / `WITH CHECK (true)` policy only after owner/editor/viewer behavior has been defined and tested.
- A tree owner can administer the tree; a tree editor can edit allowed records; a viewer can read only. A user without access cannot read or mutate any tree row.
- Test SELECT, INSERT, UPDATE and DELETE as owner, editor, viewer, and unrelated authenticated user.
- Ensure referenced members belong to the declared tree; reject cross-tree parentage unless a separately authorized connection workflow explicitly supports it.
- Review storage policies for family photos separately.

### Phase 3 — Relationship engine
- Treat `parent_child_relationships` as authoritative parentage and `union_partners`/legacy union metadata as partnership facts.
- Do not derive parentage merely because a child is associated with a union.
- Server-side bounded recursive CTE or BFS, selected after query-plan and load tests.
- Cycle checks must be transactional and account for concurrent edits.
- Return multiple plausible kinship paths and uncertainty; never silently pick the shortest path as the only truth.

### Phase 4 — Controlled compatibility
- Build dual-write or controlled API writes only after tests prove transaction safety.
- Compare old and new relationships for every test fixture.
- Keep old tables untouched until the new path passes acceptance tests and a rollback window has passed.
- Any future removal of legacy columns/tables requires a separate approved migration.

## Minimum test fixture and acceptance criteria

Create a disposable test tree, not production data, with:
- Parent A with two partners and children assigned to different known parents.
- Child with one known parent and no fabricated second parent.
- Unmarried parents.
- Biological and adoptive parent links for the same child where applicable.
- Half-siblings sharing one parent.
- Cousin marriage yielding multiple valid paths.
- Two different people with identical names and aliases in different scripts.
- A disputed relationship with source and review status.
- A cycle attempt and self-parent attempt.
- Two trees and four test users (owner, editor, viewer, unrelated user).

Pass conditions:
1. No child is automatically attributed to all partners in a union.
2. One known parent can be saved without a fake spouse/person.
3. Cross-tree links fail unless an explicit authorized rule permits them.
4. Cycle/self-parent attempts fail atomically.
5. Every unauthorized SELECT/INSERT/UPDATE/DELETE is denied.
6. Duplicate names never auto-merge people.
7. Relationship engine reports both plausible paths or a clear ambiguity status.
8. Corrections retain source and prior-state audit data.
9. Legacy Form B behavior and Smart Safar files remain unchanged.
10. Query latency is measured on representative fixtures; no untested fixed latency promise.

## Current blocker before production SQL

The architecture and schema findings are documented, but a safe executable migration is not yet approved. The remaining prerequisite is to complete the app/repository inventory and verify recovery, then test RLS and relationship constraints in an isolated development database. Do not paste or execute a draft migration in production before that gate.
