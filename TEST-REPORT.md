# Compact weekly edition — verification report

Prepared: 26 October 2026. The report distinguishes automated checks from real browser and live Firebase checks.

## Passed: 42 automated tests

26 model/sync tests cover:

- All 389 lecture records, subject counts and source preservation; full JSON round trips and legacy imports; unsafe URLs, malformed data, duplicate IDs, cycles, orphans and oversized state rejection.
- Recursive paths, search across levels, notes, dates and links; subtree deletion and preservation of planner tasks as detached tasks.
- Completion guards at any depth. An unfinished descendant blocks parent completion; unchecking/adding an unfinished child invalidates ancestors. Legacy inconsistent parent ticks are cleared without changing completed leaves or notes.
- Monday-based week boundaries, Sunday, year rollover, leap day, configurable week numbering and optional week anchor in old backups.
- IST date/countdown; teacher metadata removal; English built-in text and study guidance.
- Mocked cloud transactions and snapshots: initial seed, successful acknowledgment, failed writes, stale revision conflicts, explicit resolution, editing conflicts, snapshots during save, further changes during save, unresolved conflicts and remote document deletion.

16 app-event/DOM harness tests cover:

- Header with Home/search/theme only; global search from Home with direct topic links; distinct Home, Subjects, Planner, Results and Account screens.
- One hierarchy level per screen, clickable path and Back; More beside a child without navigation; Add Subtopic beside its section heading.
- Inline topic creation, direct content editing, Save/Cancel and keyboard save; unsaved-edit navigation guard. No details popup.
- Parent checkbox behavior; notes isolation between topics, markup escaping and local persistence.
- Multiple inline resource links, unsafe-link rejection, inline copy-link fallback.
- Weekly task add/edit, grouping by actual task dates, week changes, completion, invalid-minute rejection, date jumps and backlog. Add/Edit stays inside the appropriate day.
- Results test marks/actual study logs without duplicating the subject library.
- Account preferences, old #settings alias, JSON backup/import, module reload, stable IDs/storage keys and honest unconfigured sign-in status.

The DOM harness simulates elements/events; it is **not a real browser layout engine**. It does not establish pixel-perfect layout, keyboard selection behavior, actual scrolling or touch ergonomics.

## Additional checks

- Syntax-checked all shipped JavaScript modules.
- All relative HTML and module references and service-worker shell paths resolve inside the package. The new cache identifier is `abhyas-shell-v3-compact-weekly`.
- Compared source-records.json against the prior English ZIP: all 389 titles, hierarchy fields and source references remain identical. The baseline remains 438 nodes (389 lectures, 44 printed units, 5 subjects).
- The earlier source extraction audit reconciled all 18 original PDF pages with a second text extractor and verified source-file SHA-256 hashes. Original timetable PDFs are omitted from this package, and teacher names are removed from curriculum data. Formatting whitespace was normalized during extraction. One overflowing Mathematics title was recovered and annotated in the original record.
- Archive content, CRC and per-file integrity hashes verified after packaging. The shipped Firebase configuration is intentionally null; a user-configured Firebase file will have a different hash.

## Not verified here

- The earlier local browser preview failed because local socket access was forbidden and the in-app browser timed out. Real Chromium/Safari mobile rendering, text-cursor placement, touch navigation, scrolling, accessibility, PWA installation and offline reload have not been browser-verified for this edition. CSS is responsive and markup has labels, focus styles, native controls and accessible tab states, but real-device review is still needed.
- No user Firebase project or Google account was provided. Real sign-in, published Firestore rules, quota behavior and live two-device sync are not integration-tested. Rules are statically reviewed, not emulator-tested. Cloud tests use mocked transactions/snapshots. Follow the Hindi setup guide before relying on sync.
- External YouTube/Drive links and sharing permissions depend on those services. File uploads are not supported. Cloud SDK loading/sign-in/sync require network access; offline shell support does not make external services available offline.

## Update and acceptance test

Read UPDATE-HI.html. Export JSON first, preserve your configured firebase-config.js, and replace app files in the same repository. Do not clear browser storage, change the site URL or delete the Firebase project/database. Schema version and storage keys remain unchanged. Old dated tasks are grouped into weeks without moving their dates.

On your phone: search from Home; open a subject and child; use More and edit text; save/cancel; add a subtopic beside its heading; confirm an unfinished child blocks its parent; add/edit tasks in Weeks 1/2/3; reload and confirm persistence; export/import JSON. Then complete the same-account two-device Firebase test from START-HERE-HI.html. Keep weekly JSON backups.

With Node installed, run `npm test` (no npm install). Publishing requires no build or Node.
