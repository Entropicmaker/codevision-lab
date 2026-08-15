import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAlgorithmMeta } from '../content/algorithms/registry';
import { getRunner } from '../engine/runners/registry';
import {
  parseAuxOrDefault,
  parseInputByKind,
  type InputError,
} from '../engine/inputs/parsers';
import { randomInputForSpec } from '../engine/inputs/generators';
import { readAuxFromUrl, readInputFromUrl, writeInputToUrl } from '../lib/url-share';
import { usePlayback } from '../engine/playback/usePlayback';
import { clampSpeed, useSettings } from '../stores/settingsStore';
import { useProgress } from '../stores/progressStore';
import { useI18n } from '../hooks/useI18n';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useKeyboardShortcuts, type ShortcutAction } from '../hooks/useKeyboardShortcuts';
import { renderVisual } from '../renderers/registry';
import { NotFoundPage } from './NotFoundPage';
import { LeftSidebar } from '../components/layout/LeftSidebar';
import { RightStatusPanel } from '../components/layout/RightStatusPanel';
import { InputBar } from '../components/layout/InputBar';
import { BottomControlBar } from '../components/layout/BottomControlBar';
import { LanguageSwitcher } from '../components/editor/LanguageSwitcher';
import { PseudocodePanel } from '../components/panels/PseudocodePanel';
import { MistakesPanel } from '../components/panels/MistakesPanel';
import { ComplexityPanel } from '../components/panels/ComplexityPanel';
import { ExplanationPanel } from '../components/panels/ExplanationPanel';
import { StateLegend } from '../components/viz/StateLegend';
import { VizCanvas } from '../components/viz/VizCanvas';
import { Badge, DifficultyBadge } from '../components/ui/Badge';
import { Kbd } from '../components/ui/Kbd';
import { Modal } from '../components/ui/Modal';
import { TabbedPanels } from '../components/ui/Tabs';
import { IconCheck, IconChevronRight, IconInfo, IconStar } from '../components/ui/Icons';

const CodeEditor = lazy(() =>
  import('../components/editor/CodeEditor').then((module) => ({ default: module.CodeEditor })),
);

