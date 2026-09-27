export function getLocalUser() {
  try {
    return JSON.parse(localStorage.getItem("writewise_user") || "null");
  } catch {
    return null;
  }
}

export function unwrapAnalysis(response) {
  const analysis = response?.analysis;
  if (!response?.success || !analysis || typeof analysis !== "object") {
    throw new Error("The backend returned an invalid writing analysis.");
  }
  return analysis;
}

export function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export async function copyText(text) {
  if (!navigator.clipboard?.writeText) {
    throw new Error("Copying is not available in this browser.");
  }
  await navigator.clipboard.writeText(text);
}
