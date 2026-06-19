// ─────────────────────────────────────────────────────────────────────────────
//  Dinery — Web Push (client side)
//
//  Registers the service worker, asks permission, subscribes to push, and stores
//  the subscription on the signed-in user's Firestore doc (pushSubscriptions[]).
//  The Cron Worker reads those subscriptions to send reminder notifications.
//  Loaded before app.js; references app.js globals (state, db, showToast) only
//  at call time.
// ─────────────────────────────────────────────────────────────────────────────

const VAPID_PUBLIC_KEY = 'BGYMCtEPhecGyMgpkkFF5SYmrcDAx3UbcFvGYiiZI_E5D_f1UCteLLWAECFPYwlC4CSUjyRNNtiWKsP1FkKm5pc';

function urlBase64ToUint8Array(b64) {
  const padding = '='.repeat((4 - (b64.length % 4)) % 4);
  const base64  = (b64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = atob(base64);
  const out     = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function enablePushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    showToast("This browser doesn't support notifications.");
    return false;
  }
  if (!state.user?.uid) {
    showToast('Please sign in to enable notifications.');
    goScreen('signin');
    return false;
  }
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      showToast(perm === 'denied'
        ? 'Notifications are blocked — enable them in your browser settings.'
        : 'Notifications were not enabled.');
      return false;
    }
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }
    await savePushSubscription(sub);
    showToast('Notifications enabled ✓');
    return true;
  } catch (e) {
    console.error('Push enable failed:', e);
    showToast('Could not enable notifications.');
    return false;
  }
}

// Merge this subscription into the user's doc (de-duped by endpoint).
async function savePushSubscription(sub) {
  if (!state.user?.uid) return;
  const json = sub.toJSON();   // { endpoint, keys: { p256dh, auth } }
  try {
    const doc  = await db.collection('users').doc(state.user.uid).get();
    const data = doc.exists ? doc.data() : {};
    const subs = Array.isArray(data.pushSubscriptions) ? data.pushSubscriptions : [];
    if (!subs.some(s => s.endpoint === json.endpoint)) {
      subs.push({ endpoint: json.endpoint, keys: json.keys, addedAt: Date.now() });
      await db.collection('users').doc(state.user.uid).set({ pushSubscriptions: subs }, { merge: true });
    }
  } catch (e) {
    console.error('Save push subscription failed:', e);
  }
}

window.enablePushNotifications = enablePushNotifications;
