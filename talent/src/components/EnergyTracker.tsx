import { useState } from "react";
import { EnergyLogItem } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { TRANSLATIONS } from "../utils/translations";
import { Activity, BatteryCharging, BatteryWarning, Plus, Trash2, Sparkles } from "lucide-react";

interface EnergyTrackerProps {
  items: EnergyLogItem[];
  onAddItem: (item: Omit<EnergyLogItem, "id" | "timestamp">) => void;
  onDeleteItem: (id: string) => void;
  onFillDemoLogs: () => void;
}

export function EnergyTracker({
  items,
  onAddItem,
  onDeleteItem,
  onFillDemoLogs,
}: EnergyTrackerProps) {
  const { lang, isEn } = useLanguage();
  const t = TRANSLATIONS[lang];

  const [title, setTitle] = useState("");
  const [type, setType] = useState<EnergyLogItem["type"]>("energizing");
  const [category, setCategory] = useState<EnergyLogItem["category"]>("work");
  const [note, setNote] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let shift = 0;
    if (type === "energizing") shift = 2;
    else if (type === "flow") shift = 3;
    else if (type === "draining") shift = -2;

    onAddItem({
      title: title.trim(),
      type,
      category,
      note: note.trim(),
      energyShift: shift,
    });

    setTitle("");
    setNote("");
  };

  const energizingCount = items.filter((i) => i.type === "energizing" || i.type === "flow").length;
  const drainingCount = items.filter((i) => i.type === "draining").length;
  const totalCount = items.length;
  const energyRatio = totalCount > 0 ? Math.round((energizingCount / totalCount) * 100) : 50;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Intro Banner */}
      <div className="mb-6 rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50/70 via-white to-indigo-50/50 p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-100/80 px-2.5 py-0.5 text-xs font-semibold text-cyan-900">
              <Activity className="h-3.5 w-3.5 text-cyan-600" />
              <span>{isEn ? "Video Heuristic 2 · Energy Audit Tracker" : "视频启发法则二 · 精力审计追踪器"}</span>
            </div>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {t.energy.title}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              {t.energy.subtitle}
            </p>
          </div>

          <button
            onClick={onFillDemoLogs}
            id="btn-energy-fill-demo"
            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-white px-3 py-1.5 text-xs font-medium text-cyan-800 shadow-xs hover:bg-cyan-50 transition-colors shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
            <span>{t.energy.demoBtn}</span>
          </button>
        </div>

        {/* Energy Balance Stats */}
        <div className="mt-5 rounded-xl bg-white border border-slate-100 p-4">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            <span className="flex items-center gap-1 font-bold text-emerald-700">
              <BatteryCharging className="h-4 w-4" />
              {isEn ? `Energizing & Flow Ratio: ${energyRatio}% (${energizingCount} items)` : `充能与心流占比：${energyRatio}% (${energizingCount}项)`}
            </span>
            <span className="flex items-center gap-1 font-bold text-rose-700">
              <BatteryWarning className="h-4 w-4" />
              {isEn ? `Draining Items: ${drainingCount}` : `内耗与心累项：${drainingCount}项`}
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-rose-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${energyRatio}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500 text-center">
            {energyRatio >= 70
              ? (isEn ? "✨ Excellent: Your routine is aligned with high-energy flow and signature strengths!" : "✨ 优秀：你的日常处在高度充能与心流轨道上，具有极高的优势发挥空间！")
              : energyRatio >= 40
              ? (isEn ? "⚖️ Balanced: Routine contains necessary chores; consider automating or delegating energy drains." : "⚖️ 平衡：日常包含必要杂务，建议逐步将耗能项目剥离、自动化或外包。")
              : (isEn ? "⚠️ Warning: Significant energy depletion detected; establish boundaries and refocus on strengths." : "⚠️ 预警：当前存在较多内耗事务，需要重新建立日常精力边界，向核心优势靠拢。")}
          </p>
        </div>
      </div>

      {/* Add New Event Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs mb-6">
        <h2 className="text-sm font-bold text-slate-900 mb-3">
          {isEn ? "Log a Daily Activity's Energy Response" : "记录一项日常事务的精力体验"}
        </h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isEn ? "Task / Activity Title" : "事件或任务名称"}
              </label>
              <input
                type="text"
                value={title}
                id="input-energy-title"
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isEn ? "e.g. Synthesized team workflow, wrote in-depth article, tabular reconciliations..." : "例如：给同事梳理业务流程、写深度分析长文、做报销填表..."}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isEn ? "Energy Response" : "精力感受类型"}
              </label>
              <select
                value={type}
                id="select-energy-type"
                onChange={(e) => setType(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="energizing">{isEn ? "🚀 Highly Energizing (Vigor boost)" : "🚀 极度充能 (越做越精神)"}</option>
                <option value="flow">{isEn ? "⚡ Deep Flow (Time vanishes)" : "⚡ 深度心流 (时间蒸发)"}</option>
                <option value="draining">{isEn ? "💤 Energy Draining (Exhausting)" : "💤 严重内耗 (心力交瘁)"}</option>
                <option value="neutral">{isEn ? "⚖️ Neutral Routine" : "⚖️ 平淡常规 (无甚波澜)"}</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isEn ? "Category" : "事务类别"}
              </label>
              <select
                value={category}
                id="select-energy-category"
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="work">{isEn ? "Professional Work" : "工作业务"}</option>
                <option value="creation">{isEn ? "Creative Project" : "自发创作"}</option>
                <option value="study">{isEn ? "Self-Directed Study" : "自学研究"}</option>
                <option value="social">{isEn ? "Social & Interpersonal" : "人际沟通"}</option>
                <option value="routine">{isEn ? "Repetitive Routine" : "机械日常"}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isEn ? "Micro-Observations / Notes (Optional)" : "感受心得或细节微观察（选填）"}
            </label>
            <input
              type="text"
              value={note}
              id="input-energy-note"
              onChange={(e) => setNote(e.target.value)}
              placeholder={isEn ? "e.g., Felt excited seeing clean architecture fall into place despite physical tiredness..." : "例如：虽然做了两小时身体有点累，但看到整洁的表格精神特别兴奋..."}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              id="btn-energy-submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isEn ? "Record to Audit Log" : "录入精力审计清单"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* List of Logged Events */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">
            {isEn ? `Audit Records (${items.length})` : `审计事件记录 (${items.length})`}
          </h2>
          <span className="text-xs text-slate-400">
            {isEn ? "Track 3-7 days to uncover clear strengths patterns" : "持续追踪3-7天，优势图景将愈发清晰"}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            {isEn ? "No records yet. Click 'Fill Sample Logs' or log your daily tasks above." : "暂无记录，可点击右上角“填充典型审计示例”或手动添加日常事务。"}
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item) => {
              const isPositive = item.type === "energizing" || item.type === "flow";
              const isNegative = item.type === "draining";

              return (
                <div
                  key={item.id}
                  className={`flex items-start justify-between rounded-xl border p-3.5 text-xs transition-all ${
                    isPositive
                      ? "border-emerald-200 bg-emerald-50/40"
                      : isNegative
                      ? "border-rose-200 bg-rose-50/40"
                      : "border-slate-200 bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`inline-flex items-center justify-center rounded-lg px-2 py-1 text-[11px] font-bold shrink-0 ${
                        item.type === "flow"
                          ? "bg-cyan-100 text-cyan-800"
                          : item.type === "energizing"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.type === "draining"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {item.type === "flow" && (isEn ? "⚡ Flow" : "⚡ 心流")}
                      {item.type === "energizing" && (isEn ? "🚀 Boost" : "🚀 充能")}
                      {item.type === "draining" && (isEn ? "💤 Drain" : "💤 耗能")}
                      {item.type === "neutral" && (isEn ? "⚖️ Routine" : "⚖️ 常规")}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {item.title}
                        </span>
                        <span className="rounded bg-white/80 px-1.5 py-0.5 text-[10px] text-slate-500 border border-slate-200/60">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.timestamp}
                        </span>
                      </div>
                      {item.note && (
                        <p className="mt-1 text-slate-600 leading-relaxed text-xs">
                          {item.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                    title={isEn ? "Delete" : "删除"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
