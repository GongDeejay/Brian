import React, { useEffect, useRef, useState } from 'react';
import { TaskId } from '../types';
import { useI18n, type MessageKey } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { AccountDialog } from './AccountDialog';
import {
  Brain,
  Sliders,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  Home,
  Languages,
  User,
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
  const { t, lang, toggleLang } = useI18n();
  const { user } = useAuth();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const taskTabs: {
    id: TaskId | 'analytics';
    labelKey: MessageKey;
    shortKey: MessageKey;
    tagKey: MessageKey;
    icon: string;
  }[] = [
    { id: 'wcst', labelKey: 'nav.wcst', shortKey: 'nav.wcst.short', tagKey: 'nav.tag.wcst', icon: '🃏' },
    { id: 'wpt', labelKey: 'nav.wpt', shortKey: 'nav.wpt.short', tagKey: 'nav.tag.wpt', icon: '🌧️' },
    { id: 'ided', labelKey: 'nav.ided', shortKey: 'nav.ided.short', tagKey: 'nav.tag.ided', icon: '⚡' },
    { id: 'gabor', labelKey: 'nav.gabor', shortKey: 'nav.gabor.short', tagKey: 'nav.tag.gabor', icon: '🌀' },
    {
      id: 'prototype',
      labelKey: 'nav.prototype',
      shortKey: 'nav.prototype.short',
      tagKey: 'nav.tag.prototype',
      icon: '✨',
    },
    {
      id: 'analytics',
      labelKey: 'nav.analytics',
      shortKey: 'nav.analytics.short',
      tagKey: 'nav.tag.analytics',
      icon: '📊',
    },
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
    const index = taskTabs.findIndex((tab) => tab.id === activeTask);
    if (index < 0) return;
    tabRefs.current[index]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTask]);

  /** Language toggle: shows the language the button will switch *to*. */
  const label = lang === 'zh' ? t('lang.en.name') : t('lang.zh.name');
  const languageLabel = t('action.languageTo', { lang: label });
  const languageShort = t(lang === 'zh' ? 'action.langShort.en' : 'action.langShort.zh');

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
                  {t('app.title')}
                </span>
                {/* Hidden on phones: the header row cannot fit it without squeezing. */}
                <span className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                  {t('app.version')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">{t('app.subtitle')}</p>
            </div>
          </div>

          {/* Action bar — icon-only on phones to avoid the labels wrapping vertically */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <a
              id="btn-back-home"
              href="../"
              className={`${ICON_BUTTON} bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200`}
              title={t('action.home')}
              aria-label={t('action.home')}
            >
              <Home className="w-4 h-4" aria-hidden="true" />
            </a>

            {/* Cognitive Load Modulator Trigger */}
            <button
              onClick={onToggleLoadPanel}
              aria-expanded={isLoadPanelOpen}
              aria-controls="cognitive-load-panel"
              title={t('load.title')}
              className={`${ICON_BUTTON} gap-1.5 px-0 sm:px-3 sm:w-auto text-xs font-semibold ${
                isLoadPanelOpen
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : isCustomLoad
                  ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{t('load.title')}</span>
              {isCustomLoad && (
                <span
                  className="hidden sm:inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse motion-reduce:animate-none"
                  aria-hidden="true"
                />
              )}
              <span className="sr-only">
                {t('load.title')}
                {isCustomLoad ? t('load.customBadge') : ''}
              </span>
            </button>

            {/* Academic Literature Modal */}
            <button
              onClick={onOpenLiterature}
              title={t('action.literature')}
              aria-label={t('action.literature')}
              className={`${ICON_BUTTON} hidden sm:flex bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
              <span className="sr-only">{t('action.literature')}</span>
            </button>

            {/* Celebration (confetti) opt-in — off by default */}
            <button
              onClick={onToggleCelebration}
              aria-pressed={isCelebrationEnabled}
              title={isCelebrationEnabled ? t('action.celebrationOn') : t('action.celebrationOff')}
              className={`${ICON_BUTTON} ${
                isCelebrationEnabled
                  ? 'text-amber-700 bg-amber-50 border-amber-300'
                  : 'text-slate-400 bg-slate-100 border-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">
                {t('action.celebrationState', {
                  state: isCelebrationEnabled ? t('action.on') : t('action.off'),
                })}
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
              title={isAudioEnabled ? t('action.audioOn') : t('action.audioOff')}
            >
              {isAudioEnabled ? (
                <Volume2 className="w-4 h-4" aria-hidden="true" />
              ) : (
                <VolumeX className="w-4 h-4" aria-hidden="true" />
              )}
              <span className="sr-only">
                {t('action.audioState', { state: isAudioEnabled ? t('action.on') : t('action.off') })}
              </span>
            </button>

            {/*
              Language toggle. Same 36px ICON_BUTTON box as its neighbours so the
              row stays on one line down to phone widths (`shrink-0`, no wrap).
              It always shows the abbreviation of the language it switches to
              (中 / EN); the icon is decorative backing on the icon-only buttons
              and is dropped here so the label always has room.
            */}
            <button
              type="button"
              onClick={toggleLang}
              lang={lang === 'zh' ? 'en' : 'zh-CN'}
              title={languageLabel}
              aria-label={languageLabel}
              data-testid="language-toggle"
              className={`${ICON_BUTTON} bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-bold text-[11px] leading-none tracking-tight`}
            >
              <Languages className="w-3 h-3 mr-0.5 sm:hidden" aria-hidden="true" />
              <span aria-hidden="true" className="whitespace-nowrap">
                {languageShort}
              </span>
              {/* Screen readers always get the full, unambiguous action text. */}
              <span className="sr-only">{languageLabel}</span>
            </button>

            {/* Account: sign in / register / data controls. Turns indigo with a
                status dot once signed in so the state is visible at a glance. */}
            <button
              type="button"
              onClick={() => setIsAccountOpen(true)}
              title={user ? t('account.menuTitle') : t('account.signIn')}
              aria-label={user ? t('account.menuTitle') : t('account.signIn')}
              data-testid="account-button"
              className={`relative ${ICON_BUTTON} ${
                user
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                  : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <User className="w-4 h-4" aria-hidden="true" />
              {user && (
                <span className="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Task Navigation Tabs */}
        <div className="relative">
          <div
            role="tablist"
            aria-label={t('nav.aria')}
            className="relative flex space-x-1 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
          >
            {taskTabs.map((tab, index) => {
              const isActive = activeTask === tab.id;
              const label = t(tab.labelKey);
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
                  title={label}
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
                  <span className="sm:hidden">{t(tab.shortKey)}</span>
                  <span className="hidden sm:inline">{label}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono hidden md:inline-block whitespace-nowrap ${
                      isActive ? 'bg-slate-800 text-indigo-300' : 'bg-slate-200/70 text-slate-500'
                    }`}
                  >
                    {tab.id === 'analytics'
                      ? t('nav.sessionsCount', { count: sessionCount })
                      : t(tab.tagKey)}
                  </span>
                  <span className="sr-only">
                    {t('nav.srLabel')}
                    {isActive ? t('nav.srComplete') : ''}
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

      {/* Rendered from the header so the account UI owns its own open/close state
          without threading props through App. */}
      <AccountDialog isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
    </header>
  );
};
