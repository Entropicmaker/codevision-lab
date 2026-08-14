import { useEffect } from 'react';

export type ShortcutAction =
  | 'toggle'
  | 'prev'
  | 'next'
  | 'reset'
  | 'start'
  | 'end'
  | 'random'
  | 'slower'
  | 'faster';

const KEY_MAP: Record<string, ShortcutAction> = {
  ' ': 'toggle',
  ArrowLeft: 'prev',
  ArrowRight: 'next',
  r: 'reset',
  Home: 'start',
  End: 'end',
  s: 'random',
  '[': 'slower',
  ']': 'faster',
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable
  );
}

/** 全局键盘快捷键：输入控件（含 Monaco 内部 textarea）中不生效 */
export function useKeyboardShortcuts(handler: (action: ShortcutAction) => void): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (isEditableTarget(e.target)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const action = KEY_MAP[e.key];
      if (action) {
        e.preventDefault();
        handler(action);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handler]);
}
