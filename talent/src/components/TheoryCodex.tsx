import { useState } from "react";
import { THEORY_ARTICLES } from "../data/theories";
import { ENGLISH_THEORY_ARTICLES } from "../data/englishTheories";
import { useLanguage } from "../context/LanguageContext";
import { TRANSLATIONS } from "../utils/translations";
import { BookOpen, ChevronDown, ChevronUp, Quote } from "lucide-react";

export function TheoryCodex() {
  const { lang, isEn } = useLanguage();
  const t = TRANSLATIONS[lang];
  const articles = isEn ? ENGLISH_THEORY_ARTICLES : THEORY_ARTICLES;

  const [filter, setFilter] = useState<"all" | "video" | "academic">("all");
  const [expandedId, setExpandedId] = useState<string | null>(articles[0].id);

  const filteredArticles = articles.filter((a) => {
    if (filter === "all") return true;
    return a.category === filter;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Banner */}
      <div className="mb-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-cyan-50/50 p-5 shadow-xs">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
          <BookOpen className="h-3.5 w-3.5" />
          <span>{isEn ? "Theories & Methodological Codex" : "理论依据与方法论知识库"}</span>
        </div>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {t.theories.title}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          {t.theories.subtitle}
        </p>

        {/* Filter buttons */}
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
          <button
            onClick={() => setFilter("all")}
            id="btn-filter-all"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === "all" ? "bg-slate-900 text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {t.theories.filterAll} ({articles.length})
          </button>
          <button
            onClick={() => setFilter("video")}
            id="btn-filter-video"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === "video" ? "bg-slate-900 text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {t.theories.filterVideo}
          </button>
          <button
            onClick={() => setFilter("academic")}
            id="btn-filter-academic"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === "academic" ? "bg-slate-900 text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {t.theories.filterAcademic}
          </button>
        </div>
      </div>

      {/* Articles Accordion */}
      <div className="space-y-3.5">
        {filteredArticles.map((article) => {
          const isExpanded = expandedId === article.id;
          return (
            <div
              key={article.id}
              id={`article-card-${article.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all"
            >
              <div
                className="flex cursor-pointer items-start justify-between gap-4"
                onClick={() => setExpandedId(isExpanded ? null : article.id)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        article.category === "video"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-indigo-100 text-indigo-900"
                      }`}
                    >
                      {article.category === "video"
                        ? (isEn ? "Video Practical Heuristics" : "视频实战启发法")
                        : (isEn ? "Academic Foundational Model" : "学术奠基模型")}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {isEn ? "Source: " : "来源："}{article.source} · {article.author}
                    </span>
                  </div>
                  <h2 className="mt-1.5 text-base font-bold text-slate-900 sm:text-lg">
                    {article.title}
                  </h2>
                </div>

                <button className="text-slate-400 hover:text-slate-600 p-1" aria-label="Toggle article expansion">
                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-fade-in text-xs sm:text-sm">
                  {/* Summary */}
                  <p className="leading-relaxed text-slate-700 font-normal">
                    {article.summary}
                  </p>

                  {/* Key Heuristics */}
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <span className="font-bold text-slate-900 block mb-2">
                      💡 {isEn ? "Core Principles & Self-Audit Criteria:" : "核心启发法则与自查标准："}
                    </span>
                    <ul className="space-y-1.5 text-slate-600 pl-4 list-disc">
                      {article.keyHeuristics.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Steps */}
                  <div className="rounded-xl bg-indigo-50/50 p-4 border border-indigo-100">
                    <span className="font-bold text-indigo-900 block mb-2">
                      🛠️ {isEn ? "Personal Action & Practice Steps:" : "个人实操练习行动："}
                    </span>
                    <ul className="space-y-1 text-slate-700 pl-4 list-decimal">
                      {article.actionSteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Quote */}
                  <div className="flex items-center gap-2 rounded-lg bg-slate-100/70 px-3.5 py-2.5 text-slate-600 italic text-xs">
                    <Quote className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>“{article.quote}”</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
