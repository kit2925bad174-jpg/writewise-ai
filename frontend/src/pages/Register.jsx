import { ArrowLeft, ArrowRight, LockKeyhole, Mail, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (form.name.trim().length < 2) {
      setError("Please enter a name with at least 2 characters.");
      return;
    }
    if (!/\p{L}/u.test(form.name) || !/^[\p{L} ]+$/u.test(form.name)) {
      setError("Your name must contain only letters and spaces.");
      return;
    }
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/[0-9]/.test(form.password) || !/[^A-Za-z0-9]/.test(form.password)) {
      setError("Use at least 8 characters with uppercase and lowercase letters, a number, and a special character.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const result = await api.register(form.name.trim(), form.email.trim(), form.password);
      if (!result?.token || !result?.user) {
        throw new Error("The backend returned an incomplete registration response.");
      }
      localStorage.setItem("writewise_token", result.token);
      localStorage.setItem("writewise_user", JSON.stringify(result.user));
      localStorage.removeItem("writewise_last_mistakes");
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
          <span className="ww-kicker">A CALMER WAY TO IMPROVE</span>
          <h1>Practice makes progress. Feedback makes it meaningful.</h1>
          <p>Create your workspace and turn everyday writing into a chance to learn.</p>
          <div className="ww-auth-quote">Your drafts stay in your own WriteWise backend and local AI setup.</div>
        </div>
        <span className="ww-auth-art-foot">Private by design · Powered by local Ollama</span>
      </div>
      <div className="ww-auth-side">
        <div className="ww-auth-form-wrap">
          <div className="ww-mobile-auth-brand"><span className="ww-brand-mark"><Sparkles size={19} /></span><strong>WriteWise AI</strong></div>
          <span className="ww-kicker">GET STARTED</span>
          <h2>Create your account</h2>
          <p className="ww-auth-subtitle">Set up your personal writing workspace.</p>
          {error && <div className="ww-alert ww-alert-error" role="alert">{error}</div>}
          <form className="ww-form" onSubmit={submit}>
            <label htmlFor="register-name">Full name</label>
            <div className="ww-input-icon"><UserRound size={17} /><input id="register-name" autoComplete="name" required minLength={2} value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Your name" /></div>
            <label htmlFor="register-email">Email address</label>
            <div className="ww-input-icon"><Mail size={17} /><input id="register-email" type="email" autoComplete="email" required value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@example.com" /></div>
            <label htmlFor="register-password">Password</label>
            <div className="ww-input-icon"><LockKeyhole size={17} /><input id="register-password" type="password" autoComplete="new-password" required minLength={8} value={form.password} onChange={(event) => update("password", event.target.value)} placeholder="8+ characters, number & symbol" /></div>
            <label htmlFor="register-confirm">Confirm password</label>
            <div className="ww-input-icon"><LockKeyhole size={17} /><input id="register-confirm" type="password" autoComplete="new-password" required value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} placeholder="Enter your password again" /></div>
            <button className="ww-button ww-button-primary ww-button-full" disabled={loading}>{loading ? "Creating account…" : "Create account"} {!loading && <ArrowRight size={16} />}</button>
          </form>
          <p className="ww-auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
