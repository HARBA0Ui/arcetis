"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppCurrency = "TND" | "USD";

type CurrencyContextValue = {
  currency: AppCurrency;
  setCurrency: (currency: AppCurrency) => void;
  formatPrice: (priceDt: number | null | undefined, priceUsd: number | null | undefined) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const CURRENCY_STORAGE_KEY = "arcetis_currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<AppCurrency>("TND");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CURRENCY_STORAGE_KEY) as AppCurrency | null;
      if (stored === "USD" || stored === "TND") {
        setCurrencyState(stored);
      }
    } catch {
      // Ignore
    }
  }, []);

  const setCurrency = (newCurrency: AppCurrency) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    } catch {
      // Ignore
    }
  };

  const value = useMemo<CurrencyContextValue>(() => {
    return {
      currency,
      setCurrency,
      formatPrice: (priceDt, priceUsd) => {
        if (currency === "USD") {
          return priceUsd != null ? `$${priceUsd.toFixed(2)}` : "N/A";
        }
        return priceDt != null ? `${priceDt.toFixed(2)} DT` : "N/A";
      }
    };
  }, [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
