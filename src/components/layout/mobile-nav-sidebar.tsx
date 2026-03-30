"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type MobileNavSidebarLink = {
  href: string;
  label: string;
  icon?: LucideIcon;
  active?: boolean;
  onNavigate?: () => void;
};

export function MobileNavSidebar({
  open,
  onClose,
  title,
  subtitle,
  links,
  footer
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  links: MobileNavSidebarLink[];
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className={cn("fixed inset-0 z-[90] sm:hidden", open ? "pointer-events-auto" : "pointer-events-none")}>
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/58 backdrop-blur-[2px] transition-opacity duration-300 ease-out",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-[min(86vw,22rem)] flex-col border-l border-white/10 bg-[linear-gradient(180deg,rgba(10,10,10,0.98),rgba(17,17,17,0.98)_56%,rgba(44,23,7,0.96))] px-4 py-4 text-white shadow-[-24px_0_80px_-42px_rgba(0,0,0,0.95)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/48">Navigation</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">{title}</h2>
            {subtitle ? <p className="mt-2 text-sm leading-6 text-white/68">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/82 transition-colors hover:bg-white/[0.1] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={link.onNavigate}
              aria-current={link.active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-[1.1rem] border px-3.5 py-3 text-sm font-medium transition-all",
                link.active
                  ? "border-white/18 bg-white/[0.1] text-white shadow-[0_18px_40px_-26px_rgba(0,0,0,0.9)]"
                  : "border-white/10 bg-white/[0.04] text-white/74 hover:border-white/16 hover:bg-white/[0.08] hover:text-white"
              )}
            >
              {link.icon ? <link.icon className="h-4 w-4 shrink-0" /> : null}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {footer ? <div className="mt-auto pt-6">{footer}</div> : null}
      </aside>
    </div>
  );
}
