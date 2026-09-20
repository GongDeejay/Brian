import React from 'react';
import { WPTCardCue } from '../types';

interface Props {
  cue: WPTCardCue;
  isActive: boolean;
  noiseLevel?: number;
}

export const WPTCardTarot: React.FC<Props> = ({ cue, isActive, noiseLevel = 0 }) => {
  const renderGeometricPattern = () => {
    switch (cue.pattern) {
      case 'triangular_mosaic':
        return (
          <svg viewBox="0 0 100 140" className="w-full h-full text-indigo-400">
            <polygon points="50,20 80,75 20,75" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <polygon points="50,75 80,130 20,130" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" />
            <polygon points="35,45 65,45 50,75" fill="currentColor" fillOpacity="0.6" />
            <circle cx="50" cy="75" r="4" fill="#fbbf24" />
          </svg>
        );
      case 'nested_diamonds':
        return (
          <svg viewBox="0 0 100 140" className="w-full h-full text-amber-400">
            <polygon points="50,15 85,70 50,125 15,70" fill="none" stroke="currentColor" strokeWidth="2" />
            <polygon points="50,35 72,70 50,105 28,70" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2" />
            <polygon points="50,52 62,70 50,88 38,70" fill="currentColor" fillOpacity="0.7" />
            <line x1="50" y1="15" x2="50" y2="125" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        );
      case 'radiating_stars':
        return (
          <svg viewBox="0 0 100 140" className="w-full h-full text-cyan-400">
            <circle cx="50" cy="70" r="42" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="50" cy="70" r="28" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="70" r="14" fill="currentColor" fillOpacity="0.3" />
            <circle cx="50" cy="70" r="5" fill="#f43f5e" />
            <line x1="50" y1="18" x2="50" y2="122" stroke="currentColor" strokeWidth="1.5" />
            <line x1="12" y1="70" x2="88" y2="70" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        );
      case 'geometric_grid':
        return (
          <svg viewBox="0 0 100 140" className="w-full h-full text-emerald-400">
            <rect x="20" y="30" width="60" height="80" fill="none" stroke="currentColor" strokeWidth="2" rx="4" />
            <line x1="20" y1="56" x2="80" y2="56" stroke="currentColor" strokeWidth="1.5" />
            <line x1="20" y1="83" x2="80" y2="83" stroke="currentColor" strokeWidth="1.5" />
            <line x1="50" y1="30" x2="50" y2="110" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="35" cy="43" r="5" fill="currentColor" fillOpacity="0.7" />
            <circle cx="65" cy="70" r="5" fill="currentColor" fillOpacity="0.7" />
            <circle cx="35" cy="97" r="5" fill="currentColor" fillOpacity="0.7" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative w-24 h-36 sm:w-28 sm:h-44 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-between p-2 select-none ${
        isActive
          ? 'bg-slate-800 border-indigo-500 shadow-lg scale-105 ring-2 ring-indigo-400/40'
          : 'bg-slate-900/60 border-slate-800 opacity-25 grayscale scale-95'
      }`}
    >
      {/* Card Header */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
        <span>塔罗 #{cue.id}</span>
        <span className="font-bold text-slate-300">{isActive ? '呈递' : '休眠'}</span>
      </div>

      {/* Geometric Artwork */}
      <div className="w-16 h-24 sm:w-20 sm:h-28 flex items-center justify-center">
        {renderGeometricPattern()}
      </div>

      {/* Card Label */}
      <div className="w-full text-center">
        <span className="text-[10px] text-slate-300 font-medium block truncate">{cue.name}</span>
      </div>

      {/* Noise filter if cognitive load active */}
      {noiseLevel > 0 && isActive && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none opacity-25"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '8px 8px',
          }}
        />
      )}
    </div>
  );
};
