import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
  stack: string;
}

/**
 * Top-level error boundary: a render error anywhere in the app shows a readable
 * Chinese recovery screen (with a reset action) instead of a blank white page.
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
      message: err?.message ?? String(error ?? '未知错误'),
      stack: err?.stack ?? '',
    };
  }

  componentDidCatch(error: unknown, info: { componentStack?: string | null }) {
    // Keep the diagnostic in the console; the UI stays in Chinese.
    console.error('[NeuroClassify] 渲染错误:', error, info?.componentStack);
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

    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm max-w-lg w-full p-6 text-slate-800">
          <h1 className="text-lg font-bold text-slate-900 mb-2">测验界面出现异常</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            页面在渲染时遇到未预期的错误，为避免展示不完整或错误的测验内容，程序已停止当前界面。
            您已完成的测验记录保存在本浏览器的会话存储中，重新载入后仍可查看。
          </p>
          <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-lg text-[11px] font-mono text-rose-800 break-all">
            {this.state.message || '未知错误'}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-5">
            <button
              onClick={this.handleReload}
              className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              重新载入页面
            </button>
            <button
              onClick={this.handleResetSession}
              className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
            >
              清空本次会话记录并重载
            </button>
          </div>
          {this.state.stack && (
            <details className="mt-4">
              <summary className="text-[11px] text-slate-500 cursor-pointer">技术细节（供开发者排查）</summary>
              <pre className="mt-2 text-[10px] text-slate-500 whitespace-pre-wrap max-h-40 overflow-auto">
                {this.state.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
