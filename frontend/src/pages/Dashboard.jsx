import { Activity, ArrowRight, BookOpenCheck, FileText, Mail, PenLine, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import learningIllustration from "../assets/learning-illustration.svg";
import EmptyState from "../components/EmptyState";
import StatCard from "../components/StatCard";
import { formatDate, getLocalUser } from "../utils";

const shortcuts = [
  { to: "/writing", icon: PenLine, title: "Writing assistant", text: "Check a draft and understand the edits." },
  { to: "/rewriter", icon: Sparkles, title: "Rewriter", text: "Compare writing styles from your local model." },
  { to: "/email", icon: Mail, title: "Email assistant", text: "Turn notes into an email draft." },
  { to: "/resume", icon: FileText, title: "Resume assistant", text: "Refine resume wording and clarity." },
];

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [profileResponse, historyResponse] = await Promise.all([api.getProfile(), api.getHistory()]);
      if (!profileResponse?.success || !profileResponse.profile || !Array.isArray(historyResponse?.items)) {
        throw new Error("The backend returned incomplete dashboard data.");
      }
      setProfile(profileResponse.profile);
      setItems(historyResponse.items);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const stats = profile?.statistics;
  const name = getLocalUser()?.name?.split(/\s+/)[0] || "there";

  return (
    <div className="ww-page">
      <section className="ww-dashboard-hero">
        <div><span className="ww-kicker">YOUR WRITING WORKSPACE</span><h2>Good to see you, {name}.</h2><p>Make your next draft clearer, one thoughtful edit at a time.</p><Link className="ww-button ww-button-light" to="/writing">Start a writing session <ArrowRight size={16} /></Link></div>
        <div className="ww-hero-decoration"><img src={learningIllustration} alt="" /></div>
      </section>

      {error && <div className="ww-alert ww-alert-error">{error}<button className="ww-text-action" onClick={load}><RefreshCw size={14} /> Retry</button></div>}
      <section className="ww-stat-grid">
        <StatCard icon={PenLine} title="Analyses completed" value={loading ? "—" : stats?.total_analyses ?? "—"} detail="Saved writing sessions" />
        <StatCard icon={TrendingUp} title="Average score" value={loading || !stats?.total_analyses ? "—" : `${stats.average_score}%`} detail={stats?.total_analyses ? "Across saved analyses" : "Appears after your first analysis"} />
        <StatCard icon={Activity} title="Mistakes detected" value={loading ? "—" : stats?.total_mistakes ?? "—"} detail="Across your saved sessions" />
      </section>

      <div className="ww-dashboard-grid">
        <section className="ww-panel">
          <div className="ww-panel-header"><div><span className="ww-kicker">TOOLS</span><h3>Choose a writing task</h3></div><BookOpenCheck size={19} /></div>
          <div className="ww-shortcut-grid">{shortcuts.map(({ to, icon: Icon, title, text }) => <Link className="ww-shortcut" to={to} key={to}><span><Icon size={18} /></span><div><strong>{title}</strong><p>{text}</p></div><ArrowRight size={15} /></Link>)}</div>
        </section>
        <section className="ww-panel">
          <div className="ww-panel-header"><div><span className="ww-kicker">YOUR ACTIVITY</span><h3>Recent analyses</h3></div><Link className="ww-text-action" to="/history">View history <ArrowRight size={14} /></Link></div>
          {loading ? <p className="ww-muted">Loading activity…</p> : items.length ? <div className="ww-activity-list">{items.slice(0, 5).map((item) => <div className="ww-activity-item" key={item.id}><span className="ww-activity-icon"><FileText size={16} /></span><div><strong>{item.mode || "General"} analysis</strong><p>{(item.text || "").slice(0, 96)}{(item.text || "").length > 96 ? "…" : ""}</p><small>{formatDate(item.date)}</small></div><span className="ww-activity-score">{item.score ?? "—"}</span></div>)}</div> : <EmptyState icon={Activity} title="No writing analyses yet">Start your first analysis and your saved activity will appear here.</EmptyState>}
        </section>
      </div>
      <div className="ww-inline-tip"><Sparkles size={17} /><p><strong>Make feedback count.</strong> Read the explanation behind an edit, then try applying the rule in your next sentence.</p><Link to="/learning">Try a practice question <ArrowRight size={14} /></Link></div>
    </div>
  );
}
