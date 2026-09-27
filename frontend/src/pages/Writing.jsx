import {
  AlertCircle,
  Check,
  Clipboard,
  FileText,
  Lightbulb,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { api } from "../api";
import EmptyState from "../components/EmptyState";
import ReadAloud from "../components/ReadAloud";
import { copyText, unwrapAnalysis, wordCount } from "../utils";

const modes = ["General", "Academic", "Professional", "Resume", "Email", "Creative", "Interview"];

export default function Writing() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("General");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function analyze(inputText = text) {
    const writing = inputText.trim();
    if (!writing) {
      setError("Add some writing before you analyze it.");
      return;
    }
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const result = unwrapAnalysis(await api.analyze(writing, mode));
      setAnalysis(result);
      localStorage.setItem("writewise_last_mistakes", JSON.stringify(result.mistakes || []));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function changeText(value) {
    setText(value.slice(0, 5000));
    setAnalysis(null);
    setError("");
    setNotice("");
  }

  async function copyCorrected() {
    try {
      await copyText(analysis.corrected_text || "");
      setNotice("Corrected writing copied.");
    } catch (copyError) {
      setError(copyError.message);
    }
  }

  const sentences = text.trim() ? (text.trim().match(/[.!?]+(?=\s|$)|[^.!?]+$/g) || []).length : 0;
  const scoreItems = [
    ["Grammar", analysis?.grammar],
    ["Spelling", analysis?.spelling],
    ["Punctuation", analysis?.punctuation],
    ["Clarity", analysis?.clarity],
    ["Vocabulary", analysis?.vocabulary],
  ];

  return (
    <div className="ww-page">
      <header className="ww-page-heading">
        <div><span className="ww-kicker">WRITE · REVIEW · LEARN</span><h2>Your writing, with useful feedback.</h2><p>Analyze a draft and see what to improve — with explanations for each detected mistake.</p></div>
        <span className="ww-heading-badge"><Sparkles size={15} /> Local AI</span>
      </header>

      {error && <div className="ww-alert ww-alert-error" role="alert"><AlertCircle size={17} />{error}</div>}
      {notice && <div className="ww-alert ww-alert-success" role="status"><Check size={17} />{notice}</div>}

      <div className="ww-writing-grid">
        <section className="ww-panel ww-editor-panel">
          <div className="ww-panel-header">
            <div><span className="ww-kicker">YOUR DRAFT</span><h3>Writing editor</h3></div>
            <label className="ww-mode-picker">Mode
              <select value={mode} onChange={(event) => setMode(event.target.value)} aria-label="Writing mode">
                {modes.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <textarea
            className="ww-writing-input"
            value={text}
            maxLength={5000}
            onChange={(event) => changeText(event.target.value)}
            placeholder="I went to college tomorrow"
            aria-label="Writing to analyze"
          />
          <div className="ww-editor-meta"><span>{wordCount(text)} words · {sentences} sentences</span><span>{text.length.toLocaleString()} / 5,000 characters</span></div>
          <div className="ww-editor-toolbar">
            <div className="ww-inline-actions">
              <ReadAloud text={text} onError={setError} />
            </div>
            <div className="ww-inline-actions">
              <button className="ww-button ww-button-quiet" type="button" onClick={() => { setText(""); setAnalysis(null); setError(""); setNotice(""); }}><RotateCcw size={15} /> Clear</button>
              <button className="ww-button ww-button-outline" type="button" disabled={!text.trim()} onClick={() => copyText(text).then(() => setNotice("Draft copied.")).catch((copyError) => setError(copyError.message))}><Clipboard size={15} /> Copy</button>
              <button className="ww-button ww-button-primary" type="button" onClick={() => analyze()} disabled={loading || !text.trim()}><Sparkles size={16} />{loading ? "Analyzing…" : "Analyze writing"}</button>
            </div>
          </div>
        </section>

        <section className="ww-panel ww-result-panel">
          {loading ? (
            <div className="ww-result-loading"><span className="ww-spinner" /><h3>Reviewing your draft</h3><p>Your text is being analyzed by the local FastAPI and Ollama service.</p></div>
          ) : analysis ? (
            <>
              <div className="ww-panel-header"><div><span className="ww-kicker">ANALYSIS</span><h3>Writing feedback</h3></div><div className="ww-score"><strong>{analysis.score ?? "—"}</strong><small>/100</small></div></div>
              {analysis.ai_available === false && <div className="ww-alert ww-alert-warning">Ollama is unavailable; the backend used its basic deterministic checks.</div>}
              <p className="ww-summary">{analysis.summary || "Analysis complete."}</p>
              <div className="ww-score-list">
                {scoreItems.map(([label, value]) => (
                  <div className="ww-score-row" key={label}><span>{label}</span><div className="ww-meter"><i style={{ width: `${Math.max(0, Math.min(100, Number(value) || 0))}%` }} /></div><strong>{Number.isFinite(Number(value)) ? `${value}%` : "—"}</strong></div>
                ))}
              </div>
              <div className="ww-corrected-block"><div className="ww-result-title"><h4><Check size={16} /> Corrected version</h4><button className="ww-text-action" onClick={copyCorrected}><Clipboard size={14} /> Copy</button></div><p>{analysis.corrected_text || "No corrected text was returned."}</p></div>
              {!!analysis.mistakes?.length && (
                <div className="ww-result-section"><h4><AlertCircle size={16} /> Detected mistakes <span>{analysis.mistakes.length}</span></h4>
                  {analysis.mistakes.map((mistake, index) => (
                    <article className="ww-mistake" key={`${mistake.original}-${index}`}><div className="ww-mistake-line"><del>{mistake.original}</del><span>→</span><strong>{mistake.correction}</strong><small>{mistake.type || "Writing"}</small></div><p>{mistake.explanation}</p>{mistake.rule && <small className="ww-rule"><b>Rule:</b> {mistake.rule}</small>}{mistake.example && <small className="ww-rule"><b>Example:</b> {mistake.example}</small>}</article>
                  ))}
                </div>
              )}
              {!!analysis.suggestions?.length && <div className="ww-result-section"><h4><Lightbulb size={16} /> Suggestions</h4>{analysis.suggestions.map((item, index) => <p className="ww-suggestion" key={index}>{typeof item === "string" ? item : item.suggestion || item.reason}</p>)}</div>}
              {!!analysis.strengths?.length && <div className="ww-result-section"><h4>What’s working well</h4><ul>{analysis.strengths.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
              <div className="ww-detail-grid">
                {analysis.readability && <div className="ww-detail-card"><span>Readability</span><strong>{analysis.readability.level || "—"}</strong><small>{analysis.readability.word_count ?? wordCount(text)} words · {analysis.readability.sentence_count ?? sentences} sentences</small></div>}
                {analysis.filler_words?.length > 0 && <div className="ww-detail-card"><span>Filler words</span><strong>{analysis.filler_words.map((item) => `${item.word} (${item.count})`).join(", ")}</strong></div>}
                {analysis.repeated_phrases?.length > 0 && <div className="ww-detail-card"><span>Repeated phrases</span><strong>{analysis.repeated_phrases.map((item) => item.phrase || item).join(", ")}</strong></div>}
              </div>
              {!!analysis.sentence_analysis?.length && <details className="ww-details"><summary>Sentence-level review</summary>{analysis.sentence_analysis.map((item, index) => <p key={index}><b>Sentence {item.number || index + 1} · {item.quality || "Reviewed"}</b><br />{item.text || item.sentence}</p>)}</details>}
            </>
          ) : (
            <EmptyState icon={FileText} title="Your feedback will appear here">Add a draft and choose <b>Analyze writing</b> to get corrections, scores, and explanations from your backend.</EmptyState>
          )}
        </section>
      </div>
    </div>
  );
}
