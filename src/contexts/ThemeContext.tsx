import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeMode = "dark" | "light" | "system";
export type BrandColor = "red" | "blue" | "emerald" | "purple" | "orange";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  brandColor: BrandColor;
  setBrandColor: (color: BrandColor) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem("mellow_theme_mode") as ThemeMode) || "dark";
  });

  const [brandColor, setBrandColorState] = useState<BrandColor>(() => {
    return (localStorage.getItem("mellow_brand_color") as BrandColor) || "red";
  });

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem("mellow_theme_mode", newMode);
  };

  const setBrandColor = (color: BrandColor) => {
    setBrandColorState(color);
    localStorage.setItem("mellow_brand_color", color);
  };

  const toggleTheme = () => {
    const nextMode: ThemeMode = mode === "dark" ? "light" : "dark";
    setMode(nextMode);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "light") {
      root.classList.add("light-theme");
      root.classList.remove("dark");
    } else if (mode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light-theme");
    } else {
      // System mode
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isSystemDark) {
        root.classList.add("dark");
        root.classList.remove("light-theme");
      } else {
        root.classList.add("light-theme");
        root.classList.remove("dark");
      }
    }
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, brandColor, setBrandColor, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
