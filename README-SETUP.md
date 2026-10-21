# Scholar's Camp Mathematics Academy - Setup Guide (v6)

Everything here uses free services only: Google Sheets + Apps Script (backend), Google Drive / YouTube (videos), GitHub Pages or Cloudflare Pages (website). No paid API, no payment gateway.

## What the platform does

**Learners:** register, sign in, forgot-password by email code, watch lessons (YouTube Unlisted or Drive), download notes/worksheets, mark lessons complete, take timed random practice quizzes by topic (maths notation supported), see weak topics, daily streak, points and leaderboard, receive announcements, and earn a printable, publicly verifiable certificate.

**Admin:** manage courses, lessons (add / edit / hide / delete), a question bank (add / edit / bulk import), learners (enable/disable, reset password), course access (grant/revoke with automatic Drive sharing and email), orders, announcements (portal + optional email), and see charts (revenue, enrolments, sign-ups, popular courses, quiz averages).

**Website:** public catalogue, free sample videos, Maths tips articles, PWA (installable on phones), optional free analytics.

## Files

| File | Purpose |
|---|---|
| `apps-script/Code.gs` | The whole backend. Paste into Apps Script. |
| `apps-script/appsscript.json` | Apps Script settings (V8 runtime, web app access). |
| `config.js` | **Your settings** (server URL, WhatsApp, email, analytics). |
| `index.html`, `app.js`, `styles.css` | Public website |
| `learn.html`, `learn.js` | Learner portal |
| `admin.html`, `admin.js` | Admin dashboard |
| `certificate.html` | Printable certificate and public verification |
| `blog.html`, `post.html`, `posts.js` | Maths tips (add articles in `posts.js`) |
| `api.js`, `analytics.js`, `pwa.js`, `service-worker.js`, `manifest.webmanifest`, `icons/`, `vendor/katex/` | Support files (upload all of them) |

## 1. Back up first
Make a copy of your Google Sheet and save your current Apps Script files before changing anything.

## 2. Install the backend
1. Open your academy Google Sheet → **Extensions → Apps Script**.
2. Replace the contents of `Code.gs` with `apps-script/Code.gs`. **Delete any `Admin` and `Learner` HTML files** in the Apps Script project; they are no longer used (the portal now lives on your website).
3. **Project Settings** (gear) → tick **Show "appsscript.json" manifest file in editor**, then replace `appsscript.json` with the one in this package. This sets the V8 runtime.
4. Save, select **`setupAcademy`**, click **Run**, and approve the permissions (Sheets, Drive, Mail, triggers). It creates/updates all tabs. Existing tabs from older versions are upgraded automatically (new columns are added at the end; your data is never overwritten). Read the result: if it prints **WARNINGS** a tab has unexpected column headings; fix them as it describes.
5. Set the admin password: **Project Settings → Script properties** → add `ADMIN_PASSWORD_SETUP` (12+ characters), then run **`setAdminPassword`**. The plain-text property is deleted automatically.
6. Add script property `PORTAL_URL` = the address of your `learn.html` (for example `https://yourname.github.io/academy/learn.html`). It is included in emails.
7. Optional: run **`installWeeklyBackup`** once (weekly copy of the Sheet into your Drive, older than 60 days removed).

## 3. Deploy the web app
1. **Deploy → New deployment → Web app**. *Execute as:* **Me**. *Who has access:* **Anyone**.
2. Copy the URL ending in `/exec`.
3. **Every time you change Code.gs you must create a NEW VERSION**: Deploy → Manage deployments → pencil → Version: *New version* → Deploy. Saving alone does not update the live app.

## 4. Configure and host the website
1. Open `config.js` and set `appsScriptUrl` (your `/exec` URL), `whatsappNumber` (digits only, e.g. `2348012345678`) and `contactEmail`.
2. Upload **all** files and folders (including `vendor/`) to the **top level** of a repository.
3. **GitHub Pages:** Settings → Pages → Deploy from a branch → `main` / root. Your site is `https://NAME.github.io/REPO/`.
   Learner portal: `.../learn.html` · Admin: `.../admin.html`.
