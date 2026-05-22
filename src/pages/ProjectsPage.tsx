import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "@/entities/project/model/ProjectsContext";
import { getProjectEditorPath } from "@/entities/project/model/projectRoutes";
import { isUserCreatedProject } from "@/entities/project/model/projectStore";
import { PROJECT_TYPE_OPTIONS, PROJECT_TYPES } from "@/entities/project/model/projectTemplates";
import {
  CODING_QUESTIONS,
  QUESTION_DIFFICULTIES,
  QUESTION_LANGUAGES,
  createQuestionProjectFiles,
  getQuestionActiveFile,
  getCodingQuestionByTitle,
  getQuestionProjectType,
} from "@/features/questions/model/codingQuestions";

function isSavedWorkspaceProject(project) {
  return isUserCreatedProject(project) && !getCodingQuestionByTitle(project.name);
}

export default function ProjectsPage() {
  const { projects, createProject } = useProjects();
  const [newProjectName, setNewProjectName] = useState("");
  const [projectType, setProjectType] = useState(PROJECT_TYPES.REACT);
  const [questionLanguage, setQuestionLanguage] = useState(QUESTION_LANGUAGES.ALL);
  const [questionDifficulty, setQuestionDifficulty] = useState("All");
  const [questionCategory, setQuestionCategory] = useState("All");
  const [questionSearch, setQuestionSearch] = useState("");
  const navigate = useNavigate();
  const savedProjects = useMemo(() => projects.filter(isSavedWorkspaceProject), [projects]);
  const reactProjectCount = savedProjects.filter((project) => project.type !== PROJECT_TYPES.JAVASCRIPT).length;
  const jsProjectCount = savedProjects.filter((project) => project.type === PROJECT_TYPES.JAVASCRIPT).length;
  const selectedProjectType = PROJECT_TYPE_OPTIONS.find((option) => option.value === projectType);
  const questionCategories = useMemo(
    () => ["All", ...Array.from(new Set(CODING_QUESTIONS.map((question) => question.category)))],
    []
  );
  const filteredQuestions = useMemo(() => {
    const normalizedSearch = questionSearch.trim().toLowerCase();

    return CODING_QUESTIONS.filter((question) => {
      const matchesLanguage =
        questionLanguage === QUESTION_LANGUAGES.ALL || question.language === questionLanguage;
      const matchesDifficulty = questionDifficulty === "All" || question.difficulty === questionDifficulty;
      const matchesCategory = questionCategory === "All" || question.category === questionCategory;
      const searchableText = [
        question.title,
        question.description,
        question.category,
        question.difficulty,
        ...question.companies,
      ]
        .join(" ")
        .toLowerCase();

      return matchesLanguage && matchesDifficulty && matchesCategory && searchableText.includes(normalizedSearch);
    });
  }, [questionCategory, questionDifficulty, questionLanguage, questionSearch]);

  const handleCreateProject = (event) => {
    event.preventDefault();

    const createdProject = createProject(newProjectName, projectType);
    setNewProjectName("");
    navigate(getProjectEditorPath(createdProject));
  };

  const handleStartQuestion = (question) => {
    const project = createProject(question.title, getQuestionProjectType(question), {
      activeFile: getQuestionActiveFile(question),
      files: createQuestionProjectFiles(question),
      practiceQuestionId: question.id,
    });

    navigate(getProjectEditorPath(project));
  };

  return (
    <main className="projects-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-kicker">Stacklivo</p>
          <h1>Frontend workspace</h1>
          <p>Manage React projects and JavaScript playgrounds from one focused control room.</p>
        </div>

        <div className="dashboard-header-actions">
          <div className="dashboard-stats" aria-label="Workspace summary">
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
      </section>

      <section className="question-bank">
        <div className="question-bank-header">
          <div>
            <p>Practice library</p>
            <h2>DSA and React machine coding</h2>
          </div>
          <span>{filteredQuestions.length} questions</span>
        </div>

        <div className="question-filters" aria-label="Question filters">
          <div className="language-segment">
            <button
              className={questionLanguage === QUESTION_LANGUAGES.ALL ? "active" : ""}
              type="button"
              onClick={() => setQuestionLanguage(QUESTION_LANGUAGES.ALL)}
            >
              All
            </button>
            <button
              className={questionLanguage === QUESTION_LANGUAGES.JAVASCRIPT ? "active" : ""}
              type="button"
              onClick={() => setQuestionLanguage(QUESTION_LANGUAGES.JAVASCRIPT)}
            >
              JavaScript
            </button>
            <button
              className={questionLanguage === QUESTION_LANGUAGES.REACT ? "active" : ""}
              type="button"
              onClick={() => setQuestionLanguage(QUESTION_LANGUAGES.REACT)}
            >
              React JS
            </button>
          </div>

          <select value={questionDifficulty} onChange={(event) => setQuestionDifficulty(event.target.value)}>
            {QUESTION_DIFFICULTIES.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty === "All" ? "All difficulties" : difficulty}
              </option>
            ))}
          </select>

          <select value={questionCategory} onChange={(event) => setQuestionCategory(event.target.value)}>
            {questionCategories.map((category) => (
              <option key={category} value={category}>
                {category === "All" ? "All categories" : category}
              </option>
            ))}
          </select>

          <input
            type="search"
            value={questionSearch}
            onChange={(event) => setQuestionSearch(event.target.value)}
            placeholder="Search question, company..."
          />
        </div>

        <div className="question-list">
          {filteredQuestions.map((question) => (
            <button className="question-row" key={question.id} type="button" onClick={() => handleStartQuestion(question)}>
              <span className="question-status" aria-hidden="true" />
              <span className="question-main">
                <strong>{question.title}</strong>
                <small>{question.description}</small>
                <span className="question-tags">
                  <span className={`language-pill ${question.language}`}>
                    {question.language === QUESTION_LANGUAGES.REACT ? "React.js" : "JavaScript"}
                  </span>
                  <span className={`difficulty-pill ${question.difficulty.toLowerCase()}`}>{question.difficulty}</span>
                  {question.companies.slice(0, 5).map((company) => (
                    <span className="company-pill" key={company}>
                      {company}
                    </span>
                  ))}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
