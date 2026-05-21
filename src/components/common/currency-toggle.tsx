"use client";

import { DollarSign, Wallet } from "lucide-react";
import { useCurrency } from "./currency-provider";
import { cn } from "@/lib/utils";

export function CurrencyToggle({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  const { currency, setCurrency } = useCurrency();

  const toggle = () => {
    setCurrency(currency === "TND" ? "USD" : "TND");
  };

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label="Toggle currency"
        className={cn("inline-flex items-center justify-center transition-colors hover:bg-muted/70", className)}
        title={currency === "TND" ? "Switch to USD" : "Switch to TND"}
      >
        <div className="flex items-center gap-1.5 font-medium text-xs">
          {currency === "TND" ? <Wallet className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
          {currency}
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn("inline-flex items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm transition-colors hover:bg-muted/50", className)}
    >
      {currency === "TND" ? <Wallet className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
      {currency}
    </button>
  );
}
