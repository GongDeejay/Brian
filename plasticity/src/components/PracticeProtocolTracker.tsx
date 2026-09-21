import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Clock, 
  Dna, 
  Plus, 
  RotateCcw,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PracticeProtocol, MindMapNode } from '../types';
import { PRESET_PRACTICE_PROTOCOLS } from '../data/neuroplasticityData';
import { PRESET_PRACTICE_PROTOCOLS_EN } from '../data/neuroplasticityDataEn';
import { Language, TRANSLATIONS } from '../data/translations';

interface PracticeProtocolTrackerProps {
  customActions?: MindMapNode[];
  onOpenNodeDetail?: (nodeId: string) => void;
  lang?: Language;
}

export const PracticeProtocolTracker: React.FC<PracticeProtocolTrackerProps> = ({
  customActions = [],
  onOpenNodeDetail,
  lang = 'zh',
}) => {
  const t = TRANSLATIONS[lang];

  // Completed status tracking by ID
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('neuro_completed_protocol_ids');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  const baseProtocols = lang === 'en' ? PRESET_PRACTICE_PROTOCOLS_EN : PRESET_PRACTICE_PROTOCOLS;

  const [expandedProtocolId, setExpandedProtocolId] = useState<string | null>(
    baseProtocols[0].id
  );

  const [customDrills, setCustomDrills] = useState<string[]>(() => {
    const saved = localStorage.getItem('neuro_custom_drills');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return lang === 'en' 
      ? [
          'Brush teeth with non-dominant hand and write 3 words (stimulates contralateral cortex & rewiring)',
          'Gaze fixate on a single visual dot for 60 seconds before deep work (mobilizes basal forebrain acetylcholine)'
        ]
      : [
          '用非惯用手刷牙并写下3个字（激活对侧皮层与突触重组）',
          '工作前凝视白墙单一黑点60秒（募集前脑乙酰胆碱，开启专注）'
        ];
  });

  const [newDrillInput, setNewDrillInput] = useState('');

  // Completed count
  const completedCount = baseProtocols.filter(p => !!completedIds[p.id]).length;
  const progressPercent = Math.round((completedCount / baseProtocols.length) * 100);

  const toggleProtocolComplete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const willBeCompleted = !completedIds[id];
    const nextCompleted = {
      ...completedIds,
      [id]: willBeCompleted
    };

    setCompletedIds(nextCompleted);
    localStorage.setItem('neuro_completed_protocol_ids', JSON.stringify(nextCompleted));

    if (willBeCompleted) {
      // Trigger celebratory confetti for brain rewiring achievement!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#06b6d4']
      });
    }
  };

  const handleResetDaily = () => {
    setCompletedIds({});
    localStorage.setItem('neuro_completed_protocol_ids', JSON.stringify({}));
  };

  const handleAddCustomDrill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrillInput.trim()) return;
    const next = [...customDrills, newDrillInput.trim()];
    setCustomDrills(next);
    localStorage.setItem('neuro_custom_drills', JSON.stringify(next));
    setNewDrillInput('');
  };

  const handleRemoveCustomDrill = (idx: number) => {
    const next = customDrills.filter((_, i) => i !== idx);
    setCustomDrills(next);
    localStorage.setItem('neuro_custom_drills', JSON.stringify(next));
  };

  return (
    <div id="practice-protocol-tracker" className="space-y-6">
      {/* Header & Daily Progress Card */}
      <div className="bg-gradient-to-r from-indigo-900/90 via-zinc-900 to-indigo-950 p-6 rounded-2xl border border-indigo-800/60 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-semibold">
              {t.protoBadge}
            </span>
            <span className="text-xs text-indigo-300">
              {t.protoProgressToday}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-1.5 flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-400" />
            {t.protoTitle}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-2xl leading-relaxed">
            {t.protoSubtitle}
          </p>
        </div>

        {/* Progress Gauge */}
        <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-700/80 min-w-[200px] flex flex-col items-center">
          <div className="text-xs text-zinc-400 mb-1">{t.protoProgressToday}</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-indigo-300 font-mono">
              {completedCount}
            </span>
            <span className="text-sm text-zinc-500">/ {baseProtocols.length} {t.protoItemsCount}</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-zinc-800 rounded-full h-2 mt-2 overflow-hidden border border-zinc-700">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <button
            id="btn-reset-protocols"
            onClick={handleResetDaily}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 mt-2 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> {t.protoReset}
          </button>
        </div>
      </div>

      {/* Protocols Accordion List */}
      <div className="grid grid-cols-1 gap-4">
        {baseProtocols.map((protocol) => {
          const isExpanded = expandedProtocolId === protocol.id;
          const isDone = !!completedIds[protocol.id];

          return (
            <div
              key={protocol.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-800/60 dark:bg-emerald-950/30'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs'
              }`}
            >
              {/* Protocol Header Bar */}
              <div
                onClick={() => setExpandedProtocolId(isExpanded ? null : protocol.id)}
                className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-850/50 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <button
                    onClick={(e) => toggleProtocolComplete(protocol.id, e)}
                    className="cursor-pointer shrink-0 text-zinc-400 hover:text-emerald-500 transition-colors"
                    title={isDone ? t.protoMarkDone : t.protoMarkDone}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
                    )}
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {protocol.category}
                      </span>
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {protocol.timeEstimate}
                      </span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {t.protoDifficulty}: {protocol.difficulty}
                      </span>
                    </div>

                    <h3 className={`text-base font-bold mt-1 ${
                      isDone
                        ? 'line-through text-zinc-500 dark:text-zinc-400'
                        : 'text-zinc-900 dark:text-zinc-100'
                    }`}>
                      {protocol.title}
                    </h3>
                  </div>
                </div>

                <button
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  aria-label="Expand or collapse protocol details"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Protocol Expanded Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-zinc-100 dark:border-zinc-800/80 space-y-4">
                  {/* Neuroscientific Rationale */}
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wide">
                      <Dna className="w-3.5 h-3.5" />
                      {t.protoRationaleTitle}
                    </div>
                    {protocol.neuroscientificRationale}
                  </div>

                  {/* Execution Steps */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {t.protoStepsTitle}
                    </div>
                    {protocol.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="leading-relaxed flex-1">
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Key Molecules involved */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-zinc-500">{t.protoKeyMolecules}:</span>
                    {protocol.keyMolecules.map((mol, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono"
                      >
                        {mol}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Custom Micro-Drills Section */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-500" />
              {t.protoCustomDrillsTitle}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {t.protoCustomDrillsSubtitle}
            </p>
          </div>
        </div>

        {/* List of custom drills */}
        <div className="space-y-2">
          {customDrills.map((drill, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>{drill}</span>
              </div>
              <button
                onClick={() => handleRemoveCustomDrill(idx)}
                className="text-xs text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                {t.protoDeleteDrill}
              </button>
            </div>
          ))}
        </div>

        {/* Add drill form */}
        <form onSubmit={handleAddCustomDrill} className="flex gap-2">
          <input
            id="input-new-micro-drill"
            type="text"
            value={newDrillInput}
            onChange={(e) => setNewDrillInput(e.target.value)}
            placeholder={t.protoDrillPlaceholder}
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            id="btn-add-micro-drill"
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> {t.btnAddDrill}
          </button>
        </form>
      </div>
    </div>
  );
};
