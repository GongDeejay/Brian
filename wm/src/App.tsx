import { useCallback, useEffect, useRef, useState } from 'react';
import { TaskType, CognitiveProfile, NBackResult, OSPANResult, ChangeDetectionResult } from './types/wm';
import {
  loadCognitiveProfile,
  saveNBackResult,
  saveOSPANResult,
  saveChangeDetectionResult,
  clearCognitiveHistory,
  persistCognitiveProfile,
} from './utils/storage';
import type { SaveOutcome } from './utils/storage';
import { soundManager } from './utils/audio';
import { Header } from './components/Header';
import { AcademicTheoryModal } from './components/AcademicTheoryModal';
import { NBackTask } from './components/NBackTask';
import { OSPANTask } from './components/OSPANTask';
import { ChangeDetectionTask } from './components/ChangeDetectionTask';
import { CognitiveDashboard } from './components/CognitiveDashboard';
import { BookOpen, Brain, Home, RotateCcw, TriangleAlert, X } from 'lucide-react';
import { useI18n } from './i18n';
import { useAuth } from './context/AuthContext';
import { syncPendingRecords } from './services/sessionSync';

/** How long the "撤销清除" window stays open. */
const UNDO_WINDOW_MS = 7000;

export default function App() {
  const { t, lang } = useI18n();
  const { user, hasConsented } = useAuth();
  const [activeTab, setActiveTab] = useState<TaskType>('nback');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isTheoryOpen, setIsTheoryOpen] = useState<boolean>(false);
  const [profile, setProfile] = useState<CognitiveProfile>(() => loadCognitiveProfile());
  const [storageNotice, setStorageNotice] = useState<string | null>(null);
  const [undoSnapshot, setUndoSnapshot] = useState<CognitiveProfile | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  // Keep the browser/tab title in the selected language. `t` is re-created by the
  // provider whenever the language changes, so this re-runs on every switch.
  useEffect(() => {
    document.title = t('app.documentTitle');
  }, [t]);

  // Clear the undo timer on unmount so it cannot fire on a dead component.
  useEffect(() => {
    return () => {
      if (undoTimerRef.current !== null) {
        window.clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }
    };
  }, []);

  /**
   * Auto-sync after a new result lands.
   *
   * Only runs when signed in AND consent for the current terms has been given —
   * without consent nothing is uploaded and records stay on this device. The
   * upload is idempotent (deterministic clientIds), so re-running is harmless.
   */
  useEffect(() => {
    if (!user || !hasConsented) return;
    void syncPendingRecords(lang, null);
  }, [profile, user, hasConsented, lang]);

  // Toggle sound
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.isMuted = nextMuted;
    if (!nextMuted) {
      soundManager.playTick();
    }
  };

  /**
   * Storage writes are best-effort: when the browser refuses to persist (quota
   * exceeded, private mode) the result is kept in memory and a non-blocking
   * notice is shown instead of throwing out of the task's completion callback.
   */
  const applyOutcome = (outcome: SaveOutcome) => {
    setProfile(outcome.profile);
    setStorageNotice(outcome.persisted ? null : outcome.error);
  };

  // Result handlers. `lang` is passed so the persisted history-entry summary and
  // any storage-failure notice are written in the language active at save time.
  const handleSaveNBack = (result: NBackResult) => {
    applyOutcome(saveNBackResult(result, lang));
  };

  const handleSaveOSPAN = (result: OSPANResult) => {
    applyOutcome(saveOSPANResult(result, lang));
  };

  const handleSaveChangeDetection = (result: ChangeDetectionResult) => {
    applyOutcome(saveChangeDetectionResult(result, lang));
  };

  // Clearing needs an explicit confirmation (inside the dashboard) and keeps the
  // previous profile in memory for a short undo window.
  const handleClearHistory = useCallback(() => {
    const snapshot = profile;
    applyOutcome(clearCognitiveHistory(lang));
    setUndoSnapshot(snapshot);
    if (undoTimerRef.current !== null) window.clearTimeout(undoTimerRef.current);
    undoTimerRef.current = window.setTimeout(() => {
      setUndoSnapshot(null);
      undoTimerRef.current = null;
    }, UNDO_WINDOW_MS);
  }, [profile, lang]);

  const handleUndoClear = useCallback(() => {
    if (!undoSnapshot) return;
    if (undoTimerRef.current !== null) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    applyOutcome(persistCognitiveProfile(undoSnapshot, lang));
    setUndoSnapshot(null);
  }, [undoSnapshot, lang]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenTheory={() => setIsTheoryOpen(true)}
      />

      {/* Non-blocking storage notice */}
      {storageNotice && (
        <div
          role="status"
          aria-live="polite"
          className="border-b border-amber-800/40 bg-amber-950/40 text-amber-200"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-start gap-2 text-xs">
            <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="flex-1">{storageNotice}{t('app.localResultNotice')}</span>
            <button
              onClick={() => setStorageNotice(null)}
              aria-label={t('app.dismissStorageNotice')}
              className="text-amber-300/80 hover:text-white p-1 rounded transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'nback' && (
          <NBackTask onSaveResult={handleSaveNBack} />
        )}

        {activeTab === 'ospan' && (
          <OSPANTask onSaveResult={handleSaveOSPAN} />
        )}

        {activeTab === 'change_detection' && (
          <ChangeDetectionTask onSaveResult={handleSaveChangeDetection} />
        )}

        {activeTab === 'dashboard' && (
          <CognitiveDashboard
            profile={profile}
            onSelectTab={setActiveTab}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      {/* Academic Citation Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-400" aria-hidden="true" />
            <span>{t('footer.tagline')}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-mono">
            <span>Kirchner (1958)</span>
            <span>·</span>
            <span>Turner & Engle (1989)</span>
            <span>·</span>
            <span>Cowan (2001)</span>
            <span>·</span>
            <span>Luck & Vogel (1997)</span>
          </div>
          <nav aria-label={t('footer.aria')} className="flex items-center gap-4">
            <a
              id="btn-footer-back-home"
              href="../"
              className="text-[11px] text-slate-400 hover:text-slate-200 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
              title={t('action.home')}
            >
              <Home className="w-3 h-3" aria-hidden="true" />
              <span>{t('action.home')}</span>
            </a>
            <button
              id="btn-footer-theory"
              onClick={() => setIsTheoryOpen(true)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3 h-3" aria-hidden="true" />
              <span>{t('footer.theory')}</span>
            </button>
          </nav>
        </div>
      </footer>

      {/* Undo window after clearing the local records */}
      {undoSnapshot && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl text-xs text-slate-200"
        >
          <span>{t('app.historyCleared')}</span>
          <button
            id="btn-undo-clear-history"
            onClick={handleUndoClear}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            <span>{t('common.undo')}</span>
          </button>
          <button
            onClick={() => setUndoSnapshot(null)}
            aria-label={t('app.dismissUndoNotice')}
            className="text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Academic Paradigm Theory Modal */}
      <AcademicTheoryModal
        isOpen={isTheoryOpen}
        onClose={() => setIsTheoryOpen(false)}
      />
    </div>
  );
}
