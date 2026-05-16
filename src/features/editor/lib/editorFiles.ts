export const FOLDER_MARKER_FILE = ".gitkeep";

export function normalizePath(path) {
  if (!path) {
    return "";
  }

  const clean = path.trim().replace(/\\/g, "/").replace(/^\/+/, "");

  if (!clean) {
    return "";
  }

  return `/${clean}`;
}

export function isFolderMarkerPath(path) {
  return path.endsWith(`/${FOLDER_MARKER_FILE}`);
}

export function createFolderMarkerPath(path) {
  const normalized = normalizePath(path);

  if (!normalized) {
    return "";
  }

  return `${normalized.replace(/\/+$/, "")}/${FOLDER_MARKER_FILE}`;
}

export function createStarterByPath(path) {
  if (path.endsWith(".css")) {
    return "/* New stylesheet */\n";
  }

  if (path.endsWith(".json")) {
    return "{\n  \"name\": \"new-config\"\n}\n";
  }

  if (path.endsWith(".jsx")) {
    return [
      "export default function NewComponent() {",
      '  return <div className="new-component">New component</div>;',
      "}",
      "",
    ].join("\n");
  }

  if (path.endsWith(".js") || path.endsWith(".ts")) {
    return "export const value = true;\n";
  }

  if (path.endsWith(".html")) {
    return [
      "<!doctype html>",
      '<html lang="en">',
      "  <head>",
      '    <meta charset="UTF-8" />',
      '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      "  </head>",
      "  <body>",
      '    <div id="root"></div>',
      "  </body>",
      "</html>",
      "",
    ].join("\n");
  }

  return "";
}

export function resolveEntryFile(files) {
  if (files["/src/index.jsx"]) {
    return "/src/index.jsx";
  }

  if (files["/index.html"]) {
    return "/index.html";
  }

  if (files["/src/index.js"]) {
    return "/src/index.js";
  }

  if (files["/index.jsx"]) {
    return "/index.jsx";
  }

  return Object.keys(files)[0] || "/src/index.jsx";
}

export function resolveActiveFile(files, activeFile) {
  if (activeFile && files[activeFile]) {
    return activeFile;
  }

  if (files["/src/App.jsx"]) {
    return "/src/App.jsx";
  }

  if (files["/App.jsx"]) {
    return "/App.jsx";
  }

  if (files["/src/index.js"]) {
    return "/src/index.js";
  }

  if (files["/index.html"]) {
    return "/index.html";
  }

  return Object.keys(files)[0] || "/src/index.jsx";
}
