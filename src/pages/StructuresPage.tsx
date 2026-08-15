import { Link } from 'react-router-dom';
import { algorithmMetas } from '../content/algorithms/registry';
import { useI18n } from '../hooks/useI18n';
import { Badge } from '../components/ui/Badge';
import { IconChevronRight } from '../components/ui/Icons';

interface StructureInfo {
  id: string;
  name: { zh: string; en: string };
  description: { zh: string; en: string };
  useCase: { zh: string; en: string };
  complexity: string;
  algorithms: string[];
  icon: string;
}

const STRUCTURES: StructureInfo[] = [
  { id: 'array', name: { zh: '数组', en: 'Array' }, description: { zh: '连续内存中的同类型元素序列，支持快速随机访问。', en: 'A contiguous sequence of same-typed elements with fast random access.' }, useCase: { zh: '排序、搜索、窗口计算', en: 'Sorting, search, window processing' }, complexity: 'access O(1)', algorithms: ['bubble-sort', 'selection-sort', 'insertion-sort', 'merge-sort', 'quick-sort', 'heap-sort', 'binary-search', 'two-pointers', 'sliding-window'], icon: '▦' },
  { id: 'stack', name: { zh: '栈', en: 'Stack' }, description: { zh: '后进先出的线性结构，只在栈顶插入和删除。', en: 'A last-in, first-out structure operated from the top.' }, useCase: { zh: '调用栈、撤销、深度优先搜索', en: 'Call stacks, undo, depth-first search' }, complexity: 'push / pop O(1)', algorithms: ['stack-demo', 'tree-traversal', 'dfs'], icon: '⥮' },
  { id: 'queue', name: { zh: '队列', en: 'Queue' }, description: { zh: '先进先出的线性结构，队尾入、队首出。', en: 'A first-in, first-out structure with rear insertion and front removal.' }, useCase: { zh: '任务调度、广度优先搜索', en: 'Scheduling and breadth-first search' }, complexity: 'enqueue / dequeue O(1)', algorithms: ['queue-demo', 'bfs', 'topological-sort'], icon: '⇥' },
  { id: 'linked-list', name: { zh: '链表', en: 'Linked List' }, description: { zh: '节点通过指针连接，适合频繁插入与删除。', en: 'Nodes connected by pointers, suited to frequent insertions and removals.' }, useCase: { zh: '动态序列、指针理解', en: 'Dynamic sequences and pointer models' }, complexity: 'insert / delete O(1)', algorithms: ['linked-list-ops'], icon: '⛓' },
  { id: 'tree', name: { zh: '二叉树', en: 'Binary Tree' }, description: { zh: '每个节点最多有两个孩子的层次结构。', en: 'A hierarchy where each node has at most two children.' }, useCase: { zh: '递归、搜索、层次数据', en: 'Recursion, search and hierarchical data' }, complexity: 'traverse O(n)', algorithms: ['tree-traversal', 'heap-sort'], icon: '⌁' },
  { id: 'hash-table', name: { zh: '哈希表', en: 'Hash Table' }, description: { zh: '用哈希函数把键映射到桶，快速完成增删查。', en: 'A hash function maps keys to buckets for fast lookup and updates.' }, useCase: { zh: '字典、集合、缓存', en: 'Dictionaries, sets and caches' }, complexity: 'average O(1)', algorithms: ['hash-table'], icon: '⌗' },
  { id: 'heap', name: { zh: '堆', en: 'Heap' }, description: { zh: '满足堆性质的完全二叉树，可快速取得极值。', en: 'A complete tree whose heap property exposes an extreme value quickly.' }, useCase: { zh: '优先队列、Top K、堆排序', en: 'Priority queues, top-k and heap sort' }, complexity: 'peek O(1) · update O(log n)', algorithms: ['heap-sort'], icon: '△' },
  { id: 'graph', name: { zh: '图', en: 'Graph' }, description: { zh: '由节点与边构成的网络模型，表达复杂关系。', en: 'A network of vertices and edges that models complex relationships.' }, useCase: { zh: '地图、依赖、网络路径', en: 'Maps, dependencies and network paths' }, complexity: 'traverse O(V + E)', algorithms: ['dfs', 'bfs', 'topological-sort', 'dijkstra', 'bellman-ford', 'floyd-warshall'], icon: '⌘' },
];

