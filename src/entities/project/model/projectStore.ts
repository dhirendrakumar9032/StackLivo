import {
  buildProjectPackageJson,
  createJavaScriptBoilerplate,
  createReactBoilerplate,
  normalizeProjectType,
  PROJECT_TYPES,
} from "@/entities/project/model/projectTemplates";
import type { ProjectType } from "@/entities/project/model/projectTemplates";

export const STORAGE_KEY = "react_online_editor_projects_v3";
const LEGACY_STORAGE_KEYS = ["react_online_editor_projects_v2", "react_online_editor_projects_v1"];

export const ProjectActionTypes = {
  CREATE: "project/create",
  DELETE: "project/delete",
  UPDATE: "project/update",
  SAVE_SNAPSHOT: "project/saveSnapshot",
  ADD_DEPENDENCY: "project/addDependency",
};

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sortProjects(projects) {
  return [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

function getInitialActiveFile(files, existingActiveFile) {
  if (existingActiveFile && files[existingActiveFile]) {
    return existingActiveFile;
  }

  if (files["/src/App.jsx"]) {
    return "/src/App.jsx";
  }

  if (files["/App.jsx"]) {
    return "/App.jsx";
  }

  if (files["/src/index.js"]) {
    return "/src/index.js";
  }

  if (files["/index.html"]) {
    return "/index.html";
  }

  return Object.keys(files)[0] || "/src/App.jsx";
}

function inferProjectType(project) {
  if (project?.type || project?.projectType) {
    return normalizeProjectType(project.type || project.projectType);
  }

  return project?.files?.["/src/App.jsx"] ? PROJECT_TYPES.REACT : PROJECT_TYPES.JAVASCRIPT;
}

function normalizeDependencies(input) {
  if (!input || typeof input !== "object") {
    return {};
  }

  return Object.entries(input).reduce((accumulator, [name, version]) => {
    if (!name || !version) {
      return accumulator;
    }

    accumulator[name] = version;
    return accumulator;
  }, {});
}

function syncPackageJsonFile(files, projectName, dependencies, projectType: ProjectType = PROJECT_TYPES.REACT) {
  return {
    ...files,
    "/package.json": {
      code: buildProjectPackageJson(projectName, dependencies, projectType),
    },
  };
}

export function removeDuplicateBoilerplateFiles(files, projectType: ProjectType = PROJECT_TYPES.REACT) {
  const nextFiles = { ...files };

  if (nextFiles["/src/App.jsx"]) {
    delete nextFiles["/App.js"];
    delete nextFiles["/App.jsx"];
  }

  if (nextFiles["/src/index.jsx"]) {
    delete nextFiles["/index.js"];
    delete nextFiles["/index.jsx"];
  }

  if (nextFiles["/src/style.css"]) {
    delete nextFiles["/styles.css"];
  }

  if (projectType === PROJECT_TYPES.REACT && nextFiles["/public/index.html"]) {
    delete nextFiles["/index.html"];
  }

  return nextFiles;
}

function normalizeProject(project) {
  if (!project || !project.id || !project.name || !project.files) {
    return null;
  }

  const dependencies = normalizeDependencies(project.dependencies);
  const projectType = inferProjectType(project);
  const files = syncPackageJsonFile(
    removeDuplicateBoilerplateFiles(project.files, projectType),
    project.name,
    dependencies,
    projectType
  );

  return {
    ...project,
    type: projectType,
    files,
    dependencies,
    activeFile: getInitialActiveFile(files, project.activeFile),
    createdAt: project.createdAt || new Date().toISOString(),
    updatedAt: project.updatedAt || new Date().toISOString(),
  };
}

function readStorageRecord() {
  if (typeof localStorage === "undefined") {
    return null;
  }

  return localStorage.getItem(STORAGE_KEY) || LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
}

export function loadProjectsFromStorage() {
  try {
    const raw = readStorageRecord();

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return sortProjects(parsed.map(normalizeProject).filter(Boolean));
  } catch (error) {
    console.error("Unable to parse stored projects", error);
    return [];
  }
}

export function persistProjectsToStorage(projects) {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function createProjectEntity(name, existingProjectCount, projectType = PROJECT_TYPES.REACT) {
  const normalizedProjectType = normalizeProjectType(projectType);
  const trimmedName = name?.trim();
  const fallbackPrefix = normalizedProjectType === PROJECT_TYPES.REACT ? "React Project" : "JS Playground";
  const projectName = trimmedName || `${fallbackPrefix} ${existingProjectCount + 1}`;
  const timestamp = new Date().toISOString();
  const dependencies = {};
  const files =
    normalizedProjectType === PROJECT_TYPES.REACT
      ? createReactBoilerplate(projectName, dependencies)
      : createJavaScriptBoilerplate(projectName, dependencies);

  return {
    id: generateId(),
    name: projectName,
    type: normalizedProjectType,
    createdAt: timestamp,
    updatedAt: timestamp,
    activeFile: normalizedProjectType === PROJECT_TYPES.REACT ? "/src/App.jsx" : "/src/index.js",
    dependencies,
    files,
  };
}

function withProjectUpdate(projects, projectId, updater) {
  return sortProjects(
    projects.map((project) => {
      if (project.id !== projectId) {
        return project;
      }

      return updater(project);
    })
  );
}

export function projectsReducer(state, action) {
  switch (action.type) {
    case ProjectActionTypes.CREATE: {
      return sortProjects([action.payload.project, ...state]);
    }

    case ProjectActionTypes.DELETE: {
      return state.filter((project) => project.id !== action.payload.projectId);
    }

    case ProjectActionTypes.UPDATE: {
      const { projectId, patch } = action.payload;

      return withProjectUpdate(state, projectId, (project) => {
        const nextProject = {
          ...project,
          ...patch,
          updatedAt: new Date().toISOString(),
        };

        const projectType = normalizeProjectType(nextProject.type);
        const dependencies = normalizeDependencies(nextProject.dependencies);
        const files = syncPackageJsonFile(
          removeDuplicateBoilerplateFiles(nextProject.files || project.files, projectType),
          nextProject.name,
          dependencies,
          projectType
        );

        return {
          ...nextProject,
          type: projectType,
          files,
          dependencies,
          activeFile: getInitialActiveFile(files, nextProject.activeFile),
        };
      });
    }

    case ProjectActionTypes.SAVE_SNAPSHOT: {
      const { projectId, snapshot } = action.payload;

      return withProjectUpdate(state, projectId, (project) => {
        const projectType = normalizeProjectType(project.type);
        const dependencies = normalizeDependencies(project.dependencies);
        const files = syncPackageJsonFile(
          removeDuplicateBoilerplateFiles(snapshot.files || project.files, projectType),
          project.name,
          dependencies,
          projectType
        );

        return {
          ...project,
          files,
          activeFile: getInitialActiveFile(files, snapshot.activeFile || project.activeFile),
          updatedAt: new Date().toISOString(),
        };
      });
    }

    case ProjectActionTypes.ADD_DEPENDENCY: {
      const { projectId, packageName, packageVersion } = action.payload;

      if (!packageName || !packageVersion) {
        return state;
      }

      return withProjectUpdate(state, projectId, (project) => {
        const projectType = normalizeProjectType(project.type);
        const dependencies = {
          ...normalizeDependencies(project.dependencies),
          [packageName]: packageVersion,
        };

        const files = syncPackageJsonFile(
          removeDuplicateBoilerplateFiles(project.files, projectType),
          project.name,
          dependencies,
          projectType
        );

        return {
          ...project,
          dependencies,
          files,
          updatedAt: new Date().toISOString(),
        };
      });
    }

    default:
      return state;
  }
}
