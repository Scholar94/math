# Scholar's Camp Mathematics Academy — Free Learning Platform Upgrade

This package upgrades the existing academy while keeping to the user's no-additional-paid-services requirement. It uses Google Sheets, Google Apps Script, Google Drive, public YouTube samples and the existing static PWA website. No paid API or payment gateway is required.

## Included capabilities

- Public course catalogue and public YouTube sample videos.
- Admin login, course creation/editing/publishing, learner list, enable/disable accounts, grant/revoke enrolments, manual order recording and order status updates.
- Academy overview: learner/course/lesson/enrolment/order counts, pending and verified orders, manually verified revenue and quiz attempts.
- Lesson management form: course, lesson order, title, description, Drive file ID/URL, duration and publication toggle.
- Multiple-choice question authoring, four options, answer key and explanation.
- Learner registration/login, enrolled course list, lesson playback, mark-complete controls, progress summary and quiz scoring/history.
- PWA manifest, icons, service worker and installation instructions.
- Audit log for selected administrative and learning actions.

## Free-service caveats

All components use services with free options. Google quotas, account restrictions and service availability apply. No third-party paid service is introduced. Bank transfer verification remains manual. This is not DRM: learners who can view a video may still copy it or record their screen. Restricted Drive sharing and disabled download controls reduce casual copying but do not guarantee app-only playback.

## 1. Back up first

1. Make a copy of the existing Google Sheet.
2. In Apps Script, copy the current project or save its current `Code.gs`, `Admin.html` and `Learner.html` contents separately.
3. Keep the current website ZIP until the new version has passed your own tests.

## 2. Install the Apps Script files

1. Open the Google Sheet used by the academy.
2. Open **Extensions → Apps Script**.
3. Replace `Code.gs` with `apps-script/Code.gs` from this package.
4. Open the existing HTML file named `Admin` and replace its contents with `apps-script/Admin.html`.
5. Open the HTML file named `Learner` and replace its contents with `apps-script/Learner.html`. If it does not exist, click **+ → HTML**, name it `Learner`, then paste the contents.
6. Open **Project Settings** (gear icon) and tick **Show "appsscript.json" manifest file in editor**. Open `appsscript.json` in the editor and replace its contents with `apps-script/appsscript.json` from this package. This makes sure the project runs on the modern **V8** runtime (the code uses `const`, arrow functions and `.flat()`; on the old Rhino runtime the whole project fails to load, which breaks registration and sign-in).
7. Save the project, select `setupAcademy` and click Run. Authorize requested permissions. The setup creates missing tabs while preserving existing tabs with data, and it prints a **WARNING** if an existing tab has different column headings than the code expects (the code reads columns by position, so a mismatch breaks registration and sign-in).
8. Check that the following tabs exist: `Courses`, `Orders`, `Leads`, `Settings`, `Learners`, `Enrollments`, `Lessons`, `Questions`, `Progress`, `QuizAttempts`, `AuditLog`.

The existing `Courses`, `Orders`, `Learners` and `Enrollments` tabs must retain their expected column layouts. Do not rename or reorder columns without updating the code.

## 3. Set the admin password

1. Open Apps Script **Project Settings**.
2. Under Script properties, add `ADMIN_PASSWORD_SETUP` with a strong password of at least 12 characters.
3. Save the property.
4. Return to the editor, select `setAdminPassword` and click Run.
5. Confirm the execution completes. The function stores the SHA-256 hash and deletes the temporary plain-text property.

Never put a password or token in the public `app.js` file or in the spreadsheet.

## 4. Deploy or update the web app

1. Click **Deploy → Manage deployments**.
2. Edit the existing web app deployment or create a new deployment, choose **Web app**, and select a new version.
3. Set **Execute as** to **Me**.
4. Public catalogue and learner registration require the web app to be reachable by intended users. Select `Anyone` only if your Google account offers it and you accept the exposure of the public endpoints. Admin mutations require the server-side admin session.
5. Deploy and copy the URL ending in `/exec`. **Every time you change Code.gs or an HTML file you must create a NEW VERSION of the deployment** (Deploy → Manage deployments → pencil icon → Version: New version → Deploy). Saving alone does not update the live web app, which is the most common reason fixes seem not to work.
6. Admin URL: `YOUR_WEB_APP_URL?page=admin`
7. Learner URL: `YOUR_WEB_APP_URL?page=learn`
8. Public catalogue endpoint: `YOUR_WEB_APP_URL?action=catalog`

Do not make the Google Sheet public. If Google policy/account settings do not allow the necessary web-app access, do not make the spreadsheet public as a workaround.

## 5. Connect the public website (and the new learner portal)

