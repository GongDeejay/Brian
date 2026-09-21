import React, { useMemo } from 'react';
import { CognitiveLoadConfig, ProfileDimension, TaskId, TestSessionRecord } from '../types';
import { buildReport, clearSessions, computeProfile, describeLoad, TASK_LABELS } from '../services/sessionStore';
import { useI18n } from '../i18n';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import {
  Brain,
  Download,
  Award,
  ShieldAlert,
  Info,
  Database,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  cognitiveLoad: CognitiveLoadConfig;
  /** Real session history recorded from the paradigms (never synthesised). */
  sessions: TestSessionRecord[];
  onClearSessions: () => void;
}

interface RadarDatum {
  subject: string;
  score: number;
  hasData: boolean;
  fullMark: number;
  brain: string;
  explanation: string;
  detail: string;
}

const TASK_ORDER: TaskId[] = ['wcst', 'wpt', 'ided', 'gabor', 'prototype'];

type Translate = ReturnType<typeof useI18n>['t'];

/** Real measured headline numbers of the most recent run of each paradigm. */
function buildIndicatorRows(
  t: Translate,
  sessions: TestSessionRecord[]
): { task: TaskId; record: TestSessionRecord | null; rows: { label: string; value: string }[] }[] {
  const latest = new Map<TaskId, TestSessionRecord>();
  for (const record of sessions) latest.set(record.task, record);

  return TASK_ORDER.map((task) => {
    const record = latest.get(task);
    if (!record) {
      return { task, record: null, rows: [] as { label: string; value: string }[] };
    }

    let rows: { label: string; value: string }[] = [];
    const m = record.metrics;
    if (m.task === 'wcst') {
      rows = [
        {
          label: t('analytics.row.wcst.trials'),
          value: t('analytics.row.wcst.trialsValue', { trials: m.wcst.totalTrials, categories: m.wcst.categoriesCompleted }),
        },
        {
          label: t('analytics.row.wcst.pe'),
          value: t('analytics.row.wcst.peValue', {
            rate: m.wcst.perseverativeErrorRate,
            errors: m.wcst.perseverativeErrors,
          }),
        },
        {
          label: t('analytics.row.wcst.errors'),
          value: t('analytics.row.wcst.errorsValue', {
            npe: m.wcst.nonPerseverativeErrors,
            omissions: m.wcst.omissions,
          }),
        },
        {
          label: t('analytics.row.rt'),
          value:
            m.wcst.avgReactionTimeMs === null
              ? t('analytics.row.notMeasured')
              : t('analytics.row.rtValueSampled', { ms: m.wcst.avgReactionTimeMs, n: m.wcst.rtSampleCount }),
        },
      ];
    } else if (m.task === 'wpt') {
      rows = [
        {
          label: t('analytics.row.wpt.trials'),
          value: t('analytics.row.wpt.trialsValue', { total: m.wpt.totalTrials, responded: m.wpt.respondedTrials }),
        },
        { label: t('analytics.row.wpt.optimal'), value: t('analytics.row.wpt.optimalValue', { rate: m.wpt.optimalRate }) },
        { label: t('analytics.row.wpt.accuracy'), value: t('analytics.row.wpt.accuracyValue', { rate: m.wpt.actualAccuracy }) },
        { label: t('analytics.row.wpt.timeouts'), value: t('analytics.row.wpt.timeoutsValue', { count: m.wpt.timeouts }) },
      ];
    } else if (m.task === 'ided') {
      rows = [
        { label: t('analytics.row.ided.stages'), value: t('analytics.row.ided.stagesValue', { stages: m.ided.stagesCompleted }) },
        {
          label: t('analytics.row.ided.errors'),
          value: t('analytics.row.ided.errorsValue', { eds: m.ided.edsErrors, ids: m.ided.idsErrors }),
        },
        {
          label: t('analytics.row.ided.shiftCost'),
          value: t('analytics.row.ided.shiftCostValue', { cost: m.ided.edsShiftCost }),
        },
        {
          label: t('analytics.row.ided.result'),
          value: m.ided.failedStage
            ? t('analytics.row.ided.failed', { stage: m.ided.failedStage, max: m.ided.maxTrialsPerStage })
            : m.ided.passedEDS
            ? t('analytics.row.ided.passed')
            : t('analytics.row.ided.notReached'),
        },
      ];
    } else if (m.task === 'gabor') {
      rows = [
        { label: t('analytics.row.gabor.trials'), value: t('analytics.row.gabor.trialsValue', { count: m.gabor.totalTrials }) },
        {
          label: t('analytics.row.gabor.ii'),
          value:
            m.gabor.ii.accuracy === null
              ? t('analytics.row.notMeasured')
              : t('analytics.row.gabor.iiValue', { rate: m.gabor.ii.accuracy, trials: m.gabor.ii.trials }),
        },
        {
          label: t('analytics.row.gabor.rb'),
          value:
            m.gabor.rb.accuracy === null
              ? t('analytics.row.notMeasured')
              : t('analytics.row.gabor.rbValue', { rate: m.gabor.rb.accuracy, trials: m.gabor.rb.trials }),
        },
        {
          label: t('analytics.row.rt'),
          value:
            m.gabor.avgReactionTimeMs === null
              ? t('analytics.row.notMeasured')
              : t('analytics.row.rtValue', { ms: m.gabor.avgReactionTimeMs }),
        },
      ];
    } else {
      rows = [
        {
          label: t('analytics.row.prototype.trials'),
          value: t('analytics.row.prototype.trialsValue', {
            learning: m.prototype.learningTrialCount,
            test: m.prototype.testTrialCount,
          }),
        },
        {
          label: t('analytics.row.prototype.accuracies'),
          value: t('analytics.row.prototype.accuraciesValue', {
            proto: m.prototype.prototypeAccuracy,
            novel: m.prototype.novelDistortionAccuracy,
          }),
        },
        {
          label: t('analytics.row.prototype.effect'),
          value: t('analytics.row.prototype.effectValue', {
            effect: `${m.prototype.prototypeEnhancementEffect > 0 ? '+' : ''}${m.prototype.prototypeEnhancementEffect}`,
          }),
        },
        {
          label: t('analytics.row.rt'),
          value:
            m.prototype.avgReactionTimeMs === null
              ? t('analytics.row.notMeasured')
              : t('analytics.row.rtValue', { ms: m.prototype.avgReactionTimeMs }),
        },
      ];
    }

    return { task, record, rows };
  });
}

