import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { STORAGE_KEY } from '../utils/storage';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
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
    console.error('[工作记忆平台] 渲染异常:', error, info.componentStack);
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
              <h1 className="text-lg font-bold text-white">页面遇到问题，已安全暂停</h1>
              <p className="text-xs text-slate-400">渲染过程出现异常，你的本地训练记录仍然保留。</p>
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
              重试渲染
            </button>
            <button
              onClick={this.handleReload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>重新加载页面</span>
            </button>
            <button
              onClick={this.handleResetData}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold border border-rose-800/50 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清除本地数据并重载</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            若问题持续出现，请点击「清除本地数据并重载」重建本地记录（历史训练日志会被删除）。
          </p>
        </div>
      </div>
    );
  }
}