1. Open **`config.js`** (not app.js any more) and set `appsScriptUrl` to the deployed URL ending in `/exec`, and `whatsappNumber` in international digits (for example `2348012345678`). Set `contactEmail` too.
2. Upload ALL website files to a static HTTPS host: `index.html`, `learn.html`, `admin.html`, `styles.css`, `config.js`, `api.js`, `app.js`, `learn.js`, `admin.js`, `pwa.js`, `service-worker.js`, `manifest.webmanifest`, `icons/` and `vendor/`. Free options: **GitHub Pages** or **Cloudflare Pages**. Check the host's terms permit a commercial course website.
3. Learners now sign in at `https://YOUR-SITE/learn.html` and you manage the academy at `https://YOUR-SITE/admin.html`. These pages talk to your Apps Script web app with `fetch`, so they no longer run inside Google's sandbox frame. (The old `?page=learn` and `?page=admin` pages still work as a fallback.)
4. In Apps Script **Project Settings → Script properties** add `PORTAL_URL` = your `learn.html` address. It is included in the emails sent to learners.
5. After changing Code.gs, run any function once in the editor to **authorize the new permissions** (send email, Drive, triggers), then create a **new deployment version**.
6. Open the site on a phone and a computer and test.

## 6. Publish a course

1. Sign in at `YOUR_WEB_APP_URL?page=admin`.
2. Use **New course** or edit a course.
3. Fill in title, category, class level, description and price in naira.
4. Add a public YouTube sample ID only for content you want everyone to watch. The ID is normally the 11-character value after `v=` in a YouTube URL.
5. Tick the publish checkbox and save.
6. Confirm the course appears on the public catalogue. Publishing a course does not grant access to paid lessons.

## 7. Add lessons

1. In the admin dashboard, open **Lessons and practice questions → Add a lesson**.
2. Select the course, assign an order number, enter a title and description, and enter the Drive file ID or Drive URL.
3. Tick **Publish this lesson to enrolled learners** and submit.
4. For a Drive URL such as `https://drive.google.com/file/d/FILE_ID/view`, the file ID is the value between `/d/` and `/view`.
5. In Drive, keep the paid file **Restricted**. After payment is verified and enrolment is granted, share the file as Viewer with the learner's registered Google email. Disable download/print/copy where Drive offers the option.

Lessons are currently added from the admin form; lesson editing/deletion is not yet included in the interface. To correct an existing lesson, update its row carefully in the private `Lessons` tab and preserve the column order. Avoid deleting rows that are referenced in `Progress`.

## 8. Add practice questions

1. Open **Lessons and practice questions → Add a multiple-choice question**.
2. Choose the course and a topic, e.g. `Laws of Indices`.
3. Enter the question and all four options.
4. Choose the correct option and write an explanation learners will see after submitting.
5. Tick publish and submit.
6. Repeat for the topic. Questions with the same topic label can be organized together in the private `Questions` sheet.

The learner quiz is automatically scored on the server. Do not place correct answers in the public course data. Do not use this starter as a high-stakes proctored examination system.

## 9. Register learners and grant course access

1. Give the learner the learner URL: `YOUR_WEB_APP_URL?page=learn`.
2. The learner creates an account using a valid email and password of at least 12 characters.
3. Verify payment from the actual bank/provider record, not a screenshot alone.
4. In Admin → Learners and course access, select the registered learner, choose the course, add a payment reference/note and click **Grant course access**.
5. Separately share the paid Drive file with the learner's registered Google account as Viewer while keeping General access Restricted.
6. Ask the learner to sign in again and open the course.
7. If a learner forgets their password, use **Reset password** next to their name in Admin → Learners, type a temporary password (12+ characters) and give it to the learner privately.

Granting enrolment authorizes access in the app; it does not automatically change Drive sharing permissions. When revoking, revoke the app enrolment and also remove the learner's Drive permission.

## 10. Record and update orders

1. Use the Order register to create an order record.
2. Confirm the payment independently.
3. Use **Update an existing order** with the exact order reference to set `Paid - verified`, `Delivered`, `Pending`, `Refunded`, `Cancelled` or `Access issue` as appropriate.
4. Grant enrolment only after verifying the payment.

There is no automatic bank transaction verification, payment gateway, automatic receipt, or automatic Drive sharing in this version. Verified revenue in the overview is calculated from rows whose payment status includes `Paid` and `verified`.

## 11. Learner experience

Learners can register, sign in, view courses they are actively enrolled in, play published lesson videos, mark lessons complete, view lesson progress and attempt published multiple-choice quizzes. Quiz results and recent attempts are stored in the private `QuizAttempts` sheet.

