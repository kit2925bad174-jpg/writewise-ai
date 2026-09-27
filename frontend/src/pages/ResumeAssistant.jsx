import { AlertCircle, Clipboard, FileText, Sparkles, Target } from "lucide-react";
import { useState } from "react";
import { api } from "../api";
import EmptyState from "../components/EmptyState";
import { copyText, unwrapAnalysis } from "../utils";

export default function ResumeAssistant() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadResume(event) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setError("");
    setNotice("");
    setResult(null);
    setUploading(true);
    try {
      const response = await api.extractResume(file);
      if (!response?.success || !response.text?.trim()) {
        throw new Error("The backend could not extract text from this resume.");
      }
      setText(response.text);
      setFileName(response.filename || file.name);
      setNotice("Resume text loaded. Review it below, then check for errors.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  async function checkResume(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!text.trim()) {
      setError("Paste resume text or upload a resume file first.");
      return;
    }
    setLoading(true);
    try {
      setResult(unwrapAnalysis(await api.analyze(text.trim(), "Resume")));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function copyCorrectedResume() {
    try {
      await copyText(result.corrected_text || "");
      setNotice("Corrected resume copied.");
    } catch (copyError) {
      setError(copyError.message);
    }
  }

  return (
    <div className="ww-page">
      <header className="ww-page-heading"><div><span className="ww-kicker">RESUME REVIEW</span><h2>Check your resume before you send it.</h2><p>Find grammar and spelling issues, review a corrected copy, and get writing feedback.</p></div><span className="ww-heading-badge"><Target size={15} /> Resume review</span></header>
      {error && <div className="ww-alert ww-alert-error" role="alert"><AlertCircle size={17} />{error}</div>}
      {notice && <div className="ww-alert ww-alert-success" role="status">{notice}</div>}
      <div className="ww-two-column">
        <form className="ww-panel ww-form ww-tool-form" onSubmit={checkResume}>
          <div className="ww-resume-file"><label htmlFor="resume-file">Upload a resume file</label><input id="resume-file" type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={loadResume} disabled={uploading || loading} /><small>{uploading ? "Reading resume…" : fileName || "PDF, DOCX, or TXT · up to 5 MB"}</small></div>
          <div><label htmlFor="resume-text">Or paste resume text</label><textarea id="resume-text" className="ww-resume-input" maxLength={15000} value={text} onChange={(event) => { setText(event.target.value); setFileName(""); setResult(null); }} placeholder="Paste the resume you want checked. Its content and meaning will be preserved." /></div>
          <div className="ww-form-bottom"><span>{text.length.toLocaleString()} / 15,000 characters</span><button className="ww-button ww-button-primary" type="submit" disabled={loading || uploading || !text.trim()}><Sparkles size={16} />{loading ? "Checking resume…" : "Check resume"}</button></div>
          <small className="ww-form-footnote">Files are read for this review and are not saved as uploads. Scanned PDFs need OCR before checking.</small>
        </form>
        <section className="ww-panel ww-output-panel">
          <div className="ww-panel-header"><div><span className="ww-kicker">CORRECTED RESUME</span><h3>Corrected version</h3></div>{result?.corrected_text && <button className="ww-text-action" onClick={copyCorrectedResume}><Clipboard size={14} /> Copy</button>}</div>
          {loading ? <div className="ww-result-loading"><span className="ww-spinner" /><p>Checking resume grammar and spelling…</p></div> : result ? <><pre className="ww-email-output">{result.corrected_text || "No corrected resume text was returned."}</pre>{result.ai_available === false && <div className="ww-alert ww-alert-warning">Ollama is unavailable. Only basic writing checks were applied; review the resume carefully.</div>}{result.mistakes?.length ? <div className="ww-result-section"><h4>Corrections made</h4>{result.mistakes.map((item, index) => <p className="ww-suggestion" key={index}><b>{item.original}</b> → <b>{item.correction}</b><br />{item.explanation}</p>)}</div> : <p className="ww-api-note">No grammar or spelling issues were detected.</p>}<div className="ww-result-section"><h4><Sparkles size={15} /> Feedback</h4>{result.summary && <p className="ww-suggestion">{result.summary}</p>}{result.suggestions?.map((item, index) => <p className="ww-suggestion" key={index}>{typeof item === "string" ? item : item.suggestion || item.reason}</p>)}</div></> : <EmptyState icon={FileText} title="Your resume review will appear here">Upload a PDF, DOCX, or TXT file, or paste resume text to check grammar and spelling.</EmptyState>}
        </section>
      </div>
    </div>
  );
}
