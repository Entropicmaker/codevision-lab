import type { ReactNode } from 'react';
import type { VisualKind } from '../engine/types/algorithm';
import type { AlgorithmStep } from '../engine/types/step';
import { ArrayBars } from './ArrayBars';
import { ArrayBlocks } from './ArrayBlocks';
import { StackRenderer } from './Stack';
import { QueueRenderer } from './Queue';
import { LinkedListRenderer } from './LinkedList';
import { TreeRenderer } from './Tree';
import { GraphRenderer } from './Graph';
import { TableRenderer } from './Table';
import { HeapRenderer } from './Heap';
import { HashTableRenderer } from './HashTable';

/**
 * 渲染器注册表：visualKind → 渲染组件。
 * 渲染器输入统一为当前步骤快照（数据驱动），与算法逻辑完全分离。
 */
export function renderVisual(kind: VisualKind, step: AlgorithmStep | null): ReactNode {
  switch (kind) {
    case 'array-bars':
      return <ArrayBars step={step} />;
    case 'array-blocks':
      return <ArrayBlocks step={step} />;
    case 'stack':
      return <StackRenderer step={step} />;
    case 'queue':
      return <QueueRenderer step={step} />;
    case 'linked-list':
      return <LinkedListRenderer step={step} />;
    case 'tree':
      return <TreeRenderer step={step} />;
    case 'graph':
      return <GraphRenderer step={step} />;
    case 'table':
      return <TableRenderer step={step} />;
    case 'heap':
      return <HeapRenderer step={step} />;
    case 'hash-table':
      return <HashTableRenderer step={step} />;
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}
