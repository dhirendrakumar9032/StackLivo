import { buildProjectPackageJson, PROJECT_TYPES } from "@/entities/project/model/projectTemplates";
import questions from "@/features/questions/data/codingQuestions.json";

const indent = (lines) => `${lines.join("\n")}\n`;

export const QUESTION_LANGUAGES = {
  ALL: "all",
  JAVASCRIPT: "javascript",
  REACT: "react",
} as const;

export const QUESTION_DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

export const CODING_QUESTIONS = questions;

export function getCodingQuestionById(questionId) {
  return CODING_QUESTIONS.find((question) => question.id === questionId) || null;
}

export function getCodingQuestionByTitle(title) {
  const normalizedTitle = title?.trim().toLowerCase();

  if (!normalizedTitle) {
    return null;
  }

  return CODING_QUESTIONS.find((question) => question.title.toLowerCase() === normalizedTitle) || null;
}

export function getQuestionProjectType(question) {
  return question.language === QUESTION_LANGUAGES.REACT ? PROJECT_TYPES.REACT : PROJECT_TYPES.JAVASCRIPT;
}

function createCleanStarter(starter = []) {
  return starter.filter((line) => !line.trim().startsWith("//"));
}

function createJavaScriptQuestionFiles(question) {
  return {
    "/index.html": {
      code: indent([
        "<!doctype html>",
        '<html lang="en">',
        "  <head>",
        '    <meta charset="UTF-8" />',
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
        '    <link rel="stylesheet" href="/src/style.css" />',
        `    <title>${question.title}</title>`,
        "  </head>",
        "  <body>",
        '    <main id="app"></main>',
        '    <script type="module" src="/src/index.js"></script>',
        "  </body>",
        "</html>",
      ]),
    },
    "/src/index.js": {
      code: indent(createCleanStarter(question.starter)),
    },
    "/src/style.css": {
      code: indent([
        ":root {",
        "  color-scheme: dark;",
        "  font-family: Inter, ui-sans-serif, system-ui, sans-serif;",
        "}",
        "",
        "body {",
        "  margin: 0;",
        "  min-height: 100vh;",
        "  display: grid;",
        "  place-items: center;",
        "  background: #071022;",
        "  color: #edf4ff;",
        "}",
      ]),
    },
    "/package.json": {
      code: buildProjectPackageJson(question.title, {}, PROJECT_TYPES.JAVASCRIPT),
    },
  };
}

function createReactQuestionFiles(question) {
  return {
    "/src/App.jsx": {
      code: indent([
        'import { useState } from "react";',
        'import "./style.css";',
        "",
        "export default function App() {",
        "  const [value, setValue] = useState('');",
        "",
        "  return (",
        '    <main className="app-shell">',
        "      <h1>Build your solution</h1>",
        "      <input",
        "        value={value}",
        "        onChange={(event) => setValue(event.target.value)}",
        '        placeholder="Start here"',
        "      />",
        "      <p>{value}</p>",
        "    </main>",
        "  );",
        "}",
      ]),
    },
    "/src/index.jsx": {
      code: indent([
        'import React from "react";',
        'import { createRoot } from "react-dom/client";',
        'import App from "./App";',
        "",
        'createRoot(document.getElementById("root")).render(',
        "  <React.StrictMode>",
        "    <App />",
        "  </React.StrictMode>",
        ");",
      ]),
    },
    "/src/style.css": {
      code: indent([
        ":root {",
        "  color-scheme: dark;",
        "  font-family: Inter, ui-sans-serif, system-ui, sans-serif;",
        "}",
        "",
        "* {",
        "  box-sizing: border-box;",
        "}",
        "",
        "body {",
        "  margin: 0;",
        "  min-height: 100vh;",
        "  display: grid;",
        "  place-items: center;",
        "  background: #071022;",
        "  color: #edf4ff;",
        "}",
        "",
        ".app-shell {",
        "  width: min(420px, calc(100vw - 2rem));",
        "  display: grid;",
        "  gap: 1rem;",
        "  text-align: center;",
        "}",
        "",
        "input {",
        "  width: 100%;",
        "  border: 1px solid rgba(143, 165, 210, 0.32);",
        "  border-radius: 12px;",
        "  background: #071022;",
        "  color: #edf4ff;",
        "  padding: 0.75rem 0.9rem;",
        "}",
      ]),
    },
    "/public/index.html": {
      code: indent([
        "<!doctype html>",
        '<html lang="en">',
        "  <head>",
        '    <meta charset="UTF-8" />',
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
        `    <title>${question.title}</title>`,
        "  </head>",
        "  <body>",
        '    <div id="root"></div>',
        "  </body>",
        "</html>",
      ]),
    },
    "/package.json": {
      code: buildProjectPackageJson(question.title, {}, PROJECT_TYPES.REACT),
    },
  };
}

export function createQuestionProjectFiles(question) {
  return question.language === QUESTION_LANGUAGES.REACT
    ? createReactQuestionFiles(question)
    : createJavaScriptQuestionFiles(question);
}

export function getQuestionActiveFile(question) {
  return question.language === QUESTION_LANGUAGES.REACT ? "/src/App.jsx" : "/src/index.js";
}
