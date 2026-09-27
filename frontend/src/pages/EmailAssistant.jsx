import { AlertCircle, Clipboard, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { api } from "../api";
import EmptyState from "../components/EmptyState";
import { copyText, unwrapAnalysis } from "../utils";

export default function EmailAssistant() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function correctEmail(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError("Paste the email you want corrected.");
      return;
    }
    setLoading(true);
    try {
      setResult(unwrapAnalysis(await api.analyze(email.trim(), "Email")));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function copyEmail() {
    try {
      await copyText(result.corrected_text || "");
      setNotice("Corrected email copied.");
    } catch (copyError) {
      setError(copyError.message);
    }
  }

  return (
    <div className="ww-page">
      <header className="ww-page-heading"><div><span className="ww-kicker">EMAIL ASSISTANT</span><h2>Correct an email without changing its intent.</h2><p>Paste an email to check its grammar, spelling, and punctuation.</p></div><span className="ww-heading-badge"><Mail size={15} /> Email review</span></header>
      {error && <div className="ww-alert ww-alert-error" role="alert"><AlertCircle size={17} />{error}</div>}
      {notice && <div className="ww-alert ww-alert-success" role="status">{notice}</div>}
      <div className="ww-two-column">
        <form className="ww-panel ww-form ww-tool-form" onSubmit={correctEmail}>
          <div><label htmlFor="email-to-correct">Email text</label><textarea id="email-to-correct" className="ww-resume-input" maxLength={15000} value={email} onChange={(event) => { setEmail(event.target.value); setResult(null); }} placeholder="Paste the full email here, including its subject and greeting." required /></div>
          <div className="ww-form-bottom"><span>{email.length.toLocaleString()} / 15,000 characters</span><button className="ww-button ww-button-primary" type="submit" disabled={loading || !email.trim()}><Sparkles size={16} />{loading ? "Checking email…" : "Correct email"}</button></div>
        </form>
        <section className="ww-panel ww-output-panel">
          <div className="ww-panel-header"><div><span className="ww-kicker">CORRECTED EMAIL</span><h3>Corrected version</h3></div>{result?.corrected_text && <button className="ww-text-action" onClick={copyEmail}><Clipboard size={14} /> Copy</button>}</div>
          {loading ? <div className="ww-result-loading"><span className="ww-spinner" /><p>Checking grammar and spelling…</p></div> : result ? <><pre className="ww-email-output">{result.corrected_text || "No corrected email was returned."}</pre>{result.ai_available === false && <div className="ww-alert ww-alert-warning">Ollama is unavailable. Only basic grammar and spelling checks were applied; review the email carefully.</div>}{result.mistakes?.length ? <div className="ww-result-section"><h4>Corrections made</h4>{result.mistakes.map((item, index) => <p className="ww-suggestion" key={index}><b>{item.original}</b> → <b>{item.correction}</b><br />{item.explanation}</p>)}</div> : <p className="ww-api-note">No grammar or spelling issues were detected.</p>}{!!result.suggestions?.length && <div className="ww-result-section"><h4><Sparkles size={15} /> Feedback</h4>{result.suggestions.map((item, index) => <p className="ww-suggestion" key={index}>{typeof item === "string" ? item : item.suggestion || item.reason}</p>)}</div>}</> : <EmptyState icon={Mail} title="Your corrected email will appear here">Paste your email to get a corrected version and writing feedback.</EmptyState>}
        </section>
      </div>
    </div>
  );
}