4. Check the host's terms permit a commercial course website. GitHub Pages has historically discouraged running an online business; the site only shows courses and signs learners in (payment is by bank transfer elsewhere), but check current terms. **Cloudflare Pages** is a free alternative and the same files work unchanged.
5. Never put passwords or tokens in any file in the repository. The admin password lives only in Apps Script.

## 5. Daily workflow
1. **Add a course** (Admin → Course manager). Tick *Publish* to show it on the website.
2. **Add lessons** (Admin → Lessons). Best option: upload the video to YouTube as **Unlisted** and paste its link. Learners watch inside the portal; nothing needs sharing. (Unlisted means anyone with the link can watch; it is not DRM.) Drive videos also work: paste the file ID/URL and enrolled learners are shared automatically (you must own the file).
3. **Add questions** (Admin → Practice questions). For many at once use **Bulk import**: one line per question, `topic | question | A | B | C | D | correct letter | explanation`. Write maths as `$2^3$`, `$\frac{1}{2}$`, `$$a^m \times a^n = a^{m+n}$$`.
4. **A learner pays** (verify the real bank record) → Admin → Learners and course access → *Grant course access*. They get an email; Drive files are shared automatically.
5. **Announce** news (Admin → Announcements). Tick *Also send as an email* only when needed (free Gmail limit ≈ 100/day; the system stops before the limit).
6. **Certificates** are issued by the learner once all published lessons are completed and (if the course has questions) a quiz score of at least the pass mark (default 50%). Change it in the `Settings` tab: `CERT_PASS_MARK`, `ORG_NAME`, `CERT_SIGNATORY`. Anyone can verify a certificate at `certificate.html` by typing its number (it shows only name, course and date).

## 6. How quizzes, points and streaks work
- A quiz picks random questions from the chosen topic (or all topics). Timed quizzes give 1 minute per question; the server enforces the limit (30 seconds grace) and each quiz can be submitted once.
- Points: 10 per completed lesson + up to 10 per quiz topic (best score).
- Streak: consecutive days (Nigeria time) with a completed lesson or a quiz.
- Leaderboard shows only first name + last initial; learners can hide themselves.

## 7. Optional free extras
- **Analytics:** in `config.js` add a Cloudflare Web Analytics token and/or a GA4 id (`G-XXXXXXXXXX`).
- **Cloudflare in front of the site (free):** add your domain to Cloudflare, point it to your Pages/GitHub site, and turn on HTTPS and caching. Needs your own domain.
- **WhatsApp Business** (free app): set up a catalogue, quick replies and a greeting message; the site's WhatsApp buttons open a chat with your number.
- **Blog:** add objects to `POSTS` in `posts.js`.

## 8. Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| "The academy server is not connected yet" | Set `appsScriptUrl` in `config.js`. |
| "unexpected reply" / "Cannot reach the academy server" | Deploy as Execute as **Me**, access **Anyone**, and create a **new version** after any code change. |
| "Unknown request" | The deployed version is older than your site. Create a new deployment version. |
| "Spreadsheet is not configured" / "Cannot open the academy spreadsheet" | Run `setupAcademy` from the editor attached to the Sheet and authorize. |
| Setup prints WARNINGS | A tab has different column headings than expected; fix the header row. |
| Emails not arriving | Check the AuditLog tab for `EMAIL_FAILED`; the daily quota may be used up; check spam. `EMAILS_DISABLED=true` turns them off. |
| Drive sharing message lists a failure | You must own the file, it must be a file (not a folder), and the learner's email must be a Google account. Share that one manually. |
| "Too many failed attempts" | Wait 15 minutes or reset the learner's password in Admin. |
| "Your learner session has expired" | Sessions last 6 hours. Sign in again. |
| Maths shows as `$x^2$` | Use `$...$` with no spaces just inside the dollar signs. |

