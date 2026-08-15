import type { LocalizedText } from '../engine/types/step';

export type LingeoSiteId = 'blog' | 'codevision';

export interface LingeoSite {
  id: LingeoSiteId;
  name: LocalizedText;
  descriptor: LocalizedText;
  description: LocalizedText;
  href: string;
  code: string;
  primary: boolean;
}

/** 与博客主站同步维护；新增系列子站时遵循 docs/LINGEOCS_NETWORK.md。 */
export const lingeoSites: LingeoSite[] = [
  {
    id: 'blog',
    name: { zh: '选择性失忆', en: 'Selective Amnesia' },
    descriptor: { zh: 'LingeoCS 主站 · 研究与知识博客', en: 'LingeoCS home · research & notes' },
    description: {
      zh: '自然地理、遥感、GIS、空间数据工程与 GeoAI 的长期笔记。',
      en: 'Long-form notes on physical geography, remote sensing, GIS, spatial data and GeoAI.'
    },
    href: 'https://lingeocs.com/',
    code: 'HOME BASE',
    primary: true
  },
  {
    id: 'codevision',
    name: { zh: 'CodeVision Lab', en: 'CodeVision Lab' },
    descriptor: { zh: '交互式编程学习子站', en: 'Interactive programming lab' },
    description: {
      zh: '用可回放的代码步骤与可视化理解 C++、C#、Python 和算法。',
      en: 'Replay code and visual states to understand C++, C#, Python and algorithms.'
    },
    href: 'https://lingeocs.com/codevision-lab/',
    code: 'FIELD NOTE 02',
    primary: false
  }
];

export const lingeoNetwork = {
  name: 'LingeoCS',
  label: { zh: '系列站点', en: 'Network' } satisfies LocalizedText,
  description: {
    zh: '从博客主站前往系列工具，也能随时返回主站。',
    en: 'Move from the blog home to every LingeoCS tool — and return anytime.'
  } satisfies LocalizedText
} as const;
