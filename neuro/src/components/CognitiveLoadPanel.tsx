import React from 'react';
import { CognitiveLoadConfig } from '../types';
import { Sliders, Zap, Brain, Eye, Clock, ShieldAlert, Check } from 'lucide-react';
import { describeLoad, isLoadActive } from '../services/sessionStore';

interface Props {
  config: CognitiveLoadConfig;
  onChange: (newConfig: CognitiveLoadConfig) => void;
  onClose?: () => void;
}

/**
 * Which paradigms each control actually affects. Controls are only shown as
 * active where they have a real, implemented effect — no silent no-ops.
 */
const SCOPE = {
  timeLimit: 'WCST / WPT',
  noise: 'WCST / WPT / IDED / Gabor / 原型畸变',
  wmProbe: 'WCST',
  distractor: 'WCST / WPT / IDED / Gabor / 原型畸变',
} as const;

export const CognitiveLoadPanel: React.FC<Props> = ({ config, onChange, onClose }) => {
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

  return (
    <div id="cognitive-load-panel" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-slate-800">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold" aria-hidden="true">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">认知负荷调节控制器 (Cognitive Load Modulator)</h3>
            <p className="text-xs text-slate-500">
              基于Sweller认知负荷理论 (CLT) 的负荷操控；每项控制均标注其实际生效的测验范围
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            收起面板
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
        当前负荷设置：<span className="font-semibold">{describeLoad(config)}</span>
        {!isLoadActive(config) && <span className="ml-1">（所有负荷开关关闭，测得数据可作为基线对照）</span>}
      </div>

      {/* Presets */}
      <div className="mb-5">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2" id="preset-group-label">
          实验负荷预设方案
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-labelledby="preset-group-label">
          <button
            type="button"
            onClick={() => applyPreset('baseline')}
            aria-pressed={config.presetName === 'baseline'}
            className={`flex items-center justify-between p-2.5 text-xs rounded-lg border text-left transition-all ${
              config.presetName === 'baseline'
                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
            }`}
          >
            <div>
              <div className="font-medium">标准临床基线</div>
              <div className="text-[10px] text-slate-500 font-normal">无时限 · 零知觉噪点</div>
            </div>
            {config.presetName === 'baseline' && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" aria-hidden="true" />}
          </button>

          <button
            type="button"
            onClick={() => applyPreset('wm_stress')}
            aria-pressed={config.presetName === 'wm_stress'}
            className={`flex items-center justify-between p-2.5 text-xs rounded-lg border text-left transition-all ${
              config.presetName === 'wm_stress'
                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
            }`}
          >
            <div>
              <div className="font-medium">工作记忆高压</div>
              <div className="text-[10px] text-slate-500 font-normal">双任务探测(WCST) · 3s限时</div>
            </div>
            {config.presetName === 'wm_stress' && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" aria-hidden="true" />}
          </button>

          <button
            type="button"
            onClick={() => applyPreset('perceptual_noise')}
            aria-pressed={config.presetName === 'perceptual_noise'}
            className={`flex items-center justify-between p-2.5 text-xs rounded-lg border text-left transition-all ${
              config.presetName === 'perceptual_noise'
                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
            }`}
          >
            <div>
              <div className="font-medium">视知觉强干扰</div>
              <div className="text-[10px] text-slate-500 font-normal">高杂波掩蔽 · 无关特征</div>
            </div>
            {config.presetName === 'perceptual_noise' && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" aria-hidden="true" />}
          </button>

          <button
            type="button"
            onClick={() => applyPreset('high_load')}
            aria-pressed={config.presetName === 'high_load'}
            className={`flex items-center justify-between p-2.5 text-xs rounded-lg border text-left transition-all ${
              config.presetName === 'high_load'
                ? 'border-red-600 bg-red-50/70 text-red-950 font-semibold'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
            }`}
          >
            <div>
              <div className="font-medium flex items-center gap-1 text-red-700">
                <Zap className="w-3 h-3 text-red-600" aria-hidden="true" />
                极限过载压力
              </div>
              <div className="text-[10px] text-slate-500 font-normal">2.0s倒计时 · 双任务 · 强噪</div>
            </div>
            {config.presetName === 'high_load' && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Detailed Modulators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
        {/* Modulator 1: Time Pressure */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
              反应时限压迫 (Time Limit)
            </span>
            <span className="text-xs font-mono font-bold text-blue-700">
              {config.timeLimitSeconds === 0 ? '不设限 (Self-paced)' : `${config.timeLimitSeconds} 秒`}
            </span>
          </div>
          <div className="flex gap-1.5" role="group" aria-label="反应时限（秒）">
            {[0, 5.0, 3.0, 2.0, 1.5].map((sec) => (
              <button
                type="button"
                key={sec}
                onClick={() => onChange({ ...config, timeLimitSeconds: sec, presetName: 'custom' })}
                aria-pressed={config.timeLimitSeconds === sec}
                className={`flex-1 py-1 text-xs rounded font-mono transition-colors ${
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
            限制刺激呈现与加工时间，压榨前额叶瞬时反应资源。生效范围：{SCOPE.timeLimit}。
            超时记为“未反应 (omission)”，不产生反应时，也不计入非持续性错误。
          </p>
        </div>

        {/* Modulator 2: Perceptual Noise Level */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="perceptual-noise-slider" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
              知觉掩蔽噪点 (Visual Noise)
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
            aria-valuetext={`知觉噪声 ${config.perceptualNoiseLevel}%`}
            onChange={(e) =>
              onChange({ ...config, perceptualNoiseLevel: Number(e.target.value), presetName: 'custom' })
            }
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>清晰无噪 (0%)</span>
            <span>中度混淆 (40%)</span>
            <span>强高斯掩蔽 (80%)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">生效范围：{SCOPE.noise}。</p>
        </div>

        {/* Modulator 3: Working Memory & Interference */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-purple-600" aria-hidden="true" />
                双任务工作记忆探测
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  config.workingMemoryDistractor ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {config.workingMemoryDistractor ? '已启用 (Active)' : '已停用'}
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
              <span className="text-xs text-slate-700">随机穿插数字瞬时保持 (Dual-Task Probe)</span>
            </label>
            <p className="text-[11px] text-slate-500 mt-1">
              生效范围：{SCOPE.wmProbe}。数字呈现后间隔 4 次分类再要求回忆，可随时跳过。
            </p>
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
                  无关特征干扰叠加
                </span>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  生效范围：{SCOPE.distractor}。刺激区叠加静态无关几何图形（不参与分类规则）。
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
