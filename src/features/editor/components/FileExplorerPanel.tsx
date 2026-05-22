import { FilePlus2, FolderPlus } from "lucide-react";
import { Tree } from "react-arborist";
import FileTreeNode from "./FileTreeNode";
import type { FileTreeItem } from "@/features/editor/lib/fileTree";

export default function FileExplorerPanel({
  filePathInputRef,
  newFilePath,
  setNewFilePath,
  onAddFile,
  treeNodes,
  activeFile,
  expandedFolders,
  onToggleFolder,
  onOpenFile,
  onAddNode,
  onDeleteNode,
  onCreateRootFile,
  onCreateRootFolder,
  onMoveNodes,
  collapsed,
  onToggleCollapsed,
}) {
  return (
    <>
      <div className="sidebar-section-header">
        <button className="sidebar-collapse-button" type="button" onClick={onToggleCollapsed}>
          <span>{collapsed ? "▸" : "▾"}</span>
          <h3>FILES</h3>
        </button>
        <div className="file-header-actions">
          <button
            type="button"
            className="mini-button"
            onClick={onCreateRootFile}
            title="Add file"
          >
            <FilePlus2 size={14} />
          </button>
          <button
            type="button"
            className="mini-button"
            onClick={onCreateRootFolder}
            title="Add folder"
          >
            <FolderPlus size={14} />
          </button>
        </div>
      </div>

      {!collapsed ? (
        <>
          <form className="add-file-form" onSubmit={onAddFile}>
            <input
              ref={filePathInputRef}
              type="text"
              value={newFilePath}
              onChange={(event) => setNewFilePath(event.target.value)}
              placeholder="src/components/Button.jsx or src/components/"
            />
          </form>

          <div className="file-tree">
            <Tree<FileTreeItem>
              data={treeNodes}
              idAccessor="path"
              childrenAccessor={(node) => (node.type === "folder" ? node.children : null)}
              selection={activeFile}
              openByDefault
              rowHeight={30}
              width="100%"
              height={420}
              indent={18}
              overscanCount={8}
              disableMultiSelection
              disableDrop={({ parentNode, dragNodes }) => {
                if (!parentNode || parentNode.isRoot) {
                  return false;
                }

                if (parentNode.data.type !== "folder") {
                  return true;
                }

                return dragNodes.some((dragNode) => {
                  return dragNode.data.type === "folder" && parentNode.data.path.startsWith(`${dragNode.data.path}/`);
                });
              }}
              onActivate={(node) => {
                if (node.data.type === "file") {
                  onOpenFile(node.data.path);
                }
              }}
              onToggle={onToggleFolder}
              onMove={onMoveNodes}
            >
              {(props) => (
                <FileTreeNode
                  {...props}
                  onAddNode={onAddNode}
                  onDeleteNode={onDeleteNode}
                />
              )}
            </Tree>
          </div>
        </>
      ) : null}
    </>
  );
}
