import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
  // read saved theme or default to light mode
  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // apply theme globally
  useEffect(() => {
    document.body.style.background = dark ? "#1e1e1e" : "#f7f7f7";
    document.body.style.color = dark ? "white" : "black";

    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
