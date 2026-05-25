"use client";

import { ShoppingCart, X, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeAssetUrl } from "@/lib/assets";
import { formatNumber } from "@/lib/format";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/common/toast-center";

export function CartDrawer() {
  const toast = useToast();
  const cart = useCart();
  const router = useRouter();
  const [emailInput, setEmailInput] = useState(cart.guestEmail || "");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);


  const totalTnd = cart.items.reduce((sum, item) => sum + (item.tndPrice || 0), 0);
  const totalUsd = cart.items.reduce((sum, item) => sum + (item.usdPrice || 0), 0);

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        items: cart.items.map(item => ({
          rewardId: item.rewardId,
          planId: item.planId,
          requestedInfo: item.requestedInfo,
          paymentMethod: item.paymentMethod
        })),
        guestEmail: emailInput || undefined
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || err.error || "Checkout failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      const code = data.redemptions[0]?.requestCode;
      if (emailInput) {
        cart.setGuestEmail(emailInput);
      }
      cart.clearCart();
      cart.setIsCartOpen(false);
      if (code) {
        router.push(`/requests/${code}?byCode=true`);
      } else {
        router.push(`/dashboard`);
      }
    },
    onError: (err) => {
      toast.error("Checkout failed", err.message);
    }
  });

  async function handleCheckout() {
    if (cart.items.length === 0) return;
    
    // Check if we need email (meaning they are probably guest)
    // For simplicity, we just prompt it in the UI and validate if filled
    if (isCheckingOut) {
      if (emailInput) {
        if (emailInput !== emailConfirm) {
          toast.error("Validation error", "Emails do not match");
          return;
        }
      }
      checkoutMutation.mutate();
    } else {
      setIsCheckingOut(true);
    }
  }

  if (!cart.isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => cart.setIsCartOpen(false)}
      />
      
      <div className="relative w-full max-w-md h-full bg-card shadow-2xl border-l border-border/50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-[hsl(var(--arcetis-ember))]" />
            <h2 className="text-xl font-semibold">Your Cart</h2>
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
              {cart.items.length}
            </span>
          </div>
          <button 
            onClick={() => cart.setIsCartOpen(false)}
            className="p-2 hover:bg-muted/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-background/50 rounded-2xl border border-border/50 group">
                  {item.imageUrl ? (
                    <img 
                      src={normalizeAssetUrl(item.imageUrl)} 
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-muted/50" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.title}</h4>
                    {item.planLabel && (
                      <p className="text-xs text-muted-foreground mt-1">{item.planLabel}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">

                      {item.tndPrice ? (
                        <span className="text-xs bg-muted px-2 py-1 rounded-md">{formatNumber(item.tndPrice)} DT</span>
                      ) : null}
                    </div>
                  </div>

                  <button 
                    onClick={() => cart.removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-400 transition-all self-start"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="p-6 border-t border-border/50 bg-background/50 backdrop-blur-md">
            {isCheckingOut ? (
              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <Label>Email address (for guest checkout)</Label>
                  <Input 
                    placeholder="name@example.com" 
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">If you are not logged in, we need your email to process the order.</p>
                </div>
                <div className="space-y-2">
                  <Label>Confirm email address</Label>
                  <Input 
                    placeholder="name@example.com" 
                    type="email"
                    value={emailConfirm}
                    onChange={(e) => setEmailConfirm(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 mb-6">

                {totalTnd > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total TND</span>
                    <span className="font-medium">{formatNumber(totalTnd, { maximumFractionDigits: 2 })} DT</span>
                  </div>
                )}
                {totalUsd > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total USD</span>
                    <span className="font-medium">${formatNumber(totalUsd, { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              {isCheckingOut && (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsCheckingOut(false)}
                >
                  Back
                </Button>
              )}
              <Button 
                className="flex-[2] text-primary-foreground font-semibold"
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending}
              >
                {checkoutMutation.isPending ? "Processing..." : (isCheckingOut ? "Confirm & Pay" : "Checkout")}
                {!checkoutMutation.isPending && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
