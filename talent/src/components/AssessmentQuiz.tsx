import { useState, useEffect } from "react";
import { ASSESSMENT_QUESTIONS } from "../data/questions";
import { DIMENSIONS } from "../data/theories";
import { ENGLISH_QUESTIONS } from "../data/englishData";
import { DimensionKey } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { TRANSLATIONS } from "../utils/translations";
import { ChevronLeft, ChevronRight, CheckCircle2, Sparkles, BookOpen } from "lucide-react";

interface AssessmentQuizProps {
  answers: Record<number, number>;
  onAnswer: (questionId: number, score: number) => void;
  onComplete: () => void;
  onFillDemo: () => void;
}

export function AssessmentQuiz({
  answers,
  onAnswer,
  onComplete,
  onFillDemo,
}: AssessmentQuizProps) {
  const { lang, isEn } = useLanguage();
  const t = TRANSLATIONS[lang];

  const [currentIndex, setCurrentIndex] = useState(0);

  const totalQuestions = ASSESSMENT_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const currentQRaw = ASSESSMENT_QUESTIONS[currentIndex];
  const englishQ = ENGLISH_QUESTIONS[currentQRaw.id];

  // Resolve bilingual content
  const qTitle = isEn && englishQ ? englishQ.title : currentQRaw.title;
  const qScenario = isEn && englishQ ? englishQ.scenario : currentQRaw.scenario;
  const qAcademic = isEn && englishQ ? englishQ.academicAnchor : currentQRaw.academicAnchor;

  const currentDimension = DIMENSIONS[currentQRaw.dimension];
  const dimTranslation = t.dimensions[currentQRaw.dimension];
  const dimensionName = dimTranslation ? dimTranslation.name : currentDimension.name;

  const currentScore = answers[currentQRaw.id];

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "5") {
        const score = parseInt(e.key, 10);
        handleSelectScore(score);
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      } else if (e.key === "ArrowRight" && currentIndex < totalQuestions - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, currentQRaw.id]);

  const handleSelectScore = (score: number) => {
    onAnswer(currentQRaw.id, score);
    // Auto advance if not at the last question
    if (currentIndex < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 160);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Top Banner / Intro */}
      <div className="mb-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-cyan-50/50 p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100/80 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isEn ? "Scientific Strengths Matrix (24 Questions)" : "多维科学测评矩阵 (24题)"}</span>
            </div>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {t.quiz.title}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t.quiz.subtitle}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={onFillDemo}
              id="btn-quiz-fill-demo"
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 shadow-xs hover:bg-indigo-50 transition-colors"
              title={t.quiz.fillDemo}
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>{t.quiz.fillDemo}</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium">
              {t.quiz.progress}: <strong className="text-slate-800">{answeredCount}</strong> / {totalQuestions}
            </span>
            <span className="font-semibold text-indigo-600 font-mono">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs transition-all">
        {/* Dimension & Navigation Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: currentDimension.color }}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isEn ? `DIMENSION ${Math.floor(currentIndex / 4) + 1}/6 ·` : `维度 ${Math.floor(currentIndex / 4) + 1}/6 ·`}
            </span>
            <span
              className="rounded-md px-2 py-0.5 text-xs font-semibold"
              style={{
                backgroundColor: `${currentDimension.color}15`,
                color: currentDimension.color,
              }}
            >
              {dimensionName}
            </span>
          </div>

          <div className="text-xs font-medium text-slate-400 font-mono">
            {isEn ? "Question " : "题号 "}
            <strong className="text-slate-700 font-bold">{currentIndex + 1}</strong> / {totalQuestions}
          </div>
        </div>

        {/* Question Title & Scenario */}
        <div className="mt-5">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            {qTitle}
          </h2>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-700 font-normal">
            {qScenario}
          </p>
        </div>

        {/* Academic Anchor Note */}
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-600">
          <BookOpen className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800">{isEn ? "Academic Grounding & Principle: " : "学术依据与原理："}</span>
            <span>{qAcademic}</span>
          </div>
        </div>

        {/* 5-Scale Answer Options */}
        <div className="mt-6 space-y-2.5">
          {currentQRaw.options.map((optionRaw, optIdx) => {
            const isSelected = currentScore === optionRaw.score;
            const optEnglish = isEn && englishQ ? englishQ.options[optIdx] : null;
            const optLabel = optEnglish ? optEnglish.label : optionRaw.label;
            const optDesc = optEnglish ? optEnglish.description : optionRaw.description;

            return (
              <button
                key={optionRaw.score}
                id={`quiz-opt-${currentQRaw.id}-${optionRaw.score}`}
                onClick={() => handleSelectScore(optionRaw.score)}
                className={`group flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/80 shadow-xs ring-1 ring-indigo-600"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-300 text-slate-500 group-hover:border-slate-400"
                    }`}
                  >
                    {optionRaw.score}
                  </div>
                  <div>
                    <span
                      className={`text-sm font-semibold ${
                        isSelected ? "text-indigo-900" : "text-slate-900"
                      }`}
                    >
                      {optLabel}
                    </span>
                    {optDesc && (
                      <p
                        className={`text-xs mt-0.5 ${
                          isSelected ? "text-indigo-700/80" : "text-slate-500"
                        }`}
                      >
                        {optDesc}
                      </p>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Step Controller Bar */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            id="btn-quiz-prev"
            className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              currentIndex === 0
                ? "cursor-not-allowed text-slate-300"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>{t.quiz.prev}</span>
          </button>

          <span className="hidden sm:inline-block text-[11px] text-slate-400">
            {isEn ? (
              <>Press <kbd className="rounded border border-slate-200 bg-slate-100 px-1 py-0.5">1-5</kbd> to select, <kbd className="rounded border border-slate-200 bg-slate-100 px-1 py-0.5">←</kbd> <kbd className="rounded border border-slate-200 bg-slate-100 px-1 py-0.5">→</kbd> to navigate</>
            ) : (
              <>快捷键：按数字键 <kbd className="rounded border border-slate-200 bg-slate-100 px-1 py-0.5">1-5</kbd> 直接选择，<kbd className="rounded border border-slate-200 bg-slate-100 px-1 py-0.5">←</kbd> <kbd className="rounded border border-slate-200 bg-slate-100 px-1 py-0.5 ml-0.5">→</kbd> 翻题</>
            )}
          </span>

          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              id="btn-quiz-next"
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              <span>{t.quiz.next}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onComplete}
              id="btn-quiz-submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:from-indigo-500 hover:to-cyan-500 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{t.quiz.finish}</span>
            </button>
          )}
        </div>
      </div>

      {/* Question Jump Matrix */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">{isEn ? "Quick Question Navigator" : "题目快速导航"}</span>
          <span className="text-[11px] text-slate-400">{isEn ? `Answered ${answeredCount}/${totalQuestions}` : `已作答 ${answeredCount}/${totalQuestions}`}</span>
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
          {ASSESSMENT_QUESTIONS.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = currentIndex === idx;
            return (
              <button
                key={q.id}
                id={`btn-jump-q-${idx + 1}`}
                onClick={() => setCurrentIndex(idx)}
                className={`flex h-8 w-full items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                  isCurrent
                    ? "border-2 border-indigo-600 bg-indigo-600 text-white shadow-xs"
                    : isAnswered
                    ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
