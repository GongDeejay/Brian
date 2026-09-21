import React from 'react';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Quote, 
  Tag, 
  Layers, 
  ChevronRight,
  Zap,
  Target
} from 'lucide-react';
import { MindMapNode } from '../types';
import { CATEGORY_CONFIG } from '../data/neuroplasticityData';
import { CATEGORY_CONFIG_EN } from '../data/neuroplasticityDataEn';
import { Language, TRANSLATIONS } from '../data/translations';

interface NodeDetailDrawerProps {
  node: MindMapNode | null;
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
  onAddToActionPlan?: (node: MindMapNode) => void;
  isAddedToPlan?: boolean;
  lang?: Language;
}

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
  node,
  onClose,
  onSelectNode,
  onAddToActionPlan,
  isAddedToPlan = false,
  lang = 'zh',
}) => {
  if (!node) return null;

  const t = TRANSLATIONS[lang];
  const categories = lang === 'en' ? CATEGORY_CONFIG_EN : CATEGORY_CONFIG;
  const catConfig = categories[node.category] || categories.paradigm;

  const getImportanceLabel = () => {
    if (node.importance === 'core') return t.importanceCore;
    if (node.importance === 'high') return t.importanceHigh;
    return t.importancePractice;
  };

  return (
    <div 
      id="node-detail-drawer" 
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] lg:w-[540px] bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out"
    >
      {/* Drawer Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-950/60">
        <div className="flex items-center gap-2">
          <span 
            className="text-xs px-2.5 py-1 rounded-full font-semibold border flex items-center gap-1"
            style={{ 
              borderColor: catConfig.accent, 
              color: catConfig.accent,
              backgroundColor: `${catConfig.accent}15`
            }}
          >
            {catConfig.label}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
            {getImportanceLabel()}
          </span>
        </div>

        <button
          id="btn-close-drawer"
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label={t.closeDrawer}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body - Scrollable */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
        {/* Title and Short Description */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
            {node.label}
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
            {node.shortDesc}
          </p>
        </div>

        {/* Core Principle Card */}
        <div className="rounded-xl p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-indigo-500" />
            {t.corePrincipleTitle}
          </div>
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
            {node.details.keyPrinciple}
          </p>
        </div>

        {/* Detailed Explanation */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {t.scientificExplanationTitle}
          </h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {node.details.summary}
          </p>
        </div>

        {/* Classic Scientific Experiment / Case */}
        {node.details.scientificExperiment && (
          <div className="rounded-xl p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {t.classicExperimentTitle}
            </div>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {node.details.scientificExperiment}
            </p>
          </div>
        )}

        {/* Practical Action Protocol */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-cyan-500" />
            {t.actionProtocolTitle}
          </h3>
          <div className="space-y-2.5">
            {node.details.actionProtocol.map((protocol, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 shadow-2xs"
              >
                <div className="mt-0.5 w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 flex items-center justify-center shrink-0 font-bold text-xs">
                  {idx + 1}
                </div>
                <div className="leading-relaxed">
                  {protocol}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Book Quote */}
        {node.details.neuroQuote && (
          <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-l-4 border-indigo-500 space-y-1">
            <Quote className="w-4 h-4 text-indigo-400" />
            <p className="text-xs sm:text-sm italic text-zinc-700 dark:text-zinc-300 leading-relaxed font-serif">
              {node.details.neuroQuote}
            </p>
          </div>
        )}

        {/* Sub-branches / Child Nodes navigation */}
        {node.children && node.children.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              {t.subMechanismsTitle} ({node.children.length})
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {node.children.map(child => (
                <button
                  key={child.id}
                  onClick={() => onSelectNode(child.id)}
                  className="p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-between text-left transition-all cursor-pointer group"
                >
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {child.label}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                      {child.shortDesc}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {node.details.tags.map((tg, idx) => (
            <span 
              key={idx}
              className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center gap-1"
            >
              <Tag className="w-2.5 h-2.5" />
              {tg}
            </span>
          ))}
        </div>
      </div>

      {/* Drawer Action Bar */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 flex items-center justify-between gap-3">
        {onAddToActionPlan && (
          <button
            id="btn-add-action-plan"
            onClick={() => onAddToActionPlan(node)}
            className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isAddedToPlan
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isAddedToPlan ? t.btnAddedToPlan : t.btnAddToPlan}
          </button>
        )}
      </div>
    </div>
  );
};