Check **Apps Script → Executions** for exact server errors.

## 9. Backups and maintenance
Run `installWeeklyBackup`. Also download your lesson source videos occasionally, keep the Sheet private, and review learner accounts from time to time. Google quotas apply (Sheets/Apps Script suit small to medium academies; if you grow past a few hundred active learners, consider moving to a database such as Firebase or Supabase).

## 10. Launch checklist
- [ ] `setupAcademy` reports no WARNINGS; `appsscript.json` (V8) installed.
- [ ] Admin password set; admin login works from `admin.html` on your real site.
- [ ] A test learner can register, receive the welcome email, reset the password by emailed code, and sign in.
- [ ] Granting access emails the learner and shares the Drive files (or YouTube lessons play).
- [ ] Un-enrolled learner cannot open lessons or quizzes.
- [ ] A timed quiz works; a certificate is issued and verifies publicly.
- [ ] Announcement shows in the portal; email arrives.
- [ ] Orders, status updates and charts work.
- [ ] Spreadsheet is private; no secrets in the repository.
- [ ] PWA install tested on a real phone.

## 11. Notes, worksheets, certificate PDFs and the starter question bank (new in v6)

**Written notes (print as PDF).** In Admin > Lessons, fill the "Written notes" box. Use `# Heading`, `## Sub-heading`, `- bullets`, `1. numbered steps`, `**bold**`, `---` for a line and `$a^2+b^2=c^2$` for maths. Enrolled learners see a "Print notes (PDF)" button on that lesson; their email is printed in the footer as a licence line. Notes are only sent to enrolled learners and never for hidden lessons. The text is separate from the Notes link, so you can use both.

**Printable worksheets.** In each course's quiz area learners choose a topic and number of questions and press "Printable worksheet". It has name/date/score lines and an answer key on its own page. To print worksheets without answers (for teachers handing out paper), add a row in the Settings tab: `WORKSHEET_ANSWERS` = `off`.

**Certificate PDFs by email.** Deploy the new version, open Admin > "Certificate PDF emails" and press "Create certificate template". A Google Doc is made in your Drive; open it to change colours, fonts or wording but keep the markers `{{NAME}} {{COURSE}} {{DATE}} {{CERT_ID}} {{ORG}} {{SIGNATORY}}`. From then on a PDF is attached to the email each learner receives, and learners can press "Email me a PDF copy" (up to 8 per 15 minutes). If the template or the PDF step fails, the learner still gets the certificate and a link by email. The first time the script creates or copies a Doc, Google asks you to approve the Documents permission: open the Apps Script editor, run `createCertificateTemplate` once, and accept. Set `ORG_NAME` and `CERT_SIGNATORY` in Settings to change the printed names.

**Starter question bank.** Admin > Questions > Bulk import > "Fill with starter questions" puts 123 original WAEC/JAMB-style questions (indices, logarithms, equations, quadratics, ratio, sequences, mensuration, bases, surds, variation, statistics, probability, sets, trigonometry, geometry, coordinate geometry) in the box. Pick a course and press Import. They were written for this academy, not copied from past papers, and every answer was computed by a program. Importing never creates duplicates, so you can re-run it safely. Skim the questions that matter most to you before publishing.

**Upgrading from v5:** replace Code.gs, run `setupAcademy` once (it adds the new "Notes Text" column at the end of the Lessons tab), then Deploy > Manage deployments > edit > New version. Upload the new website files, and refresh the site twice so the phone app picks up the new version.

**Growth guide:** see `GROWTH-GUIDE.md` for Cloudflare, WhatsApp Business and YouTube channel set-up.

## Not included (and why)
- **Browser push notifications:** they need an account with a push provider and a service-worker integration that cannot be tested without your keys. In-portal announcements plus email cover the same need for free.
- **Firebase/Supabase migration:** only worth it after you outgrow Sheets, and needs your own project keys.
- **Real DRM:** impossible on free services. Unlisted YouTube and restricted Drive reduce casual sharing only.
