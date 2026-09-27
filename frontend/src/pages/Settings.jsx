import { AlertCircle, CheckCircle2, Database, Moon, RefreshCw, Server, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api";
import { getLocalUser } from "../utils";

function Status({ online }) {
  return <span className={`ww-status${online ? " online" : " offline"}`}><i />{online ? "Online" : "Offline"}</span>;
}

export default function Settings() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [clearing, setClearing] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === "dark");

  async function checkHealth() {
    setLoading(true);
    setError("");
    try {
      const result = await api.health();
      if (!result || typeof result !== "object") throw new Error("The backend returned an invalid health response.");
      setHealth(result);
    } catch (requestError) {
      setHealth(null);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkHealth();
    const updateTheme = (event) => setDark(event.detail === "dark");
    window.addEventListener("writewise-theme-change", updateTheme);
    return () => window.removeEventListener("writewise-theme-change", updateTheme);
  }, []);

  async function clearHistory() {
    if (!window.confirm("Delete all saved writing analyses? This cannot be undone.")) return;
    setClearing(true);
    setError("");
    setNotice("");
    try {
      const result = await api.clearHistory();
      if (!result?.success) throw new Error("The backend did not confirm that history was cleared.");
      localStorage.removeItem("writewise_last_mistakes");
      setNotice("Your writing history was cleared.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="ww-page">
      <header className="ww-page-heading"><div><span className="ww-kicker">PREFERENCES & STATUS</span><h2>Settings for your workspace.</h2><p>Manage appearance, check local services, and clear saved analysis data.</p></div><button className="ww-button ww-button-outline" onClick={checkHealth} disabled={loading}><RefreshCw size={15} /> Check services</button></header>
      {error && <div className="ww-alert ww-alert-error" role="alert"><AlertCircle size={17} />{error}</div>}
      {notice && <div className="ww-alert ww-alert-success" role="status"><CheckCircle2 size={17} />{notice}</div>}
      <section className="ww-panel ww-settings-panel">
        <div className="ww-panel-header"><div><span className="ww-kicker">APPEARANCE</span><h3>Theme</h3></div><Moon size={18} /></div>
        <div className="ww-setting-row"><div><strong>{dark ? "Dark mode" : "Light mode"}</strong><p>Use the theme control in the top bar to switch appearance. Your selection is saved in this browser.</p></div><span className="ww-setting-value">{dark ? "Dark" : "Light"}</span></div>
      </section>
      <section className="ww-panel ww-settings-panel">
        <div className="ww-panel-header"><div><span className="ww-kicker">LOCAL SERVICES</span><h3>Connection status</h3></div><Sparkles size={18} /></div>
        {loading ? <p className="ww-muted">Checking FastAPI, database, and Ollama…</p> : <div className="ww-service-list">
          <div className="ww-service-row"><span className="ww-service-icon"><Server size={17} /></span><span><strong>FastAPI backend</strong><small>http://127.0.0.1:8000</small></span><Status online={health?.backend === "online"} /></div>
          <div className="ww-service-row"><span className="ww-service-icon"><Database size={17} /></span><span><strong>Database</strong><small>Saved writing history and account data</small></span><Status online={health?.database?.online === true} /></div>
          <div className="ww-service-row"><span className="ww-service-icon"><Sparkles size={17} /></span><span><strong>Ollama</strong><small>{health?.ollama?.model || health?.model || "Local model status"}</small></span><Status online={health?.ollama?.online === true} /></div>
        </div>}
        {health?.ollama?.online && <p className="ww-chart-caption">Installed models: {health.ollama.installed_models?.length ? health.ollama.installed_models.join(", ") : "No installed models reported."}</p>}
        {!health && !loading && <p className="ww-chart-caption">Start FastAPI and ensure Ollama is available to see service status.</p>}
      </section>
      <section className="ww-panel ww-settings-panel">
        <div className="ww-panel-header"><div><span className="ww-kicker">DATA & ACCOUNT</span><h3>Account and saved writing</h3></div></div>
        <div className="ww-setting-row"><div><strong>{getLocalUser()?.name || "Signed-in account"}</strong><p>{getLocalUser()?.email || "Your authenticated WriteWise profile"}</p></div><span className="ww-setting-value">Signed in</span></div>
        <div className="ww-setting-row"><div><strong>Clear writing history</strong><p>Remove all saved analysis records from your backend history.</p></div><button className="ww-button ww-button-danger-outline" onClick={clearHistory} disabled={clearing}><Trash2 size={15} />{clearing ? "Clearing…" : "Clear history"}</button></div>
      </section>
      <div className="ww-alert ww-alert-info">Your frontend communicates with FastAPI only. AI requests are handled by the backend and local Ollama; the browser never contacts Ollama directly.</div>
    </div>
  );
}
