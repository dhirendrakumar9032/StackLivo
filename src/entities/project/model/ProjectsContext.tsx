import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { useAuth } from "@/entities/auth/model/AuthContext";
import {
  createProjectEntity,
  isUserCreatedProject,
  loadProjectsFromStorage,
  persistProjectsToUserStorage,
  ProjectActionTypes,
  projectsReducer,
} from "@/entities/project/model/projectStore";

const ProjectsContext = createContext(null);

export function ProjectsProvider({ children }) {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id || null;
  const [storageOwnerId, setStorageOwnerId] = useState(currentUserId);
  const [projects, dispatch] = useReducer(projectsReducer, currentUserId, loadProjectsFromStorage);

  useEffect(() => {
    setStorageOwnerId(currentUserId);
    dispatch({
      type: ProjectActionTypes.HYDRATE,
      payload: { projects: loadProjectsFromStorage(currentUserId) },
    });
  }, [currentUserId]);

  useEffect(() => {
    persistProjectsToUserStorage(projects, storageOwnerId);
  }, [projects, storageOwnerId]);

  const createProject = useCallback(
    (name, projectType, options = {}) => {
      const existingProjectCount =
        options.practiceQuestionId || options.questionId ? projects.length : projects.filter(isUserCreatedProject).length;
      const project = createProjectEntity(name, existingProjectCount, projectType, {
        ...options,
        ownerId: currentUserId,
      });
      dispatch({
        type: ProjectActionTypes.CREATE,
        payload: { project },
      });

      return project;
    },
    [currentUserId, projects]
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
