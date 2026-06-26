// ─────────────────────────────────────────────────────────────────────────────
//  Dinery — Email proxy (Cloudflare Worker)
//
//  The Resend API key is a SECRET and must never live in browser code. This
//  Worker holds it (as an environment variable / secret) and is the only thing
//  that talks to Resend. The Dinery web app POSTs the email here; the Worker
//  forwards it to Resend.
//
//  Environment variables (set in the Cloudflare dashboard → Worker → Settings →
//  Variables, or via `wrangler secret put`):
//    RESEND_API_KEY  (secret, required)  e.g. re_xxxxxxxxxxxxxxxxxxxx
//    RESEND_FROM     (text, optional)    e.g. "Dinery <noreply@dinery.am>"
//                                        defaults to onboarding@resend.dev (test)
//
//  Abuse protection: only requests from the origins in ALLOWED_ORIGINS are
//  accepted, and the `from` address is fixed server-side. Edit the list below
//  to match where the app is actually served from.
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  'https://dinery.am',
  'https://www.dinery.am',
  'https://levongrig.github.io',
];

const DEFAULT_FROM    = 'Dinery <onboarding@resend.dev>';
const MAX_HTML_BYTES  = 200000;
const FIREBASE_API_KEY = 'AIzaSyADyxfyxp9DNqrgJmqrCYn_iuGuzzgjQSA';
const PROJECT_ID       = 'dinery-fca7d';
const DB_ID            = 'default';
const SITE             = 'https://dinery.am';

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors   = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, cors);
    }
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return json({ error: 'Forbidden origin' }, 403, cors);
    }
    if (!env.RESEND_API_KEY) {
      return json({ error: 'Server not configured (missing RESEND_API_KEY)' }, 500, cors);
    }

    let body;
    try { body = await request.json(); }
    catch { return json({ error: 'Invalid JSON' }, 400, cors); }

    // ── Route: password reset email ──────────────────────────────────────────
    if (body?.type === 'password-reset') {
      const email = (body.email || '').trim().toLowerCase();
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return json({ error: 'Invalid email' }, 400, cors);
      }
      if (!env.GOOGLE_SERVICE_ACCOUNT) {
        console.error('password-reset: GOOGLE_SERVICE_ACCOUNT secret is not set');
        return json({ error: 'Server not configured (missing GOOGLE_SERVICE_ACCOUNT)' }, 500, cors);
      }
      try {
        const link = await generatePasswordResetLink(env, email);
        console.log('password-reset: generated link for', email);
        const resendRes = await sendResend(env, email, 'Reset your Dinery password', passwordResetHtml(email, link));
        const resendBody = await resendRes.text();
        if (!resendRes.ok) {
          console.error('password-reset: Resend error', resendRes.status, resendBody);
          return json({ error: 'Email delivery failed', detail: resendBody }, 502, cors);
        }
        console.log('password-reset: email sent to', email);
      } catch (e) {
        console.error('password-reset error:', e.message);
        return json({ error: e.message }, 500, cors);
      }
      return json({ ok: true }, 200, cors);
    }

    // ── Route: generic email ─────────────────────────────────────────────────
    const { to, subject, html } = body || {};
    if (!to || !subject || !html) {
      return json({ error: 'Missing to, subject or html' }, 400, cors);
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
      return json({ error: 'Invalid recipient address' }, 400, cors);
    }
    if (typeof html !== 'string' || html.length > MAX_HTML_BYTES) {
      return json({ error: 'Payload too large' }, 413, cors);
    }

    const resendRes = await sendResend(env, to, String(subject).slice(0, 250), html);
    const text = await resendRes.text();
    return new Response(text, {
      status: resendRes.status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  },
};

// ── Generate Firebase password-reset link via Identity Toolkit Admin API ───────
// Uses the service-account OAuth token so Firebase returns the raw link instead
// of sending their own branded email.
async function generatePasswordResetLink(env, email) {
  const token = await getAccessToken(env);
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Firebase-Locale': 'en',
      },
      body: JSON.stringify({
        requestType: 'PASSWORD_RESET',
        email,
        returnOobLink: true,    // admin-only: return link instead of sending email
        continueUrl: SITE,      // where the user ends up after resetting
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`generatePasswordResetLink ${res.status}: ${err}`);
  }
  const data = await res.json();
  if (!data.oobLink) throw new Error('No oobLink in response');
  return data.oobLink;
}

// ── Resend helper ─────────────────────────────────────────────────────────────
function sendResend(env, to, subject, html) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM || DEFAULT_FROM,
      to: [to],
      subject,
      html,
    }),
  });
}

// ── Password-reset email template ─────────────────────────────────────────────
function passwordResetHtml(email, resetUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reset your password</title></head>
<body style="margin:0;padding:0;background:#FAF4E8;font-family:Georgia,serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF4E8;padding:40px 20px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06)">
        <tr><td style="background:#391212;padding:32px 40px;text-align:center">
          <div style="font-size:32px;font-weight:800;color:#C9A24B;letter-spacing:2px">Din<span style="color:#FAF4E8">ery</span></div>
        </td></tr>
        <tr><td style="padding:40px 40px 20px;text-align:center">
          <div style="font-size:40px;margin-bottom:16px">🔑</div>
          <h1 style="font-size:22px;color:#391212;margin:0 0 12px;font-weight:700">Reset your password</h1>
          <p style="font-size:15px;color:#6b5c52;line-height:1.6;margin:0 0 28px">
            We received a request to reset the password for <strong>${email}</strong>.<br>
            Click the button below to choose a new password.
          </p>
          <a href="${resetUrl}" style="display:inline-block;background:#391212;color:#FAF4E8;padding:16px 36px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:.5px">Set New Password</a>
        </td></tr>
        <tr><td style="padding:24px 40px 40px;text-align:center;border-top:1px solid #f0ebe3">
          <p style="font-size:13px;color:#8a7a6f;line-height:1.6;margin:0">
            This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your account remains secure.
          </p>
        </td></tr>
        <tr><td style="background:#f9f4ee;padding:20px 40px;text-align:center">
          <p style="font-size:12px;color:#a09080;margin:0">
            © 2025 Dinery · Fine Dining Reservations, Yerevan
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Service-account JWT → access token (shared with scheduler pattern) ─────────
async function getAccessToken(env) {
  const sa  = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim  = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  };
  const unsigned = b64urlStr(JSON.stringify(header)) + '.' + b64urlStr(JSON.stringify(claim));
  const key = await crypto.subtle.importKey(
    'pkcs8', pemToBuf(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned)));
  const jwt = unsigned + '.' + b64urlBytes(sig);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  if (!res.ok) throw new Error('OAuth token fetch failed: ' + res.status);
  return (await res.json()).access_token;
}

function b64urlStr(str)   { return b64urlBytes(new TextEncoder().encode(str)); }
function b64urlBytes(buf) { return btoa(String.fromCharCode(...buf)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function pemToBuf(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const bin = atob(b64);
  return Uint8Array.from(bin, c => c.charCodeAt(0)).buffer;
}

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
