# Dinery email proxy (Cloudflare Worker → Resend)

This Worker holds the Resend API key (which must never be in the browser) and
sends Dinery's emails. The web app POSTs to this Worker; the Worker calls Resend.

## One-time setup (all via the dashboards — no CLI needed)

### 1. Create a Resend account + API key
1. Sign up at <https://resend.com>.
2. **API Keys → Create API Key** → copy it (looks like `re_xxxxxxxx`).

### 2. (Recommended) Verify your domain so you can send from `noreply@dinery.am`
1. Resend → **Domains → Add Domain** → enter `dinery.am`.
2. Add the **DNS records** it shows (SPF/DKIM) to wherever `dinery.am`'s DNS lives.
3. Wait for it to show **Verified** (usually minutes).
   - **Skip for now?** You can test first: leave the default `from`
     (`onboarding@resend.dev`). In test mode Resend only delivers to the email
     you signed up with — fine for verifying the wiring works.

### 3. Create the Cloudflare Worker
1. Sign up at <https://dash.cloudflare.com> (free).
2. **Workers & Pages → Create → Create Worker**. Name it e.g. `dinery-email`.
3. Click **Edit code**, delete the sample, paste the contents of
   [`worker.js`](./worker.js), then **Deploy**.
4. Copy the Worker URL shown (e.g. `https://dinery-email.<your-subdomain>.workers.dev`).

### 4. Add the secrets to the Worker
In the Worker → **Settings → Variables and Secrets → Add**:
- `RESEND_API_KEY` = your Resend key → mark it as a **Secret** → Save.
- `RESEND_FROM` (optional, after domain verification) = `Dinery <noreply@dinery.am>`
  → plain **Text** → Save.

Re-**Deploy** after adding variables.

### 5. Point the app at the Worker
In `app.js`, set `EMAIL_CONFIG.workerUrl` to your Worker URL from step 3.
If the app is served from a domain other than `dinery.am`, also add it to
`ALLOWED_ORIGINS` at the top of `worker.js` and re-deploy.

## Test
- Cancel a reservation while signed in (with a verified email). Check the
  Worker's **Logs** tab and your inbox.
- Direct API check (replace URL):
  ```bash
  curl -i -X POST https://dinery-email.<sub>.workers.dev \
    -H 'Origin: https://dinery.am' -H 'Content-Type: application/json' \
    -d '{"to":"you@example.com","subject":"Test","html":"<b>hi</b>"}'
  ```

## Notes
- Only origins in `ALLOWED_ORIGINS` may use the Worker, and the `from` address is
  fixed server-side, so the proxy can't be used to send arbitrary spoofed mail.
- Free tiers: Cloudflare Workers 100k req/day; Resend ~3,000 emails/month.
