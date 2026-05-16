import { useMemo } from "react";
import * as ReactRuntime from "react";
import * as ReactDOMClientRuntime from "react-dom/client";
import * as JSXRuntime from "react/jsx-runtime";
import { Link, useLocation, useParams } from "react-router-dom";

import { useProjects } from "@/entities/project/model/ProjectsContext";
import { loadProjectPreviewSnapshot } from "@/entities/project/model/projectPreviewSnapshot";
import { findProjectByRouteParam } from "@/entities/project/model/projectRoutes";
import { removeDuplicateBoilerplateFiles } from "@/entities/project/model/projectStore";
import { normalizeProjectType } from "@/entities/project/model/projectTemplates";
import { resolveEntryFile } from "@/features/editor/lib/editorFiles";
import { createStandalonePreviewHtml } from "@/features/preview/lib/createStandalonePreviewHtml";

window.__STACKLIVO_REACT__ = ReactRuntime;
window.__STACKLIVO_REACT_DOM_CLIENT__ = ReactDOMClientRuntime;
window.__STACKLIVO_JSX_RUNTIME__ = JSXRuntime;

export default function PreviewPage() {
  const { projectSlug } = useParams();
  const location = useLocation();
  const { projects } = useProjects();
  const savedPreview = loadProjectPreviewSnapshot(location.pathname);
  const project = savedPreview || findProjectByRouteParam(projects, projectSlug);

  if (!project) {
    return (
      <main className="not-found">
        <h1>Preview not found</h1>
        <p>Go back and open a saved Stacklivo project.</p>
        <Link className="button primary" to="/">
          Go to Projects
        </Link>
      </main>
    );
  }

  const projectType = normalizeProjectType(project.type);
  const previewFiles = removeDuplicateBoilerplateFiles(project.files, projectType);
  const entryFile = resolveEntryFile(previewFiles);
  const previewHtml = useMemo(
    () =>
      createStandalonePreviewHtml({
        files: previewFiles,
        entryFile,
        projectType,
        dependencies: project.dependencies || {},
      }),
    [entryFile, previewFiles, project.dependencies, projectType]
  );

  return (
    <main className="standalone-preview-page">
      <iframe
        className="standalone-preview-frame"
        srcDoc={previewHtml}
        title={`${project.name} preview`}
      />
    </main>
  );
}
