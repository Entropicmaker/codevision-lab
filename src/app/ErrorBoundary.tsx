import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useSettings } from '../stores/settingsStore';
import { dicts } from '../i18n';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundaryInner extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[CodeVision Lab] 渲染错误:', error, info);
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    const t = dicts[useSettings.getState().uiLang];
    return (
      <div
        role="alert"
        className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center"
      >
        <div className="text-5xl" aria-hidden>
          ⚠️
        </div>
        <h1 className="text-xl font-semibold text-text">{t.errors.somethingWrong}</h1>
        <p className="text-sm text-muted">
          {t.appNameEn} · {t.appName}
        </p>
        <button
          type="button"
          onClick={() => {
            this.setState({ hasError: false });
            window.location.reload();
          }}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          {t.common.retry}
        </button>
      </div>
    );
  }
}

export function ErrorBoundary(props: Props): ReactNode {
  return <ErrorBoundaryInner {...props} />;
}
