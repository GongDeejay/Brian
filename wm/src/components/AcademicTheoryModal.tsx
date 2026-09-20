import { useEffect, useRef } from 'react';
import { Brain, Zap, CheckCircle, X } from 'lucide-react';

interface AcademicTheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TITLE_ID = 'academic-modal-title';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const AcademicTheoryModal = ({ isOpen, onClose }: AcademicTheoryModalProps) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const getFocusable = () =>
      Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = getFocusable();
      if (items.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const insideDialog = !!dialogRef.current && dialogRef.current.contains(active);

      if (event.shiftKey && (active === first || !insideDialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !insideDialog)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Body scroll lock while the dialog is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const initial =
      dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]') ?? getFocusable()[0];
    initial?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      // Restore focus to whatever opened the dialog.
      previouslyFocusedRef.current?.focus?.();
      previouslyFocusedRef.current = null;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        id="academic-modal-container"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        tabIndex={-1}
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-200 animate-scale-in outline-none"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Brain className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id={TITLE_ID} className="text-xl font-semibold text-white tracking-tight">工作记忆核心学术范式与认知神经基础</h2>
              <p className="text-xs text-slate-400">Working Memory Paradigms, Capacity Limits & Neuroplasticity</p>
            </div>
          </div>
          <button
            id="btn-close-academic-modal"
            data-autofocus
            onClick={onClose}
            aria-label="关闭学术范式说明"
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 space-y-6 text-sm leading-relaxed">
          {/* Concept summary */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <h3 className="text-base font-semibold text-indigo-300 flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-indigo-400" aria-hidden="true" />
              工作记忆 (Working Memory, WM) 的本质
            </h3>
            <p className="text-slate-300">
              工作记忆是人类大脑用于在短时间（几秒到数十秒）内<strong>保持（Storage）并同时加工（Processing）</strong>目标信息的容量有限系统，是阅读理解、逻辑推理、数学演算和决策控制等高阶认知行为的“中央处理器”。现代认知神经科学证实，工作记忆由背外侧前额叶皮层（DLPFC）、顶叶皮层以及基底节构成的额顶控制网络（FPN）协同驱动。
            </p>
          </div>

          {/* Paradigm 1 */}
          <div className="border border-slate-800 rounded-xl p-5 bg-slate-950/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                范式 1：动态刷新与抑制控制
              </span>
              <span className="text-xs text-slate-400 font-mono">Kirchner (1958)</span>
            </div>
            <h4 className="text-base font-semibold text-white mb-2">N-back 任务 (1-back / 2-back / 3-back)</h4>
            <p className="text-slate-300 mb-3">
              <strong>机制：</strong>受试者注视持续呈现的序列刺激（空间坐标、字母或符号），判断当前刺激是否与前面倒数第 <span className="font-mono text-indigo-300">N</span> 个刺激一致。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-400 font-semibold block mb-1">关键认知机制：</span>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  <li>信息动态编码入栈 (Encoding)</li>
                  <li>旧信息移出与遗忘 (Drop & Update)</li>
                  <li>干扰诱导与冲动抑制控制 (Inhibition)</li>
                </ul>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-1">统计量化指标：</span>
                <p className="text-slate-300 font-mono">
                  d' = Z(Hit) - Z(FA)
                </p>
                <p className="text-slate-400 mt-1">
                  采用信号检测论（SDT）敏度指数，有效剔除受试者的猜测偏好（Response Bias）。
                </p>
              </div>
            </div>
          </div>

          {/* Paradigm 2 */}
          <div className="border border-slate-800 rounded-xl p-5 bg-slate-950/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                范式 2：复杂加工与存储跨度
              </span>
              <span className="text-xs text-slate-400 font-mono">Turner & Engle (1989)</span>
            </div>
            <h4 className="text-base font-semibold text-white mb-2">复杂运算跨度 (Operation Span, OSPAN)</h4>
            <p className="text-slate-300 mb-3">
              <strong>机制：</strong>双任务范式（Dual-task）。受试者一边验证简单数学算式（加工负荷，例如 <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300">(4 × 2) - 3 = 5</code> 是/否），一边在算式后立即牢记目标字母（存储负荷）。在完整 Set 呈现后，必须严格按先后次序回忆出所有字母。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-400 font-semibold block mb-1">流体智力预测：</span>
                <p className="text-slate-300">
                  OSPAN 是目前学术界预测流体智力（Gf）、学术考试（如 SAT/GRE）以及高级问题解决能力最强悍的心理测量学工具之一。
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-1">有效性约束要求：</span>
                <p className="text-slate-300">
                  运算加工正确率必须维持在 <strong className="text-cyan-300">85% 以上</strong>，以证明受试者未通过主动放弃算术加工来单向换取记忆存储。
                </p>
              </div>
            </div>
          </div>

          {/* Paradigm 3 */}
          <div className="border border-slate-800 rounded-xl p-5 bg-slate-950/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                范式 3：视空间容量极限测定
              </span>
              <span className="text-xs text-slate-400 font-mono">Cowan (2001) / Luck & Vogel (1997)</span>
            </div>
            <h4 className="text-base font-semibold text-white mb-2">视觉变化检测 (Visual Change Detection & Cowan's K)</h4>
            <p className="text-slate-300 mb-3">
              <strong>机制：</strong>极短瞬间（100~150ms）闪烁一个多色方块阵列（集合大小 Set Size = 4, 6, 8），经过 1000ms 纯粹的工作记忆维持期后，探针重新呈现，判断高亮位置的方块颜色是否改变。
            </p>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-slate-400 font-semibold">Cowan's K 容量极限公式：</span>
                <span className="font-mono text-amber-400 font-bold text-sm">K = N × (H - F)</span>
              </div>
              <p className="text-slate-300">
                其中 <code className="text-amber-300">N</code> 为方块总数，<code className="text-amber-300">H</code> 为命中率（Hit: 改变且判断改变），<code className="text-amber-300">F</code> 为虚报率（False Alarm: 未改变却误判改变）。
                学术界普遍发现人类的视觉工作记忆离散表征槽位上限为 <strong>3 ~ 4 个独立客体</strong>。K 值为负表示判别低于随机水平，平台会如实呈现而不做 0 截断。
              </p>
            </div>
          </div>

          {/* Measurement-integrity note */}
          <div className="border border-indigo-800/40 bg-indigo-950/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-indigo-300 mb-2">评估模式为何不提供逐试次正误反馈？</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              标准学术评估版本的三类范式均<strong>不在试次层面告知对错</strong>：即时正误反馈会诱发策略调整、猜测偏好与情绪唤醒，从而污染容量与敏感度指标。
              因此平台默认使用「评估模式」（仅保留刺激起始提示音与注视点等朝向线索），「练习模式」才提供完整的逐试次文本与声音反馈。焦点丢失、切换标签页等意外中断也会被记录并随结果一并报告。
            </p>
          </div>

          {/* Training recommendations */}
          <div className="border border-emerald-800/40 bg-emerald-950/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-emerald-300 flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              日常训练与认知可塑性指南
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li><strong>自适应渐进式负荷：</strong>当 2-back 正确率突破 85% 时，勇敢切换至 3-back，迫使前额叶产生神经适应性重组。</li>
              <li><strong>间隔练习优于突击：</strong>每天 10~15 分钟的专注轮换训练比周末一次性练习更能稳定强化神经连接与突触修剪。</li>
              <li><strong>双任务耐受迁移：</strong>定期进行 OSPAN 训练，可显著提升在日常生活工作中面对多线程打扰时的专注力与抗分心能力。</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            id="btn-modal-understand"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            我已知悉，返回训练
          </button>
        </div>
      </div>
    </div>
  );
};
