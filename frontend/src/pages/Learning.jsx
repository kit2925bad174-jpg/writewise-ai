import { AlertCircle, ArrowRight, BookOpenCheck, CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { api } from "../api";
import EmptyState from "../components/EmptyState";
import learningIllustration from "../assets/learning-illustration.svg";

function getStoredMistakes() {
  try {
    const value = JSON.parse(localStorage.getItem("writewise_last_mistakes") || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export default function Learning() {
  const [practice, setPractice] = useState(null);
  const [selected, setSelected] = useState("");
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const seenQuestions = useRef(new Set());

  async function generate() {
    setError("");
    setLoading(true);
    try {
      const response = await api.practice(getStoredMistakes(), [...seenQuestions.current]);
      if (!response?.success || !Array.isArray(response.questions) || !response.questions[0]?.options) {
        throw new Error("The learning endpoint returned an invalid practice question.");
      }
      const nextQuestion = response.questions[0];
      if (response.round_complete) seenQuestions.current.clear();
      seenQuestions.current.add(nextQuestion.id);
      setPractice(response);
      setSelected("");
      setChecked(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  const question = practice?.questions?.[0];
  const correct = checked && selected === question?.answer;

  return (
    <div className="ww-page">
      <header className="ww-page-heading"><div><span className="ww-kicker">LEARN BY PRACTICING</span><h2>Turn a writing rule into a skill.</h2><p>Practice questions come from the backend learning service and can use mistakes from your latest analysis.</p></div><span className="ww-heading-badge"><BookOpenCheck size={15} /> Learning</span></header>
      {error && <div className="ww-alert ww-alert-error" role="alert"><AlertCircle size={17} />{error}</div>}
      <section className="ww-learning-intro"><span><Sparkles size={20} /></span><div><strong>Personalized practice</strong><p>Analyze writing first to give the practice generator relevant mistake types. Work through a fresh set of questions on grammar, spelling, tense, punctuation, and more.</p></div><img className="ww-learning-art" src={learningIllustration} alt="" /></section>
      {!question ? (
        <section className="ww-panel ww-practice-panel"><EmptyState icon={BookOpenCheck} title="Ready for a quick practice?">Generate a question from the backend. Topics currently available are based on its built-in question bank.</EmptyState><button className="ww-button ww-button-primary" onClick={generate} disabled={loading}><Sparkles size={16} />{loading ? "Loading question…" : "Generate practice question"}</button></section>
      ) : (
        <section className="ww-panel ww-question-panel">
          <div className="ww-question-top"><span className="ww-heading-badge">{practice.topic || "Writing"} practice</span><button className="ww-button ww-button-outline" onClick={generate} disabled={loading}><RefreshCw size={15} />{loading ? "Loading…" : "Get another question"}</button></div>
          <span className="ww-kicker">{question.type || "CHOOSE THE BEST ANSWER"}</span>
          <h3>{question.question}</h3>
          <div className="ww-answer-list">{question.options.map((option) => <button key={option} className={`ww-answer-option${selected === option ? " selected" : ""}${checked && option === question.answer ? " is-correct" : ""}`} disabled={checked} onClick={() => setSelected(option)}><span>{selected === option ? <CheckCircle2 size={17} /> : <i />}</span>{option}</button>)}</div>
          {!checked ? <button className="ww-button ww-button-primary" onClick={() => setChecked(true)} disabled={!selected}>Check answer <ArrowRight size={16} /></button> : <div className={`ww-practice-feedback${correct ? " correct" : " incorrect"}`}><strong>{correct ? "That’s right." : `The correct answer is: ${question.answer}`}</strong><p>{question.explanation}</p></div>}
        </section>
      )}
    </div>
  );
}
