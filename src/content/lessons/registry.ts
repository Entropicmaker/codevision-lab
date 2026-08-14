import type { CodeLang } from '../../engine/types/step';
import type { CodeExample, Mistake } from '../../engine/types/algorithm';
import type { LocalizedText } from '../../engine/types/step';

/** 知识点（课程）元数据：与算法页共用同一套演示引擎与渲染器 */
export interface LessonMeta {
  id: string;
  language: CodeLang;
  chapterId: string;
  title: LocalizedText;
  difficulty: 'easy' | 'medium' | 'hard';
  prerequisites: string[];
  concept: string[];
  codeExamples: Record<CodeLang, CodeExample>;
  comparison: Array<{ aspect: LocalizedText; rows: Record<CodeLang, string> }>;
  demo?: { runnerId: string; defaultInput: string };
  commonMistakes: Mistake[];
  exercise: {
    prompt: LocalizedText;
    hints: string[];
    answer: string;
  };
}

/** 知识点注册表：随迭代填充（首批每语言 2 个） */
import { cppVarsLesson } from './cpp-vars';
import { cppPointersLesson } from './cpp-pointers';
import { cppHelloLesson } from './cpp-hello';
import { cppOperatorsLesson } from './cpp-operators';
import { cppIoLesson } from './cpp-io';
import { csharpTypesLesson } from './csharp-types';
import { csharpDelegatesLesson } from './csharp-delegates';
import { csharpStructureLesson } from './csharp-structure';
import { csharpOperatorsLesson } from './csharp-operators';
import { csharpLoopsLesson } from './csharp-loops';
import { pythonContainersLesson } from './python-containers';
import { pythonGeneratorsLesson } from './python-generators';
import { pythonStructureLesson } from './python-structure';
import { pythonPrimitivesLesson } from './python-primitives';
import { pythonFlowLesson } from './python-flow';

export const lessonMetas: LessonMeta[] = [
  cppVarsLesson,
  cppPointersLesson,
  csharpTypesLesson,
  csharpDelegatesLesson,
  csharpStructureLesson,
  csharpOperatorsLesson,
  csharpLoopsLesson,
  pythonContainersLesson,
  pythonGeneratorsLesson,
  pythonStructureLesson,
  pythonPrimitivesLesson,
  pythonFlowLesson,
  cppHelloLesson,
  cppOperatorsLesson,
  cppIoLesson,
];

export function getLessonMeta(id: string): LessonMeta | undefined {
  return lessonMetas.find((m) => m.id === id);
}

export function getLessonsByLanguage(language: CodeLang): LessonMeta[] {
  return lessonMetas.filter((m) => m.language === language);
}
