"use client";

import { useEffect, useState } from "react";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MePayload = {
  role?: string;
  username?: string;
  user?: { username?: string };
};

function submitLogoutForm() {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/api/auth/logout";
  document.body.appendChild(form);
  form.submit();
}

export function HeaderAuthSection() {
  const [me, setMe] = useState<MePayload | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = (await res.json().catch(() => null)) as
          | MePayload
          | { error?: string }
          | null;
        if (
          !cancelled &&
          res.ok &&
          data &&
          typeof data === "object" &&
          !("error" in data && (data as { error?: string }).error)
        ) {
          setMe(data as MePayload);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready || !me) {
    return null;
  }

  const username = me.username?.trim() || me.user?.username?.trim() || "User";
  const role = me.role?.trim() || "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/80 text-foreground outline-none ring-offset-background transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-white/15 dark:bg-slate-800/80 dark:hover:bg-slate-800"
          aria-label="Open account menu"
        >
          <User className="h-[1.15rem] w-[1.15rem]" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 z-[100]" sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">
              {username}
            </p>
            {role ? (
              <p className="text-xs font-normal capitalize leading-snug text-muted-foreground">
                {role}
              </p>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
          onSelect={(e) => {
            e.preventDefault();
            submitLogoutForm();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