function ShortcutHelp({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const rows: Array<{ keys: string[]; label: string }> = [
    { keys: ['Space'], label: t.playground.shortcuts.space },
    { keys: ['←'], label: t.playground.shortcuts.prev },
    { keys: ['→'], label: t.playground.shortcuts.next },
    { keys: ['R'], label: t.playground.shortcuts.reset },
    { keys: ['Home'], label: t.playground.shortcuts.start },
    { keys: ['End'], label: t.playground.shortcuts.end },
    { keys: ['S'], label: t.playground.shortcuts.random },
    { keys: ['['], label: t.playground.shortcuts.slower },
    { keys: [']'], label: t.playground.shortcuts.faster },
  ];
  return (
    <Modal open onClose={onClose} title={t.playground.shortcutHelp}>
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="contents">
            <span className="flex gap-1">
              {row.keys.map((k) => (
                <Kbd key={k}>{k}</Kbd>
              ))}
            </span>
            <span className="text-xs text-muted">{row.label}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/** 算法实验室：统一教学 / 演示页面（核心） */
export function AlgorithmPlaygroundPage() {
  const { algorithmId } = useParams();
  const meta = useMemo(
    () => (algorithmId ? getAlgorithmMeta(algorithmId) : undefined),
    [algorithmId],
  );
  const { t, locale, localize, fmt } = useI18n();
  // 三栏实验室需要足够横向空间；手机、平板与小桌面统一使用标签式阅读流。
  const isWideDesktop = useMediaQuery('(min-width: 1280px)');

  const codeLang = useSettings((s) => s.codeLang);
  const setCodeLang = useSettings((s) => s.setCodeLang);
  const playbackSpeed = useSettings((s) => s.playbackSpeed);
  const setPlaybackSpeed = useSettings((s) => s.setPlaybackSpeed);
  const theme = useSettings((s) => s.theme);
  const fontSize = useSettings((s) => s.fontSize);

  const completedAlgorithms = useProgress((s) => s.completedAlgorithms);
  const markAlgorithmComplete = useProgress((s) => s.markAlgorithmComplete);
  const favorites = useProgress((s) => s.favorites);
  const toggleFavorite = useProgress((s) => s.toggleFavorite);

  const [rawInput, setRawInput] = useState('');
  const [auxRaw, setAuxRaw] = useState('');
  const [applied, setApplied] = useState<unknown | null>(null);
  const [inputError, setInputError] = useState<InputError | null>(null);
  const [loop, setLoop] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [mobileTab, setMobileTab] = useState('viz');
  const [desktopTab, setDesktopTab] = useState('intro');

  const applyInput = useCallback(
    (raw: string, auxOverride?: string) => {
      const m = algorithmId ? getAlgorithmMeta(algorithmId) : undefined;
      if (!m) return;
      const result = parseInputByKind(raw, m.inputSpec);
      if (!result.ok) {
        setInputError(result.error);
        return;
      }
      let value: unknown = result.value;
      if (m.inputSpec.aux) {
        const auxResult = parseAuxOrDefault(auxOverride ?? auxRaw, m.inputSpec.aux);
        if (!auxResult.ok) {
          setInputError(auxResult.error);
          return;
        }
        value = { array: result.value, aux: auxResult.value };
      }
      setApplied(value);
      setInputError(null);
      writeInputToUrl(raw, m.inputSpec.aux ? (auxOverride ?? auxRaw) : undefined);
    },
    [algorithmId, auxRaw],
  );

  // 路由参数变化 / 首次挂载：应用默认输入或 URL 共享输入
  useEffect(() => {
    const m = algorithmId ? getAlgorithmMeta(algorithmId) : undefined;
    const initial = readInputFromUrl() ?? m?.defaultInput ?? '';
    const initialAux =
      (m?.inputSpec.aux ? readAuxFromUrl() : null) ?? String(m?.inputSpec.aux?.default ?? '');
    setRawInput(initial);
    setAuxRaw(initialAux);
    setApplied(null);
    setInputError(null);
    if (m) {
      const result = parseInputByKind(initial, m.inputSpec);
      if (!result.ok) {
        setInputError(result.error);
        return;
      }
      let value: unknown = result.value;
      if (m.inputSpec.aux) {
        const auxResult = parseAuxOrDefault(initialAux, m.inputSpec.aux);
        if (!auxResult.ok) {
          setInputError(auxResult.error);
          return;
        }
        value = { array: result.value, aux: auxResult.value };
      }
      setApplied(value);
    }
  }, [algorithmId]);

  // 运行算法（纯函数、确定性）
  const result = useMemo(() => {
    if (!meta || !applied) return null;
    const runner = getRunner(meta.runnerId);
    if (!runner) {
      return { ok: false as const, error: `runner "${meta.runnerId}" 未注册` };
    }
    try {
      return { ok: true as const, data: runner({ kind: meta.inputSpec.kind, value: applied }) };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }, [meta, applied]);

  const steps = useMemo(() => (result?.ok ? result.data.steps : []), [result]);
  const playback = usePlayback(steps);
  const { index, status, total, currentStep, controller } = playback;
  const previousStep = index > 0 ? (steps[index - 1] ?? null) : null;

  // 播放速度与设置同步
  useEffect(() => {
    controller.setSpeed(playbackSpeed);
  }, [controller, playbackSpeed]);

  // 循环模式
  useEffect(() => {
    controller.setLoop(loop);
  }, [controller, loop]);

  // 完成时记录学习进度
  useEffect(() => {
    if (meta && status === 'finished' && total > 0) {
      markAlgorithmComplete(meta.id, rawInput);
    }
  }, [meta, status, total, rawInput, markAlgorithmComplete]);

  const changeSpeed = useCallback(
    (speed: number) => {
      const next = clampSpeed(speed);
      controller.setSpeed(next);
      setPlaybackSpeed(next);
    },
    [controller, setPlaybackSpeed],
  );

  const randomize = useCallback(() => {
    const m = algorithmId ? getAlgorithmMeta(algorithmId) : undefined;
    if (!m) return;
    const text = randomInputForSpec(m.inputSpec);
    setRawInput(text);
    applyInput(text);
  }, [algorithmId, applyInput]);

  const handleShortcut = useCallback(
    (action: ShortcutAction) => {
      switch (action) {
        case 'toggle':
          controller.toggle();
          break;
        case 'prev':
          controller.prev();
          break;
        case 'next':
          controller.next();
          break;
        case 'reset':
          controller.reset();
          break;
        case 'start':
          controller.jumpTo(0);
          break;
        case 'end':
          controller.jumpTo(Math.max(0, total - 1));
          break;
        case 'random':
          randomize();
          break;
        case 'slower':
          changeSpeed(playbackSpeed / 2);
          break;
        case 'faster':
          changeSpeed(playbackSpeed * 2);
          break;
      }
    },
    [controller, total, randomize, changeSpeed, playbackSpeed],
  );
  useKeyboardShortcuts(handleShortcut);

  if (!meta) {
    return <NotFoundPage />;
  }

  const codeExample = meta.codeExamples[codeLang];
  const currentCodeLineId = currentStep?.codeLineId ?? null;
  const highlightLine =
    currentCodeLineId !== null ? (codeExample.lineMap[currentCodeLineId] ?? null) : null;

  const isFavorite = favorites.includes(meta.id);
  const isDone = completedAlgorithms[meta.id] !== undefined;

  const introContent: ReactNode = (
    <div className="flex flex-col gap-3">
      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="grid gap-4 xl:grid-cols-[1fr_220px]">
          <p className="text-sm leading-relaxed text-text">{localize(meta.description)}</p>
          <ComplexityPanel meta={meta} />
        </div>
      </section>
      <section className="rounded-2xl border border-border bg-surface p-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          {t.panels.mistakes}
        </h2>
        <MistakesPanel meta={meta} />
      </section>
    </div>
  );

  const codeContent: ReactNode = (
    <section className="flex min-h-[360px] flex-col rounded-2xl border border-border bg-surface md:min-h-[480px] xl:min-h-64">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
        <LanguageSwitcher value={codeLang} onChange={setCodeLang} />
      </div>
      <div className="relative min-h-64 flex-1">
        <Suspense fallback={<div className="grid h-full place-items-center text-xs text-muted">{t.common.loading}</div>}>
          <CodeEditor
            source={codeExample.source}
            language={codeLang}
            highlightLine={highlightLine}
            theme={theme}
            fontSize={fontSize}
            className="absolute inset-0"
          />
        </Suspense>
      </div>
      <p className="border-t border-border px-3 py-2 text-[11px] leading-relaxed text-muted">
        {t.playground.demoModeNote}
      </p>
    </section>
  );

  const vizContent: ReactNode = (
    <div className="flex flex-col gap-3">
      <section className="rounded-2xl border border-border bg-surface p-3">
        <InputBar
          meta={meta}
          rawInput={rawInput}
          onRawChange={setRawInput}
          onApply={applyInput}
          error={inputError}
          auxRaw={auxRaw}
          onAuxChange={setAuxRaw}
        />
      </section>
      <section className="rounded-2xl border border-border bg-surface p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t.panels.containers}
          </h2>
          <StateLegend />
        </div>
        <div className="rounded-lg bg-surface2/60 p-2">
          <VizCanvas>{renderVisual(meta.visualKind, currentStep)}</VizCanvas>
        </div>
        <div className="mt-3 rounded-lg border border-border bg-surface2/50 px-3 py-2.5">
          <ExplanationPanel current={currentStep} />
        </div>
      </section>
      {result && !result.ok && (
        <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
          {fmt(t.errors.runnerFailed, { message: result.error })}
        </p>
      )}
    </div>
  );

  const pseudocodeContent: ReactNode = (
    <section className="min-h-64 rounded-2xl border border-border bg-surface p-3">
      <PseudocodePanel pseudocode={meta.pseudocode} currentCodeLineId={currentCodeLineId} />
    </section>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* 页头 */}
      <header className="coordinate-frame surface-panel flex flex-col gap-2 p-3 sm:p-4">
        <nav aria-label="breadcrumb" className="flex items-center gap-1 text-xs text-muted">
          <Link to="/algorithms" className="hover:text-text">
            {t.nav.algorithms}
          </Link>
          <IconChevronRight size={12} />
          <span className="text-text">{localize(meta.name)}</span>
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold text-text">{localize(meta.name)}</h1>
          <DifficultyBadge difficulty={meta.difficulty} />
          <Badge tone="accent">{t.algorithms.categories[meta.category]}</Badge>
          {isDone && (
            <Badge tone="done">
              <IconCheck size={11} />
              {t.common.completed}
            </Badge>
          )}
          <button
            type="button"
            onClick={() => toggleFavorite(meta.id)}
            className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted transition hover:border-borderstrong hover:bg-surface2 hover:text-amber-500"
            title={isFavorite ? t.common.unfavorite : t.common.favorite}
            aria-pressed={isFavorite}
          >
            <IconStar size={15} className={isFavorite ? 'text-amber-500' : ''} />
          </button>
        </div>
        {meta.prerequisites.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
            <IconInfo size={13} className="text-accent" />
            <span>{t.roadmap.prerequisites}:</span>
            {meta.prerequisites.map((id) => {
              const prereq = getAlgorithmMeta(id);
              return prereq ? (
                <Link
                  key={id}
                  to={`/algorithms/${prereq.id}`}
                  className="rounded-md bg-surface2 px-1.5 py-0.5 text-accent hover:underline"
                >
                  {localize(prereq.name)}
                </Link>
              ) : null;
            })}
          </div>
        )}
      </header>

      {isWideDesktop ? (
        <div className="grid items-start gap-3 xl:grid-cols-[240px_minmax(0,1fr)_292px]">
          <aside className="sticky top-20 max-h-[calc(100vh-6.5rem)] overflow-y-auto rounded-2xl border border-border bg-surface p-3">
            <LeftSidebar activeId={meta.id} />
          </aside>
          <div className="flex min-w-0 flex-col gap-3">
            {vizContent}
            <TabbedPanels
              className="surface-panel overflow-hidden"
              contentClassName="p-3"
              active={desktopTab}
              onChange={setDesktopTab}
              items={[
                { id: 'intro', label: t.playground.tabs.intro, content: introContent },
                { id: 'code', label: t.playground.tabs.code, content: codeContent },
                { id: 'pseudocode', label: t.panels.pseudocode, content: pseudocodeContent },
              ]}
            />
          </div>
          <aside className="sticky top-20 max-h-[calc(100vh-6.5rem)] overflow-y-auto">
            <RightStatusPanel meta={meta} current={currentStep} previous={previousStep} />
          </aside>
        </div>
      ) : (
        <TabbedPanels
          className="surface-panel overflow-hidden"
          contentClassName="overflow-visible"
          active={mobileTab}
          onChange={setMobileTab}
          items={[
            {
              id: 'intro',
              label: t.playground.tabs.intro,
              content: <div className="flex flex-col gap-3 p-3">{introContent}{pseudocodeContent}</div>,
            },
            { id: 'code', label: t.playground.tabs.code, content: codeContent },
            { id: 'viz', label: t.playground.tabs.viz, content: <div className="p-3">{vizContent}</div> },
            {
              id: 'state',
              label: t.playground.tabs.state,
              content: (
                <div className="p-3">
                  <RightStatusPanel meta={meta} current={currentStep} previous={previousStep} />
                </div>
              ),
            },
          ]}
        />
      )}

      <BottomControlBar
        controller={controller}
        snapshot={playback}
        speed={playbackSpeed}
        onSpeedChange={changeSpeed}
        loop={loop}
        onLoopChange={setLoop}
        onShowShortcuts={() => setShowShortcuts(true)}
      />

      {showShortcuts && <ShortcutHelp onClose={() => setShowShortcuts(false)} />}

      {/* 无障碍提示：当前步骤说明对屏幕阅读器可见 */}
      <div className="sr-only" aria-live="polite">
        {locale === 'zh'
          ? `第 ${index + 1} 步，共 ${total} 步。`
          : `Step ${index + 1} of ${total}.`}
        {currentStep?.explanation[locale]}
      </div>
    </div>
  );
}
