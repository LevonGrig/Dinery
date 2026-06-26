// ─────────────────────────────────────────────────────────────────────────────
//  Dinery — Reservation lifecycle scheduler (Cloudflare Cron Worker)
//
//  Runs on a cron trigger (every minute). For every reservation it:
//    • sends a push reminder 60 min and 30 min before the slot
//    • auto-cancels a no-show 15 min after the slot if status is still 'booked'
//      (admin never checked the guest in) and emails the cancellation
//    • emails a review request ~60 min after check-in (status 'checkedIn')
//
//  It also runs a guest-cleanup pass: a guest (anonymous account — a user doc
//  with no email) is deleted from BOTH Firestore and Firebase Auth once all of
//  their reservations have ended and a grace period (GUEST_TTL_HOURS, default
//  24h) has passed with no new/upcoming booking. This keeps unused anonymous
//  accounts from piling up. Gated by ENABLE_GUEST_CLEANUP === 'true'.
//
//  Secrets (Cloudflare → Worker → Settings → Variables):
//    GOOGLE_SERVICE_ACCOUNT  (secret)  the full service-account JSON (one line)
//    VAPID_PRIVATE_KEY       (secret)  the VAPID private 'd' (base64url)
//    RESEND_API_KEY          (secret)  re_...
//    RESEND_FROM             (text)    Dinery <noreply@dinery.am>
//    RUN_KEY                 (secret)  any random string — guards ?run= manual test
//    ENABLE_GUEST_CLEANUP    (text)    'true' to delete stale guest accounts
//    GUEST_TTL_HOURS         (text)    hours after last reservation to delete (default 24)
//
//  NOTE: deleting Auth users needs the service account to have the
//  "Firebase Authentication Admin" IAM role (the default Firebase Admin SDK
//  service account already does).
//
//  Manual test:  https://<worker-url>/?run=1&key=<RUN_KEY>
// ─────────────────────────────────────────────────────────────────────────────

const PROJECT_ID  = 'dinery-fca7d';
const DATABASE_ID = 'default';            // this project's Firestore DB id
const TZ_OFFSET   = '+04:00';             // Yerevan (slots are stored local)
const SITE        = 'https://dinery.am';

// VAPID public key (matches push.js). Public — safe to embed.
const VAPID_PUBLIC_KEY = 'BGYMCtEPhecGyMgpkkFF5SYmrcDAx3UbcFvGYiiZI_E5D_f1UCteLLWAECFPYwlC4CSUjyRNNtiWKsP1FkKm5pc';
const VAPID_X = 'ZgwK0Q-F5wbIyCmSQUXlJiatwMDHdRtwW8ZiKJkj8Tk';
const VAPID_Y = 'D_f1UCteLLWAECFPYwlC4CSUjyRNNtiWKsP1FkKm5pc';
const VAPID_SUB = 'mailto:info@dinery.am';

const FS_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runScheduler(env).then(r => console.log('scheduler run:', JSON.stringify(r))));
  },
  async fetch(req, env) {
    const u = new URL(req.url);
    if (u.searchParams.get('run') === '1') {
      if (env.RUN_KEY && u.searchParams.get('key') !== env.RUN_KEY) {
        return new Response('forbidden', { status: 403 });
      }
      try {
        const r = await runScheduler(env);
        return new Response(JSON.stringify(r, null, 2), { headers: { 'content-type': 'application/json' } });
      } catch (e) {
        return new Response('error: ' + (e?.stack || e), { status: 500 });
      }
    }
    return new Response('Dinery scheduler. Append ?run=1&key=RUN_KEY to trigger manually.');
  },
};

