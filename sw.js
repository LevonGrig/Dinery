// Dinery service worker — receives Web Push messages and shows notifications.
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (e) { data = { title: 'Dinery', body: event.data ? event.data.text() : '' }; }

  const title = data.title || 'Dinery';
  const options = {
    body:  data.body  || '',
    icon:  data.icon  || '/favicon.svg',
    badge: '/favicon.svg',
    tag:   data.tag   || undefined,
    data:  { url: data.url || 'https://dinery.am' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || 'https://dinery.am';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if ('focus' in w) { try { w.navigate(url); } catch (e) {} return w.focus(); }
      }
      return clients.openWindow(url);
    })
  );
});
