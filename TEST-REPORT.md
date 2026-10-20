# QA report — Scholar's Camp Academy (bug-fix pass)

## How it was tested
- `Code.gs` was executed in Node against a simulated Apps Script runtime (Sheets, Properties, Cache, Lock, Utilities, ContentService). The simulation mimics Google Sheets auto-conversion of typed values (phone numbers, fractions, formulas).
- `Learner.html`, `Admin.html` and `index.html` were run in real Chromium, wired to that simulated backend through a `google.script.run` shim.
- Result: 48 backend checks, 32 admin/learner browser checks and 8 public-site/PWA checks pass.

## Bugs found and fixed
| # | Where | Problem | Fix |
|---|---|---|---|
| 1 | Learner.html | After "Create account" the success message was erased immediately (`showMode()` cleared it), so registration looked like it did nothing. | Message is kept; login form opens with the email pre-filled. |
| 2 | Learner.html | Function named `status` clashes with the browser's built-in `window.status`. | Renamed `setMsg`. |
| 3 | Learner.html | Completing a lesson or submitting a quiz reloaded the whole portal, erasing the quiz result and restarting videos. Each course also re-fetched progress for nothing. | Only the progress summary refreshes; lessons show a persistent "Completed" state. |
| 4 | Learner.html | Expired session showed a raw error and stayed on the portal. | Returns to sign-in with a clear message. |
| 5 | Learner.html | `google?.script?.run` threw a ReferenceError outside Apps Script. | Safe `typeof google` check and a clear message. |
| 6 | Code.gs | Google Sheets converted typed text: `+2348012345678` lost its `+`, `08012…` lost its zero, quiz options such as `1/2` became dates, and any value starting with `=` became a formula (formula injection via the registration name). | All text is written with a text format (`appendRow_`/`writeRow_`). |
| 7 | Code.gs | No locking: two simultaneous registrations/enrolments could create duplicate rows. | `LockService` around writes. |
| 8 | Code.gs | No limit on password guessing; login errors revealed whether an email exists. | 8-attempt / 15-minute lockout (learner and admin); generic error. |
| 9 | Code.gs | Learners could not recover a forgotten password. | `adminResetLearnerPassword` + Admin button. |
| 10 | Code.gs | Drive file ID field accepted pasted URLs or junk, giving broken players. | ID is extracted from a URL and validated. |
| 11 | Code.gs | `setupAcademy` silently accepted old tabs with different columns (code reads by position, which breaks sign-in/registration). Its message also named only 6 tabs. | Header check with explicit WARNINGS; correct message. |
| 12 | Code.gs | Catalogue errors produced an HTML error page instead of JSON. | Errors returned as `{ok:false}`. |
| 13 | Admin.html | Success messages ("Order recorded. Reference…", "Enrolment granted… now share the Drive file…") were overwritten at once by the list refresh. | Messages now stay visible. |
| 14 | Admin.html | Sign-out did not end the server session; an expired session left a dead dashboard. | `adminLogout`; auto sign-out on expiry. |
| 15 | app.js | Learner sign-in link was hidden until `appsScriptUrl` was set; catalogue load could hang forever. | Link always shown (explains itself if not configured); 10-second fallback. |
| 16 | service-worker.js | Could throw on caching partial responses. | Only caches HTTP 200; cache name bumped to v2. |
| 17 | package | No `appsscript.json`; an old Rhino-runtime project cannot parse this code at all. | `apps-script/appsscript.json` (V8) added and documented. |

## Still not tested (needs your Google account)
Live authorization and deployment, real Drive sharing, and installation on real phones. Complete the README launch checklist before accepting real payments.
