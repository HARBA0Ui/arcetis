"use client";

import { useEffect, useState } from "react";

export interface GuestOrder {
  id: string;
  requestCode: string;
  rewardTitle: string;
  createdAt: number;
}

export function useGuestOrders() {
  const [orders, setOrders] = useState<GuestOrder[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("arcetis_guest_orders");
      if (stored) {
        setOrders(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse guest orders", e);
    }
    setIsLoaded(true);
  }, []);

  const addOrder = (order: Omit<GuestOrder, "createdAt">) => {
    setOrders((prev) => {
      const newOrders = [{ ...order, createdAt: Date.now() }, ...prev];
      try {
        localStorage.setItem("arcetis_guest_orders", JSON.stringify(newOrders));
      } catch (e) {
        console.error("Failed to save guest orders", e);
      }
      return newOrders;
    });
  };

  const clearOrders = () => {
    setOrders([]);
    try {
      localStorage.removeItem("arcetis_guest_orders");
    } catch (e) {
      console.error("Failed to clear guest orders", e);
    }
  };

  return {
    orders,
    addOrder,
    clearOrders,
    isLoaded,
  };
}
