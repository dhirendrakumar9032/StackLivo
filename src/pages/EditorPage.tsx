import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SandpackProvider } from "@codesandbox/sandpack-react";
import { aquaBlue } from "@codesandbox/sandpack-themes";

import { useProjects } from "@/entities/project/model/ProjectsContext";
import {
  createProjectSlug,
  findProjectByRouteParam,
  getProjectEditorPath,
} from "@/entities/project/model/projectRoutes";
import { normalizeProjectType, PROJECT_TYPES } from "@/entities/project/model/projectTemplates";
import EditorWorkspace from "@/features/editor/components/EditorWorkspace";
import {
  resolveActiveFile,
  resolveEntryFile,
} from "@/features/editor/lib/editorFiles";

export default function EditorPage() {
  const { projectSlug } = useParams();
  const navigate = useNavigate();

  const {
    projects,
    updateProject,
    saveEditorSnapshot,
    addProjectDependency,
  } = useProjects();

  const project = findProjectByRouteParam(projects, projectSlug);
  const projectType = normalizeProjectType(project?.type);
  const activeFile = project ? resolveActiveFile(project.files, project.activeFile) : "/src/App.jsx";
  const entryFile = project ? resolveEntryFile(project.files) : "/src/App.jsx";
  const projectPath = project ? getProjectEditorPath(project) : "";

  const onRenameProject = useCallback(
    (name) => {
      if (!project) {
        return;
      }

      updateProject(project.id, { name });
      navigate(getProjectEditorPath({ ...project, name }), { replace: true });
    },
    [navigate, project, updateProject]
  );

  const onSnapshotChange = useCallback(
    (snapshot) => {
      if (project) {
        saveEditorSnapshot(project.id, snapshot);
      }
    },
    [project, saveEditorSnapshot]
  );

  const onAddDependency = useCallback(
    (packageName, packageVersion) => {
      if (project) {
        addProjectDependency(project.id, packageName, packageVersion);
      }
    },
    [project, addProjectDependency]
  );

  /**
   * Prevent Sandpack from reinitializing
   * on every parent re-render.
   */
  const sandpackFiles = useMemo(() => {
    return project?.files || {};
  }, [project?.files]);

  const sandpackOptions = useMemo(
    () => ({
      activeFile,
      recompileMode: "delayed" as const,
      recompileDelay: 500,
    }),
    [activeFile]
  );

  const customSetup = useMemo(
    () => ({
      entry: entryFile,
      environment: projectType === PROJECT_TYPES.REACT ? ("create-react-app" as const) : ("static" as const),
      dependencies: projectType === PROJECT_TYPES.REACT ? project?.dependencies || {} : {},
    }),
    [entryFile, project?.dependencies, projectType]
  );

  useEffect(() => {
    if (!project) {
      return;
    }

    if (projectSlug !== createProjectSlug(project.name)) {
      navigate(projectPath, { replace: true });
    }
  }, [navigate, project, projectPath, projectSlug]);

  if (!project) {
    return (
      <main className="not-found">
        <h1>Project not found</h1>

        <p>Go back and create a new React application.</p>

        <button
          className="button primary"
          type="button"
          onClick={() => navigate("/")}
        >
          Go to Projects
        </button>
      </main>
    );
  }

  return (
    <SandpackProvider
      key={project.id}
      files={sandpackFiles}
      theme={aquaBlue}
      options={sandpackOptions}
      customSetup={customSetup}
    >
      <EditorWorkspace
        projectName={project.name}
        projectType={projectType}
        projectDependencies={project.dependencies || {}}
        onRenameProject={onRenameProject}
        onSnapshotChange={onSnapshotChange}
        onAddDependency={onAddDependency}
      />
    </SandpackProvider>
  );
}
