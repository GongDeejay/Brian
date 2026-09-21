import { useState } from "react";
import { DimensionKey, AIAnalysisReport, SavedAssessmentRecord } from "../types";
import { DIMENSIONS } from "../data/theories";
import { resolveArchetype } from "../data/englishArchetypes";
import { calculateSIGNMetrics } from "../utils/calculator";
import { RadarChart } from "./RadarChart";
import { useLanguage } from "../context/LanguageContext";
import { TRANSLATIONS } from "../utils/translations";
import {
  Sparkles,
  Printer,
  Zap,
  Target,
  ShieldAlert,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  Copy,
  Layers,
  Award,
} from "lucide-react";

interface ReportViewProps {
  scores: Record<DimensionKey, number>;
  dominantArchetypeId: string;
  secondaryArchetypeId: string;
  reflectionAnswers: Record<string, string>;
  aiReport: AIAnalysisReport | null;
  isGeneratingAI: boolean;
  onGenerateAI: () => void;
  savedRecords: SavedAssessmentRecord[];
  onLoadRecord: (record: SavedAssessmentRecord) => void;
  onRetake: () => void;
}

export function ReportView({
  scores,
  dominantArchetypeId,
  secondaryArchetypeId,
  aiReport,
  isGeneratingAI,
  onGenerateAI,
  savedRecords,
  onLoadRecord,
  onRetake,
}: ReportViewProps) {
  const { lang, isEn } = useLanguage();
  const t = TRANSLATIONS[lang];

  const [copied, setCopied] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState<DimensionKey | null>("naturalEase");

  const dominantRaw = resolveArchetype(dominantArchetypeId, lang);
  const secondaryRaw = resolveArchetype(secondaryArchetypeId, lang);

  const domTitle = dominantRaw.title;
  const domSub = dominantRaw.subtitle;
  const domTagline = dominantRaw.tagline;
  const domNature = dominantRaw.coreNature;

  const secTitle = secondaryRaw.title;

  const signSuccessDesc = dominantRaw.signSignature.success;
  const signInstinctDesc = dominantRaw.signSignature.instinct;
  const signGrowDesc = dominantRaw.signSignature.grow;
  const signNeedDesc = dominantRaw.signSignature.need;

  const signMetrics = calculateSIGNMetrics(scores, {});

  // Copy Markdown summary
  const handleCopyMarkdown = () => {
    const md = isEn
      ? `# Personal Strengths & Aptitude Diagnostic Report
**Archetype**: ${domTitle} (${domSub})
**Secondary Leverage**: ${secTitle}
**Core Motto**: ${domTagline}

## 1. Six-Dimensional Strengths Scores
- Natural Ease: ${scores.naturalEase} pts
- Energy & Flow: ${scores.energyFlow} pts
- Social Mirror: ${scores.socialMirror} pts
- Grit & Detail Tolerance: ${scores.gritTolerance} pts
- Cognitive Aptitude: ${scores.cognitiveAptitude} pts
- Latent Desire: ${scores.latentDesire} pts

## 2. Gallup SIGN Strengths Profile
- S (Success): ${signMetrics.success} pts
- I (Instinct): ${signMetrics.instinct} pts
- G (Grow): ${signMetrics.grow} pts
- N (Need): ${signMetrics.need} pts

## 3. Skill Stacking Formula
${dominantRaw.skillStackingFormula.baseSkill} × ${dominantRaw.skillStackingFormula.amplifier} = ${dominantRaw.skillStackingFormula.uniqueResult}
`
      : `# 个人擅长领域与天赋优势多维诊断报告
**测评原型**：${dominantRaw.title} (${dominantRaw.subtitle})
**辅助倾向**：${secondaryRaw.title}
**核心座右铭**：${dominantRaw.tagline}

## 一、六维潜能雷达得分
- 隐性优势与轻巧度：${scores.naturalEase}分
- 精力审计与心流状态：${scores.energyFlow}分
- 外部镜像与求助盲区：${scores.socialMirror}分
- 阻力耐受与细节韧性：${scores.gritTolerance}分
- 认知与智能模式倾向：${scores.cognitiveAptitude}分
- 潜意识渴望与反向投射：${scores.latentDesire}分

## 二、盖洛普 SIGN 优势诊断
- S 胜任力 (Success): ${signMetrics.success}分
- I 渴望感 (Instinct): ${signMetrics.instinct}分
- G 成长度 (Grow): ${signMetrics.grow}分
- N 滋养度 (Need): ${signMetrics.need}分
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Action Header Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {isEn ? "ASSESSMENT RESULTS · PANORAMIC DIAGNOSIS" : "测评结果 · 多维全景诊断"}
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
            {t.report.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {savedRecords.length > 1 && (
            <select
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs"
              onChange={(e) => {
                const rec = savedRecords.find((r) => r.id === e.target.value);
                if (rec) onLoadRecord(rec);
              }}
              defaultValue=""
            >
              <option value="" disabled>
                {isEn ? `History Archives (${savedRecords.length})` : `历史记录 (${savedRecords.length})`}
              </option>
              {savedRecords.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.date} · {resolveArchetype(r.archetypeId, lang).title}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleCopyMarkdown}
            id="btn-report-copy"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? (isEn ? "Copied Markdown" : "已复制 Markdown") : (isEn ? "Copy Summary" : "复制报告")}</span>
          </button>

          <button
            onClick={handlePrint}
            id="btn-report-print"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>{t.report.printExport}</span>
          </button>

          <button
            onClick={onRetake}
            id="btn-report-retake"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{t.report.retakeBtn}</span>
          </button>
        </div>
      </div>

      {/* Hero Archetype Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/30 px-2.5 py-1 text-xs font-bold text-indigo-200 backdrop-blur-md">
              <Award className="h-3.5 w-3.5" />
              <span>{t.report.dominantArchetype}</span>
            </span>
            <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-300">
              {t.report.secondaryArchetype}: {secTitle}
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight sm:text-4xl text-white">
                {domTitle}
              </h2>
              <p className="mt-1 text-sm font-medium text-indigo-200">
                {domSub}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded-xl border border-indigo-400/30 bg-indigo-500/20 px-4 py-2 text-xs font-semibold text-indigo-100">
                “{domTagline}”
              </span>
            </div>
          </div>

          <p className="mt-5 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-300">
            {domNature}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">{t.report.famousFigures}:</span>
            {dominantRaw.famousFigures.map((fig, idx) => (
              <span key={idx} className="rounded-md bg-white/5 px-2 py-0.5 text-slate-300">
                {fig}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Section 1: Radar Chart & Six Dimension Details */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Radar SVG */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="w-full text-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.report.radarTitle}
            </span>
            <p className="text-xs text-slate-500 mt-0.5">{t.report.radarDesc}</p>
          </div>
          <RadarChart
            scores={scores}
            size={340}
            onDimensionClick={(dim) => setSelectedDimension(dim)}
          />
        </div>

        {/* Dimension Breakdown Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {(Object.keys(DIMENSIONS) as DimensionKey[]).map((key) => {
            const rawInfo = DIMENSIONS[key];
            const trans = t.dimensions[key];
            const shortName = trans ? trans.shortName : rawInfo.shortName;
            const desc = trans ? trans.description : rawInfo.description;
            const score = scores[key] || 0;
            const isSelected = selectedDimension === key;

            return (
              <div
                key={key}
                id={`card-dimension-${key}`}
                onClick={() => setSelectedDimension(key)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: rawInfo.color }}
                    />
                    <span className="text-xs font-bold text-slate-800">
                      {shortName}
                    </span>
                  </div>
                  <span
                    className="font-mono text-sm font-extrabold"
                    style={{ color: rawInfo.color }}
                  >
                    {score} {isEn ? "pts" : "分"}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${score}%`,
                      backgroundColor: rawInfo.color,
                    }}
                  />
                </div>

                <p className="mt-2 text-[11px] leading-relaxed text-slate-500 line-clamp-2">
                  {desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Gallup SIGN Model Diagnostic Panel */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <span className="inline-block rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
              {isEn ? "ACADEMIC FRAMEWORK 1" : "学术框架 1"}
            </span>
            <h3 className="mt-1 text-base sm:text-lg font-bold text-slate-900">
              {t.report.signTitle}
            </h3>
            <p className="text-xs text-slate-500">
              {t.report.signSubtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">S · Success</span>
              <span className="font-mono text-sm font-bold text-indigo-600">{signMetrics.success} {isEn ? "pts" : "分"}</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${signMetrics.success}%` }} />
            </div>
            <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
              {signSuccessDesc}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">I · Instinct</span>
              <span className="font-mono text-sm font-bold text-cyan-600">{signMetrics.instinct} {isEn ? "pts" : "分"}</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full bg-cyan-600 rounded-full" style={{ width: `${signMetrics.instinct}%` }} />
            </div>
            <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
              {signInstinctDesc}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">G · Grow</span>
              <span className="font-mono text-sm font-bold text-emerald-600">{signMetrics.grow} {isEn ? "pts" : "分"}</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${signMetrics.grow}%` }} />
            </div>
            <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
              {signGrowDesc}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">N · Need</span>
              <span className="font-mono text-sm font-bold text-amber-600">{signMetrics.need} {isEn ? "pts" : "分"}</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full bg-amber-600 rounded-full" style={{ width: `${signMetrics.need}%` }} />
            </div>
            <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
              {signNeedDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Skill Stacking Strategy */}
      <div className="mt-8 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/60 via-white to-cyan-50/60 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <Layers className="h-4 w-4" />
          <span>{t.report.skillStacking}</span>
        </div>
        <h3 className="mt-2 text-lg sm:text-xl font-bold text-slate-900">
          {isEn
            ? "How to stack complementary capabilities to escape hyper-competition and build a unique moat"
            : "如何通过能力组合，避免单点内卷并建立不可替代性？"}
        </h3>

        <div className="mt-4 rounded-xl bg-white border border-indigo-100 p-4.5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-center sm:text-left justify-center">
            <div className="rounded-lg bg-indigo-100 px-3.5 py-2 font-bold text-xs text-indigo-900">
              {isEn ? "Foundation: " : "基石优势："}{dominantRaw.skillStackingFormula.baseSkill}
            </div>
            <span className="text-lg font-bold text-indigo-400">×</span>
            <div className="rounded-lg bg-cyan-100 px-3.5 py-2 font-bold text-xs text-cyan-900">
              {isEn ? "Leverage: " : "放大杠杆："}{dominantRaw.skillStackingFormula.amplifier}
            </div>
            <span className="text-lg font-bold text-indigo-400">=</span>
            <div className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-xs text-white shadow-xs">
              {dominantRaw.skillStackingFormula.uniqueResult}
            </div>
          </div>
          <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed text-center sm:text-left">
            {dominantRaw.skillStackingFormula.analysis}
          </p>
        </div>
      </div>

      {/* Section 4: Recommended Domains & Real Roles */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
            {isEn ? "CAREER DOMAINS" : "赛道落地"}
          </span>
          <h3 className="mt-1 text-base sm:text-lg font-bold text-slate-900">
            {t.report.recommendedDomains}
          </h3>
          <p className="text-xs text-slate-500">
            {isEn ? "High-resonance arenas where natural gifts align with macro leverage" : "让天赋与时代杠杆共振的高契合度领域"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {dominantRaw.recommendedDomains.map((domain, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-100 bg-slate-50/70 p-5 hover:border-indigo-200 hover:bg-white transition-all shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">{domain.title}</h4>
              </div>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                {domain.description}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/60">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  {isEn ? "Typical Roles: " : "典型落地角色："}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {domain.roles.map((role, rIdx) => (
                    <span
                      key={rIdx}
                      className="rounded bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Shadow & Blindspots */}
      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/40 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          <span>{t.report.shadowBlindspots}</span>
        </div>
        <h3 className="mt-1 text-base sm:text-lg font-bold text-slate-900">
          {isEn
            ? "Preventing core strengths from transforming into cognitive traps and blindspots"
            : "避免将核心优势演变为自我限制的陷阱"}
        </h3>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dominantRaw.shadowBlindspots.map((item, idx) => (
            <div key={idx} className="rounded-xl bg-white border border-amber-200/80 p-4.5 shadow-xs">
              <div className="text-xs font-bold text-rose-700">
                ⚠️ {isEn ? "Vulnerability: " : "警惕陷阱："}{item.pitfall}
              </div>
              <div className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                <strong className="text-emerald-700">{isEn ? "Antidote: " : "破局解法："}</strong>
                {item.antidote}
              </div>
            </div>
          ))}
        </div>

        {/* Context Audit */}
        <div className="mt-5 pt-4 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-bold text-emerald-800 block mb-1">{t.report.highEnergyZone}</span>
            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
              {dominantRaw.highEnergyContext.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-bold text-rose-800 block mb-1">{t.report.drainEnergyZone}</span>
            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
              {dominantRaw.drainEnergyContext.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Section 6: AI Deep Synthesis Report (Gemini API Integration) */}
      <div className="mt-8 rounded-3xl border border-indigo-200 bg-white p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>{isEn ? "AI Deep Synthesis Diagnosis (Powered by Gemini)" : "AI 深度综合穿透诊断 (Gemini 驱动)"}</span>
            </div>
            <h3 className="mt-2 text-lg sm:text-2xl font-bold text-slate-900">
              {isEn ? "Bespoke Personal Specific Knowledge & Action Blueprint" : "定制级个人专长与行动规划蓝图"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isEn
                ? "Synthesizing your quantitative metrics & qualitative reflections for deep, penetrating career insights"
                : "结合你的量化六维数据、定性真实自述，由 Gemini 生成穿透本质的个性化诊断"}
            </p>
          </div>

          <button
            onClick={onGenerateAI}
            disabled={isGeneratingAI}
            id="btn-generate-ai-report"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:from-indigo-500 hover:to-cyan-500 transition-all disabled:opacity-60 shrink-0"
          >
            {isGeneratingAI ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{t.report.aiGenerating}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>{aiReport ? (isEn ? "Regenerate AI Report" : "重新生成 AI 诊断报告") : t.report.aiDeepDiagnosis}</span>
              </>
            )}
          </button>
        </div>

        {/* AI Report Body */}
        {aiReport ? (
          <div className="mt-6 space-y-6 animate-fade-in">
            {/* Executive Summary */}
            <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 block mb-1">
                {isEn ? "EXECUTIVE SUMMARY" : "诊断总结 (Executive Summary)"}
              </span>
              <p className="text-sm sm:text-base leading-relaxed text-slate-800 font-medium">
                {aiReport.executiveSummary}
              </p>
            </div>

            {/* Specific Knowledge Deep Dive */}
            {aiReport.specificKnowledge && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>{t.report.specificKnowledgeTitle}</span>
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {aiReport.specificKnowledge.coreDefinition}
                </p>
                {aiReport.specificKnowledge.uniqueTraits && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {aiReport.specificKnowledge.uniqueTraits.map((trait, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-700 font-medium"
                      >
                        • {trait}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 90-Day Action Roadmap */}
            {aiReport.actionRoadmap && aiReport.actionRoadmap.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                  <span>{isEn ? "90-Day Strengths Execution Roadmap" : "未来 90 天优势落地行动路线图"}</span>
                </h4>
                <div className="space-y-3">
                  {aiReport.actionRoadmap.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-xs"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 block mb-0.5">
                          {item.phase}
                        </span>
                        <p className="text-slate-600 leading-relaxed">{item.task}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Golden Quote */}
            {aiReport.goldenQuote && (
              <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-500 to-cyan-600 p-4 text-center text-white shadow-xs">
                <p className="text-xs sm:text-sm font-semibold italic">
                  “{aiReport.goldenQuote}”
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8 text-center py-8">
            <Sparkles className="mx-auto h-8 w-8 text-indigo-400 animate-pulse" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              {isEn ? "Click 'Generate Deep AI Diagnosis' above" : "点击上方“立即生成 AI 深度报告”"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {isEn
                ? "Gemini will synthesize your quantitative and qualitative data to generate a custom roadmap"
                : "Gemini 将整合你的全部定性问答与定量得分，定制出独一无二的专长跃迁报告"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
