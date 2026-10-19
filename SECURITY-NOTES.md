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
