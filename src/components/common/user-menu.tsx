"use client";

import Link from "next/link";
import { ChevronDown, ClipboardList, Coins, Flame, Gauge, LogOut, PartyPopper, UserCircle2, UserRound, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  user?: Pick<User, "username">;
  className?: string;
  onLogout?: () => void;
}

export function UserMenu({ user, className, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const username = user?.username ?? "User";
  const { t } = useLanguage();

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <Button
        variant="secondary"
        size="sm"
        className="h-12 min-w-[12.25rem] justify-between gap-2 overflow-visible rounded-full border border-border/70 bg-card/80 px-3 py-0 transition-all hover:border-border hover:bg-accent/70"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={user ? `Open account menu for ${username}` : "Open account menu"}
        title={
          user
            ? `${Math.round(levelProgress)}% to level ${level + 1} | ${formatNumber(points)} pts | ${streak}d streak`
            : "Open account menu"
        }
      >
        <span className="flex min-w-0 items-center gap-2">
          {user ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/60 border border-border/70">
              <UserCircle2 className="h-4 w-4" />
            </div>
          ) : (
            <Skeleton className="h-10 w-10 rounded-full" />
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open ? "rotate-180" : "rotate-0")} />
      </Button>

      {open ? (
        <div className="arcetis-dropdown absolute right-0 top-[calc(100%+0.55rem)] z-[70] w-72 rounded-xl border border-border/90 bg-card p-3 shadow-arcetis">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted/60 border border-border/70">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{username}</p>
            </div>
            <span className="ml-auto rounded-full border border-border/70 bg-muted/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Arcetis Core
            </span>
          </div>

          <div className="my-3 h-px bg-border" />

          <nav className="space-y-1" aria-label="User quick links">
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              <UserRound className="h-4 w-4" />
              {t("menuProfile")}
            </Link>
            <Link
              href="/requests"
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              <ClipboardList className="h-4 w-4" />
              {t("menuRequests")}
            </Link>
            <Link
              href="/giveaways/mine"
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              <PartyPopper className="h-4 w-4" />
              My giveaways
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-destructive/80 transition-colors hover:bg-accent hover:text-destructive"
              onClick={() => {
                setOpen(false);
                onLogout?.();
              }}
            >
              <LogOut className="h-4 w-4" />
              {t("menuLogout")}
            </button>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
