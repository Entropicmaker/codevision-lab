/**
 * CodeMap：从带标记的源码 / 伪代码中提取 codeLineId → 行号（1-based）映射。
 * 标记语法：
 *   C++ / C#：//>codeLineId
 *   Python / 伪代码：#>codeLineId
 * 测试保证：Runner 引用的每个 codeLineId 在三种语言中都存在映射。
 */
export function extractLineMap(source: string): Record<string, number> {
  const map: Record<string, number> = {};
  const lines = source.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i]?.match(/\/\/>\s*([A-Za-z0-9_-]+)/) ?? lines[i]?.match(/#>\s*([A-Za-z0-9_-]+)/);
    if (match) {
      map[match[1]] = i + 1;
    }
  }
  return map;
}

/** 提取伪代码中 codeLineId → 行号映射（与 extractLineMap 相同规则） */
export function extractPseudocodeLines(pseudocode: string): Array<{ lineNumber: number; codeLineId: string | null; text: string }> {
  return pseudocode.split('\n').map((line, i) => {
    const match = line.match(/\/\/>\s*([A-Za-z0-9_-]+)/) ?? line.match(/#>\s*([A-Za-z0-9_-]+)/);
    return {
      lineNumber: i + 1,
      codeLineId: match ? match[1] : null,
      text: line.replace(/\s*(\/\/|#)>\s*[A-Za-z0-9_-]+\s*$/, ''),
    };
  });
}
