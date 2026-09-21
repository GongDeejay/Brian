import {
  AIAnalysisReport,
  DimensionKey,
  EnergyLogItem,
  Language,
  MirrorFeedbackItem,
  SavedAssessmentRecord,
} from "../types";
import { resolveArchetype } from "../data/englishArchetypes";
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
  reflectionAnswers: Record<string, string>,
  lang: Language = "zh"
): AIAnalysisReport {
  const profile = resolveArchetype(archetypeId, lang);
  const sign = calculateSIGNMetrics(scores, {});
  const en = lang === "en";
  const domainFallback = en ? "core arena" : "核心赛道";

  return {
    executiveSummary: en
      ? `Based on the multi-dimensional assessment and cognitive models, your signature structure is a classic ${profile.title} profile. You show instinctive ease around “${profile.tagline}”. Friction is low, flow is high, and others already recognize the quality of your work. Stack complementary skills to turn this long board into an irreplaceable moat.`
      : `基于多维测评与认知心理学模型测算，你的核心专长结构呈现典型的「${profile.title}」特质。你在“${profile.tagline}”方面展现出本能般的直觉优势。你处理该类任务时认知摩擦极小、心流充沛，且外界普遍认可你的成果品质。建议通过能力叠加（Skill Stacking）将核心长板构筑为不可替代的复合型护城河。`,
    superpowerTitle: en
      ? `Talent label: ${profile.title} · ${profile.subtitle}`
      : `天赋标签：${profile.title} · ${profile.subtitle}`,
    specificKnowledge: {
      coreDefinition: profile.specificKnowledge,
      uniqueTraits: en
        ? [
            "Very low friction: what others treat as hard labor, you resolve by intuition",
            "High energy density: you finish more alive, with self-sustaining drive",
            "A scarce cognitive lens: you restructure chaotic situations unusually fast",
          ]
        : [
            "极低的阻力感：他人视为高难度繁琐事项，你凭直觉轻巧化解",
            "高能量密度：做完后往往精神亢奋，具备天然的自发持续动力",
            "稀缺认知透镜：能够用独到的结构或视角快速重组外部混乱局面",
          ],
    },
    signAnalysis: {
      success: en
        ? `Success index (${sign.success}/100): ${profile.signSignature.success}`
        : `胜任力指数(${sign.success}/100)：${profile.signSignature.success}`,
      instinct: en
        ? `Instinct index (${sign.instinct}/100): ${profile.signSignature.instinct}`
        : `渴望指数(${sign.instinct}/100)：${profile.signSignature.instinct}`,
      grow: en
        ? `Grow index (${sign.grow}/100): ${profile.signSignature.grow}`
        : `成长指数(${sign.grow}/100)：${profile.signSignature.grow}`,
      need: en
        ? `Need index (${sign.need}/100): ${profile.signSignature.need}`
        : `滋养指数(${sign.need}/100)：${profile.signSignature.need}`,
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
    actionRoadmap: en
      ? [
          {
            phase: "Phase 1 (7 days): minimum strength test & energy audit",
            task: "Log energy for 3–5 days to see which chores drain you; ask two trusted people to name the strengths you miss in yourself.",
          },
          {
            phase: "Phase 2 (30 days): miniature closed-loop delivery (MVP)",
            task: `Around your high-fit arena 「${profile.recommendedDomains[0]?.title || domainFallback}」, independently ship a concrete artifact and collect real feedback.`,
          },
          {
            phase: "Phase 3 (90 days): build a specific-knowledge moat",
            task: `Using the stacking formula (${profile.skillStackingFormula.baseSkill} + ${profile.skillStackingFormula.amplifier}), earn irreplaceable reputation in a narrow lane.`,
          },
        ]
      : [
          {
            phase: "阶段一（7天）：优势最小验证与精力审计",
            task: "连续记录3-5天精力日志，彻底辨析哪些日常事务正在吞噬你的精力；主动向2位信任的朋友求证你的盲区特长。",
          },
          {
            phase: "阶段二（30天）：微型闭环交付（MVP）",
            task: `围绕你擅长的「${profile.recommendedDomains[0]?.title || domainFallback}」，以最小可行性方案独立交付一个具象成果并获取真实反馈。`,
          },
          {
            phase: "阶段三（90天）：打造专长护城河与生态",
            task: `根据技能叠加公式（${profile.skillStackingFormula.baseSkill} + ${profile.skillStackingFormula.amplifier}），在细分赛道建立不可替代的个人专业声誉。`,
          },
        ],
    goldenQuote: en
      ? "“No one can compete with you at being you.” — Polish your natural advantage to the extreme, and the world makes way."
      : `“没有人能在做你自己这件事上与你竞争。”—— 将你的天然优势打磨到极致，世界自会为你让路。`,
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

const ENERGY_KEY = "talent_compass_energy_v1";
const MIRROR_KEY = "talent_compass_mirror_v1";

function readJsonArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function getEnergyLogs(): EnergyLogItem[] {
  return readJsonArray<EnergyLogItem>(ENERGY_KEY);
}

export function saveEnergyLogs(items: EnergyLogItem[]) {
  try {
    localStorage.setItem(ENERGY_KEY, JSON.stringify(items.slice(0, 50)));
  } catch (e) {
    console.error("Save energy logs failed:", e);
  }
}

export function getMirrorLogs(): MirrorFeedbackItem[] {
  return readJsonArray<MirrorFeedbackItem>(MIRROR_KEY);
}

export function saveMirrorLogs(items: MirrorFeedbackItem[]) {
  try {
    localStorage.setItem(MIRROR_KEY, JSON.stringify(items.slice(0, 50)));
  } catch (e) {
    console.error("Save mirror logs failed:", e);
  }
}
