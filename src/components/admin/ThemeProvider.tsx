"use client";
import { createContext, useContext, useEffect, useState } from "react";

type ThemeCtxType = { dark: boolean; toggle: () => void };
const ThemeCtx = createContext<ThemeCtxType>({ dark: false, toggle: () => {} });
export const useTheme = () => useContext(ThemeCtx);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("admin-dark");
    }
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("admin-dark");
      localStorage.setItem("admin-theme", "dark");
    } else {
      document.documentElement.classList.remove("admin-dark");
      localStorage.setItem("admin-theme", "light");
    }
  }

  return (
    <ThemeCtx.Provider value={{ dark, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}
