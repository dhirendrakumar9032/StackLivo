import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import EditorPage from "@/pages/EditorPage";
import ProjectsPage from "@/pages/ProjectsPage";

const PreviewPage = lazy(() => import("@/pages/PreviewPage"));

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<ProjectsPage />} />
      <Route path="/editor/:projectSlug" element={<EditorPage />} />
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
