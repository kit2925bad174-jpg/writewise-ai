import { Sparkles } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="ww-loading" role="status">
      <span className="ww-loading-mark">
        <Sparkles size={24} />
      </span>
      <strong>Preparing your workspace</strong>
      <span>WriteWise AI</span>
    </div>
  );
}
