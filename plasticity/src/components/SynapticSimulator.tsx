import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  RotateCcw, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Layers, 
  Info,
  TrendingDown
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface Particle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
}

interface SynapticSimulatorProps {
  lang?: Language;
}

export const SynapticSimulator: React.FC<SynapticSimulatorProps> = ({ lang = 'zh' }) => {
  const t = TRANSLATIONS[lang];

  // Simulation states
  const [synapticStrength, setSynapticStrength] = useState<number>(35); // 0 - 100
  const [pulseCount, setPulseCount] = useState<number>(3);
  const [myelinLevel, setMyelinLevel] = useState<number>(1); // 1 to 5
  const [hasBdnf, setHasBdnf] = useState<boolean>(false);
  const [isFiring, setIsFiring] = useState<boolean>(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdCounter = useRef(0);

  // Derived metrics
  const receptorsCount = Math.max(3, Math.min(12, Math.floor(synapticStrength / 10) + 2));
  const conductionSpeed = (5 + myelinLevel * 18 + (synapticStrength > 70 ? 15 : 0)).toFixed(1);
  const spineSizeMultiplier = 0.8 + (synapticStrength / 100) * 0.7;

  const addLog = (msg: string) => {
    setSimulationLog(prev => [msg, ...prev.slice(0, 5)]);
  };

  // Trigger Action Potential and Vesicle Release
  const handleFirePulse = () => {
    setIsFiring(true);
    setPulseCount(p => p + 1);

    // Spawn animated neurotransmitter molecules
    const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
      id: particleIdCounter.current++,
      x: 170 + Math.random() * 20,
      y: 90 + Math.random() * 40,
      targetX: 250 + Math.random() * 10,
      targetY: 80 + (i / 12) * 60 + (Math.random() * 10 - 5),
      progress: 0,
      speed: 0.05 + Math.random() * 0.04
    }));
    setParticles(prev => [...prev, ...newParticles]);

    // Hebbian rule: fire together -> wire together
    setSynapticStrength(prev => {
      const increment = hasBdnf ? 12 : 7;
      const next = Math.min(100, prev + increment);
      if (next >= 75 && prev < 75) {
        addLog(
          lang === 'en'
            ? '✨ Synapse triggered Long-Term Potentiation (LTP)! NMDA Mg2+ block evicted, AMPA insertion surging.'
            : '✨ 突触触发长时程增强 (LTP)！NMDA受体脱阻滞，AMPA受体数量显著爆发'
        );
      } else {
        addLog(
          lang === 'en'
            ? `⚡ Action potential released glutamate! Postsynaptic EPSP reinforced +${increment}%`
            : `⚡ 动作电位释放谷氨酸！突触后电位增强 +${increment}%`
        );
      }
      return next;
    });

    setTimeout(() => setIsFiring(false), 300);
  };

  // Repeated Rapid Practice (Burst train)
  const handleRapidPractice = () => {
    let count = 0;
    const interval = setInterval(() => {
      handleFirePulse();
      count++;
      if (count >= 5) {
        clearInterval(interval);
        addLog(
          lang === 'en'
            ? '🔥 High-density deliberate burst: High-frequency spikes drive heavy Ca2+ influx into postsynaptic spine!'
            : '🔥 密集刻意练习连发：高频动作电位冲刷，突触间隙钙离子大量内流！'
        );
      }
    }, 180);
  };

  // Disuse / Long-Term Depression (LTD)
  const handleDisuse = () => {
    setSynapticStrength(prev => {
      const next = Math.max(10, prev - 25);
      addLog(
        lang === 'en'
          ? '📉 Prolonged disuse (Use-it-or-lose-it): Synaptic LTD induced, AMPA receptors internalized, efficacy dialed down.'
          : '📉 长期缺乏唤醒与使用 (Use it or lose it)：突触发生LTD，受体回缩，连接效能钝化'
      );
      return next;
    });
  };

  // Apply BDNF
  const handleToggleBdnf = () => {
    const nextBdnf = !hasBdnf;
    setHasBdnf(nextBdnf);
    if (nextBdnf) {
      setSynapticStrength(prev => Math.min(100, prev + 15));
      addLog(
        lang === 'en'
          ? '🌱 BDNF neurotrophin applied: Binds TrkB receptor, activates protein synthesis, structurally stabilizing spine.'
          : '🌱 注入BDNF脑源性神经营养因子：结合TrkB受体，激活蛋白质合成，突触结构被物理稳定'
      );
    } else {
      addLog(
        lang === 'en'
          ? 'ℹ️ BDNF clearance to baseline levels.'
          : 'ℹ️ BDNF代谢水平回落'
      );
    }
  };

  // Upgrade Myelin
  const handleAddMyelin = () => {
    setMyelinLevel(prev => {
      const next = prev >= 5 ? 1 : prev + 1;
      if (next > prev) {
        addLog(
          lang === 'en'
            ? `🛡️ Oligodendrocytes wrapped myelin layer (${next}/5): Axon insulated, saltatory conduction speed surged to ${conductionSpeed} m/s`
            : `🛡️ 少突胶质细胞增厚髓鞘包裹（第${next}层）：神经纤维绝缘加固，跳跃传导速率跃升至 ${conductionSpeed} m/s`
        );
      } else {
        addLog(
          lang === 'en'
            ? '🔄 Myelin reset to baseline single-layer.'
            : '🔄 髓鞘重置为基础单层状态'
        );
      }
      return next;
    });
  };

  // Reset
  const handleReset = () => {
    setSynapticStrength(35);
    setPulseCount(0);
    setMyelinLevel(1);
    setHasBdnf(false);
    setParticles([]);
    setSimulationLog([
      lang === 'en' 
        ? 'Baseline initialized: Default untrained synaptic baseline.' 
        : '初始状态：未受刻意训练的默认基底突触。'
    ]);
  };

  // Particle animation loop
  useEffect(() => {
    if (particles.length === 0) return;
    const timer = requestAnimationFrame(() => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            progress: p.progress + p.speed,
            x: p.x + (p.targetX - p.x) * 0.15,
            y: p.y + (p.targetY - p.y) * 0.15,
          }))
          .filter(p => p.progress < 1.1)
      );
    });
    return () => cancelAnimationFrame(timer);
  }, [particles]);

  // Initial message
  useEffect(() => {
    addLog(
      lang === 'en'
        ? 'Interactive sandbox ready: Click "Fire Single Pulse" or "Deliberate Burst" to witness Hebbian re-wiring.'
        : '交互式沙盘已就绪：点击“激发动作电位”或“刻意练习连发”，观察赫布定律如何改变微观突触结构。'
    );
  }, [lang]);

  return (
    <div id="synaptic-simulator-container" className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col">
      {/* Simulator Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                {t.simTitle}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {t.simBadge}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t.simSubtitle}
            </p>
          </div>
        </div>

        {/* Quick state indicators */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-zinc-500 dark:text-zinc-400">{t.simSynapticStrength}:</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">{synapticStrength}%</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-zinc-500 dark:text-zinc-400">{t.simConductionSpeed}:</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">{conductionSpeed} m/s</span>
          </div>
        </div>
      </div>

      {/* Main Canvas & Visual Stage */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Synapse Stage (Left / Center) */}
        <div className="lg:col-span-8 bg-zinc-950 rounded-2xl p-4 sm:p-6 relative overflow-hidden flex flex-col items-center justify-center border border-zinc-800 min-h-[340px]">
          {/* SVG Canvas */}
          <svg
            viewBox="0 0 460 210"
            className="w-full h-auto max-w-[460px] overflow-visible"
          >
            <defs>
              <linearGradient id="axonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4338ca" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>

              <linearGradient id="postDendriteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#312e81" />
                <stop offset="100%" stopColor="#4338ca" />
              </linearGradient>

              <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Presynaptic Axon Terminal */}
            <g transform="translate(10, 10)">
              {/* Myelin Sheath Layers */}
              {Array.from({ length: myelinLevel }).map((_, i) => (
                <rect
                  key={i}
                  x={15 + i * 2}
                  y={68 - i * 3}
                  width={75 - i * 4}
                  height={44 + i * 6}
                  rx={8}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  opacity={0.35 + i * 0.15}
                  strokeDasharray="4 2"
                />
              ))}

              {/* Main Axon Cable */}
              <rect
                x="20"
                y="75"
                width="70"
                height="30"
                rx="6"
                fill="url(#axonGradient)"
              />

              {/* Synaptic Bouton Terminal */}
              <path
                d="M 90 75 C 130 65, 175 60, 185 90 C 190 110, 155 125, 90 105 Z"
                fill="url(#axonGradient)"
                filter={isFiring ? 'url(#glowEffect)' : undefined}
                className="transition-all duration-300"
              />

              {/* Synaptic Vesicles (Neurotransmitters inside Bouton) */}
              <g className="animate-pulse">
                <circle cx="120" cy="85" r="4" fill="#a5b4fc" />
                <circle cx="135" cy="78" r="4.5" fill="#c7d2fe" />
                <circle cx="150" cy="88" r="4" fill="#818cf8" />
                <circle cx="140" cy="98" r="4.5" fill="#a5b4fc" />
                <circle cx="160" cy="92" r="3.5" fill="#c7d2fe" />
                <circle cx="168" cy="80" r="4" fill="#818cf8" />
              </g>

              <text x="50" y="94" fill="#e0e7ff" fontSize="10" textAnchor="middle" fontWeight="bold">
                {t.simAxonTerminal}
              </text>
            </g>

            {/* Transmitters crossing Synaptic Cleft (Particles) */}
            <g>
              {particles.map(p => (
                <circle
                  key={p.id}
                  cx={p.x}
                  cy={p.y}
                  r={2.5}
                  fill="#f59e0b"
                  filter="url(#glowEffect)"
                />
              ))}
            </g>

            {/* Postsynaptic Dendritic Spine */}
            <g transform="translate(170, 10)">
              {/* Dynamic Spine Shape Scaling with Synaptic Strength */}
              <path
                d={`M 110 55 C 80 75, ${70 - (spineSizeMultiplier - 1) * 20} 90, 110 125 L 200 135 L 200 45 Z`}
                fill="url(#postDendriteGradient)"
                stroke="#6366f1"
                strokeWidth={1}
                className="transition-all duration-300"
              />

              {/* AMPA & NMDA Receptors lined along postsynaptic density */}
              {Array.from({ length: receptorsCount }).map((_, i) => {
                const step = 60 / (receptorsCount + 1);
                const ry = 62 + (i + 1) * step;
                const isNMDA = i % 3 === 0;

                return (
                  <rect
                    key={i}
                    x={80}
                    y={ry}
                    width={7}
                    height={4}
                    rx={1.5}
                    fill={isNMDA ? '#ec4899' : '#f59e0b'}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                  />
                );
              })}

              <text x="145" y="94" fill="#e0e7ff" fontSize="10" textAnchor="middle" fontWeight="bold">
                {t.simDendriticSpine}
              </text>
            </g>

            {/* Receptor Legend */}
            <g transform="translate(180, 185)">
              <rect x="0" y="0" width="6" height="5" rx="1" fill="#f59e0b" />
              <text x="10" y="5" fill="#a1a1aa" fontSize="7">{t.simAmpaReceptor}</text>
              <rect x="110" y="0" width="6" height="5" rx="1" fill="#ec4899" />
              <text x="120" y="5" fill="#a1a1aa" fontSize="7">{t.simNmdaReceptor}</text>
            </g>
          </svg>

          {/* Action Potential Firing Indicator */}
          <div className="w-full flex items-center justify-between text-xs text-zinc-400 mt-2 px-2">
            <span>{t.simPulseCount}: <strong className="text-zinc-200">{pulseCount} {lang === 'en' ? 'times' : '次'}</strong></span>
            <span className="text-indigo-400">
              {isFiring ? t.simFiring : t.simReady}
            </span>
          </div>
        </div>

        {/* Interactive Controls & Gauges (Right) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              {t.simControlTitle}
            </h4>

            {/* Control Buttons Grid */}
            <div className="flex flex-col gap-2">
              <button
                id="btn-fire-pulse"
                onClick={handleFirePulse}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                {t.btnFirePulse}
              </button>

              <button
                id="btn-rapid-practice"
                onClick={handleRapidPractice}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-[0.98] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
                {t.btnDeliberatePractice}
              </button>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  id="btn-toggle-bdnf"
                  onClick={handleToggleBdnf}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    hasBdnf
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  {hasBdnf ? t.btnInjectBdnfActive : t.btnInjectBdnf}
                </button>

                <button
                  id="btn-add-myelin"
                  onClick={handleAddMyelin}
                  className="py-2 px-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                  {t.btnWrapMyelin}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-disuse-ltd"
                  onClick={handleDisuse}
                  className="py-2 px-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-300 text-zinc-600 dark:text-zinc-400 hover:text-rose-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                  {t.btnDisuseLtd}
                </button>

                <button
                  id="btn-reset-simulator"
                  onClick={handleReset}
                  className="py-2 px-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t.btnResetSim}
                </button>
              </div>
            </div>
          </div>

          {/* Micro Logs Window */}
          <div className="bg-zinc-900 text-zinc-300 p-3 rounded-xl border border-zinc-800 text-xs flex flex-col gap-1.5 max-h-[140px] overflow-y-auto font-mono">
            <span className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1">
              <Info className="w-3 h-3 text-indigo-400" /> {t.simElectrophysiologyLog}
            </span>
            {simulationLog.map((log, i) => (
              <div key={i} className="leading-relaxed border-l-2 border-indigo-500/50 pl-2 text-zinc-300">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Book Insight Footer */}
      <div className="p-3.5 sm:p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border-t border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
        <div className="p-1 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <strong className="text-indigo-900 dark:text-indigo-300">{t.simCoreInsightTitle}</strong>
          {t.simCoreInsightText}
        </div>
      </div>
    </div>
  );
};
