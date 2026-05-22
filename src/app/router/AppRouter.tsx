import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "@/app/layout/AppShell";
import EditorPage from "@/pages/EditorPage";
import LoginPage from "@/pages/LoginPage";
import ProjectsPage from "@/pages/ProjectsPage";
import SavedProjectsPage from "@/pages/SavedProjectsPage";
import SignupPage from "@/pages/SignupPage";

const PreviewPage = lazy(() => import("@/pages/PreviewPage"));

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<ProjectsPage />} />
        <Route path="/projects" element={<SavedProjectsPage />} />
        <Route path="/editor/:projectSlug" element={<EditorPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
      <Route
        path="/preview/:projectSlug"
        element={
          <Suspense fallback={<main className="standalone-preview-page" />}>
            <PreviewPage />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