Lesson completion is learner-marked; it does not prove that the video was watched to the end. The current system does not provide streaming DRM, guaranteed anti-screen-recording, native app-store packages, or a secure video CDN.

## 12. New features in this upgrade

- **Automatic emails** (free Gmail quota, roughly 100 a day on a personal account): welcome message, "your course access is ready", password-reset code. Turn them off by adding the script property `EMAILS_DISABLED` = `true`. Failures are written to AuditLog.
- **Forgot password** on the learner page: the learner receives a 6-digit code (valid 15 minutes) and chooses a new password. Admin can still reset passwords by hand.
- **Automatic Drive sharing:** granting access shares the course's Drive files (the course-level file and every lesson file) with the learner as Viewer; revoking removes them; a lesson added later is shared with everyone already enrolled. You must **own** the files, and each must be a file, not a folder. If Drive refuses one, the admin message names it so you can share it by hand. Download restrictions still must be set in Drive yourself.
- **Maths notation** (KaTeX, bundled in `vendor/`, works offline): write `$x^2$`, `$\\frac{1}{2}$` or `$$a^m \\times a^n = a^{m+n}$$` in questions, options and lesson text.
- **Weekly backup:** run `installWeeklyBackup` once. A copy of the Sheet is saved to your Drive every Sunday and copies older than 60 days are deleted. Run `backupNow` for an immediate copy.
- **Stay signed in** while the browser tab is open (session survives a refresh).

## 13. Troubleshooting sign-in and registration

| Symptom | Likely cause and fix |
|---|---|
| Learner page says "Open this page using the deployed Apps Script web-app URL" | You opened the HTML file directly. Use `YOUR_WEB_APP_URL?page=learn`. |
| "Spreadsheet is not configured" / "Cannot open the academy spreadsheet" | Run `setupAcademy` from the Apps Script editor attached to the Sheet and authorize. |
| "Learners sheet missing" | Run `setupAcademy`. |
| Setup returns a WARNING about column headings | An old tab has different columns. Fix the header row to match, or rename the old tab and run `setupAcademy` again. |
| Nothing changes after editing the code | Create a **new version** of the deployment (section 4). |
| learn.html says "unexpected reply" or "Cannot reach the academy server" | Set `appsScriptUrl` in config.js; deploy the web app as Execute as **Me**, access **Anyone**; create a **new version** after any code change. |
| Page asks visitors to sign in to Google, or the website shows "sample courses" only | Deployment access must be **Anyone**, executing as **Me**. |
| "Too many failed attempts" | Five to eight wrong passwords lock that email for 15 minutes. Wait, or reset the password in Admin. |
| "Your learner session has expired" | Sessions last 6 hours. Sign in again. |

Check **Apps Script → Executions** for the exact server error after any failure.

## 14. Backup and maintenance

- Make a dated copy of the Google Sheet before major changes and on a regular schedule.
- Periodically download an offline copy of important lesson source videos and notes that you own.
- Check Apps Script **Executions** after errors.
- Review account registrations and remove access that is no longer needed.
- Keep the spreadsheet private and protect administrator account access.
- Keep course and quiz content reasonable in size; Sheets and Apps Script have quotas and are not intended for unlimited traffic.

## 15. Launch checklist

- [ ] Setup creates all 11 tabs without clearing existing records.
- [ ] `appsscript.json` is installed (V8 runtime) and `setupAcademy` reports no WARNINGS.
- [ ] `setAdminPassword` succeeds and old `getUi()` calls are absent from the password setup path.
- [ ] After every code change, a new deployment version was created.
- [ ] Admin login works and an unauthenticated user cannot call admin mutations.
- [ ] Public catalogue exposes only published public fields, not paid Drive URLs.
- [ ] Course creation, edit, publish and unpublish work.
- [ ] Learner registration, login and disabled-account checks work.
- [ ] An un-enrolled learner cannot call lesson or quiz APIs for a paid course.
- [ ] Grant/revoke enrolment works; Drive permissions are checked separately.
- [ ] Lesson completion updates progress.
- [ ] Quiz submission is scored on the server and records an attempt.
- [ ] Order status changes and dashboard analytics work.
- [ ] Free sample videos remain public.
- [ ] Spreadsheet is private; no secrets are in website JavaScript.
- [ ] learn.html and admin.html work from your real hosted site (not only from Google).
- [ ] A test learner receives the welcome, access and reset-code emails, and Drive files are shared automatically on grant.
- [ ] PWA installation and mobile layout are tested on real devices.

## Verification status

The code was tested against a simulated Google Sheets/Apps Script environment and in a real Chromium browser (see TEST-REPORT.md). Live Google authorization, deployment permissions, actual Drive access and installation on real devices must still be tested in the owner's Google account.
