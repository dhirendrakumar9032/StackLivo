const indent = (lines) => `${lines.join("\n")}\n`;

export const PROJECT_TYPES = {
  REACT: "react",
  JAVASCRIPT: "javascript",
} as const;

export type ProjectType = (typeof PROJECT_TYPES)[keyof typeof PROJECT_TYPES];

export const PROJECT_TYPE_OPTIONS = [
  {
    value: PROJECT_TYPES.REACT,
    label: "React Project",
    description: "React components with Sandpack live preview.",
  },
  {
    value: PROJECT_TYPES.JAVASCRIPT,
    label: "JS Playground",
    description: "HTML, CSS, and JavaScript with terminal output.",
  },
];

export function normalizeProjectType(projectType): ProjectType {
  return projectType === PROJECT_TYPES.JAVASCRIPT ? PROJECT_TYPES.JAVASCRIPT : PROJECT_TYPES.REACT;
}

function normalizeProjectPackageName(projectName) {
  const normalized = (projectName || "playground")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "playground";
}

export function buildProjectPackageJson(
  projectName,
  packageDependencies = {},
  projectType: ProjectType = PROJECT_TYPES.REACT
) {
  const userDependencies = Object.entries(packageDependencies)
    .filter(([name, version]) => Boolean(name) && Boolean(version))
    .sort(([a], [b]) => a.localeCompare(b));
  const normalizedProjectType = normalizeProjectType(projectType);

  const packageJson = {
    name: normalizeProjectPackageName(projectName),
    private: true,
    version: "1.0.0",
    main: normalizedProjectType === PROJECT_TYPES.REACT ? "/src/index.jsx" : "/index.html",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
    },
    dependencies:
      normalizedProjectType === PROJECT_TYPES.REACT
        ? {
            react: "^18.3.1",
            "react-dom": "^18.3.1",
            ...Object.fromEntries(userDependencies),
          }
        : {
            ...Object.fromEntries(userDependencies),
          },
  };

  return `${JSON.stringify(packageJson, null, 2)}\n`;
}

export function createJavaScriptBoilerplate(projectName, packageDependencies = {}) {
  const appTitle = projectName || "JS Playground";
  const escapedTitle = JSON.stringify(appTitle);

  return {
    "/index.html": {
      code: indent([
        "<!doctype html>",
        '<html lang="en">',
        "  <head>",
        '    <meta charset="UTF-8" />',
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
        '    <link rel="stylesheet" href="/src/style.css" />',
        "  </head>",
        "  <body>",
        '    <main class="app-shell">',
        '      <h4 id="title">Start Coding</h4>',
        "    </main>",
        '    <script type="module" src="/src/index.js"></script>',
        "  </body>",
        "</html>",
      ]),
    },
    "/src/index.js": {
      code: indent([
        
        'console.log("JS playground ready");',
      ]),
    },
    "/src/style.css": {
      code: indent([
        ":root {",
        "  color-scheme: dark;",
        "  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;",
        "}",
        "",
        "* {",
        "  box-sizing: border-box;",
        "}",
        "",
        ".app-shell {",
        "  padding: 2rem 1.4rem;",
        "  border-radius: 20px;",
        "  text-align: center;",
        "  background: rgba(8, 16, 36, 0.8);",
        "}",
        "",
      ]),
    },
    "/package.json": {
      code: buildProjectPackageJson(projectName, packageDependencies, PROJECT_TYPES.JAVASCRIPT),
    },
  };
}

export function createReactBoilerplate(projectName, packageDependencies = {}) {
  const appTitle = projectName || "React Playground";
  const escapedTitle = JSON.stringify(appTitle);

  return {
    "/src/App.jsx": {
      code: indent([
        'import { useState } from "react";',
        'import { useUpdateEffect } from "./useUpdateEffect";',
        'import "./style.css";',
        "",
        `const APP_TITLE = ${escapedTitle};`,
        "",
        "export default function App() {",
        "  const [count, setCount] = useState(0);",
        "",
        "  useUpdateEffect(() => {",
        '    console.log("Count changed:", count);',
        "  }, [count]);",
        "",
        "  return (",
        '    <main className="app-shell">',
        "      <h1>{APP_TITLE}</h1>",
        '      <p>Edit files and watch preview update instantly.</p>',
        '      <div className="button-row">',
        '        <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>',
        '        <button onClick={() => setCount(0)}>Reset</button>',
        "      </div>",
        '      <h2 className="count">{count}</h2>',
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
        'const rootElement = document.getElementById("root");',
        "createRoot(rootElement).render(",
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
        "  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;",
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
        "  background: radial-gradient(circle at top, #0f1f3f, #060c1f 65%);",
        "}",
        "",
        ".app-shell {",
        "  padding: 2rem 1.4rem;",
        "  border-radius: 20px;",
        "  text-align: center;",
        "}",
        "",
        "h1 {",
        "  margin-top: 0;",
        "  font-size: 1.8rem;",
        "}",
        "",
        "p {",
        "  color: #c3d3f4;",
        "}",
        "",
        ".button-row {",
        "  display: flex;",
        "  justify-content: center;",
        "  gap: 0.75rem;",
        "  margin: 1rem 0;",
        "}",
        "",
        "button {",
        "  border: 0;",
        "  border-radius: 10px;",
        "  padding: 0.55rem 1rem;",
        "  cursor: pointer;",
        "  font-weight: 600;",
        "  color: #07162d;",
        "  background: linear-gradient(120deg, #9fd2ff, #e3f2ff);",
        "}",
        "",
        ".count {",
        "  margin: 0;",
        "  font-size: 2rem;",
        "}",
      ]),
    },
    "/src/useUpdateEffect.js": {
      code: indent([
        'import { useEffect, useRef } from "react";',
        "",
        "export function useUpdateEffect(effect, deps) {",
        "  const isFirstRender = useRef(true);",
        "",
        "  useEffect(() => {",
        "    if (isFirstRender.current) {",
        "      isFirstRender.current = false;",
        "      return;",
        "    }",
        "",
        "    return effect();",
        "  }, deps);",
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
        "    <title>Stacklivo</title>",
        "  </head>",
        "  <body>",
        '    <div id="root"></div>',
        "  </body>",
        "</html>",
      ]),
    },
    "/package.json": {
      code: buildProjectPackageJson(projectName, packageDependencies, PROJECT_TYPES.REACT),
    },
  };
}
