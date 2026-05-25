import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { RouteShell } from "@/components/layout/route-shell";
import { Providers } from "@/providers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CartDrawer } from "@/components/cart/cart-drawer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "arcetis",
  description: "Arcetis gamified rewards platform",
  icons: {
    icon: [
      {
        url: "/logo_dark.png",
        media: "(prefers-color-scheme: light)"
      },
      {
        url: "/logo_light.png",
        media: "(prefers-color-scheme: dark)"
      }
    ],
    shortcut: [
      {
        url: "/logo_dark.png",
        media: "(prefers-color-scheme: light)"
      },
      {
        url: "/logo_light.png",
        media: "(prefers-color-scheme: dark)"
      }
    ],
    apple: "/logo_dark.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans`}>
        <Providers>
          <RouteShell>{children}</RouteShell>
          <CartDrawer />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
