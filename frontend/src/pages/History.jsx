import { AlertCircle, Clipboard, Eye, FileText, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import EmptyState from "../components/EmptyState";
import { copyText, formatDate } from "../utils";

export default function History() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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

  const filtered = useMemo(() => items.filter((item) => `${item.text || ""} ${item.corrected_text || ""} ${item.mode || ""}`.toLowerCase().includes(search.toLowerCase())), [items, search]);

  async function viewItem(id) {
    setError("");
    try {
      const response = await api.getHistoryItem(id);
      if (!response?.success || !response.item) throw new Error("The backend could not load this history item.");
      setSelected(response.item);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function removeItem(item) {
    setError("");
    setNotice("");
    setBusyId(item.id);
    try {
      await api.deleteHistory(item.id);
      localStorage.removeItem("writewise_last_mistakes");
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (selected?.id === item.id) setSelected(null);
      setNotice("Analysis deleted from your history.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId(null);
    }
  }

  async function clearHistory() {
    if (!items.length || !window.confirm("Delete all saved writing analyses? This cannot be undone.")) return;
    setError("");
    setNotice("");
    try {
      await api.clearHistory();
      localStorage.removeItem("writewise_last_mistakes");
      setItems([]);
      setSelected(null);
      setNotice("Writing history cleared.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="ww-page">
      <header className="ww-page-heading"><div><span className="ww-kicker">SAVED WRITING</span><h2>Review your past analyses.</h2><p>History is loaded and managed in your backend database.</p></div><button className="ww-button ww-button-danger-outline" onClick={clearHistory} disabled={!items.length || loading}><Trash2 size={15} /> Clear history</button></header>
      {error && <div className="ww-alert ww-alert-error" role="alert"><AlertCircle size={17} />{error}</div>}
      {notice && <div className="ww-alert ww-alert-success" role="status">{notice}</div>}
      <div className="ww-panel ww-history-panel">
        <label className="ww-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search original text or mode…" aria-label="Search writing history" /></label>
        {loading ? <div className="ww-result-loading"><span className="ww-spinner" /><p>Loading saved analyses…</p></div> : filtered.length ? <div className="ww-history-list">{filtered.map((item) => <article className="ww-history-row" key={item.id}><span className="ww-activity-icon"><FileText size={17} /></span><div className="ww-history-main"><div className="ww-history-title"><strong>{item.mode || "General"} analysis</strong><span>{formatDate(item.date)}</span></div><p>{item.text || "Original text unavailable"}</p><small>{item.mistake_count ?? 0} detected {item.mistake_count === 1 ? "mistake" : "mistakes"}</small></div><span className="ww-activity-score">{item.score ?? "—"}</span><div className="ww-inline-actions"><button className="ww-icon-button" title="View details" aria-label="View analysis details" onClick={() => viewItem(item.id)}><Eye size={16} /></button><button className="ww-icon-button ww-danger" title="Delete analysis" aria-label="Delete analysis" disabled={busyId === item.id} onClick={() => removeItem(item)}><Trash2 size={16} /></button></div></article>)}</div> : <EmptyState icon={FileText} title={items.length ? "No matching analyses" : "No writing analyses yet"}>{items.length ? "Try another search term." : "Your saved writing analyses will appear here after you analyze a draft."}</EmptyState>}
      </div>
      {selected && <div className="ww-modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className="ww-modal" role="dialog" aria-modal="true" aria-labelledby="ww-history-detail-title"><div className="ww-panel-header"><div><span className="ww-kicker">{formatDate(selected.date)}</span><h3 id="ww-history-detail-title">{selected.mode || "General"} analysis</h3></div><button className="ww-icon-button" aria-label="Close details" onClick={() => setSelected(null)}><X size={18} /></button></div><div className="ww-detail-grid"><div className="ww-detail-card"><span>Score</span><strong>{selected.score ?? "—"} / 100</strong></div><div className="ww-detail-card"><span>Mistakes detected</span><strong>{selected.mistake_count ?? 0}</strong></div></div><h4>Original</h4><p className="ww-history-detail-text">{selected.text}</p><h4>Corrected</h4><p className="ww-history-detail-text">{selected.corrected_text || "No corrected version saved."}</p><button className="ww-button ww-button-outline" onClick={() => copyText(selected.corrected_text || "").then(() => setNotice("Corrected text copied.")).catch((copyError) => setError(copyError.message))}><Clipboard size={15} /> Copy corrected text</button></section></div>}
    </div>
  );
}
