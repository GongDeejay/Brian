import React from 'react';
import { 
  ShieldAlert, 
  BookOpen, 
  HeartHandshake, 
  Lock, 
  X, 
  Check, 
  AlertTriangle,
  Scale
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];

  return (
    <div 
      id="disclaimer-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="disclaimer-modal"
        className="bg-white dark:bg-zinc-900 rounded-2xl max-w-3xl w-full p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5 max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                {t.disclaimerTitle}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {t.disclaimerSubtitle}
              </p>
            </div>
          </div>

          <button
            id="btn-close-disclaimer"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {/* Section 1: Academic & Copyright Fair Use */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
              <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{t.disclaimerAcademicTitle}</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm whitespace-pre-line leading-relaxed">
              {t.disclaimerAcademicText}
            </p>
          </div>

          {/* Section 2: Medical & Clinical Health Notice (HIGH PRIORITY) */}
          <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300 text-xs sm:text-sm">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{t.disclaimerMedicalTitle}</span>
            </div>
            <div className="text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm whitespace-pre-line leading-relaxed space-y-2 font-normal">
              {t.disclaimerMedicalText}
            </div>
          </div>

          {/* Section 3: Privacy & LocalStorage */}
          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t.disclaimerPrivacyTitle}</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm whitespace-pre-line leading-relaxed">
              {t.disclaimerPrivacyText}
            </p>
          </div>
        </div>

        {/* Footer with acknowledge action */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
          <div className="text-[11px] text-zinc-400 hidden sm:block">
            {t.disclaimerFooterNotice}
          </div>
          <button
            id="btn-acknowledge-disclaimer"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ml-auto"
          >
            <Check className="w-4 h-4" />
            {t.disclaimerButtonAcknowledge}
          </button>
        </div>
      </div>
    </div>
  );
};
