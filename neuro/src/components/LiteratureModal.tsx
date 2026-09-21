import React from 'react';
import { BookOpen, X, Brain, Layers, Cpu, ArrowLeft } from 'lucide-react';
import { useDialogA11y } from '../hooks/useDialogA11y';
import { useI18n, type MessageKey } from '../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/** One academic section: title, optional tag badge, and labelled paragraphs. */
interface Section {
  id: string;
  icon: typeof Brain;
  iconClass: string;
  titleKey: MessageKey;
  tagKey?: MessageKey;
  tagClass?: string;
  blocks: { labelKey?: MessageKey; bodyKey: MessageKey }[];
  /** Reference keys rendered under a shared "References:" label. */
  refKeys?: MessageKey[];
}

const SECTIONS: Section[] = [
  {
    id: 'wcst',
    icon: Brain,
    iconClass: 'text-emerald-600',
    titleKey: 'lit.wcst.title',
    tagKey: 'lit.wcst.tag',
    tagClass: 'text-emerald-700 bg-emerald-100',
    blocks: [
      { labelKey: 'lit.wcst.circuitLabel', bodyKey: 'lit.wcst.circuit' },
      { labelKey: 'lit.wcst.mechanismLabel', bodyKey: 'lit.wcst.mechanism' },
    ],
    refKeys: ['lit.ref.grant1948', 'lit.ref.heaton1993'],
  },
  {
    id: 'wpt',
    icon: Cpu,
    iconClass: 'text-blue-600',
    titleKey: 'lit.wpt.title',
    tagKey: 'lit.wpt.tag',
    tagClass: 'text-blue-700 bg-blue-100',
    blocks: [
      { labelKey: 'lit.wpt.circuitLabel', bodyKey: 'lit.wpt.circuit' },
      { labelKey: 'lit.wpt.mechanismLabel', bodyKey: 'lit.wpt.mechanism' },
    ],
    refKeys: ['lit.ref.knowlton1996', 'lit.ref.poldrack2001'],
  },
  {
    id: 'ided',
    icon: Layers,
    iconClass: 'text-indigo-600',
    titleKey: 'lit.ided.title',
    tagKey: 'lit.ided.tag',
    tagClass: 'text-indigo-700 bg-indigo-100',
    blocks: [
      { labelKey: 'lit.ided.circuitLabel', bodyKey: 'lit.ided.circuit' },
      { labelKey: 'lit.ided.mechanismLabel', bodyKey: 'lit.ided.mechanism' },
    ],
    refKeys: ['lit.ref.robbins1998', 'lit.ref.dias1996'],
  },
];

/** The two short paradigm cards shown side by side. */
const SHORT_CARDS: { id: string; titleKey: MessageKey; bodyKey: MessageKey; refKey: MessageKey }[] = [
  {
    id: 'covis',
    titleKey: 'lit.covis.title',
    bodyKey: 'lit.covis.body',
    refKey: 'lit.ref.ashby2005',
  },
  {
    id: 'posner',
    titleKey: 'lit.posner.title',
    bodyKey: 'lit.posner.body',
    refKey: 'lit.ref.posner1968',
  },
];

/** Cognitive-load theory closing block, in reading order. */
const CLT_BLOCKS: { labelKey?: MessageKey; bodyKey: MessageKey }[] = [
  { labelKey: 'lit.clt.intrinsicLabel', bodyKey: 'lit.clt.intrinsic' },
  { labelKey: 'lit.clt.extraneousLabel', bodyKey: 'lit.clt.extraneous' },
  { labelKey: 'lit.clt.germaneLabel', bodyKey: 'lit.clt.germane' },
];

export const LiteratureModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const { panelRef, handleBackdropMouseDown } = useDialogA11y({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="literature-modal-title"
        tabIndex={-1}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 text-slate-800 animate-modal-in outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center" aria-hidden="true">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 id="literature-modal-title" className="text-base font-bold text-slate-900">
                {t('lit.title')}
              </h3>
              <p className="text-xs text-slate-500">{t('lit.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('lit.close')}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed text-slate-600">
          {/* Sections 1–3: WCST, WPT, CANTAB ID/ED */}
          {SECTIONS.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={section.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Icon className={`w-4 h-4 ${section.iconClass}`} aria-hidden="true" />
                    {`${index + 1}. ${t(section.titleKey)}`}
                  </span>
                  {section.tagKey && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded whitespace-nowrap ${section.tagClass}`}>
                      {t(section.tagKey)}
                    </span>
                  )}
                </div>
                {section.blocks.map((block) => (
                  <p key={block.bodyKey} className="text-slate-700 mb-2">
                    {block.labelKey && <strong>{t(block.labelKey)}</strong>}
                    {t(block.bodyKey)}
                  </p>
                ))}
                {section.refKeys && (
                  <p className="text-slate-600">
                    <strong>{t('lit.refs.lead')}</strong>
                    <br />
                    {section.refKeys.map((key) => (
                      <React.Fragment key={key}>
                        • {t(key)}
                        <br />
                      </React.Fragment>
                    ))}
                  </p>
                )}
              </div>
            );
          })}

          {/* Sections 4–5: COVIS and Posner prototypes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SHORT_CARDS.map((card, index) => (
              <div key={card.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">{`${index + 4}. ${t(card.titleKey)}`}</span>
                <p className="text-slate-600 mb-1.5">{t(card.bodyKey)}</p>
                <p className="text-slate-500 text-[11px]">{t(card.refKey)}</p>
              </div>
            ))}
          </div>

          {/* Section 6: Cognitive Load Modulation */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-indigo-950">
            <span className="font-bold block mb-1 text-indigo-900">{`6. ${t('lit.clt.title')}`}</span>
            <p className="text-slate-700">
              {t('lit.clt.intro')}
              {CLT_BLOCKS.map((block) => (
                <React.Fragment key={block.bodyKey}>
                  <br />• {block.labelKey && <strong>{t(block.labelKey)}</strong>}
                  {t(block.bodyKey)}
                </React.Fragment>
              ))}
            </p>
            <p className="text-slate-700 mt-2 text-[11px]">{t('lit.clt.caution')}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50 rounded-b-2xl">
          <span className="text-xs text-slate-500">{t('lit.footerNote')}</span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            {t('lit.back')}
          </button>
        </div>
      </div>
    </div>
  );
};
