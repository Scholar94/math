# Security notes

- Never make the Google Sheet public.
- Public catalogue output must not include paid Drive IDs/URLs, learner emails, order records, question answer keys or session tokens.
- Admin operations require a valid expiring server-side admin session. Learner APIs require a learner session and an active account. Course lesson/quiz endpoints check active enrolment server-side.
- Public registration is not the same as course access. Only grant enrolment after independently verifying payment.
- Google Drive permissions are separate from enrolment records. Keep paid files Restricted, share only with the learner's account, and remove Drive permission when revoking access.
- Download restrictions are best-effort friction, not DRM. Screen recording and copying cannot be completely prevented.
- The current learner password hash uses a salted SHA-256 construction. This is a small free MVP, not a substitute for a dedicated identity provider or a modern password-hashing service; use strong unique passwords and do not reuse an admin password.
- Add rate limiting and abuse monitoring before significant public traffic. Apps Script/Sheets are quota-limited and not designed as a high-scale authentication system.
- AuditLog stores selected admin actions, enrolment grants/revocations and quiz submissions. It is an operational log, not tamper-proof evidence.
- Never store bank card details, full bank credentials or plaintext passwords in Sheets.

- The website now calls the Apps Script web app directly. Only functions listed in `API_` in Code.gs can be called; admin functions still require the expiring admin session token. Passwords/tokens must never be added to files in the public repository.
- Learner passwords are salted SHA-256 (see above); logins and reset codes are rate limited; reset codes are single use and expire in 15 minutes.
- Certificates can be verified publicly by number; the verification shows only name, course title and issue date.
- The leaderboard shows only first name and last initial and learners can opt out.
- YouTube Unlisted videos can be viewed by anyone who has the link. They are a convenience, not protection.

## v6 additions
- Notes text and worksheets are only returned to learners with an active enrolment; hidden lessons are never served. The text has `<` and `>` removed on save and the notes page escapes everything before applying its small set of formatting rules, so notes cannot inject scripts.
- Worksheets/notes carry a "licensed to" footer so leaked printouts can be traced. This deters sharing; it cannot stop screenshots.
- The certificate template Doc lives in your Drive and is not public. Temporary per-certificate copies are moved to the Drive trash immediately after the PDF is made.
- `createCertificateTemplate` is not exposed to the web API; only the admin-protected wrapper is.
- Certificate resend is rate limited (8 per 15 minutes per learner) to protect your free email quota.
