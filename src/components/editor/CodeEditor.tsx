import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { loader } from '@monaco-editor/react';
import type * as MonacoNs from 'monaco-editor';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/editor/editor.worker.js?worker';
import type { CodeLang } from '../../engine/types/step';
import { useI18n } from '../../hooks/useI18n';

// Monaco 使用 npm 包而非 CDN，并启用独立 worker
let configured = false;
function ensureConfigured(): void {
  if (configured) return;
  configured = true;
  const globalScope = self as unknown as {
    MonacoEnvironment?: { getWorker: () => Worker };
  };
  globalScope.MonacoEnvironment = {
    getWorker: () => new editorWorker(),
  };
  loader.config({ monaco });
}

const MonacoEditor = lazy(() =>
  import('@monaco-editor/react').then((m) => ({ default: m.Editor })),
);

const LANG_IDS: Record<CodeLang, string> = {
  cpp: 'cpp',
  csharp: 'csharp',
  python: 'python',
};

interface CodeEditorProps {
  source: string;
  language: CodeLang;
  highlightLine: number | null;
  theme: 'dark' | 'light';
  fontSize: number;
  className?: string;
  /** 可编辑模式（在线实验室用）；默认只读 */
  editable?: boolean;
  onChange?: (value: string) => void;
}

export function CodeEditor({
  source,
  language,
  highlightLine,
  theme,
  fontSize,
  className,
  editable = false,
  onChange,
}: CodeEditorProps) {
  ensureConfigured();
  const { t } = useI18n();
  const editorRef = useRef<MonacoNs.editor.IStandaloneCodeEditor | null>(null);
  const decorationRef = useRef<string[]>([]);
  const [ready, setReady] = useState(false);

  const onMount = (editor: MonacoNs.editor.IStandaloneCodeEditor): void => {
    editorRef.current = editor;
    editor.updateOptions({
      readOnly: !editable,
      domReadOnly: !editable,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: 'none',
      occurrencesHighlight: 'off',
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      lineNumbersMinChars: 3,
      folding: false,
      wordWrap: 'off',
      padding: { top: 10, bottom: 10 },
      automaticLayout: true,
    });
    setReady(true);
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    decorationRef.current = editor.deltaDecorations(
      decorationRef.current,
      highlightLine !== null
        ? [
            {
              range: new monaco.Range(highlightLine, 1, highlightLine, 1),
              options: { isWholeLine: true, className: 'cv-current-line' },
            },
          ]
        : [],
    );
    if (highlightLine !== null) {
      editor.revealLineInCenterIfOutsideViewport(highlightLine);
    }
  }, [highlightLine]);

  useEffect(() => {
    editorRef.current?.updateOptions({ fontSize });
  }, [fontSize]);

  useEffect(() => {
    monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
  }, [theme]);

  return (
    <div className={className}>
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center text-sm text-muted">
            {t.common.loading}
          </div>
        }
      >
        <MonacoEditor
          height="100%"
          language={LANG_IDS[language]}
          value={source}
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          onMount={onMount}
          onChange={(value) => onChange?.(value ?? '')}
          options={{
            readOnly: !editable,
            domReadOnly: !editable,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            renderLineHighlight: 'none',
            automaticLayout: true,
          }}
        />
      </Suspense>
      {/* 编辑器挂载前的占位高度，避免布局跳动 */}
      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex h-64 items-center justify-center text-sm text-muted">
          {t.common.loading}
        </div>
      )}
    </div>
  );
}
