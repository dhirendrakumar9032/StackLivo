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
      <section className="hero">
        <p className="hero-badge">Online Code Editor</p>
        <h1>Create React projects or JavaScript playgrounds</h1>
        <p>
          Pick a stack, write code with Monaco, preview in Sandpack, and run JavaScript output in the terminal.
        </p>
      </section>

      <section className="create-card">
        <h2>Create New Playground</h2>
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

          <input
            type="text"
            value={newProjectName}
            onChange={(event) => setNewProjectName(event.target.value)}
            placeholder="Project name (optional)"
            maxLength={50}
          />
          <button className="button primary" type="submit">
            + Create
          </button>
        </form>
      </section>

      <section className="projects-grid-wrap">
        <div className="projects-grid-header">
          <h2>{title}</h2>
        </div>

        {projects.length ? (
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onDelete={handleDeleteProject} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Start by creating your first React project or JavaScript playground.</p>
          </div>
        )}
      </section>
    </main>
  );
}
