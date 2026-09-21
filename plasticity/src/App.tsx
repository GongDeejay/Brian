import React, { useEffect, useState } from 'react';
import { 
  HeaderNav, 
  ActiveTab 
} from './components/HeaderNav';
import { MindMapCanvas } from './components/MindMapCanvas';
import { SynapticSimulator } from './components/SynapticSimulator';
import { PracticeProtocolTracker } from './components/PracticeProtocolTracker';
import { NodeDetailDrawer } from './components/NodeDetailDrawer';
import { DisclaimerModal } from './components/DisclaimerModal';
import { 
  NEUROPLASTICITY_MINDMAP, 
  CATEGORY_CONFIG 
} from './data/neuroplasticityData';
import { 
  NEUROPLASTICITY_MINDMAP_EN, 
  CATEGORY_CONFIG_EN 
} from './data/neuroplasticityDataEn';
import { Language, TRANSLATIONS } from './data/translations';
import { MindMapNode } from './types';
import { 
  Sparkles, 
  BookOpen, 
  Zap, 
  ChevronRight, 
  X, 
  Target,
  Scale,
  ShieldAlert,
  Globe
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = window.localStorage.getItem('brian.lang');
      if (saved === 'en' || saved === 'zh') return saved;
    } catch {
      /* private mode */
    }
    const nav = (typeof navigator !== 'undefined' ? navigator.language : 'zh').toLowerCase();
    return nav.indexOf('zh') === 0 ? 'zh' : 'en';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('mindmap');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [actionPlanList, setActionPlanList] = useState<MindMapNode[]>([]);
  const [showBookIntroModal, setShowBookIntroModal] = useState<boolean>(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState<boolean>(false);

  const t = TRANSLATIONS[lang];
  const currentTree = lang === 'en' ? NEUROPLASTICITY_MINDMAP_EN : NEUROPLASTICITY_MINDMAP;
  const categories = lang === 'en' ? CATEGORY_CONFIG_EN : CATEGORY_CONFIG;

  // Helper to find node by id within specific tree
  const findNodeById = (id: string, current: MindMapNode = currentTree): MindMapNode | null => {
    if (current.id === id) return current;
    if (current.children) {
      for (const child of current.children) {
        const found = findNodeById(id, child);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    try {
      window.localStorage.setItem('brian.lang', lang);
    } catch {
      /* private mode */
    }
  }, [lang]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'brian.lang' && (event.newValue === 'zh' || event.newValue === 'en')) {
        setLang(event.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleToggleLanguage = () => {
    const nextLang: Language = lang === 'zh' ? 'en' : 'zh';
    setLang(nextLang);

    // Synchronize selectedNode to the corresponding node in the new language if active
    if (selectedNode) {
      const nextTree = nextLang === 'en' ? NEUROPLASTICITY_MINDMAP_EN : NEUROPLASTICITY_MINDMAP;
      const equivalentNode = findNodeById(selectedNode.id, nextTree);
      if (equivalentNode) {
        setSelectedNode(equivalentNode);
      }
    }
  };

  const handleSelectNodeById = (id: string) => {
    const node = findNodeById(id, currentTree);
    if (node) {
      setSelectedNode(node);
    }
  };

  const handleAddToActionPlan = (node: MindMapNode) => {
    if (actionPlanList.some(n => n.id === node.id)) {
      setActionPlanList(prev => prev.filter(n => n.id !== node.id));
    } else {
      setActionPlanList(prev => [...prev, node]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header & Sticky Navigation */}
      <HeaderNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onOpenQuickIntro={() => setShowBookIntroModal(true)}
        onOpenDisclaimer={() => setShowDisclaimerModal(true)}
        lang={lang}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* TAB 1: Mind Map View */}
        {activeTab === 'mindmap' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Contextual Book Rationale Ribbon */}
            <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                    {t.ribbonTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                    {t.ribbonDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="btn-open-book-intro"
                  onClick={() => setShowBookIntroModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  {t.btnBookIntro}
                </button>
                <button
                  id="btn-open-simulator-from-ribbon"
                  onClick={() => setActiveTab('simulator')}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  {t.btnEnterSimulator}
                </button>
              </div>
            </div>

            {/* The Interactive Mind Map Canvas */}
            <MindMapCanvas
              rootNode={currentTree}
              onSelectNode={setSelectedNode}
              selectedNodeId={selectedNode?.id}
              searchQuery={searchQuery}
              activeCategoryFilter={activeCategory}
              lang={lang}
            />

            {/* Six Key Pillars Quick Navigation Strip */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-500" />
                  {t.pillarsStripTitle}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentTree.children?.map(branch => {
                  const catCfg = categories[branch.category] || categories.paradigm;
                  return (
                    <div
                      key={branch.id}
                      onClick={() => setSelectedNode(branch)}
                      className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/90 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all cursor-pointer shadow-2xs group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-md border"
                            style={{
                              borderColor: `${catCfg.accent}40`,
                              color: catCfg.accent,
                              backgroundColor: `${catCfg.accent}12`,
                            }}
                          >
                            {catCfg.label}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {branch.children?.length || 0} {t.pillarsSubMechanisms}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {branch.label}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                          {branch.shortDesc}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        <span>{t.pillarsInspectAction}</span>
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Synaptic Simulator */}
        {activeTab === 'simulator' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <SynapticSimulator lang={lang} />
          </div>
        )}

        {/* TAB 3: Practical Protocols Tracker */}
        {activeTab === 'protocols' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <PracticeProtocolTracker
              customActions={actionPlanList}
              onOpenNodeDetail={handleSelectNodeById}
              lang={lang}
            />
          </div>
        )}
      </main>

      {/* Slide-in Node Detail Drawer */}
      {selectedNode && (
        <>
          <div
            onClick={() => setSelectedNode(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity cursor-pointer"
            aria-hidden="true"
          />
          <NodeDetailDrawer
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onSelectNode={handleSelectNodeById}
            onAddToActionPlan={handleAddToActionPlan}
            isAddedToPlan={actionPlanList.some(n => n.id === selectedNode.id)}
            lang={lang}
          />
        </>
      )}

      {/* Book Intro Modal */}
      {showBookIntroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {lang === 'en' 
                    ? '"The Brain That Changes Itself" Scientific Context' 
                    : '《神经可塑性》原著精要与科学背景'}
                </h3>
              </div>
              <button
                onClick={() => setShowBookIntroModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              {lang === 'en' ? (
                <>
                  <p>
                    <strong>"The Brain That Changes Itself" (Neuroplasticity)</strong> documents the revolutionary paradigm shift in modern neuroscience. For four centuries, mainstream medical doctrine maintained that the adult brain was a rigid mechanical apparatus, locked into place after early childhood. Damage from stroke or trauma was deemed immutable.
                  </p>
                  <p>
                    Groundbreaking researchers including Norman Doidge, Moheb Costandi, and Michael Merzenich decisively proved that the brain possesses lifelong anatomical plasticity:
                  </p>
                  <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-xs space-y-1.5 text-zinc-800 dark:text-zinc-200">
                    <div><strong>1. Structure follows function:</strong> Deliberate focus physically expands cortical territory, sprouts dendritic spines, and wraps axons in protective myelin.</div>
                    <div><strong>2. Adult neurogenesis:</strong> The human hippocampus births new neurons throughout life; aerobic exercise and novelty are the strongest catalysts.</div>
                    <div><strong>3. Mental rehearsal reshapes anatomy:</strong> Vivid first-person motor imagery activates identical motor networks to physical movement.</div>
                    <div><strong>4. Beware the Plastic Paradox:</strong> Plasticity agnostically hardwires addictive loops and phantom pain with the same fidelity as mastery.</div>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    <strong>《神经可塑性》（Neuroplasticity）</strong>是近现代认知神经科学领域最震撼人心的革命性发现。在过去数百年中，医学界一直坚信大脑如同时钟机械一样，结构由基因决定且成年后不可变更；一旦中风损伤或神经元退化，便面临无法逆转的宿命。
                  </p>
                  <p>
                    然而，诺曼·道伊奇（Norman Doidge）、莫赫布·科斯塔迪（Moheb Costandi）、迈克尔·梅泽尼奇（Michael Merzenich）等科学家通过大量严谨的动物与临床实验证实：
                  </p>
                  <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-xs space-y-1.5 text-zinc-800 dark:text-zinc-200">
                    <div><strong>1. 结构追随功能：</strong>每一次持续专注与练习，都会让对应皮层物理扩张，树突棘新生，轴突包裹更厚髓鞘。</div>
                    <div><strong>2. 神经发生终身持续：</strong>成人的海马体每天都在产生崭新的神经元，运动与新异刺激是最佳催化剂。</div>
                    <div><strong>3. 意念同样塑造解剖：</strong>生动的心理演练与物理实践激活同等运动网络，纯粹想象即可改变突触连接。</div>
                    <div><strong>4. 警惕可塑性悖论：</strong>神经可塑性也是成瘾、慢性疼痛与负面反刍思维被牢牢焊死的生理根源。</div>
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowBookIntroModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
              >
                {lang === 'en' ? 'Start Exploring Mind Map' : '开始探索思维导图'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer Modal */}
      <DisclaimerModal
        isOpen={showDisclaimerModal}
        onClose={() => setShowDisclaimerModal(false)}
        lang={lang}
      />

      {/* Footer with Legal & Medical Notice */}
      <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 hidden sm:block" />
            <span>{t.footerNote}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              id="btn-footer-open-disclaimer"
              onClick={() => setShowDisclaimerModal(true)}
              className="font-medium text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{t.disclaimerTitle}</span>
            </button>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <button
              onClick={handleToggleLanguage}
              className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'zh' ? 'English Version' : '中文版本'}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
