import { Link } from 'react-router-dom';
import { algorithmMetas } from '../content/algorithms/registry';
import { useI18n } from '../hooks/useI18n';
import { Badge } from '../components/ui/Badge';

interface StructureInfo {
  id: string;
  name: { zh: string; en: string };
  description: { zh: string; en: string };
  categories: string[];
  icon: string;
}

/** 数据结构概念目录：与算法注册表联动，展示对应可视化入口 */
const STRUCTURES: StructureInfo[] = [
  {
    id: 'array',
    name: { zh: '数组', en: 'Array' },
    description: {
      zh: '连续内存中的同类型元素序列，支持 O(1) 随机访问。排序、二分搜索、双指针、滑动窗口都建立在数组之上。',
      en: 'A contiguous sequence of same-typed elements with O(1) random access. Sorting, binary search, two pointers and sliding windows are all built on arrays.',
    },
    categories: ['array', 'sorting', 'searching', 'two-pointers', 'sliding-window'],
    icon: '▦',
  },
  {
    id: 'stack',
    name: { zh: '栈', en: 'Stack' },
    description: {
      zh: '后进先出（LIFO）的线性结构，只允许在栈顶插入和删除。用于函数调用栈、括号匹配、DFS、撤销操作。',
      en: 'A LIFO linear structure that only allows push/pop at the top. Used in call stacks, bracket matching, DFS and undo.',
    },
    categories: ['stack'],
    icon: '⥮',
  },
  {
    id: 'queue',
    name: { zh: '队列', en: 'Queue' },
    description: {
      zh: '先进先出（FIFO）的线性结构，队尾入、队首出。用于 BFS、任务调度、生产者消费者模型。',
      en: 'A FIFO linear structure: enqueue at the rear, dequeue at the front. Used in BFS, scheduling and producer-consumer models.',
    },
    categories: ['queue'],
    icon: '⇥',
  },
  {
    id: 'linked-list',
    name: { zh: '链表', en: 'Linked List' },
    description: {
      zh: '由节点和指针串联的链式结构，插入删除 O(1)，但不支持随机访问。是理解指针与对象引用的最佳载体。',
      en: 'A chain of nodes linked by pointers with O(1) insert/delete but no random access — the best vehicle for understanding pointers.',
    },
    categories: ['linked-list'],
    icon: '⛓',
  },
  {
    id: 'tree',
    name: { zh: '二叉树', en: 'Binary Tree' },
    description: {
      zh: '每个节点最多两个孩子的层次结构。递归遍历是回溯、分治、DFS 的起点；二叉搜索树与堆是其重要变体。',
      en: 'A hierarchy where each node has at most two children. Recursive traversal is the gateway to backtracking, divide-and-conquer and DFS.',
    },
    categories: ['tree'],
    icon: '🌳',
  },
  {
    id: 'graph',
    name: { zh: '图', en: 'Graph' },
    description: {
      zh: '节点与边的网络模型，表达社交关系、地图、依赖关系。DFS/BFS 是图算法的基础，最短路与最小生成树是其延伸。',
      en: 'A network of nodes and edges modeling maps, social links and dependencies. DFS/BFS are the foundation; shortest paths extend them.',
    },
    categories: ['graph'],
    icon: '🕸',
  },
];

/** 数据结构浏览页 */
export function StructuresPage() {
  const { t, locale } = useI18n();

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-bold">{t.nav.dataStructures}</h1>
        <p className="mt-1 text-sm text-muted">
          {locale === 'zh'
            ? '按结构类型浏览：理解每种结构的特性与适用场景，并进入对应的交互式可视化。'
            : 'Browse by structure type: understand each structure and jump into its interactive visualizations.'}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {STRUCTURES.map((structure) => {
          const related = algorithmMetas.filter((m) =>
            structure.categories.includes(m.category),
          );
          return (
            <section
              key={structure.id}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-surface cv-card p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden>
                  {structure.icon}
                </span>
                <h2 className="text-base font-semibold">{structure.name[locale]}</h2>
              </div>
              <p className="text-xs leading-relaxed text-muted">{structure.description[locale]}</p>
              {related.length > 0 ? (
                <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  {related.map((meta) => (
                    <Link key={meta.id} to={`/algorithms/${meta.id}`}>
                      <Badge tone="accent" className="hover:opacity-80">
                        {meta.name[locale]}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-auto pt-2 text-[11px] text-muted/70">
                  {locale === 'zh' ? '可视化演示即将上线' : 'Visualization coming soon'}
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
