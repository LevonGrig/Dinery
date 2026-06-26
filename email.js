// ─────────────────────────────────────────────────────────────────────────────
//  Dinery — Email (templates + sending)
//
//  Loaded as a classic script BEFORE app.js. Functions/EMAIL_CONFIG defined here
//  are globally available to app.js; they reference app.js globals (state,
//  RESTAURANTS) only at call time, so load order between the two is safe.
// ─────────────────────────────────────────────────────────────────────────────

// ── Email (Resend via Cloudflare Worker) ─────────────────────────────────────
// Emails go through a Cloudflare Worker proxy that holds the Resend API key
// server-side (the key must never live in browser code). Deploy the worker in
// /cloudflare-worker (see its README) and paste its URL below.
const EMAIL_CONFIG = {
  workerUrl: 'https://dinery-email.proud-disk-7fd3.workers.dev',
};

// Generic sender — POSTs an email to the Worker. Fire-and-forget; logs failures
// and silently no-ops until the Worker URL is configured.
async function sendEmail({ to, subject, html }) {
  if (!to) return;
  if (!EMAIL_CONFIG.workerUrl || EMAIL_CONFIG.workerUrl.includes('YOUR-SUBDOMAIN')) return;
  try {
    const res = await fetch(EMAIL_CONFIG.workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    });
    if (!res.ok) {
      console.error('Email send failed:', res.status, await res.text().catch(() => ''));
    } else {
      console.log('Email sent to', to);
    }
  } catch (e) {
    console.error('Email send failed:', e?.message || e);
  }
}

