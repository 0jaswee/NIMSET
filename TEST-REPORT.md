# r9 validation — 28 October 2026

Base: 0jaswee/NIMSET @ b523f7202db1a6e1d7baf4f094bc5d3bb68b28c1.

- npm test: **71 passed, 0 failed** on Node.js 26.12.1. Existing hierarchy, backups, marks, cloud conflict mocks, profile isolation, rich notes and source invariants retained. New coverage checks recursive quiz boundaries/shuffle, both-profile quiz create/edit/delete/practice/feedback/results, invalid questions, daily task deduplication/history, playback minute aggregation, URL validation and font-size round trips.
- Existing app-flow test fixture lacked documentElement.classList used by the r8 runtime; fixture corrected. Old hardcoded r7 version assertions updated to r9; source preservation assertions retained.
- Headless installed Chrome / Playwright at 390×844: quiz create and practice result; video ±30-second seeks, available speed selection, overlay video choice; elapsed video time saved without clearing an unsaved note; notes Save; completion task; no horizontal page overflow or uncaught page errors. Firebase and YouTube API responses were mocked. Screenshot inspected locally.
- Curriculum/source JSON and Firebase config unchanged from base (verified byte for byte during packaging). Original .nojekyll retained. Package includes new JS modules in service worker shell with matching r9 app URL.

## Limits

No production-account login or live Firestore writes were made. Real YouTube playback/ads/embedding/network errors, physical Android/iOS keyboard behavior and browser/system PDF-print UI were not end-to-end tested. PDF export HTML and print invocation are covered by existing tests. Original JILCCE PDF unavailable; no new PDF extraction accuracy audit. Browser unload prompts depend on browser policy.

The repo is a complete static app, with pre-existing public Firebase configuration. Existing remote authentication/authorization and hosting configuration must work for deployment. No production data was downloaded.

YouTube API reference used for controls and minimum player dimensions: https://developers.google.com/youtube/iframe_api_reference
