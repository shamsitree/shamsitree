# Kinship labels - 3 November 2026

The existing unified interface and stored family records are preserved.

- Indirect relationships through adopted, foster or explicitly recorded step
  parentage carry a qualifier in English, Urdu and Hindi. Biological relationships
  supported independently remain biological; direct adopted-parent labels remain.
- Great-grandparents and great-grandchildren are named beyond two generations.
  Urdu/Hindi terms retain the exact paternal/maternal route rather than guessing
  one universal term for all great-grandparents.
- A parent's other spouse and the reverse spouse's other child have derived
  step-parent/step-child labels. These labels do not add another biological parent.

Genealogical paths also mark non-biological edges, for example Adopted Child instead
of an unqualified Son, in both directions.

Validation: all 88 automated checks pass (61 existing plus 27 new cases), TypeScript
passes, and the production Vite build succeeds. The supplied 16-member demo snapshot
was also evaluated three times: 240 ordered non-self pairs per run, identical results,
no connectivity/reciprocity mismatches, and none of the 16 great-grandparent directions
remain generic. These are repeated evaluations of the same 240 pairs, not 720 unique
relationships or a claim that every possible genealogy is supported.

Backups: `backups/kinshipEngine.before-label-fixes.ts.bak` and Git branch
`backup/main-before-kinship-labels-20261103` preserve the pre-change engine/release.
No database migration, data edits, deletions, authentication changes, or permission
changes are part of this update.

Remaining work from the earlier audit is separate: marriage chronology/numbering,
unused single-parent union cleanup, Memories, photo end-to-end testing, cross-tree
workflow and legacy security advisories. This update does not claim those are fixed.
