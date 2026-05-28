import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SandpackProvider } from "@codesandbox/sandpack-react";
import { aquaBlue } from "@codesandbox/sandpack-themes";

import { useAuth } from "@/entities/auth/model/AuthContext";
import { useProjects } from "@/entities/project/model/ProjectsContext";
import { removeDuplicateBoilerplateFiles } from "@/entities/project/model/projectStore";
import {
  findProjectByRouteParam,
  getProjectEditorPath,
  getProjectRouteKey,
  getProjectPreviewPath,
} from "@/entities/project/model/projectRoutes";
import { normalizeProjectType, PROJECT_TYPES } from "@/entities/project/model/projectTemplates";
import EditorWorkspace from "@/features/editor/components/EditorWorkspace";
import { getCodingQuestionById, getCodingQuestionByTitle } from "@/features/questions/model/codingQuestions";
import {
  resolveActiveFile,
  resolveEntryFile,
} from "@/features/editor/lib/editorFiles";

export default function EditorPage() {
  const { projectSlug } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthLoading } = useAuth();

  const {
    projects,
    isProjectsLoading,
    updateProject,
    saveEditorSnapshot,
    addProjectDependency,
  } = useProjects();

  const project = findProjectByRouteParam(projects, projectSlug);
  const projectType = normalizeProjectType(project?.type);
  const projectPath = project ? getProjectEditorPath(project) : "";
  const previewPath = project ? getProjectPreviewPath(project) : "";
  const practiceQuestion = useMemo(
    () => getCodingQuestionById(project?.practiceQuestionId) || getCodingQuestionByTitle(project?.name),
    [project?.name, project?.practiceQuestionId]
  );

  /**
   * Prevent Sandpack from reinitializing
   * on every parent re-render, and ignore duplicate
   * template files that may exist in older saved projects.
   */
  const sandpackFiles = useMemo(() => {
    return removeDuplicateBoilerplateFiles(project?.files || {}, projectType);
  }, [project?.files, projectType]);
  const activeFile = project ? resolveActiveFile(sandpackFiles, project.activeFile) : "/src/App.jsx";
  const entryFile = project ? resolveEntryFile(sandpackFiles) : "/src/App.jsx";

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

    if (projectSlug !== getProjectRouteKey(project)) {
      navigate(projectPath, { replace: true });
    }
  }, [navigate, project, projectPath, projectSlug]);

  if (isAuthLoading || isProjectsLoading) {
    return (
      <main className="not-found">
        <h1>Loading workspace</h1>
        <p>Getting your project from Stacklivo.</p>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="not-found">
        <h1>Login required</h1>
        <p>Sign in to open your saved Stacklivo projects.</p>

        <button
          className="button primary"
          type="button"
          onClick={() => navigate("/login", { state: { from: { pathname: `/editor/${projectSlug || ""}` } } })}
        >
          Login
        </button>
      </main>
    );
  }

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
        practiceQuestion={practiceQuestion}
        previewPath={previewPath}
        onRenameProject={onRenameProject}
        onSnapshotChange={onSnapshotChange}
        onAddDependency={onAddDependency}
      />
    </SandpackProvider>
  );
}
