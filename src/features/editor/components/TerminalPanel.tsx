import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";

type TerminalPanelProps = {
  activeFile: string;
  activeFileCode: string;
  runRequest: number;
};

export default function TerminalPanel({
  activeFile,
  activeFileCode,
  runRequest,
}: TerminalPanelProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const stateRef = useRef({ activeFile, activeFileCode });

  useEffect(() => {
    stateRef.current = { activeFile, activeFileCode };
  }, [activeFile, activeFileCode]);

  useEffect(() => {
    if (!hostRef.current || terminalRef.current) {
      return;
    }

    const terminal = new Terminal({
      cursorBlink: true,
      convertEol: true,
      fontFamily: '"Fira Code", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
      fontSize: 13,
      rows: 10,
      disableStdin: true,
      theme: {
        background: "#050b18",
        foreground: "#dce8ff",
        cursor: "#9fd2ff",
        selectionBackground: "#264569",
        black: "#071022",
        blue: "#80bdff",
        cyan: "#75e4ff",
        green: "#8df2a6",
        magenta: "#c8a5ff",
        red: "#ff8da1",
        white: "#edf5ff",
        yellow: "#f2d982",
      },
    });

    terminalRef.current = terminal;
    terminal.open(hostRef.current);

    const resizeTerminal = () => {
      const bounds = hostRef.current?.getBoundingClientRect();

      if (!bounds) {
        return;
      }

      terminal.resize(
        Math.max(30, Math.floor(bounds.width / 8.2)),
        Math.max(8, Math.floor(bounds.height / 18))
      );
    };

    resizeTerminal();
    const observer = new ResizeObserver(resizeTerminal);
    observer.observe(hostRef.current);

    return () => {
      observer.disconnect();
      terminal.dispose();
      terminalRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!runRequest || !terminalRef.current) {
      return;
    }

    const terminal = terminalRef.current;
    const currentFile = stateRef.current.activeFile;
    const currentCode = stateRef.current.activeFileCode;

    terminal.clear();

    if (!currentFile.endsWith(".js")) {
      terminal.writeln(`Run Code supports JavaScript files. Current file: ${currentFile}`);
      return;
    }

    try {
      const formatValue = (value: unknown) => {
        if (typeof value === "string") {
          return value;
        }

        try {
          return JSON.stringify(value);
        } catch {
          return String(value);
        }
      };
      const consoleProxy = {
        log: (...messages: unknown[]) => terminal.writeln(messages.map(formatValue).join(" ")),
        info: (...messages: unknown[]) => terminal.writeln(messages.map(formatValue).join(" ")),
        warn: (...messages: unknown[]) => terminal.writeln(`Warning: ${messages.map(formatValue).join(" ")}`),
        error: (...messages: unknown[]) => terminal.writeln(`Error: ${messages.map(formatValue).join(" ")}`),
      };
      const result = new Function("console", currentCode)(consoleProxy);

      if (typeof result !== "undefined") {
        terminal.writeln(formatValue(result));
      }
    } catch (error) {
      terminal.writeln(error instanceof Error ? error.message : String(error));
    }
  }, [runRequest]);

  return <div className="terminal-host" ref={hostRef} />;
}
