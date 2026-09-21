import { lazy, Suspense, useCallback, useEffect, useState, type FC } from 'react';
import { CognitiveLoadConfig, ParadigmStats, SessionReport, TaskId } from './types';
import { Header } from './components/Header';
import { CognitiveLoadPanel } from './components/CognitiveLoadPanel';
import { WCSTView } from './components/WCSTView';
import { IDEDView } from './components/IDEDView';
import { GaborView } from './components/GaborView';
import { PrototypeView } from './components/PrototypeView';
import { LiteratureModal } from './components/LiteratureModal';
import { audioFeedback } from './services/audioService';
import { useI18n } from './i18n';
import { useAuth } from './context/AuthContext';
import { syncPendingRecords } from './services/sessionSync';
import {
  createSessionRecord,
  isLoadActive,
  loadSessions,
  MAX_STORED_SESSIONS,
  saveSessions,
} from './services/sessionStore';

/**
 * recharts (~500 kB raw) is used only by the WPT learning curve and the results
 * dashboard. Both are code-split so the initial load of the task views stays
 * small — important on mobile networks. The two lazy chunks share one cached
 * recharts chunk, so it is downloaded at most once per session.
 */
const AnalyticsDashboard = lazy(() =>
  import('./components/AnalyticsDashboard').then((m) => ({ default: m.AnalyticsDashboard }))
);
const WPTView = lazy(() => import('./components/WPTView').then((m) => ({ default: m.WPTView })));

/**
 * Shared loading placeholder for lazily-loaded panels.
 * `panelKey` names the paradigm so the whole sentence stays translatable.
 */
const PanelFallback: FC<{ panelKey: 'panel.wpt' | 'panel.analytics' }> = ({ panelKey }) => {
  const { t } = useI18n();
  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500"
      role="status"
      aria-live="polite"
    >
      {t('common.loadingPanel', { panel: t(panelKey) })}
    </div>
  );
};

