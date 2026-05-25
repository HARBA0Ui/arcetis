import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string; // Unique ID for the cart item
  rewardId: string;
  planId?: string;
  requestedInfo?: Record<string, string>;
  paymentMethod?: "points" | "kashy";
  // Display info
  title: string;
  imageUrl?: string | null;
  planLabel?: string;
  pointsCost: number;
  tndPrice?: number;
  usdPrice?: number;
};

type CartState = {
  items: CartItem[];
  guestEmail: string;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setGuestEmail: (email: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      guestEmail: "",
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, { ...item, id: crypto.randomUUID() }],
          isCartOpen: true
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id)
        })),
      clearCart: () => set({ items: [] }),
      setGuestEmail: (email) => set({ guestEmail: email }),
      isCartOpen: false,
      setIsCartOpen: (open) => set({ isCartOpen: open })
    }),
    {
      name: "arcetis-cart-storage",
      partialize: (state) => ({ items: state.items, guestEmail: state.guestEmail })
    }
  )
);
