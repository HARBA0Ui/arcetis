"use client";

import { DollarSign, Wallet } from "lucide-react";
import { useCurrency } from "./currency-provider";
import { cn } from "@/lib/utils";

export function CurrencyToggle({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  const { currency, setCurrency } = useCurrency();

  const toggle = () => {
    setCurrency(currency === "TND" ? "USD" : "TND");
  };

  const label = currency === "TND" ? "DT" : "USD";

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label="Toggle currency"
        className={cn("inline-flex items-center justify-center transition-colors hover:bg-card/80 text-foreground", className)}
        title={currency === "TND" ? "Switch to USD" : "Switch to TND"}
      >
        <span className="font-bold text-[11px] tracking-widest">{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn("inline-flex items-center justify-center rounded-md border border-border/70 px-4 py-2 transition-colors hover:bg-muted/50", className)}
    >
      <span className="font-bold text-xs tracking-widest">{label}</span>
    </button>
  );
}
