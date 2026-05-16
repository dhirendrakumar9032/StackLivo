import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectCard from "@/entities/project/ui/ProjectCard";
import { useProjects } from "@/entities/project/model/ProjectsContext";
import { getProjectEditorPath } from "@/entities/project/model/projectRoutes";
import { PROJECT_TYPE_OPTIONS, PROJECT_TYPES } from "@/entities/project/model/projectTemplates";

export default function ProjectsPage() {
  const { projects, createProject, deleteProject } = useProjects();
  const [newProjectName, setNewProjectName] = useState("");
  const [projectType, setProjectType] = useState(PROJECT_TYPES.REACT);
  const navigate = useNavigate();
  const reactProjectCount = projects.filter((project) => project.type !== PROJECT_TYPES.JAVASCRIPT).length;
  const jsProjectCount = projects.filter((project) => project.type === PROJECT_TYPES.JAVASCRIPT).length;
  const selectedProjectType = PROJECT_TYPE_OPTIONS.find((option) => option.value === projectType);
  const latestProject = projects[0];

  const title = useMemo(() => {
    if (!projects.length) {
      return "No projects yet";
    }

    return `${projects.length} saved playground${projects.length > 1 ? "s" : ""}`;
  }, [projects.length]);

  const handleCreateProject = (event) => {
    event.preventDefault();

    const createdProject = createProject(newProjectName, projectType);
    setNewProjectName("");
    navigate(getProjectEditorPath(createdProject));
  };

  const handleDeleteProject = (projectId) => {
    const shouldDelete = window.confirm("Delete this project permanently?");

    if (!shouldDelete) {
      return;
    }

    deleteProject(projectId);
  };

  return (
    <main className="projects-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-kicker">Stacklivo</p>
          <h1>Frontend workspace</h1>
          <p>Manage React projects and JavaScript playgrounds from one focused control room.</p>
        </div>

        <div className="dashboard-stats" aria-label="Workspace summary">
          <div>
            <strong>{projects.length}</strong>
            <span>Total</span>
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
      </header>

      <section className="dashboard-grid">
        <div className="create-card">
          <div className="panel-heading">
            <div>
              <p>New build</p>
              <h2>Start clean</h2>
            </div>
            <span>{selectedProjectType?.label}</span>
          </div>

          <form className="create-form" onSubmit={handleCreateProject}>
            <div className="project-type-options" role="radiogroup" aria-label="Project type">
              {PROJECT_TYPE_OPTIONS.map((option) => (
                <label
                  className={`project-type-option ${projectType === option.value ? "active" : ""}`}
                  key={option.value}
                >
                  <input
                    checked={projectType === option.value}
                    name="projectType"
                    onChange={() => setProjectType(option.value)}
                    type="radio"
                    value={option.value}
                  />
                  <span>{option.label}</span>
                  <small>{option.description}</small>
                </label>
              ))}
            </div>

            <div className="create-row">
              <input
                type="text"
                value={newProjectName}
                onChange={(event) => setNewProjectName(event.target.value)}
                placeholder="Project name (optional)"
                maxLength={50}
              />
              <button className="button primary" type="submit">
                Create workspace
              </button>
            </div>
          </form>
        </div>

        <aside className="workflow-card">
          <div className="panel-heading">
            <div>
              <p>Stack</p>
              <h2>Included tools</h2>
            </div>
          </div>
          <div className="workflow-list">
            <div>
              <span>Editor</span>
              <strong>Monaco themes</strong>
            </div>
            <div>
              <span>Preview</span>
              <strong>Sandpack iframe</strong>
            </div>
            <div>
              <span>Run</span>
              <strong>JS terminal output</strong>
            </div>
            <div>
              <span>Latest</span>
              <strong>{latestProject ? latestProject.name : "No saved project"}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="projects-grid-wrap">
        <div className="projects-grid-header">
          <div>
            <p>Recent work</p>
            <h2>{title}</h2>
          </div>
        </div>

        {projects.length ? (
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onDelete={handleDeleteProject} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>No saved work yet</strong>
            <p>Create a React project or JavaScript playground to start building in Stacklivo.</p>
          </div>
        )}
      </section>
    </main>
  );
}
