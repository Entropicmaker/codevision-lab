import type { AlgorithmMeta } from '../../engine/types/algorithm';
import type { AlgorithmStep } from '../../engine/types/step';
import { useI18n } from '../../hooks/useI18n';
import { Panel } from '../ui/Panel';
import { IconChart, IconInfo, IconLayers, IconListCheck } from '../ui/Icons';
import { VariablesPanel } from '../panels/VariablesPanel';
import { ContainersPanel } from '../panels/ContainersPanel';
import { CallStackPanel } from '../panels/CallStackPanel';
import { StatsPanel } from '../panels/StatsPanel';
import { OutputPanel } from '../panels/OutputPanel';
import { ComplexityPanel } from '../panels/ComplexityPanel';

/** 右侧运行状态区 */
export function RightStatusPanel({
  meta,
  current,
  previous,
}: {
  meta: AlgorithmMeta;
  current: AlgorithmStep | null;
  previous: AlgorithmStep | null;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-3">
      <Panel title={t.panels.variables} icon={<IconInfo size={13} />}>
        <VariablesPanel current={current} previous={previous} />
      </Panel>
      <Panel title={t.panels.containers} icon={<IconLayers size={13} />}>
        <ContainersPanel current={current} />
      </Panel>
      <Panel title={t.panels.callStack} icon={<IconListCheck size={13} />}>
        <CallStackPanel current={current} />
      </Panel>
      <Panel title={t.panels.stats} icon={<IconChart size={13} />}>
        <StatsPanel current={current} />
      </Panel>
      <Panel title={t.panels.output} icon={<IconListCheck size={13} />}>
        <OutputPanel current={current} />
      </Panel>
      <Panel title={t.panels.complexity} icon={<IconChart size={13} />}>
        <ComplexityPanel meta={meta} />
      </Panel>
    </div>
  );
}
