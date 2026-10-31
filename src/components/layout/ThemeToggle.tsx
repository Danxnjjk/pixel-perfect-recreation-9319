import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const d = localStorage.getItem("financas:theme") === "dark";
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
  }, []);
  const toggle = () => {
    const d = !dark;
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
    localStorage.setItem("financas:theme", d ? "dark" : "light");
  };
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Alternar tema">
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}
