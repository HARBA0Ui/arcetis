"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  iconOnly?: boolean;
  className?: string;
}

export function ThemeToggle({ iconOnly = false, className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          "inline-flex items-center justify-center rounded-2xl border border-border/70 bg-background/70 text-foreground transition-colors hover:bg-card/80",
          iconOnly ? "" : "gap-2 px-4 py-2",
          className
        )}
      >
        {iconOnly ? <Moon className="h-4.5 w-4.5" /> : "Theme"}
      </button>
    );
  }

  const dark = theme !== "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl border border-border/70 bg-background/70 text-foreground transition-colors hover:bg-card/80",
        iconOnly ? "" : "gap-2 px-4 py-2",
        className
      )}
    >
      {dark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
      {iconOnly ? null : dark ? "Light" : "Dark"}
    </button>
  );
}
