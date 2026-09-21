import { AIAnalysisReport, DimensionKey, SavedAssessmentRecord } from "../types";
import { ARCHETYPES } from "../data/archetypes";
import { ASSESSMENT_QUESTIONS } from "../data/questions";

// Calculate 0-100 scores for each dimension
export function calculateDimensionScores(answers: Record<number, number>): Record<DimensionKey, number> {
  const dimensionSums: Record<DimensionKey, number> = {
    naturalEase: 0,
    energyFlow: 0,
    socialMirror: 0,
    gritTolerance: 0,
    cognitiveAptitude: 0,
    latentDesire: 0,
  };

  const dimensionCounts: Record<DimensionKey, number> = {
    naturalEase: 0,
    energyFlow: 0,
    socialMirror: 0,
    gritTolerance: 0,
    cognitiveAptitude: 0,
    latentDesire: 0,
  };

  ASSESSMENT_QUESTIONS.forEach((q) => {
    const score = answers[q.id] || 3; // default neutral 3 if skipped
    dimensionSums[q.dimension] += score;
    dimensionCounts[q.dimension] += 1;
  });

  const finalScores: Record<DimensionKey, number> = {
    naturalEase: 0,
    energyFlow: 0,
    socialMirror: 0,
    gritTolerance: 0,
    cognitiveAptitude: 0,
    latentDesire: 0,
  };

  (Object.keys(dimensionSums) as DimensionKey[]).forEach((key) => {
    const count = dimensionCounts[key] || 1;
    const avg = dimensionSums[key] / count; // 1.0 to 5.0
    // Convert 1.0 - 5.0 to 20 - 100
    const scaled = Math.round(((avg - 1) / 4) * 80 + 20);
    finalScores[key] = Math.min(100, Math.max(20, scaled));
  });

  return finalScores;
}

// Determine dominant and secondary archetypes
export function determineArchetype(
  scores: Record<DimensionKey, number>,
  answers: Record<number, number>
): { dominant: string; secondary: string } {
  // Specific question signals
  const q17 = answers[17] || 3; // 系统架构倾向
  const q18 = answers[18] || 3; // 人际共情倾向
  const q19 = answers[19] || 3; // 美学叙事倾向
  const q20 = answers[20] || 3; // 商业撬动倾向
  const q13 = answers[13] || 3; // 细节打磨韧性 (工匠)
  const q15 = answers[15] || 3; // 底层原典探索 (分析师)
  const q1 = answers[1] || 3;   // 上手极快
  const q7 = answers[7] || 3;   // 跃跃欲试探索

  const archetypeScores: Record<string, number> = {
    architect: (scores.naturalEase * 0.2) + (scores.cognitiveAptitude * 0.4) + (q17 * 8) + (scores.gritTolerance * 0.2),
    catalyst: (scores.socialMirror * 0.35) + (scores.energyFlow * 0.25) + (q18 * 8) + (scores.naturalEase * 0.2),
    alchemist: (scores.latentDesire * 0.35) + (scores.energyFlow * 0.25) + (q19 * 8) + (scores.gritTolerance * 0.2),
    pathfinder: (scores.latentDesire * 0.3) + (scores.energyFlow * 0.3) + (q7 * 8) + (scores.naturalEase * 0.2),
    craftsman: (scores.gritTolerance * 0.4) + (scores.naturalEase * 0.2) + (q13 * 8) + (scores.cognitiveAptitude * 0.2),
    analyst: (scores.cognitiveAptitude * 0.35) + (scores.gritTolerance * 0.25) + (q15 * 8) + (scores.naturalEase * 0.2),
    connector: (scores.socialMirror * 0.35) + (scores.energyFlow * 0.2) + (q20 * 8) + (scores.latentDesire * 0.2),
    polymath: (scores.naturalEase * 0.3) + (scores.energyFlow * 0.25) + (scores.cognitiveAptitude * 0.25) + (q1 * 6),
  };

  const sorted = Object.entries(archetypeScores).sort((a, b) => b[1] - a[1]);
  return {
    dominant: sorted[0]?.[0] || "architect",
    secondary: sorted[1]?.[0] || "polymath",
  };
}

