# Verification report

Prepared: 26 October 2026. This report distinguishes automated verification from real browser or live Firebase verification.

## Passed

- 28 dependency-free Node tests: curriculum counts and preservation; recursive paths, independent completion and aggregated progress; deep search across notes/dates/links; recursive deletion and detached planner links; full JSON round trips; rejection of malformed/cyclic/oversized backups and unsafe URL protocols; deterministic IST date/countdown; cloud transaction success, failed writes, concurrent revision conflicts, explicit resolution, snapshots during save, new edits during save, unresolved conflicts and remote deletion.
- App-event/DOM harness (part of those 28 tests): Home rendering and honest local status; search result direct links; custom parent/child creation and independent completion; notes escaping and resource links; planner add/edit/complete; test marks and actual study logs; preference/theme updates; JSON export/import; module reload persistence; unconfigured Google sign-in guidance. This is a small simulated DOM, **not a real browser layout engine**.
- JavaScript syntax checks for all shipped JS modules.
- 389 supplied lecture records: Mathematics 202, Reasoning 55, Computer 66, English Grammar 26, Quantitative Aptitude 40. Baseline has 438 nodes: 389 lectures + 44 distinct printed units + 5 subjects. Unit capitalization variants remain separate to preserve source hierarchy.
- Independent PDF reconciliation: faculty-name occurrences from a second PDF text extractor matched the extracted lecture counts on every one of the 18 pages. SHA-256 hashes of the 5 source PDFs were verified in the earlier extraction audit. Original PDFs are excluded from the English ZIP. Per-page counts are in `tests/source-verification.json` and `source-audit.json`.
- Original Mathematics page 1 was rendered and visually inspected; the 10-Dec-2026 title overflowing its cell was recovered and annotated. Table extraction was used for all scheduled rows; empty timetable dates are not lectures. Repeated titles/dates/slots are not deduplicated. Mathematics page 3 is the `[1] Recorded` footnote, preserved on the referenced lecture.
- Static relative HTML/module references, PWA manifest scope/start URL checked; source references retain original filename/page without linking to packaged PDFs. ZIP content and hashes verified after packaging.

## Not verified in this environment

- A local HTTP preview server was attempted, but local socket access was forbidden and the in-app browser timed out. **Real Chromium/Safari rendering, mobile viewport layouts, touch/keyboard behavior, popup behavior, PWA install/offline reload and accessibility have not been browser-verified.** CSS includes mobile breakpoints, wrapping, visible focus, native form labels, dialog and reduced-motion support, but this is not a substitute for real-device QA.
- No user Firebase project, credentials or Google accounts were supplied. Real Google sign-in, production Firestore rules enforcement, quota behavior and live two-device sync have **not** been integration-tested. Cloud logic was tested with mocked transactions/snapshots. Rules were statically reviewed, not exercised in the Firebase emulator. Follow the Hindi guide's two-device acceptance test before depending on cloud backups.
- External YouTube/Drive resources are user-provided links; availability and Drive sharing permissions are outside this app. Original timetable PDFs are not shipped in this edition.
- The provisional 31-May-2027 milestone is a user-adjustable planning date, not an official exam date. Study guidance is editorial and does not claim verified chapter frequencies or admission outcomes.

## Run tests yourself

With Node installed, run `npm test` in the extracted folder (no npm install required). No Node/build is needed for GitHub Pages publishing.

Before relying on the app: open it on your phone, add a subtopic + note + two links, reload, export/import a backup, and complete the Google/Firestore two-device test in START-HERE-HI.html. Keep weekly JSON backups. Whole-tracker sync conflicts require explicitly choosing a version; automatic field merging is not provided.

## English edition changes

All built-in interface text, notifications, default planner tasks and generated study guidance are English. The separate setup guide stays Hindi. Teacher names have been removed from source-records.json and from search/detail views. Legacy backup import strips the old faculty field while retaining notes, links, completion and IDs. Automated checks scan app files for remaining Devanagari and curriculum data for teacher metadata; the 389 topic titles and hierarchy remain unchanged. Service-worker cache version is updated.
