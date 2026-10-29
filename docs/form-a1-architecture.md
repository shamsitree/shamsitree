# ShamsiTree Form A1 — Architecture Decision Record (ADR-001)

Status: Initial design baseline; **not yet applied to the production database**.
Branch: `form-a1-foundation`
Scope: Form A1 only. Form B and Smart Safar remain out of scope.

## 1. Core decision

Use a normalized hybrid kinship graph:

- **Person**: stable UUID for an individual.
- **Tree membership**: explicit association between a person and a family tree, with visibility/edit permissions.
- **Parent-child assertion**: direct, authoritative link from one known parent to one child, with parent role, relationship type, confidence/status, source, and audit metadata.
- **Union**: a marriage/partnership event, separate from parentage.
- **Union partners**: junction rows; do not hard-code exactly two partner columns in the long-term model.
- **Union-child association**: optional context only, not the source of truth for parentage. A child can have one known parent without a fake spouse or fake person.

This resolves the apparent disagreement between “direct parent-child edges” and “union-centric” proposals: keep unions and their partners, but never infer that every child of a union belongs to every partner. The child’s parentage is recorded explicitly per parent. If evidence says a child is associated with a union, record that as context separately.

## 2. Why not the alternatives?

### Union-only parentage
Rejected as the sole source of truth because the current `family_children.family_union_id` is required. This forces every child through a union even where only one parent is known, and risks assigning all union partners as parents.

### Generic direct edges for every named kinship term
Rejected as the authoritative model. Storing “uncle”, “cousin”, “grandfather”, etc. beside parentage creates contradictory facts. These are computed from primitive links, unless the relationship is a separate social/legal assertion that cannot be derived (for example, guardian or disputed relationship).

### Parent pointers directly on the person row
Rejected because it limits parent counts/types and mixes facts with profile data; it also complicates adoptive/biological distinctions, sources, disputes and history.

## 3. Logical entities

Names below are conceptual; existing tables must not be renamed/dropped until a migration plan is reviewed.

- `people`: stable person identity and profile attributes.
- `family_trees`: tree metadata and owner.
- `tree_memberships`: person-to-tree membership plus role/access; membership is distinct from identity.
- `parent_child_relationships`: `parent_person_id`, `child_person_id`, `parent_role` (father/mother/unknown), `relationship_type` (biological/adoptive/step/foster/guardian/other), `status` (asserted/confirmed/disputed/rejected), source, created_by, timestamps.
- `unions`: union type, status and dates/places.
- `union_partners`: union-to-person links with role/status and optional dates.
- `union_child_context` (optional): child-to-union association only when evidenced; must not itself create parentage.
- `person_aliases`: script/language/alias type and normalized search value.
- `relationship_sources` / audit history: source evidence and change history.
- Explicit merge/link workflow: suggested matches are not auto-merged; all merges require authorization and reversible audit.

The exact physical schema will be designed after checking all current constraints, RLS policies, indexes, triggers, storage and app usage.

## 4. Relationship engine

- Run server-side only; never download the full graph to the browser.
- Start with bounded recursive PostgreSQL CTEs or server-side BFS after benchmarking. No shortest-path-only assumption.
- Return multiple plausible paths where the data supports multiple relationships; identify uncertainty and missing links.
- Use a separately tested terminology mapper for Urdu, Shahmukhi Punjabi, Gurmukhi Punjabi and English.
- Age alone must not be treated as proof of “taya” versus “chacha”; birth order and cultural terminology need an explicit rule/data source. If unknown, use a neutral label such as “father’s brother”.
- Prevent self-links and ancestry cycles with transactional server/database validation. Validate concurrent writes as well.

## 5. Security baseline

- RLS on every exposed table.
- Read access requires membership/view permission for the relevant tree; write access requires editor/admin permission.
- A relationship may not connect people across trees unless an explicit authorized connection rule permits it.
- SECURITY DEFINER functions must use a fixed safe search_path and minimal grants.
- No service-role secret in client code.
- Search results and kinship paths must be filtered by the caller’s authorized scope.
- Photos must use private storage policies and signed access as appropriate.
- Test using at least two separate authenticated users and two trees.

## 6. Search and performance

- Keep name search separate from graph traversal.
- Add aliases and normalized name forms; consider `pg_trgm` and full-text search after testing multilingual behavior.
- Lazy-load visible branches and bounded relationship results.
- Add indexes based on actual traversal/search query plans.
- Cache only after correctness is established; invalidate caches when parentage/union data changes.
- Do not promise latency targets until measured against representative data.

## 7. Acceptance tests

1. A person with three unions can have children explicitly linked to different known parents; no child is automatically assigned to all partners.
2. A child with only one known parent saves without creating a dummy person or dummy spouse.
3. Unmarried parents, biological/adoptive/foster relationships and disputed assertions can coexist without overwriting one another.
4. Half-siblings are derived from a shared parent; no sibling relationship is manually required.
5. A person can be visible in multiple trees only through explicit authorized membership/linking.
6. Similar names/aliases produce suggestions, never automatic identity merges.
7. Cycles and self-parentage are rejected transactionally.
8. A user cannot read, insert, update or delete data in a tree without the appropriate role.
9. Multiple valid kinship paths are returned or clearly marked ambiguous.
10. Corrected assertions retain source and audit history; recovery procedure is documented and tested.
11. Search and kinship traversal are tested at small, medium and representative larger data sizes.
12. The existing Form B and Smart Safar modules remain untouched.

## 8. Migration safety rules

- No destructive migration against production as a first step.
- First export/schema snapshot, verify backups/recovery, and inventory app references.
- Prefer additive tables and dual-read/write transition where justified.
- Compare row counts and relationship semantics before cutover.
- Do not drop old tables until migration validation and a rollback window have passed.
- Production RLS weaknesses should be addressed with a reviewed, tested migration; policy changes can affect access and must not be guessed.

## 9. Verified starting observations (read-only inspection)

- Current public schema includes `family_members`, `family_trees`, `relationships`, `family_member_relationships`, `family_unions`, `family_children`, `tree_permissions`, and tree-connection tables.
- Current `family_members` is scoped by a required `tree_id`, so one row cannot currently represent membership in multiple trees without a broader identity/membership design.
- `family_unions` has required `partner1_id` and nullable `partner2_id`; it is not a many-partner junction model.
- `family_children.family_union_id` is required, so child-parentage is currently forced through a union.
- `relationships` stores only parent/child/spouse relation types; `family_member_relationships` stores generic relationship labels, creating overlapping sources of truth.
- Read-only row counts for the main public tables inspected were zero at the time of inspection.
- Broad authenticated-user policies were observed on `family_unions` and `family_children` with `USING (true)` and/or `WITH CHECK (true)`. Treat this as a security finding requiring immediate review, not as permission to alter production blindly.
- This was a read-only schema/policy/index/trigger review. No database changes have been made.

## 10. Next implementation gate

Before applying any SQL: finish app/repository inventory, confirm backups/recovery, specify the additive migration, validate it in an isolated environment, run security/relationship tests, then review the production cutover plan.
