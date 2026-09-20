import { Brain, Volume2, VolumeX, BookOpen, BarChart3, Layers, Calculator, Eye, Download } from 'lucide-react';
import { TaskType } from '../types/wm';

interface HeaderProps {
  activeTab: TaskType;
  onSelectTab: (tab: TaskType) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenTheory: () => void;
}

// The app is served from a sub-path (https://brian.mplusm.site/wm/), so the ZIP
// asset must be resolved against Vite's base URL, not the domain root.
const ZIP_URL = `${import.meta.env.BASE_URL}working-memory-training.zip`;

export const Header = ({
  activeTab,
  onSelectTab,
  isMuted,
  onToggleMute,
  onOpenTheory,
}: HeaderProps) => {
  const tabs = [
    {
      id: 'nback' as TaskType,
      label: 'N-back 动态刷新',
      sub: 'Kirchner (1958)',
      icon: Layers,
      color: 'text-indigo-400',
      activeBg: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300',
    },
    {
      id: 'ospan' as TaskType,
      label: 'OSPAN 复杂运算跨度',
      sub: 'Turner & Engle (1989)',
      icon: Calculator,
      color: 'text-cyan-400',
      activeBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
    },
    {
      id: 'change_detection' as TaskType,
      label: '视觉变化检测 (K值)',
      sub: 'Cowan (2001)',
      icon: Eye,
      color: 'text-amber-400',
      activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
    },
    {
      id: 'dashboard' as TaskType,
      label: '认知画像与报告',
      sub: '综合评测与雷达图',
      icon: BarChart3,
      color: 'text-emerald-400',
      activeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
    },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-white tracking-tight">工作记忆认知训练与评估系统</h1>
                  <span className="hidden sm:inline-flex text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                    WM Paradigm Lab
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  前额叶皮层激活 · 动态更新与抑制控制 · 复杂双任务加工 · 视空间容量极限
                </p>
              </div>
            </div>

            {/* Mobile action controls */}
            <div className="flex md:hidden items-center gap-2">
              <a
                id="btn-download-zip-mobile"
                href={ZIP_URL}
                download="working-memory-training.zip"
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60"
                title="下载项目源码 ZIP"
                aria-label="下载项目源码 ZIP"
              >
                <Download className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              </a>
              <button
                id="btn-sound-toggle-mobile"
                onClick={onToggleMute}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60"
                title={isMuted ? '取消静音' : '静音'}
                aria-label={isMuted ? '取消静音' : '静音'}
                aria-pressed={isMuted}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" aria-hidden="true" /> : <Volume2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />}
              </button>
              <button
                id="btn-open-theory-mobile"
                onClick={onOpenTheory}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60"
                title="学术范式理论"
                aria-label="打开学术范式理论"
              >
                <BookOpen className="w-4 h-4 text-indigo-400" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Desktop Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <a
              id="btn-download-zip-desktop"
              href={ZIP_URL}
              download="working-memory-training.zip"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 hover:text-cyan-200 text-xs font-medium border border-cyan-700/50 transition shadow-sm"
              title="一键打包下载完整工程源码 ZIP"
            >
              <Download className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span>下载源码 (ZIP)</span>
            </a>
            <button
              id="btn-open-theory-desktop"
              onClick={onOpenTheory}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/60 transition shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" aria-hidden="true" />
              <span>学术原理与范式文献</span>
            </button>
            <button
              id="btn-sound-toggle-desktop"
              onClick={onToggleMute}
              aria-pressed={isMuted}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/60 transition shadow-sm"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" aria-hidden="true" />
                  <span className="text-slate-400">音效已静音</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  <span className="text-slate-300">实验音效开启</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Paradigm navigation tabs */}
        <div
          role="tablist"
          aria-label="范式与报告导航"
          className="mt-3.5 pt-2 border-t border-slate-800/80 flex overflow-x-auto no-scrollbar gap-2"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-nav-${tab.id}`}
                role="tab"
                aria-selected={isActive}
                aria-label={`${tab.label}（${tab.sub}）`}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? `${tab.activeBg} font-semibold shadow-inner`
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-slate-400'}`} aria-hidden="true" />
                <div className="text-left">
                  <div className={isActive ? 'text-white' : ''}>{tab.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{tab.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
