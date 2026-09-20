import React, { useMemo } from 'react';
import { CognitiveLoadConfig, ProfileDimension, TaskId, TestSessionRecord } from '../types';
import { buildReport, clearSessions, computeProfile, describeLoad, TASK_LABELS } from '../services/sessionStore';
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

/** Real measured headline numbers of the most recent run of each paradigm. */
function buildIndicatorRows(sessions: TestSessionRecord[]) {
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
        { label: '试验数 / 完成分类', value: `${m.wcst.totalTrials} 次 / ${m.wcst.categoriesCompleted} of 6` },
        { label: '持续性错误率 (PE)', value: `${m.wcst.perseverativeErrorRate}%（PE ${m.wcst.perseverativeErrors} 次）` },
        { label: '非持续性错误 / 未反应', value: `${m.wcst.nonPerseverativeErrors} / ${m.wcst.omissions} 次` },
        {
          label: '平均反应时',
          value: m.wcst.avgReactionTimeMs === null ? '未测得' : `${m.wcst.avgReactionTimeMs} ms（n=${m.wcst.rtSampleCount}）`,
        },
      ];
    } else if (m.task === 'wpt') {
      rows = [
        { label: '试验数 / 作答数', value: `${m.wpt.totalTrials} / ${m.wpt.respondedTrials} 次` },
        { label: '最优选择率', value: `${m.wpt.optimalRate}%` },
        { label: '实际命中率', value: `${m.wpt.actualAccuracy}%` },
        { label: '未反应次数', value: `${m.wpt.timeouts} 次` },
      ];
    } else if (m.task === 'ided') {
      rows = [
        { label: '完成阶段', value: `${m.ided.stagesCompleted} of 7` },
        { label: 'EDS / IDS 错误', value: `${m.ided.edsErrors} / ${m.ided.idsErrors} 次` },
        { label: 'EDS 定势转移代价', value: `${m.ided.edsShiftCost}` },
        {
          label: 'EDS 结果',
          value: m.ided.failedStage
            ? `${m.ided.failedStage} 阶段达 ${m.ided.maxTrialsPerStage} 次上限未通过`
            : m.ided.passedEDS
            ? '已通过'
            : '未进行到 EDS',
        },
      ];
    } else if (m.task === 'gabor') {
      rows = [
        { label: '试验数', value: `${m.gabor.totalTrials} 次` },
        { label: 'II 条件正确率', value: m.gabor.ii.accuracy === null ? '未测得' : `${m.gabor.ii.accuracy}%（${m.gabor.ii.trials} 次）` },
        { label: 'RB 条件正确率', value: m.gabor.rb.accuracy === null ? '未测得' : `${m.gabor.rb.accuracy}%（${m.gabor.rb.trials} 次）` },
        { label: '平均反应时', value: m.gabor.avgReactionTimeMs === null ? '未测得' : `${m.gabor.avgReactionTimeMs} ms` },
      ];
    } else {
      rows = [
        { label: '学习 / 测试试次', value: `${m.prototype.learningTrialCount} / ${m.prototype.testTrialCount} 次` },
        { label: '未见原型 / 新畸变正确率', value: `${m.prototype.prototypeAccuracy}% / ${m.prototype.novelDistortionAccuracy}%` },
        {
          label: '原型优势效应',
          value: `${m.prototype.prototypeEnhancementEffect > 0 ? '+' : ''}${m.prototype.prototypeEnhancementEffect}pp`,
        },
        {
          label: '平均反应时',
          value: m.prototype.avgReactionTimeMs === null ? '未测得' : `${m.prototype.avgReactionTimeMs} ms`,
        },
      ];
    }

    return { task, record, rows };
  });
}

