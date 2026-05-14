"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function getInitial(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("wc2026-theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function applyThemeClass(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getInitial();
    setTheme(initial);
    applyThemeClass(initial);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyThemeClass(next);
    try { localStorage.setItem("wc2026-theme", next); } catch {}
  }

  // SSR placeholder so layout doesn't shift
  if (!mounted) {
    return (
      <button
        aria-label="Theme"
        className={`flex items-center justify-center ${compact ? "w-8 h-8" : "w-9 h-9"} rounded border border-line/15`}
      >
        <Moon className="w-4 h-4 text-muted" />
      </button>
    );
  }

  const Icon = theme === "dark" ? Sun : Moon;
  const label = theme === "dark" ? "Светлая тема" : "Тёмная тема";

  return (
    <button
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`flex items-center justify-center ${compact ? "w-8 h-8" : "w-9 h-9"} rounded border border-line/15 hover:border-pitch/40 hover:bg-pitch/5 text-muted hover:text-pitch transition-colors`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