// Calculate Gallup SIGN Model Scores (0-100)
export function calculateSIGNMetrics(
  scores: Record<DimensionKey, number>,
  answers: Record<number, number>
) {
  // S - Success (胜任度): naturalEase & socialMirror
  const success = Math.round((scores.naturalEase * 0.5 + scores.socialMirror * 0.5));
  // I - Instinct (本能渴望): latentDesire & energyFlow
  const instinct = Math.round((scores.latentDesire * 0.6 + scores.energyFlow * 0.4));
  // G - Grow (快速成长): naturalEase & cognitiveAptitude
  const grow = Math.round((scores.naturalEase * 0.55 + scores.cognitiveAptitude * 0.45));
  // N - Need (内在滋养): energyFlow & gritTolerance
  const need = Math.round((scores.energyFlow * 0.6 + scores.gritTolerance * 0.4));

  return { success, instinct, grow, need };
}

// Generate Offline Fallback Report
export function generateOfflineAnalysis(
  scores: Record<DimensionKey, number>,
  archetypeId: string,
  reflectionAnswers: Record<string, string>
): AIAnalysisReport {
  const profile = ARCHETYPES[archetypeId] || ARCHETYPES.architect;
  const sign = calculateSIGNMetrics(scores, {});

  return {
    executiveSummary: `基于多维测评与认知心理学模型测算，你的核心专长结构呈现典型的「${profile.title}」特质。你在“${profile.tagline}”方面展现出本能般的直觉优势。你处理该类任务时认知摩擦极小、心流充沛，且外界普遍认可你的成果品质。建议通过能力叠加（Skill Stacking）将核心长板构筑为不可替代的复合型护城河。`,
    superpowerTitle: `天赋标签：${profile.title} · ${profile.subtitle}`,
    specificKnowledge: {
      coreDefinition: profile.specificKnowledge,
      uniqueTraits: [
        "极低的阻力感：他人视为高难度繁琐事项，你凭直觉轻巧化解",
        "高能量密度：做完后往往精神亢奋，具备天然的自发持续动力",
        "稀缺认知透镜：能够用独到的结构或视角快速重组外部混乱局面",
      ],
    },
    signAnalysis: {
      success: `胜任力指数(${sign.success}/100)：${profile.signSignature.success}`,
      instinct: `渴望指数(${sign.instinct}/100)：${profile.signSignature.instinct}`,
      grow: `成长指数(${sign.grow}/100)：${profile.signSignature.grow}`,
      need: `滋养指数(${sign.need}/100)：${profile.signSignature.need}`,
    },
    idealDomains: profile.recommendedDomains.map((d, index) => ({
      domainName: d.title,
      matchReason: d.description,
      typicalRoles: d.roles,
      synergyIndex: 94 - index * 6,
    })),
    skillStackingStrategy: {
      primarySkill: profile.skillStackingFormula.baseSkill,
      secondarySkill: profile.skillStackingFormula.amplifier,
      leverageFormula: `[${profile.skillStackingFormula.baseSkill}] × [${profile.skillStackingFormula.amplifier}] = ${profile.skillStackingFormula.uniqueResult}`,
      explanation: profile.skillStackingFormula.analysis,
    },
    shadowAndBlindspots: profile.shadowBlindspots.map((s) => ({
      blindspot: s.pitfall,
      antidote: s.antidote,
    })),
    actionRoadmap: [
      {
        phase: "阶段一（7天）：优势最小验证与精力审计",
        task: "连续记录3-5天精力日志，彻底辨析哪些日常事务正在吞噬你的精力；主动向2位信任的朋友求证你的盲区特长。",
      },
      {
        phase: "阶段二（30天）：微型闭环交付（MVP）",
        task: `围绕你擅长的「${profile.recommendedDomains[0]?.title || "核心赛道"}」，以最小可行性方案独立交付一个具象成果并获取真实反馈。`,
      },
      {
        phase: "阶段三（90天）：打造专长护城河与生态",
        task: `根据技能叠加公式（${profile.skillStackingFormula.baseSkill} + ${profile.skillStackingFormula.amplifier}），在细分赛道建立不可替代的个人专业声誉。`,
      },
    ],
    goldenQuote: `“没有人能在做你自己这件事上与你竞争。”—— 将你的天然优势打磨到极致，世界自会为你让路。`,
  };
}

// Local Storage History Helpers
const STORAGE_KEY = "talent_compass_history_v1";

export function getSavedAssessments(): SavedAssessmentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAssessmentRecord(record: SavedAssessmentRecord) {
  try {
    const existing = getSavedAssessments();
    const updated = [record, ...existing.filter((r) => r.id !== record.id)].slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Save assessment record failed:", e);
  }
}
