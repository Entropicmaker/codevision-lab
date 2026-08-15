import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
#include <string>
using namespace std;

// 构建前缀函数 lps：lps[i] = 模式 p[0..i] 的最长相等真前后缀长度
vector<int> buildLps(const string& p) {        //>build-lps
    int m = (int)p.size();                     //>build-lps
    vector<int> lps(m, 0);                     //>build-lps
    int i = 1, j = 0;                          //>build-lps
    while (i < m) {                            //>build-lps
        if (p[i] == p[j]) {                    //>compare-lps
            j++;                               //>compare-lps
            lps[i] = j;                        //>compare-lps
            i++;                               //>compare-lps
        } else {                               //>compare-lps
            if (j != 0) {                      //>backtrack-lps
                j = lps[j - 1];                //>backtrack-lps
            } else {                           //>compare-lps
                lps[i] = 0;                    //>compare-lps
                i++;                           //>compare-lps
            }
        }
    }
    return lps;                                //>build-lps
}

// KMP 字符串匹配：返回所有匹配起始下标
vector<int> kmp(const string& t, const string& p) { //>func
    int n = (int)t.size();                     //>init
    int m = (int)p.size();                     //>init
    vector<int> lps = buildLps(p);             //>init
    vector<int> result;                        //>init
    int i = 0, j = 0;                          //>match
    while (i < n) {                            //>match
        if (t[i] == p[j]) {                    //>compare
            i++; j++;                          //>compare
            if (j == m) {                      //>found
                result.push_back(i - j);       //>found
                j = lps[j - 1];                //>found
            }
        } else {                               //>fallback
            if (j != 0) {                      //>fallback
                j = lps[j - 1];                //>fallback
            } else {                           //>fallback
                i++;                           //>fallback
            }
        }
    }
    return result;                             //>end
}`;

const csharpSource = `using System;
using System.Collections.Generic;

class KmpDemo
{
    // 构建前缀函数 lps
    static int[] BuildLps(string p) {              //>build-lps
        int m = p.Length;                          //>build-lps
        int[] lps = new int[m];                    //>build-lps
        int i = 1, j = 0;                          //>build-lps
        while (i < m) {                            //>build-lps
            if (p[i] == p[j]) {                    //>compare-lps
                j++;                               //>compare-lps
                lps[i] = j;                        //>compare-lps
                i++;                               //>compare-lps
            } else {                               //>compare-lps
                if (j != 0) {                      //>backtrack-lps
                    j = lps[j - 1];                //>backtrack-lps
                } else {                           //>compare-lps
                    lps[i] = 0;                    //>compare-lps
                    i++;                           //>compare-lps
                }
            }
        }
        return lps;                                //>build-lps
    }

    // KMP 字符串匹配：返回所有匹配起始下标
    static List<int> Kmp(string t, string p) {     //>func
        int n = t.Length;                          //>init
        int m = p.Length;                          //>init
        int[] lps = BuildLps(p);                   //>init
        var result = new List<int>();              //>init
        int i = 0, j = 0;                          //>match
        while (i < n) {                            //>match
            if (t[i] == p[j]) {                    //>compare
                i++; j++;                          //>compare
                if (j == m) {                      //>found
                    result.Add(i - j);             //>found
                    j = lps[j - 1];                //>found
                }
            } else {                               //>fallback
                if (j != 0) {                      //>fallback
                    j = lps[j - 1];                //>fallback
                } else {                           //>fallback
                    i++;                           //>fallback
                }
            }
        }
        return result;                             //>end
    }
}`;

const pythonSource = `# 构建前缀函数 lps
def build_lps(p):                    #>build-lps
    m = len(p)                       #>build-lps
    lps = [0] * m                    #>build-lps
    i, j = 1, 0                      #>build-lps
    while i < m:                     #>build-lps
        if p[i] == p[j]:             #>compare-lps
            j += 1                   #>compare-lps
            lps[i] = j               #>compare-lps
            i += 1                   #>compare-lps
        else:                        #>compare-lps
            if j != 0:               #>backtrack-lps
                j = lps[j - 1]       #>backtrack-lps
            else:                    #>compare-lps
                lps[i] = 0           #>compare-lps
                i += 1               #>compare-lps
    return lps                       #>build-lps

# KMP 字符串匹配：返回所有匹配起始下标
def kmp(t, p):                       #>func
    n, m = len(t), len(p)            #>init
    lps = build_lps(p)               #>init
    result = []                      #>init
    i = j = 0                        #>match
    while i < n:                     #>match
        if t[i] == p[j]:             #>compare
            i += 1                   #>compare
            j += 1                   #>compare
            if j == m:               #>found
                result.append(i - j) #>found
                j = lps[j - 1]       #>found
        else:                        #>fallback
            if j != 0:               #>fallback
                j = lps[j - 1]       #>fallback
            else:                    #>fallback
                i += 1               #>fallback
    return result                    #>end`;

