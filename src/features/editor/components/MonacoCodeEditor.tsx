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

export default function MonacoCodeEditor({ activeFile, code, height = "calc(100vh - 180px)", onChange }) {
  return (
    <Editor
      key={activeFile}
      className="monaco-code-editor"
      height={height}
      language={getLanguageFromPath(activeFile)}
      path={activeFile}
      theme="vs-light"
      value={code}
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
      }}
      onChange={(value) => onChange(value || "")}
    />
  );
}
