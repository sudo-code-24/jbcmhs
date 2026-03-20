"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEFAULT_SCHOOL_INFO } from "@/config/schoolInfo";


const navItems = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/announcements", label: "Bulletin Board", icon: "bell" },
  { href: "/calendar", label: "Calendar", icon: "calendar" },
  { href: "/faculty-board", label: "Faculty Board", icon: "users" },
  { href: "/admin", label: "Admin", icon: "bookmark" },
] as const;

export default function Header() {
  const pathname = usePathname();
  const renderIcon = (icon: (typeof navItems)[number]["icon"]) => {
    if (icon === "home") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1v-10.5Z" />
        </svg>
      );
    }
    if (icon === "calendar") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 2v3M17 2v3M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
        </svg>
      );
    }
    if (icon === "bookmark") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
        </svg>
      );
    }
    if (icon === "users") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 22a2.5 2.5 0 0 0 2.5-2.5v-6a2.5 2.5 0 1 0-5 0v6A2.5 2.5 0 0 0 12 22Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 1 0-12 0v5l-2 3h16l-2-3V8Z" />
      </svg>
    );
  };

  return (
    <>
      <section className="sticky top-0 z-[70] border-b bg-background/95 backdrop-blur">
        <div className="container-wide flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <img
                src="/jbcmhs_logo.png"
                alt="School Logo"
                className="h-8 w-8 rounded-full object-contain"
                style={{ display: "block" }}
              />
            </Link>
            <div>
              <p className="text-base font-bold leading-none text-primary">{DEFAULT_SCHOOL_INFO.name}</p>
              <p className="text-xs text-muted-foreground">{DEFAULT_SCHOOL_INFO.tagline}</p>
            </div>
          </div>

          <div className="relative z-[70] flex items-center gap-2 pointer-events-auto">
            <ThemeToggle />
            <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
              {navItems.map(({ href, label }) => {
                const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      buttonVariants({ variant: isActive ? "default" : "ghost", size: "sm" }),
                      "h-9"
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
              {/* <Button className="rounded-full">Contact</Button> */}
            </nav>
          </div>
        </div>
      </section>

      <nav className="fixed inset-x-0 bottom-3 z-50 px-3 md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 rounded-2xl border bg-background/95 p-1.5 shadow-lg backdrop-blur">
          {navItems.map(({ href, label, icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center rounded-xl px-1 py-1.5 text-[11px] transition ${isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
              >
                <span
                  className={`mb-1.5 flex h-8 w-8 items-center justify-center rounded-full transition ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    }`}
                >
                  {renderIcon(icon)}
                </span>
                <span className={isActive ? "font-semibold text-foreground" : "font-medium"}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
