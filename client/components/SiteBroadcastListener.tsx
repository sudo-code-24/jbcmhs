"use client";

import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import {
  getSiteTabId,
  SITE_BROADCAST_CHANNEL,
  type SiteBroadcastMessage,
} from "@/lib/siteBroadcast";

function isSiteBroadcastMessage(data: unknown): data is SiteBroadcastMessage {
  if (!data || typeof data !== "object" || !("type" in data)) return false;
  const t = (data as { type: string }).type;
  if (t !== "new_announcement" && t !== "new_event") return false;
  const o = data as { title?: unknown; sourceTabId?: unknown };
  return typeof o.title === "string" && typeof o.sourceTabId === "string";
}

/** Shows in-app toasts in every open tab when another tab publishes school updates. */
export function SiteBroadcastListener() {
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(SITE_BROADCAST_CHANNEL);

    const onMessage = (event: MessageEvent<unknown>) => {
      const data = event.data;
      if (!isSiteBroadcastMessage(data)) return;
      if (data.sourceTabId === getSiteTabId()) return;
      if (data.type === "new_announcement") {
        toast({
          title: "New announcement",
          description: data.title,
        });
      } else if (data.type === "new_event") {
        toast({
          title: "New calendar event",
          description: data.title,
        });
      }
    };

    channel.addEventListener("message", onMessage);
    return () => {
      channel.removeEventListener("message", onMessage);
      channel.close();
    };
  }, []);

  return null;
}
