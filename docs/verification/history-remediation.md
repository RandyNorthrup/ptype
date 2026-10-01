# Authorized local history-clearance evidence

On 2026-10-01 the owner answered "Revoked or rotated" and explicitly selected
"Scrub affected branch history" for the reviewed two-branch proposal. No live
credential was used, printed, or transferred with application source.

Git-filter-repo 2.47.0 replaced only the revoked value with [REMOVED] in a
owned disposable clone. Twelve historical trees changed in
.vscode/mcp.json and scripts/get-achievement-icons.ts; every changed file was
independently compared byte-for-byte with exactly that replacement. Ninety-five
commit identities changed. Current feature and main trees remain unchanged.
All ten existing tag objects are byte-identical to the preflight inventory.

Fresh WIN-11-VM bare-clone audit searched every reachable blob, including tag
ancestry, for the exact revoked value: zero matches, 172 reachable commits.
The scanner initially reported 18 matches for the same six expired screenshot
URLs at rewritten commit b2ffcf5aef9ed7839a679d6c91e75c95c1f0a2e8.
All twelve unique fingerprints equal the existing exceptions mapped from
032ccd8d1e9de2a78d808e7d6c7f880bb2fcf770. README contents are unchanged and
JWT expiry remains 2025-09-25T20:18:52Z. Both original and rewritten identities
are covered precisely; no Icons8 credential exception was added.

After the app checkout was remapped without a source-tree change, the normal
npm run security:secrets command exited zero on the VM: 155 patch-bearing
commits scanned, no leaks found. Raw logs and summaries are ignored. This is
local clearance, not proof that external refs, CI, Pages, or release are done.

Publishing uses observed branch leases and restores main protection immediately.
GitHub cached PR/commit pages can retain superseded objects independently of
reachable history. Old clones must fetch and rebase/reclone before contributing.
