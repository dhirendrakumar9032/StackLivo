export function objectToDependencies(dependencies = {}) {
  return Object.entries(dependencies || {})
    .filter(([name, version]) => name && version)
    .map(([name, version]) => ({ name, version }));
}

export function objectToFiles(files = {}) {
  return Object.entries(files || {})
    .filter(([path, value]) => path && value)
    .map(([path, value]) => ({
      path,
      code: typeof value === "string" ? value : value?.code || "",
    }));
}

function dependenciesToObject(dependencies = []) {
  return dependencies.reduce((accumulator, dependency) => {
    if (dependency.name && dependency.version) {
      accumulator[dependency.name] = dependency.version;
    }

    return accumulator;
  }, {});
}

function filesToObject(files = []) {
  return files.reduce((accumulator, file) => {
    if (file.path) {
      accumulator[file.path] = { code: file.code || "" };
    }

    return accumulator;
  }, {});
}

export function serializeProject(project) {
  return {
    id: project._id.toString(),
    name: project.name,
    type: project.type,
    source: project.source,
    practiceQuestionId: project.practiceQuestionId,
    activeFile: project.activeFile,
    dependencies: dependenciesToObject(project.dependencies),
    files: filesToObject(project.files),
    ownerId: project.ownerId.toString(),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}
