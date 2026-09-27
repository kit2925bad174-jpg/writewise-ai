import { NavLink, useNavigate } from "react-router-dom";
import {
  Activity,
  BookOpenCheck,
  ChartNoAxesCombined,
  FileText,
  History,
  House,
  LogOut,
  Mail,
  PenLine,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";

const links = [
  { label: "Dashboard", to: "/dashboard", icon: House },
  { label: "Writing assistant", to: "/writing", icon: PenLine },
  { label: "Rewriter", to: "/rewriter", icon: Sparkles },
  { label: "Email assistant", to: "/email", icon: Mail },
  { label: "Resume assistant", to: "/resume", icon: FileText },
  { label: "Learning", to: "/learning", icon: BookOpenCheck },
  { label: "Progress", to: "/progress", icon: ChartNoAxesCombined },
  { label: "History", to: "/history", icon: History },
];

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("writewise_user") || "null");
  } catch {
    return null;
  }
}

export default function Sidebar({ open = false, onNavigate }) {
  const navigate = useNavigate();
  const user = readUser();

  function logout() {
    localStorage.removeItem("writewise_token");
    localStorage.removeItem("writewise_user");
    localStorage.removeItem("writewise_last_mistakes");
    navigate("/login", { replace: true });
    onNavigate?.();
  }

  return (
    <aside className={`ww-sidebar${open ? " is-open" : ""}`}>
      <NavLink className="ww-brand" to="/dashboard" onClick={onNavigate}>
        <span className="ww-brand-mark"><Sparkles size={20} /></span>
        <span><strong>WriteWise</strong><small>AI writing studio</small></span>
      </NavLink>

      <div className="ww-nav-label">WORKSPACE</div>
      <nav className="ww-nav" aria-label="Main navigation">
        {links.map(({ label, to, icon: Icon }) => (
          <NavLink
            end
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) => `ww-nav-link${isActive ? " active" : ""}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="ww-nav-label ww-nav-label-lower">ACCOUNT</div>
      <nav className="ww-nav" aria-label="Account navigation">
        <NavLink
          to="/profile"
          onClick={onNavigate}
          className={({ isActive }) => `ww-nav-link${isActive ? " active" : ""}`}
        >
          <UserRound size={18} /><span>Profile</span>
        </NavLink>
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) => `ww-nav-link${isActive ? " active" : ""}`}
        >
          <Settings size={18} /><span>Settings</span>
        </NavLink>
      </nav>

      <div className="ww-sidebar-bottom">
        <div className="ww-local-note">
          <Activity size={16} />
          <span><strong>Private by design</strong><small>AI runs locally through Ollama</small></span>
        </div>
        <div className="ww-user">
          <span className="ww-avatar">{user?.name?.slice(0, 1)?.toUpperCase() || "W"}</span>
          <span className="ww-user-info">
            <strong>{user?.name || "WriteWise user"}</strong>
            <small>{user?.email || "Your workspace"}</small>
          </span>
          <button className="ww-icon-button" aria-label="Log out" title="Log out" onClick={logout}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
