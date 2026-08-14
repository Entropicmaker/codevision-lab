import { describe, expect, it } from 'vitest';
import { extractLineMap, extractPseudocodeLines } from './extract';

describe('extractLineMap', () => {
  it('提取 //> 与 #> 标记为行号映射（1-based）', () => {
    const source = [
      'void f() {   //>func',
      '  int n = 0; //>init',
      '  return;    //>end',
    ].join('\n');
    expect(extractLineMap(source)).toEqual({ func: 1, init: 2, end: 3 });
  });

  it('同 id 多次出现时保留最后一个（嵌套循环场景）', () => {
    const source = ['for (..) { //>outer', '  //>outer', '}'].join('\n');
    expect(extractLineMap(source).outer).toBe(2);
  });
});

describe('extractPseudocodeLines', () => {
  it('去掉行尾标记并保留 codeLineId', () => {
    const lines = extractPseudocodeLines('bubbleSort(a):  #>func\n  n = len(a)  //>init');
    expect(lines).toEqual([
      { lineNumber: 1, codeLineId: 'func', text: 'bubbleSort(a):' },
      { lineNumber: 2, codeLineId: 'init', text: '  n = len(a)' },
    ]);
  });
});
