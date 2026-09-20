import React from 'react';
import { BookOpen, X, Brain, Layers, Cpu } from 'lucide-react';
import { useDialogA11y } from '../hooks/useDialogA11y';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LiteratureModal: React.FC<Props> = ({ isOpen, onClose }) => {
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
                认知神经科学分类与模式识别文献全景
              </h3>
              <p className="text-xs text-slate-500">学术经典测验、神经回路映射与认知负荷调控理论文献</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭文献窗口"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed text-slate-600">
          {/* Section 1: WCST */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-emerald-600" />
                1. 威斯康星卡片分类测验 (WCST, Wisconsin Card Sorting Test)
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                黄金标准 / 执行功能
              </span>
            </div>
            <p className="text-slate-700 mb-2">
              <strong>神经回路：</strong>背外侧前额叶皮层 (DLPFC, 假设生成与工作记忆维持) + 前扣带回皮层 (ACC, 冲突检测与负反馈监控) + 尾状体。
            </p>
            <p className="text-slate-600 mb-2">
              <strong>核心机制：</strong>在无明示规则下，受试者根据反馈在工作记忆中激活三维特征（颜色、形状、数量）并推导当前假设。在连续 10 次正确后发生暗中转换。
            </p>
            <p className="text-slate-600">
              <strong>文献引用：</strong>
              <br />• Grant, D. A., & Berg, E. (1948). A behavioral analysis of degree of reinforcement and ease of shifting to new responses in a Weigl-type card-sorting problem. <em>Journal of Experimental Psychology</em>, 38(4), 404.
              <br />• Heaton, R. K., et al. (1993). <em>Wisconsin Card Sorting Test Manual: Revised and Expanded</em>. Psychological Assessment Resources.
            </p>
          </div>

          {/* Section 2: WPT */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-600" />
                2. 天气预测任务 (Weather Prediction Task, WPT)
              </span>
              <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                概率分类 / 纹状体内隐学习
              </span>
            </div>
            <p className="text-slate-700 mb-2">
              <strong>神经回路：</strong>基底神经节/纹状体 (Striatum - 尾状体与壳核，程序性与内隐联结) 与内侧颞叶/海马体 (MTL - 陈述性记忆) 的双分离。
            </p>
            <p className="text-slate-600 mb-2">
              <strong>核心机制：</strong>各线索以概率方式关联天气结果（如0.756、0.575、0.425、0.244）。受试者无法用单一命题逻辑解决，基底核通过多巴胺强化信号内隐调整突触权重。Poldrack等（2001, Nature）通过fMRI证实随着试验进行，激活由内侧颞叶逐渐转移至纹状体。
            </p>
            <p className="text-slate-600">
              <strong>文献引用：</strong>
              <br />• Knowlton, B. J., Mangels, J. A., & Squire, L. R. (1996). A neostriatal habit learning system in humans. <em>Science</em>, 273(5280), 1399-1402.
              <br />• Poldrack, R. A., et al. (2001). Interactive memory systems in the human brain. <em>Nature</em>, 414(6863), 546-550.
            </p>
          </div>

          {/* Section 3: CANTAB ID/ED */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                3. 注意定势转移测验 (CANTAB ID/ED Set Shifting)
              </span>
              <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                选择性注意 / 维度惰性
              </span>
            </div>
            <p className="text-slate-700 mb-2">
              <strong>神经回路：</strong>眶额皮层 (OFC - 逆转学习与奖励价值翻转) vs 外侧前额叶皮层 (LPFC - 跨维度的 Extra-Dimensional Shift)。
            </p>
            <p className="text-slate-600 mb-2">
              <strong>核心机制：</strong>7个连续阶段，逐步从简单形状辨别 (SD)、复合辨别 (CD) 推进至 EDS。在 EDS 阶段，受试者必须克服对原维度的注意粘滞性，自上而下将注意焦点重定向至无关的线条维度。
            </p>
            <p className="text-slate-600">
              <strong>文献引用：</strong>
              <br />• Robbins, T. W., et al. (1998). Neural systems underlying attentional set-shifting in rodents and primates. <em>Psychopharmacology</em>, 134, 1-18.
              <br />• Dias, R., Robbins, T. W., & Roberts, A. C. (1996). Dissociation in prefrontal cortex of affective and attentional shifts. <em>Nature</em>, 380(6569), 69-72.
            </p>
          </div>

          {/* Section 4: Ashby COVIS & Posner Prototype */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1">
                4. 双系统竞争理论 (Ashby COVIS Model)
              </span>
              <p className="text-slate-600 mb-1.5">
                比较 Rule-Based (RB, 显式语言前额叶) 与 Information-Integration (II, 无法言语概括的皮质-纹状体突触整合)。
              </p>
              <p className="text-slate-500 text-[11px]">
                Ashby, F. G., & Maddox, W. T. (2005). Human category learning. <em>Annu. Rev. Psychol.</em>, 56, 149-178.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1">
                5. 点阵原型抽象 (Posner & Keele, 1968)
              </span>
              <p className="text-slate-600 mb-1.5">
                训练仅使用高斯畸变，测试未见原型。验证大脑形成“中心原型图式 (Central Tendency)”而非孤立记忆样本。
              </p>
              <p className="text-slate-500 text-[11px]">
                Posner, M. I., & Keele, S. W. (1968). On the genesis of abstract ideas. <em>J. Exp. Psychol.</em>, 77(3), 353.
              </p>
            </div>
          </div>

          {/* Section 5: Cognitive Load Modulation */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-indigo-950">
            <span className="font-bold block mb-1 text-indigo-900">
              6. 认知负荷调节理论 (Cognitive Load Theory in Category Learning)
            </span>
            <p className="text-slate-700">
              系统目前提供以下三类可调的负荷操控（面板中已逐项标注其实际生效的测验范围）：
              <br />• <strong>内在负荷 (Intrinsic Load)：</strong>各任务的特征维度数在版本内固定（WCST 为颜色/形状/数量 3 维，ID/ED 为图形/线条 2 维），
              <strong>当前版本不提供维度数量的在线调节</strong>；早期版本文案中“2 维至 4 维可调”的说法已移除，因为该功能并不存在。
              <br />• <strong>外在负荷 (Extraneous Load)：</strong>刺激上叠加的像素级高斯知觉噪声，以及在刺激区叠加的静态无关几何图形（不参与任何分类规则）。
              <br />• <strong>工作记忆与时限压迫 (Germane / Time Pressure)：</strong>WCST 的 3 位数字瞬时保持双任务探测（呈现后间隔 4 次分类再回忆，可跳过），以及 WCST/WPT 的 1.5s~5.0s 反应时限（超时记为未反应）。
            </p>
            <p className="text-slate-700 mt-2 text-[11px]">
              注意：以上操控均未做操控效度（manipulation check）检验，因此“负荷升高”只代表刺激/时限参数改变，不能直接等同于某种确定的认知负荷水平。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-2xl">
          <span className="text-xs text-slate-500">NeuroClassify v2.4 · 遵循国际认知心理学与神经科学标准</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            返回测验
          </button>
        </div>
      </div>
    </div>
  );
};
