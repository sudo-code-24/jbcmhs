"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeaderAuthSection } from "@/components/HeaderAuthSection";
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
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 shrink-0"
          aria-hidden
        >
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
        <div className="container-wide flex flex-wrap items-center gap-x-4 gap-y-3 py-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link href="/" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
              <img
                src="/jbcmhs_logo.png"
                alt="School Logo"
                className="h-8 w-8 rounded-full object-contain"
                style={{ display: "block" }}
              />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-base font-bold leading-none text-primary">{DEFAULT_SCHOOL_INFO.name}</p>
              <p className="truncate text-xs text-muted-foreground">{DEFAULT_SCHOOL_INFO.tagline}</p>
            </div>
          </div>

          <div className="relative z-[70] ml-auto flex flex-shrink-0 flex-wrap items-center justify-end gap-2 pointer-events-auto sm:gap-3">
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
            <HeaderAuthSection />
          </div>
        </div>
      </section>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
        aria-label="Primary"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 items-stretch gap-0 rounded-2xl border bg-background/95 p-1.5 shadow-lg backdrop-blur">
          {navItems.map((item) => {
            const { href, label, icon } = item;
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                aria-label={label}
                title={label}
                className={cn(
                  "flex min-h-[4.25rem] min-w-0 flex-col items-center justify-start gap-1 rounded-xl px-0.5 pb-1.5 pt-1.5 text-[10px] transition",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
                  )}
                >
                  {renderIcon(icon)}
                </span>
                <span
                  className={cn(
                    "flex min-h-[2rem] w-full max-w-[4.75rem] flex-col items-center justify-center text-balance text-center text-[10px] leading-tight",
                    isActive ? "font-semibold text-foreground" : "font-medium",
                  )}
                >
                  <span className="line-clamp-2 w-full px-0.5">{label}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