// Sends a branded password-reset email via the Worker (uses Firebase Admin to
// generate the link, then Resend to deliver from noreply@dinery.am).
async function sendPasswordResetViaWorker(email) {
  if (!email) return;
  if (!EMAIL_CONFIG.workerUrl || EMAIL_CONFIG.workerUrl.includes('YOUR-SUBDOMAIN')) return;
  const res = await fetch(EMAIL_CONFIG.workerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'password-reset', email }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Worker responded ${res.status}: ${err}`);
  }
}

function buildCancellationEmailHTML(booking, restaurant, userName) {
  const phone    = '+37494115955';
  const imgUrl   = restaurant?.img   || '';
  const restName = booking.restaurant || 'your restaurant';
  const date     = booking.date        || '—';
  const time     = booking.time        || '—';
  const guests   = booking.guests      || '—';
  const ref      = booking.ref         || '—';
  const name     = userName            || 'Guest';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Reservation Cancelled – Dinery</title></head>
<body style="margin:0;padding:0;background:#FAF4E8;font-family:Georgia,'Times New Roman',serif;">
<div style="display:none;font-size:1px;color:#FAF4E8;max-height:0;overflow:hidden;">
Your reservation at ${restName} has been cancelled. We hope to host you another time.</div>
<center style="width:100%;background:#FAF4E8;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;">
  <tr><td style="background:#391212;padding:28px 36px 18px 36px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td align="left"><span style="font-family:Georgia,serif;font-size:22px;letter-spacing:2px;color:#FAF4E8;font-weight:bold;">DINERY</span></td>
      <td align="right"><span style="font-family:Georgia,serif;font-size:11px;letter-spacing:3px;color:#FAF4E8;text-transform:uppercase;">Yerevan</span></td>
    </tr></table>
  </td></tr>
  <tr><td style="background:#391212;padding:0 36px 24px 36px;">
    <div style="border-top:1.5px solid #FAF4E8;line-height:1px;font-size:1px;">&nbsp;</div>
  </td></tr>
  <tr><td align="center" style="background:#FDF8F0;padding:40px 36px;">
    <h1 style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:34px;color:#391212;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">
      Your reservation has been cancelled</h1>
    <p style="margin:0;font-size:15px;line-height:1.7;color:#5a4a42;">
      Hi ${name}, your reservation has been successfully cancelled.<br>We hope to host you another time.</p>
  </td></tr>
  ${imgUrl ? `<tr><td style="background:#fff;padding:0;line-height:0;">
    <img src="${imgUrl}" width="600" alt="${restName}" style="width:100%;max-width:600px;height:220px;object-fit:cover;display:block;">
  </td></tr>` : ''}
  <tr><td style="background:#fff;padding:32px 36px 40px 36px;">
    <p style="margin:0 0 16px 0;font-size:11px;letter-spacing:3px;color:#391212;text-transform:uppercase;font-weight:bold;">Cancelled Reservation</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td width="50%" valign="top" style="padding-bottom:14px;">
          <p style="margin:0;font-size:14px;color:#391212;"><strong>Restaurant</strong><br>
          <span style="color:#5a4a42;">${restName}</span></p>
        </td>
        <td width="50%" valign="top" style="padding-bottom:14px;">
          <p style="margin:0;font-size:14px;color:#391212;"><strong>Date</strong><br>
          <span style="color:#5a4a42;">${date}</span></p>
        </td>
      </tr>
      <tr>
        <td width="50%" valign="top" style="padding-bottom:14px;">
          <p style="margin:0;font-size:14px;color:#391212;"><strong>Time</strong><br>
          <span style="color:#5a4a42;">${time}</span></p>
        </td>
        <td width="50%" valign="top" style="padding-bottom:14px;">
          <p style="margin:0;font-size:14px;color:#391212;"><strong>Party Size</strong><br>
          <span style="color:#5a4a42;">${guests} guest${guests === 1 ? '' : 's'}</span></p>
        </td>
      </tr>
      <tr>
        <td width="50%" valign="top">
          <p style="margin:0;font-size:14px;color:#391212;"><strong>Reservation Code</strong><br>
          <span style="color:#5a4a42;">${ref}</span></p>
        </td>
        <td width="50%" valign="top"></td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="background:#fff;padding:0 36px;">
    <div style="border-top:1.5px solid #391212;line-height:1px;font-size:1px;">&nbsp;</div>
  </td></tr>
  <tr><td align="center" style="background:#fff;padding:40px 36px 10px 36px;">
    <p style="margin:0 0 4px 0;font-family:Georgia,serif;font-size:11px;letter-spacing:3px;color:#391212;text-transform:uppercase;font-weight:bold;">What's Next</p>
    <h2 style="margin:0;font-family:Georgia,serif;font-size:24px;color:#391212;font-weight:bold;">Ready when you are</h2>
  </td></tr>
  <tr><td align="center" style="background:#fff;padding:28px 36px 40px 36px;">
    <p style="margin:0;font-size:14px;color:#5a4a42;line-height:1.7;max-width:440px;margin-left:auto;margin-right:auto;">
      Changed your mind, or just looking for the next great table? Browse restaurants and book whenever you're ready.</p>
  </td></tr>
  <tr><td style="background:#FAF4E8;padding:40px 36px;">
    <a href="https://dinery.am" target="_blank"
       style="display:block;background:#391212;color:#FAF4E8;font-family:Georgia,serif;font-size:14px;letter-spacing:2px;font-weight:bold;text-decoration:none;padding:18px 0;border-radius:3px;text-align:center;text-transform:uppercase;">
      Browse Restaurants</a>
  </td></tr>
  <tr><td style="background:#FAF4E8;padding:0 36px;">
    <div style="border-top:1.5px solid #391212;line-height:1px;font-size:1px;">&nbsp;</div>
  </td></tr>
  <tr><td align="left" style="background:#FAF4E8;padding:32px 36px;">
    <p style="margin:0 0 14px 0;font-size:11px;letter-spacing:3px;color:#391212;text-transform:uppercase;font-weight:bold;">Important Things to Know</p>
    <p style="margin:0 0 8px 0;font-size:13px;color:#5a4a42;line-height:1.6;">• No charges were made — there's nothing further you need to do.</p>
    <p style="margin:0 0 8px 0;font-size:13px;color:#5a4a42;line-height:1.6;">• Cancelled this by mistake? You can make a new reservation anytime through the app.</p>
    <p style="margin:0;font-size:13px;color:#5a4a42;line-height:1.6;">• We may contact you about this cancellation, so please ensure your email and phone number are up to date.</p>
  </td></tr>
  <tr><td style="background:#FAF4E8;padding:0 36px;">
    <div style="border-top:1.5px solid #391212;line-height:1px;font-size:1px;">&nbsp;</div>
  </td></tr>
  <tr><td align="left" style="background:#FAF4E8;padding:32px 36px;">
    <p style="margin:0 0 10px 0;font-size:11px;letter-spacing:3px;color:#391212;text-transform:uppercase;font-weight:bold;">Protect Your Data</p>
    <p style="margin:0;font-size:13px;color:#5a4a42;line-height:1.6;">Dinery will never contact you asking for your password, payment details, or other personal information. If you receive a message like this, please contact us immediately.</p>
  </td></tr>
  <tr><td align="center" style="background:#FAF4E8;padding:0 36px 40px 36px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1.5px solid #391212;border-radius:6px;">
      <tr><td align="center" style="padding:24px 22px;">
        <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:3px;color:#391212;text-transform:uppercase;font-weight:bold;">Need Help?</p>
        <p style="margin:0 0 4px 0;font-size:14px;color:#5a4a42;line-height:1.6;">
          Contact the restaurant directly at <a href="tel:${phone}" style="color:#391212;text-decoration:underline;">${phone}</a></p>
        <p style="margin:0;font-size:14px;color:#5a4a42;line-height:1.6;">
          Or reach Dinery support at <a href="mailto:support@dinery.am" style="color:#391212;text-decoration:underline;">support@dinery.am</a></p>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="background:#FDF8F0;padding:32px 36px;">
    <div style="border-top:1.5px solid #391212;line-height:1px;font-size:1px;margin-bottom:24px;">&nbsp;</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td align="left" valign="middle">
        <p style="margin:0 0 4px 0;font-size:11px;color:#8a7a6f;letter-spacing:1px;">© 2026 DINERY</p>
        <p style="margin:0;font-size:11px;color:#8a7a6f;letter-spacing:1px;">YEREVAN, ARMENIA</p>
      </td>
    </tr></table>
    <p style="margin:24px 0 0 0;font-size:10px;color:#a89a8e;letter-spacing:1px;">
      <a href="#" style="color:#a89a8e;text-decoration:underline;">Unsubscribe</a>
      &nbsp;|&nbsp;<a href="#" style="color:#a89a8e;text-decoration:underline;">Privacy Policy</a>
      &nbsp;|&nbsp;<a href="#" style="color:#a89a8e;text-decoration:underline;">Terms of Service</a>
    </p>
  </td></tr>
</table>
</center>
</body></html>`;
}

