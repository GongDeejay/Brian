import React, { useRef } from 'react';
import { TaskId } from '../types';
import {
  Brain,
  Sliders,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
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

  const taskTabs: { id: TaskId | 'analytics'; label: string; tag: string; icon: string }[] = [
    { id: 'wcst', label: '威斯康星卡片 (WCST)', tag: '前额叶灵活性', icon: '🃏' },
    { id: 'wpt', label: '天气预测任务 (WPT)', tag: '基底节概率直觉', icon: '🌧️' },
    { id: 'ided', label: '注意定势转移 (ID/ED)', tag: '维度控制', icon: '⚡' },
    { id: 'gabor', label: 'Gabor双系统 (COVIS)', tag: '规则vs整合', icon: '🌀' },
    { id: 'prototype', label: '原型畸变 (Posner)', tag: '模式抽象', icon: '✨' },
    { id: 'analytics', label: '认知画像与报告', tag: '多维雷达', icon: '📊' },
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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm" aria-hidden="true">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">NeuroClassify</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                  v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                认知神经科学分类测验与模式识别评估平台
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            {/* Cognitive Load Modulator Trigger */}
            <button
              onClick={onToggleLoadPanel}
              aria-expanded={isLoadPanelOpen}
              aria-controls="cognitive-load-panel"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                isLoadPanelOpen
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : isCustomLoad
                  ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
              <span>认知负荷调节</span>
              {isCustomLoad && (
                <span
                  className="w-2 h-2 rounded-full bg-amber-500 animate-pulse motion-reduce:animate-none"
                  aria-hidden="true"
                />
              )}
              {isCustomLoad && <span className="sr-only">（已启用非基线负荷设置）</span>}
            </button>

            {/* Academic Literature Modal */}
            <button
              onClick={onOpenLiterature}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
              <span>文献与机制</span>
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
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
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
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
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
        <div
          role="tablist"
          aria-label="测验任务切换"
          className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none"
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
                className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span aria-hidden="true">{tab.icon}</span>
                <span>{tab.label}</span>
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
      </div>
    </header>
  );
};
