"use client";

import { useEffect, useState } from "react";
import { useAuthToken } from "@/hooks/use-auth-token";
import { useGuestOrders } from "@/hooks/use-guest-orders";
import { useClaimGuestOrders } from "@/hooks/usePlatform";

export function GuestOrdersSync() {
  const token = useAuthToken();
  const { orders, clearOrders, isLoaded } = useGuestOrders();
  const { mutateAsync: claimOrders } = useClaimGuestOrders();
  const [hasSynced, setHasSynced] = useState(false);

  useEffect(() => {
    if (!isLoaded || hasSynced || !token || orders.length === 0) {
      return;
    }

    const syncOrders = async () => {
      try {
        const requestCodes = orders.map((o) => o.requestCode);
        await claimOrders({ requestCodes });
        clearOrders();
        setHasSynced(true);
      } catch (e) {
        console.error("Failed to sync guest orders", e);
      }
    };

    void syncOrders();
  }, [token, orders, isLoaded, hasSynced, claimOrders, clearOrders]);

  return null;
}