async function sendCancellationEmail(booking) {
  if (!state.user?.email) return;
  const restaurant = RESTAURANTS.find(r => r.name === booking.restaurant);
  const html       = buildCancellationEmailHTML(booking, restaurant, state.user.name);
  await sendEmail({
    to:      state.user.email,
    subject: `Your Dinery reservation at ${booking.restaurant} has been cancelled`,
    html,
  });
}

// Booking-confirmation email — mirrors the editorial design, all fields filled
// and every button pointing somewhere real.
// One template for both the "confirmed" and "updated" reservation emails.
// variant: 'confirmed' (new booking) | 'modified' (after a change).
function buildReservationEmailHTML(booking, restaurant, userName, variant) {
  const restName = booking.restaurant || 'your restaurant';
  const date     = booking.date        || '—';
  const time     = booking.time        || '—';
  const guests   = booking.guests      || '—';
  const ref      = booking.ref         || '—';
  const seating  = booking.seating     || '';
  const name     = userName            || 'Guest';
  const address  = restaurant?.address || 'Yerevan, Armenia';
  const phone    = '+37494115955';
  const imgUrl   = booking.img || restaurant?.img || '';
  const requests = (booking.requests && booking.requests.trim())
    ? booking.requests.trim()
    : 'No special requests were added to this reservation.';

  const isMod    = variant === 'modified';
  const title    = isMod ? 'Your Dinery Reservation Has Been Updated' : 'Your Dinery Reservation is Confirmed';
  const preview  = isMod
    ? `Your reservation at ${restName} has been updated. Here are your new details.`
    : `Your table is booked. Here are your reservation details for ${restName}.`;
  const headline = isMod ? 'Your reservation has been updated' : 'Your reservation is confirmed';
  const subline  = isMod
    ? `Thank you, ${name} — your reservation has been updated. Here are your new details.`
    : `Thank you, ${name} — your evening is set. Here are your reservation details.`;

  const SITE     = 'https://dinery.am';
  // Deep-links that open the app straight into this booking's flow.
  const manageUrl = (action) => `${SITE}/?r=${encodeURIComponent(ref)}&a=${action}`;
  const mapsUrl  = 'https://maps.google.com/?q=' + encodeURIComponent(address);
  const telHref  = 'tel:' + String(phone).replace(/[^\d+]/g, '');

  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title></head>
<body style="margin:0; padding:0; background-color:#FAF4E8; font-family:Georgia, 'Times New Roman', serif;">
<div style="display:none; font-size:1px; color:#FAF4E8; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
${preview}</div>
<center style="width:100%; background-color:#FAF4E8;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px; margin:0 auto;" align="center">

  <tr><td style="background-color:#391212; padding:28px 36px 18px 36px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td align="left"><span style="font-family:Georgia, serif; font-size:22px; letter-spacing:2px; color:#FAF4E8; font-weight:bold;">DINERY</span></td>
      <td align="right"><span style="font-family:Georgia, serif; font-size:11px; letter-spacing:3px; color:#FAF4E8; text-transform:uppercase;">Yerevan</span></td>
    </tr></table>
  </td></tr>
  <tr><td style="background-color:#391212; padding:0 36px 24px 36px;">
    <div style="border-top:1.5px solid #FAF4E8; line-height:1px; font-size:1px;">&nbsp;</div>
  </td></tr>

  <tr><td align="center" style="background-color:#FDF8F0; padding:40px 36px;">
    <h1 style="margin:0 0 16px 0; font-family:Georgia, serif; font-size:34px; line-height:1.25; color:#391212; font-weight:bold; text-transform:uppercase; letter-spacing:1px;">${headline}</h1>
    <p style="margin:0; font-size:15px; line-height:1.7; color:#5a4a42;">${subline}</p>
  </td></tr>

  <tr><td style="background-color:#FFFFFF; padding:40px 36px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td width="48%" valign="top" style="padding-right:18px;">
        <p style="margin:0 0 16px 0; font-size:11px; letter-spacing:3px; color:#391212; text-transform:uppercase; font-weight:bold;">Reservation Details</p>
        <p style="margin:0 0 10px 0; font-size:14px; color:#391212;"><strong>Restaurant</strong><br><span style="color:#5a4a42;">${restName}</span></p>
        <p style="margin:0 0 10px 0; font-size:14px; color:#391212;"><strong>Date</strong><br><span style="color:#5a4a42;">${date}</span></p>
        <p style="margin:0 0 10px 0; font-size:14px; color:#391212;"><strong>Time</strong><br><span style="color:#5a4a42;">${time}</span></p>
        <p style="margin:0 0 10px 0; font-size:14px; color:#391212;"><strong>Party Size</strong><br><span style="color:#5a4a42;">${guests} guest${guests === 1 ? '' : 's'}</span></p>
        ${seating ? `<p style="margin:0 0 10px 0; font-size:14px; color:#391212;"><strong>Seating</strong><br><span style="color:#5a4a42;">${seating}</span></p>` : ''}
        <p style="margin:0; font-size:14px; color:#391212;"><strong>Reservation Code</strong><br><span style="color:#5a4a42;">${ref}</span></p>
      </td>
      <td width="52%" valign="top" style="padding:0;">
        ${imgUrl ? `<img src="${imgUrl}" alt="${restName}" width="280" style="width:100%; height:280px; object-fit:cover; display:block; border-radius:3px;">` : ''}
      </td>
    </tr></table>
  </td></tr>

  <tr><td style="background-color:#FFFFFF; padding:0 36px;"><div style="border-top:1.5px solid #391212; line-height:1px; font-size:1px;">&nbsp;</div></td></tr>

  <tr><td align="center" style="background-color:#FFFFFF; padding:40px 36px 10px 36px;">
    <p style="margin:0 0 4px 0; font-family:Georgia, serif; font-size:11px; letter-spacing:3px; color:#391212; text-transform:uppercase; font-weight:bold;">Before You Go</p>
    <h2 style="margin:0; font-family:Georgia, serif; font-size:24px; color:#391212; font-weight:bold;">A few things to know</h2>
  </td></tr>

  <tr><td align="center" style="background-color:#FFFFFF; padding:28px 36px;">
    <p style="margin:0 0 6px 0; font-size:15px; color:#391212; font-weight:bold;">Address &amp; Phone</p>
    <p style="margin:0 0 4px 0; font-size:13px; color:#8a7a6f; line-height:1.6;">${address}</p>
    <p style="margin:0 0 16px 0; font-size:13px; color:#8a7a6f; line-height:1.6;">${phone}</p>
    <a href="${mapsUrl}" target="_blank" style="display:inline-block; background-color:#391212; color:#FAF4E8; font-family:Georgia, serif; font-size:12px; letter-spacing:2px; font-weight:bold; text-decoration:none; padding:12px 28px; border-radius:3px; text-align:center; text-transform:uppercase;"><span style="font-size:15px; vertical-align:middle;">&#128205;</span>&nbsp; Get Directions</a>
  </td></tr>

  <tr><td style="background-color:#FFFFFF; padding:0 36px;"><div style="border-top:1.5px solid #391212; line-height:1px; font-size:1px;">&nbsp;</div></td></tr>

  <tr><td align="center" style="background-color:#FFFFFF; padding:28px 36px;">
    <p style="margin:0 0 18px 0; font-size:15px; color:#391212; font-weight:bold;">Need to make changes?</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>
      <td align="center" style="padding:0 18px;">
        <a href="${manageUrl('modify')}" target="_blank" style="text-decoration:none;">
          <div style="width:48px; height:48px; border:2px solid #391212; border-radius:50%; text-align:center; line-height:46px; margin:0 auto 8px auto; font-size:22px; color:#391212;">&#9998;</div>
          <span style="font-size:11px; letter-spacing:2px; color:#391212; text-transform:uppercase; font-weight:bold;">Modify</span>
        </a>
      </td>
      <td align="center" style="padding:0 18px;">
        <a href="${manageUrl('cancel')}" target="_blank" style="text-decoration:none;">
          <div style="width:48px; height:48px; border:2px solid #391212; border-radius:50%; text-align:center; line-height:46px; margin:0 auto 8px auto; font-size:22px; color:#391212;">&#10005;</div>
          <span style="font-size:11px; letter-spacing:2px; color:#391212; text-transform:uppercase; font-weight:bold;">Cancel</span>
        </a>
      </td>
    </tr></table>
  </td></tr>

  <tr><td style="background-color:#FFFFFF; padding:0 36px;"><div style="border-top:1.5px solid #391212; line-height:1px; font-size:1px;">&nbsp;</div></td></tr>

  <tr><td align="center" style="background-color:#FFFFFF; padding:28px 36px 40px 36px;">
    <p style="margin:0 0 6px 0; font-size:15px; color:#391212; font-weight:bold;">Your Special Requests</p>
    <p style="margin:0; font-size:13px; color:#8a7a6f; line-height:1.6;">${requests}</p>
  </td></tr>

  <tr><td style="background-color:#FAF4E8; padding:40px 36px 0 36px;">
    <a href="${manageUrl('view')}" target="_blank" style="display:block; background-color:#391212; color:#FAF4E8; font-family:Georgia, serif; font-size:14px; letter-spacing:2px; font-weight:bold; text-decoration:none; padding:18px 0; border-radius:3px; text-align:center; text-transform:uppercase;"><span style="font-size:15px; vertical-align:middle;">&#128203;</span>&nbsp; View or Manage Reservation</a>
  </td></tr>

  <tr><td align="center" style="background-color:#FAF4E8; padding:40px 36px;">
    <p style="margin:0 0 16px 0; font-family:Georgia, serif; font-size:22px; letter-spacing:4px; color:#391212; font-weight:bold; text-transform:uppercase;">Reserve. Enjoy. Earn. Redeem.</p>
    <p style="margin:0 0 24px 0; font-size:14px; color:#5a4a42; line-height:1.6;">You'll earn points for this reservation — redeemable toward future perks.</p>
    <a href="${SITE}/?r=${encodeURIComponent(ref)}&a=view" target="_blank" style="font-size:12px; letter-spacing:3px; color:#391212; text-decoration:underline; text-transform:uppercase; font-weight:bold;">&#127873;&nbsp; Learn More</a>
  </td></tr>

  <tr><td style="background-color:#FAF4E8; padding:0 36px;"><div style="border-top:1.5px solid #391212; line-height:1px; font-size:1px;">&nbsp;</div></td></tr>

  <tr><td align="left" style="background-color:#FAF4E8; padding:32px 36px;">
    <p style="margin:0 0 14px 0; font-size:11px; letter-spacing:3px; color:#391212; text-transform:uppercase; font-weight:bold;">Important Things to Know</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr><td valign="top" width="18" style="font-size:13px; color:#391212; line-height:1.6;">•</td><td valign="top" style="font-size:13px; color:#5a4a42; line-height:1.6; padding-bottom:10px;">Dinery's cancellation policy requires cancellations at least 3 hours before your reservation time.</td></tr>
      <tr><td valign="top" width="18" style="font-size:13px; color:#391212; line-height:1.6;">•</td><td valign="top" style="font-size:13px; color:#5a4a42; line-height:1.6; padding-bottom:10px;">Our restaurants offer a 15-minute grace period. Running late? A quick call to the restaurant lets them hold your table.</td></tr>
      <tr><td valign="top" width="18" style="font-size:13px; color:#391212; line-height:1.6;">•</td><td valign="top" style="font-size:13px; color:#5a4a42; line-height:1.6;">We may contact you about this reservation, so please keep your email and phone number up to date.</td></tr>
    </table>
  </td></tr>

  <tr><td style="background-color:#FAF4E8; padding:0 36px;"><div style="border-top:1.5px solid #391212; line-height:1px; font-size:1px;">&nbsp;</div></td></tr>

  <tr><td align="left" style="background-color:#FAF4E8; padding:32px 36px;">
    <p style="margin:0 0 10px 0; font-size:11px; letter-spacing:3px; color:#391212; text-transform:uppercase; font-weight:bold;">Protect Your Data</p>
    <p style="margin:0; font-size:13px; color:#5a4a42; line-height:1.6;">Dinery will never contact you asking for your password, payment details, or other personal information. If you receive a message like this, please contact us immediately.</p>
  </td></tr>

  <tr><td align="center" style="background-color:#FAF4E8; padding:0 36px 40px 36px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1.5px solid #391212; border-radius:6px;"><tr>
      <td align="center" style="padding:24px 22px;">
        <p style="margin:0 0 6px 0; font-size:11px; letter-spacing:3px; color:#391212; text-transform:uppercase; font-weight:bold;">Need Help?</p>
        <p style="margin:0 0 4px 0; font-size:14px; color:#5a4a42; line-height:1.6;">Contact the restaurant directly at <a href="${telHref}" style="color:#391212; text-decoration:underline;">${phone}</a></p>
        <p style="margin:0; font-size:14px; color:#5a4a42; line-height:1.6;">Or reach Dinery support at <a href="mailto:info@dinery.am" style="color:#391212; text-decoration:underline;">info@dinery.am</a></p>
      </td>
    </tr></table>
  </td></tr>

  <tr><td style="background-color:#FDF8F0; padding:32px 36px;">
    <div style="border-top:1.5px solid #391212; line-height:1px; font-size:1px; margin-bottom:24px;">&nbsp;</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td align="left" valign="middle">
        <p style="margin:0 0 4px 0; font-size:11px; color:#8a7a6f; letter-spacing:1px;">© 2026 DINERY</p>
        <p style="margin:0; font-size:11px; color:#8a7a6f; letter-spacing:1px;">YEREVAN, ARMENIA</p>
      </td>
      <td align="right" valign="middle">
        <a href="https://instagram.com/dinery" target="_blank" style="font-size:11px; letter-spacing:2px; color:#391212; text-decoration:none; text-transform:uppercase; font-weight:bold;">Instagram</a>
        <span style="color:#8a7a6f;">&nbsp;·&nbsp;</span>
        <a href="https://facebook.com/dinery" target="_blank" style="font-size:11px; letter-spacing:2px; color:#391212; text-decoration:none; text-transform:uppercase; font-weight:bold;">Facebook</a>
        <span style="color:#8a7a6f;">&nbsp;·&nbsp;</span>
        <a href="https://tiktok.com/@dinery" target="_blank" style="font-size:11px; letter-spacing:2px; color:#391212; text-decoration:none; text-transform:uppercase; font-weight:bold;">TikTok</a>
      </td>
    </tr></table>
    <p style="margin:24px 0 0 0; font-size:10px; color:#a89a8e; letter-spacing:1px;">
      <a href="${SITE}" style="color:#a89a8e; text-decoration:underline;">Privacy Policy</a> &nbsp;|&nbsp;
      <a href="${SITE}" style="color:#a89a8e; text-decoration:underline;">Terms of Service</a>
    </p>
  </td></tr>

</table>
</center>
</body></html>`;
}

const buildConfirmationEmailHTML = (b, r, n) => buildReservationEmailHTML(b, r, n, 'confirmed');
const buildModifiedEmailHTML     = (b, r, n) => buildReservationEmailHTML(b, r, n, 'modified');

async function sendConfirmationEmail(booking, toEmail) {
  const to = (toEmail || state.user?.email || '').trim();
  if (!to) return;
  const restaurant = RESTAURANTS.find(r => r.name === booking.restaurant);
  const html       = buildConfirmationEmailHTML(booking, restaurant, booking.name || state.user?.name);
  await sendEmail({
    to,
    subject: `Your Dinery reservation at ${booking.restaurant} is confirmed — ${booking.ref}`,
    html,
  });
}

async function sendModifiedEmail(booking, toEmail) {
  const to = (toEmail || state.user?.email || '').trim();
  if (!to) return;
  const restaurant = RESTAURANTS.find(r => r.name === booking.restaurant);
  const html       = buildModifiedEmailHTML(booking, restaurant, booking.name || state.user?.name);
  await sendEmail({
    to,
    subject: `Your Dinery reservation at ${booking.restaurant} has been updated — ${booking.ref}`,
    html,
  });
}

// ── Welcome email (sent after account creation) ───────────────────────────────
function buildWelcomeEmailHTML(name, email) {
  const SITE = 'https://dinery.am';
  const who  = name || 'there';
  const feature = (icon, title, desc) => `
  <tr><td style="background-color:#FFFFFF; padding:28px 36px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td width="60" valign="top">
        <div style="width:48px; height:48px; border:2px solid #391212; border-radius:50%; text-align:center; line-height:46px; font-size:22px;">${icon}</div>
      </td>
      <td valign="top" style="padding-left:12px;">
        <p style="margin:0 0 4px 0; font-size:15px; color:#391212; font-weight:bold;">${title}</p>
        <p style="margin:0; font-size:13px; color:#8a7a6f; line-height:1.6;">${desc}</p>
      </td>
    </tr></table>
  </td></tr>`;
  const divider = `<tr><td style="background-color:#FFFFFF; padding:0 36px;"><div style="border-top:1.5px solid #391212; line-height:1px; font-size:1px;">&nbsp;</div></td></tr>`;

  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to Dinery</title></head>
<body style="margin:0; padding:0; background-color:#FAF4E8; font-family:Georgia, 'Times New Roman', serif;">
<div style="display:none; font-size:1px; color:#FAF4E8; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
Welcome to Dinery, ${who} — here's everything you need to start booking great tables.</div>
<center style="width:100%; background-color:#FAF4E8;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px; margin:0 auto;" align="center">

  <tr><td style="background-color:#391212; padding:28px 36px 18px 36px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td align="left"><span style="font-family:Georgia, serif; font-size:22px; letter-spacing:2px; color:#FAF4E8; font-weight:bold;">DINERY</span></td>
      <td align="right"><span style="font-family:Georgia, serif; font-size:11px; letter-spacing:3px; color:#FAF4E8; text-transform:uppercase;">Yerevan</span></td>
    </tr></table>
  </td></tr>
  <tr><td style="background-color:#391212; padding:0 36px 24px 36px;"><div style="border-top:1.5px solid #FAF4E8; line-height:1px; font-size:1px;">&nbsp;</div></td></tr>

  <tr><td style="background-color:#FDF8F0; padding:40px 36px;">
    <p style="margin:0 0 14px 0; font-family:Georgia, serif; font-size:12px; letter-spacing:3px; color:#391212; text-transform:uppercase; font-weight:bold;">Welcome</p>
    <h1 style="margin:0 0 16px 0; font-family:Georgia, serif; font-size:38px; line-height:1.25; color:#391212; font-weight:bold;">Your table<br>is set.</h1>
    <p style="margin:0; font-size:15px; line-height:1.7; color:#5a4a42;">The Dinery team thanks you for joining our family, ${who}. Here's everything you need to start discovering and booking great tables.</p>
  </td></tr>

  <tr><td style="background-color:#FFFFFF; padding:40px 36px 10px 36px;">
    <p style="margin:0 0 16px 0; font-size:11px; letter-spacing:3px; color:#391212; text-transform:uppercase; font-weight:bold;">Account Details</p>
    <p style="margin:0 0 12px 0; font-size:14px; color:#391212;"><strong>Name</strong><br><span style="color:#5a4a42;">${name || '—'}</span></p>
    <p style="margin:0; font-size:14px; color:#391212;"><strong>Email</strong><br><span style="color:#5a4a42;">${email || '—'}</span></p>
  </td></tr>

  <tr><td style="background-color:#FFFFFF; padding:30px 36px 6px 36px;">
    <p style="margin:0 0 4px 0; font-family:Georgia, serif; font-size:11px; letter-spacing:3px; color:#391212; text-transform:uppercase; font-weight:bold;">What's Next</p>
    <h2 style="margin:0; font-family:Georgia, serif; font-size:24px; color:#391212; font-weight:bold;">Now that you're in</h2>
  </td></tr>
  ${feature('&#128197;', 'Book and modify your reservations', 'Easily reserve a table or update your plans anytime.')}
  ${divider}
  ${feature('&#10084;', 'Keep a list of your favourite restaurants', 'Save the spots you love and find them fast.')}
  ${divider}
  ${feature('&#128269;', 'Get the best restaurant recommendations', 'Discover new places tailored to your taste.')}
  ${divider}
  ${feature('&#127942;', 'Earn points toward rewards', 'Every booking brings you closer to perks that make dining easier.')}

  <tr><td style="background-color:#FAF4E8; padding:40px 36px 0 36px;">
    <a href="${SITE}" target="_blank" style="display:block; background-color:#391212; color:#FAF4E8; font-family:Georgia, serif; font-size:14px; letter-spacing:2px; font-weight:bold; text-decoration:none; padding:18px 0; border-radius:3px; text-align:center; text-transform:uppercase;"><span style="font-size:15px; vertical-align:middle;">&#127869;</span>&nbsp; Start Exploring Restaurants</a>
  </td></tr>

  <tr><td align="center" style="background-color:#FAF4E8; padding:40px 36px;">
    <p style="margin:0 0 16px 0; font-family:Georgia, serif; font-size:22px; letter-spacing:4px; color:#391212; font-weight:bold; text-transform:uppercase;">Reserve. Enjoy. Earn. Redeem.</p>
    <p style="margin:0 0 20px 0; font-size:14px; color:#5a4a42; line-height:1.6;">"Good food, good friends, good times — that's the Dinery way."</p>
    <a href="${SITE}" target="_blank" style="font-size:12px; letter-spacing:3px; color:#391212; text-decoration:underline; text-transform:uppercase; font-weight:bold;">&#127873;&nbsp; Learn More</a>
  </td></tr>

  <tr><td style="background-color:#FAF4E8; padding:0 36px;"><div style="border-top:1.5px solid #391212; line-height:1px; font-size:1px;">&nbsp;</div></td></tr>

  <tr><td align="center" style="background-color:#FAF4E8; padding:32px 36px;">
    <p style="margin:0 0 6px 0; font-size:11px; letter-spacing:3px; color:#391212; text-transform:uppercase; font-weight:bold;">Need Help?</p>
    <p style="margin:0; font-size:14px; color:#5a4a42; line-height:1.6;">Our team is here for you — reach us at <a href="mailto:info@dinery.am" style="color:#391212; text-decoration:underline;">info@dinery.am</a></p>
  </td></tr>

  <tr><td style="background-color:#FDF8F0; padding:32px 36px;">
    <div style="border-top:1.5px solid #391212; line-height:1px; font-size:1px; margin-bottom:24px;">&nbsp;</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td align="left" valign="middle">
        <p style="margin:0 0 4px 0; font-size:11px; color:#8a7a6f; letter-spacing:1px;">© 2026 DINERY</p>
        <p style="margin:0; font-size:11px; color:#8a7a6f; letter-spacing:1px;">YEREVAN, ARMENIA</p>
      </td>
      <td align="right" valign="middle">
        <a href="https://instagram.com/dinery" target="_blank" style="font-size:11px; letter-spacing:2px; color:#391212; text-decoration:none; text-transform:uppercase; font-weight:bold;">Instagram</a>
        <span style="color:#8a7a6f;">&nbsp;·&nbsp;</span>
        <a href="https://facebook.com/dinery" target="_blank" style="font-size:11px; letter-spacing:2px; color:#391212; text-decoration:none; text-transform:uppercase; font-weight:bold;">Facebook</a>
        <span style="color:#8a7a6f;">&nbsp;·&nbsp;</span>
        <a href="https://tiktok.com/@dinery" target="_blank" style="font-size:11px; letter-spacing:2px; color:#391212; text-decoration:none; text-transform:uppercase; font-weight:bold;">TikTok</a>
      </td>
    </tr></table>
    <p style="margin:24px 0 0 0; font-size:10px; color:#a89a8e; letter-spacing:1px;">
      <a href="${SITE}" style="color:#a89a8e; text-decoration:underline;">Privacy Policy</a> &nbsp;|&nbsp;
      <a href="${SITE}" style="color:#a89a8e; text-decoration:underline;">Terms of Service</a>
    </p>
  </td></tr>

</table>
</center>
</body></html>`;
}

