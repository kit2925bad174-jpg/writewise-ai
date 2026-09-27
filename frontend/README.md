# WriteWise AI

WriteWise AI is a React writing workspace backed by the project's FastAPI service and local Ollama installation. The browser sends requests only to `http://127.0.0.1:8000`; it does not connect to Ollama or a hosted AI provider directly.

## Run locally on Windows

Start the backend from the project root in one PowerShell window:

```powershell
.\backend\venv\Scripts\Activate.ps1
python -m uvicorn backend.main:app --reload --port 8000
```

Start the frontend in a second PowerShell window:

```powershell
Set-Location frontend
npm.cmd install
npm.cmd run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). Confirm Ollama is running and that the backend health response reports the selected local model as online.

Build the production frontend bundle with:

```powershell
Set-Location frontend
npm.cmd run build
```

## Frontend structure

```text
src/
├── App.jsx                  # React Router routes
├── App.css                  # Shared responsive design system
├── api.js                   # Single FastAPI request layer
├── main.jsx                 # BrowserRouter entry point
├── components/              # Shared layout, navigation, and controls
└── pages/                   # Public and protected route pages
```

Protected pages check `writewise_token` in local storage. Successful login, demo login, and registration store the token and returned user object. Logging out clears the session and cached practice context.

## Backend features used

- `POST /auth/login`, `POST /auth/register`, `POST /auth/demo`
- `POST /analyze` for writing analysis, rewrite variations, email drafting, and resume wording
- `GET /history`, `GET /history/{id}`, and `DELETE /history` or `/history/{id}`
- `POST /learning/practice` with mistake data from the latest writing analysis
- `GET /profile` and `GET /health`

The current backend has no dedicated email, resume, profile-update, or practice-answer persistence endpoint. Email and resume tools use the existing analysis route and clearly report when Ollama is unavailable. Profile fields are read-only, and practice questions are evaluated in the browser against the answer returned by the learning endpoint.
