/** Same-origin tabs only; complements Web Push (OS notifications). */
export const SITE_BROADCAST_CHANNEL = "jbcmhs-site-v1";

let siteTabId: string | null = null;

/** Stable id for this browsing context so the publisher tab can skip echo toasts. */
export function getSiteTabId(): string {
  if (typeof window === "undefined") return "";
  if (!siteTabId) {
    siteTabId = crypto.randomUUID();
  }
  return siteTabId;
}

export type SiteBroadcastMessage =
  | { type: "new_announcement"; title: string; sourceTabId: string }
  | { type: "new_event"; title: string; sourceTabId: string };

export type SiteBroadcastPayload = Omit<SiteBroadcastMessage, "sourceTabId">;

export function postSiteBroadcast(message: SiteBroadcastPayload): void {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return;
  }
  const full: SiteBroadcastMessage = {
    ...message,
    sourceTabId: getSiteTabId(),
  };
  try {
    const ch = new BroadcastChannel(SITE_BROADCAST_CHANNEL);
    ch.postMessage(full);
    ch.close();
  } catch {
    /* ignore */
  }
}
