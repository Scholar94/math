# Security notes — free learner portal upgrade

This is an MVP using Google Apps Script, Google Sheets and Google Drive at no added software cost.

- Learner accounts can register and sign in at the Apps Script URL ending in `?page=learn`.
- Only active rows in the private `Enrollments` sheet unlock a course inside the portal.
- Enrolment does not automatically grant Google Drive permission. After payment is verified, the operator must share the Drive file as Restricted with the exact learner email and disable viewer downloads where supported.
- Revoke app enrolment in the Enrollments sheet AND remove that learner's Drive file permission.
- Do not put paid Drive URLs in public course records, public JavaScript, or public web pages.
- This is not DRM and cannot prevent every screen capture, recording, redistribution, or access through Google Drive by a user who was granted file permission.
- The app uses salted SHA-256 for learner password storage. This is a basic no-cost MVP, not a substitute for a mature identity provider with memory-hard password hashing, abuse protection, recovery, and monitoring. Do not reuse important passwords.
- Apps Script cache sessions can expire early. Google quotas, account policies, and deployment permissions apply.
- The backend must be deployed and tested in the owner's Google account. Static code checks cannot confirm the live spreadsheet, permissions, deployment, or account configuration.
