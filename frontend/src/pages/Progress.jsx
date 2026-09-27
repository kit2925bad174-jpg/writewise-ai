import { AlertCircle, ChartNoAxesCombined, RefreshCw, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import EmptyState from "../components/EmptyState";
import StatCard from "../components/StatCard";

const metrics = [
  ["Grammar", "grammar"],
  ["Spelling", "spelling"],
  ["Punctuation", "punctuation"],
  ["Clarity", "clarity"],
  ["Vocabulary", "vocabulary"],
];

export default function Progress() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await api.getHistory();
      if (!Array.isArray(response?.items)) throw new Error("The backend returned invalid history data.");
      setItems(response.items);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const average = useMemo(() => items.length
    ? Math.round(items.reduce((total, item) => total + (Number(item.score) || 0), 0) / items.length)
    : null, [items]);
  const skillAverages = useMemo(() => metrics.map(([name, key]) => {
    const values = items.map((item) => Number(item[key])).filter(Number.isFinite);
    return { name, value: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null };
  }), [items]);

  return (
    <div className="ww-page">
      <header className="ww-page-heading"><div><span className="ww-kicker">YOUR WRITING JOURNEY</span><h2>Progress grounded in your work.</h2><p>Scores and skill averages are calculated from saved analyses in your backend history.</p></div><button className="ww-button ww-button-outline" onClick={load} disabled={loading}><RefreshCw size={15} /> Refresh</button></header>
      {error && <div className="ww-alert ww-alert-error" role="alert"><AlertCircle size={17} />{error}</div>}
      {loading ? <section className="ww-panel ww-result-loading"><span className="ww-spinner" /><p>Loading your saved progress…</p></section> : !items.length ? <section className="ww-panel"><EmptyState icon={ChartNoAxesCombined} title="Progress appears after your first analysis">There are no saved writing analyses yet, so there are no scores or trends to show.</EmptyState></section> : <>
        <section className="ww-stat-grid">
          <StatCard icon={ChartNoAxesCombined} title="Analyses saved" value={items.length} detail="From backend history" />
          <StatCard icon={TrendingUp} title="Average writing score" value={`${average}%`} detail="Across saved analyses" />
          <StatCard icon={RefreshCw} title="Latest score" value={`${items[0]?.score ?? "—"}%`} detail="Most recent analysis" />
        </section>
        <div className="ww-dashboard-grid">
          <section className="ww-panel"><div className="ww-panel-header"><div><span className="ww-kicker">SCORES</span><h3>Recent writing scores</h3></div></div><div className="ww-score-chart" aria-label="Scores from your latest saved analyses">{items.slice(0, 8).reverse().map((item) => <div className="ww-chart-bar" key={item.id} title={`${item.score}/100`}><span style={{ height: `${Math.max(4, Math.min(100, Number(item.score) || 0))}%` }} /><small>{item.score}</small></div>)}</div><p className="ww-chart-caption">Each bar reflects an actual saved analysis (up to the latest eight).</p></section>
          <section className="ww-panel"><div className="ww-panel-header"><div><span className="ww-kicker">SKILL BREAKDOWN</span><h3>Average category scores</h3></div></div><div className="ww-skill-list">{skillAverages.map(({ name, value }) => <div className="ww-score-row" key={name}><span>{name}</span><div className="ww-meter"><i style={{ width: `${value ?? 0}%` }} /></div><strong>{value === null ? "—" : `${value}%`}</strong></div>)}</div><p className="ww-chart-caption">Averages use category scores returned by saved analysis records.</p></section>
        </div>
      </>}
    </div>
  );
}
