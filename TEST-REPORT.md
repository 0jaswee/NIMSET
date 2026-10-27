# r7 verification — 27 October 2026

63 automated tests passed: 26 model/cloud core, 25 app event/DOM harness, 12 dual-profile/rich-note tests. Tests cover NIMCET IDs and storage-key compatibility, 389 original lectures, recursive hierarchy, planner/search/goals, completion guards, safe links/imports, backup round trips, private account gate, two-profile isolation, cross-syllabus import rejection, stale listener generation guards and revision conflicts.

JILCCE audit: 230 nodes, 8 roots, all 14 supplied PDF pages represented; parent references, unique IDs, no cycles. Original excerpts and page provenance retained, readable headings normalized. NIMCET source-records.json remains byte-identical to the previous English release.

Rich notes: old plain text, structured styles, Hindi, escaping, invalid styles and malicious elements rejection, size and plain/rich mismatch checks, A4 print HTML and print-iframe lifecycle tests. Colours are restricted to a fixed palette. Recolouring overrides nested colour spans. Print-to-PDF uses the browser print dialog, not a generated PDF download.

Real mobile-width browser preview: mock login gate and two-syllabus chooser; JILCCE topic hierarchy and inline More/Notes tools; Hindi mixed text entered, coloured blue and saved; saved DOM confirmed #1565c0; NIMCET switch opened original 438-node baseline. Browser preview used an isolated FakeCloud in work/qa-preview, never shipped. No real private documents were changed. Screenshots supplied separately.

Limitations: new real Google authentication and JILCCE Firestore round trip were not exercised. Updated owner-only rules are supplied but not published. Rules validation here is static/mocked, not a Firebase emulator proof. Native Print dialog / final saved PDF rendering and broad device/accessibility testing were not verified. No claim of live JILCCE synced status is made.

Release validation: JavaScript syntax checks, source preservation, ZIP CRC, local asset references and actual packaged SHA256 manifest checked during packaging. Public Firebase web config is included for the existing nimcet-study-tracker project. QA mock files and original PDFs are excluded.
