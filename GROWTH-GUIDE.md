# Growth guide - free tools to reach and keep learners

Everything here is free. Steps reflect the services as they generally work; menus change, so follow the on-screen names.

## 1. Faster site and your own address with Cloudflare (optional)
Your site already works on GitHub Pages. Cloudflare adds speed, free HTTPS on a custom domain, and private visitor statistics.

**Visitor statistics (free, no cookies).** Cloudflare dashboard > Web Analytics > add your site > copy the token > paste it as `cloudflareToken` in `config.js`'s `analytics` section > re-upload `config.js`.

**A custom domain.** A domain name costs money (about the price of a few data bundles a year); the rest is free. If you buy one:
1. Add the domain to Cloudflare (free plan) and change the name servers at your registrar as instructed.
2. In your GitHub repository: Settings > Pages > Custom domain > enter it and tick Enforce HTTPS.
3. In Cloudflare DNS add: a `CNAME` record for `www` pointing to `YOURUSERNAME.github.io`, and for the bare domain four `A` records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Set each to "DNS only" (grey cloud) until GitHub shows the certificate is ready.
4. Update `PORTAL_URL` in the Settings tab and every link you have shared.
If you do not want a domain, skip all of this: `https://YOURUSERNAME.github.io/REPO/` is fine.

## 2. WhatsApp Business (free app)
1. Install **WhatsApp Business** on the phone number you put in `config.js`.
2. Profile: business name "Scholar's Camp Mathematics Academy", category Education, short description, address/location if any, website link, and opening hours.
3. Catalogue: add each course as an item (name, price, link to the course on your site).
4. Quick replies (type `/` in a chat): save the messages below. Greeting message and Away message are under Business tools.
5. Labels: New enquiry, Awaiting payment, Paid - enrol, Enrolled.
6. Broadcast lists (up to 256 contacts, people must have saved your number) are good for weekly tips; use the Status feature for daily one-minute maths tips.

Copy-paste templates (edit the brackets):
- **Greeting:** Hello and welcome to Scholar's Camp Mathematics Academy! Tell us your class (JSS/SS/Exam prep) and what you want to improve, and we will recommend a course.
- **/payment:** Thank you for choosing [course]. Fee: [amount]. Pay to [bank, account name, number] and send the receipt here with the email you registered on the website. We enrol you after we confirm the payment.
- **/enrolled:** Payment confirmed. You now have access to [course]. Sign in at [site link] with your email. Make sure the Google email you gave us can open the Drive videos. Welcome!
- **/forgot:** On the sign-in page tap Forgot password and enter your email; we send a 6-digit code that lasts 15 minutes. Check your spam folder too.
- **/away:** Thanks for your message. We reply between [hours]. Meanwhile try free practice at [site link].
- **Weekly tip broadcast:** Maths tip of the week: [one tip]. Want 30 practice questions on this? Reply YES.

## 3. YouTube channel
1. Create a channel for the academy; use the same logo as the site (`icons/`). Channel description: who you teach, which exams, your website, WhatsApp link.
2. Upload paid lessons as **Unlisted** (not Private) so the portal can play them for enrolled learners. Upload free sample lessons as **Public**.
3. Playlists: one per course and per topic, in teaching order.
4. Free-lesson video structure (6-10 minutes): hook (one exam question you will solve), the method, two worked examples, one question for them to try, a pointer to the site for the full course and practice quizzes.
5. Title pattern: `[Topic] in [N] minutes | WAEC and JAMB Maths`. Description template:
```
In this lesson: [topic and what they will be able to do].
Timestamps: 0:00 Intro | 1:10 Method | 3:30 Example 1 | 5:20 Example 2
Practice questions and full course: [site link]
Questions? WhatsApp: [link]
```
6. Shorts (under 60 seconds): one trick, one worked question, ending "Full lesson on our channel".
7. Add the video ID of each unlisted lesson (or the whole link) in Admin > Lessons > YouTube field.

## 4. A simple weekly routine
- Monday: publish one blog article from `posts.js` or a new one; share the link on WhatsApp Status.
- Wednesday: post a Short; send a broadcast tip.
- Friday: post an Announcement in Admin (optionally email it) with the weekend practice topic.
- Monthly: look at Admin charts to see which topics learners fail, then record a free lesson on that topic.
