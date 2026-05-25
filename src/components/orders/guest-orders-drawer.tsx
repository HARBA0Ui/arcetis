"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ShoppingBag, X, ArrowRight, Clock } from "lucide-react";
import { useGuestOrders } from "@/hooks/use-guest-orders";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";

export function GuestOrdersDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { orders, isLoaded } = useGuestOrders();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isLoaded || orders.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/70 text-foreground transition-colors hover:bg-card/80 sm:h-10 sm:w-10"
        aria-label="My Orders"
      >
        <ShoppingBag className="h-4.5 w-4.5" />
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
          {orders.length}
        </span>
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative w-full max-w-md h-full bg-card shadow-2xl border-l border-border/50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">My Orders</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-muted/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                These are your guest orders saved to your current browser. You can click on any order to view its status.
              </p>
              
              {orders.map((order) => (
                <div key={order.id} className="p-4 bg-background/50 rounded-2xl border border-border/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm truncate">{order.rewardTitle}</h4>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDateTime(new Date(order.createdAt).toISOString())}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
                    <div className="text-xs font-mono px-2 py-1 bg-muted/50 rounded border border-border/40">
                      {order.requestCode.slice(0, 16)}...
                    </div>
                    <Button asChild size="sm" variant="ghost" onClick={() => setIsOpen(false)}>
                      <Link href={`/orders/${order.requestCode}?byCode=true`} className="text-xs">
                        View <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              <div className="pt-6 border-t border-border/30 mt-6">
                <Button asChild className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30" onClick={() => setIsOpen(false)}>
                  <Link href="/login">
                    Sign in to save orders permanently
                  </Link>
                </Button>
                <p className="text-center text-[11px] text-muted-foreground mt-3">
                  Guest orders are saved locally and can be lost if you clear your browser data. Logging in automatically syncs them to your account.
                </p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