async function sendWelcomeEmail(name, email) {
  const to = (email || '').trim();
  if (!to) return;
  await sendEmail({
    to,
    subject: 'Welcome to Dinery 🍽️',
    html: buildWelcomeEmailHTML(name, to),
  });
}

// ── Review request email (sent ~1h after check-in) ────────────────────────────
function buildReviewEmailHTML(booking, restaurant, userName) {
  const restName = booking.restaurant || 'your restaurant';
  const date     = booking.date        || '—';
  const time     = booking.time        || '—';
  const guests   = booking.guests      || '—';
  const ref      = booking.ref         || '—';
  const name     = userName            || 'Guest';
  const imgUrl   = booking.img || restaurant?.img || '';
  const SITE     = 'https://dinery.am';
  // Until a dedicated review page exists, the stars open the reservation in-app.
  const reviewUrl = (rating) => `${SITE}/?r=${encodeURIComponent(ref)}&a=review${rating ? `&rating=${rating}` : ''}`;
  const star = (rating) => `<a href="${reviewUrl(rating)}" target="_blank" style="text-decoration:none; color:#C9A24B; font-size:34px; padding:0 3px;">&#9733;</a>`;

  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>How was your visit? — Dinery</title></head>
<body style="margin:0; padding:0; background-color:#FAF4E8; font-family:Georgia, 'Times New Roman', serif;">
<div style="display:none; font-size:1px; color:#FAF4E8; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
How was your evening at ${restName}? Leave a review and earn bonus points.</div>
<center style="width:100%; background-color:#FAF4E8;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px; margin:0 auto;" align="center">

  <tr><td style="background-color:#391212; padding:28px 36px 18px 36px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td align="left"><span style="font-family:Georgia, serif; font-size:22px; letter-spacing:2px; color:#FAF4E8; font-weight:bold;">DINERY</span></td>
      <td align="right"><span style="font-family:Georgia, serif; font-size:11px; letter-spacing:3px; color:#FAF4E8; text-transform:uppercase;">Yerevan</span></td>
    </tr></table>
  </td></tr>
  <tr><td style="background-color:#391212; padding:0 36px 24px 36px;"><div style="border-top:1.5px solid #FAF4E8; line-height:1px; font-size:1px;">&nbsp;</div></td></tr>

  <tr><td align="center" style="background-color:#FDF8F0; padding:40px 36px;">
    <h1 style="margin:0 0 16px 0; font-family:Georgia, serif; font-size:34px; line-height:1.25; color:#391212; font-weight:bold; text-transform:uppercase; letter-spacing:1px;">Tell us about your visit</h1>
    <p style="margin:0; font-size:15px; line-height:1.7; color:#5a4a42;">You dined at ${restName} on ${date}. We'd love to hear how it went, ${name}.</p>
  </td></tr>

  ${imgUrl ? `<tr><td style="background:#fff;padding:0;line-height:0;"><img src="${imgUrl}" width="600" alt="${restName}" style="width:100%;max-width:600px;height:220px;object-fit:cover;display:block;"></td></tr>` : ''}

  <tr><td align="center" style="background-color:#FFFFFF; padding:32px 36px 8px 36px;">
    <p style="margin:0; font-size:14px; color:#391212;"><strong>${restName}</strong></p>
    <p style="margin:4px 0 0 0; font-size:13px; color:#8a7a6f;">${date} at ${time} — ${guests} guest${guests === 1 ? '' : 's'}</p>
  </td></tr>

  <tr><td align="center" style="background-color:#FFFFFF; padding:24px 36px 40px 36px;">
    <p style="margin:0 0 14px 0; font-size:11px; letter-spacing:3px; color:#391212; text-transform:uppercase; font-weight:bold;">How would you rate it?</p>
    <p style="margin:0 0 26px 0;">${star(1)}${star(2)}${star(3)}${star(4)}${star(5)}</p>
    <a href="${reviewUrl()}" target="_blank" style="display:block; background-color:#391212; color:#FAF4E8; font-family:Georgia, serif; font-size:14px; letter-spacing:2px; font-weight:bold; text-decoration:none; padding:18px 0; border-radius:3px; text-align:center; text-transform:uppercase;"><span style="font-size:15px; vertical-align:middle;">&#9733;</span>&nbsp; Leave a Review</a>
  </td></tr>

  <tr><td align="center" style="background-color:#FAF4E8; padding:40px 36px;">
    <p style="margin:0 0 16px 0; font-family:Georgia, serif; font-size:22px; letter-spacing:4px; color:#391212; font-weight:bold; text-transform:uppercase;">Reserve. Enjoy. Earn. Redeem.</p>
    <p style="margin:0 0 24px 0; font-size:14px; color:#5a4a42; line-height:1.6;">Leave a review and earn bonus points — redeemable toward future perks.</p>
    <a href="${SITE}" target="_blank" style="font-size:12px; letter-spacing:3px; color:#391212; text-decoration:underline; text-transform:uppercase; font-weight:bold;">&#127873;&nbsp; Learn More</a>
  </td></tr>

  <tr><td style="background-color:#FAF4E8; padding:0 36px;"><div style="border-top:1.5px solid #391212; line-height:1px; font-size:1px;">&nbsp;</div></td></tr>

  <tr><td align="center" style="background-color:#FAF4E8; padding:32px 36px;">
    <p style="margin:0 0 6px 0; font-size:11px; letter-spacing:3px; color:#391212; text-transform:uppercase; font-weight:bold;">Need Help?</p>
    <p style="margin:0; font-size:14px; color:#5a4a42; line-height:1.6;">Call us at <a href="tel:+37494115955" style="color:#391212; text-decoration:underline;">+374 94 115955</a> or email <a href="mailto:info@dinery.am" style="color:#391212; text-decoration:underline;">info@dinery.am</a></p>
  </td></tr>

  <tr><td style="background-color:#FDF8F0; padding:32px 36px;">
    <div style="border-top:1.5px solid #391212; line-height:1px; font-size:1px; margin-bottom:24px;">&nbsp;</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td align="left" valign="middle">
        <p style="margin:0 0 4px 0; font-size:11px; color:#8a7a6f; letter-spacing:1px;">© 2026 DINERY</p>
        <p style="margin:0; font-size:11px; color:#8a7a6f; letter-spacing:1px;">YEREVAN, ARMENIA</p>
      </td>
      <td align="right" valign="middle">
        <a href="https://instagram.com/dinery" target="_blank" style="font-size:11px; letter-spacing:2px; color:#391212; text-decoration:none; text-transform:uppercase; font-weight:bold;">Instagram</a>
        <span style="color:#8a7a6f;">&nbsp;·&nbsp;</span>
        <a href="https://facebook.com/dinery" target="_blank" style="font-size:11px; letter-spacing:2px; color:#391212; text-decoration:none; text-transform:uppercase; font-weight:bold;">Facebook</a>
        <span style="color:#8a7a6f;">&nbsp;·&nbsp;</span>
        <a href="https://tiktok.com/@dinery" target="_blank" style="font-size:11px; letter-spacing:2px; color:#391212; text-decoration:none; text-transform:uppercase; font-weight:bold;">TikTok</a>
      </td>
    </tr></table>
    <p style="margin:24px 0 0 0; font-size:10px; color:#a89a8e; letter-spacing:1px;">
      <a href="${SITE}" style="color:#a89a8e; text-decoration:underline;">Privacy Policy</a> &nbsp;|&nbsp;
      <a href="${SITE}" style="color:#a89a8e; text-decoration:underline;">Terms of Service</a>
    </p>
  </td></tr>

</table>
</center>
</body></html>`;
}

async function sendReviewRequestEmail(booking, toEmail) {
  const to = (toEmail || state.user?.email || '').trim();
  if (!to) return;
  const restaurant = RESTAURANTS.find(r => r.name === booking.restaurant);
  const html       = buildReviewEmailHTML(booking, restaurant, booking.name || state.user?.name);
  await sendEmail({
    to,
    subject: `How was your visit to ${booking.restaurant}? ⭐`,
    html,
  });
}
