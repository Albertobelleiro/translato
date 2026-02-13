import { useSyncExternalStore } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "translato.theme";
const listeners = new Set<() => void>();

function getSnapshot(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return "dark";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.remove("dark", "light");
  document.documentElement.classList.add(theme);
  const metaColor = theme === "light" ? "#F5F6F8" : "#1A1D21";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", metaColor);
}

function setTheme(theme: Theme) {
  try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
  applyTheme(theme);
  for (const cb of listeners) cb();
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "dark" as Theme);
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");
  return { theme, toggle } as const;
}

/** Call once before createRoot to prevent flash */
export function initTheme() {
  applyTheme(getSnapshot());
}
