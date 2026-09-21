import { useState } from 'react';
import { Brain, BarChart3, Clock, Sparkles, Trash2, ArrowRight, AlertTriangle } from 'lucide-react';
import { CognitiveProfile, TaskType } from '../types/wm';
import { RadarChart } from './RadarChart';
import { useI18n } from '../i18n';

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
  const { t, tList, lang } = useI18n();
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
    { key: 'updating', label: t('dash.dim.updating'), value: updatingScore, source: t('dash.source.nbackDPrime') },
    { key: 'span', label: t('dash.dim.span'), value: spanScore, source: t('dash.source.ospanRecall') },
    { key: 'capacity', label: t('dash.dim.capacity'), value: capacityScore, source: t('dash.source.cowanK') },
    { key: 'speed', label: t('dash.dim.speed'), value: speedScore, source: t('dash.source.meanRt') },
    { key: 'inhibition', label: t('dash.dim.inhibition'), value: inhibitionScore, source: t('dash.source.nbackFalseAlarms') },
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

  const listSeparator = t('dash.listSeparator');
  const measuredNames = measured.map((d) => d.label).join(listSeparator);
  const missingNames = dimensions
    .filter((d) => d.value === null)
    .map((d) => d.label)
    .join(listSeparator);

  // Array copy is stored as separate keys and resolved with tList (see README).
  const tipLabels = tList(['dash.tipUpdatingLabel', 'dash.tipInhibitionLabel', 'dash.tipCapacityLabel']);
  const tips = tList(['dash.tipUpdating', 'dash.tipInhibition', 'dash.tipCapacity']);

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
                <h2 className="text-xl font-bold text-white tracking-tight">{t('dash.title')}</h2>
                {compositeScore !== null ? (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border ${
                      isComplete
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-700/40 text-slate-300 border-slate-600/60'
                    }`}
                    title={
                      isComplete
                        ? t('dash.compositeFullTitle')
                        : t('dash.compositePartialTitle', {
                            measured: measured.length,
                            total: dimensions.length,
                          })
                    }
                  >
                    {t('dash.compositeLabel')} {compositeScore}
                    {!isComplete && (
                      <span className="ml-1 text-[10px]">
                        {t('dash.compositePartialShort', {
                          measured: measured.length,
                          total: dimensions.length,
                        })}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {t('dash.compositeLabel')} {t('dash.noData')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {t('dash.progress', { count: completedCount })}
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
                <span>{t('dash.clearRecords')}</span>
              </button>
            )}

            {/* Clearing used to wipe every record with a single click and no way back. */}
            {confirmingClear && (
              <div
                role="group"
                aria-label={t('dash.clearConfirmAria')}
                className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-[11px] text-rose-200"
              >
                <span>{t('dash.clearConfirmPrompt', { count: profile.history.length })}</span>
                <button
                  id="btn-confirm-clear-history"
                  onClick={() => {
                    setConfirmingClear(false);
                    onClearHistory();
                  }}
                  className="px-2.5 py-1 rounded bg-rose-700 hover:bg-rose-600 text-white font-semibold transition cursor-pointer"
                >
                  {t('dash.clearConfirm')}
                </button>
                <button
                  id="btn-cancel-clear-history"
                  onClick={() => setConfirmingClear(false)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                >
                  {t('common.cancel')}
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
            <span>{t('dash.radarCardTitle')}</span>
          </h3>

          {measured.length >= 3 ? (
            <div className="py-2">
              <RadarChart axes={radarAxes} size={280} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 space-y-2">
              <Brain className="w-10 h-10 text-slate-600" aria-hidden="true" />
              <p className="text-sm text-slate-300">
                {hasAnyData ? t('dash.radarNotEnough') : t('dash.noRecords')}
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                {t('dash.radarHint')}
                {measured.length > 0 ? measuredNames : t('dash.none')}
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
                  <span className="font-mono font-semibold text-slate-200">
                    {t('dash.points', { value: dimension.value })}
                  </span>
                ) : (
                  <span className="font-mono text-slate-500">{t('dash.noData')}</span>
                )}
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-3">
            {t('dash.radarFitted')}
          </p>
        </div>

        {/* Cognitive Index & Recommendations Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>{t('dash.adviceTitle')}</span>
            </h3>

            {/* Qualitative summary */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs text-slate-300">
              {!hasAnyData ? (
                <>
                  <strong className="text-slate-200 font-bold block mb-1">{t('dash.noRecords')}</strong>
                  <p className="leading-relaxed text-amber-200/90">
                    {t('dash.noDataExplanation')}
                  </p>
                </>
              ) : (
                <>
                  {isComplete ? (
                    <>
                      {compositeScore !== null && compositeScore >= 85 ? (
                        <strong className="text-emerald-400 font-bold block mb-1">
                          {t('dash.levelExceptional')}
                        </strong>
                      ) : compositeScore !== null && compositeScore >= 70 ? (
                        <strong className="text-sky-400 font-bold block mb-1">
                          {t('dash.levelHighAverage')}
                        </strong>
                      ) : (
                        <strong className="text-amber-400 font-bold block mb-1">
                          {t('dash.levelPlastic')}
                        </strong>
                      )}
                    </>
                  ) : (
                    <strong className="text-slate-200 font-bold block mb-1">
                      {t('dash.preliminary', { measured: measured.length, total: dimensions.length })}
                    </strong>
                  )}

                  {!isComplete && (
                    <p className="flex items-start gap-1.5 text-[11px] text-amber-200/90">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>
                        {t('dash.missingWarning', {
                          missing: dimensions.length - measured.length,
                          names: missingNames,
                        })}
                      </span>
                    </p>
                  )}

                  <p className="leading-relaxed">{t('dash.dynamicNature')}</p>

                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                    {tips.map((tip, index) => (
                      <p key={tip}>
                        • <strong>{tipLabels[index]}</strong>
                        {tip}
                      </p>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick launch paradigm tiles */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-medium">{t('dash.jumpTitle')}</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="btn-dash-jump-nback"
                onClick={() => onSelectTab('nback')}
                className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <span>{t('nav.nback.short')}</span>
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </button>
              <button
                id="btn-dash-jump-ospan"
                onClick={() => onSelectTab('ospan')}
                className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <span>{t('nav.ospan.short')}</span>
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </button>
              <button
                id="btn-dash-jump-cd"
                onClick={() => onSelectTab('change_detection')}
                className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <span>{t('dash.jumpChangeDetection')}</span>
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
            <span className="text-xs font-semibold text-indigo-400">{t('nav.nback')}</span>
            <span className="text-[10px] text-slate-400 font-mono">Kirchner (1958)</span>
          </div>
          {nback ? (
            <div className="space-y-1">
              <div className="text-2xl font-bold font-mono text-white">
                d' = {nback.dPrime}
              </div>
              <div className="text-xs text-slate-400">
                {t('dash.nbackStat', {
                  accuracy: (nback.accuracy * 100).toFixed(0),
                  n: nback.n,
                })}
                {nback.validity && !nback.validity.isValid && (
                  <span className="text-amber-300">
                    {t('dash.interrupted', { count: nback.validity.interruptions })}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-3">{t('dash.nbackEmpty')}</div>
          )}
          <button
            id="btn-card-goto-nback"
            onClick={() => onSelectTab('nback')}
            className="w-full py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition cursor-pointer"
          >
            {nback ? t('dash.retest') : t('dash.startNow')}
          </button>
        </div>

        {/* OSPAN card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-400">{t('nav.ospan')}</span>
            <span className="text-[10px] text-slate-400 font-mono">Turner & Engle (1989)</span>
          </div>
          {ospan ? (
            <div className="space-y-1">
              <div className="text-2xl font-bold font-mono text-white">
                {ospan.absoluteScore}
                <span className="text-xs text-slate-400 font-normal ml-1">
                  {t('dash.ospanScoreOf', { max: ospan.maxPossibleScore })}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {t('dash.ospanStat', { accuracy: (ospan.mathAccuracy * 100).toFixed(0) })}
                {ospan.validity && !ospan.validity.isValid && (
                  <span className="text-amber-300">
                    {t('dash.interrupted', { count: ospan.validity.interruptions })}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-3">{t('dash.ospanEmpty')}</div>
          )}
          <button
            id="btn-card-goto-ospan"
            onClick={() => onSelectTab('ospan')}
            className="w-full py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-medium border border-cyan-500/30 transition cursor-pointer"
          >
            {ospan ? t('dash.retest') : t('dash.startNow')}
          </button>
        </div>

        {/* Change detection card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">{t('nav.changeDetection')}</span>
            <span className="text-[10px] text-slate-400 font-mono">Cowan (2001)</span>
          </div>
          {changeDetection ? (
            <div className="space-y-1">
              <div className="text-2xl font-bold font-mono text-white">
                K = {changeDetection.meanCowanK.toFixed(2)}
              </div>
              <div className="text-xs text-slate-400">
                {t('dash.cdStat', { accuracy: (changeDetection.overallAccuracy * 100).toFixed(0) })}
                {changeDetection.validity && !changeDetection.validity.isValid && (
                  <span className="text-amber-300">
                    {t('dash.interrupted', { count: changeDetection.validity.interruptions })}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-3">{t('dash.cdEmpty')}</div>
          )}
          <button
            id="btn-card-goto-cd"
            onClick={() => onSelectTab('change_detection')}
            className="w-full py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-medium border border-amber-500/30 transition cursor-pointer"
          >
            {changeDetection ? t('dash.retest') : t('dash.startNow')}
          </button>
        </div>
      </div>

      {/* History log */}
      {profile.history.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <span>{t('dash.historyTitle', { count: profile.history.length })}</span>
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
                  {/* scoreDisplay / detail are generated (and localized) by the
                      storage layer when the record is written. */}
                  <span className="font-semibold text-slate-200">{record.scoreDisplay}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="text-[11px]">{record.detail}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(record.timestamp).toLocaleTimeString(
                      lang === 'zh' ? 'zh-CN' : 'en-US',
                      { hour: '2-digit', minute: '2-digit' }
                    )}
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
