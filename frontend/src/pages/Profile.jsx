import { AlertCircle, CalendarDays, Mail, PenLine, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api";
import EmptyState from "../components/EmptyState";
import StatCard from "../components/StatCard";
import { formatDate, getLocalUser } from "../utils";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getProfile()
      .then((response) => {
        if (!response?.success || !response.profile) throw new Error("The backend returned invalid profile data.");
        setProfile(response.profile);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const localUser = getLocalUser();
  if (loading) return <div className="ww-page"><section className="ww-panel ww-result-loading"><span className="ww-spinner" /><p>Loading your profile…</p></section></div>;
  if (error) return <div className="ww-page"><div className="ww-alert ww-alert-error"><AlertCircle size={17} />{error}</div></div>;
  if (!profile) return <div className="ww-page"><EmptyState icon={UserRound} title="Profile unavailable">No profile data was returned by the backend.</EmptyState></div>;

  const stats = profile.statistics || {};
  return (
    <div className="ww-page">
      <header className="ww-page-heading"><div><span className="ww-kicker">ACCOUNT</span><h2>Your WriteWise profile.</h2><p>Account details and writing statistics from your backend profile.</p></div></header>
      <section className="ww-panel ww-profile-card">
        <span className="ww-profile-avatar">{(profile.name || localUser?.name || "W").slice(0, 1).toUpperCase()}</span>
        <div className="ww-profile-identity"><span className="ww-kicker">WRITEWISE MEMBER</span><h3>{profile.name || localUser?.name || "WriteWise user"}</h3><p><Mail size={15} /> {profile.email || localUser?.email || "Email unavailable"}</p></div>
        <div className="ww-profile-joined"><CalendarDays size={16} /><span>Joined<br /><strong>{profile.created_at ? formatDate(profile.created_at) : "Date unavailable"}</strong></span></div>
      </section>
      <section className="ww-stat-grid">
        <StatCard icon={PenLine} title="Analyses" value={stats.total_analyses ?? 0} detail="Saved in your account" />
        <StatCard icon={UserRound} title="Average score" value={stats.total_analyses ? `${stats.average_score}%` : "—"} detail="Across all analyses" />
        <StatCard icon={AlertCircle} title="Mistakes detected" value={stats.total_mistakes ?? 0} detail="Across all analyses" />
      </section>
      <div className="ww-alert ww-alert-info">Profile editing is not available in the current FastAPI backend. Your name and email are displayed from the account record.</div>
    </div>
  );
}
