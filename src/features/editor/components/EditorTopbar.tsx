import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function EditorTopbar({ projectName, nameDraft, setNameDraft, onCommitName }) {
  return (
    <header className="editor-topbar">
      <div className="editor-topbar-left">
        
        <Link className="button ghost" to="/">
          <ArrowLeft />
        </Link>
        <span className="project-route-name">{projectName}</span>
      </div>

      <input
        className="project-name-input"
        value={nameDraft}
        onChange={(event) => setNameDraft(event.target.value)}
        onBlur={onCommitName}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onCommitName();
          }
        }}
      />
    </header>
  );
}
