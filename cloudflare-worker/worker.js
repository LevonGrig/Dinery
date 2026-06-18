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

const DEFAULT_FROM = 'Dinery <onboarding@resend.dev>';
const MAX_HTML_BYTES = 200000;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

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

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.RESEND_FROM || DEFAULT_FROM,
        to: [to],
        subject: String(subject).slice(0, 250),
        html,
      }),
    });

    const text = await resendRes.text();
    return new Response(text, {
      status: resendRes.status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  },
};

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
