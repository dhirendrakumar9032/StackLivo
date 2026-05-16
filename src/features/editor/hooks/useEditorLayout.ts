import { useCallback, useState } from "react";

const MIN_EXPLORER_WIDTH = 240;
const MAX_EXPLORER_WIDTH = 520;

function clampExplorerWidth(width: number) {
  return Math.min(MAX_EXPLORER_WIDTH, Math.max(MIN_EXPLORER_WIDTH, width));
}

export function useEditorLayout({ hasTerminal }: { hasTerminal: boolean }) {
  const [explorerWidth, setExplorerWidth] = useState(320);
  const [showExplorer, setShowExplorer] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [showTerminal, setShowTerminal] = useState(hasTerminal);
  const [expandedMobilePanels, setExpandedMobilePanels] = useState(() => ({
    explorer: true,
    editor: true,
    preview: true,
    terminal: hasTerminal,
  }));

  const resizeExplorer = useCallback((nextWidth: number) => {
    setExplorerWidth(clampExplorerWidth(nextWidth));
  }, []);

  const toggleMobilePanel = useCallback((panel: "explorer" | "editor" | "preview" | "terminal") => {
    setExpandedMobilePanels((current) => ({
      ...current,
      [panel]: !current[panel],
    }));
  }, []);

  const toggleTerminal = useCallback(() => {
    setShowTerminal((current) => {
      const next = !current;

      if (next) {
        setExpandedMobilePanels((panels) => ({ ...panels, terminal: true }));
      }

      return next;
    });
  }, []);

  const togglePreview = useCallback(() => {
    setShowPreview((current) => {
      const next = !current;

      if (next) {
        setExpandedMobilePanels((panels) => ({ ...panels, preview: true }));
      }

      return next;
    });
  }, []);

  const toggleExplorer = useCallback(() => {
    setShowExplorer((current) => {
      const next = !current;

      if (next) {
        setExpandedMobilePanels((panels) => ({ ...panels, explorer: true }));
      }

      return next;
    });
  }, []);

  return {
    expandedMobilePanels,
    explorerWidth,
    resizeExplorer,
    showExplorer,
    showPreview,
    showTerminal: hasTerminal && showTerminal,
    toggleExplorer,
    toggleMobilePanel,
    togglePreview,
    toggleTerminal,
  };
}