const pseudocode = `buildLps(p):                        #>build-lps
  m = len(p)
  lps = [0] * m
  i = 1; j = 0
  while i < m:
    if p[i] == p[j]:                #>compare-lps
      j = j + 1
      lps[i] = j
      i = i + 1
    else:
      if j != 0:                    #>backtrack-lps
        j = lps[j - 1]
      else:
        lps[i] = 0
        i = i + 1
  return lps

kmp(text, pattern):                 #>func
  n = len(text); m = len(pattern)   #>init
  lps = buildLps(pattern)
  i = 0; j = 0
  while i < n:
    if text[i] == pattern[j]:       #>compare
      i = i + 1
      j = j + 1
    if j == m:                      #>match
      print "found at", i - j
      j = lps[j - 1]                #>found
    elif i < n and text[i] != pattern[j]:
      if j != 0:                    #>fallback
        j = lps[j - 1]
      else:
        i = i + 1
  return                            #>end
`;

export const kmpMeta: AlgorithmMeta = {
  id: 'kmp',
  name: { zh: 'KMP 字符串匹配', en: 'KMP String Matching' },
  category: 'searching',
  difficulty: 'hard',
  description: {
    zh: 'KMP（Knuth–Morris–Pratt）算法用前缀函数 lps 记录模式串的"最长相等真前后缀"长度。匹配时文本指针 i 只前进、从不回退：一旦失配，就用 lps 让模式指针 j 跳过已匹配的前缀继续比较，把最坏时间从暴力回溯的 O(n·m) 降到 O(n+m)。',
    en: 'The KMP (Knuth–Morris–Pratt) algorithm uses a prefix function lps that records, for each prefix of the pattern, the length of the longest proper prefix which is also a suffix. During matching, text pointer i only moves forward and never backtracks: on a mismatch, lps lets pattern pointer j skip the already-matched prefix, cutting the worst case from O(n·m) to O(n+m).',
  },
  complexity: {
    time: { best: 'O(n+m)', average: 'O(n+m)', worst: 'O(n+m)' },
    space: 'O(m)',
  },
  prerequisites: ['two-pointers'],
  tags: ['字符串', '前缀函数', '双指针', '模式匹配'],
  inputSpec: {
    name: 'text|pattern',
    kind: 'string-pair',
    maxLen: 32,
  },
  defaultInput: 'ABABABC|ABA',
  presets: [
    { name: { zh: '重叠匹配', en: 'Overlapping matches' }, input: 'AAAAA|AA' },
    { name: { zh: '完全匹配', en: 'Exact match' }, input: 'ABC|ABC' },
    { name: { zh: '无匹配', en: 'No match' }, input: 'ABC|ABD' },
  ],
  boundaryCases: [
    { name: { zh: '重叠匹配', en: 'Overlapping matches' }, input: 'AAAAA|AA' },
    { name: { zh: '完全匹配', en: 'Exact match' }, input: 'ABC|ABC' },
    { name: { zh: '无匹配', en: 'No match' }, input: 'ABC|ABD' },
    { name: { zh: '单字符不匹配', en: 'Single-char mismatch' }, input: 'A|B' },
  ],
  runnerId: 'kmp',
  visualKind: 'array-blocks',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '把 KMP 写成暴力回溯 O(n·m)', en: 'Turning KMP back into O(n·m) brute force' },
      detail: {
        zh: 'KMP 的精髓是失配时文本指针 i 永不回退，只用 lps 回退模式指针 j。若失配后把 i 也往回拨（i = i - j + 1），就退化成了暴力匹配，最坏 O(n·m)。',
        en: "KMP's essence is that on mismatch the text pointer i never moves backward — only j backtracks via lps. If you also rewind i (i = i - j + 1), it degrades to brute force with worst-case O(n·m).",
      },
      code: '// 失配：只回退 j，i 保持不变\nj = lps[j - 1];  // 正确\n// i = i - j + 1;  // 错误：文本指针回退 → 暴力匹配',
    },
    {
      title: { zh: 'lps 失配回溯写成 j = lps[i]', en: 'Backtracking with j = lps[i] instead of lps[j-1]' },
      detail: {
        zh: '构建 lps 时失配应回退到 lps[j-1]（已匹配前缀 j 的最长前后缀），而不是 lps[i]。写成 j = lps[i] 会跳过正确的候选前后缀，甚至可能死循环或得到错误的 lps 表。',
        en: 'When building lps, a mismatch should fall back to lps[j-1] (the longest prefix-suffix of the already-matched prefix of length j), not lps[i]. Writing j = lps[i] skips the correct candidate and can loop or produce a wrong table.',
      },
      code: 'if (p[i] != p[j]) {\n  if (j != 0) j = lps[j - 1];  // 正确\n  // j = lps[i];  // 错误\n}',
    },
    {
      title: { zh: 'j 回溯后忘记再次比较同一个 i', en: 'Forgetting to re-compare the same i after backtracking j' },
      detail: {
        zh: '回退 j 之后，必须用新的 j 再与同一个 i 比较（不能随手 i++）。否则会跳过本应匹配的位置，漏掉匹配或得到错误结果。i 只有在 j==0 失配时才能前进。',
        en: 'After backtracking j, you must compare the new j against the same i again (do not blindly i++). Otherwise you skip positions that could match. i may only advance when a mismatch occurs at j == 0.',
      },
      code: 'j = lps[j - 1];  // 回退后继续比较同一 i\n// 不要在 j > 0 失配时执行 i++',
    },
  ],
};
