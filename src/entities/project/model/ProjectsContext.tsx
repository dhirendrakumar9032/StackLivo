import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { useAuth } from "@/entities/auth/model/AuthContext";
import {
  createProjectOnServer,
  deleteProjectOnServer,
  fetchProjects,
  updateProjectOnServer,
} from "@/entities/project/api/projectsApi";
import {
  createProjectEntity,
  isUserCreatedProject,
  ProjectActionTypes,
  projectsReducer,
} from "@/entities/project/model/projectStore";

const ProjectsContext = createContext(null);

export function ProjectsProvider({ children }) {
  const { currentUser, isAuthLoading } = useAuth();
  const [projects, dispatch] = useReducer(projectsReducer, []);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState("");

  const refreshProjects = useCallback(async () => {
    if (!currentUser) {
      dispatch({
        type: ProjectActionTypes.HYDRATE,
        payload: { projects: [] },
      });
      return [];
    }

    setIsProjectsLoading(true);
    setProjectsError("");

    try {
      const nextProjects = await fetchProjects();
      dispatch({
        type: ProjectActionTypes.HYDRATE,
        payload: { projects: nextProjects },
      });
      return nextProjects;
    } catch (error) {
      setProjectsError(error.message || "Unable to load projects.");
      throw error;
    } finally {
      setIsProjectsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    refreshProjects().catch(() => {});
  }, [isAuthLoading, refreshProjects]);

  const createProject = useCallback(
    async (name, projectType, options = {}) => {
      if (!currentUser) {
        throw new Error("Login required.");
      }

      const existingProjectCount =
        options.practiceQuestionId || options.questionId ? projects.length : projects.filter(isUserCreatedProject).length;
      const draftProject = createProjectEntity(name, existingProjectCount, projectType, {
        ...options,
        ownerId: currentUser.id,
      });
      const project = await createProjectOnServer(draftProject);

      dispatch({
        type: ProjectActionTypes.CREATE,
        payload: { project },
      });

      return project;
    },
    [currentUser, projects]
  );

  const deleteProject = useCallback(async (projectId) => {
    await deleteProjectOnServer(projectId);
    dispatch({
      type: ProjectActionTypes.DELETE,
      payload: { projectId },
    });
  }, []);

  const updateProject = useCallback((projectId, patch) => {
    dispatch({
      type: ProjectActionTypes.UPDATE,
      payload: { projectId, patch },
    });

    updateProjectOnServer(projectId, patch).catch((error) => {
      setProjectsError(error.message || "Unable to update project.");
    });
  }, []);

  const saveEditorSnapshot = useCallback((projectId, snapshot) => {
    dispatch({
      type: ProjectActionTypes.SAVE_SNAPSHOT,
      payload: { projectId, snapshot },
    });

    updateProjectOnServer(projectId, snapshot).catch((error) => {
      setProjectsError(error.message || "Unable to save project.");
    });
  }, []);

  const addProjectDependency = useCallback((projectId, packageName, packageVersion) => {
    let nextDependencies = null;

    dispatch({
      type: ProjectActionTypes.ADD_DEPENDENCY,
      payload: { projectId, packageName, packageVersion },
    });

    const project = projects.find((entry) => entry.id === projectId);

    if (project) {
      nextDependencies = {
        ...(project.dependencies || {}),
        [packageName]: packageVersion,
      };
    }

    if (nextDependencies) {
      updateProjectOnServer(projectId, { dependencies: nextDependencies }).catch((error) => {
        setProjectsError(error.message || "Unable to add package.");
      });
    }
  }, [projects]);

  const value = useMemo(
    () => ({
      projects,
      isProjectsLoading,
      projectsError,
      refreshProjects,
      createProject,
      deleteProject,
      updateProject,
      saveEditorSnapshot,
      addProjectDependency,
    }),
    [
      projects,
      isProjectsLoading,
      projectsError,
      refreshProjects,
      createProject,
      deleteProject,
      updateProject,
      saveEditorSnapshot,
      addProjectDependency,
    ]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectsContext);

  if (!context) {
    throw new Error("useProjects must be used within ProjectsProvider");
  }

  return context;
}
