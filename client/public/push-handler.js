/* global self, clients */

self.addEventListener("push", function (event) {
  let data = { title: "JBCMHS", body: "", url: "/" };
  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (_) {
    data.body = event.data ? event.data.text() : "";
  }

  const options = {
    body: data.body || "",
    icon: "/jbcmhs_logo.png",
    badge: "/jbcmhs_logo.png",
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(data.title || "JBCMHS", options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const raw = (event.notification.data && event.notification.data.url) || "/";
  const targetUrl =
    typeof raw === "string" && raw.startsWith("http")
      ? raw
      : self.location.origin + (raw.startsWith("/") ? raw : "/" + raw);

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow ? clients.openWindow(targetUrl) : undefined;
    }),
  );
});
