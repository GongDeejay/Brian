import { useState, useEffect } from "react";
import { DimensionKey, AIAnalysisReport, SavedAssessmentRecord, EnergyLogItem, MirrorFeedbackItem } from "./types";
import { Navbar, NavTab } from "./components/Navbar";
import { AssessmentQuiz } from "./components/AssessmentQuiz";
import { QualitativeSection } from "./components/QualitativeSection";
import { ReportView } from "./components/ReportView";
import { EnergyTracker } from "./components/EnergyTracker";
import { MirrorFeedback } from "./components/MirrorFeedback";
import { TheoryCodex } from "./components/TheoryCodex";
import {
  calculateDimensionScores,
  determineArchetype,
  generateOfflineAnalysis,
  getSavedAssessments,
  saveAssessmentRecord,
  getEnergyLogs,
  saveEnergyLogs,
  getMirrorLogs,
  saveMirrorLogs,
} from "./utils/calculator";
import { resolveArchetype } from "./data/englishArchetypes";
import { useLanguage } from "./context/LanguageContext";
import { useAuth } from "./context/AuthContext";
import { syncPendingRecords } from "./services/sessionSync";

export default function App() {
  const { lang, isEn } = useLanguage();
  const { user, hasConsented } = useAuth();

  const [currentTab, setCurrentTab] = useState<NavTab>("quiz");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({});
  const [aiReport, setAiReport] = useState<AIAnalysisReport | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [savedRecords, setSavedRecords] = useState<SavedAssessmentRecord[]>([]);

  // Energy tracker logs state
  const [energyLogs, setEnergyLogs] = useState<EnergyLogItem[]>(() => getEnergyLogs());

  // Mirror feedback logs state
  const [mirrorLogs, setMirrorLogs] = useState<MirrorFeedbackItem[]>(() => getMirrorLogs());

  // Initialize saved records from localStorage
  useEffect(() => {
    const loaded = getSavedAssessments();
    setSavedRecords(loaded);
    if (loaded.length > 0) {
      // If previous records exist, load the latest as preview
      const latest = loaded[0];
      setAnswers(latest.answers);
      setReflectionAnswers(latest.reflectionAnswers);
      setAiReport(latest.aiReport ?? null);
    }
  }, []);

  useEffect(() => {
    saveEnergyLogs(energyLogs);
  }, [energyLogs]);

  useEffect(() => {
    saveMirrorLogs(mirrorLogs);
  }, [mirrorLogs]);

  useEffect(() => {
    if (!user || !hasConsented) return;
    void syncPendingRecords(lang, null);
  }, [user, hasConsented, lang, savedRecords, energyLogs, mirrorLogs]);

  useEffect(() => {
    if (!aiReport) return;
    const blob = `${aiReport.executiveSummary}\n${aiReport.goldenQuote ?? ""}`;
    const hasCjk = /[\u4e00-\u9fff]/.test(blob);
    if (lang === "en" && hasCjk) {
      setAiReport(generateOfflineAnalysis(scores, dominant, reflectionAnswers, "en"));
    } else if (lang === "zh" && !hasCjk) {
      setAiReport(generateOfflineAnalysis(scores, dominant, reflectionAnswers, "zh"));
    }
    // Only rewrite when the interface language changes, not on every score tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Compute live scores and archetypes
  const scores = calculateDimensionScores(answers);
  const { dominant, secondary } = determineArchetype(scores, answers);
  const hasCompletedQuiz = Object.keys(answers).length >= 12;

  // Handle answering single question
  const handleAnswer = (questionId: number, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  // Demo fill quantitative answers
  const handleFillDemoQuiz = () => {
    const demoAnswers: Record<number, number> = {
      1: 5, 2: 4, 3: 5, 4: 4,
      5: 5, 6: 4, 7: 5, 8: 5,
      9: 4, 10: 5, 11: 4, 12: 5,
      13: 4, 14: 4, 15: 5, 16: 4,
      17: 5, 18: 3, 19: 4, 20: 3,
      21: 4, 22: 4, 23: 5, 24: 5,
    };
    setAnswers(demoAnswers);

    // Also populate demo reflections if empty
    if (Object.keys(reflectionAnswers).length === 0) {
      setReflectionAnswers(
        isEn
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
            }
      );
    }

    // Generate immediate base report
    const instantReport = generateOfflineAnalysis(
      calculateDimensionScores(demoAnswers),
      "architect",
      reflectionAnswers,
      lang
    );
    setAiReport(instantReport);
  };

  // Generate or request AI report
  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scores,
          dominantArchetype: dominant,
          secondaryArchetype: secondary,
          reflectionAnswers,
          lang,
        }),
      });

      const data = await response.json();
      if (data.success && data.report) {
        setAiReport(data.report);
        saveCurrentRecord(data.report);
      } else {
        // Fallback offline generator
        const offlineReport = generateOfflineAnalysis(scores, dominant, reflectionAnswers, lang);
        setAiReport(offlineReport);
        saveCurrentRecord(offlineReport);
      }
    } catch {
      // Fallback offline generator
      const offlineReport = generateOfflineAnalysis(scores, dominant, reflectionAnswers, lang);
      setAiReport(offlineReport);
      saveCurrentRecord(offlineReport);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Helper to save current assessment to storage
  const saveCurrentRecord = (report: AIAnalysisReport) => {
    const dominantProfile = resolveArchetype(dominant, lang);
    const newRecord: SavedAssessmentRecord = {
      id: `eval_${Date.now()}`,
      date: new Date().toLocaleDateString(lang === "en" ? "en-US" : "zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      scores,
      archetypeId: dominant,
      archetypeTitle: dominantProfile.title,
      answers,
      reflectionAnswers,
      aiReport: report,
    };
    saveAssessmentRecord(newRecord);
    setSavedRecords(getSavedAssessments());
  };

  // Complete assessment quiz -> jump to report
  const handleCompleteQuiz = () => {
    if (!aiReport) {
      const offline = generateOfflineAnalysis(scores, dominant, reflectionAnswers, lang);
      setAiReport(offline);
      saveCurrentRecord(offline);
    }
    setCurrentTab("report");
  };

  // Reset all
  const handleReset = () => {
    setAnswers({});
    setReflectionAnswers({});
    setAiReport(null);
    setCurrentTab("quiz");
  };

  // Load past record
  const handleLoadRecord = (record: SavedAssessmentRecord) => {
    setAnswers(record.answers);
    setReflectionAnswers(record.reflectionAnswers);
    setAiReport(record.aiReport ?? null);
    setCurrentTab("report");
  };

  // Energy Log actions
  const handleAddEnergyItem = (item: Omit<EnergyLogItem, "id" | "timestamp">) => {
    const newItem: EnergyLogItem = {
      ...item,
      id: `energy_${Date.now()}`,
      timestamp: isEn ? "Just now" : "刚刚",
    };
    setEnergyLogs([newItem, ...energyLogs]);
  };

  const handleDeleteEnergyItem = (id: string) => {
    setEnergyLogs(energyLogs.filter((i) => i.id !== id));
  };

  const handleFillDemoEnergyLogs = () => {
    setEnergyLogs([
      {
        id: `demo-${Date.now()}-1`,
        timestamp: isEn ? "Today 14:00" : "今日 14:00",
        title: isEn
          ? "Architected the core interaction flow & state model for new product release"
          : "主导设计了产品新版本的核心交互原型与信息架构",
        type: "flow",
        category: "creation",
        note: isEn
          ? "Immersed for 3 straight hours without looking at phone once; output universally praised by engineering."
          : "一上手便沉浸进去3小时，中途没有看一次手机，输出结果受到团队一致认可。",
        energyShift: 3,
      },
      {
        id: `demo-${Date.now()}-2`,
        timestamp: isEn ? "Today 11:30" : "今日 11:30",
        title: isEn
          ? "Authored cross-team implementation strategy & addressed edge case liabilities"
          : "撰写跨团队协作的实施方案并梳理潜在风险闭环",
        type: "energizing",
        category: "work",
        note: isEn
          ? "Pinpointing system flaws and crafting elegant mitigation strategies felt deeply satisfying."
          : "发现系统漏洞并提出替代方案的过程让我感到极其兴奋。",
        energyShift: 2,
      },
      {
        id: `demo-${Date.now()}-3`,
        timestamp: isEn ? "Yesterday 16:00" : "昨日 16:00",
        title: isEn
          ? "90-minute repetitive alignment meeting on minor formatting opinions"
          : "参加长达90分钟的例行无实质结论扯皮对齐会",
        type: "draining",
        category: "routine",
        note: isEn
          ? "Extremely patience-draining; felt mentally exhausted with urgent desire to escape."
          : "极度消耗耐心，满脑子都是疲惫感，只想快速逃离。",
        energyShift: -2,
      },
    ]);
  };

  // Mirror feedback actions
  const handleAddMirrorItem = (item: Omit<MirrorFeedbackItem, "id" | "timestamp">) => {
    const newItem: MirrorFeedbackItem = {
      ...item,
      id: `mirror_${Date.now()}`,
      timestamp: isEn ? "Just now" : "刚刚",
    };
    setMirrorLogs([newItem, ...mirrorLogs]);
  };

  const handleDeleteMirrorItem = (id: string) => {
    setMirrorLogs(mirrorLogs.filter((i) => i.id !== id));
  };

  const handleFillDemoMirrorLogs = () => {
    setMirrorLogs([
      {
        id: `mirror-${Date.now()}-1`,
        timestamp: isEn ? "Yesterday" : "昨天",
        relation: "colleague",
        relationLabel: isEn ? "Senior Product Partner" : "资深产品搭档",
        content: isEn
          ? "You excel at taking fragmented, messy discussions and synthesizing them into a structured roadmap. Every meeting with you brings immediate clarity."
          : "你特别擅长把别人讲得支离破碎的想法，提炼成一张有逻辑梯度的框架图。每次跟你讨论完，思路都会变得异常清晰。",
        strengthsExtracted: isEn
          ? ["Concept Structuring", "Dimensional Reduction", "Framework Synthesis"]
          : ["概念结构化", "降维表达", "框架梳理"],
      },
      {
        id: `mirror-${Date.now()}-2`,
        timestamp: isEn ? "3 days ago" : "3天前",
        relation: "friend",
        relationLabel: isEn ? "Friend of 8 years" : "认识8年的老友",
        content: isEn
          ? "Whenever you become curious about a new domain, you map out all seminal books and principles within 3 days. That intellectual hunger is truly awe-inspiring."
          : "只要你对一个新领域产生好奇，三天内就能把市面上最好的经典书和核心脉络全都摸排一遍，这种学习的本能渴求真的很让人佩服。",
        strengthsExtracted: isEn
          ? ["Rapid Deep Study", "Intellectual Drive", "First-Principles Inquiry"]
          : ["高密学习", "敏锐求知", "原典挖掘"],
      },
      {
        id: `mirror-${Date.now()}-3`,
        timestamp: isEn ? "Last week" : "上周",
        relation: "mentor",
        relationLabel: isEn ? "Former Department Lead" : "前部门负责人",
        content: isEn
          ? "Every blueprint you deliver, even under tight deadlines, is impeccably reasoned and structured. That dedication to craft is a tremendous moat."
          : "你交出来的任何方案，哪怕时间很紧，格式与推导链条也是无可挑剔的。这种对品质的偏执是极具竞争力的隐性门槛。",
        strengthsExtracted: isEn
          ? ["Flawless Execution", "Rigor & Precision", "Craftsmanship"]
          : ["极高交付品质", "严谨闭环", "匠人精神"],
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans antialiased flex flex-col">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        hasCompletedQuiz={hasCompletedQuiz}
        onReset={handleReset}
      />

      {/* Main Tab Content */}
      <main className="flex-1 pb-16">
        {currentTab === "quiz" && (
          <AssessmentQuiz
            answers={answers}
            onAnswer={handleAnswer}
            onComplete={handleCompleteQuiz}
            onFillDemo={handleFillDemoQuiz}
          />
        )}

        {currentTab === "qualitative" && (
          <QualitativeSection
            answers={reflectionAnswers}
            onSaveAnswer={(id, text) =>
              setReflectionAnswers((prev) => ({ ...prev, [id]: text }))
            }
            onJumpToReport={() => setCurrentTab("report")}
          />
        )}

        {currentTab === "report" && (
          <ReportView
            scores={scores}
            dominantArchetypeId={dominant}
            secondaryArchetypeId={secondary}
            reflectionAnswers={reflectionAnswers}
            aiReport={aiReport}
            isGeneratingAI={isGeneratingAI}
            onGenerateAI={handleGenerateAI}
            savedRecords={savedRecords}
            onLoadRecord={handleLoadRecord}
            onRetake={handleReset}
          />
        )}

        {currentTab === "energy" && (
          <EnergyTracker
            items={energyLogs}
            onAddItem={handleAddEnergyItem}
            onDeleteItem={handleDeleteEnergyItem}
            onFillDemoLogs={handleFillDemoEnergyLogs}
          />
        )}

        {currentTab === "mirror" && (
          <MirrorFeedback
            items={mirrorLogs}
            onAddItem={handleAddMirrorItem}
            onDeleteItem={handleDeleteMirrorItem}
            onFillDemo={handleFillDemoMirrorLogs}
          />
        )}

        {currentTab === "theories" && <TheoryCodex />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            {isEn
              ? "TalentCompass · Methodological Foundations: Video Practical Heuristics + Gallup SIGN Model + Holland RIASEC + Naval Specific Knowledge"
              : "优势潜能罗盘 (TalentCompass) · 启发法来源：Bilibili 视频启发法 + 盖洛普 SIGN 模型 + 霍兰德 RIASEC + 纳瓦尔专长理论"}
          </p>
          <p className="text-slate-400">
            Powered by Google Gemini & React
          </p>
        </div>
      </footer>
    </div>
  );
}
