# Dinery scheduler (Cloudflare Cron Worker)

Runs every minute and, from your Firestore reservations:
- sends **push reminders** 60 min and 30 min before the slot,
- **auto-cancels no-shows** 15 min after the slot (if still `booked`, i.e. not
  checked in) and emails the cancellation,
- emails a **review request** ~60 min after check-in.

## 1. Create the Worker
1. Cloudflare dashboard → **Workers & Pages → Create → Create Worker**.
2. Name it `dinery-scheduler` → **Deploy**.
3. **Edit code** → delete the sample → paste all of [`scheduler.js`](./scheduler.js) → **Deploy**.

## 2. Add the secrets/variables
Worker → **Settings → Variables and Secrets**:
- `GOOGLE_SERVICE_ACCOUNT` — **Secret** — paste the **entire contents** of the
  service-account JSON file you downloaded (the whole `{ ... }`, one entry).
- `VAPID_PRIVATE_KEY` — **Secret** — `kssfPl_g-eS2qXaIE5tTg9r8qh1Ms0a0WOPeUQi-xpk`
- `RESEND_API_KEY` — **Secret** — your `re_...` key (same one as the email worker).
- `RESEND_FROM` — **Text** — `Dinery <noreply@dinery.am>`
- `RUN_KEY` — **Secret** — any random string (used to guard the manual test URL).

Re-**Deploy** after adding them.

## 3. Add the Cron Trigger
Worker → **Settings → Triggers → Cron Triggers → Add** → schedule `* * * * *`
(every minute) → save.

## 4. Test manually first
Open: `https://dinery-scheduler.<your-subdomain>.workers.dev/?run=1&key=<RUN_KEY>`

It returns JSON like:
```json
{ "scanned": 3, "remind60": 0, "remind30": 1, "cancelled": 0, "reviews": 0, "errors": [] }
```
- `errors: []` and a non-zero `scanned` means Firestore auth + reading worked.
- Check the Worker's **Logs** tab for details.

### Quick end-to-end checks
- **Reminder:** make a booking ~45 min out, enable notifications, run the URL →
  expect `remind60` to fire (and a push to arrive).
- **No-show:** make a booking for a time ~16 min in the past → run → `cancelled`
  increments, the reservation disappears, and a cancellation email arrives.
- **Review:** in the app console run `checkInReservation('DNxxxxxx')`, wait/After
  setting `checkInAt` to 61+ min ago, run → `reviews` increments + email arrives.

## Notes / troubleshooting
- If `listUsers` 404s, your Firestore database id may be `(default)` instead of
  `default` — change `DATABASE_ID` at the top of `scheduler.js`.
- Reminders need the user to have tapped **Enable Notifications** (a
  `pushSubscriptions` entry on their user doc).
- Web Push is hand-rolled (no npm in dashboard deploys); if pushes don't arrive,
  the Logs tab shows the push status code per subscription.
