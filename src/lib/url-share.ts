const INPUT_KEY = 'input';
const AUX_KEY = 'aux';

/** 从 URL 读取共享的输入数据（?input=…） */
export function readInputFromUrl(): string | null {
  try {
    return new URLSearchParams(window.location.search).get(INPUT_KEY);
  } catch {
    return null;
  }
}

/** 从 URL 读取共享的附加输入（?aux=…） */
export function readAuxFromUrl(): string | null {
  try {
    return new URLSearchParams(window.location.search).get(AUX_KEY);
  } catch {
    return null;
  }
}

/** 把当前输入写入 URL（不触发导航） */
export function writeInputToUrl(rawInput: string, auxRaw?: string): void {
  try {
    const url = new URL(window.location.href);
    if (rawInput.trim() !== '') {
      url.searchParams.set(INPUT_KEY, rawInput);
    } else {
      url.searchParams.delete(INPUT_KEY);
    }
    if (auxRaw !== undefined && auxRaw.trim() !== '') {
      url.searchParams.set(AUX_KEY, auxRaw);
    } else {
      url.searchParams.delete(AUX_KEY);
    }
    window.history.replaceState(null, '', url.toString());
  } catch {
    /* 忽略：URL 不可用时功能降级 */
  }
}

/** 构造可分享的案例链接 */
export function buildShareUrl(rawInput: string, auxRaw?: string): string {
  const url = new URL(window.location.href);
  if (rawInput.trim() !== '') {
    url.searchParams.set(INPUT_KEY, rawInput);
  } else {
    url.searchParams.delete(INPUT_KEY);
  }
  if (auxRaw !== undefined && auxRaw.trim() !== '') {
    url.searchParams.set(AUX_KEY, auxRaw);
  } else {
    url.searchParams.delete(AUX_KEY);
  }
  return url.toString();
}
