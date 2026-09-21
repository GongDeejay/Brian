import { useEffect, useRef, useState } from 'react';
import { Brain, Volume2, VolumeX, BookOpen, BarChart3, Layers, Calculator, Eye, Home, User } from 'lucide-react';
import { TaskType } from '../types/wm';
import { LANGUAGES, useI18n } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { AccountDialog } from './AccountDialog';

interface HeaderProps {
  activeTab: TaskType;
  onSelectTab: (tab: TaskType) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenTheory: () => void;
}

/** Shared styling for the small square header action buttons. */
const ICON_BUTTON =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800 text-slate-300 transition hover:text-white hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400';

export const Header = ({ activeTab, onSelectTab, isMuted, onToggleMute, onOpenTheory }: HeaderProps) => {
  const { lang, toggleLang, t } = useI18n();
  const { user } = useAuth();
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  /**
   * The language control always advertises the language it switches *to*: it
   * reads "EN" while the UI is Chinese and "中" while the UI is English, so the
   * face of the button and its `action.languageTo` tooltip agree. `LANGUAGES`
   * labels are endonyms ("中文" / "English") and therefore read correctly in
   * both catalogues.
   */
  const nextLanguage = LANGUAGES.find((item) => item.id !== lang) ?? LANGUAGES[0];

  const tabs = [
    {
      id: 'nback' as TaskType,
      label: t('nav.nback'),
      short: t('nav.nback.short'),
      sub: 'Kirchner (1958)',
      icon: Layers,
      color: 'text-indigo-400',
      activeBg: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300',
    },
    {
      id: 'ospan' as TaskType,
      label: t('nav.ospan'),
      short: t('nav.ospan.short'),
      sub: 'Turner & Engle (1989)',
      icon: Calculator,
      color: 'text-cyan-400',
      activeBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
    },
    {
      id: 'change_detection' as TaskType,
      label: t('nav.changeDetection'),
      short: t('nav.changeDetection.short'),
      sub: 'Cowan (2001)',
      icon: Eye,
      color: 'text-amber-400',
      activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
    },
    {
      id: 'dashboard' as TaskType,
      label: t('nav.dashboard'),
      short: t('nav.dashboard.short'),
      sub: t('nav.dashboard.sub'),
      icon: BarChart3,
      color: 'text-emerald-400',
      activeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
    },
  ];

  // Keep the selected tab visible in the horizontally scrolling rail on narrow
  // screens. `block: 'nearest'` stops this from also scrolling the page.
  const activeTabRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [activeTab]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Brand */}
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                <Brain className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
                    {/* Short title on phones: the full name wraps and collides with the actions. */}
                    <span className="sm:hidden">{t('app.title')}</span>
                    <span className="hidden sm:inline">{t('app.titleFull')}</span>
                  </h1>
                  <span className="hidden shrink-0 rounded-full border border-indigo-500/30 bg-indigo-950/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-300 lg:inline-flex">
                    {t('app.badge')}
                  </span>
                </div>
                <p className="hidden truncate text-xs text-slate-400 sm:block">
                  {t('app.tagline')}
                </p>
              </div>
            </div>

            {/* Actions — icon-only on phones, labelled from md up */}
            <div className="flex shrink-0 items-center gap-1.5">
              <a
                id="btn-back-home"
                href="../"
                className={ICON_BUTTON}
                title={t('action.home')}
                aria-label={t('action.home')}
              >
                <Home className="h-4 w-4 text-slate-300" aria-hidden="true" />
              </a>
              {/* Language switch: same 36px square as the other icon actions so
                  the phone row keeps four controls without wrapping. */}
              <button
                id="btn-language-toggle"
                type="button"
                onClick={toggleLang}
                className={ICON_BUTTON}
                title={t('action.languageTo', { lang: nextLanguage.label })}
                aria-label={t('action.languageTo', { lang: nextLanguage.label })}
              >
                <span
                  lang={nextLanguage.id === 'zh' ? 'zh-CN' : 'en'}
                  className="text-[11px] font-bold leading-none tracking-tight"
                >
                  {nextLanguage.short}
                </span>
              </button>
              <button
                id="btn-open-theory-mobile"
                onClick={onOpenTheory}
                className={`${ICON_BUTTON} md:hidden`}
                title={t('action.theory')}
                aria-label={t('action.theory')}
              >
                <BookOpen className="h-4 w-4 text-indigo-400" aria-hidden="true" />
              </button>
              <button
                id="btn-sound-toggle"
                onClick={onToggleMute}
                className={ICON_BUTTON}
                title={isMuted ? t('action.unmute') : t('action.mute')}
                aria-label={isMuted ? t('action.unmute') : t('action.mute')}
                aria-pressed={isMuted}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-rose-400" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                )}
              </button>

              {/* Account: opens sign-in / register / data controls. The icon
                  turns indigo once signed in so the state is visible at a glance. */}
              <button
                id="btn-account"
                type="button"
                onClick={() => setIsAccountOpen(true)}
                className={`relative ${ICON_BUTTON} ${user ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300' : ''}`}
                title={user ? t('account.menuTitle') : t('account.signIn')}
                aria-label={user ? t('account.menuTitle') : t('account.signIn')}
              >
                <User className="h-4 w-4" aria-hidden="true" />
                {user && (
                  <span
                    className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400"
                    aria-hidden="true"
                  />
                )}
              </button>

              {/* Labelled actions, wider screens only */}
              <button
                id="btn-open-theory-desktop"
                onClick={onOpenTheory}
                className="hidden items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white md:flex"
              >
                <BookOpen className="h-4 w-4 text-indigo-400" aria-hidden="true" />
                <span>{t('action.theoryFull')}</span>
              </button>
              <span className="hidden text-xs text-slate-500 md:inline">
                {isMuted ? t('action.soundOff') : t('action.soundOn')}
              </span>
            </div>
          </div>
        </div>

        {/* Paradigm navigation rail */}
        <div className="relative mt-3 border-t border-slate-800/80 pt-2">
          <div
            role="tablist"
            aria-label={t('nav.aria')}
            className="no-scrollbar relative flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={isActive ? activeTabRef : undefined}
                  id={`tab-nav-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={t('nav.tabAria', { label: tab.label, sub: tab.sub })}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex shrink-0 snap-start cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all whitespace-nowrap sm:gap-2.5 sm:px-3.5 ${
                    isActive
                      ? `${tab.activeBg} font-semibold shadow-inner`
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700 hover:bg-slate-800/70 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? tab.color : 'text-slate-400'}`} aria-hidden="true" />
                  <span className="text-left">
                    {/* Short label on phones so all four paradigms stay reachable without hunting. */}
                    <span className={`block sm:hidden ${isActive ? 'text-white' : ''}`}>{tab.short}</span>
                    <span className={`hidden sm:block ${isActive ? 'text-white' : ''}`}>{tab.label}</span>
                    <span className="hidden text-[10px] font-normal text-slate-400 sm:block">{tab.sub}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {/* Scroll affordance: hints that the rail continues to the right on phones. */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-900 to-transparent sm:hidden"
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
