import React, { useEffect, useRef } from 'react';
import { TaskId } from '../types';
import {
  Brain,
  Sliders,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  Home,
} from 'lucide-react';

interface Props {
  activeTask: TaskId | 'analytics';
  onSelectTask: (task: TaskId | 'analytics') => void;
  onToggleLoadPanel: () => void;
  isLoadPanelOpen: boolean;
  onOpenLiterature: () => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  isCustomLoad: boolean;
  isCelebrationEnabled: boolean;
  onToggleCelebration: () => void;
  sessionCount: number;
}

/** Shared styling for the small square header action buttons. */
const ICON_BUTTON =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500';

export const Header: React.FC<Props> = ({
  activeTask,
  onSelectTask,
  onToggleLoadPanel,
  isLoadPanelOpen,
  onOpenLiterature,
  isAudioEnabled,
  onToggleAudio,
  isCustomLoad,
  isCelebrationEnabled,
  onToggleCelebration,
  sessionCount,
}) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const taskTabs: { id: TaskId | 'analytics'; label: string; short: string; tag: string; icon: string }[] = [
    { id: 'wcst', label: '威斯康星卡片 (WCST)', short: 'WCST', tag: '前额叶灵活性', icon: '🃏' },
    { id: 'wpt', label: '天气预测任务 (WPT)', short: 'WPT', tag: '基底节概率直觉', icon: '🌧️' },
    { id: 'ided', label: '注意定势转移 (ID/ED)', short: 'ID/ED', tag: '维度控制', icon: '⚡' },
    { id: 'gabor', label: 'Gabor双系统 (COVIS)', short: 'Gabor', tag: '规则vs整合', icon: '🌀' },
    { id: 'prototype', label: '原型畸变 (Posner)', short: '原型畸变', tag: '模式抽象', icon: '✨' },
    { id: 'analytics', label: '认知画像与报告', short: '报告', tag: '多维雷达', icon: '📊' },
  ];

  /** Standard tablist keyboard interaction: ←/→/Home/End move between tabs. */
  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % taskTabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + taskTabs.length) % taskTabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = taskTabs.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    tabRefs.current[nextIndex]?.focus();
    onSelectTask(taskTabs[nextIndex].id);
  };

  // Keep the selected tab visible in the horizontally scrolling rail on narrow
  // screens. `block: 'nearest'` stops this from also scrolling the page.
  useEffect(() => {
    const index = taskTabs.findIndex((t) => t.id === activeTask);
    if (index < 0) return;
    tabRefs.current[index]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTask]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between gap-2 h-16">
          {/* Brand */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm"
              aria-hidden="true"
            >
              <Brain className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight truncate">
                  NeuroClassify
                </span>
                {/* Hidden on phones: the header row cannot fit it without squeezing. */}
                <span className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                  v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                认知神经科学分类测验与模式识别评估平台
              </p>
            </div>
          </div>

          {/* Action bar — icon-only on phones to avoid the labels wrapping vertically */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <a
              id="btn-back-home"
              href="../"
              className={`${ICON_BUTTON} bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200`}
              title="返回首页"
              aria-label="返回首页"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
            </a>

            {/* Cognitive Load Modulator Trigger */}
            <button
              onClick={onToggleLoadPanel}
              aria-expanded={isLoadPanelOpen}
              aria-controls="cognitive-load-panel"
              title="认知负荷调节"
              className={`${ICON_BUTTON} gap-1.5 px-0 sm:px-3 sm:w-auto text-xs font-semibold ${
                isLoadPanelOpen
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : isCustomLoad
                  ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">认知负荷调节</span>
              {isCustomLoad && (
                <span
                  className="hidden sm:inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse motion-reduce:animate-none"
                  aria-hidden="true"
                />
              )}
              <span className="sr-only">
                认知负荷调节{isCustomLoad ? '（已启用非基线负荷设置）' : ''}
              </span>
            </button>

            {/* Academic Literature Modal */}
            <button
              onClick={onOpenLiterature}
              title="文献与机制"
              className={`${ICON_BUTTON} hidden sm:flex bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
              <span className="sr-only">文献与机制</span>
            </button>

            {/* Celebration (confetti) opt-in — off by default */}
            <button
              onClick={onToggleCelebration}
              aria-pressed={isCelebrationEnabled}
              title={
                isCelebrationEnabled
                  ? '关闭庆祝特效（在科研情境下建议保持关闭）'
                  : '开启庆祝特效（默认关闭：可能引入情绪唤醒混淆）'
              }
              className={`${ICON_BUTTON} ${
                isCelebrationEnabled
                  ? 'text-amber-700 bg-amber-50 border-amber-300'
                  : 'text-slate-400 bg-slate-100 border-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">
                庆祝特效（彩带纸屑）{isCelebrationEnabled ? '已开启' : '已关闭'}
              </span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={onToggleAudio}
              aria-pressed={isAudioEnabled}
              className={`${ICON_BUTTON} ${
                isAudioEnabled
                  ? 'text-slate-600 hover:text-slate-900 bg-slate-50 border-slate-200'
                  : 'text-slate-400 bg-slate-100 border-slate-200'
              }`}
              title={isAudioEnabled ? '关闭实验反馈音效' : '开启实验反馈音效'}
            >
              {isAudioEnabled ? (
                <Volume2 className="w-4 h-4" aria-hidden="true" />
              ) : (
                <VolumeX className="w-4 h-4" aria-hidden="true" />
              )}
              <span className="sr-only">
                实验反馈音效{isAudioEnabled ? '已开启' : '已关闭'}
              </span>
            </button>
          </div>
        </div>

        {/* Task Navigation Tabs */}
        <div className="relative">
          <div
            role="tablist"
            aria-label="测验任务切换"
            className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
          >
            {taskTabs.map((tab, index) => {
              const isActive = activeTask === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  role="tab"
                  id={`task-tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`task-panel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => onSelectTask(tab.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={`flex shrink-0 snap-start items-center gap-2 px-3 py-2 text-xs rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  {/* Short label on phones so more paradigms fit before scrolling. */}
                  <span className="sm:hidden">{tab.short}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono hidden md:inline-block ${
                      isActive ? 'bg-slate-800 text-indigo-300' : 'bg-slate-200/70 text-slate-500'
                    }`}
                  >
                    {tab.id === 'analytics' ? `已记录 ${sessionCount} 条` : tab.tag}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Scroll affordance for the phone-width rail */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent sm:hidden"
            aria-hidden="true"
          />
        </div>
      </div>
    </header>
  );
};
