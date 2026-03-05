"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme | null) ?? "dark";
    applyTheme(saved);
    setTheme(saved);
  }, []);

  function applyTheme(next: Theme) {
    const root = document.documentElement;
    root.classList.remove("theme-dark", "theme-light");
    root.classList.add(next === "light" ? "theme-light" : "theme-dark");
  }

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }

  return (
    <button
      onClick={toggle}
      className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/20"
      type="button"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "Light" : "Dark"} Theme
    </button>
  );
}
