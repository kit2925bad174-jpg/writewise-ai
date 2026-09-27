import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import LoadingScreen from "./components/LoadingScreen";
import ProtectedRoute from "./components/ProtectedRoute";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Writing = lazy(() => import("./pages/Writing"));
const Rewriter = lazy(() => import("./pages/Rewriter"));
const EmailAssistant = lazy(() => import("./pages/EmailAssistant"));
const ResumeAssistant = lazy(() => import("./pages/ResumeAssistant"));
const Learning = lazy(() => import("./pages/Learning"));
const Progress = lazy(() => import("./pages/Progress"));
const History = lazy(() => import("./pages/History"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));

const protectedPages = [
  ["/dashboard", "Dashboard", Dashboard],
  ["/writing", "Writing Assistant", Writing],
  ["/rewriter", "Rewriter", Rewriter],
  ["/email", "Email Assistant", EmailAssistant],
  ["/resume", "Resume Assistant", ResumeAssistant],
  ["/learning", "Learning", Learning],
  ["/progress", "Progress", Progress],
  ["/history", "History", History],
  ["/profile", "Profile", Profile],
  ["/settings", "Settings", Settings],
];

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {protectedPages.map(([path, title, Page]) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute>
                <AppLayout title={title}>
                  <Page />
                </AppLayout>
              </ProtectedRoute>
            }
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