// ── Main pass ─────────────────────────────────────────────────────────────────
async function runScheduler(env) {
  const token = await getAccessToken(env);
  const users = await listUsers(token);
  const now   = Date.now();
  const summary = { scanned: 0, remind60: 0, remind30: 0, cancelled: 0, reviews: 0, guestsDeleted: 0, errors: [] };

  for (const user of users) {
    const uid  = user.uid;
    const subs = Array.isArray(user.pushSubscriptions) ? user.pushSubscriptions : [];
    const list = Array.isArray(user.reservations) ? user.reservations : [];

    // Guest cleanup: delete a stale anonymous account (no email) once all its
    // reservations have ended + the grace period passed. Runs before reminders
    // so a fresh booking (future slot) is always safely kept.
    if (env.ENABLE_GUEST_CLEANUP === 'true' && isStaleGuest(user, list, now, env)) {
      try {
        await deleteUserDoc(token, uid);
        await deleteAuthUser(env, token, uid);
        summary.guestsDeleted++;
      } catch (e) { summary.errors.push('guestDelete:' + e.message); }
      continue;
    }

    if (!list.length) continue;

    let changed = false;
    const kept = [];

    for (const b of list) {
      summary.scanned++;
      const slotMs = slotEpoch(b);
      const mins   = slotMs ? (slotMs - now) / 60000 : null;

      // Review email ~60 min after check-in
      if (b.status === 'checkedIn' && b.checkInAt && !b.reviewSent &&
          (now - Number(b.checkInAt)) >= 60 * 60000) {
        try { await sendEmailResend(env, reviewEmail(b), `How was your visit to ${b.restaurant}? ⭐`, b.email);
              b.reviewSent = true; b.status = 'completed'; changed = true; summary.reviews++; }
        catch (e) { summary.errors.push('review:' + e.message); }
        kept.push(b); continue;
      }

      // No-show auto-cancel: 15+ min past the slot and still merely 'booked'.
      // Off unless ENABLE_AUTOCANCEL === 'true' (until admin check-in exists,
      // this would cancel every booking — so it's opt-in).
      if (env.ENABLE_AUTOCANCEL === 'true' && b.status === 'booked' && mins !== null && mins <= -15) {
        try {
          await deleteSlot(token, b);
          await sendEmailResend(env, cancelEmail(b), `Your Dinery reservation at ${b.restaurant} was cancelled`, b.email);
          summary.cancelled++; changed = true;
          // drop it from the list (mirrors a normal cancellation)
          continue;
        } catch (e) { summary.errors.push('cancel:' + e.message); kept.push(b); continue; }
      }

      // Reminders (only while still 'booked')
      if (b.status === 'booked' && mins !== null) {
        if (!b.remind60Sent && mins <= 60 && mins > 30) {
          await pushAll(env, subs, reminderPayload(b, 60));
          b.remind60Sent = true; changed = true; summary.remind60++;
        } else if (!b.remind30Sent && mins <= 30 && mins > 0) {
          await pushAll(env, subs, reminderPayload(b, 30));
          b.remind30Sent = true; changed = true; summary.remind30++;
        }
      }
      kept.push(b);
    }

    if (changed) {
      try { await patchReservations(token, uid, kept); }
      catch (e) { summary.errors.push('patch:' + e.message); }
    }
  }
  return summary;
}

function slotEpoch(b) {
  if (!b.slotDate || !b.slotTime) return null;
  const ms = Date.parse(`${b.slotDate}T${b.slotTime}:00${TZ_OFFSET}`);
  return Number.isNaN(ms) ? null : ms;
}

// A guest is an anonymous account: its /users doc has no email (real accounts
// always store one at sign-up). It's "stale" once every reservation has ended
// and GUEST_TTL_HOURS have passed since the latest one — and there's nothing
// upcoming. We never touch docs that carry an email (real accounts).
function isStaleGuest(user, list, now, env) {
  if ((user.email || '').trim()) return false;          // real account — keep
  const ttlMs = (Number(env.GUEST_TTL_HOURS) || 24) * 3600 * 1000;

  // Newest known moment across reservations (prefer the slot time; fall back to
  // when the booking was created so we never delete a brand-new guest).
  let latest = 0;
  for (const b of list) {
    const slot = slotEpoch(b);
    if (slot && slot > latest) latest = slot;
    if (b.ts  && b.ts  > latest) latest = b.ts;
  }

  // An empty guest doc with no reservations carries no timestamp we can trust,
  // so leave it alone rather than risk deleting one mid-booking.
  if (!latest) return false;

  // Keep until the grace period after the most recent reservation/booking.
  return (now - latest) >= ttlMs;
}

