const API_URL = "http://127.0.0.1:8000";
const REQUEST_TIMEOUT_MS = 20000;
const FILE_EXTRACTION_TIMEOUT_MS = 60000;
const AI_REQUEST_TIMEOUT_MS = 25000;

function getUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("writewise_user") || "null");
    return Number.isInteger(user?.id) && user.id > 0 ? user.id : 1;
  } catch {
    return 1;
  }
}

async function request(path, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    timeoutMs,
  );

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error.name === "AbortError") {
      if (timeoutMs === AI_REQUEST_TIMEOUT_MS) {
        throw new Error(
          "The analysis took longer than 25 seconds. Please try a shorter sentence or check Ollama in Settings.",
        );
      }
      if (timeoutMs === FILE_EXTRACTION_TIMEOUT_MS) {
        throw new Error("Resume file extraction timed out. Check that the backend is running, then try a smaller file.");
      }
      throw new Error("The backend request timed out. Please try again.");
    }
    throw new Error(
      "Unable to connect to the WriteWise AI backend. Please make sure FastAPI is running at http://127.0.0.1:8000.",
    );
  } finally {
    window.clearTimeout(timeout);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      response.ok
        ? "The backend returned an invalid response."
        : `The backend request failed (${response.status}).`,
    );
  }

  if (!response.ok) {
    const detail = data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).filter(Boolean).join(" ")
      : typeof detail === "string"
        ? detail
        : data?.message;
    throw new Error(message || `The backend request failed (${response.status}).`);
  }

  return data;
}

const post = (path, body, timeoutMs) =>
  request(path, { method: "POST", body: JSON.stringify(body) }, timeoutMs);

export const api = {
  baseUrl: API_URL,

  login: (email, password) => post("/auth/login", { email, password }),
  register: (name, email, password) =>
    post("/auth/register", { name, email, password }),
  demoLogin: () => post("/auth/demo", {}),

  analyze: (text, mode = "General", userId = getUserId()) =>
    post("/analyze", { text, mode, user_id: userId }, AI_REQUEST_TIMEOUT_MS),
  extractResume: (file) => {
    const body = new FormData();
    body.append("file", file);
    return request("/resume/extract", { method: "POST", body }, FILE_EXTRACTION_TIMEOUT_MS);
  },

  getHistory: (userId = getUserId()) =>
    request(`/history?user_id=${encodeURIComponent(userId)}`),
  getHistoryItem: (historyId, userId = getUserId()) =>
    request(
      `/history/${encodeURIComponent(historyId)}?user_id=${encodeURIComponent(userId)}`,
    ),
  deleteHistory: (historyId, userId = getUserId()) =>
    request(
      `/history/${encodeURIComponent(historyId)}?user_id=${encodeURIComponent(userId)}`,
      { method: "DELETE" },
    ),
  clearHistory: (userId = getUserId()) =>
    request(`/history?user_id=${encodeURIComponent(userId)}`, {
      method: "DELETE",
    }),

  practice: (mistakes = [], excludedQuestions = []) =>
    post("/learning/practice", { mistakes, excluded_questions: excludedQuestions }),
  getProfile: (userId = getUserId()) =>
    request(`/profile?user_id=${encodeURIComponent(userId)}`),
  health: () => request("/health"),
};

export default api;
