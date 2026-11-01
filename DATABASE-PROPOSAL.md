# Review-only migration/integration proposal — do not apply
Verified columns use UUID person/tree/union/child IDs. Existing request and connection tables describe tree-level connections only. Need inspect pg_constraint, pg_policies, grants, triggers and existing function definitions before executable migration.

Proposed additive work:
1. Authenticated command RPC with operation UUID, payload hash, expected revision and typed commands. Derive actor from auth.uid(), never payload actor. Authorize all involved trees before write. Lock affected tree revisions in sorted UUID order, enforce version, validate same-tree references, parent roles, cycles, spouse limit and typed parentage.
2. Idempotency receipt keyed by actor/request UUID in same transaction. Same request and payload returns previous result; different payload rejects. Member creation and union/child links commit together. No delete/recreate member rollback. Updating child parentage changes the relevant child link, never another marriage's partner fields. Protect unrelated adoption records. Return committed IDs/revision.
3. Add separate person-level connection proposals with parent/child IDs, parentage kind, tree IDs, status and decision audit; foreign keys and ownership checks; uniqueness for active equivalent proposals. Source submission implies source consent, destination approval adds reference edge. Cancellation/rejection keeps original people. Revalidate cycles and biological parent conflicts on approval with locks across both trees.
4. Discover only opted-in, permitted minimal fields on server; same name is a candidate, never identity proof. Shared identity linking requires a separate reviewed evidence model. Restrict graph visibility and revoke derived visibility on disconnect.
5. Test additive migration against isolated schema snapshot and RLS identities; test concurrent approvals, retries after lost response, failures at every write, and no partial commits. Add integration adapter to existing App only after these checks.

No SQL migration was executed or supplied as ready-to-run. This is a design proposal pending complete constraint/policy verification, not an implemented database feature.
