/* global self, clients */

const SW_ORIGIN = self.location.origin;

function resolveTargetUrl(raw) {
  if (typeof raw !== "string" || !raw) return SW_ORIGIN + "/";
  return raw.startsWith("http") ? raw : SW_ORIGIN + (raw.startsWith("/") ? raw : "/" + raw);
}

/** iOS PWAs and some Android shells resolve notification assets more reliably with absolute URLs. */
function notificationAssets() {
  return {
    icon: SW_ORIGIN + "/jbcmhs_logo.png",
    badge: SW_ORIGIN + "/jbcmhs_logo.png",
  };
}

function normalizeForCompare(url) {
  try {
    const u = new URL(url);
    let p = u.pathname;
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    return u.origin + p + u.search;
  } catch (_) {
    return url;
  }
}

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

  const assets = notificationAssets();
  const options = {
    body: data.body || "",
    icon: assets.icon,
    badge: assets.badge,
    data: { url: data.url || "/" },
    tag: "jbcmhs-push",
    renotify: true,
    /** Android shows a heads-up cue; ignored on iOS. */
    vibrate: [180, 80, 180],
  };

  event.waitUntil(self.registration.showNotification(data.title || "JBCMHS", options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const raw = (event.notification.data && event.notification.data.url) || "/";
  const targetUrl = resolveTargetUrl(raw);
  const targetNorm = normalizeForCompare(targetUrl);

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (normalizeForCompare(client.url) === targetNorm && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow ? clients.openWindow(targetUrl) : undefined;
    }),
  );
});
