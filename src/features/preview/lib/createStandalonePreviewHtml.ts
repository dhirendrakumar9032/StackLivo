import { transform } from "@babel/standalone";

const SCRIPT_EXTENSIONS = [".jsx", ".js", ".tsx", ".ts"];

function getFileCode(file) {
  return typeof file === "string" ? file : file?.code || "";
}

function isScriptPath(path) {
  return SCRIPT_EXTENSIONS.some((extension) => path.endsWith(extension));
}

function isCssPath(path) {
  return path.endsWith(".css");
}

function stripCssImports(code) {
  return code
    .replace(/^\s*import\s+["'][^"']+\.css["'];?\s*$/gm, "")
    .replace(/^\s*import\s+[^;]+from\s+["'][^"']+\.css["'];?\s*$/gm, "");
}

function resolveRelativePath(specifier, fromPath, files) {
  const fromSegments = fromPath.split("/");
  fromSegments.pop();

  const parts = [...fromSegments, ...specifier.split("/")];
  const resolved = [];

  for (const part of parts) {
    if (!part || part === ".") {
      continue;
    }

    if (part === "..") {
      resolved.pop();
      continue;
    }

    resolved.push(part);
  }

  const basePath = `/${resolved.join("/")}`;
  const candidates = [
    basePath,
    ...SCRIPT_EXTENSIONS.map((extension) => `${basePath}${extension}`),
    ...SCRIPT_EXTENSIONS.map((extension) => `${basePath}/index${extension}`),
  ];

  return candidates.find((candidate) => files[candidate]) || basePath;
}

function createPackageUrl(packageName, dependencies) {
  if (packageName === "react") {
    return "__STACKLIVO_REACT_MODULE__";
  }

  if (packageName === "react-dom/client") {
    return "__STACKLIVO_REACT_DOM_CLIENT_MODULE__";
  }

  if (packageName === "react/jsx-runtime") {
    return "__STACKLIVO_JSX_RUNTIME_MODULE__";
  }

  const version = dependencies?.[packageName];
  return `https://esm.sh/${packageName}${version ? `@${version}` : ""}`;
}

function createObjectUrl(code) {
  return URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
}

function createReactBridgeModules() {
  return {
    react: createObjectUrl(`
      const React = window.parent.__STACKLIVO_REACT__;
      export default React;
      export const Children = React.Children;
      export const Component = React.Component;
      export const Fragment = React.Fragment;
      export const Profiler = React.Profiler;
      export const PureComponent = React.PureComponent;
      export const StrictMode = React.StrictMode;
      export const Suspense = React.Suspense;
      export const cloneElement = React.cloneElement;
      export const createContext = React.createContext;
      export const createElement = React.createElement;
      export const createRef = React.createRef;
      export const forwardRef = React.forwardRef;
      export const isValidElement = React.isValidElement;
      export const lazy = React.lazy;
      export const memo = React.memo;
      export const startTransition = React.startTransition;
      export const useCallback = React.useCallback;
      export const useContext = React.useContext;
      export const useDebugValue = React.useDebugValue;
      export const useDeferredValue = React.useDeferredValue;
      export const useEffect = React.useEffect;
      export const useId = React.useId;
      export const useImperativeHandle = React.useImperativeHandle;
      export const useInsertionEffect = React.useInsertionEffect;
      export const useLayoutEffect = React.useLayoutEffect;
      export const useMemo = React.useMemo;
      export const useReducer = React.useReducer;
      export const useRef = React.useRef;
      export const useState = React.useState;
      export const useSyncExternalStore = React.useSyncExternalStore;
      export const useTransition = React.useTransition;
      export const version = React.version;
    `),
    reactDomClient: createObjectUrl(`
      const ReactDOMClient = window.parent.__STACKLIVO_REACT_DOM_CLIENT__;
      export const createRoot = ReactDOMClient.createRoot;
      export const hydrateRoot = ReactDOMClient.hydrateRoot;
      export default ReactDOMClient;
    `),
    jsxRuntime: createObjectUrl(`
      const Runtime = window.parent.__STACKLIVO_JSX_RUNTIME__;
      export const Fragment = Runtime.Fragment;
      export const jsx = Runtime.jsx;
      export const jsxs = Runtime.jsxs;
      export default Runtime;
    `),
  };
}

function createModuleBuilder(files, dependencies) {
  const moduleUrls = new Map();
  const bridgeModules = createReactBridgeModules();

  const buildModule = (path) => {
    if (moduleUrls.has(path)) {
      return moduleUrls.get(path);
    }

    const placeholderUrl = createObjectUrl("");
    moduleUrls.set(path, placeholderUrl);

    const source = stripCssImports(getFileCode(files[path]));
    const presets: Array<string | [string, Record<string, unknown>]> = [["react", { runtime: "automatic" }]];

    if (path.endsWith(".ts") || path.endsWith(".tsx")) {
      presets.push(["typescript", { allExtensions: true, isTSX: path.endsWith(".tsx") }]);
    }

    const transformed = transform(source, {
      filename: path,
      presets,
      sourceType: "module",
    }).code || source;

    const rewritten = transformed.replace(
      /(from\s*["']|import\s*["'])([^"']+)(["'])/g,
      (match, prefix, specifier, suffix) => {
        if (specifier.startsWith(".") || specifier.startsWith("/")) {
          const resolvedPath = specifier.startsWith("/")
            ? specifier
            : resolveRelativePath(specifier, path, files);

          if (isCssPath(resolvedPath)) {
            return match;
          }

          return `${prefix}${buildModule(resolvedPath)}${suffix}`;
        }

        return `${prefix}${createPackageUrl(specifier, dependencies)}${suffix}`;
      }
    )
      .replaceAll("__STACKLIVO_REACT_MODULE__", bridgeModules.react)
      .replaceAll("__STACKLIVO_REACT_DOM_CLIENT_MODULE__", bridgeModules.reactDomClient)
      .replaceAll("__STACKLIVO_JSX_RUNTIME_MODULE__", bridgeModules.jsxRuntime);

    const moduleUrl = createObjectUrl(rewritten);
    moduleUrls.set(path, moduleUrl);
    URL.revokeObjectURL(placeholderUrl);
    return moduleUrl;
  };

  return buildModule;
}

function collectCss(files) {
  return Object.entries(files)
    .filter(([path]) => isCssPath(path))
    .map(([, file]) => getFileCode(file))
    .join("\n\n");
}

export function createStandalonePreviewHtml({ files, entryFile, projectType, dependencies }) {
  const css = collectCss(files);
  const buildModule = createModuleBuilder(files, dependencies);
  const entryUrl = buildModule(entryFile);

  if (projectType === "javascript" && files["/index.html"]) {
    const html = getFileCode(files["/index.html"])
      .replace(/<link[^>]+href=["'][^"']+\.css["'][^>]*>/gi, "")
      .replace(/<script[^>]+src=["'][^"']+["'][^>]*><\/script>/gi, "")
      .replace("</head>", `<style>${css}</style></head>`)
      .replace("</body>", `<script type="module" src="${entryUrl}"></script></body>`);

    return html;
  }

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>${css}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${entryUrl}"></script>
  </body>
</html>`;
}
