import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../stores/settingsStore';
import { useI18n } from '../hooks/useI18n';
import { cn } from '../lib/cn';
import { CodeEditor } from '../components/editor/CodeEditor';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { IconAlert, IconCheck, IconInfo, IconPlay, IconReset } from '../components/ui/Icons';

type LabTab = 'python' | 'cpp' | 'csharp';
type RuntimeStatus = 'idle' | 'loading' | 'ready' | 'failed';

type WorkerResponse =
  | { type: 'loaded' }
  | { type: 'load-error'; message: string }
  | { type: 'output'; text: string }
  | { type: 'result'; value: string }
  | { type: 'error'; message: string };

const RUN_TIMEOUT_MS = 10_000;

/** 在线实验室：Python 经 Pyodide 在 Web Worker 中真实执行；C++/C# 为演示模式说明 */
export function LabPage() {
  const { t } = useI18n();
  const theme = useSettings((s) => s.theme);
  const fontSize = useSettings((s) => s.fontSize);
  const [tab, setTab] = useState<LabTab>('python');
  const [status, setStatus] = useState<RuntimeStatus>('idle');
  const [code, setCode] = useState(t.lab.python.example);
  const [output, setOutput] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const loadRuntime = useCallback(() => {
    if (workerRef.current) return;
    setStatus('loading');
    setError(null);
    const worker = new Worker(new URL('../workers/pyodide.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      switch (msg.type) {
        case 'loaded':
          setStatus('ready');
          break;
        case 'load-error':
          setStatus('failed');
          setError(msg.message);
          worker.terminate();
          if (workerRef.current === worker) workerRef.current = null;
          break;
        case 'output':
          setOutput((prev) => [...prev, msg.text]);
          break;
        case 'result':
          setResult(msg.value);
          clearTimeoutIfAny();
          break;
        case 'error':
          setError(msg.message);
          clearTimeoutIfAny();
          break;
      }
    };
    worker.postMessage({ type: 'load' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearTimeoutIfAny(): void {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  useEffect(() => {
    loadRuntime();
    return () => {
      clearTimeoutIfAny();
      workerRef.current?.terminate();
      workerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = (): void => {
    const worker = workerRef.current;
    if (!worker || status !== 'ready') return;
    setOutput([]);
    setResult(null);
    setError(null);
    worker.postMessage({ type: 'run', code });
    timeoutRef.current = window.setTimeout(() => {
      setError(t.lab.python.timeout);
      workerRef.current?.terminate();
      workerRef.current = null;
      setStatus('idle');
      loadRuntime();
    }, RUN_TIMEOUT_MS);
  };

  const retryRuntime = (): void => {
    clearTimeoutIfAny();
    workerRef.current?.terminate();
    workerRef.current = null;
    setOutput([]);
    setResult(null);
    setError(null);
    loadRuntime();
  };

  const resetWorkbench = (): void => {
    setCode(t.lab.python.example);
    setOutput([]);
    setResult(null);
    setError(null);
  };

  const statusBadge = (() => {
    switch (status) {
      case 'ready':
        return (
          <Badge tone="done">
            <IconCheck size={11} />
            {t.lab.python.ready}
          </Badge>
        );
      case 'loading':
        return <Badge tone="accent">{t.lab.python.loading}</Badge>;
      case 'failed':
        return (
          <Badge tone="danger">
            <IconAlert size={11} />
            {t.lab.python.notReady}
          </Badge>
        );
      case 'idle':
        return <Badge tone="neutral">{t.lab.python.notReady}</Badge>;
    }
  })();

  const demoModeCard = (name: string, desc: string) => (
    <div className="surface-panel flex flex-col gap-3 p-5 sm:p-6">
      <h2 className="font-editorial text-xl font-semibold">{name}</h2>
      <p className="max-w-xl text-sm leading-relaxed text-muted">{desc}</p>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface2/60 px-3 py-2 text-xs text-muted">
        <IconInfo size={14} className="mt-0.5 shrink-0 text-accent" />
        {t.playground.demoModeNote}
      </div>
      <Link to="/algorithms" className="text-sm font-medium text-accent hover:underline">
        {t.nav.algorithms} →
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <header className="coordinate-frame surface-panel p-5 sm:p-7">
        <p className="micro-label text-accent">Live coding / workbench</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">{t.lab.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{t.lab.subtitle}</p>
      </header>

      <Tabs
        items={[
          { id: 'python', label: <><span className="sm:hidden">Python</span><span className="hidden sm:inline">{t.lab.python.name}</span></> },
          { id: 'cpp', label: <><span className="sm:hidden">C++</span><span className="hidden sm:inline">{t.lab.cpp.name}</span></> },
          { id: 'csharp', label: <><span className="sm:hidden">C#</span><span className="hidden sm:inline">{t.lab.csharp.name}</span></> },
        ]}
        active={tab}
        onChange={(id) => setTab(id as LabTab)}
      />

      {tab === 'python' ? (
        <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
          <section className="surface-panel flex min-h-[460px] flex-col overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-text">{t.lab.python.name}</h2>
                <span aria-live="polite">{statusBadge}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="ghost" icon={<IconReset size={14} />} onClick={resetWorkbench}>
                  {t.common.clear}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<IconPlay size={14} />}
                  onClick={run}
                  disabled={status !== 'ready'}
                >
                  {t.lab.python.run}
                </Button>
              </div>
            </div>
            <div className="relative min-h-80 flex-1">
              <CodeEditor
                source={code}
                language="python"
                highlightLine={null}
                theme={theme}
                fontSize={fontSize}
                className="absolute inset-0"
                editable
                onChange={setCode}
              />
            </div>
            <p className="border-t border-border px-3 py-2 text-[11px] leading-relaxed text-muted">
              {t.lab.python.desc}
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <div className="rounded-2xl border border-border bg-surface">
              <div className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                {t.lab.python.stdout}
              </div>
              <pre
                className={cn(
                  'max-h-64 overflow-auto whitespace-pre-wrap break-all p-3 font-mono text-xs leading-5',
                  output.length === 0 && result === null && !error ? 'text-muted' : 'text-text',
                )}
              >
                {output.join('')}
                {output.length === 0 && result === null && !error ? t.panels.empty : ''}
              </pre>
            </div>
            {result !== null && result !== '' && (
              <div className="rounded-2xl border border-border bg-surface">
                <div className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  {t.lab.python.result}
                </div>
                <pre className="whitespace-pre-wrap break-all p-3 font-mono text-xs text-emerald-600 dark:text-emerald-400">
                  {result}
                </pre>
              </div>
            )}
            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-danger/40 bg-danger/10"
              >
                <div className="border-b border-danger/30 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-danger">
                  {t.lab.python.runtimeError}
                </div>
                <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all p-3 font-mono text-xs text-danger">
                  {error}
                </pre>
              </div>
            )}
            {status === 'loading' && (
              <div className="surface-panel p-4 text-xs leading-relaxed text-muted" role="status">
                <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-surface2">
                  <span className="block h-full w-2/3 animate-pulse rounded-full bg-accent" />
                </div>
                {t.lab.python.loading}
              </div>
            )}
            {status === 'failed' && (
              <div className="flex flex-col items-start gap-2 rounded-2xl border border-danger/30 bg-danger/5 p-4">
                <p className="text-xs leading-relaxed text-muted">{t.lab.python.loadFailed}</p>
                <Button size="sm" icon={<IconReset size={14} />} onClick={retryRuntime}>
                  {t.common.retry}
                </Button>
              </div>
            )}
          </section>
        </div>
      ) : tab === 'cpp' ? (
        demoModeCard(t.lab.cpp.name, t.lab.cpp.desc)
      ) : (
        demoModeCard(t.lab.csharp.name, t.lab.csharp.desc)
      )}
    </div>
  );
}
