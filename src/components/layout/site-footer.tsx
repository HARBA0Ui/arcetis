"use client";

import Link from "next/link";
import { ArcetisLogo } from "@/components/common/arcetis-logo";
import { useLanguage } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

const footerLinks = [
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
  { href: "/privacy", key: "privacy" },
  { href: "/terms", key: "terms" }
] as const;

export function SiteFooter({ className }: { className?: string }) {
  const year = new Date().getFullYear();
  const { language } = useLanguage();
  const copy =
    language === "ar"
      ? {
          about: "عن Arcetis",
          contact: "تواصل معنا",
          privacy: "سياسة الخصوصية",
          terms: "الشروط والأحكام",
          rights: "جميع الحقوق محفوظة.",
          note: "المعلومات العامة والخصوصية والشروط متاحة هنا."
        }
      : {
          about: "About Arcetis",
          contact: "Contact",
          privacy: "Privacy Policy",
          terms: "Terms & Conditions",
          rights: "All rights reserved.",
          note: "Public information, privacy, and terms are available here."
        };

  return (
    <footer className={cn("mt-12 border-t border-border/60 bg-background/55", className)}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
          <div className="space-y-3">
            <Link href="/" className="inline-flex shrink-0">
              <ArcetisLogo className="h-8 md:h-9" />
            </Link>

            <p className="max-w-sm text-sm leading-6 text-muted-foreground">{copy.note}</p>
          </div>

          <nav className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[1.1rem] border border-border/70 bg-card/72 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              >
                <p className="font-medium text-foreground">
                  {link.key === "about"
                    ? copy.about
                    : link.key === "contact"
                      ? copy.contact
                      : link.key === "privacy"
                        ? copy.privacy
                        : copy.terms}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {link.key === "about"
                    ? "Learn more about the platform."
                    : link.key === "contact"
                      ? "Reach the Arcetis team."
                      : link.key === "privacy"
                        ? "See how account data is handled."
                        : "Review the platform terms."}
                </p>
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-6 flex flex-col gap-1 border-t border-border/60 pt-4 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; <span suppressHydrationWarning>{year}</span> Arcetis. {copy.rights}
          </p>
          <p>Built for clear rewards, clear policies, and easy navigation.</p>
        </div>
      </div>
    </footer>
  );
}
