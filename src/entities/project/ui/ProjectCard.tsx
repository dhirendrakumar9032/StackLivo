import { Link } from "react-router-dom";
import { formatDateTime } from "@/shared/lib/date";
import { getProjectEditorPath } from "@/entities/project/model/projectRoutes";
import { PROJECT_TYPES } from "@/entities/project/model/projectTemplates";

export default function ProjectCard({ project, onDelete }) {
  const isJavaScript = project.type === PROJECT_TYPES.JAVASCRIPT;

  return (
    <article className="project-card">
      <div className="project-card-header">
        <h3>{project.name}</h3>
      </div>
      <p className="project-type-label">{isJavaScript ? "JS Playground" : "React Project"}</p>
      <p>Last updated: {formatDateTime(project.updatedAt)}</p>
      <div className="project-actions">
        <Link className="button primary" to={getProjectEditorPath(project)}>
          Open Editor
        </Link>
        <button className="button ghost" type="button" onClick={() => onDelete(project.id)}>
          Delete
        </button>
      </div>
    </article>
  );
}
