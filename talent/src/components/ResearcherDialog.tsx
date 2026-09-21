import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { BarChart3, Download, FileSpreadsheet, Plus, RefreshCw, Users, X } from 'lucide-react';
import { useI18n } from '../authI18n';
import { useDialogA11y } from '../hooks/useDialogA11y';
import { useAuth } from '../context/AuthContext';
import {
  createSubjectCodes,
  downloadResearchCsv,
  researchOverview,
  researchSessions,
  researchSubjects,
  type RemoteSession,
  type ResearchOverview,
  type ResearchSubject,
} from '../services/authApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const panel = 'rounded-xl border border-slate-700 bg-slate-950/50 p-3';
const smallButton =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50';
const primaryButton =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50';

/** 从任意范式的 metrics 里挑出少量标量，作为“关键指标”的通用展示。 */
function summariseMetrics(metrics: unknown): string {
  if (!metrics || typeof metrics !== 'object') return '';
  const parts: string[] = [];
  for (const [key, value] of Object.entries(metrics as Record<string, unknown>)) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      parts.push(`${key}=${Math.round(value * 100) / 100}`);
    }
    if (parts.length >= 3) break;
  }
  return parts.join(' · ');
}

export const ResearcherDialog = ({ isOpen, onClose }: Props) => {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { panelRef, handleBackdropMouseDown } = useDialogA11y({ isOpen, onClose });

  const [overview, setOverview] = useState<ResearchOverview | null>(null);
  const [subjects, setSubjects] = useState<ResearchSubject[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [sessions, setSessions] = useState<RemoteSession[]>([]);
  const [codesInput, setCodesInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isResearcher = user?.role === 'researcher';

  const loadAll = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const [nextOverview, nextSubjects] = await Promise.all([researchOverview(), researchSubjects()]);
      setOverview(nextOverview);
      setSubjects(nextSubjects);
    } catch {
      setError(t('research.forbidden'));
    } finally {
      setBusy(false);
    }
  }, [t]);

  useEffect(() => {
    if (isOpen && isResearcher) void loadAll();
  }, [isOpen, isResearcher, loadAll]);

  // 选定编号后加载其记录，用于观察个体随时间的变化。
  useEffect(() => {
    if (!isOpen || !selected) {
      setSessions([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const rows = await researchSessions({ subjectCode: selected, limit: 500 });
        if (!cancelled) {
          // 后端按时间倒序返回，趋势图按时间正序更易读。
          setSessions([...rows].sort((a, b) => a.startedAt.localeCompare(b.startedAt)));
        }
      } catch {
        if (!cancelled) setSessions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, selected]);

  const parsedCodes = useMemo(
    () =>
      codesInput
        .split(/[\s,;，、]+/)
        .map((code) => code.trim())
        .filter((code) => code.length > 0),
    [codesInput]
  );

  const handleCreate = useCallback(async () => {
    if (parsedCodes.length === 0) return;
    setBusy(true);
    setNotice(null);
    try {
      const result = await createSubjectCodes(parsedCodes);
      setNotice(t('research.createResult', { created: result.created.length, existing: result.existing.length }));
      setCodesInput('');
      await loadAll();
    } catch {
      setError(t('research.forbidden'));
    } finally {
      setBusy(false);
    }
  }, [loadAll, parsedCodes, t]);

  if (!isOpen) return null;

  /*
   * 用 portal 挂到 document.body。
   *
   * 这两个弹窗由 Header 渲染，而 Header 带 backdrop-blur —— backdrop-filter 会为
   * fixed 后代创建包含块，使 `position: fixed` 退化为相对 Header 定位，页面滚动时
   * 弹窗会跟着移动、顶部被裁掉。portal 让弹窗真正相对视口定位。
   */
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="researcher-dialog-title"
        className="my-4 w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="researcher-dialog-title" className="flex items-center gap-2 text-lg font-bold text-white">
            <BarChart3 className="h-5 w-5 text-indigo-400" aria-hidden="true" />
            {t('research.title')}
          </h2>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => void loadAll()} disabled={busy} className={smallButton}>
              <RefreshCw className={`h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} aria-hidden="true" />
              {t('research.refresh')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              aria-label={t('common.close')}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {!isResearcher && <p className="text-sm text-amber-300">{t('research.forbidden')}</p>}
        {error && <p className="mb-3 text-sm text-rose-300">{error}</p>}
        {notice && <p className="mb-3 text-sm text-emerald-300">{notice}</p>}
        {busy && !overview && <p className="text-sm text-slate-400">{t('research.loading')}</p>}

        {isResearcher && (
          <div className="space-y-4">
            {/* 总览 */}
            {overview && (
              <section className={panel}>
                <p className="mb-2 text-xs font-semibold text-slate-200">{t('research.overview')}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(
                    [
                      ['research.participants', overview.totals.participants],
                      ['research.subjects', overview.totals.subjects],
                      ['research.sessions', overview.totals.sessions],
                      ['research.codedSubjects', overview.totals.codedSubjects],
                    ] as const
                  ).map(([key, value]) => (
                    <div key={key} className="rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-2">
                      <p className="text-[11px] text-slate-400">{t(key)}</p>
                      <p className="font-mono text-lg font-bold text-slate-100">{value}</p>
                    </div>
                  ))}
                </div>
                {overview.byTask.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1 text-[11px] font-medium text-slate-400">{t('research.byTask')}</p>
                    <ul className="flex flex-wrap gap-1.5">
                      {overview.byTask.map((row) => (
                        <li
                          key={`${row.app}-${row.task}`}
                          className="rounded border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[11px] text-slate-300"
                        >
                          <span className="font-mono">{row.app}/{row.task}</span> · {row.count}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* 创建编号 */}
            <section className={panel}>
              <p className="mb-1 text-xs font-semibold text-slate-200">{t('research.createTitle')}</p>
              <p className="mb-2 text-[11px] text-slate-400">{t('research.createHint')}</p>
              <textarea
                rows={3}
                value={codesInput}
                onChange={(event) => setCodesInput(event.target.value)}
                placeholder={t('research.createPlaceholder')}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 font-mono text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleCreate()}
                  disabled={busy || parsedCodes.length === 0}
                  className={primaryButton}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('research.create')}
                  {parsedCodes.length > 0 && ` (${parsedCodes.length})`}
                </button>
                <button type="button" onClick={() => void downloadResearchCsv()} className={smallButton}>
                  <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('research.exportAll')}
                </button>
              </div>
            </section>

            {/* 编号列表 */}
            <section className={panel}>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                {t('research.subjectList')}
              </p>
              {subjects.length === 0 ? (
                <p className="text-xs text-slate-500">{t('research.noSubjects')}</p>
              ) : (
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-900 text-[11px] text-slate-400">
                      <tr>
                        <th className="py-1 pr-2 font-medium">{t('research.subjectCode')}</th>
                        <th className="py-1 pr-2 font-medium">{t('research.subjectSessions')}</th>
                        <th className="py-1 pr-2 font-medium">{t('research.subjectOwner')}</th>
                        <th className="py-1 font-medium" />
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((subject) => (
                        <tr
                          key={subject.id}
                          className={`border-t border-slate-800 ${
                            selected === subject.code ? 'bg-indigo-950/40' : ''
                          }`}
                        >
                          <td className="py-1.5 pr-2">
                            <button
                              type="button"
                              onClick={() => setSelected(subject.code)}
                              className="font-mono text-indigo-300 hover:text-indigo-200 hover:underline"
                            >
                              {subject.code}
                            </button>
                          </td>
                          <td className="py-1.5 pr-2 font-mono text-slate-300">{subject.sessionCount}</td>
                          <td className="py-1.5 pr-2 text-slate-400">
                            {subject.ownerEmail ?? <span className="text-slate-600">{t('research.unbound')}</span>}
                          </td>
                          <td className="py-1.5 text-right">
                            <button
                              type="button"
                              onClick={() => void downloadResearchCsv(subject.code)}
                              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                              title={t('research.exportOne')}
                            >
                              <Download className="h-3 w-3" aria-hidden="true" />
                              CSV
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* 个体变化趋势 */}
            <section className={panel}>
              <p className="mb-1 text-xs font-semibold text-slate-200">{t('research.trend')}</p>
              <p className="mb-2 text-[11px] text-slate-400">{t('research.trendHint')}</p>
              {!selected ? (
                <p className="text-xs text-slate-500">{t('research.noSubjects')}</p>
              ) : sessions.length === 0 ? (
                <p className="text-xs text-slate-500">{t('research.noSessions')}</p>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-900 text-[11px] text-slate-400">
                      <tr>
                        <th className="py-1 pr-2 font-medium">{t('research.startedAt')}</th>
                        <th className="py-1 pr-2 font-medium">{t('research.task')}</th>
                        <th className="py-1 font-medium">{t('research.keyMetric')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((session) => (
                        <tr key={session.clientId} className="border-t border-slate-800">
                          <td className="py-1.5 pr-2 font-mono text-[11px] text-slate-400">
                            {new Date(session.startedAt).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', {
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-1.5 pr-2 text-slate-300">{session.task}</td>
                          <td className="py-1.5 font-mono text-[11px] text-slate-300">
                            {summariseMetrics(session.metrics)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