function reminderPayload(b, mins) {
  return {
    title: 'Reservation reminder',
    body:  `Your table at ${b.restaurant} is in ${mins} minutes (${b.time}).`,
    url:   `${SITE}/?r=${encodeURIComponent(b.ref)}&a=view`,
    tag:   `r-${b.ref}-${mins}`,
  };
}

// ── Firestore REST ──────────────────────────────────────────────────────────
async function listUsers(token) {
  const out = [];
  let pageToken = '';
  do {
    const url = `${FS_BASE}/users?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('listUsers ' + res.status + ' ' + (await res.text()));
    const j = await res.json();
    for (const doc of (j.documents || [])) {
      const uid = doc.name.split('/').pop();
      const obj = fromFsFields(doc.fields || {});
      out.push({ uid, ...obj });
    }
    pageToken = j.nextPageToken || '';
  } while (pageToken);
  return out;
}

async function patchReservations(token, uid, reservations) {
  const url = `${FS_BASE}/users/${uid}?updateMask.fieldPaths=reservations`;
  const body = { fields: { reservations: toFs(reservations) } };
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('patch ' + res.status + ' ' + (await res.text()));
}

async function deleteSlot(token, b) {
  if (b.restaurantId == null || !b.hall || !b.assignedTable) return;
  const id = `${b.restaurantId}__${b.hall}__${b.assignedTable.id}__${b.slotDate}__${b.slotTime}`.replace(/[:\s]/g, '');
  const res = await fetch(`${FS_BASE}/slots/${id}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
  });
  // 404 is fine (already gone)
  if (!res.ok && res.status !== 404) console.log('deleteSlot', res.status, await res.text());
}

// Delete the guest's Firestore /users doc.
async function deleteUserDoc(token, uid) {
  const res = await fetch(`${FS_BASE}/users/${uid}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 404) throw new Error('deleteUserDoc ' + res.status + ' ' + (await res.text()));
}

// Delete the guest's Firebase Auth account (Identity Toolkit Admin API).
// Needs the cloud-platform scope + Firebase Authentication Admin IAM role.
async function deleteAuthUser(env, token, uid) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:delete`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ localId: uid }),
    });
  // USER_NOT_FOUND is fine (already gone)
  if (!res.ok) {
    const t = await res.text();
    if (!t.includes('USER_NOT_FOUND')) throw new Error('deleteAuthUser ' + res.status + ' ' + t);
  }
}

function fromFsFields(fields) { const o = {}; for (const k in fields) o[k] = fromFs(fields[k]); return o; }
function fromFs(v) {
  if (v.nullValue !== undefined)      return null;
  if (v.stringValue !== undefined)    return v.stringValue;
  if (v.booleanValue !== undefined)   return v.booleanValue;
  if (v.integerValue !== undefined)   return Number(v.integerValue);
  if (v.doubleValue !== undefined)    return v.doubleValue;
  if (v.timestampValue !== undefined) return v.timestampValue;
  if (v.mapValue !== undefined)       return fromFsFields(v.mapValue.fields || {});
  if (v.arrayValue !== undefined)     return (v.arrayValue.values || []).map(fromFs);
  return null;
}
function toFs(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string')  return { stringValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number')  return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  if (Array.isArray(val))       return { arrayValue: { values: val.map(toFs) } };
  if (typeof val === 'object')  { const fields = {}; for (const k in val) fields[k] = toFs(val[k]); return { mapValue: { fields } }; }
  return { nullValue: null };
}

