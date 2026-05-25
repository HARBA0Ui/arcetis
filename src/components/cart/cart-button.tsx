"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const cart = useCart();
  const mounted = typeof window !== "undefined";

  if (!mounted) return null;

  return (
    <button
      onClick={() => cart.setIsCartOpen(true)}
      className={cn(
        "relative inline-flex h-10 items-center justify-center rounded-2xl border border-border/70 bg-background/70 px-3 text-foreground transition-colors hover:bg-card/80",
        className
      )}
    >
      <ShoppingCart className="h-4.5 w-4.5" />
      {cart.items.length > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--arcetis-ember))] text-[10px] font-bold text-white shadow-sm">
          {cart.items.length}
        </span>
      )}
    </button>
  );
}
