function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const PUSH_OPT_IN_STORAGE_KEY = "jbcmhs-push-opt-in";

const SW_READY_WAIT_MS = 5000;

function isIOSOrIPadOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/i.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /\bAndroid\b/i.test(navigator.userAgent || "");
}

/** iOS only exposes Web Push for installed (standalone / home-screen) web apps (Safari 16.4+). */
function isInstalledWebApp(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  if (!window.isSecureContext) return false;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  /** iOS / iPadOS Safari only enables Web Push from the home-screen app; Android Chrome allows it in-tab or installed. */
  if (isIOSOrIPadOS() && !isInstalledWebApp()) return false;
  return true;
}

/**
 * Workbox registers the service worker asynchronously; right after load,
 * getRegistration() is often still null. Prefer an existing registration, then
 * wait briefly for `ready` so push state matches after refresh.
 */
async function getServiceWorkerRegistrationForPush(): Promise<ServiceWorkerRegistration | null> {
  const first = await navigator.serviceWorker.getRegistration();
  if (first) return first;
  try {
    const raced = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), SW_READY_WAIT_MS)),
    ]);
    return raced ?? null;
  } catch {
    return null;
  }
}

async function getActiveServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing?.active) return existing;
  return navigator.serviceWorker.ready;
}

async function getVapidPublicKey(): Promise<string> {
  const fromBuild = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  if (fromBuild) return fromBuild;
  const keyRes = await fetch("/api/push/vapid-public-key");
  if (!keyRes.ok) {
    const err = (await keyRes.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error || "Could not load push configuration.");
  }
  const { publicKey } = (await keyRes.json()) as { publicKey: string };
  if (!publicKey?.trim()) {
    throw new Error("Could not load push configuration.");
  }
  return publicKey.trim();
}

export async function subscribeToPushNotifications(): Promise<void> {
  if (!isPushSupported()) {
    throw new Error(
      isIOSOrIPadOS()
        ? "Add this site to your Home Screen, open the app from the icon, then enable alerts."
        : isAndroid()
          ? "Use Chrome or Samsung Internet over HTTPS, or update your browser."
          : "Notifications are not supported in this browser.",
    );
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(
      isAndroid()
        ? "Turn on notifications for this site: tap the lock or ⊕ icon in the address bar → Permissions → Notifications, or use Chrome Settings → Site settings → Notifications."
        : "Notification permission was denied.",
    );
  }
  const reg = await getActiveServiceWorkerRegistration();
  const publicKey = await getVapidPublicKey();
  const existing = await reg.pushManager.getSubscription();
  const subscription =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    }));
  const subRes = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  });
  if (!subRes.ok) {
    const err = (await subRes.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error || "Could not save subscription.");
  }

  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(PUSH_OPT_IN_STORAGE_KEY, "1");
    }
  } catch {
    /* private mode */
  }
}

export async function getHasPushSubscription(): Promise<boolean> {
  if (!isPushSupported()) return false;
  const reg = await getServiceWorkerRegistrationForPush();
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  return Boolean(sub);
}

/**
 * Returns whether the user should be treated as subscribed. Optionally re-runs
 * subscribe (after a successful opt-in) when the browser has no PushSubscription
 * yet but permission is still granted — common right after refresh while the SW
 * settles, or if the server lost in-memory subs and needs the endpoint again.
 */
export async function resolvePushSubscribedState(options: {
  attemptRestore?: boolean;
} = {}): Promise<boolean> {
  const { attemptRestore = false } = options;

  if (!isPushSupported()) return false;

  if (typeof localStorage !== "undefined" && Notification.permission !== "granted") {
    try {
      localStorage.removeItem(PUSH_OPT_IN_STORAGE_KEY);
    } catch {
      /* */
    }
  }

  if (await getHasPushSubscription()) return true;

  if (!attemptRestore) return false;
  if (typeof localStorage === "undefined") return false;
  if (localStorage.getItem(PUSH_OPT_IN_STORAGE_KEY) !== "1") return false;
  if (Notification.permission !== "granted") return false;

  try {
    await subscribeToPushNotifications();
    return true;
  } catch {
    return false;
  }
}
