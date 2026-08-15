import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
#include <algorithm>
using namespace std;

// 活动选择（贪心）：按结束时间升序排序，依次选相容活动
int activitySelection(vector<pair<int,int>> acts) { //>func
    sort(acts.begin(), acts.end(),                   //>sort
         [](auto& a, auto& b){ return a.second < b.second; });
    int lastEnd = -1, count = 0;                     //>init
    for (auto& a : acts) {                           // 逐活动考察
        if (a.first >= lastEnd) {                    //>check
            lastEnd = a.second; count++;             //>select
        } else {                                     //>skip
            // 重叠：跳过
        }
    }
    return count;                                    //>end
}`;

const csharpSource = `using System;
using System.Collections.Generic;
using System.Linq;

class ActivitySelectionDemo
{
    // 活动选择（贪心）：按结束时间升序排序，依次选相容活动
    static int ActivitySelection(List<(int start, int end)> acts) { //>func
        acts = acts.OrderBy(a => a.end).ToList();   //>sort
        int lastEnd = -1, count = 0;                //>init
        foreach (var a in acts) {                   // 逐活动考察
            if (a.start >= lastEnd) {               //>check
                lastEnd = a.end; count++;           //>select
            } else {                                //>skip
                // 重叠：跳过
            }
        }
        return count;                               //>end
    }
}`;

const pythonSource = `# 活动选择（贪心）：按结束时间升序排序，依次选相容活动
def activity_selection(activities):      #>func
    activities.sort(key=lambda a: a[1])  #>sort
    last_end = -1                        #>init
    count = 0
    for start, end in activities:        # 逐活动考察
        if start >= last_end:            #>check
            last_end = end               #>select
            count += 1
        else:                            #>skip
            pass                         # 重叠：跳过
    return count                         #>end`;

const pseudocode = `activitySelection(activities):                   #>func
  sort activities by finish ascending            #>sort
  lastEnd = -1; count = 0                        #>init
  for each activity a in sorted order:           # 逐活动考察
    if a.start >= lastEnd:                       #>check
      select a; lastEnd = a.finish; count += 1   #>select
    else:                                        #>skip
      skip a                                     # 重叠：跳过
  return selected                                #>end`;

export const activitySelectionMeta: AlgorithmMeta = {
  id: 'activity-selection',
  name: { zh: '活动选择问题', en: 'Activity Selection' },
  category: 'greedy',
  difficulty: 'medium',
  description: {
    zh: '活动选择问题（区间调度）：给定 n 个活动，每个活动有一个开始时间与结束时间（区间 [start, end]），要求选出数量最多、两两时间互不重叠（相容）的活动子集。贪心策略：先把所有活动按结束时间升序排序，然后按顺序逐个考察——若当前活动的开始时间 ≥ 已选最后一个活动的结束时间（lastEnd），则选中并更新 lastEnd，否则跳过。按结束时间最早优先的贪心能保证得到最优解（可用交换论证证明）；复杂度由排序主导，为 O(n log n) 时间、O(1) 额外空间。',
    en: 'The activity selection problem (interval scheduling): given n activities, each with a start and finish time (an interval [start, end]), select a maximum-size subset of mutually non-overlapping (compatible) activities. Greedy strategy: first sort all activities by finish time ascending, then examine them in order — if the current activity starts at or after the finish of the last selected activity (lastEnd), select it and update lastEnd; otherwise skip it. The finish-time-first greedy is provably optimal (exchange argument); complexity is dominated by sorting: O(n log n) time and O(1) extra space.',
  },
  complexity: {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    space: 'O(1)',
  },
  prerequisites: [],
  tags: ['贪心', '区间调度', '活动选择', '排序', '经典'],
  inputSpec: {
    name: 'activities',
    kind: 'interval-list',
    maxLen: 12,
  },
  defaultInput: '3-5, 0-6, 5-9, 1-4, 8-12, 5-7, 6-10, 2-13, 8-11, 12-14, 3-8',
  presets: [
    { name: { zh: '经典教材例子', en: 'Textbook classic' }, input: '3-5, 0-6, 5-9, 1-4, 8-12, 5-7, 6-10, 2-13, 8-11, 12-14, 3-8' },
    { name: { zh: '全部相容（可全选）', en: 'All compatible' }, input: '1-2, 2-3, 3-4, 4-5' },
    { name: { zh: '大量重叠', en: 'Heavy overlap' }, input: '1-10, 2-9, 3-8, 4-7' },
  ],
  boundaryCases: [
    { name: { zh: '单个活动', en: 'Single activity' }, input: '1-4' },
    { name: { zh: '端点相接（相容）', en: 'Touching endpoints' }, input: '1-3, 3-5, 5-7' },
    { name: { zh: '全部重叠', en: 'All overlap' }, input: '1-10, 2-9, 3-8' },
    { name: { zh: '极值区间', en: 'Extreme values' }, input: '1000000000-1000000001' },
  ],
  runnerId: 'activity-selection',
  visualKind: 'array-blocks',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '按开始时间贪心是错的', en: 'Greedy by start time is wrong' },
      detail: {
        zh: '若按"开始时间最早"优先（而不是结束时间），一个很长的活动会先被选中并占据整段时间轴，导致错过多个短活动。例如 [1,100] 与 [2,3]、[3,4]、[4,5]：按开始时间只能选 [1,100]（1 个），而按结束时间能选 [2,3]、[3,4]、[4,5]（3 个）。正确的贪心依据是"结束时间最早"。',
        en: 'If you greedily pick by earliest start time (instead of finish time), one long activity gets selected first and blocks the whole timeline, making you miss several short activities. E.g. [1,100] with [2,3], [3,4], [4,5]: by start time you pick only [1,100] (1 activity), but by finish time you pick [2,3], [3,4], [4,5] (3 activities). The correct greedy criterion is earliest finish time.',
      },
      code: 'sort by a.finish  // 正确\n// sort by a.start  // 错误',
    },
    {
      title: { zh: '忘记先排序', en: 'Forgetting to sort first' },
      detail: {
        zh: '贪心正确性依赖"每次选当前结束最早的活动"。若直接按输入顺序考察而不先按结束时间升序排序，可能先选中一个晚结束的活动，错过更优的早结束活动，得到的结果不再是最优解。',
        en: "The greedy's correctness depends on always picking the currently earliest-finishing activity. If you examine activities in input order without first sorting by finish time ascending, you may select a late-finishing activity early and miss an earlier-finishing one, so the result is no longer optimal.",
      },
      code: 'sort(activities, by finish ascending);  // 必须先排序',
    },
    {
      title: { zh: '边界条件应是 s >= lastEnd 而非 s > lastEnd', en: 'Use s >= lastEnd, not s > lastEnd' },
      detail: {
        zh: '两个活动在端点相接时是相容的：前一个的结束时间等于后一个的开始时间（如 [1,3] 与 [3,5]），可以同时选中。判断条件必须用 s >= lastEnd（大于等于）。误写成 s > lastEnd 会错误地跳过端点相接的活动，漏掉合法解。',
        en: 'Two activities that touch at an endpoint are compatible: the earlier one finishes exactly when the later one starts (e.g. [1,3] and [3,5]), so both can be selected. The condition must be s >= lastEnd (greater-or-equal). Writing s > lastEnd incorrectly skips endpoint-touching activities and misses a valid solution.',
      },
      code: 'if (a.start >= lastEnd)  // 正确\n// if (a.start > lastEnd)  // 错误：漏掉端点相接',
    },
  ],
};
