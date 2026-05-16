import { useCallback, useRef, useState } from "react";
import { SandpackPreview } from "@codesandbox/sandpack-react";
import type { SandpackPreviewRef } from "@codesandbox/sandpack-react";
import { RefreshCw, SquareArrowOutUpRight } from "lucide-react";

type PreviewPanelProps = {
  onOpenPreview: () => void;
  onRefreshPreview: () => Record<string, unknown>;
};

export default function PreviewPanel({ onOpenPreview, onRefreshPreview }: PreviewPanelProps) {
  const previewRef = useRef<SandpackPreviewRef | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshPreview = useCallback(() => {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    const files = onRefreshPreview();

    window.setTimeout(() => {
      const client = previewRef.current?.getClient();

      if (client) {
        client.updateSandbox({
          ...client.sandboxSetup,
          files: files as any,
        });
        client.dispatch({ type: "refresh" } as any);
      }
    }, 80);

    window.setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  }, [isRefreshing, onRefreshPreview]);

  return (
    <>
      <div className="preview-panel-head">
        <div className="preview-title">Preview</div>
        <div className="preview-actions-row">
          <button className="open-preview-button" type="button" onClick={onOpenPreview}>
            <SquareArrowOutUpRight size={16} />
          </button>
        </div>
      </div>
      <div className="iframe-preview-shell">
        <SandpackPreview
          ref={previewRef}
          actionsChildren={
            <button
              aria-label="Refresh preview"
              className="preview-frame-action"
              disabled={isRefreshing}
              title="Refresh preview"
              type="button"
              onClick={refreshPreview}
            >
              <RefreshCw size={14} />
            </button>
          }
          showOpenInCodeSandbox={false}
          showRefreshButton={false}
          style={{ height: "100%" }}
        />
      </div>
    </>
  );
}
