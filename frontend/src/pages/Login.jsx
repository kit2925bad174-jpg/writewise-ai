import { ArrowLeft, ArrowRight, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

function saveSession(result) {
  if (!result?.token || !result?.user) {
    throw new Error("The backend returned an incomplete sign-in response.");
  }
  localStorage.setItem("writewise_token", result.token);
  localStorage.setItem("writewise_user", JSON.stringify(result.user));
  localStorage.removeItem("writewise_last_mistakes");
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api.login(email.trim(), password);
      saveSession(result);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function demoLogin() {
    setError("");
    setLoading(true);
    try {
      const result = await api.demoLogin();
      saveSession(result);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ww-auth-page">
      <div className="ww-auth-art">
        <Link className="ww-back-link" to="/"><ArrowLeft size={16} /> Back to home</Link>
        <div className="ww-auth-art-content">
          <span className="ww-auth-mark"><Sparkles size={23} /></span>
          <span className="ww-kicker">YOUR LOCAL WRITING COACH</span>
          <h1>Thoughtful writing starts with a better question.</h1>
          <p>Understand your edits. Build skills that stay with you.</p>
          <div className="ww-auth-quote">“A good edit doesn’t just improve the sentence. It teaches you how to write the next one.”</div>
        </div>
        <span className="ww-auth-art-foot">Private by design · Powered by local Ollama</span>
      </div>
      <div className="ww-auth-side">
        <div className="ww-auth-form-wrap">
          <div className="ww-mobile-auth-brand"><span className="ww-brand-mark"><Sparkles size={19} /></span><strong>WriteWise AI</strong></div>
          <span className="ww-kicker">WELCOME BACK</span>
          <h2>Sign in to WriteWise</h2>
          <p className="ww-auth-subtitle">Pick up where your writing journey left off.</p>
          {error && <div className="ww-alert ww-alert-error" role="alert">{error}</div>}
          <form className="ww-form" onSubmit={submit}>
            <label htmlFor="login-email">Email address</label>
            <div className="ww-input-icon"><Mail size={17} /><input id="login-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div>
            <label htmlFor="login-password">Password</label>
            <div className="ww-input-icon"><LockKeyhole size={17} /><input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /></div>
            <button className="ww-button ww-button-primary ww-button-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"} {!loading && <ArrowRight size={16} />}</button>
          </form>
          <button className="ww-button ww-button-outline ww-button-full ww-demo-button" onClick={demoLogin} disabled={loading}>Continue with demo account</button>
          <p className="ww-auth-switch">New to WriteWise? <Link to="/register">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}
