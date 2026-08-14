import { useState } from 'react';
import type { AlgorithmMeta } from '../../engine/types/algorithm';
import type { InputError } from '../../engine/inputs/parsers';
import { randomInputForSpec, randomIntArray, arrayToInput } from '../../engine/inputs/generators';
import { buildShareUrl } from '../../lib/url-share';
import { useI18n } from '../../hooks/useI18n';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { IconCheck, IconEdit, IconLink, IconShuffle } from '../ui/Icons';

const SIZES = [
  { value: 5, label: '5' },
  { value: 8, label: '8' },
  { value: 15, label: '15' },
];

/** 输入栏：自定义输入 / 随机生成 / 预设与边界案例 / 分享链接 / 错误提示 */
export function InputBar({
  meta,
  rawInput,
  onRawChange,
  onApply,
  error,
  auxRaw,
  onAuxChange,
}: {
  meta: AlgorithmMeta;
  rawInput: string;
  onRawChange: (value: string) => void;
  onApply: (raw: string) => void;
  error: InputError | null;
  auxRaw: string;
  onAuxChange: (value: string) => void;
}) {
  const { t, locale, fmt } = useI18n();
  const [size, setSize] = useState(8);
  const [copied, setCopied] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState(false);
  const aux = meta.inputSpec.aux;
  const arrayOnly =
    meta.inputSpec.kind === 'int-array' && (meta.inputSpec.maxLen ?? 1) === 0;
  const placeholder =
    meta.inputSpec.kind === 'tree-array'
      ? t.playground.inputPlaceholderTree
      : meta.inputSpec.kind === 'edge-list'
        ? t.playground.inputPlaceholderEdge
        : t.playground.inputPlaceholder;
  /** 解析导入文本：分享链接（提取 input/aux 参数）或直接数据 */
  const doImport = (): void => {
    let text = importText.trim();
    if (!text) return;
    let auxValue: string | undefined;
    if (/^https?:\/\//i.test(text)) {
      try {
        const url = new URL(text);
        text = url.searchParams.get('input') ?? '';
        auxValue = url.searchParams.get('aux') ?? undefined;
      } catch {
        setImportError(true);
        return;
      }
    }
    if (!text) {
      setImportError(true);
      return;
    }
    onRawChange(text);
    if (auxValue !== undefined) onAuxChange(auxValue);
    onApply(text);
    setImportError(false);
    setImportOpen(false);
    setImportText('');
  };

  const randomize = (): void => {
    const text =
      meta.inputSpec.kind === 'int-array'
        ? arrayToInput(randomIntArray(meta.inputSpec, size))
        : randomInputForSpec(meta.inputSpec);
    onRawChange(text);
    onApply(text);
  };

  const applyCase = (input: string): void => {
    onRawChange(input);
    onApply(input);
  };

  const share = async (): Promise<void> => {
    const url = buildShareUrl(rawInput, meta.inputSpec.aux ? auxRaw : undefined);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 剪贴板不可用时静默失败 */
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 输入行 */}
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="algo-input" className="text-xs font-medium text-muted">
          {t.playground.inputLabel}
        </label>
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          {!arrayOnly && (
            <div className="relative min-w-0 flex-1">
              <IconEdit size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="algo-input"
                value={rawInput}
                onChange={(e) => onRawChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onApply(rawInput);
                }}
                placeholder={placeholder}
                className="h-9 w-full rounded-lg border border-border bg-surface pl-8 pr-3 font-mono text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-none"
                spellCheck={false}
              />
            </div>
          )}
          {arrayOnly && (
            <p className="min-w-0 flex-1 truncate text-xs text-muted">{t.playground.inputNotNeeded}</p>
          )}
          {aux && (
            <div className="flex shrink-0 items-center gap-1.5">
              <label htmlFor="algo-aux" className="whitespace-nowrap text-xs text-muted">
                {aux.name[locale]}
              </label>
              <input
                id="algo-aux"
                value={auxRaw}
                onChange={(e) => onAuxChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onApply(rawInput);
                }}
                inputMode="numeric"
                className="h-9 w-20 rounded-lg border border-border bg-surface px-2.5 font-mono text-sm text-text focus:border-accent focus:outline-none"
                spellCheck={false}
              />
            </div>
          )}
          <Button size="sm" variant="primary" onClick={() => onApply(rawInput)}>
            {t.common.applyInput}
          </Button>
        </div>
        <div className="flex items-center gap-1.5">
          {meta.inputSpec.kind === 'int-array' && (
            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              aria-label={t.playground.dataSize}
              className="h-8 rounded-md border border-border bg-surface px-1.5 text-xs text-muted focus:border-accent focus:outline-none"
            >
              {SIZES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          )}
          <Button size="sm" icon={<IconShuffle size={14} />} onClick={randomize} title={t.common.randomize}>
            <span className="hidden sm:inline">{t.common.randomize}</span>
          </Button>
          <Button
            size="sm"
            icon={copied ? <IconCheck size={14} /> : <IconLink size={14} />}
            onClick={() => void share()}
            title={t.common.share}
          >
            <span className="hidden md:inline">{copied ? t.common.copied : t.common.share}</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setImportOpen(true)} title={t.playground.importCase}>
            <span className="hidden md:inline">{t.playground.importCase}</span>
          </Button>
        </div>
      </div>

      {/* 预设 / 边界案例 chips */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-muted">{t.playground.presetCases}:</span>
        {meta.presets.map((preset) => (
          <button
            key={preset.input}
            type="button"
            onClick={() => applyCase(preset.input)}
            className="rounded-md border border-border bg-surface px-2 py-0.5 text-muted transition hover:border-borderstrong hover:text-text"
          >
            {preset.name[locale]}
          </button>
        ))}
        <span className="ml-2 text-muted">{t.playground.boundaryCases}:</span>
        {meta.boundaryCases.map((bc) => (
          <button
            key={bc.input}
            type="button"
            onClick={() => applyCase(bc.input)}
            className="rounded-md border border-border bg-surface px-2 py-0.5 text-muted transition hover:border-borderstrong hover:text-text"
          >
            {bc.name[locale]}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-2.5 py-1.5 text-xs text-danger">
          {fmt(t.errors[error.key], error.params)}
        </p>
      )}
      {copied && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">{t.playground.shareCopied}</p>
      )}

      {importOpen && (
        <Modal open={importOpen} onClose={() => setImportOpen(false)} title={t.playground.importCase}>
          <div className="flex flex-col gap-2">
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={t.playground.importPlaceholder}
              rows={3}
              className="w-full rounded-lg border border-border bg-surface p-2.5 font-mono text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-none"
            />
            {importError && (
              <p role="alert" className="text-xs text-danger">
                {t.playground.importFailed}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button size="sm" onClick={() => setImportOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button size="sm" variant="primary" onClick={doImport}>
                {t.common.confirm}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
