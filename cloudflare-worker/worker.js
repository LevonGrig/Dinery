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
  const token = await getAccessToken(env, 'https://www.googleapis.com/auth/identitytoolkit');
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:sendOobCode`,
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

// ── Password-reset email template (editorial design, matches email.js) ────────
function passwordResetHtml(email, resetUrl) {
  const svgIcon = (d) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#391212" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const iconUri = (svg) => 'data:image/svg+xml;base64,' + btoa(svg);
  const igIcon  = iconUri(svgIcon('<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>'));
  const fbIcon  = iconUri(svgIcon('<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>'));
  const ttIcon  = iconUri(svgIcon('<path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>'));

  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Reset Your Password</title>
</head>
<body style="margin:0; padding:0; background-color:#FAF4E8; font-family:Georgia, 'Times New Roman', serif;">

<div style="display:none; font-size:1px; color:#FAF4E8; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
  A password reset was requested for your Dinery account. If this wasn't you, you can safely ignore this email.
</div>

<center style="width:100%; background-color:#FAF4E8;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px; margin:0 auto;" align="center">

  <tr><td style="background-color:#B87040; padding:28px 36px 0 36px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td align="left" valign="middle"><span style="font-family:Georgia, serif; font-size:26px; letter-spacing:3px; color:#FAF4E8; font-weight:bold;">DINERY</span></td>
      <td align="right" valign="middle"><span style="font-family:Georgia, serif; font-size:11px; letter-spacing:2px; color:#FAF4E8; text-transform:uppercase;">Yerevan, Armenia</span></td>
    </tr></table>
  </td></tr>
  <tr><td style="background-color:#B87040; padding:18px 36px 26px 36px;">
    <div style="border-top:1px solid rgba(250,244,232,0.4); line-height:1px; font-size:1px;">&nbsp;</div>
  </td></tr>

  <tr><td align="center" style="background-color:#FDF8F0; padding:44px 36px 36px 36px;">
    <h1 style="margin:0 0 14px 0; font-family:Georgia, serif; font-size:30px; line-height:1.25; color:#391212; font-weight:bold; text-transform:uppercase; letter-spacing:1px;">Reset Your Password</h1>
    <p style="margin:0; font-size:15px; line-height:1.75; color:#5a4a42; max-width:420px; margin-left:auto; margin-right:auto;">
      We received a request to reset the password for your Dinery account (<strong>${email}</strong>). Click the button below to choose a new password.
    </p>
  </td></tr>

  <tr><td align="center" style="background-color:#FDF8F0; padding:0 36px 44px 36px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td align="center" style="background-color:#391212; border-radius:50px; padding:16px 40px;">
        <a href="${resetUrl}" target="_blank" style="font-family:Georgia, serif; font-size:14px; letter-spacing:1.5px; color:#FAF4E8; text-decoration:none; text-transform:uppercase; font-weight:bold; display:inline-block;">Reset My Password</a>
      </td>
    </tr></table>
  </td></tr>

  <tr><td style="background-color:#FDF8F0; padding:0 36px;"><div style="border-top:1.5px solid #391212; line-height:1px; font-size:1px;">&nbsp;</div></td></tr>

  <tr><td align="center" style="background-color:#FAF4E8; padding:36px 36px 28px 36px;">
    <p style="margin:0 0 6px 0; font-size:11px; letter-spacing:3px; color:#391212; text-transform:uppercase; font-weight:bold;">Security Notice</p>
    <p style="margin:0; font-size:14px; line-height:1.75; color:#5a4a42; max-width:440px; margin-left:auto; margin-right:auto;">
      This link is valid for <strong style="color:#391212;">1 hour</strong> and can only be used once. Please do not share it with anyone — Dinery will never ask for your reset link.
    </p>
  </td></tr>

  <tr><td style="background-color:#FAF4E8; padding:0 36px;"><div style="border-top:1.5px solid #391212; line-height:1px; font-size:1px;">&nbsp;</div></td></tr>

  <tr><td align="center" style="background-color:#FAF4E8; padding:36px 36px 28px 36px;">
    <p style="margin:0 0 6px 0; font-size:11px; letter-spacing:3px; color:#391212; text-transform:uppercase; font-weight:bold;">Button Not Working?</p>
    <p style="margin:0 0 12px 0; font-size:14px; line-height:1.75; color:#5a4a42; max-width:440px; margin-left:auto; margin-right:auto;">Copy and paste the link below into your browser:</p>
    <p style="margin:0; font-size:12px; color:#8a7a6f; word-break:break-all; max-width:440px; margin-left:auto; margin-right:auto;">${resetUrl}</p>
  </td></tr>

  <tr><td style="background-color:#FAF4E8; padding:0 36px;"><div style="border-top:1.5px solid #391212; line-height:1px; font-size:1px;">&nbsp;</div></td></tr>

  <tr><td align="center" style="background-color:#FAF4E8; padding:36px 36px 28px 36px;">
    <p style="margin:0 0 6px 0; font-size:11px; letter-spacing:3px; color:#391212; text-transform:uppercase; font-weight:bold;">Didn't Request This?</p>
    <p style="margin:0; font-size:14px; line-height:1.75; color:#5a4a42; max-width:440px; margin-left:auto; margin-right:auto;">
      If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged. If you're concerned about your account's security, reach us at
      <a href="mailto:support@dinery.am" style="color:#391212; text-decoration:underline;">support@dinery.am</a>.
    </p>
  </td></tr>

  <tr><td style="background-color:#FDF8F0; padding:32px 36px;">
    <div style="border-top:1.5px solid #391212; line-height:1px; font-size:1px; margin-bottom:24px;">&nbsp;</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td align="left" valign="middle">
        <p style="margin:0 0 4px 0; font-size:11px; color:#8a7a6f; letter-spacing:1px;">© 2026 DINERY</p>
        <p style="margin:0; font-size:11px; color:#8a7a6f; letter-spacing:1px;">YEREVAN, ARMENIA</p>
      </td>
      <td align="right" valign="middle">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="padding:0 4px;">
            <a href="https://instagram.com/dinery" target="_blank" style="display:inline-block; width:36px; height:36px; border:1.5px solid #391212; border-radius:50%; text-align:center; line-height:36px;">
              <img src="${igIcon}" alt="Instagram" width="16" style="vertical-align:middle;">
            </a>
          </td>
          <td style="padding:0 4px;">
            <a href="https://facebook.com/dinery" target="_blank" style="display:inline-block; width:36px; height:36px; border:1.5px solid #391212; border-radius:50%; text-align:center; line-height:36px;">
              <img src="${fbIcon}" alt="Facebook" width="16" style="vertical-align:middle;">
            </a>
          </td>
          <td style="padding:0 4px;">
            <a href="https://tiktok.com/@dinery" target="_blank" style="display:inline-block; width:36px; height:36px; border:1.5px solid #391212; border-radius:50%; text-align:center; line-height:36px;">
              <img src="${ttIcon}" alt="TikTok" width="16" style="vertical-align:middle;">
            </a>
          </td>
        </tr></table>
      </td>
    </tr></table>
    <p style="margin:24px 0 0 0; font-size:10px; color:#a89a8e; letter-spacing:1px;">
      <a href="https://dinery.am" style="color:#a89a8e; text-decoration:underline;">Privacy Policy</a>
      &nbsp;|&nbsp;
      <a href="https://dinery.am" style="color:#a89a8e; text-decoration:underline;">Terms of Service</a>
    </p>
  </td></tr>

</table>
</center>

</body>
</html>`;
}

// ── Service-account JWT → access token (shared with scheduler pattern) ─────────
async function getAccessToken(env, scope = 'https://www.googleapis.com/auth/cloud-platform') {
  const sa  = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim  = {
    iss: sa.client_email,
    scope,
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
