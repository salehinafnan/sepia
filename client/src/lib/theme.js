import { useSyncExternalStore } from "react";

// The initial theme is applied by an inline script in index.html to avoid a flash.
const listeners = new Set();
const isDark = () => document.documentElement.classList.contains("dark");

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const toggleTheme = () => {
  const dark = !isDark();
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.theme = dark ? "dark" : "light";
  } catch {
    // Storage is unavailable, so the choice lasts until reload.
  }
  listeners.forEach((listener) => listener());
};

export const useDarkTheme = () => useSyncExternalStore(subscribe, isDark);
