import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SandpackLayout, useSandpack } from "@codesandbox/sandpack-react";
import { BASE_PACKAGES } from "@/features/editor/constants/basePackages";
import {
  createFolderMarkerPath,
  createStarterByPath,
  isFolderMarkerPath,
  normalizePath,
} from "@/features/editor/lib/editorFiles";
import { buildFileTree, getAncestorFolders, getNodeNameFromPath } from "@/features/editor/lib/fileTree";
import { resolvePackage } from "@/features/packages/api/packageRegistryClient";
import { usePackageSearch } from "@/features/packages/hooks/usePackageSearch";
import EditorTopbar from "@/features/editor/components/EditorTopbar";
import FileExplorerPanel from "@/features/editor/components/FileExplorerPanel";
import MonacoCodeEditor, { EDITOR_THEME_OPTIONS } from "@/features/editor/components/MonacoCodeEditor";
import PackageManagerPanel from "@/features/editor/components/PackageManagerPanel";
import PreviewPanel from "@/features/editor/components/PreviewPanel";
import TerminalPanel from "@/features/editor/components/TerminalPanel";
import { useEditorLayout } from "@/features/editor/hooks/useEditorLayout";
import { PROJECT_TYPES } from "@/entities/project/model/projectTemplates";

export default function EditorWorkspace({
  projectName,
  projectType,
  projectDependencies,
  previewPath,
  onPreviewSnapshot,
  onRenameProject,
  onSnapshotChange,
  onAddDependency,
}) {
  const { sandpack, dispatch } = useSandpack();

  const [newFilePath, setNewFilePath] = useState("");
  const [nameDraft, setNameDraft] = useState(projectName);
  const [addingPackage, setAddingPackage] = useState("");
  const [editorTheme, setEditorTheme] = useState("stacklivo-dark");
  const [expandedFolders, setExpandedFolders] = useState(() => new Set(["/src"]));
  const [runRequest, setRunRequest] = useState(0);

  const filePathInputRef = useRef(null);
  const packageSearchRef = useRef(null);
  const explorerPanelRef = useRef<HTMLElement | null>(null);
  const activeEditorCodeRef = useRef("");
  const monacoEditorRef = useRef<any>(null);

  const {
    query: packageQuery,
    setQuery: setPackageQuery,
    results: packageResults,
    isSearching: isSearchingPackages,
    error: packageError,
    setError: setPackageError,
  } = usePackageSearch();

  const filePaths = useMemo(
    () => Object.keys(sandpack.files || {}).sort((a, b) => a.localeCompare(b)),
    [sandpack.files]
  );

  const treeNodes = useMemo(() => buildFileTree(filePaths), [filePaths]);
  const visibleFilePaths = useMemo(
    () => filePaths.filter((filePath) => !isFolderMarkerPath(filePath)),
    [filePaths]
  );
  const activeFileCode = sandpack.files?.[sandpack.activeFile]?.code || "";

  useEffect(() => {
    activeEditorCodeRef.current = activeFileCode;
  }, [activeFileCode, sandpack.activeFile]);

  const installedPackages = useMemo(() => {
    const userPackages = Object.entries(projectDependencies || {}).sort(([a], [b]) => a.localeCompare(b));

    if (projectType !== PROJECT_TYPES.REACT) {
      return userPackages;
    }

    return [...Object.entries(BASE_PACKAGES), ...userPackages.filter(([packageName]) => !BASE_PACKAGES[packageName])];
  }, [projectDependencies, projectType]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onSnapshotChange({
        files: sandpack.files,
        activeFile: sandpack.activeFile,
      });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [sandpack.files, sandpack.activeFile, onSnapshotChange]);

  useEffect(() => {
    setNameDraft(projectName);
  }, [projectName]);

  useEffect(() => {
    setExpandedFolders((previous) => {
      const next = new Set(previous);
      let changed = false;

      if (filePaths.some((filePath) => filePath.startsWith("/src/")) && !next.has("/src")) {
        next.add("/src");
        changed = true;
      }

      for (const folderPath of getAncestorFolders(sandpack.activeFile || "")) {
        if (!next.has(folderPath)) {
          next.add(folderPath);
          changed = true;
        }
      }

      return changed ? next : previous;
    });
  }, [filePaths, sandpack.activeFile]);

  const expandAncestors = useCallback((path) => {
    const ancestors = getAncestorFolders(path);

    if (!ancestors.length) {
      return;
    }

    setExpandedFolders((previous) => {
      const next = new Set(previous);
      let changed = false;

      for (const folderPath of ancestors) {
        if (!next.has(folderPath)) {
          next.add(folderPath);
          changed = true;
        }
      }

      return changed ? next : previous;
    });
  }, []);

  const toggleFolder = useCallback((path) => {
    setExpandedFolders((previous) => {
      const next = new Set(previous);

      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }

      return next;
    });
  }, []);

  const openFile = useCallback(
    (path) => {
      expandAncestors(path);

      if (typeof sandpack.openFile === "function") {
        sandpack.openFile(path);
        return;
      }

      (dispatch as (action: unknown) => void)({
        type: "set-active-file",
        path,
      });
    },
    [sandpack, dispatch, expandAncestors]
  );

  const updateActiveFile = useCallback(
    (code) => {
      activeEditorCodeRef.current = code;

      if (!sandpack.activeFile) {
        return;
      }

      if (typeof sandpack.updateFile === "function") {
        sandpack.updateFile(sandpack.activeFile, code, true);
        return;
      }

      onSnapshotChange({
        files: {
          ...sandpack.files,
          [sandpack.activeFile]: {
            ...sandpack.files[sandpack.activeFile],
            code,
          },
        },
        activeFile: sandpack.activeFile,
      });
    },
    [onSnapshotChange, sandpack]
  );

  const getLatestActiveCode = useCallback(() => {
    return monacoEditorRef.current?.getValue?.() ?? activeEditorCodeRef.current;
  }, []);

  const getCurrentFilesSnapshot = useCallback(() => {
    if (!sandpack.activeFile) {
      return sandpack.files;
    }

    return {
      ...sandpack.files,
      [sandpack.activeFile]: {
        ...sandpack.files[sandpack.activeFile],
        code: getLatestActiveCode(),
      },
    };
  }, [getLatestActiveCode, sandpack.activeFile, sandpack.files]);

  const refreshPreviewWithCurrentCode = useCallback(() => {
    const latestCode = getLatestActiveCode();
    activeEditorCodeRef.current = latestCode;
    const files = getCurrentFilesSnapshot();

    if (sandpack.activeFile && typeof sandpack.updateFile === "function") {
      sandpack.updateFile(sandpack.activeFile, latestCode, true);
    }

    onSnapshotChange({
      files,
      activeFile: sandpack.activeFile,
    });

    return files;
  }, [getCurrentFilesSnapshot, getLatestActiveCode, onSnapshotChange, sandpack]);

  const createFile = useCallback(
    (path) => {
      const normalized = normalizePath(path);

      if (!normalized) {
        return;
      }

      if (sandpack.files[normalized]) {
        openFile(normalized);
        return;
      }

      if (filePaths.some((filePath) => filePath.startsWith(`${normalized}/`))) {
        window.alert("A folder already exists at that path.");
        return;
      }

      const starterCode = createStarterByPath(normalized);

      if (typeof sandpack.addFile === "function") {
        sandpack.addFile(normalized, starterCode, true);
        openFile(normalized);
      } else {
        onSnapshotChange({
          files: {
            ...sandpack.files,
            [normalized]: {
              code: starterCode,
            },
          },
          activeFile: normalized,
        });
      }

      expandAncestors(normalized);
    },
    [expandAncestors, filePaths, onSnapshotChange, openFile, sandpack]
  );

  const createFolder = useCallback(
    (path) => {
      const normalizedFolderPath = normalizePath(path);
      const markerPath = createFolderMarkerPath(path);

      if (!markerPath) {
        return;
      }

      if (sandpack.files[normalizedFolderPath]) {
        window.alert("A file already exists at that path.");
        return;
      }

      if (sandpack.files[markerPath]) {
        expandAncestors(markerPath);
        return;
      }

      if (typeof sandpack.addFile === "function") {
        sandpack.addFile(markerPath, "", true);
      } else {
        onSnapshotChange({
          files: {
            ...sandpack.files,
            [markerPath]: {
              code: "",
            },
          },
          activeFile: sandpack.activeFile,
        });
      }

      expandAncestors(markerPath);
      setExpandedFolders((previous) => {
        const next = new Set(previous);
        next.add(markerPath.replace(`/${getNodeNameFromPath(markerPath)}`, ""));
        return next;
      });
    },
    [expandAncestors, onSnapshotChange, sandpack]
  );

  const createNodeFromPath = useCallback(
    (path) => {
      if (path.trim().endsWith("/")) {
        createFolder(path);
        return;
      }

      createFile(path);
    },
    [createFile, createFolder]
  );

  const addFile = (event) => {
    event.preventDefault();

    createNodeFromPath(newFilePath);
    setNewFilePath("");
  };

  const createRootFile = useCallback(() => {
    const fileName = window.prompt("New file path", "src/NewComponent.jsx");

    if (fileName) {
      createFile(fileName);
    }
  }, [createFile]);

  const createRootFolder = useCallback(() => {
    const folderName = window.prompt("New folder path", "src/components");

    if (folderName) {
      createFolder(folderName);
    }
  }, [createFolder]);

  const addTreeNode = useCallback(
    (node) => {
      const entryName = window.prompt(
        `Add file or folder inside ${node.path}`,
        "NewComponent.jsx"
      );

      if (!entryName) {
        return;
      }

      const trimmedEntryName = entryName.trim().replace(/^\/+/, "");
      const childPath = `${node.path}/${trimmedEntryName}`;

      createNodeFromPath(childPath);
      setExpandedFolders((previous) => {
        const next = new Set(previous);
        next.add(node.path);
        return next;
      });
    },
    [createNodeFromPath]
  );

  const deleteTreeNode = useCallback(
    (node) => {
      const pathsToDelete =
        node.type === "folder"
          ? filePaths.filter((filePath) => filePath === node.path || filePath.startsWith(`${node.path}/`))
          : [node.path];

      if (!pathsToDelete.length) {
        return;
      }

      const visiblePathsToDelete = pathsToDelete.filter((path) => !isFolderMarkerPath(path));

      if (visiblePathsToDelete.length >= visibleFilePaths.length) {
        window.alert("Keep at least one file in the project.");
        return;
      }

      const shouldDelete = window.confirm(
        node.type === "folder"
          ? `Delete ${node.name} and all files inside it?`
          : `Delete ${node.name}?`
      );

      if (!shouldDelete) {
        return;
      }

      if (typeof sandpack.deleteFile === "function") {
        pathsToDelete.forEach((path) => sandpack.deleteFile(path, true));
      } else {
        const nextFiles = { ...sandpack.files };
        pathsToDelete.forEach((path) => {
          delete nextFiles[path];
        });

        const nextActiveFile = nextFiles[sandpack.activeFile]
          ? sandpack.activeFile
          : Object.keys(nextFiles)[0];

        onSnapshotChange({
          files: nextFiles,
          activeFile: nextActiveFile,
        });
      }

      setExpandedFolders((previous) => {
        const next = new Set(previous);
        next.delete(node.path);

        for (const folderPath of previous) {
          if (folderPath.startsWith(`${node.path}/`)) {
            next.delete(folderPath);
          }
        }

        return next;
      });
    },
    [filePaths, onSnapshotChange, sandpack, visibleFilePaths.length]
  );

  const moveTreeNodes = useCallback(
    ({ dragIds, parentId }) => {
      const targetFolderPath = parentId || "/";
      const normalizedTargetFolder = targetFolderPath === "/" ? "" : normalizePath(targetFolderPath);
      const nextFiles: Record<string, any> = { ...sandpack.files };
      const allMovedPaths = new Set<string>();
      const allMovedEntries: Array<{ from: string; to: string; file: any }> = [];

      for (const draggedPath of dragIds) {
        const draggedItemType = filePaths.some((filePath) => filePath.startsWith(`${draggedPath}/`))
          ? "folder"
          : "file";

        if (draggedItemType === "folder") {
          if (draggedPath === normalizedTargetFolder || normalizedTargetFolder.startsWith(`${draggedPath}/`)) {
            return;
          }
        }

        const movedPaths =
          draggedItemType === "folder"
            ? filePaths.filter((filePath) => filePath === draggedPath || filePath.startsWith(`${draggedPath}/`))
            : [draggedPath];

        const nodeName = getNodeNameFromPath(draggedPath);
        const targetBasePath = normalizedTargetFolder ? `${normalizedTargetFolder}/${nodeName}` : `/${nodeName}`;

        movedPaths.forEach((path) => allMovedPaths.add(path));
        movedPaths.forEach((path) => {
          allMovedEntries.push({
            from: path,
            to: draggedItemType === "folder" ? path.replace(draggedPath, targetBasePath) : targetBasePath,
            file: sandpack.files[path],
          });
        });
      }

      if (!allMovedEntries.length) {
        return;
      }

      if (allMovedEntries.every(({ from, to }) => from === to)) {
        return;
      }

      const hasCollision = allMovedEntries.some(({ from, to }) => {
        if (from === to) {
          return false;
        }

        const collidesWithFile = nextFiles[to] && !allMovedPaths.has(to);
        const collidesWithFolder = filePaths.some((filePath) => {
          return filePath.startsWith(`${to}/`) && !allMovedPaths.has(filePath);
        });

        return collidesWithFile || collidesWithFolder;
      });

      if (hasCollision) {
        window.alert("A file or folder with that name already exists there.");
        return;
      }

      allMovedPaths.forEach((path) => {
        delete nextFiles[path];
      });

      allMovedEntries.forEach(({ to, file }) => {
        nextFiles[to] = file;
      });

      const nextActiveFile = allMovedEntries.find(({ from }) => from === sandpack.activeFile)?.to || sandpack.activeFile;

      if (typeof sandpack.deleteFile === "function" && typeof sandpack.updateFile === "function") {
        allMovedPaths.forEach((path) => sandpack.deleteFile(path, false));
        sandpack.updateFile(
          allMovedEntries.reduce((files, { to, file }) => {
            files[to] = file;
            return files;
          }, {}),
          undefined,
          true
        );

        if (nextFiles[nextActiveFile]) {
          openFile(nextActiveFile);
        }
      } else {
        onSnapshotChange({
          files: nextFiles,
          activeFile: nextFiles[nextActiveFile] ? nextActiveFile : Object.keys(nextFiles)[0],
        });
      }

      setExpandedFolders((previous) => {
        const next = new Set(previous);

        if (normalizedTargetFolder) {
          next.add(normalizedTargetFolder);
        }

        return next;
      });
    },
    [filePaths, onSnapshotChange, openFile, sandpack]
  );

  const commitName = () => {
    const trimmed = nameDraft.trim();

    if (trimmed && trimmed !== projectName) {
      onRenameProject(trimmed);
    } else if (!trimmed) {
      setNameDraft(projectName);
    }
  };

  const isPackageInstalled = useCallback(
    (packageName) => Boolean(BASE_PACKAGES[packageName] || projectDependencies?.[packageName]),
    [projectDependencies]
  );

  const addPackage = useCallback(
    async (packageName) => {
      if (!packageName || isPackageInstalled(packageName)) {
        return;
      }

      setAddingPackage(packageName);
      setPackageError("");

      try {
        const resolved = await resolvePackage(packageName);
        onAddDependency(resolved.name, resolved.version);
      } catch {
        setPackageError("Package could not be added.");
      } finally {
        setAddingPackage("");
      }
    },
    [isPackageInstalled, onAddDependency, setPackageError]
  );

  const canRunCode = projectType === PROJECT_TYPES.JAVASCRIPT;

  const openPreviewInNewTab = useCallback(() => {
    if (!previewPath) {
      return;
    }

    const files = getCurrentFilesSnapshot();

    onSnapshotChange({
      files,
      activeFile: sandpack.activeFile,
    });
    onPreviewSnapshot?.({
      files,
      activeFile: sandpack.activeFile,
    });
    window.open(previewPath, "_blank", "noopener,noreferrer");
  }, [getCurrentFilesSnapshot, onPreviewSnapshot, onSnapshotChange, previewPath, sandpack.activeFile]);

  const {
    expandedMobilePanels,
    explorerWidth,
    resizeExplorer,
    showExplorer,
    showPreview,
    showTerminal,
    toggleExplorer,
    toggleMobilePanel,
    togglePreview,
    toggleTerminal,
  } = useEditorLayout({ hasTerminal: canRunCode });

  const startExplorerResize = useCallback(
    (event) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = explorerPanelRef.current?.getBoundingClientRect().width || explorerWidth;

      const handlePointerMove = (moveEvent) => {
        resizeExplorer(startWidth + moveEvent.clientX - startX);
      };

      const stopResize = () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", stopResize);
        document.body.classList.remove("is-resizing-explorer");
      };

      document.body.classList.add("is-resizing-explorer");
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", stopResize);
    },
    [explorerWidth, resizeExplorer]
  );

  const mobilePanelClass = useCallback(
    (panel) => `mobile-panel ${panel}-panel ${expandedMobilePanels[panel] ? "expanded" : "collapsed"}`,
    [expandedMobilePanels]
  );

  return (
    <div className="editor-page">
      <EditorTopbar
        projectName={projectName}
        nameDraft={nameDraft}
        setNameDraft={setNameDraft}
        onCommitName={commitName}
      />

      <div className="editor-view-controls" aria-label="Editor layout controls">
        <button className={`view-toggle ${showExplorer ? "active" : ""}`} type="button" onClick={toggleExplorer}>
          <span className="view-toggle-dot" />
          <span>Explorer</span>
        </button>
        <button className={`view-toggle ${showPreview ? "active" : ""}`} type="button" onClick={togglePreview}>
          <span className="view-toggle-dot" />
          <span>Preview</span>
        </button>
        {canRunCode ? (
          <button className={`view-toggle ${showTerminal ? "active" : ""}`} type="button" onClick={toggleTerminal}>
            <span className="view-toggle-dot" />
            <span>Terminal</span>
          </button>
        ) : null}
      </div>

      <SandpackLayout className="custom-layout">
        {showExplorer ? (
          <aside
            className={mobilePanelClass("explorer")}
            ref={explorerPanelRef}
            style={{ "--explorer-width": `${explorerWidth}px` } as any}
          >
            <button className="mobile-panel-header" type="button" onClick={() => toggleMobilePanel("explorer")}>
              <span>Explorer</span>
              <span>{expandedMobilePanels.explorer ? "Collapse" : "Expand"}</span>
            </button>

            <div className="mobile-panel-body files-panel-body">
              <FileExplorerPanel
                filePathInputRef={filePathInputRef}
                newFilePath={newFilePath}
                setNewFilePath={setNewFilePath}
                onAddFile={addFile}
                treeNodes={treeNodes}
                activeFile={sandpack.activeFile}
                expandedFolders={expandedFolders}
                onToggleFolder={toggleFolder}
                onOpenFile={openFile}
                onAddNode={addTreeNode}
                onDeleteNode={deleteTreeNode}
                onCreateRootFile={createRootFile}
                onCreateRootFolder={createRootFolder}
                onMoveNodes={moveTreeNodes}
              />

              <PackageManagerPanel
                packageSearchRef={packageSearchRef}
                installedPackages={installedPackages}
                packageQuery={packageQuery}
                setPackageQuery={setPackageQuery}
                isSearchingPackages={isSearchingPackages}
                packageError={packageError}
                packageResults={packageResults}
                addingPackage={addingPackage}
                isPackageInstalled={isPackageInstalled}
                onAddPackage={addPackage}
              />
            </div>

            <div
              aria-label="Resize file explorer"
              className="explorer-resize-handle"
              onPointerDown={startExplorerResize}
              role="separator"
            />
          </aside>
        ) : null}

        <section className={`${mobilePanelClass("editor")} editor-theme-${editorTheme}`}>
          <button className="mobile-panel-header" type="button" onClick={() => toggleMobilePanel("editor")}>
            <span>Editor</span>
            <span>{expandedMobilePanels.editor ? "Collapse" : "Expand"}</span>
          </button>

          <div className="mobile-panel-body code-panel-body">
            <div className="code-panel-toolbar">
              <span>{sandpack.activeFile}</span>

              <div className="editor-toolbar-actions">
                <label className="editor-theme-select">
                  <span>Theme</span>
                  <select value={editorTheme} onChange={(event) => setEditorTheme(event.target.value)}>
                    {EDITOR_THEME_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                {canRunCode ? (
                  <button
                    className="button primary run-code-button"
                    type="button"
                    onClick={() => setRunRequest((value) => value + 1)}
                  >
                    <span className="run-code-icon">▶</span>
                    <span>Run Code</span>
                  </button>
                ) : null}
              </div>
            </div>

          <MonacoCodeEditor
            activeFile={sandpack.activeFile}
            code={activeFileCode}
            theme={editorTheme}
            height="calc(100vh - 228px)"
            onChange={updateActiveFile}
            onEditorReady={(editor) => {
              monacoEditorRef.current = editor;
            }}
          />
          </div>
        </section>

        <aside
          className={`runtime-panel ${!showPreview && showTerminal ? "runtime-panel-terminal-only" : ""} ${
            !showPreview && !showTerminal ? "runtime-panel-hidden" : ""
          }`}
        >
          <section
            aria-hidden={!showPreview}
            className={`${mobilePanelClass("preview")} ${!showPreview ? "preview-panel-hidden" : ""}`}
          >
            <button className="mobile-panel-header" type="button" onClick={() => toggleMobilePanel("preview")}>
              <span>Preview</span>
              <span>{expandedMobilePanels.preview ? "Collapse" : "Expand"}</span>
            </button>

            <div className="mobile-panel-body preview-panel-body">
              <PreviewPanel
                onOpenPreview={openPreviewInNewTab}
                onRefreshPreview={refreshPreviewWithCurrentCode}
              />
            </div>
          </section>

          {showTerminal ? (
            <section className={mobilePanelClass("terminal")}>
              <button className="mobile-panel-header" type="button" onClick={() => toggleMobilePanel("terminal")}>
                <span>Terminal</span>
                <span>{expandedMobilePanels.terminal ? "Collapse" : "Expand"}</span>
              </button>

              <div className="mobile-panel-body terminal-panel-body">
                <div className="preview-title">Terminal</div>
                <TerminalPanel
                  activeFile={sandpack.activeFile}
                  activeFileCode={activeFileCode}
                  runRequest={runRequest}
                />
              </div>
            </section>
          ) : null}
        </aside>
      </SandpackLayout>
    </div>
  );
}