function StructureDiagram({ id, icon }: { id: string; icon: string }) {
  const count = id === 'array' ? 6 : id === 'stack' ? 4 : id === 'queue' ? 5 : 3;
  if (['tree', 'heap', 'graph'].includes(id)) {
    return (
      <svg viewBox="0 0 180 74" className="h-14 w-full text-accent sm:h-20" aria-hidden>
        <path d={id === 'graph' ? 'M30 38L84 16 142 36 96 62 30 38M84 16L96 62' : 'M90 14L48 52M90 14L134 52M48 52L26 68M48 52L70 68M134 52L112 68M134 52L156 68'} fill="none" stroke="currentColor" strokeOpacity=".45" strokeWidth="2" />
        {(id === 'graph' ? [[30,38],[84,16],[142,36],[96,62]] : [[90,14],[48,52],[134,52],[26,68],[70,68],[112,68],[156,68]]).map(([x,y], index) => <circle key={index} cx={x} cy={y} r="7" fill="var(--cv-surface)" stroke="currentColor" strokeWidth="2" />)}
      </svg>
    );
  }
  return (
    <div className={`flex h-14 items-center justify-center gap-1 sm:h-20 ${id === 'stack' ? 'flex-col-reverse' : ''}`} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <span key={index} className="grid h-9 min-w-9 place-items-center rounded-lg border border-accent/35 bg-accentsoft font-mono text-xs text-accent">{id === 'linked-list' ? `${index + 1}→` : index + 1}</span>
      ))}
      <span className="ml-1 text-xl text-accent">{icon}</span>
    </div>
  );
}

export function StructuresPage() {
  const { t, locale } = useI18n();
  return (
    <div className="flex flex-col gap-6">
      <header className="coordinate-frame surface-panel p-5 sm:p-7">
        <p className="micro-label text-accent">{t.nav.dataStructures} / atlas</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">{t.nav.dataStructures}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{locale === 'zh' ? '用结构图、复杂度和典型场景快速建立直觉，再进入对应的交互演示。' : 'Build intuition through diagrams, complexity and common use cases, then open an interactive demo.'}</p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        {STRUCTURES.map((structure) => {
          const related = structure.algorithms.map((id) => algorithmMetas.find((meta) => meta.id === id)).filter((meta): meta is NonNullable<typeof meta> => meta !== undefined);
          const [primary, ...more] = related;
          return (
            <article key={structure.id} className="surface-panel flex flex-col overflow-hidden p-4 sm:p-5">
              <StructureDiagram id={structure.id} icon={structure.icon} />
              <div className="mt-3 flex items-center gap-2">
                <h2 className="text-xl font-semibold">{structure.name[locale]}</h2>
                <Badge tone="neutral">{structure.complexity}</Badge>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{structure.description[locale]}</p>
              <p className="mt-2 text-xs text-muted"><span className="font-semibold text-text">{locale === 'zh' ? '适合：' : 'Use for: '}</span>{structure.useCase[locale]}</p>
              {primary && <Link to={`/algorithms/${primary.id}`} className="mt-5 inline-flex min-h-11 items-center justify-center gap-1 rounded-full bg-accent px-4 text-sm font-semibold text-white">{primary.name[locale]}<IconChevronRight size={14} /></Link>}
              {more.length > 0 && (
                <details className="mt-3 rounded-xl border border-border px-3 py-2">
                  <summary className="cursor-pointer text-xs font-semibold text-accent">{locale === 'zh' ? `更多演示（${more.length}）` : `More demos (${more.length})`}</summary>
                  <div className="mt-2 flex flex-wrap gap-1.5">{more.map((meta) => <Link key={meta.id} to={`/algorithms/${meta.id}`}><Badge tone="accent">{meta.name[locale]}</Badge></Link>)}</div>
                </details>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
