import React from 'react';
import { 
  Brain, 
  Search, 
  FolderTree, 
  Zap, 
  Flame, 
  X, 
  Filter,
  Globe,
  Scale,
  Home
} from 'lucide-react';
import { CATEGORY_CONFIG } from '../data/neuroplasticityData';
import { CATEGORY_CONFIG_EN } from '../data/neuroplasticityDataEn';
import { Language, TRANSLATIONS } from '../data/translations';

export type ActiveTab = 'mindmap' | 'simulator' | 'protocols';

interface HeaderNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  onOpenQuickIntro: () => void;
  onOpenDisclaimer: () => void;
  lang: Language;
  onToggleLanguage: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  onOpenQuickIntro,
  onOpenDisclaimer,
  lang,
  onToggleLanguage,
}) => {
  const t = TRANSLATIONS[lang];
  const categories = lang === 'en' ? CATEGORY_CONFIG_EN : CATEGORY_CONFIG;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-3">
        {/* Main Brand & Tab Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {t.appTitle}
                </h1>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
                  {t.appBadge}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Right controls: Nav Tabs + Actions (Language Toggle & Disclaimer) */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Nav Tabs */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm font-medium">
              <button
                id="tab-mindmap"
                onClick={() => onTabChange('mindmap')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'mindmap'
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-300 shadow-xs font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <FolderTree className="w-4 h-4" />
                <span>{t.tabMindmap}</span>
              </button>

              <button
                id="tab-simulator"
                onClick={() => onTabChange('simulator')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'simulator'
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-300 shadow-xs font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>{t.tabSimulator}</span>
              </button>

              <button
                id="tab-protocols"
                onClick={() => onTabChange('protocols')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'protocols'
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-300 shadow-xs font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Flame className="w-4 h-4 text-cyan-500" />
                <span>{t.tabProtocols}</span>
              </button>
            </div>

            {/* Back to Brian portal */}
            <a
              id="btn-back-home"
              href="../"
              className="px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors"
              title={lang === 'zh' ? '返回 Brian 平台首页' : 'Return to Brian Portal'}
              aria-label={lang === 'zh' ? '返回 Brian 平台首页' : 'Return to Brian Portal'}
            >
              <Home className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">{lang === 'zh' ? '平台首页' : 'Brian Home'}</span>
            </a>

            {/* Language Toggle Button */}
            <button
              id="btn-language-toggle"
              onClick={onToggleLanguage}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title={lang === 'zh' ? 'Switch to English' : '切换为中文'}
            >
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span className={lang === 'zh' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}>中</span>
              <span className="text-zinc-300 dark:text-zinc-600">/</span>
              <span className={lang === 'en' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}>EN</span>
            </button>

            {/* Disclaimer Button */}
            <button
              id="btn-open-disclaimer-header"
              onClick={onOpenDisclaimer}
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-900/60 text-xs font-medium text-amber-800 dark:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title={t.btnDisclaimer}
            >
              <Scale className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">{t.btnDisclaimer}</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Row (Only on Mindmap tab) */}
        {activeTab === 'mindmap' && (
          <div className="pt-1 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800/60">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                id="input-search-mindmap"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="relative flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
              <span className="text-zinc-400 flex items-center gap-1 shrink-0 text-[11px]">
                <Filter className="w-3 h-3" /> {t.filterLabel}
              </span>
              <button
                onClick={() => onCategoryChange('all')}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {t.filterAll}
              </button>

              {Object.entries(categories).map(([key, cfg]) => {
                const isSelected = activeCategory === key;
                return (
                  <button
                    key={key}
                    onClick={() => onCategoryChange(key)}
                    className={`px-2.5 py-1 rounded-lg shrink-0 font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'font-bold'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                    style={{
                      borderColor: isSelected ? cfg.accent : 'transparent',
                      color: isSelected ? cfg.accent : undefined,
                      backgroundColor: isSelected ? `${cfg.accent}20` : undefined,
                    }}
                  >
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
