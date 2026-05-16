import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SandpackLayout, SandpackPreview, useSandpack } from "@codesandbox/sandpack-react";
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
import MonacoCodeEditor from "@/features/editor/components/MonacoCodeEditor";
import PackageManagerPanel from "@/features/editor/components/PackageManagerPanel";
import TerminalPanel from "@/features/editor/components/TerminalPanel";
import { PROJECT_TYPES } from "@/entities/project/model/projectTemplates";

export default function EditorWorkspace({
  projectName,
  projectType,
  projectDependencies,
  onRenameProject,
  onSnapshotChange,
  onAddDependency,
}) {
  const { sandpack, dispatch } = useSandpack();

  const [newFilePath, setNewFilePath] = useState("");
  const [nameDraft, setNameDraft] = useState(projectName);
  const [addingPackage, setAddingPackage] = useState("");
  const [expandedFolders, setExpandedFolders] = useState(() => new Set(["/src"]));
  const [runRequest, setRunRequest] = useState(0);

  const filePathInputRef = useRef(null);
  const packageSearchRef = useRef(null);

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

  return (
    <div className="editor-page">
      <EditorTopbar
        projectName={projectName}
        nameDraft={nameDraft}
        setNameDraft={setNameDraft}
        onCommitName={commitName}
      />

      <SandpackLayout className="custom-layout">
        <aside className="files-panel">
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
        </aside>

        <section className="code-panel">
          {canRunCode ? (
            <div className="code-panel-toolbar">
              <span>{sandpack.activeFile}</span>
              <button className="button primary run-code-button" type="button" onClick={() => setRunRequest((value) => value + 1)}>
                Run Code
              </button>
            </div>
          ) : null}

          <MonacoCodeEditor
            activeFile={sandpack.activeFile}
            code={activeFileCode}
            height={canRunCode ? "calc(100vh - 228px)" : "calc(100vh - 180px)"}
            onChange={updateActiveFile}
          />
        </section>

        <aside className="runtime-panel">
          <section className="preview-panel">
            <div className="preview-title">Preview</div>
            <div className="iframe-preview-shell">
              <SandpackPreview
                showOpenInCodeSandbox={false}
                showRefreshButton
                style={{ height: "100%" }}
              />
            </div>
          </section>

          {canRunCode ? (
            <section className="terminal-panel">
              <div className="preview-title">Terminal</div>
              <TerminalPanel
                activeFile={sandpack.activeFile}
                activeFileCode={activeFileCode}
                filePaths={visibleFilePaths}
                installedPackages={installedPackages}
                projectName={projectName}
                runRequest={runRequest}
              />
            </section>
          ) : null}
        </aside>
      </SandpackLayout>
    </div>
  );
}
