import { QUESTION_LANGUAGES } from "@/features/questions/model/codingQuestions";

function PromptList({ title, items }) {
  if (!items?.length) {
    return null;
  }

  return (
    <section className="question-prompt-section">
      <h4>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function PromptExamples({ examples }) {
  if (!examples?.length) {
    return null;
  }

  return (
    <section className="question-prompt-section">
      <h4>Examples</h4>
      <div className="question-example-list">
        {examples.map((example) => (
          <pre key={`${example.input}-${example.output}`}>
            <code>{`Input:  ${example.input}\nOutput: ${example.output}`}</code>
          </pre>
        ))}
      </div>
    </section>
  );
}

export default function QuestionDescriptionPanel({ question, collapsed, onToggleCollapsed }) {
  if (!question) {
    return null;
  }

  const isReactQuestion = question.language === QUESTION_LANGUAGES.REACT;
  const constraints = isReactQuestion ? question.edgeCases : question.constraints;

  return (
    <section className="question-prompt-panel">
      <div className="sidebar-section-header question-prompt-header">
        <button className="sidebar-collapse-button" type="button" onClick={onToggleCollapsed}>
          <span>{collapsed ? "▸" : "▾"}</span>
          <h3>QUESTION</h3>
        </button>
      </div>

      {!collapsed ? (
        <div className="question-prompt-body">
          <div className="question-prompt-title-row">
            <h4>{question.title}</h4>
            <span className={`difficulty-pill ${question.difficulty.toLowerCase()}`}>{question.difficulty}</span>
          </div>
          <div className="question-tags compact">
            <span className={`language-pill ${question.language}`}>
              {isReactQuestion ? "React.js" : "JavaScript"}
            </span>
            <span className="company-pill">{question.category}</span>
          </div>
          <p>{question.description}</p>

          <PromptList title={isReactQuestion ? "Requirements" : "Constraints"} items={isReactQuestion ? question.requirements : constraints} />
          {isReactQuestion ? <PromptList title="Edge Cases" items={constraints} /> : null}
          <PromptExamples examples={question.examples} />

          {question.signature ? (
            <section className="question-prompt-section">
              <h4>Function Signature</h4>
              <pre>
                <code>{question.signature}</code>
              </pre>
            </section>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
