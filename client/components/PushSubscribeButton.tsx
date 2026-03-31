"use client";

import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  isPushSupported,
  resolvePushSubscribedState,
  subscribeToPushNotifications,
} from "@/lib/pushNotifications";
import { toast } from "@/hooks/use-toast";

export function PushSubscribeButton() {
  const [ready, setReady] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const restoreOnceRef = useRef(false);

  useEffect(() => {
    if (!isPushSupported()) return;
    let cancelled = false;
    const refresh = () => {
      const allowRestore = !restoreOnceRef.current;
      if (allowRestore) restoreOnceRef.current = true;

      resolvePushSubscribedState({ attemptRestore: allowRestore })
        .then((v) => {
          if (!cancelled) {
            setSubscribed(v);
            setReady(true);
          }
        })
        .catch(() => {
          if (!cancelled) setReady(true);
        });
    };
    refresh();
    navigator.serviceWorker.addEventListener("controllerchange", refresh);
    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener("controllerchange", refresh);
    };
  }, []);

  if (!isPushSupported()) {
    return null;
  }

  const onClick = async () => {
    setBusy(true);
    try {
      await subscribeToPushNotifications();
      setSubscribed(true);
      toast({
        title: "Alerts enabled",
        description:
          "You will get notified about new announcements and calendar events.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not enable alerts",
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setBusy(false);
    }
  };

  if (!ready || subscribed) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-9 gap-1.5"
      disabled={busy}
      onClick={onClick}
      title="Enable notifications for new announcements and events"
    >
      <Bell className="h-4 w-4" aria-hidden />
    </Button>
  );
}
