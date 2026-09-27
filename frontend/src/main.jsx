import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./App.css";

const initialTheme = localStorage.getItem("writewise_theme") === "dark" ? "dark" : "light";
document.documentElement.dataset.theme = initialTheme;
document.querySelector('meta[name="theme-color"]')?.setAttribute(
  "content",
  initialTheme === "dark" ? "#121225" : "#f6f4ff",
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