// ── Google service-account OAuth (RS256 JWT → access token) ───────────────────
async function getAccessToken(env) {
  const sa = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim  = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  };
  const unsigned = b64urlStr(JSON.stringify(header)) + '.' + b64urlStr(JSON.stringify(claim));
  const key = await crypto.subtle.importKey('pkcs8', pemToBuf(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned)));
  const jwt = unsigned + '.' + b64urlBytes(sig);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  if (!res.ok) throw new Error('token ' + res.status + ' ' + (await res.text()));
  return (await res.json()).access_token;
}

// ── Web Push (VAPID + RFC 8291 aes128gcm) ─────────────────────────────────────
async function pushAll(env, subs, payload) {
  for (const s of subs) {
    if (!s?.endpoint || !s?.keys?.p256dh || !s?.keys?.auth) continue;
    try { await sendPush(env, s, payload); }
    catch (e) { console.log('push failed:', e.message); }
  }
}

async function sendPush(env, sub, payload) {
  const uaPublic   = b64urlToBytes(sub.keys.p256dh);
  const authSecret = b64urlToBytes(sub.keys.auth);
  const plaintext  = new TextEncoder().encode(JSON.stringify(payload));

  const asPair    = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPublic  = new Uint8Array(await crypto.subtle.exportKey('raw', asPair.publicKey)); // 65 bytes
  const uaKey     = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdh      = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, asPair.privateKey, 256));

  const ikmInfo = concat(new TextEncoder().encode('WebPush: info\0'), uaPublic, asPublic);
  const ikm     = await hkdf(authSecret, ecdh, ikmInfo, 32);

  const salt  = crypto.getRandomValues(new Uint8Array(16));
  const cek   = await hkdf(salt, ikm, new TextEncoder().encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, new TextEncoder().encode('Content-Encoding: nonce\0'), 12);

  const padded  = concat(plaintext, new Uint8Array([2]));   // 0x02 = last record
  const aesKey  = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt']);
  const cipher  = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, padded));

  const rs = 4096;
  const header = new Uint8Array(21 + 65);
  header.set(salt, 0);
  header[16] = (rs >>> 24) & 255; header[17] = (rs >>> 16) & 255; header[18] = (rs >>> 8) & 255; header[19] = rs & 255;
  header[20] = 65;
  header.set(asPublic, 21);
  const body = concat(header, cipher);

  const url = new URL(sub.endpoint);
  const jwt = await vapidJwt(`${url.protocol}//${url.host}`, env);
  const res = await fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      TTL: '2419200',
      'Content-Encoding': 'aes128gcm',
      Authorization: `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
    },
    body,
  });
  if (!res.ok && res.status !== 201) console.log('push status', res.status, await res.text());
}

async function vapidJwt(aud, env) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'ES256', typ: 'JWT' };
  const claim  = { aud, exp: now + 12 * 3600, sub: VAPID_SUB };
  const unsigned = b64urlStr(JSON.stringify(header)) + '.' + b64urlStr(JSON.stringify(claim));
  const key = await crypto.subtle.importKey('jwk',
    { kty: 'EC', crv: 'P-256', d: env.VAPID_PRIVATE_KEY, x: VAPID_X, y: VAPID_Y, ext: true },
    { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(unsigned)));
  return unsigned + '.' + b64urlBytes(sig);
}

async function hkdf(salt, ikm, info, length) {
  const key  = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, length * 8);
  return new Uint8Array(bits);
}

// ── Resend email (cancellation / review) ──────────────────────────────────────
async function sendEmailResend(env, html, subject, to) {
  if (!to) return;
  if (!env.RESEND_API_KEY) { console.log('no RESEND_API_KEY'); return; }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.RESEND_FROM || 'Dinery <noreply@dinery.am>', to: [to], subject, html }),
  });
  if (!res.ok) throw new Error('resend ' + res.status + ' ' + (await res.text()));
}

function shell(title, bodyRows) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#FAF4E8;font-family:Georgia,serif;">
<center><table role="presentation" width="100%" style="max-width:600px;margin:0 auto;">
  <tr><td style="background:#391212;padding:24px 36px;"><span style="font-size:22px;letter-spacing:2px;color:#FAF4E8;font-weight:bold;">DINERY</span></td></tr>
  ${bodyRows}
  <tr><td style="background:#FAF4E8;padding:28px 36px;text-align:center;font-size:13px;color:#5a4a42;">Need help? Call <a href="tel:+37494115955" style="color:#391212;">+374 94 115955</a> or email <a href="mailto:info@dinery.am" style="color:#391212;">info@dinery.am</a></td></tr>
  <tr><td style="background:#FDF8F0;padding:20px 36px;font-size:11px;color:#8a7a6f;">© 2026 DINERY · YEREVAN, ARMENIA</td></tr>
</table></center></body></html>`;
}

