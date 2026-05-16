import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import {
  createProjectEntity,
  loadProjectsFromStorage,
  persistProjectsToStorage,
  ProjectActionTypes,
  projectsReducer,
} from "@/entities/project/model/projectStore";

const ProjectsContext = createContext(null);

export function ProjectsProvider({ children }) {
  const [projects, dispatch] = useReducer(projectsReducer, undefined, loadProjectsFromStorage);

  useEffect(() => {
    persistProjectsToStorage(projects);
  }, [projects]);

  const createProject = useCallback(
    (name, projectType) => {
      const project = createProjectEntity(name, projects.length, projectType);
      dispatch({
        type: ProjectActionTypes.CREATE,
        payload: { project },
      });

      return project;
    },
    [projects.length]
  );

  const deleteProject = useCallback((projectId) => {
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
  }, []);

  const saveEditorSnapshot = useCallback((projectId, snapshot) => {
    dispatch({
      type: ProjectActionTypes.SAVE_SNAPSHOT,
      payload: { projectId, snapshot },
    });
  }, []);

  const addProjectDependency = useCallback((projectId, packageName, packageVersion) => {
    dispatch({
      type: ProjectActionTypes.ADD_DEPENDENCY,
      payload: { projectId, packageName, packageVersion },
    });
  }, []);

  const value = useMemo(
    () => ({
      projects,
      createProject,
      deleteProject,
      updateProject,
      saveEditorSnapshot,
      addProjectDependency,
    }),
    [projects, createProject, deleteProject, updateProject, saveEditorSnapshot, addProjectDependency]
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
