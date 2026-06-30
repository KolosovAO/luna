const DEFAULT_NOTIFICATION = {
  title: "Сегодня молодой серп",
  body: "Вечером можно поймать тонкий месяц.",
  url: "./"
};

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : DEFAULT_NOTIFICATION;
  const title = data.title || DEFAULT_NOTIFICATION.title;
  const body = data.body || DEFAULT_NOTIFICATION.body;
  const url = data.url || DEFAULT_NOTIFICATION.url;

  event.waitUntil(
    self.registration.showNotification(title, {
      badge: "icon-192.png",
      body,
      data: { url },
      icon: "icon-192.png",
      tag: "luna-young-crescent"
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  const targetUrl = new URL(event.notification.data?.url || "./", self.location.href).href;
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true, type: "window" }).then((clients) => {
      const existingClient = clients.find((client) => client.url === targetUrl);

      if (existingClient) {
        return existingClient.focus();
      }

      return self.clients.openWindow(targetUrl);
    })
  );
});
