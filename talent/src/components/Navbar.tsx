import { Compass, Sparkles, FileText, Activity, Users, BookOpen, RotateCcw, Languages, Home } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { TRANSLATIONS } from "../utils/translations";

export type NavTab = "quiz" | "qualitative" | "report" | "energy" | "mirror" | "theories";

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  hasCompletedQuiz: boolean;
  onReset: () => void;
}

export function Navbar({
  currentTab,
  onTabChange,
  hasCompletedQuiz,
  onReset,
}: NavbarProps) {
  const { lang, toggleLang, isEn } = useLanguage();
  const t = TRANSLATIONS[lang];

  const tabs: { id: NavTab; label: string; icon: any; badge?: string }[] = [
    { id: "quiz", label: t.nav.quiz, icon: Compass },
    { id: "qualitative", label: t.nav.qualitative, icon: Sparkles, badge: t.nav.heuristicBadge },
    { id: "report", label: t.nav.report, icon: FileText, badge: hasCompletedQuiz ? t.nav.reportReady : undefined },
    { id: "energy", label: t.nav.energy, icon: Activity },
    { id: "mirror", label: t.nav.mirror, icon: Users },
    { id: "theories", label: t.nav.theories, icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange("quiz")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-200">
            <Compass className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                {t.appName}
              </span>
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                {t.badgeTag}
              </span>
            </div>
            <p className="hidden text-xs text-slate-500 sm:block">
              {t.appSub}
            </p>
          </div>
        </div>

        {/* Action buttons including Home and English Toggle */}
        <div className="flex items-center gap-2">
          {/* Back to Brian portal */}
          <a
            id="btn-back-home"
            href="../"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
            title={isEn ? "Return to Brian Portal" : "返回 Brian 平台首页"}
            aria-label={isEn ? "Return to Brian Portal" : "返回 Brian 平台首页"}
          >
            <Home className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">{isEn ? "Brian Home" : "平台首页"}</span>
          </a>

          {/* Language Switch Button */}
          <button
            onClick={toggleLang}
            id="btn-language-toggle"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
            title={isEn ? "切换至简体中文" : "Switch to English"}
            aria-label="Toggle language"
          >
            <Languages className="h-3.5 w-3.5 text-indigo-600" />
            <span className="inline-flex items-center gap-1">
              <span className={!isEn ? "font-bold text-indigo-600" : "text-slate-400"}>中</span>
              <span className="text-slate-300">/</span>
              <span className={isEn ? "font-bold text-indigo-600" : "text-slate-400"}>EN</span>
            </span>
          </button>

          {hasCompletedQuiz && (
            <button
              onClick={onReset}
              id="btn-reset-quiz"
              className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 sm:inline-flex transition-colors shadow-xs"
              title={t.nav.retake}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t.nav.retake}</span>
            </button>
          )}

          <button
            onClick={() => onTabChange("report")}
            id="btn-nav-view-report"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>{t.nav.viewReport}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6">
        <nav className="flex space-x-1 border-t border-slate-100 py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-nav-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-indigo-300" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-medium leading-none ${
                      isActive
                        ? "bg-indigo-500/30 text-indigo-100"
                        : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
