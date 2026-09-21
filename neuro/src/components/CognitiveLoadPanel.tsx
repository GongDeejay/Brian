import React from 'react';
import { CognitiveLoadConfig } from '../types';
import { Sliders, Zap, Brain, Eye, Clock, ShieldAlert, Check } from 'lucide-react';
import { describeLoad, isLoadActive } from '../services/sessionStore';
import { useI18n, type MessageKey } from '../i18n';

interface Props {
  config: CognitiveLoadConfig;
  onChange: (newConfig: CognitiveLoadConfig) => void;
  onClose?: () => void;
}

/**
 * Which paradigms each control actually affects, as message keys.
 * Controls are only shown as active where they have a real, implemented effect —
 * no silent no-ops, and no over-claiming in either language.
 */
const SCOPE: {
  timeLimit: MessageKey;
  noise: MessageKey;
  wmProbe: MessageKey;
  distractor: MessageKey;
} = {
  timeLimit: 'load.scope.timeLimit',
  noise: 'load.scope.noise',
  wmProbe: 'load.scope.wmProbe',
  distractor: 'load.scope.distractor',
};

export const CognitiveLoadPanel: React.FC<Props> = ({ config, onChange, onClose }) => {
  const { t, lang } = useI18n();

  const applyPreset = (preset: CognitiveLoadConfig['presetName']) => {
    switch (preset) {
      case 'baseline':
        onChange({
          timeLimitSeconds: 0,
          workingMemoryDistractor: false,
          perceptualNoiseLevel: 0,
          distractorInterference: false,
          presetName: 'baseline',
        });
        break;
      case 'high_load':
        onChange({
          timeLimitSeconds: 2.0,
          workingMemoryDistractor: true,
          perceptualNoiseLevel: 45,
          distractorInterference: true,
          presetName: 'high_load',
        });
        break;
      case 'wm_stress':
        onChange({
          timeLimitSeconds: 3.0,
          workingMemoryDistractor: true,
          perceptualNoiseLevel: 10,
          distractorInterference: false,
          presetName: 'wm_stress',
        });
        break;
      case 'perceptual_noise':
        onChange({
          timeLimitSeconds: 0,
          workingMemoryDistractor: false,
          perceptualNoiseLevel: 65,
          distractorInterference: true,
          presetName: 'perceptual_noise',
        });
        break;
      default:
        break;
    }
  };

  const isPresetSelected = (preset: CognitiveLoadConfig['presetName']) => config.presetName === preset;

  const presets: {
    id: CognitiveLoadConfig['presetName'];
    nameKey: MessageKey;
    descKey: MessageKey;
    danger?: boolean;
  }[] = [
    { id: 'baseline', nameKey: 'load.preset.baseline.name', descKey: 'load.preset.baseline.desc' },
    { id: 'wm_stress', nameKey: 'load.preset.wmStress.name', descKey: 'load.preset.wmStress.desc' },
    {
      id: 'perceptual_noise',
      nameKey: 'load.preset.perceptualNoise.name',
      descKey: 'load.preset.perceptualNoise.desc',
    },
    { id: 'high_load', nameKey: 'load.preset.highLoad.name', descKey: 'load.preset.highLoad.desc', danger: true },
  ];

  return (
    <div id="cognitive-load-panel" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-slate-800">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold" aria-hidden="true">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">{t('load.panelTitle')}</h3>
            <p className="text-xs text-slate-500">{t('load.subtitle')}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
          >
            {t('load.collapse')}
          </button>
        )}
      </div>

      {/* Current configuration read-out (announced to screen readers) */}
      <div
        role="status"
        aria-live="polite"
        className={`mb-5 px-3 py-2 rounded-lg text-xs border ${
          isLoadActive(config) ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}
      >
        {t('load.current')}
        <span className="font-semibold">{describeLoad(config, lang)}</span>
        {!isLoadActive(config) && <span className="ml-1">{t('load.baselineNote')}</span>}
      </div>

      {/* Presets */}
      <div className="mb-5">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2" id="preset-group-label">
          {t('load.presets.label')}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-labelledby="preset-group-label">
          {presets.map((preset) => {
            const selected = isPresetSelected(preset.id);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                aria-pressed={selected}
                className={`flex items-center justify-between p-2.5 text-xs rounded-lg border text-left transition-all cursor-pointer ${
                  selected
                    ? preset.danger
                      ? 'border-red-600 bg-red-50/70 text-red-950 font-semibold'
                      : 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                }`}
              >
                <div>
                  <div className={`font-medium ${preset.danger ? 'flex items-center gap-1 text-red-700' : ''}`}>
                    {preset.danger && <Zap className="w-3 h-3 text-red-600" aria-hidden="true" />}
                    {t(preset.nameKey)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">{t(preset.descKey)}</div>
                </div>
                {selected && (
                  <Check
                    className={`w-3.5 h-3.5 shrink-0 ${preset.danger ? 'text-red-600' : 'text-indigo-600'}`}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Modulators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
        {/* Modulator 1: Time Pressure */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
              {t('load.timeLimit.title')}
            </span>
            <span className="text-xs font-mono font-bold text-blue-700">
              {config.timeLimitSeconds === 0
                ? t('load.timeLimit.selfPaced')
                : t('load.timeLimit.seconds', { seconds: config.timeLimitSeconds })}
            </span>
          </div>
          <div className="flex gap-1.5" role="group" aria-label={t('load.timeLimit.groupAria')}>
            {[0, 5.0, 3.0, 2.0, 1.5].map((sec) => (
              <button
                type="button"
                key={sec}
                onClick={() => onChange({ ...config, timeLimitSeconds: sec, presetName: 'custom' })}
                aria-pressed={config.timeLimitSeconds === sec}
                aria-label={
                  sec === 0
                    ? t('load.timeLimit.selfPaced')
                    : t('load.timeLimit.seconds', { seconds: sec })
                }
                className={`flex-1 py-1 text-xs rounded font-mono transition-colors cursor-pointer ${
                  config.timeLimitSeconds === sec
                    ? 'bg-blue-600 text-white font-medium shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {sec === 0 ? '∞' : `${sec}s`}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {t('load.timeLimit.desc', { scope: t(SCOPE.timeLimit) })}
          </p>
        </div>

        {/* Modulator 2: Perceptual Noise Level */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="perceptual-noise-slider" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
              {t('load.noise.title')}
            </label>
            <span className="text-xs font-mono font-bold text-amber-700">{config.perceptualNoiseLevel}%</span>
          </div>
          <input
            id="perceptual-noise-slider"
            type="range"
            min={0}
            max={80}
            step={5}
            value={config.perceptualNoiseLevel}
            aria-valuemin={0}
            aria-valuemax={80}
            aria-valuenow={config.perceptualNoiseLevel}
            aria-valuetext={t('load.noise.valueAria', { level: config.perceptualNoiseLevel })}
            onChange={(e) =>
              onChange({ ...config, perceptualNoiseLevel: Number(e.target.value), presetName: 'custom' })
            }
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>{t('load.noise.scaleClear')}</span>
            <span>{t('load.noise.scaleMid')}</span>
            <span>{t('load.noise.scaleHeavy')}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{t('load.noise.scope', { scope: t(SCOPE.noise) })}</p>
        </div>

        {/* Modulator 3: Working Memory & Interference */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-purple-600" aria-hidden="true" />
                {t('load.wm.title')}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${
                  config.workingMemoryDistractor ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {config.workingMemoryDistractor ? t('load.wm.active') : t('load.wm.inactive')}
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={config.workingMemoryDistractor}
                onChange={(e) =>
                  onChange({ ...config, workingMemoryDistractor: e.target.checked, presetName: 'custom' })
                }
                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
              <span className="text-xs text-slate-700">{t('load.wm.checkbox')}</span>
            </label>
            <p className="text-[11px] text-slate-500 mt-1">{t('load.wm.scope', { scope: t(SCOPE.wmProbe) })}</p>
          </div>

          <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-200/60">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.distractorInterference}
                onChange={(e) =>
                  onChange({ ...config, distractorInterference: e.target.checked, presetName: 'custom' })
                }
                className="w-4 h-4 mt-0.5 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
              <span className="text-xs text-slate-700">
                <span className="flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-slate-400" aria-hidden="true" />
                  {t('load.distractor.title')}
                </span>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  {t('load.distractor.scope', { scope: t(SCOPE.distractor) })}
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
