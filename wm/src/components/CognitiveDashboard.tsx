import { useState } from 'react';
import { Brain, BarChart3, Clock, Sparkles, Trash2, ArrowRight, AlertTriangle } from 'lucide-react';
import { CognitiveProfile, TaskType } from '../types/wm';
import { RadarChart } from './RadarChart';

interface CognitiveDashboardProps {
  profile: CognitiveProfile;
  onSelectTab: (tab: TaskType) => void;
  onClearHistory: () => void;
}

/** A cognitive dimension is either measured (0-100) or explicitly not measured. */
interface Dimension {
  key: string;
  label: string;
  value: number | null;
  source: string;
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export const CognitiveDashboard = ({
  profile,
  onSelectTab,
  onClearHistory,
}: CognitiveDashboardProps) => {
  const [confirmingClear, setConfirmingClear] = useState(false);

  const nback = profile.lastNBackResult;
  const ospan = profile.lastOSPANResult;
  const changeDetection = profile.lastChangeDetectionResult;

  /**
   * Every dimension below is null unless the underlying measurement exists.
   * The previous version substituted hardcoded defaults (65/65/65/70/75), so a
   * first-time visitor immediately saw "综合指数 68", a full radar pentagon and a
   * flattering verdict built from invented baselines. Nothing is substituted now.
   *
   * The linear 0-100 mappings are the original ones, except that the arbitrary
   * floors (20/25/30/35) were removed: flooring hidden real extremes (e.g. a
   * negative d' or Cowan's K) to a flattering minimum, the same class of error as
   * clamping d' to -1.0 in the statistics module.
   */

  // 1. Updating (N-back d'): 0 -> 40, 2.0 -> 80, 3.0 -> 100
  const updatingScore = nback ? clampScore(40 + nback.dPrime * 20) : null;

  // 2. Complex span (OSPAN serial recall ratio). maxPossibleScore === 0 would
  //    produce NaN, so an absent/zero denominator means "not measured".
  const spanRatio =
    ospan && ospan.maxPossibleScore > 0 ? ospan.totalScore / ospan.maxPossibleScore : null;
  const spanScore = spanRatio !== null ? clampScore(spanRatio * 100) : null;

  // 3. Visuospatial capacity (Cowan's K): K = 4.2 -> 100
  const capacityScore =
    changeDetection !== null ? clampScore((changeDetection.meanCowanK / 4.2) * 100) : null;

  // 4. Processing speed (mean RT of completed timed tasks): 600ms -> 80, 1000ms -> 60
  const rts: number[] = [];
  if (nback && nback.meanReactionTimeMs > 0) rts.push(nback.meanReactionTimeMs);
  if (changeDetection && changeDetection.meanReactionTimeMs > 0) {
    rts.push(changeDetection.meanReactionTimeMs);
  }
  const speedScore =
    rts.length > 0
      ? clampScore(110 - (rts.reduce((a, b) => a + b, 0) / rts.length / 1000) * 50)
      : null;

  // 5. Inhibition control (N-back false alarms per session)
  const inhibitionScore = nback ? clampScore(95 - nback.falseAlarms * 8) : null;

  const dimensions: Dimension[] = [
    { key: 'updating', label: '动态刷新力', value: updatingScore, source: 'N-back d′' },
    { key: 'span', label: '复杂加工跨度', value: spanScore, source: 'OSPAN 序列回忆' },
    { key: 'capacity', label: '视空间容量', value: capacityScore, source: "Cowan's K" },
    { key: 'speed', label: '加工响应敏捷度', value: speedScore, source: '平均反应时' },
    { key: 'inhibition', label: '抗干扰抑制控制', value: inhibitionScore, source: 'N-back 虚报' },
  ];

  const measured = dimensions.filter(
    (dimension): dimension is Dimension & { value: number } => dimension.value !== null
  );
  const radarAxes = measured.map((dimension) => ({
    label: dimension.label,
    value: dimension.value,
  }));

  const hasAnyData = measured.length > 0;
  const isComplete = measured.length === dimensions.length;
  const compositeScore = hasAnyData
    ? clampScore(measured.reduce((acc, dim) => acc + dim.value, 0) / measured.length)
    : null;

  const completedCount =
    (nback ? 1 : 0) + (ospan ? 1 : 0) + (changeDetection ? 1 : 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Brain className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">个人工作记忆综合画像与测评总览</h2>
                {compositeScore !== null ? (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border ${
                      isComplete
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-700/40 text-slate-300 border-slate-600/60'
                    }`}
                    title={
                      isComplete
                        ? '五个维度均有实测数据'
                        : `仅 ${measured.length} / ${dimensions.length} 个维度有实测数据，该指数为部分维度均值`
                    }
                  >
                    综合指数 {compositeScore}
                    {!isComplete && <span className="ml-1 text-[10px]">（部分维度 {measured.length}/{dimensions.length}）</span>}
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    综合指数 暂无数据
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                已完成三大范式中的 {completedCount} / 3 项评测 · 仅由实测维度生成雷达模型
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profile.history.length > 0 && !confirmingClear && (
              <button
                id="btn-clear-wm-history"
                onClick={() => setConfirmingClear(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs font-medium border border-slate-700/60 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>清除记录</span>
              </button>
            )}

            {/* Clearing used to wipe every record with a single click and no way back. */}
            {confirmingClear && (
              <div
                role="group"
                aria-label="确认清除本地记录"
                className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-[11px] text-rose-200"
              >
                <span>确认清除全部 {profile.history.length} 条记录？</span>
                <button
                  id="btn-confirm-clear-history"
                  onClick={() => {
                    setConfirmingClear(false);
                    onClearHistory();
                  }}
                  className="px-2.5 py-1 rounded bg-rose-700 hover:bg-rose-600 text-white font-semibold transition cursor-pointer"
                >
                  确认清除
                </button>
                <button
                  id="btn-cancel-clear-history"
                  onClick={() => setConfirmingClear(false)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                >
                  取消
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Radar & Composite Score Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar Chart Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[360px]">
          <h3 className="text-sm font-semibold text-slate-200 self-start flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" aria-hidden="true" />
            <span>五维工作记忆认知雷达</span>
          </h3>

          {measured.length >= 3 ? (
            <div className="py-2">
              <RadarChart axes={radarAxes} size={280} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 space-y-2">
              <Brain className="w-10 h-10 text-slate-600" aria-hidden="true" />
              <p className="text-sm text-slate-300">
                {hasAnyData ? '已测量的维度不足 3 项' : '尚无测评记录'}
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                至少完成两项以上范式后才会绘制雷达图。当前已测量维度：
                {measured.length > 0 ? measured.map((d) => d.label).join('、') : '无'}
              </p>
            </div>
          )}

          <div className="w-full mt-3 space-y-1" aria-live="polite">
            {dimensions.map((dimension) => (
              <div key={dimension.key} className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {dimension.label}
                  <span className="text-slate-600 ml-1 font-mono">({dimension.source})</span>
                </span>
                {dimension.value !== null ? (
                  <span className="font-mono font-semibold text-slate-200">{dimension.value} 分</span>
                ) : (
                  <span className="font-mono text-slate-500">暂无数据</span>
                )}
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-3">
            由 N-back (更新/抑制)、OSPAN (双任务跨度)、视觉变化检测 (K值) 的实测结果联合拟合
          </p>
        </div>

        {/* Cognitive Index & Recommendations Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>神经认知评估与学术建议</span>
            </h3>

            {/* Qualitative summary */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs text-slate-300">
              {!hasAnyData ? (
                <>
                  <strong className="text-slate-200 font-bold block mb-1">尚无测评记录</strong>
                  <p className="leading-relaxed text-amber-200/90">
                    完成任意一项任务后即可生成画像。在没有任何实测数据时，平台不会用默认基准分代替你的成绩，因此此处不显示综合指数与能力等级判定。
                  </p>
                </>
              ) : (
                <>
                  {isComplete ? (
                    <>
                      {compositeScore !== null && compositeScore >= 85 ? (
                        <strong className="text-emerald-400 font-bold block mb-1">
                          🌟 卓越级认知水平 (Top 10% 顶尖容量)
                        </strong>
                      ) : compositeScore !== null && compositeScore >= 70 ? (
                        <strong className="text-sky-400 font-bold block mb-1">
                          ✨ 优秀/健康常模水平 (High Average)
                        </strong>
                      ) : (
                        <strong className="text-amber-400 font-bold block mb-1">
                          ⚡ 具备可塑性提升空间 (High Plasticity)
                        </strong>
                      )}
                    </>
                  ) : (
                    <strong className="text-slate-200 font-bold block mb-1">
                      初步画像（{measured.length} / {dimensions.length} 个维度）
                    </strong>
                  )}

                  {!isComplete && (
                    <p className="flex items-start gap-1.5 text-[11px] text-amber-200/90">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>
                        尚有 {dimensions.length - measured.length} 个维度没有实测数据（
                        {dimensions
                          .filter((d) => d.value === null)
                          .map((d) => d.label)
                          .join('、')}
                        ）。综合指数为已完成维度的平均值，暂不给出能力等级判定，以免以未测量的维度推断你的水平。
                      </span>
                    </p>
                  )}

                  <p className="leading-relaxed">
                    工作记忆并非固定不变的先天智力，而是受前额叶皮层突触强化驱动的高度动态系统。
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                    <p>
                      • <strong>动态刷新专项：</strong>每日坚持 10 分钟 2-back 或 3-back 空间训练，强力激活背外侧前额叶皮层 (DLPFC)。
                    </p>
                    <p>
                      • <strong>抗干扰与双任务：</strong>进行 OSPAN 练习以抵抗阅读/编码等深层心流下的瞬时干扰中断。
                    </p>
                    <p>
                      • <strong>视空间扩容：</strong>在变化检测中训练多客体整体感知与特征绑定（Chunking 组块策略）。
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick launch paradigm tiles */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-medium">快速进入指定专项范式：</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="btn-dash-jump-nback"
                onClick={() => onSelectTab('nback')}
                className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <span>N-back</span>
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </button>
              <button
                id="btn-dash-jump-ospan"
                onClick={() => onSelectTab('ospan')}
                className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <span>OSPAN</span>
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </button>
              <button
                id="btn-dash-jump-cd"
                onClick={() => onSelectTab('change_detection')}
                className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <span>视觉K值</span>
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Paradigm Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* N-back card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-400">N-back 动态刷新</span>
            <span className="text-[10px] text-slate-400 font-mono">Kirchner (1958)</span>
          </div>
          {nback ? (
            <div className="space-y-1">
              <div className="text-2xl font-bold font-mono text-white">
                d' = {nback.dPrime}
              </div>
              <div className="text-xs text-slate-400">
                正确率 {(nback.accuracy * 100).toFixed(0)}% · {nback.n}-back
                {nback.validity && !nback.validity.isValid && (
                  <span className="text-amber-300"> · 曾中断 {nback.validity.interruptions} 次</span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-3">暂无测试数据，点击进入开始首次测评</div>
          )}
          <button
            id="btn-card-goto-nback"
            onClick={() => onSelectTab('nback')}
            className="w-full py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition cursor-pointer"
          >
            {nback ? '再测一次' : '立即评测'}
          </button>
        </div>

        {/* OSPAN card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-400">OSPAN 运算跨度</span>
            <span className="text-[10px] text-slate-400 font-mono">Turner & Engle (1989)</span>
          </div>
          {ospan ? (
            <div className="space-y-1">
              <div className="text-2xl font-bold font-mono text-white">
                {ospan.absoluteScore}
                <span className="text-xs text-slate-400 font-normal ml-1">/ {ospan.maxPossibleScore} 分</span>
              </div>
              <div className="text-xs text-slate-400">
                算术正确率 {(ospan.mathAccuracy * 100).toFixed(0)}%
                {ospan.validity && !ospan.validity.isValid && (
                  <span className="text-amber-300"> · 曾中断 {ospan.validity.interruptions} 次</span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-3">暂无测试数据，点击进入开始双任务评测</div>
          )}
          <button
            id="btn-card-goto-ospan"
            onClick={() => onSelectTab('ospan')}
            className="w-full py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-medium border border-cyan-500/30 transition cursor-pointer"
          >
            {ospan ? '再测一次' : '立即评测'}
          </button>
        </div>

        {/* Change detection card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">视觉变化检测 (K值)</span>
            <span className="text-[10px] text-slate-400 font-mono">Cowan (2001)</span>
          </div>
          {changeDetection ? (
            <div className="space-y-1">
              <div className="text-2xl font-bold font-mono text-white">
                K = {changeDetection.meanCowanK.toFixed(2)}
              </div>
              <div className="text-xs text-slate-400">
                辨别率 {(changeDetection.overallAccuracy * 100).toFixed(0)}% · 常模 3.0~4.5
                {changeDetection.validity && !changeDetection.validity.isValid && (
                  <span className="text-amber-300"> · 曾中断 {changeDetection.validity.interruptions} 次</span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-3">暂无测试数据，点击测定视觉离散槽位上限</div>
          )}
          <button
            id="btn-card-goto-cd"
            onClick={() => onSelectTab('change_detection')}
            className="w-full py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-medium border border-amber-500/30 transition cursor-pointer"
          >
            {changeDetection ? '再测一次' : '立即评测'}
          </button>
        </div>
      </div>

      {/* History log */}
      {profile.history.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <span>历次训练与评测日志 (最近 {profile.history.length} 轮)</span>
            </h3>
          </div>

          <div className="divide-y divide-slate-800/60">
            {profile.history.map((record) => (
              <div key={record.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={`w-2 h-2 rounded-full ${
                      record.type === 'nback'
                        ? 'bg-indigo-400'
                        : record.type === 'ospan'
                        ? 'bg-cyan-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span className="font-semibold text-slate-200">{record.scoreDisplay}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="text-[11px]">{record.detail}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(record.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
