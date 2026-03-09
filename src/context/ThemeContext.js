import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

const lightTheme = {
  mode: "light",
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  subText: "#64748B",
  primary: "#4F46E5",
};

const darkTheme = {
  mode: "dark",
  background: "#0F172A",
  card: "#1E293B",
  text: "#F9FAFB",
  subText: "#94A3B8",
  primary: "#6366F1",
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const saved = await AsyncStorage.getItem("APP_THEME");

    if (saved === "dark") setTheme(darkTheme);
    else setTheme(lightTheme);
  };

  const toggleTheme = async () => {
    const newTheme = theme.mode === "light" ? darkTheme : lightTheme;

    setTheme(newTheme);
    await AsyncStorage.setItem("APP_THEME", newTheme.mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);