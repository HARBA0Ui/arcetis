"use client";

import { CircleDollarSign, Home, Menu, PartyPopper } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArcetisLogo } from "@/components/common/arcetis-logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { CurrencyToggle } from "@/components/common/currency-toggle";
import { GuestOrdersDrawer } from "@/components/orders/guest-orders-drawer";
import { RouteLoading } from "@/components/layout/route-loading";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: CircleDollarSign },
  { href: "/giveaways", label: "Giveaways", icon: PartyPopper }
];

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ProtectedShellLoading({ message }: { message: string }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen overflow-x-hidden pb-12">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-50 rounded-[1.75rem] border border-border/70 bg-background/78 px-3 py-3 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.65)] backdrop-blur sm:rounded-[2rem] sm:px-4 sm:py-4 xl:px-6">
          <div className="flex items-center justify-between gap-3 sm:hidden">
            <Link href="/" className="shrink-0">
              <ArcetisLogo className="h-12.5" />
            </Link>

            <div className="flex items-center gap-2">
              <CurrencyToggle iconOnly className="h-10 w-10 rounded-2xl border-border/70 bg-background/70" />
              <ThemeToggle iconOnly className="h-10 w-10 rounded-2xl border-border/70 bg-background/70" />
              <GuestOrdersDrawer />
              <Skeleton className="h-10 w-10 rounded-2xl border border-border/70 bg-background/70" />
              <button
                type="button"
                aria-label="Open navigation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background/70 text-foreground transition-colors hover:bg-card/80"
              >
                <Menu className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          <div className="hidden sm:flex sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <Link href="/" className="shrink-0">
              <ArcetisLogo className="h-15 md:h-20" />
            </Link>

            <nav className="-mx-1 flex flex-1 items-center gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActiveRoute(pathname, item.href) ? "page" : undefined}
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-sm font-medium transition-all",
                    isActiveRoute(pathname, item.href)
                      ? "border-border/70 bg-card/85 text-foreground shadow-sm"
                      : "border-border/40 bg-background/60 text-muted-foreground hover:border-border/70 hover:bg-card/70 hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex w-full items-center justify-end gap-2 sm:ml-auto sm:w-auto">
              <CurrencyToggle iconOnly className="h-12 w-12 rounded-2xl border-border/70 bg-background/70" />
              <ThemeToggle iconOnly className="h-12 w-12 rounded-2xl border-border/70 bg-background/70" />
              <GuestOrdersDrawer />
              <Skeleton className="h-12 w-12 rounded-2xl border border-border/70 bg-card" />
              <Skeleton className="h-12 min-w-[12.25rem] rounded-full border border-border/70 bg-card" />
            </div>
          </div>
        </header>
      </div>

      <main className="relative mx-auto max-w-6xl min-w-0 overflow-x-clip px-3 pt-6 sm:px-4 sm:pt-8">
        <RouteLoading label={message} />
      </main>
    </div>
  );
}
