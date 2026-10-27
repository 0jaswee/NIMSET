# Abhyas — NIMCET + JILCCE r7

Open UPDATE-HI.html first. Upload archive contents to the existing GitHub Pages repository root; no build required. Export a private JSON backup before updating. Keep the same origin/repository and Firebase project.

Google login precedes syllabus selection. NIMCET retains its original per-user local key and users/UID/tracker/main document. JILCCE has a distinct per-user key and users/UID/tracker/jilcce document. Publish firestore.rules once to allow both owner-only documents. This release package includes the existing project's public Firebase web config; no server credentials are included. No demo-login bypass is shipped.

NIMCET retains 389 lectures / 438 total nodes. JILCCE has 230 nodes across 8 roots, grounded in all 14 supplied PDF pages. PDF guide claims are not verified official exam requirements. Added guidance is labeled. Source excerpts may retain original font extraction artifacts; headings are normalized. Original PDFs are omitted.

Notes use safe structured text runs with colour/bold/italic/underline. Old plain notes remain compatible. Select text, format, Save notes. Export PDF opens browser Print; choose Save as PDF. Notes and JSON backups are per selected syllabus. Wrong-syllabus imports are rejected. Links remain links; files are not uploaded to Firestore.

State max 800KB per syllabus; hierarchy max5000 nodes /100 levels. Revision transactions guard conflicts. Export both versions before resolving a conflict. Firebase connectivity and sync status must be checked explicitly. Offline shell caching does not make first sign-in work offline.

Tests: with Node supporting experimental test module mocks, run npm test. See TEST-REPORT.md for actual coverage and limitations. Tests, source JSON and public web config contain no personal saved tracker data. Do not upload your personal backup to GitHub.
