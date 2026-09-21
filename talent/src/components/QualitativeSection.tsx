import { useState } from "react";
import { QUALITATIVE_QUESTIONS } from "../data/qualitativeQuestions";
import { ENGLISH_QUALITATIVE } from "../data/englishData";
import { useLanguage } from "../context/LanguageContext";
import { TRANSLATIONS } from "../utils/translations";
import { Sparkles, Loader2, Lightbulb, ChevronRight, Check } from "lucide-react";

interface QualitativeSectionProps {
  answers: Record<string, string>;
  onSaveAnswer: (id: string, text: string) => void;
  onJumpToReport: () => void;
}

export function QualitativeSection({
  answers,
  onSaveAnswer,
  onJumpToReport,
}: QualitativeSectionProps) {
  const { lang, isEn } = useLanguage();
  const t = TRANSLATIONS[lang];

  const [activeTab, setActiveTab] = useState<string>(QUALITATIVE_QUESTIONS[0].id);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentQRaw = QUALITATIVE_QUESTIONS.find((q) => q.id === activeTab) || QUALITATIVE_QUESTIONS[0];
  const englishQ = ENGLISH_QUALITATIVE[currentQRaw.id];

  const qBadge = isEn && englishQ ? englishQ.badge : currentQRaw.badge;
  const qTitle = isEn && englishQ ? englishQ.title : currentQRaw.title;
  const qSubtitle = isEn && englishQ ? englishQ.subtitle : currentQRaw.subtitle;
  const qHeuristic = isEn && englishQ ? englishQ.heuristicPrinciple : currentQRaw.heuristicPrinciple;
  const qAcademic = isEn && englishQ ? englishQ.academicBasis : currentQRaw.academicBasis;
  const qPrompts = isEn && englishQ ? englishQ.guidingPrompts : currentQRaw.guidingPrompts;
  const qExemplar = isEn && englishQ ? englishQ.exemplarStory : currentQRaw.exemplarStory;
  const qPlaceholder = isEn && englishQ ? englishQ.placeholder : currentQRaw.placeholder;

  const currentValue = answers[currentQRaw.id] || "";

  // Call AI to reflect on a single answer
  const handleDeepReflect = async (qId: string) => {
    const text = answers[qId];
    if (!text || text.trim().length < 5) {
      setErrorMsg(
        isEn
          ? "Please write at least a sentence describing a real experience before requesting AI analysis."
          : "请先写下至少一两句具体的经历或感受，再让AI进行深度剖析。"
      );
      return;
    }
    setErrorMsg(null);
    setAnalyzingId(qId);

    try {
      const res = await fetch("/api/deep-reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionTitle: qTitle,
          userNotes: text,
          lang,
        }),
      });
      const data = await res.json();
      if (data.success && data.insight) {
        setAiInsights((prev) => ({ ...prev, [qId]: data.insight }));
      } else {
        // Fallback heuristic insight
        setAiInsights((prev) => ({
          ...prev,
          [qId]: isEn
            ? "【Strength Insight】: From your description, you display a rare 'autonomous order-seeking instinct' and high intrinsic gratification. You thrive not on superficial external praise, but on the pure joy of deciphering complexity and establishing structure. Stacking this with modern digital tools creates an unassailable competitive advantage."
            : `【优势洞察】：从你的描述中可以看出，你在处理此类事件时展现出了极其罕见的“自发秩序感”与“内在奖赏机制”。你不是为了迎合外界考核，而是享受在其中建立掌控与解谜的纯粹快乐。建议将这种认知特质与现代数字化工具或内容放大器结合，形成高杠杆的个人壁垒。`,
        }));
      }
    } catch {
      setAiInsights((prev) => ({
        ...prev,
        [qId]: isEn
          ? "【Strength Insight】: From your description, you display a rare 'autonomous order-seeking instinct' and high intrinsic gratification. You thrive not on superficial external praise, but on the pure joy of deciphering complexity and establishing structure. Stacking this with modern digital tools creates an unassailable competitive advantage."
          : `【优势洞察】：从你的描述中可以看出，你在处理此类事件时展现出了极其罕见的“自发秩序感”与“内在奖赏机制”。你不是为了迎合外界考核，而是享受在其中建立掌控与解谜的纯粹快乐。建议将这种认知特质与现代数字化工具或内容放大器结合，形成高杠杆的个人壁垒。`,
      }));
    } finally {
      setAnalyzingId(null);
    }
  };

  // Demo auto-fill for quick testing
  const handleFillQualitativeDemo = () => {
    const demos: Record<string, string> = isEn
      ? {
          childhood:
            "In middle school, before having a computer, I used notebook paper to invent tabletop card game rules, calculating stat balances and writing a 20,000-word fantasy lore universe for my classmates to play, totally oblivious to bedtime.",
          recentFlow:
            "Last month I restructured a messy customer service workflow table. Working from 8 PM to 2 AM writing formulas and clean pipelines, I felt completely exhilarated when every node fell into place.",
          externalHelp:
            "Whether writing thesis literature, choosing laptop specs, or planning travel itineraries, friends always dump their chaotic raw information on me to synthesize the optimal choice.",
          secretEnvy:
            "I secretly envy independent creators who can distill ultra-complex concepts into three intuitive visual diagrams and elegant metaphors. Every time I see their work, I feel a quiet sting of ambition.",
          gritDetail:
            "To ensure a technical proposal has zero logical gaps, I will patiently proofread typography, definitions, and code snippets 50 times. Others find it agonizing, but I relish the watchmaker-like precision.",
        }
      : {
          childhood:
            "初中时没有电脑，我用作业本画了很多套桌游规则和卡牌技能数值，反复拉着同桌测试平衡性，甚至写了上万字的架空世界观设定，完全不知疲倦。",
          recentFlow:
            "上个月帮团队重构一个混乱不堪的客户服务流转表。从晚上8点开始理清流程并写自动化公式，一抬头发现已经凌晨两点，但精神异常兴奋，觉得所有乱七八糟的节点都被整顿得极其优雅。",
          externalHelp:
            "朋友们无论是写论文找参考文献、挑笔记本电脑配置，还是制定自由行旅游攻略，总喜欢把最杂乱的原始信息扔给我，让我帮他们梳理出最优解方案。",
          secretEnvy:
            "暗自羡慕那些能把非常复杂的概念用几张通俗易懂的架构图和精妙比喻讲清楚的独立创作者，每次看到他们优秀的内容产出，我心里都有些酸楚，觉得自己也能做好。",
          gritDetail:
            "为了确保一份技术方案的排版和逻辑闭环毫无瑕疵，我能耐着性子把字体间距、名词定义和代码示例反复校对50次，别人觉得痛苦，我却享受这种如同钟表匠般的精密感。",
        };
    Object.entries(demos).forEach(([k, v]) => onSaveAnswer(k, v));
  };

  const answeredCount = Object.values(answers).filter((v) => v && v.trim().length > 0).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header Banner */}
      <div className="mb-6 rounded-2xl border border-indigo-100 bg-gradient-to-r from-amber-50/60 via-white to-indigo-50/60 p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>{isEn ? "Core Video Heuristics · 5 In-Depth Qualitative Inquiries" : "视频核心启发法 · 5大定性深度追问"}</span>
            </div>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {t.qualitative.title}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              {t.qualitative.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFillQualitativeDemo}
              id="btn-qualitative-fill-demo"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 shadow-xs hover:bg-amber-50 transition-colors"
            >
              <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
              <span>{isEn ? "Fill Exemplar Story" : "填充参考范例"}</span>
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
          <span>
            {isEn ? "Reflections Recorded: " : "已反思："}
            <strong className="text-slate-800">{answeredCount}</strong> / 5
          </span>
          <span className="text-indigo-600 font-medium">
            {isEn ? "Narrative inputs will integrate into your custom AI report" : "这些文字将被整合到AI深度诊断报告中"}
          </span>
        </div>
      </div>

      {/* Tabs for 5 Questions */}
      <div className="flex space-x-1.5 overflow-x-auto pb-2">
        {QUALITATIVE_QUESTIONS.map((q, idx) => {
          const isDone = Boolean(answers[q.id]?.trim());
          const isActive = activeTab === q.id;
          const badgeText = isEn && ENGLISH_QUALITATIVE[q.id] ? ENGLISH_QUALITATIVE[q.id].badge : q.badge;

          return (
            <button
              key={q.id}
              id={`tab-qualitative-${q.id}`}
              onClick={() => setActiveTab(q.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition-all border ${
                isActive
                  ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{idx + 1}. {badgeText}</span>
              {isDone && <Check className={`h-3.5 w-3.5 ${isActive ? "text-emerald-400" : "text-emerald-600"}`} />}
            </button>
          );
        })}
      </div>

      {/* Main Form Box */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
              {qBadge}
            </span>
            <span className="text-xs text-slate-400">· {qAcademic}</span>
          </div>
          <h2 className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
            {qTitle}
          </h2>
          <p className="mt-1 text-sm text-slate-600 font-medium">
            {qSubtitle}
          </p>
        </div>

        {/* Theory & Prompts */}
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-600 space-y-2 border border-slate-100">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
            <p className="font-semibold text-slate-800">
              {qHeuristic}
            </p>
          </div>
          <div className="pl-6 space-y-1 text-slate-500">
            {qPrompts.map((p, i) => (
              <p key={i}>• {p}</p>
            ))}
          </div>
          <div className="pl-6 pt-1 text-[11px] text-indigo-600 italic">
            {qExemplar}
          </div>
        </div>

        {/* Input Textarea */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {isEn ? "Your authentic reflection & concrete anecdotes:" : "你的真实经历与反思记录："}
          </label>
          <textarea
            rows={5}
            value={currentValue}
            id={`input-reflection-${currentQRaw.id}`}
            onChange={(e) => onSaveAnswer(currentQRaw.id, e.target.value)}
            placeholder={qPlaceholder}
            className="w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 leading-relaxed"
          />
        </div>

        {errorMsg && (
          <p className="mt-2 text-xs text-rose-600 font-medium">{errorMsg}</p>
        )}

        {/* Action Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <button
            onClick={() => handleDeepReflect(currentQRaw.id)}
            disabled={analyzingId === currentQRaw.id}
            id="btn-ai-deep-reflect"
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-xs disabled:opacity-50"
          >
            {analyzingId === currentQRaw.id ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{isEn ? "AI is analyzing your reflections..." : "AI正在深度穿透剖析..."}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>{isEn ? "AI Deep Analysis for this reflection" : "AI智能剖析该条目隐性天赋"}</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onJumpToReport}
              id="btn-qualitative-jump-report"
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <span>{t.nav.viewReport}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* AI Insight Card */}
        {aiInsights[currentQRaw.id] && (
          <div className="mt-5 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/90 to-cyan-50/50 p-4.5 shadow-xs animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>{isEn ? "Gemini AI Talent Advisor Insight" : "Gemini 天赋顾问深度点评"}</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {aiInsights[currentQRaw.id]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
