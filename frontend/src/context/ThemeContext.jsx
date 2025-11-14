import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");

 useEffect(() => {
  document.body.setAttribute("data-theme", dark ? "dark" : "light");
}, [dark]);



  return (
    <ThemeContext.Provider value={{ dark, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
