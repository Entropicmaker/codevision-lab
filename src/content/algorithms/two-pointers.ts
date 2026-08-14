import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
using namespace std;

// 两数之和：在有序数组 a 中找两个数使和为 target，返回下标对
pair<int, int> twoSum(const vector<int>& a, int target) { //>func
    int left = 0, right = (int)a.size() - 1;              //>init
    while (left < right) {                                //>while
        int sum = a[left] + a[right];                     //>sum
        if (sum == target) {                              //>found
            return {left, right};
        } else if (sum < target) {                        //>up-left
            ++left;
        } else {                                          //>up-right
            --right;
        }
    }
    return {-1, -1};                                      //>not-found
}`;

const csharpSource = `using System;

class TwoSumDemo
{
    // 两数之和：在有序数组 a 中找两个数使和为 target，返回下标对
    static (int, int) TwoSum(int[] a, int target) {       //>func
        int left = 0, right = a.Length - 1;               //>init
        while (left < right) {                            //>while
            int sum = a[left] + a[right];                 //>sum
            if (sum == target) {                          //>found
                return (left, right);
            } else if (sum < target) {                    //>up-left
                left++;
            } else {                                      //>up-right
                right--;
            }
        }
        return (-1, -1);                                  //>not-found
    }
}`;

const pythonSource = `# 两数之和：在有序数组 a 中找两个数使和为 target，返回下标对
def two_sum(a, target):             #>func
    left, right = 0, len(a) - 1     #>init
    while left < right:             #>while
        s = a[left] + a[right]      #>sum
        if s == target:             #>found
            return (left, right)
        elif s < target:            #>up-left
            left += 1
        else:                       #>up-right
            right -= 1
    return (-1, -1)                 #>not-found`;

const pseudocode = `twoSum(a, target):                #>func
  left, right = 0, len(a)-1       #>init
  while left < right:             #>while
    sum = a[left] + a[right]      #>sum
    if sum == target:             #>found
      return (left, right)
    elif sum < target:            #>up-left
      left += 1
    else:                         #>up-right
      right -= 1
  return (-1, -1)                 #>not-found`;

export const twoPointersMeta: AlgorithmMeta = {
  id: 'two-pointers',
  name: { zh: '两数之和（双指针）', en: 'Two Sum (Two Pointers)' },
  category: 'two-pointers',
  difficulty: 'easy',
  description: {
    zh: '双指针技巧在有序数组的两端各放一个指针，计算当前两数之和并与目标比较：和太小就右移左指针（增大和），和太大就左移右指针（减小和）。每一轮排除一个候选元素，直到找到答案或两指针相遇。时间复杂度 O(n)、空间 O(1)，是"有序数组上缩小搜索空间"的经典代表。',
    en: 'The two-pointer technique places one pointer at each end of a sorted array, computes the current pair sum and compares it with the target: if the sum is too small, move the left pointer right (increase the sum); if too large, move the right pointer left (decrease it). Each round eliminates one candidate until the pair is found or the pointers meet. O(n) time, O(1) space — the classic way to shrink the search space on a sorted array.',
  },
  complexity: {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(1)',
  },
  prerequisites: [],
  tags: ['双指针', '有序数组', '两数之和', '入门'],
  inputSpec: {
    name: 'a',
    kind: 'int-array',
    minLen: 0,
    maxLen: 20,
    valueMin: 1,
    valueMax: 99,
    allowEmpty: true,
    aux: { name: { zh: '目标和 target', en: 'Target sum' }, kind: 'int', min: 1, max: 99, default: 11 },
  },
  defaultInput: '1, 3, 4, 6, 8, 10, 12, 15',
  presets: [
    { name: { zh: '目标在两端', en: 'Target at both ends' }, input: '1, 4, 6, 10' },
    { name: { zh: '目标在中间', en: 'Target in the middle' }, input: '2, 5, 8, 12, 16, 20' },
  ],
  boundaryCases: [
    { name: { zh: '空数组', en: 'Empty array' }, input: '' },
    { name: { zh: '单元素', en: 'Single element' }, input: '7' },
    { name: { zh: '无解', en: 'No solution' }, input: '2, 5, 8, 12' },
    { name: { zh: '目标在两端', en: 'Target at both ends' }, input: '1, 4, 6, 10' },
  ],
  runnerId: 'two-pointers',
  visualKind: 'array-blocks',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '数组未排序就使用双指针', en: 'Using two pointers on an unsorted array' },
      detail: {
        zh: '双指针正确性依赖有序性：无序时"和太小移动左指针"的推理不成立。输入无序数组时本演示会给出明确错误提示，请先排序。',
        en: 'The technique relies on a sorted array: on unsorted input the reasoning "move left when the sum is too small" is invalid. This demo shows an explicit error for unsorted input — sort first.',
      },
    },
    {
      title: { zh: '指针移动方向弄反', en: 'Reversing the pointer move direction' },
      detail: {
        zh: '和小于 target 时应右移左指针以增大和；和大于 target 时应左移右指针以减小和。方向写反会让算法永远找不到答案（甚至死循环）。',
        en: 'When the sum is below target, move the left pointer right to increase it; when above, move the right pointer left to decrease it. Reversing the directions makes the algorithm never find the answer.',
      },
    },
    {
      title: { zh: '循环条件写成 left <= right', en: 'Using left <= right as the loop condition' },
      detail: {
        zh: '两数之和要求两个不同下标。若写成 left <= right，当 left == right 时会计算 a[left] + a[left]（同一个元素用了两次），产生错误答案。应使用 left < right。',
        en: 'Two-sum needs two distinct indices. With left <= right, when left == right you would compute a[left] + a[left], using one element twice. Use left < right.',
      },
    },
  ],
};
