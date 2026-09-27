import { AlertCircle, Clipboard, FilePenLine, Sparkles } from "lucide-react";
import { useState } from "react";
import { api } from "../api";
import EmptyState from "../components/EmptyState";
import { copyText, unwrapAnalysis } from "../utils";

const styles = [
  ["professional", "Professional"],
  ["simple", "Simple"],
  ["concise", "Concise"],
  ["confident", "Confident"],
  ["creative", "Creative"],
];

export default function Rewriter() {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function rewrite(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!text.trim()) {
      setError("Enter the text you want to rewrite.");
      return;
    }
    setLoading(true);
    try {
      setAnalysis(unwrapAnalysis(await api.analyze(text.trim(), "General")));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function copy(value) {
    try {
      await copyText(value);
      setNotice("Rewrite copied to clipboard.");
    } catch (copyError) {
      setError(copyError.message);
    }
  }

  return (
    <div className="ww-page">
      <header className="ww-page-heading"><div><span className="ww-kicker">REFINE YOUR MESSAGE</span><h2>Find a style that sounds like you.</h2><p>Compare the rewrite variations returned by your writing analysis service.</p></div><span className="ww-heading-badge"><FilePenLine size={15} /> Rewrite studio</span></header>
      {error && <div className="ww-alert ww-alert-error" role="alert"><AlertCircle size={17} />{error}</div>}
      {notice && <div className="ww-alert ww-alert-success" role="status">{notice}</div>}
      <form className="ww-panel ww-rewrite-form" onSubmit={rewrite}>
        <label htmlFor="rewrite-text">Text to rewrite</label>
        <textarea id="rewrite-text" value={text} maxLength={5000} onChange={(event) => { setText(event.target.value); setAnalysis(null); }} placeholder="Paste a paragraph, email, or sentence you would like to improve." />
        <div className="ww-form-bottom"><span>{text.length} / 5,000 characters</span><button className="ww-button ww-button-primary" type="submit" disabled={loading || !text.trim()}><Sparkles size={16} />{loading ? "Rewriting…" : "Generate variations"}</button></div>
      </form>
      {analysis?.ai_available === false && <div className="ww-alert ww-alert-warning">Ollama is unavailable. The backend has returned its basic corrected text; style variations may be identical.</div>}
      {analysis ? (
        <div className="ww-rewrite-results">
          {styles.map(([key, label]) => {
            const value = analysis.rewrite_options?.[key] || "";
            return <article className="ww-panel ww-rewrite-card" key={key}><div className="ww-rewrite-card-head"><span className="ww-rewrite-label">{label}</span><button className="ww-text-action" disabled={!value} onClick={() => copy(value)}><Clipboard size={14} /> Copy</button></div><p>{value || "No variation was returned for this style."}</p></article>;
          })}
          {analysis.corrected_text && <article className="ww-panel ww-rewrite-card ww-corrected-card"><div className="ww-rewrite-card-head"><span className="ww-rewrite-label">Corrected version</span><button className="ww-text-action" onClick={() => copy(analysis.corrected_text)}><Clipboard size={14} /> Copy</button></div><p>{analysis.corrected_text}</p></article>}
        </div>
      ) : !loading && <section className="ww-panel"><EmptyState icon={FilePenLine} title="No rewrites yet">Enter some writing above. Variations are supplied by the local analysis endpoint; no external AI service is used.</EmptyState></section>}
      {loading && <section className="ww-panel ww-result-loading"><span className="ww-spinner" /><h3>Preparing style variations</h3><p>Waiting for your local backend.</p></section>}
    </div>
  );
}
