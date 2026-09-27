import { Menu, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getLocalUser } from "../utils";

export default function Topbar({ title, onMenu }) {
  const user = getLocalUser();
  const [dark, setDark] = useState(
    () => document.documentElement.dataset.theme === "dark",
  );

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    const theme = next ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("writewise_theme", theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content",
      next ? "#121225" : "#f6f4ff",
    );
    window.dispatchEvent(new CustomEvent("writewise-theme-change", { detail: theme }));
  }

  return (
    <header className="ww-topbar">
      <div className="ww-topbar-title">
        <button className="ww-mobile-menu" aria-label="Open navigation" onClick={onMenu}>
          <Menu size={20} />
        </button>
        <div><span>YOUR WORKSPACE</span><h1>{title}</h1></div>
      </div>
      <div className="ww-topbar-actions">
        <span className="ww-local-status"><i /> Local AI workspace</span>
        <Link className="ww-topbar-user" to="/profile" aria-label="Open profile">
          <span className="ww-topbar-avatar">{user?.name?.slice(0, 1)?.toUpperCase() || "W"}</span>
          <span>{user?.name?.split(/\s+/)[0] || "Profile"}</span>
        </Link>
        <button
          className="ww-icon-button ww-theme-button"
          aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
          aria-pressed={dark}
          onClick={toggleTheme}
          title="Toggle theme"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