export default function App() {
  const { t, lang } = useI18n();
  const { user, hasConsented } = useAuth();
  const [activeTask, setActiveTask] = useState<TaskId | 'analytics'>('wcst');
  const [isLoadPanelOpen, setIsLoadPanelOpen] = useState<boolean>(false);
  const [isLiteratureOpen, setIsLiteratureOpen] = useState<boolean>(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  /**
   * Celebratory confetti is OFF by default: it is an emotional-arousal confound in a
   * research instrument and is a motion-sensitivity hazard. Participants opt in.
   */
  const [isCelebrationEnabled, setIsCelebrationEnabled] = useState<boolean>(false);

  const [cognitiveLoad, setCognitiveLoad] = useState<CognitiveLoadConfig>({
    timeLimitSeconds: 0,
    workingMemoryDistractor: false,
    perceptualNoiseLevel: 0,
    distractorInterference: false,
    presetName: 'baseline',
  });

  // Real, measured session history (in memory + bounded sessionStorage mirror).
  const [sessions, setSessions] = useState(() => loadSessions());

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  /**
   * Auto-sync after a new session lands.
   *
   * Only runs when signed in AND consent for the current terms has been given —
   * without consent nothing is uploaded and records stay on this device. The
   * upload is idempotent, so re-running on every change is harmless.
   */
  useEffect(() => {
    if (!user || !hasConsented) return;
    void syncPendingRecords(lang, null);
  }, [sessions, user, hasConsented, lang]);

  // Keep the browser tab title in step with the selected language.
  useEffect(() => {
    document.title = t('app.titleFull');
  }, [t]);

  const handleToggleAudio = () => {
    const next = !isAudioEnabled;
    setIsAudioEnabled(next);
    audioFeedback.setEnabled(next);
  };

  const isCustomLoad = isLoadActive(cognitiveLoad);

  /** Single ingestion point: every finished paradigm reports its measured stats here. */
  const handleSessionComplete = useCallback(
    (report: SessionReport<ParadigmStats>) => {
      const record = createSessionRecord({
        task: report.stats.task,
        metrics: report.stats,
        durationSeconds: report.durationSeconds,
        loadConfig: cognitiveLoad,
        extraMetrics: report.extraMetrics,
        // Stored headline strings follow the language in use when the run finished;
        // the reference-language file name and year are language-neutral.
        lang,
      });
      setSessions((prev) => [...prev, record].slice(-MAX_STORED_SESSIONS));
    },
    [cognitiveLoad, lang]
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      {/* Top Navigation */}
      <Header
        activeTask={activeTask}
        onSelectTask={(task) => setActiveTask(task)}
        onToggleLoadPanel={() => setIsLoadPanelOpen(!isLoadPanelOpen)}
        isLoadPanelOpen={isLoadPanelOpen}
        onOpenLiterature={() => setIsLiteratureOpen(true)}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={handleToggleAudio}
        isCustomLoad={isCustomLoad}
        isCelebrationEnabled={isCelebrationEnabled}
        onToggleCelebration={() => setIsCelebrationEnabled((v) => !v)}
        sessionCount={sessions.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Collapsible Cognitive Load Regulator Panel */}
        {isLoadPanelOpen && (
          <CognitiveLoadPanel
            config={cognitiveLoad}
            onChange={(newCfg) => setCognitiveLoad(newCfg)}
            onClose={() => setIsLoadPanelOpen(false)}
          />
        )}

        {/* Dynamic Task View Render */}
        {activeTask === 'wcst' && (
          <div id="task-panel-wcst" role="tabpanel" aria-labelledby="task-tab-wcst" tabIndex={0}>
            <WCSTView
              cognitiveLoad={cognitiveLoad}
              celebrationEnabled={isCelebrationEnabled}
              onSessionComplete={handleSessionComplete}
            />
          </div>
        )}

        {activeTask === 'wpt' && (
          <div id="task-panel-wpt" role="tabpanel" aria-labelledby="task-tab-wpt" tabIndex={0}>
            <Suspense fallback={<PanelFallback panelKey="panel.wpt" />}>
              <WPTView
                cognitiveLoad={cognitiveLoad}
                celebrationEnabled={isCelebrationEnabled}
                onSessionComplete={handleSessionComplete}
              />
            </Suspense>
          </div>
        )}

        {activeTask === 'ided' && (
          <div id="task-panel-ided" role="tabpanel" aria-labelledby="task-tab-ided" tabIndex={0}>
            <IDEDView
              cognitiveLoad={cognitiveLoad}
              celebrationEnabled={isCelebrationEnabled}
              onSessionComplete={handleSessionComplete}
            />
          </div>
        )}

        {activeTask === 'gabor' && (
          <div id="task-panel-gabor" role="tabpanel" aria-labelledby="task-tab-gabor" tabIndex={0}>
            <GaborView cognitiveLoad={cognitiveLoad} onSessionComplete={handleSessionComplete} />
          </div>
        )}

        {activeTask === 'prototype' && (
          <div id="task-panel-prototype" role="tabpanel" aria-labelledby="task-tab-prototype" tabIndex={0}>
            <PrototypeView
              cognitiveLoad={cognitiveLoad}
              celebrationEnabled={isCelebrationEnabled}
              onSessionComplete={handleSessionComplete}
            />
          </div>
        )}

        {activeTask === 'analytics' && (
          <div id="task-panel-analytics" role="tabpanel" aria-labelledby="task-tab-analytics" tabIndex={0}>
            <Suspense fallback={<PanelFallback panelKey="panel.analytics" />}>
              <AnalyticsDashboard
                cognitiveLoad={cognitiveLoad}
                sessions={sessions}
                onClearSessions={() => setSessions([])}
              />
            </Suspense>
          </div>
        )}
      </main>

      {/* Academic Literature Reference Modal */}
      <LiteratureModal isOpen={isLiteratureOpen} onClose={() => setIsLiteratureOpen(false)} />

      {/* Subdued Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-700">{t('app.title')}</span> · {t('footer.suite')}
          </div>
          {/* Citation keys are language-neutral bibliographic labels. */}
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>WCST (Heaton 1993)</span>
            <span>WPT (Knowlton 1996)</span>
            <span>CANTAB ID/ED</span>
            <span>COVIS (Ashby)</span>
            <span>Posner &amp; Keele (1968)</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-2 text-[11px] text-amber-700">
          {t('footer.disclaimer')}
        </div>
      </footer>
    </div>
  );
}
