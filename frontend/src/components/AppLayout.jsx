import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout({ title, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="ww-app">
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      {menuOpen && (
        <button
          aria-label="Close navigation"
          className="ww-nav-scrim"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div className="ww-main">
        <Topbar title={title} onMenu={() => setMenuOpen((open) => !open)} />
        <main className="ww-content">{children}</main>
        <footer className="ww-footer">WriteWise AI · Your private writing workspace</footer>
      </div>
    </div>
  );
}