function cancelEmail(b) {
  return shell('Reservation cancelled', `
  <tr><td style="background:#FDF8F0;padding:36px;text-align:center;">
    <h1 style="margin:0 0 12px 0;font-size:30px;color:#391212;text-transform:uppercase;">Reservation cancelled</h1>
    <p style="margin:0;font-size:15px;color:#5a4a42;line-height:1.6;">Hi ${b.name || 'there'}, your reservation at <strong>${b.restaurant}</strong> on ${b.date} at ${b.time} was cancelled because the table wasn't checked in within 15 minutes of the reservation time.</p>
  </td></tr>
  <tr><td style="background:#FAF4E8;padding:0 36px 36px;text-align:center;"><a href="${SITE}" style="display:inline-block;background:#391212;color:#FAF4E8;padding:16px 30px;border-radius:3px;text-decoration:none;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Book Again</a></td></tr>`);
}

function reviewEmail(b) {
  const star = (n) => `<a href="${SITE}/?r=${encodeURIComponent(b.ref)}&a=review&rating=${n}" style="text-decoration:none;color:#C9A24B;font-size:32px;padding:0 3px;">★</a>`;
  return shell('How was your visit?', `
  <tr><td style="background:#FDF8F0;padding:36px;text-align:center;">
    <h1 style="margin:0 0 12px 0;font-size:30px;color:#391212;text-transform:uppercase;">Tell us about your visit</h1>
    <p style="margin:0;font-size:15px;color:#5a4a42;line-height:1.6;">You dined at <strong>${b.restaurant}</strong> on ${b.date}. We'd love to hear how it went, ${b.name || 'there'}.</p>
  </td></tr>
  <tr><td style="background:#fff;padding:32px 36px;text-align:center;">
    <p style="margin:0 0 16px 0;font-size:11px;letter-spacing:3px;color:#391212;text-transform:uppercase;font-weight:bold;">How would you rate it?</p>
    <p style="margin:0 0 24px 0;">${star(1)}${star(2)}${star(3)}${star(4)}${star(5)}</p>
    <a href="${SITE}/?r=${encodeURIComponent(b.ref)}&a=review" style="display:inline-block;background:#391212;color:#FAF4E8;padding:16px 30px;border-radius:3px;text-decoration:none;font-size:13px;letter-spacing:2px;text-transform:uppercase;">★ Leave a Review</a>
  </td></tr>`);
}

// ── encoding helpers ──────────────────────────────────────────────────────────
function b64urlBytes(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlStr(str) { return b64urlBytes(new TextEncoder().encode(str)); }
function b64urlToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  s += '='.repeat((4 - (s.length % 4)) % 4);
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function pemToBuf(pem) {
  const b64 = pem.replace(/-----BEGIN [^-]+-----/, '').replace(/-----END [^-]+-----/, '').replace(/\s+/g, '');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}
function concat(...arrs) {
  const len = arrs.reduce((a, b) => a + b.length, 0);
  const out = new Uint8Array(len);
  let o = 0;
  for (const a of arrs) { out.set(a, o); o += a.length; }
  return out;
}
