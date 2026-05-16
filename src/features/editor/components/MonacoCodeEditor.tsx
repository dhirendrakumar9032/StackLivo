import Editor from "@monaco-editor/react";

function getLanguageFromPath(filePath) {
  if (filePath.endsWith(".css")) {
    return "css";
  }

  if (filePath.endsWith(".html")) {
    return "html";
  }

  if (filePath.endsWith(".json")) {
    return "json";
  }

  if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
    return "typescript";
  }

  return "javascript";
}

export const EDITOR_THEME_OPTIONS = [
  { value: "stacklivo-dark", label: "App Dark" },
  { value: "purple-night", label: "Purple" },
  { value: "vs-light", label: "Light" },
  { value: "vs-dark", label: "Dark" },
  { value: "hc-black", label: "High Contrast" },
];

function defineEditorThemes(monaco) {
  monaco.editor.defineTheme("stacklivo-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "7893c2", fontStyle: "italic" },
      { token: "keyword", foreground: "9fd2ff" },
      { token: "string", foreground: "8df2a6" },
      { token: "number", foreground: "f2d982" },
      { token: "type", foreground: "75e4ff" },
      { token: "function", foreground: "dce8ff" },
      { token: "variable", foreground: "e8efff" },
    ],
    colors: {
      "editor.background": "#061022",
      "editor.foreground": "#e8efff",
      "editorLineNumber.foreground": "#486181",
      "editorLineNumber.activeForeground": "#9fd2ff",
      "editorCursor.foreground": "#9fd2ff",
      "editor.selectionBackground": "#27476f",
      "editor.inactiveSelectionBackground": "#172b48",
      "editor.lineHighlightBackground": "#0b1730",
      "editorGutter.background": "#061022",
      "editorWidget.background": "#0b1730",
      "editorSuggestWidget.background": "#071022",
      "editorSuggestWidget.border": "#29456f",
    },
  });

  monaco.editor.defineTheme("purple-night", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "a99ac8", fontStyle: "italic" },
      { token: "keyword", foreground: "d7b8ff" },
      { token: "string", foreground: "9df0d2" },
      { token: "number", foreground: "ffd08a" },
      { token: "type", foreground: "caa5ff" },
      { token: "function", foreground: "f2e8ff" },
      { token: "variable", foreground: "eee7ff" },
    ],
    colors: {
      "editor.background": "#14081f",
      "editor.foreground": "#eee7ff",
      "editorLineNumber.foreground": "#6d5a8f",
      "editorLineNumber.activeForeground": "#d7b8ff",
      "editorCursor.foreground": "#e7c6ff",
      "editor.selectionBackground": "#4b2d70",
      "editor.inactiveSelectionBackground": "#2a1a3f",
      "editor.lineHighlightBackground": "#1d102c",
      "editorGutter.background": "#14081f",
      "editorWidget.background": "#211334",
      "editorSuggestWidget.background": "#1a0f2a",
      "editorSuggestWidget.border": "#4b2d70",
    },
  });
}

export default function MonacoCodeEditor({
  activeFile,
  code,
  height = "calc(100vh - 180px)",
  theme = "stacklivo-dark",
  onChange,
  onEditorReady,
}) {
  return (
    <Editor
      key={activeFile}
      className="monaco-code-editor"
      height={height}
      language={getLanguageFromPath(activeFile)}
      path={activeFile}
      theme={theme}
      value={code}
      beforeMount={defineEditorThemes}
      loading={<div className="editor-loading">Loading editor...</div>}
      options={{
        automaticLayout: true,
        fontFamily: '"Fira Code", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
        fontLigatures: true,
        fontSize: 14,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        tabSize: 2,
        wordWrap: "on",
        padding: { top: 12, bottom: 12 },
      }}
      onMount={(editor) => onEditorReady?.(editor)}
      onChange={(value) => onChange(value || "")}
    />
  );
}