export const AnalyticsDashboard: React.FC<Props> = ({ cognitiveLoad, sessions, onClearSessions }) => {
  const { t, lang } = useI18n();
  // `computeProfile` is a plain function, so it takes the language explicitly;
  // every score in it is still derived from measured values only.
  const profile = useMemo(() => computeProfile(sessions, lang), [sessions, lang]);

  /**
   * Radar data is built ONLY from measured sessions. A dimension without data is
   * drawn as 0 and explicitly labelled as unavailable — never filled with an estimate.
   */
  const radarData: RadarDatum[] = profile.dimensions.map((d: ProfileDimension) => ({
    subject: d.available ? d.label : t('analytics.radar.subjectNoData', { label: d.label }),
    score: d.score ?? 0,
    hasData: d.available,
    fullMark: 100,
    brain: d.brain,
    explanation: d.explanation,
    detail: d.detail,
  }));

  const indicatorRows = buildIndicatorRows(t, sessions);
  const recordedTasks = indicatorRows.filter((row) => row.record !== null).length;

  const locale = lang === 'zh' ? 'zh-CN' : 'en-US';
  const dateTimeFormat: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };
  const formatTimestamp = (timestamp: string) => new Date(timestamp).toLocaleString(locale, dateTimeFormat);

  const handleExportJson = () => {
    // The exported report is derived from the stored measurements only; with no
    // (or insufficient) data it contains nulls plus an explicit explanation.
    // It is rendered in the language the participant is currently using.
    const report = buildReport(sessions, cognitiveLoad, lang);

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `neuro_classification_report_${Date.now()}.json`;
    anchor.rel = 'noopener';
    anchor.style.display = 'none';
    // The anchor must be in the document for the click to count as a user-agent
    // download, and the object URL must survive the tick in which click() runs.
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const handleClear = () => {
    if (typeof window !== 'undefined' && !window.confirm(t('analytics.confirmClear'))) {
      return;
    }
    clearSessions();
    onClearSessions();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                {t('analytics.badge')}
              </span>
              <span className="text-xs text-slate-500 font-mono">{t('analytics.badgeNote')}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{t('analytics.title')}</h2>
            <p className="text-xs text-slate-600 max-w-3xl mt-0.5">
              {t('analytics.intro')}{' '}
              <span className="font-semibold text-slate-900">{t('analytics.introNoData')}</span>
              {t('analytics.introTail')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              {t('analytics.action.export')}
            </button>
            <button
              onClick={handleClear}
              disabled={sessions.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              {t('analytics.action.clear')}
            </button>
          </div>
        </div>
      </div>

      {/* Data status: what exists and what does not */}
      <div
        className={`rounded-xl border p-4 text-xs ${
          sessions.length === 0
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : profile.unavailableLabels.length > 0
            ? 'bg-blue-50 border-blue-200 text-blue-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}
      >
        <div className="font-bold flex items-center gap-1.5 mb-1">
          <Database className="w-4 h-4" aria-hidden="true" />
          {t('analytics.status.heading')}
          {sessions.length === 0
            ? t('analytics.status.none')
            : profile.unavailableLabels.length > 0
            ? t('analytics.status.partial', { available: profile.compositeSampleCount })
            : t('analytics.status.complete')}
        </div>
        <p>
          {t('analytics.status.summaryPrefix')}
          <strong>{sessions.length}</strong>
          {t('analytics.status.summaryMid', { covered: recordedTasks })}
          <strong>{t('analytics.status.noClinical')}</strong>
          {t('analytics.status.summaryTail')}
        </p>
        {profile.unavailableLabels.length > 0 && (
          <ul className="mt-2 list-disc pl-5 space-y-0.5">
            {profile.dimensions
              .filter((d) => !d.available)
              .map((d) => (
                <li key={d.key}>
                  <strong>{d.label}</strong>
                  {t('analytics.dimensionJoin')}
                  {d.explanation}
                </li>
              ))}
          </ul>
        )}
        {sessions.length === 0 && (
          <p className="mt-2">
            {t('analytics.status.emptyPrefix')}
            <code className="font-mono">{t('analytics.inlineCodeInsufficient')}</code>
            {t('analytics.status.emptyMid')}
            <code className="font-mono">{t('analytics.inlineCodeNull')}</code>
            {t('analytics.status.emptyTail')}
          </p>
        )}
      </div>

      {/* Main Analytics Layout: Radar on Left, Dimensional Breakdown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              {t('analytics.radar.title')}
            </h3>
            <span className="text-xs text-slate-400 font-mono">{t('analytics.radar.fullMark')}</span>
          </div>
          <p className="text-xs text-slate-500 w-full mb-4">{t('analytics.radar.note')}</p>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 10, fontWeight: 500 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" tick={{ fontSize: 10 }} />
                <Tooltip
                  content={({ active, payload }: { active?: boolean; payload?: readonly { payload?: RadarDatum }[] }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const datum = payload[0].payload;
                    if (!datum) return null;
                    return (
                      <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 max-w-[240px]">
                        <div className="font-semibold">{datum.subject}</div>
                        <div className="mt-0.5">
                          {datum.hasData
                            ? t('analytics.radar.tooltipScore', { score: datum.score })
                            : t('analytics.radar.tooltipNoData')}
                        </div>
                        {datum.hasData && <div className="mt-1 text-[11px] text-slate-300">{datum.detail}</div>}
                      </div>
                    );
                  }}
                />
                <Radar
                  name={t('analytics.radar.series')}
                  dataKey="score"
                  stroke="#4f46e5"
                  fill="#6366f1"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">{t('analytics.radar.composite')}</span>
              <span className="font-bold font-mono text-indigo-600 text-base">
                {profile.compositeIndex === null
                  ? t('analytics.introNoData')
                  : t('analytics.radar.compositeValue', { score: profile.compositeIndex })}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {t('analytics.radar.compositeNote', { count: profile.compositeSampleCount })}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">{t('analytics.radar.sessionCount')}</span>
              <span className="font-bold font-mono text-slate-800 text-base">{sessions.length}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{t('analytics.radar.sessionCountNote')}</span>
            </div>
          </div>
        </div>

        {/* Dimensional breakdown */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              {t('analytics.dims.title')}
            </h3>

            <div className="space-y-2.5 text-xs">
              {profile.dimensions.map((dim) => (
                <div key={dim.key} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                      {dim.available ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                      ) : (
                        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                      )}
                      {dim.label}
                      <span className="text-[10px] font-normal text-slate-400">({dim.brain})</span>
                    </span>
                    <span
                      className={`font-mono px-2 py-0.5 rounded border shrink-0 ${
                        dim.available
                          ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                          : 'text-slate-500 bg-slate-100 border-slate-200'
                      }`}
                    >
                      {dim.available
                        ? t('analytics.dims.score', { score: dim.score ?? 0 })
                        : t('analytics.introNoData')}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{dim.detail || dim.explanation}</p>
                  {dim.available && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {t('analytics.dims.basis', { explanation: dim.explanation })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Per-paradigm measured indicators (replaces the former hardcoded verdict cards) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" aria-hidden="true" />
            {t('analytics.indicators.title')}
          </h3>
          <span className="text-xs text-slate-400 font-mono">{t('analytics.indicators.note')}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {indicatorRows.map(({ task, record, rows }) => (
            <div key={task} className="p-3 rounded-lg border border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">{t(TASK_LABELS[task])}</span>
                {record ? (
                  <span className="text-[10px] font-mono text-slate-400">{formatTimestamp(record.timestamp)}</span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">{t('analytics.indicators.noRecord')}</span>
                )}
              </div>

              {record ? (
                <>
                  <dl className="mt-2 space-y-1 text-[11px]">
                    {rows.map((row) => (
                      <div key={row.label} className="flex items-center justify-between gap-2">
                        <dt className="text-slate-500">{row.label}</dt>
                        <dd className="font-mono text-slate-800">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="text-[10px] text-slate-400 mt-2">
                    {t('analytics.indicators.load', {
                      load: describeLoad(record.loadConfig, lang),
                      seconds: record.durationSeconds,
                    })}
                  </p>
                </>
              ) : (
                <p className="text-[11px] text-slate-500 mt-2">
                  {task === 'gabor' ? t('analytics.indicators.emptyGabor') : t('analytics.indicators.empty')}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
          <strong>{t('analytics.verdict.heading')}</strong>
          {t('analytics.verdict.body')}
          <code className="font-mono">{t('analytics.inlineCodeNotProvided')}</code>
          {t('analytics.verdict.tail')}
        </div>
      </div>

      {/* Session history */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">{t('analytics.history.title', { count: sessions.length })}</h3>
          <span className="text-xs text-slate-400 font-mono">{t('analytics.history.note')}</span>
        </div>

        {sessions.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">{t('analytics.history.empty')}</p>
        ) : (
          <div className="overflow-x-auto max-h-72 overflow-y-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">{t('analytics.history.caption')}</caption>
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                <tr>
                  <th scope="col" className="py-2 px-3">{t('analytics.history.colTime')}</th>
                  <th scope="col" className="py-2 px-3">{t('analytics.history.colTask')}</th>
                  <th scope="col" className="py-2 px-3">{t('analytics.history.colAccuracy')}</th>
                  <th scope="col" className="py-2 px-3">{t('analytics.history.colKeyMetric')}</th>
                  <th scope="col" className="py-2 px-3">{t('analytics.history.colLoad')}</th>
                  <th scope="col" className="py-2 px-3">{t('analytics.history.colDuration')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sessions.map((record) => (
                  <tr key={record.id}>
                    <td className="py-2 px-3 font-mono whitespace-nowrap">{formatTimestamp(record.timestamp)}</td>
                    <td className="py-2 px-3">{t(TASK_LABELS[record.task])}</td>
                    <td className="py-2 px-3 font-mono">{record.accuracy}%</td>
                    <td className="py-2 px-3">
                      <span className="text-slate-500">
                        {record.keyMetricName}
                        {t('analytics.dimensionJoin')}
                      </span>
                      <span className="font-mono">{record.keyMetricValue}</span>
                    </td>
                    <td className="py-2 px-3 text-[11px] text-slate-500">
                      {describeLoad(record.loadConfig, lang)}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-500">{record.durationSeconds}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
