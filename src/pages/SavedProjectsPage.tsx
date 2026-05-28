import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/entities/auth/model/AuthContext";
import { useProjects } from "@/entities/project/model/ProjectsContext";
import { getProjectEditorPath } from "@/entities/project/model/projectRoutes";
import { isUserCreatedProject } from "@/entities/project/model/projectStore";
import { PROJECT_TYPES } from "@/entities/project/model/projectTemplates";
import { formatDateTime } from "@/shared/lib/date";

function isSavedWorkspaceProject(project) {
  return isUserCreatedProject(project);
}

export default function SavedProjectsPage() {
  const { currentUser, isAuthLoading } = useAuth();
  const { projects, isProjectsLoading, projectsError, deleteProject } = useProjects();
  const savedProjects = useMemo(() => projects.filter(isSavedWorkspaceProject), [projects]);
  const reactProjectCount = savedProjects.filter((project) => project.type !== PROJECT_TYPES.JAVASCRIPT).length;
  const jsProjectCount = savedProjects.filter((project) => project.type === PROJECT_TYPES.JAVASCRIPT).length;

  const handleDeleteProject = async (projectId) => {
    const shouldDelete = window.confirm("Delete this project permanently?");

    if (!shouldDelete) {
      return;
    }

    await deleteProject(projectId);
  };

  if (isAuthLoading || isProjectsLoading) {
    return (
      <main className="projects-page saved-projects-page">
        <section className="empty-state">
          <strong>Loading projects</strong>
          <p>Getting your saved Stacklivo workspaces.</p>
        </section>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="projects-page saved-projects-page">
        <section className="empty-state">
          <strong>Login required</strong>
          <p>Sign in to see your saved React projects and JavaScript playgrounds.</p>
          <Link className="button primary" to="/login" state={{ from: { pathname: "/projects" } }}>
            Login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="projects-page saved-projects-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-kicker">Projects</p>
          <h1>Saved workspaces</h1>
          <p>React projects and JavaScript playgrounds created from the new build flow.</p>
        </div>

        <div className="dashboard-header-actions">
          <div className="dashboard-stats" aria-label="Saved project summary">
            <div>
              <strong>{savedProjects.length}</strong>
              <span>Saved</span>
            </div>
            <div>
              <strong>{reactProjectCount}</strong>
              <span>React</span>
            </div>
            <div>
              <strong>{jsProjectCount}</strong>
              <span>JavaScript</span>
            </div>
          </div>
        </div>
      </header>

      <section className="projects-table-section">
        {projectsError ? <p className="auth-error">{projectsError}</p> : null}

        <div className="projects-table-header">
          <div>
            <p>All projects</p>
            <h2>{savedProjects.length ? `${savedProjects.length} saved workspace${savedProjects.length > 1 ? "s" : ""}` : "No saved workspaces"}</h2>
          </div>
          <Link className="button primary" to="/">
            Create workspace
          </Link>
        </div>

        {savedProjects.length ? (
          <div className="projects-table-shell">
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Updated</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedProjects.map((project) => {
                  const isJavaScript = project.type === PROJECT_TYPES.JAVASCRIPT;

                  return (
                    <tr key={project.id}>
                      <td>
                        <strong>{project.name}</strong>
                      </td>
                      <td>
                        <span className={`project-table-type ${isJavaScript ? "javascript" : "react"}`}>
                          {isJavaScript ? "JS Playground" : "React Project"}
                        </span>
                      </td>
                      <td>{formatDateTime(project.updatedAt)}</td>
                      <td>{formatDateTime(project.createdAt)}</td>
                      <td>
                        <div className="project-table-actions">
                          <Link className="button primary" to={getProjectEditorPath(project)}>
                            Open
                          </Link>
                          <button className="button ghost" type="button" onClick={() => handleDeleteProject(project.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <strong>No saved workspaces yet</strong>
            <p>Create a React project or JavaScript playground from the dashboard. Practice-library tasks stay out of this list.</p>
          </div>
        )}
      </section>
    </main>
  );
}
