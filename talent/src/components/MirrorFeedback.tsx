import { useState } from "react";
import { MirrorFeedbackItem } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { TRANSLATIONS } from "../utils/translations";
import { Users, Copy, CheckCircle2, MessageSquarePlus, Sparkles, Trash2, HeartHandshake } from "lucide-react";

interface MirrorFeedbackProps {
  items: MirrorFeedbackItem[];
  onAddItem: (item: Omit<MirrorFeedbackItem, "id" | "timestamp">) => void;
  onDeleteItem: (id: string) => void;
  onFillDemo: () => void;
}

export function MirrorFeedback({
  items,
  onAddItem,
  onDeleteItem,
  onFillDemo,
}: MirrorFeedbackProps) {
  const { lang, isEn } = useLanguage();
  const t = TRANSLATIONS[lang];

  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [templateRelation, setTemplateRelation] = useState<"friend" | "colleague" | "mentor">("colleague");
  const [relation, setRelation] = useState<MirrorFeedbackItem["relation"]>("colleague");
  const [relationLabel, setRelationLabel] = useState("");
  const [content, setContent] = useState("");
  const [keywords, setKeywords] = useState("");

  const templatesZh = {
    colleague: `嗨！我最近在做一项个人优势与擅长领域的自我分析。因为“当局者迷”，想真诚向你请教两个小问题（凭你的第一直觉回答就好，没有任何标准答案）：
1. 在我们过去的共事中，你觉得我处理哪一类事情时最顺手、最靠谱，或者你最放心交给我？
2. 如果遇到什么类型的棘手麻烦或难题，你会第一时间想找我参谋？
非常感谢你的真实反馈，这对我梳理未来的专长定位极有帮助！❤️`,
    friend: `哈喽！我最近在做一个深度的自我擅长领域探索测评，需要借助身边好友的“外部镜像”。想请你客观分享一下：
1. 在你眼中，我身上最突出、最与众不同的一两个天赋或特质是什么？
2. 过去大家聚会或遇到事情时，你最习惯在什么事情上听取我的建议？
谢谢好朋友的真实吐槽或夸奖，哪怕很小的细节都可以！😊`,
    mentor: `老师/领导您好：我最近在反思自己的核心竞争优势与未来专业深耕方向。想向您请教一个旁观者视角的观察：
在您看来，我最显著的不可替代优势体现在哪些方面？哪一类复杂任务最能激发出我的潜能？
非常感谢您的提点与指引！🙏`,
  };

  const templatesEn = {
    colleague: `Hi! I'm currently running a personal strengths and specific knowledge audit. Since we are often blind to our own effortless habits, I would love your quick, authentic perspective (just your intuitive first impression):
1. In our collaborations, what kinds of tasks or problems do you feel I handle most naturally, reliably, or with high craft?
2. When facing what kind of thorny challenge would you instinctively think to consult or brainstorm with me?
Thank you so much—this external mirror is invaluable for my growth! ❤️`,
    friend: `Hey! I'm exploring my personal signature strengths and looking for an honest external mirror from close friends:
1. From your vantage point, what are 1-2 distinctive superpowers or natural instincts you notice in me?
2. Whenever we hang out or discuss things, on what topics do you most naturally value my advice or take?
Thank you for your unfiltered feedback! 😊`,
    mentor: `Dear Mentor / Leader: I'm reflecting on my core competitive advantages and long-term career focus. May I ask for your seasoned observer's perspective:
In your eyes, what are my most pronounced signature strengths, and what kind of complex challenge best unleashes my potential?
Deeply appreciate your wisdom and guidance! 🙏`,
  };

  const currentTemplate = isEn ? templatesEn[templateRelation] : templatesZh[templateRelation];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTemplate);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const extracted = keywords
      .split(/[,，、\s]+/)
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const defaultLabel = isEn
      ? relation === "colleague"
        ? "Colleague"
        : relation === "friend"
        ? "Friend"
        : "Mentor"
      : relation === "colleague"
      ? "共事同事"
      : relation === "friend"
      ? "知心好友"
      : "导师";

    onAddItem({
      relation,
      relationLabel: relationLabel.trim() || defaultLabel,
      content: content.trim(),
      strengthsExtracted: extracted.length > 0 ? extracted : (isEn ? ["Reliable", "Complex problem solver"] : ["靠谱", "擅长解决疑难"]),
    });

    setContent("");
    setKeywords("");
    setRelationLabel("");
  };

  // Collect all extracted tags
  const allTags = items.flatMap((i) => i.strengthsExtracted);
  const tagFrequency: Record<string, number> = {};
  allTags.forEach((t) => {
    tagFrequency[t] = (tagFrequency[t] || 0) + 1;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Intro Banner */}
      <div className="mb-6 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-indigo-50/50 p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-900">
              <Users className="h-3.5 w-3.5 text-emerald-600" />
              <span>{isEn ? "Video Heuristic 3 · Johari Window 360° Mirror" : "视频启发法则三 · 乔哈里视窗 360° 外部镜像"}</span>
            </div>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {t.mirror.title}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              {t.mirror.subtitle}
            </p>
          </div>

          <button
            onClick={onFillDemo}
            id="btn-mirror-fill-demo"
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 shadow-xs hover:bg-emerald-50 transition-colors shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>{t.mirror.demoBtn}</span>
          </button>
        </div>
      </div>

      {/* Template Card Generator */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">
              {isEn ? "High-EQ 360° External Mirror Inquiry Template" : "高情商 360° 外部求助问询模板"}
            </h2>
          </div>

          {/* Relation Selector */}
          <div className="flex space-x-1 rounded-lg bg-slate-100 p-0.5">
            <button
              onClick={() => setTemplateRelation("colleague")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                templateRelation === "colleague" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              {isEn ? "Colleague" : "共事同事"}
            </button>
            <button
              onClick={() => setTemplateRelation("friend")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                templateRelation === "friend" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              {isEn ? "Friend" : "生活好友"}
            </button>
            <button
              onClick={() => setTemplateRelation("mentor")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                templateRelation === "mentor" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              {isEn ? "Mentor / Lead" : "领导导师"}
            </button>
          </div>
        </div>

        {/* Template Textbox */}
        <div className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
          {currentTemplate}
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={handleCopy}
            id="btn-mirror-copy-template"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            {copiedTemplate ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedTemplate ? (isEn ? "Copied to Clipboard" : "已复制到剪贴板") : (isEn ? "Copy Inquiry Template" : "一键复制文案发送给TA")}</span>
          </button>
        </div>
      </div>

      {/* External Feedback Word Cluster */}
      {Object.keys(tagFrequency).length > 0 && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 shadow-xs mb-6">
          <span className="text-xs font-bold text-indigo-900 block mb-2">
            🏷️ {isEn ? "External Blindspot Strengths Word Cloud (How others see your unique edge)" : "外部盲区高频特质词云（他人眼中你的拿手绝技）"}
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(tagFrequency).map(([tag, count]) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-white border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-800 shadow-xs"
              >
                <span>{tag}</span>
                <span className="rounded-full bg-indigo-100 px-1.5 text-[10px] text-indigo-600">
                  {count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Log Feedback Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs mb-6">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
          <MessageSquarePlus className="h-4 w-4 text-slate-700" />
          <span>{isEn ? "Log Received External Feedback" : "录入收到的一条外部反馈"}</span>
        </h2>

        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isEn ? "Relationship" : "反馈者关系"}
              </label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
              >
                <option value="colleague">{isEn ? "Colleague" : "共事同事"}</option>
                <option value="friend">{isEn ? "Friend" : "朋友发小"}</option>
                <option value="mentor">{isEn ? "Mentor / Manager" : "导师领导"}</option>
                <option value="family">{isEn ? "Family / Partner" : "家人伴侣"}</option>
              </select>
            </div>
            <div className="sm:col-span-8">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isEn ? "Nickname or Context (Optional)" : "备注昵称或场景（选填）"}
              </label>
              <input
                type="text"
                value={relationLabel}
                onChange={(e) => setRelationLabel(e.target.value)}
                placeholder={isEn ? "e.g., Product Lead at previous company, high school best friend..." : "例如：前司同组产品经理、高中死党..."}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isEn ? "Verbatim Quote or Observed Feedback" : "TA的原话或评价内容"}
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isEn ? "e.g., They mentioned that whenever cross-functional disagreements happen, they rely on me to turn messy debates into crisp causal roadmaps..." : "例如：TA说我每次做复盘都能把最乱的矛盾点理成清晰的因果链条，每次遇到跨部门扯皮大家都习惯让我去写方案..."}
              className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isEn ? "Extracted Strengths Tags (Comma or space separated)" : "提炼出的优势关键词（用逗号或空格分隔）"}
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder={isEn ? "e.g., Structured thinking, causal clarity, consensus builder" : "例如：结构化思维，清晰因果链，善于化解扯皮"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              id="btn-mirror-submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <span>{isEn ? "Save External Feedback" : "保存外部反馈"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* List of Feedback */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3">
          {isEn ? `Recorded External Mirror Feedback (${items.length})` : `已录入的外部镜像反馈 (${items.length})`}
        </h2>

        {items.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            {isEn ? "No external feedback yet. Click 'Fill Sample Peer Reviews' to preview." : "暂无外部反馈记录，点击右上角“填充典型好友评价”可查看效果。"}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-emerald-100 px-2 py-0.5 font-bold text-[11px] text-emerald-800">
                      {item.relationLabel}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                  </div>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="mt-2 text-slate-800 leading-relaxed text-xs sm:text-sm font-normal">
                  “{item.content}”
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.strengthsExtracted.map((tag, idx) => (
                    <span key={idx} className="rounded bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
