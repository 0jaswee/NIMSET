# Abhyas · NIMCET 2027

Existing site: start with **UPDATE-HI.html**. New site: start with **START-HERE-HI.html**. Extract this archive and upload the CONTENTS of this folder (including folders) to your GitHub Pages repository root. No build or npm install required. Do not upload personal JSON backups to GitHub.

- `index.html`: app; must be served over HTTP/HTTPS, not file://.
- `firebase-config.js`: defaults to null, honest browser-local mode. Fill with your Firebase WEB app configuration for optional Google + Firestore sync.
- `firestore.rules`: publish these rules in Firebase Console before using sync.
- `source-records.json`: 389 lectures, normalized whitespace only; topic titles, dates, class slots and footnote preserved; teacher fields removed. One cross-cell overflow recovered and annotated.
- `source-audit.json`: source counts and original-file hashes for provenance. Original timetable PDFs are not included in this English edition. Teacher names do not appear in the curriculum or interface.
- `tests/`, `package.json`: dependency-free model/sync unit tests. With Node installed, run `npm test`. App itself needs no Node.
- `TEST-REPORT.md`: what was actually tested and what still requires your Firebase account.

Browser-local data is separate for demo and each signed-in UID. To migrate demo work: export demo JSON, sign in, import. Sign-in is required for secure private cross-device cloud sync. One private revisioned Firestore document is used per UID. Writes use optimistic transactions and conflict choices rather than silent overwrites. Whole-document conflicts must be resolved explicitly; export both versions before choosing. Max JSON state size 800 KB; links only, no file uploads.

Every node has its own completion; roll-up counts the node itself plus every descendant equally. A parent can be marked complete only when every descendant is complete. Unchecking or adding an unfinished child reopens its ancestors. Legacy inconsistent parent ticks are normalized without changing completed leaves or personal notes. Hierarchy accepts up to 100 levels/5000 nodes for safe import/rendering. Descriptions and exam styles are editorial, not supplied lecture text or verified PYQ frequencies. Provisional 2027-05-31 milestone is not an official examination date. NIT Jamshedpur is the main goal; BIT Mesra is a backup aspiration requiring its own official admissions checks.

Offline PWA caches app shell and curriculum after first successful HTTPS load. External PDFs/links and Firebase require network. Same-origin assets use network first; increment SW CACHE version when changing shell. User data remains in localStorage and optional private Firestore, never in the code repository.

## Updating from the earlier edition

Export JSON first. Replace the app files in the same repository, retain your configured firebase-config.js, and reload after deployment. Existing storage keys and topic IDs are unchanged. Legacy backups are accepted; obsolete teacher metadata is removed on load/import without changing user notes, links or progress. The app and generated study guidance are English; START-HERE-HI.html remains Hindi.

## Compact weekly edition (approved interface)

- Header contains a Home icon, global search and theme toggle. Navigation: Subjects, Planner, central Home, Results and Account. Old #settings and #tests links still work.
- A topic screen shows only its immediate children. More on any visible row opens Description and Notes & Links inline. Edit Details edits the visible title, description and relevance in place, with Save/Cancel; there is no details popup.
- Add Subtopic sits beside the Subtopics heading at every level. Back and a fully clickable path sit above the current topic.
- Planner groups existing dated tasks into Monday–Sunday weeks, with Week 1/2/3 navigation, in-place Add/Edit, backlog and actual study logs. Week 1 starts on the Monday stored in Account preferences; dates and old tasks are not changed.
- Results contains test scores and actual study logs; it does not duplicate the subject library. Account contains Google sign-in/Logout, sync status, settings and backups.
- Unsaved inline changes block navigation and cloud replacement until saved or cancelled. External copy-link fallback stays inline. Tests/logs/preferences still use their original compact forms.

Replace files in the same repository and preserve your configured firebase-config.js. Do not delete the Firebase project/database, change the site URL or clear browser storage. Personal state is not stored in the repository; export JSON before updating anyway. Full overwrite instructions are in UPDATE-HI.html.
