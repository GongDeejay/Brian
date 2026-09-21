import React from 'react';
import { translate, type Lang } from '../i18n';
import { LANG_STORAGE_KEY } from '../services/sessionStore';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
  stack: string;
}

/**
 * Reads the participant's language without a hook.
 *
 * Order of preference: `<html lang>` (set by I18nProvider), then the shared
 * `brian.lang` preference, then the browser language. Every step is wrapped:
 * this code path runs while the app is already failing, so it must never throw.
 */
function readLang(): Lang {
  try {
    const htmlLang = typeof document !== 'undefined' ? document.documentElement.lang : '';
    if (htmlLang) return htmlLang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  } catch {
    /* ignore — fall through */
  }
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === 'zh' || stored === 'en') return stored;
  } catch {
    /* storage unavailable (private mode / blocked cookies) — fall through */
  }
  try {
    const nav = typeof navigator !== 'undefined' ? navigator.language : '';
    if (nav) return nav.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  } catch {
    /* ignore */
  }
  return 'zh';
}

/**
 * Top-level error boundary: a render error anywhere in the app shows a readable
 * recovery screen (with a reset action) instead of a blank white page.
 *
 * Class component, so it resolves its strings through `translate(lang, key)`
 * rather than the `useI18n` hook.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '', stack: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const err = error as Error | undefined;
    return {
      hasError: true,
      message: err?.message ?? String(error ?? ''),
      stack: err?.stack ?? '',
    };
  }

  componentDidCatch(error: unknown, info: { componentStack?: string | null }) {
    // Keep the diagnostic in the console; the UI follows the selected language.
    const lang = readLang();
    console.error(translate(lang, 'error.consoleLabel'), error, info?.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetSession = () => {
    try {
      window.sessionStorage.removeItem('neuroclassify.sessions.v1');
    } catch {
      /* storage may be unavailable — ignore */
    }
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const lang = readLang();
    const t = (key: Parameters<typeof translate>[1]) => translate(lang, key);
    const { message, stack } = this.state;
    const detail = message.trim() || t('error.unknown');

    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm max-w-lg w-full p-6 text-slate-800">
          <h1 className="text-lg font-bold text-slate-900 mb-2">{t('error.title')}</h1>
          <p className="text-xs text-slate-600 leading-relaxed">{t('error.body')}</p>
          <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-lg text-[11px] font-mono text-rose-800 break-all">
            {detail}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-5">
            <button
              onClick={this.handleReload}
              className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {t('error.reload')}
            </button>
            <button
              onClick={this.handleResetSession}
              className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              {t('error.resetSession')}
            </button>
          </div>
          {stack && (
            <details className="mt-4">
              <summary className="text-[11px] text-slate-500 cursor-pointer">{t('error.technical')}</summary>
              <pre className="mt-2 text-[10px] text-slate-500 whitespace-pre-wrap max-h-40 overflow-auto">
                {stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
