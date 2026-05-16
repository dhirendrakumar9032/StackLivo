import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";

type TerminalPanelProps = {
  activeFile: string;
  activeFileCode: string;
  filePaths: string[];
  installedPackages: Array<[string, string]>;
  projectName: string;
  runRequest: number;
};

const PROMPT = "\r\n$ ";

export default function TerminalPanel({
  activeFile,
  activeFileCode,
  filePaths,
  installedPackages,
  projectName,
  runRequest,
}: TerminalPanelProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const inputRef = useRef("");
  const stateRef = useRef({ activeFile, activeFileCode, filePaths, installedPackages, projectName });

  useEffect(() => {
    stateRef.current = { activeFile, activeFileCode, filePaths, installedPackages, projectName };
  }, [activeFile, activeFileCode, filePaths, installedPackages, projectName]);

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

    const writePrompt = () => terminal.write(PROMPT);

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

    const runActiveJavaScript = () => {
      const { activeFile: currentFile, activeFileCode: currentCode } = stateRef.current;

      if (!currentFile.endsWith(".js")) {
        terminal.writeln(`Run Code supports JavaScript files. Current file: ${currentFile}`);
        return;
      }

      terminal.writeln(`Running ${currentFile}`);

      try {
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
    };

    const runCommand = (rawCommand: string) => {
      const command = rawCommand.trim();
      const { activeFile: currentFile, filePaths: currentFiles, installedPackages: packages } = stateRef.current;

      if (!command) {
        writePrompt();
        return;
      }

      switch (command) {
        case "clear":
          terminal.clear();
          terminal.write("$ ");
          return;
        case "help":
          terminal.writeln("Commands: help, clear, files, active, packages, run");
          break;
        case "files":
          currentFiles.forEach((filePath) => terminal.writeln(filePath));
          break;
        case "active":
          terminal.writeln(currentFile || "No active file");
          break;
        case "packages":
          packages.forEach(([packageName, version]) => terminal.writeln(`${packageName}@${version}`));
          break;
        case "npm run dev":
        case "run":
          runActiveJavaScript();
          break;
        default:
          terminal.writeln(`Command not found: ${command}`);
          terminal.writeln("Type help to see available commands.");
      }

      writePrompt();
    };

    terminal.writeln("Stacklivo terminal");
    terminal.writeln("Type help to see available commands.");
    terminal.write("$ ");

    const disposable = terminal.onData((data) => {
      if (data === "\r") {
        terminal.write("\r\n");
        runCommand(inputRef.current);
        inputRef.current = "";
        return;
      }

      if (data === "\u007F") {
        if (inputRef.current.length > 0) {
          inputRef.current = inputRef.current.slice(0, -1);
          terminal.write("\b \b");
        }

        return;
      }

      if (data >= " ") {
        inputRef.current += data;
        terminal.write(data);
      }
    });

    resizeTerminal();
    const observer = new ResizeObserver(resizeTerminal);
    observer.observe(hostRef.current);

    return () => {
      observer.disconnect();
      disposable.dispose();
      terminal.dispose();
      terminalRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!runRequest || !terminalRef.current) {
      return;
    }

    terminalRef.current.write("\r\n$ run\r\n");
    const terminal = terminalRef.current;
    const currentFile = stateRef.current.activeFile;
    const currentCode = stateRef.current.activeFileCode;

    if (!currentFile.endsWith(".js")) {
      terminal.writeln(`Run Code supports JavaScript files. Current file: ${currentFile}`);
      terminal.write("$ ");
      return;
    }

    terminal.writeln(`Running ${currentFile}`);

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

    terminal.write("$ ");
  }, [runRequest]);

  return <div className="terminal-host" ref={hostRef} />;
}
