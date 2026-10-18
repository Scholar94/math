# Scholar's Camp Mathematics Academy — Admin Dashboard Starter

This version includes a responsive public course website and a private admin dashboard served by Google Apps Script.

## What it can do
- Public homepage with short sample videos.
- Public catalogue loads published course records from Google Sheets.
- Admin password is configured server-side; the password is not embedded in public website JavaScript.
- Admin can create, edit, publish/unpublish, and delete courses.
- Set course title, category, class level, description and price in naira.
- Add a public YouTube sample video ID to show a sample on the home page.
- Store a Google Drive file ID or URL as a course resource reference.
- Maintain a manual order register with payment and delivery statuses.
- Free static hosting can be done with GitHub Pages.
- Google Sheets stores structured records; Google Drive stores videos and learning files.

## Free / no-card approach
Use a normal Google account, Google Sheets, Google Apps Script, Google Drive, YouTube and GitHub Pages. These have free options and do not normally require a credit card for this setup, but free quotas and account/region availability apply. This project contains no paid API and does not require a payment gateway to launch. Manual bank transfer may still be subject to your bank's normal charges.

## A. Set up the Google backend

1. Create a Google Sheet named `Scholar's Camp Academy Data`.
2. In the sheet, open **Extensions → Apps Script**.
3. Replace the default `Code.gs` with the contents of `apps-script/Code.gs`.
4. Click **+** next to Files, select **HTML**, and name the file exactly `Admin`. Paste the contents of `apps-script/Admin.html`.
5. Save the project.
6. In the function dropdown, select `setupAcademy` and click Run. Grant the requested permissions. This creates Courses, Orders, Leads and Settings tabs and adds three editable starter courses.
7. Select `setAdminPassword` and click Run. Follow the prompt. Use a strong password of at least 12 characters. The server stores a SHA-256 hash, not the plain password. Do not share the password.
8. Select **Deploy → New deployment → Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone** (the public catalogue and admin page need to load from your website; admin changes still require the server-side password/session token).
9. Deploy, complete any authorisation steps, and copy the Web App URL. It will look similar to `https://script.google.com/macros/s/.../exec`.
10. Test the URL by opening it. It should show the backend page. Add `?page=admin` to open the dashboard. Log in with your admin password.

If the account does not offer "Anyone" access, the public website cannot load the catalogue through this endpoint. Do not make your Sheet public as a workaround.

## B. Connect your public website

1. Open `app.js`.
2. Set `whatsappNumber` to your number in international digits only (Nigeria example format: `2348012345678`).
3. Set `appsScriptUrl` to the deployed Web App URL from step A.
4. Save.
5. Replace the three fallback sample `youtubeId` values with your own public sample video IDs if you want them to show when the backend is not configured.
6. Upload `index.html`, `styles.css` and `app.js` to a GitHub repository.
7. In GitHub repository **Settings → Pages**, publish from the main branch/root folder. Use the URL GitHub Pages provides.

Public catalogue items come from the `Courses` sheet after the Apps Script URL is connected. Only courses marked Published appear. Courses added or priced in the admin dashboard are reflected when the public page reloads.

## C. Create and price courses

1. Open your deployed Apps Script URL followed by `?page=admin`.
2. Sign in with the password set in step A.
3. Select **New course**.
4. Enter the title, price, category, level and description.
5. Optional: add an 11-character YouTube video ID for a public sample; add a Drive file ID/URL as a reference for paid materials.
6. Tick **Publish this course on the public website** to make it visible.
7. Click **Save course**. Edit or unpublish it whenever you wish.

## D. Video access and payment limitations — read this

- Short sample videos are public on the homepage by design.
- The admin stores a Drive file reference, but a Drive URL is not secure paid-course delivery by itself. Do not set paid files to "Anyone with the link" if you intend to restrict them.
- This version does not automatically confirm bank transfers or automatically unlock course videos after purchase. Verify the actual bank/provider transaction record, then share the specific course file with the purchaser or send the approved course access instructions manually.
- Never rely only on payment screenshots.
- The admin order register is for manual records; setting an order to "Paid - verified" is an action you perform after checking payment, not an automatic verification.
- Do not put passwords, secret API keys or payment credentials in `app.js`.
- Do not share the Google Sheet itself publicly. Only the Apps Script web app endpoint is public; privileged write functions require a valid expiring server-side session.
- This is a useful free MVP, not a DRM platform. Recipients can copy/share content they are allowed to view.

## E. Test checklist

1. Run `setupAcademy()`; confirm four tabs are created.
2. Run `setAdminPassword()`; configure a strong password.
3. Deploy web app; confirm `?page=admin` opens.
4. Sign in; create a draft course; verify it is in the dashboard but not on public website.
5. Publish the course; verify it appears on the public site after refresh.
6. Change the price; verify the new price appears publicly.
7. Unpublish; verify it disappears from public catalogue.
8. Try a malformed YouTube ID; the server should reject it.
9. Add a test order; verify it appears in the order register.
10. Sign out and sign in again; verify the dashboard requires a password.
11. Verify the spreadsheet is private and no password or token is present in `app.js`.
12. Test the public homepage on a phone and desktop.

The automated static checks run before delivery cover JavaScript syntax, HTML structure and key integration/security patterns. Live Google authorisation/deployment cannot be completed or honestly claimed from this environment; perform the deployment checklist above with your own Google account.


## F. Install it like an app on phones, tablets and computers

This project is a **Progressive Web App (PWA)**. It is installable from the published HTTPS website without an app store or paid developer account.

The root of the site must include:
- `manifest.webmanifest`
- `service-worker.js`
- `pwa.js`
- the `icons/` folder

Upload all these files alongside `index.html`, `styles.css` and `app.js` to the same GitHub Pages site.

### Android
Open the HTTPS website in Chrome. Use the in-page **Install app** button when Chrome offers it, or Chrome menu → **Install app** / **Add to Home screen**.

### iPhone and iPad
Open the HTTPS website in Safari → Share → **Add to Home Screen**. iOS does not always show a browser install prompt, so use these manual steps.

### Windows, macOS and Chromebook
Open the HTTPS site in a supported browser such as Chrome or Edge. Choose the install icon in the address bar or browser menu → **Install app** / **Create shortcut**.

### What works offline?
After the first successful visit, the app shell (basic page, styling, icons and scripts) is cached so the interface can reopen offline. The live Google Sheets catalogue, YouTube video playback and Google Drive content require an internet connection. This is not the same as downloading every course video to the device.

### Native APK / App Store
This is not a signed Android APK or an App Store package. It is a cross-device installable web app, which avoids paid store accounts and keeps the launch free. If a standalone APK or native iOS app is required later, that is a separate build and signing process.
