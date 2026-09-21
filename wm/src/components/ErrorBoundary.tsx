import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { STORAGE_KEY } from '../utils/storage';
import { translate, type Lang, type MessageKey } from '../i18n';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Same key the i18n provider persists the participant's choice under. */
const LANG_STORAGE_KEY = 'brian.lang';

/**
 * A class component cannot call `useI18n()`, so the crash screen resolves the
 * language itself. Preference order mirrors the provider's `detectLang`:
 *
 *   1. the persisted `brian.lang` choice (written by the provider),
 *   2. `<html lang>` — which the provider keeps in sync (`zh-CN` / `en`) and
 *      which therefore also survives a crash that happens before an effect ran,
 *   3. the browser's own language, and finally Chinese, the source catalogue.
 *
 * Every step is wrapped so unavailable storage (private mode, blocked cookies)
 * or an unknown stored value degrades to a readable screen instead of throwing
 * a second time from inside the error boundary.
 */
function detectLang(): Lang {
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === 'zh' || stored === 'en') return stored;
  } catch {
    // Storage unavailable — fall through to the document language.
  }
  const documentLang = typeof document !== 'undefined' ? document.documentElement.lang : '';
  if (documentLang) return documentLang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'zh';
  return nav.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

/**
 * Top-level render-error guard.
 *
 * Before this existed, any render-time exception (for example the old
 * `profile.history.unshift` crash on a corrupted localStorage payload) unmounted
 * the whole tree and left a blank white page with no way to recover.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[WM platform] render error:', error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetData = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage unavailable: reloading is still the best recovery attempt
    }
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const lang = detectLang();
    const t = (key: MessageKey, vars?: Record<string, string | number>) => translate(lang, key, vars);

    return (
      <div
        role="alert"
        className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6"
      >
        <div className="w-full max-w-lg bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{t('error.title')}</h1>
              <p className="text-xs text-slate-400">{t('error.subtitle')}</p>
            </div>
          </div>

          <pre className="text-[11px] font-mono text-amber-300/90 bg-slate-950/80 border border-slate-800 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap break-words">
            {error.message || String(error)}
          </pre>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
            >
              {t('error.retry')}
            </button>
            <button
              onClick={this.handleReload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('error.reload')}</span>
            </button>
            <button
              onClick={this.handleResetData}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold border border-rose-800/50 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('error.resetData')}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400">{t('error.hint')}</p>
        </div>
      </div>
    );
  }
}
