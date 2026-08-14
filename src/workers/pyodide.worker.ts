/**
 * Pyodide Web Worker：在独立线程中加载 Python 运行时并执行代码。
 * 运行时按需从 CDN 加载，绝不访问主线程 UI。
 */

declare function importScripts(...urls: string[]): void;

interface PyodideLike {
  runPythonAsync(code: string): Promise<unknown>;
  setStdout(options: { batched: (text: string) => void }): void;
  setStderr(options: { batched: (text: string) => void }): void;
}

interface WorkerScope {
  onmessage: ((e: MessageEvent) => void) | null;
  postMessage(message: unknown): void;
}

const scope = self as unknown as WorkerScope;

type IncomingMessage = { type: 'load' } | { type: 'run'; code: string };

const PYODIDE_VERSION = '0.26.4';
const CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodide: PyodideLike | null = null;

function post(message: unknown): void {
  scope.postMessage(message);
}

scope.onmessage = (e: MessageEvent): void => {
  const msg = e.data as IncomingMessage;
  if (msg.type === 'load') {
    void loadRuntime();
  } else if (msg.type === 'run') {
    void runCode(msg.code);
  }
};

async function loadRuntime(): Promise<void> {
  try {
    importScripts(`${CDN}pyodide.js`);
    const loader = (self as unknown as { loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideLike> })
      .loadPyodide;
    if (!loader) {
      post({ type: 'load-error', message: 'loadPyodide 不可用' });
      return;
    }
    pyodide = await loader({ indexURL: CDN });
    pyodide.setStdout({ batched: (text: string) => post({ type: 'output', text }) });
    pyodide.setStderr({ batched: (text: string) => post({ type: 'output', text }) });
    post({ type: 'loaded' });
  } catch (err) {
    post({ type: 'load-error', message: err instanceof Error ? err.message : String(err) });
  }
}

async function runCode(code: string): Promise<void> {
  if (!pyodide) {
    post({ type: 'error', message: 'runtime not loaded' });
    return;
  }
  try {
    const value = await pyodide.runPythonAsync(code);
    post({ type: 'result', value: value === undefined ? '' : String(value) });
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
}
