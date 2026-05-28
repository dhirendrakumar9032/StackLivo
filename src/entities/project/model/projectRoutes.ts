export function createProjectSlug(projectName) {
  const slug = (projectName || "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "project";
}

export function getProjectRouteKey(project) {
  return project?.id || createProjectSlug(project?.name);
}

export function getProjectEditorPath(project) {
  return `/editor/${encodeURIComponent(getProjectRouteKey(project))}`;
}

export function getProjectPreviewPath(project) {
  return `/preview/${encodeURIComponent(getProjectRouteKey(project))}`;
}

export function findProjectByRouteParam(projects, routeParam) {
  const decodedParam = decodeURIComponent(routeParam || "");

  return projects.find((project) => {
    return (
      project.id === decodedParam ||
      project.name === decodedParam ||
      createProjectSlug(project.name) === decodedParam
    );
  });
}
