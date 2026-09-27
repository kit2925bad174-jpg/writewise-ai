import {
  ArrowRight,
  BookOpenCheck,
  Check,
  FileText,
  Mail,
  MessageSquareText,
  PenLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { icon: PenLine, title: "Writing feedback", text: "Get clear grammar, spelling, and punctuation feedback on your writing." },
  { icon: MessageSquareText, title: "Understand each edit", text: "See concise explanations that help you learn the rule, not just fix a sentence." },
  { icon: BookOpenCheck, title: "Practice with purpose", text: "Use mistakes from your writing as a starting point for grammar practice." },
  { icon: Sparkles, title: "Rewrite thoughtfully", text: "Compare style variations returned by the local writing-analysis model." },
  { icon: Mail, title: "Email drafting", text: "Shape an email draft and refine its wording with writing feedback." },
  { icon: FileText, title: "Resume polishing", text: "Make resume wording clearer and more professional while keeping your details." },
];

export default function Home() {
  return (
    <div className="ww-home">
      <header className="ww-landing-nav ww-container">
        <Link className="ww-brand" to="/">
          <span className="ww-brand-mark"><Sparkles size={20} /></span>
          <span><strong>WriteWise</strong><small>AI writing studio</small></span>
        </Link>
        <nav>
          <a href="#features">Features</a>
          <Link to="/login">Log in</Link>
          <Link className="ww-button ww-button-primary" to="/register">Get started <ArrowRight size={16} /></Link>
        </nav>
      </header>

      <main>
        <section className="ww-hero ww-container">
          <div className="ww-hero-copy">
            <span className="ww-kicker"><Sparkles size={14} /> LOCAL AI WRITING COACH</span>
            <h1>Write with clarity.<br /><em>Grow with confidence.</em></h1>
            <p>Improve grammar, understand your edits, and build stronger writing habits — with a private assistant powered by your local Ollama setup.</p>
            <div className="ww-hero-actions">
              <Link className="ww-button ww-button-primary ww-button-large" to="/register">Start writing <ArrowRight size={17} /></Link>
              <Link className="ww-button ww-button-quiet ww-button-large" to="/login">I already have an account</Link>
            </div>
            <div className="ww-privacy-line"><ShieldCheck size={16} /> Your text goes to your local FastAPI + Ollama setup.</div>
          </div>

          <div className="ww-preview" aria-label="Writing assistant preview">
            <div className="ww-preview-top"><span><i /> YOUR WRITING SESSION</span><span className="ww-preview-pill">General</span></div>
            <div className="ww-preview-label">ORIGINAL</div>
            <p className="ww-preview-original">I went to college <mark>tomorrow</mark></p>
            <div className="ww-preview-divider"><span><Sparkles size={14} /> Suggested correction</span></div>
            <p className="ww-preview-corrected">I <strong>will go</strong> to college tomorrow.</p>
            <div className="ww-preview-note"><Check size={15} /> Tense matches the future time expression.</div>
            <div className="ww-preview-score"><span>Writing feedback</span><span>Grammar <b>↗</b></span></div>
          </div>
        </section>

        <section className="ww-trust-strip">
          <div className="ww-container"><span>BUILT FOR PRACTICE, NOT JUST CORRECTION</span><span>FastAPI <b>·</b> SQLite <b>·</b> Ollama <b>·</b> React</span></div>
        </section>

        <section id="features" className="ww-features ww-container">
          <div className="ww-section-heading">
            <span className="ww-kicker">A BETTER WAY TO WRITE</span>
            <h2>Tools for every step<br />of your writing process.</h2>
            <p>Get helpful feedback, learn from it, and keep your writing moving.</p>
          </div>
          <div className="ww-feature-grid">
            {features.map(({ icon: Icon, title, text }) => (
              <article className="ww-feature" key={title}>
                <span><Icon size={20} /></span><h3>{title}</h3><p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="ww-cta ww-container">
          <div><span className="ww-kicker">YOUR NEXT DRAFT STARTS HERE</span><h2>Make every sentence a little stronger.</h2></div>
          <Link className="ww-button ww-button-light" to="/register">Create your account <ArrowRight size={17} /></Link>
        </section>
      </main>

      <footer className="ww-landing-footer ww-container">
        <Link className="ww-brand" to="/"><span className="ww-brand-mark"><Sparkles size={18} /></span><span><strong>WriteWise</strong><small>Local AI writing assistant</small></span></Link>
        <span>Built to help you learn as you write.</span>
        <div><Link to="/login">Log in</Link><Link to="/register">Get started</Link></div>
      </footer>
    </div>
  );
}