export const AnalyticsDashboard: React.FC<Props> = ({ cognitiveLoad, sessions, onClearSessions }) => {
  const profile = useMemo(() => computeProfile(sessions), [sessions]);

  /**
   * Radar data is built ONLY from measured sessions. A dimension without data is
   * drawn as 0 and explicitly labelled 暂无数据 — never filled with an estimate.
   */
  const radarData: RadarDatum[] = profile.dimensions.map((d: ProfileDimension) => ({
    subject: d.available ? d.label : `${d.label}（暂无数据）`,
    score: d.score ?? 0,
    hasData: d.available,
    fullMark: 100,
    brain: d.brain,
    explanation: d.explanation,
    detail: d.detail,
  }));

  const indicatorRows = buildIndicatorRows(sessions);
  const recordedTasks = indicatorRows.filter((row) => row.record !== null).length;

  const handleExportJson = () => {
    // The exported report is derived from the stored measurements only; with no
    // (or insufficient) data it contains nulls plus an explicit explanation.
    const report = buildReport(sessions, cognitiveLoad);

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
    if (typeof window !== 'undefined' && !window.confirm('确定要清除本浏览器会话中记录的全部测验数据吗？此操作不可撤销。')) {
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
                多维神经认知画像 (Neuro-Cognitive Profiler)
              </span>
              <span className="text-xs text-slate-500 font-mono">仅基于实际完成的测验记录</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">分类与模式识别能力多维评估报告</h2>
            <p className="text-xs text-slate-600 max-w-3xl mt-0.5">
              本页所有数值均由您在本机实际完成的测验记录计算得出（WCST / WPT / ID/ED / Gabor / 原型畸变）。
              未完成或样本量不足的维度一律显示为
              <span className="font-semibold text-slate-900">“暂无数据”</span>
              ，系统不会用示范值或估计值填补。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              导出评估报告 (JSON)
            </button>
            <button
              onClick={handleClear}
              disabled={sessions.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              清除记录
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
          数据状态：
          {sessions.length === 0
            ? '尚无任何测验记录'
            : profile.unavailableLabels.length > 0
            ? `部分维度可用（${profile.compositeSampleCount}/6）`
            : '全部 6 个维度均可用'}
        </div>
        <p>
          已记录会话 <strong>{sessions.length}</strong> 条（覆盖 {recordedTasks}/5 个测验范式），保存在本浏览器
          sessionStorage 中，关闭标签页即清除。需要说明的是：
          <strong>本系统不输出临床结论</strong>
          （如“正常”“优异”“极低耗损”），此类判读需要标准化常模与临床访谈；导出的报告同样只包含实测数据与数据不足的明确说明。
        </p>
        {profile.unavailableLabels.length > 0 && (
          <ul className="mt-2 list-disc pl-5 space-y-0.5">
            {profile.dimensions
              .filter((d) => !d.available)
              .map((d) => (
                <li key={d.key}>
                  <strong>{d.label}</strong>：{d.explanation}
                </li>
              ))}
          </ul>
        )}
        {sessions.length === 0 && (
          <p className="mt-2">
            导出的报告在无数据时不会包含任何分数：<code className="font-mono">dataStatus = &quot;insufficient&quot;</code>
            ，6 个维度全部为 <code className="font-mono">null</code>，并逐条说明缺失原因与系统局限。
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
              脑区神经认知能力雷达图 (Cognitive Radar)
            </h3>
            <span className="text-xs text-slate-400 font-mono">满分 100</span>
          </div>
          <p className="text-xs text-slate-500 w-full mb-4">
            每一轴均来自一次完整测验的实测值；标有“暂无数据”的轴在图上以 0 绘制，仅表示尚无测量，不代表能力为 0。
          </p>

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
                          {datum.hasData ? `${datum.score} 分` : '暂无数据（未完成该测验或样本量不足）'}
                        </div>
                        {datum.hasData && <div className="mt-1 text-[11px] text-slate-300">{datum.detail}</div>}
                      </div>
                    );
                  }}
                />
                <Radar
                  name="受试者实测分"
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
              <span className="text-slate-500 block text-[11px]">综合指数（可用维度均值）</span>
              <span className="font-bold font-mono text-indigo-600 text-base">
                {profile.compositeIndex === null ? '暂无数据' : `${profile.compositeIndex} / 100`}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                由 {profile.compositeSampleCount} 个可用维度取平均；不可用维度不参与计算
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">已记录会话数</span>
              <span className="font-bold font-mono text-slate-800 text-base">{sessions.length}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">每个维度取该范式最近一次完整记录</span>
            </div>
          </div>
        </div>

        {/* Dimensional breakdown */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              维度得分与计算依据（逐项可追溯）
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
                      {dim.available ? `${dim.score} / 100` : '暂无数据'}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{dim.detail || dim.explanation}</p>
                  {dim.available && <p className="text-[11px] text-slate-400 mt-0.5">计算依据：{dim.explanation}</p>}
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
            各测验最近一次实测指标
          </h3>
          <span className="text-xs text-slate-400 font-mono">未完成的范式显示“无记录”</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {indicatorRows.map(({ task, record, rows }) => (
            <div key={task} className="p-3 rounded-lg border border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">{TASK_LABELS[task]}</span>
                {record ? (
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(record.timestamp).toLocaleString('zh-CN')}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">无记录</span>
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
                    负荷设置：{describeLoad(record.loadConfig)} · 用时 {record.durationSeconds}s
                  </p>
                </>
              ) : (
                <p className="text-[11px] text-slate-500 mt-2">
                  暂无数据：完成一次完整的{task === 'gabor' ? ' Gabor 分类试次并提交' : '测验'}后，此处会显示实测指标。
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
          <strong>关于临床结论：</strong>
          本系统不生成“正常 / 优异 / 极低耗损”等判定语句。此类结论必须依托标准化常模、受试者人口学信息与临床访谈，
          而本工具没有对应常模数据，因此报告的 <code className="font-mono">notProvided</code> 字段会明确说明这些内容未被提供。
        </div>
      </div>

      {/* Session history */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">测验记录流水（{sessions.length} 条）</h3>
          <span className="text-xs text-slate-400 font-mono">最新记录在最下方</span>
        </div>

        {sessions.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            暂无记录。请先完成任一测验（WCST / WPT / ID/ED / Gabor / 原型畸变）的完整一轮。
          </p>
        ) : (
          <div className="overflow-x-auto max-h-72 overflow-y-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">本机已记录的测验会话</caption>
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                <tr>
                  <th scope="col" className="py-2 px-3">时间</th>
                  <th scope="col" className="py-2 px-3">测验</th>
                  <th scope="col" className="py-2 px-3">正确率</th>
                  <th scope="col" className="py-2 px-3">关键指标</th>
                  <th scope="col" className="py-2 px-3">负荷设置</th>
                  <th scope="col" className="py-2 px-3">用时</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sessions.map((record) => (
                  <tr key={record.id}>
                    <td className="py-2 px-3 font-mono whitespace-nowrap">
                      {new Date(record.timestamp).toLocaleString('zh-CN')}
                    </td>
                    <td className="py-2 px-3">{TASK_LABELS[record.task]}</td>
                    <td className="py-2 px-3 font-mono">{record.accuracy}%</td>
                    <td className="py-2 px-3">
                      <span className="text-slate-500">{record.keyMetricName}：</span>
                      <span className="font-mono">{record.keyMetricValue}</span>
                    </td>
                    <td className="py-2 px-3 text-[11px] text-slate-500">{describeLoad(record.loadConfig)}</td>
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
