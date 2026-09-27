import { Square, Volume2 } from "lucide-react";

export default function ReadAloud({ text, onError }) {
  function speak() {
    if (!text.trim()) return;
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      onError?.("Read aloud is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 0.95;
    window.speechSynthesis.speak(speech);
  }

  return (
    <div className="ww-inline-actions">
      <button className="ww-button ww-button-outline" type="button" onClick={speak}><Volume2 size={16} /> Read aloud</button>
      <button className="ww-button ww-button-quiet" type="button" onClick={() => window.speechSynthesis?.cancel()}><Square size={14} /> Stop</button>
    </div>
  );
}
