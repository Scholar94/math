# QA report - v6

## Method
- `Code.gs` was run in Node against a simulated Apps Script runtime (Sheets with Google's auto-conversion of typed values, Properties, Cache, Lock, Mail, Drive, Triggers).
- The website pages were run in real Chromium, calling that backend over `fetch` from a different origin (as GitHub Pages will), with no CORS preflight.

## Results
- Backend: 48 core + 25 email/Drive/reset + 52 feature + 40 notes/worksheet/import/certificate-PDF checks - all pass.
- Browser end-to-end: 42 checks (v6 adds starter import, notes page, worksheet page, template button, emailed PDF) - all pass (admin lesson/question management, bulk import, announcements, charts, learner register/forgot/sign-in, YouTube/notes lessons, timed quiz with KaTeX, topic breakdown, certificate issue and public verification, leaderboard, Maths tips pages).

## Bugs found and fixed in this pass
- The backend file had been left half-edited (its API table listed functions that did not exist), which would have broken every request. Completed and tested.
- Certificate used a pop-up after a network call, which phones block; it is now a normal button/link.
- Earlier fixes retained (sign-in/registration messages, text-safe Sheets writes, locking, lockout, status messages, etc.).

- Found while testing v6: a notes/worksheet page opened in a new tab cannot see the sign-in (sessionStorage is per tab). They now open in the same tab with a Back button.
- Docs find-and-replace treats `$` and `\\` in a learner's name specially; names are escaped so e.g. `Ada $1 Okafor` prints exactly.
- Certificate email is sent after the database lock is released, and a mail or PDF failure never blocks issuing the certificate.

## Not tested here (needs your accounts)
Real Google Docs to PDF conversion (simulated), real email delivery, real Drive permission changes, YouTube playback, the live CORS behaviour of the Google web app, printing to PDF on your devices, GitHub Pages hosting, and installation on real phones. Use the README launch checklist with a test learner before accepting real payments.
