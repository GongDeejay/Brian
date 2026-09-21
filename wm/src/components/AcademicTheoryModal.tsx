import { useEffect, useRef } from 'react';
import { Brain, Zap, CheckCircle, X } from 'lucide-react';
import { useI18n } from '../i18n';

interface AcademicTheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TITLE_ID = 'academic-modal-title';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const AcademicTheoryModal = ({ isOpen, onClose }: AcademicTheoryModalProps) => {
  const { t, tList } = useI18n();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const getFocusable = () =>
      Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = getFocusable();
      if (items.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const insideDialog = !!dialogRef.current && dialogRef.current.contains(active);

      if (event.shiftKey && (active === first || !insideDialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !insideDialog)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Body scroll lock while the dialog is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const initial =
      dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]') ?? getFocusable()[0];
    initial?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      // Restore focus to whatever opened the dialog.
      previouslyFocusedRef.current?.focus?.();
      previouslyFocusedRef.current = null;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Array copy lives in individual keys and is resolved with tList (see i18n README).
  const nbackMechanisms = tList(['theory.p1Feature1', 'theory.p1Feature2', 'theory.p1Feature3']);
  const trainingLabels = tList(['theory.train1Label', 'theory.train2Label', 'theory.train3Label']);
  const trainingItems = tList(['theory.train1', 'theory.train2', 'theory.train3']);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        id="academic-modal-container"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        tabIndex={-1}
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-200 animate-scale-in outline-none"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Brain className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id={TITLE_ID} className="text-xl font-semibold text-white tracking-tight">{t('theory.title')}</h2>
              <p className="text-xs text-slate-400">{t('theory.subtitle')}</p>
            </div>
          </div>
          <button
            id="btn-close-academic-modal"
            data-autofocus
            onClick={onClose}
            aria-label={t('theory.close')}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 space-y-6 text-sm leading-relaxed">
          {/* Concept summary */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <h3 className="text-base font-semibold text-indigo-300 flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-indigo-400" aria-hidden="true" />
              {t('theory.wmHeading')}
            </h3>
            <p className="text-slate-300">
              {t('theory.wmBodyPre')}
              <strong>{t('theory.wmBodyStrong')}</strong>
              {t('theory.wmBodyPost')}
            </p>
          </div>

          {/* Paradigm 1 */}
          <div className="border border-slate-800 rounded-xl p-5 bg-slate-950/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {t('theory.p1Badge')}
              </span>
              <span className="text-xs text-slate-400 font-mono">Kirchner (1958)</span>
            </div>
            <h4 className="text-base font-semibold text-white mb-2">{t('theory.p1Title')}</h4>
            <p className="text-slate-300 mb-3">
              <strong>{t('theory.mechanismLabel')}</strong>
              {t('theory.p1Mechanism')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-400 font-semibold block mb-1">{t('theory.keyMechanismsLabel')}</span>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  {nbackMechanisms.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-1">{t('theory.metricsLabel')}</span>
                <p className="text-slate-300 font-mono">
                  d' = Z(Hit) - Z(FA)
                </p>
                <p className="text-slate-400 mt-1">
                  {t('theory.nbackFormulaNote')}
                </p>
              </div>
            </div>
          </div>

          {/* Paradigm 2 */}
          <div className="border border-slate-800 rounded-xl p-5 bg-slate-950/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {t('theory.p2Badge')}
              </span>
              <span className="text-xs text-slate-400 font-mono">Turner & Engle (1989)</span>
            </div>
            <h4 className="text-base font-semibold text-white mb-2">{t('theory.p2Title')}</h4>
            <p className="text-slate-300 mb-3">
              <strong>{t('theory.mechanismLabel')}</strong>
              {t('theory.p2Mechanism')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-400 font-semibold block mb-1">{t('theory.gfLabel')}</span>
                <p className="text-slate-300">
                  {t('theory.gfBody')}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-1">{t('theory.validityLabel')}</span>
                <p className="text-slate-300">
                  {t('theory.validityPre')}
                  <strong className="text-cyan-300">{t('theory.validityStrong')}</strong>
                  {t('theory.validityPost')}
                </p>
              </div>
            </div>
          </div>

          {/* Paradigm 3 */}
          <div className="border border-slate-800 rounded-xl p-5 bg-slate-950/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {t('theory.p3Badge')}
              </span>
              <span className="text-xs text-slate-400 font-mono">Cowan (2001) / Luck & Vogel (1997)</span>
            </div>
            <h4 className="text-base font-semibold text-white mb-2">{t('theory.p3Title')}</h4>
            <p className="text-slate-300 mb-3">
              <strong>{t('theory.mechanismLabel')}</strong>
              {t('theory.p3Mechanism')}
            </p>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-slate-400 font-semibold">{t('theory.kFormulaLabel')}</span>
                <span className="font-mono text-amber-400 font-bold text-sm">K = N × (H - F)</span>
              </div>
              <p className="text-slate-300">
                {t('theory.kPre')}
                <strong>{t('theory.kStrong')}</strong>
                {t('theory.kPost')}
              </p>
            </div>
          </div>

          {/* Measurement-integrity note */}
          <div className="border border-indigo-800/40 bg-indigo-950/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-indigo-300 mb-2">{t('theory.integrityHeading')}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('theory.integrityPre')}
              <strong>{t('theory.integrityStrong')}</strong>
              {t('theory.integrityPost')}
            </p>
          </div>

          {/* Training recommendations */}
          <div className="border border-emerald-800/40 bg-emerald-950/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-emerald-300 flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              {t('theory.trainingHeading')}
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              {trainingItems.map((item, index) => (
                <li key={item}>
                  <strong>{trainingLabels[index]}</strong>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            id="btn-modal-understand"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            {t('theory.understand')}
          </button>
        </div>
      </div>
    </div>
  );
};
