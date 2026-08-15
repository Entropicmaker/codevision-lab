import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
using namespace std;

// 哈希表（拉链法）：h(k) = k % m，冲突元素按插入顺序挂到桶尾
void hashTableDemo(const vector<int>& keys, int m) {   //>func
    vector<vector<int>> bucket(m);                     //>init
    for (int key : keys) {                             //>insert
        int h = key % m;                               //>hash
        bool exists = false;
        for (int x : bucket[h])                        //>check
            if (x == key) { exists = true; break; }
        if (!exists) bucket[h].push_back(key);         //>chain
    }
    if (keys.empty()) return;   // 空输入直接结束
    int target = keys.back();
    int h2 = target % m;
    for (int x : bucket[h2])
        if (x == target) return;                       //>found
    return;                                            //>end
}`;

const csharpSource = `using System;
using System.Collections.Generic;

class HashTableDemo
{
    // 哈希表（拉链法）：h(k) = k % m，冲突元素按插入顺序挂到桶尾
    static void Demo(int[] keys, int m) {               //>func
        var bucket = new List<int>[m];                  //>init
        for (int i = 0; i < m; i++) bucket[i] = new List<int>();
        foreach (int key in keys) {                     //>insert
            int h = key % m;                            //>hash
            bool exists = false;
            foreach (int x in bucket[h])                //>check
                if (x == key) { exists = true; break; }
            if (!exists) bucket[h].Add(key);            //>chain
        }
        if (keys.Length == 0) return;   // 空输入直接结束
        int target = keys[keys.Length - 1];
        int h2 = target % m;
        foreach (int x in bucket[h2])
            if (x == target) return;                    //>found
        return;                                         //>end
    }
}`;

const pythonSource = `# 哈希表（拉链法）：h(k) = k % m，冲突元素按插入顺序挂到桶尾
def hash_table_demo(keys, m):           #>func
    bucket = [[] for _ in range(m)]     #>init
    for key in keys:                    #>insert
        h = key % m                     #>hash
        exists = any(x == key for x in bucket[h])   #>check
        if not exists:
            bucket[h].append(key)       #>chain
    if not keys:               # 空输入直接结束
        return
    target = keys[-1]
    h = target % m
    for x in bucket[h]:
        if x == target:                 #>found
            return "found"
    return "not found"                  #>end`;

const pseudocode = `# 哈希表（拉链法）：h(k) = k % m，冲突元素按插入顺序挂到桶尾
hashTableDemo(keys, m):                    #>func
  bucket = 创建 m 个空桶（每个桶是一条链）   #>init
  for key in keys:                         #>insert
    h = key % m                            #>hash
    exists = (key 已在 bucket[h] 的链中)     #>check
    if not exists:
      bucket[h].append(key)                #>chain
  target = keys 的最后一个元素
  h = target % m
  for x in bucket[h]:
    if x == target:                        #>found
      return "found"
  return "not found"                       #>end`;

export const hashTableMeta: AlgorithmMeta = {
  id: 'hash-table',
  name: { zh: '哈希表（拉链法）', en: 'Hash Table (Chaining)' },
  category: 'basic-structure',
  difficulty: 'medium',
  description: {
    zh: '哈希表把键通过哈希函数 h(k) 映射到一个桶下标，理想情况下插入、删除、查找都是 O(1)。但当不同键映射到同一桶时就会发生冲突——冲突是不可避免的（键空间通常远大于桶数）。拉链法（chaining）让每个桶维护一条链表，冲突的元素按插入顺序挂到链尾；与之相对的开放寻址法（open addressing）则在冲突时按探测序列在同张表内寻找下一个空槽。负载因子 α = n/m 越小冲突越少，α 过高时链变长、性能退化为 O(n)。',
    en: 'A hash table maps each key to a bucket index via a hash function h(k); insertion, deletion, and lookup are ideally O(1). Collisions happen when distinct keys map to the same bucket — they are unavoidable because the key space is usually far larger than the bucket count. Chaining gives each bucket a linked list, appending colliding elements in insertion order; open addressing instead probes for the next empty slot within the same table. The load factor α = n/m controls collisions: as α grows, chains lengthen and performance degrades to O(n).',
  },
  complexity: {
    time: { best: 'O(1)', average: 'O(1)', worst: 'O(n)' },
    space: 'O(n + m)',
  },
  prerequisites: [],
  tags: ['哈希', '查找', '数据结构', '拉链法'],
  inputSpec: {
    name: 'keys',
    kind: 'int-array',
    minLen: 0,
    maxLen: 20,
    valueMin: 1,
    valueMax: 99,
    allowEmpty: true,
    aux: { name: { zh: '桶数量 m', en: 'Bucket count m' }, kind: 'int', min: 3, max: 13, default: 7 },
  },
  defaultInput: '23, 17, 9, 30, 12, 5, 26',
  presets: [
    { name: { zh: '标准示例（含冲突）', en: 'Standard (with collisions)' }, input: '23, 17, 9, 30, 12, 5, 26' },
    { name: { zh: '无冲突示例', en: 'No collisions' }, input: '1, 2, 3, 4, 5, 6' },
  ],
  boundaryCases: [
    { name: { zh: '空数组', en: 'Empty array' }, input: '' },
    { name: { zh: '单个键', en: 'Single key' }, input: '23' },
    { name: { zh: '全部同余（全冲突链）', en: 'All congruent (one long chain)' }, input: '7, 14, 21' },
  ],
  runnerId: 'hash-table',
  visualKind: 'hash-table',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '哈希函数分布不均', en: 'Poorly distributed hash function' },
      detail: {
        zh: '若哈希函数让大量键落到同一个桶（例如 h(k) = 常量，或取模基数与键的规律重合），哈希表会退化成一条长链。好的哈希函数应把键尽量均匀地散布到各桶。',
        en: 'If the hash function sends most keys to the same bucket (e.g. a constant, or a modulus that matches a pattern in the keys), the table degenerates into one long chain. A good hash function spreads keys evenly across buckets.',
      },
      code: 'int h(int k) { return k % m; }  // m 选质数可减少与键规律的重合',
    },
    {
      title: { zh: '负载因子过高退化成链表', en: 'High load factor degrades to a linked list' },
      detail: {
        zh: '负载因子 α = n/m 过高时，每个桶里的链变长，平均查找时间从 O(1) 逼近 O(n)。工程实现通常在 α 超过阈值时扩容并重新哈希（rehash）。',
        en: 'When the load factor α = n/m is too high, chains grow long and average lookup approaches O(n). Real implementations resize and rehash once α exceeds a threshold.',
      },
      code: 'if ((double)n / m > 0.75) { rehash(m * 2); }',
    },
    {
      title: { zh: '忘记处理已存在的键', en: 'Forgetting to handle duplicate keys' },
      detail: {
        zh: '向哈希表插入重复键时，应更新该键对应的值或跳过插入，而不是再挂一个相同键到链上。否则链中会出现重复键，查找与删除都会出错。',
        en: 'When inserting a duplicate key, update its value or skip it — never append another identical key to the chain. Duplicates break lookup and deletion.',
      },
      code: 'if (exists) { node.value = value; } else { bucket[h].push(key); }',
    },
  ],
};
