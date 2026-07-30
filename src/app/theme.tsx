import { createContext, useCallback, useContext, useState } from "react";

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "r2pf-theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
  toggle: () => {},
});

/**
 * Read the theme the bootstrap script in index.html already committed to, so the
 * first render matches the painted document instead of flipping it a frame later.
 */
function readInitialTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode / storage disabled — the theme still applies for this session.
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);

  // The class swap happens here, in the event handler, NOT in an effect.
  // Consumers that read resolved token values off the document (the canvas
  // palette) run their effects before this provider's would, so an effect-based
  // swap would hand them the outgoing theme's colors.
  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    setThemeState(next);
  }, []);

  const toggle = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme]
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
