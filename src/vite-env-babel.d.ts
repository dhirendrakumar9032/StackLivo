declare module "@babel/standalone" {
  export function transform(code: string, options: Record<string, unknown>): { code?: string };
}

interface Window {
  __STACKLIVO_REACT__?: unknown;
  __STACKLIVO_REACT_DOM_CLIENT__?: unknown;
  __STACKLIVO_JSX_RUNTIME__?: unknown;
}
