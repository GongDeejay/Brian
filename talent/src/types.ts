export type Language = "zh" | "en";

export type DimensionKey =
  | "naturalEase"       // 隐性优势与轻巧度 (阻力最小法则)
  | "energyFlow"        // 精力审计与心流体验 (充能与耗能)
  | "socialMirror"      // 外部镜像与求助盲区 (乔哈里视窗)
  | "gritTolerance"     // 阻力耐受与细节韧性 (枯燥耐心)
  | "cognitiveAptitude" // 认知与智能倾向 (RIASEC / 多元智能)
  | "latentDesire";     // 潜意识渴望与反向投射 (嫉妒与本能)

export interface DimensionInfo {
  key: DimensionKey;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  sourceTheory: string;
  coreQuestion: string;
}

export interface QuizQuestion {
  id: number;
  dimension: DimensionKey;
  title: string;
  scenario: string;
  academicAnchor: string;
  options: {
    label: string;
    score: number; // 1 to 5
    description?: string;
  }[];
}

export interface QualitativeQuestion {
  id: string;
  dimension: DimensionKey;
  badge: string;
  title: string;
  subtitle: string;
  heuristicPrinciple: string;
  academicBasis: string;
  guidingPrompts: string[];
  exemplarStory: string;
  placeholder: string;
}

export interface ArchetypeProfile {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  badgeColor: string;
  accentColor: string;
  coreNature: string;
  specificKnowledge: string;
  signSignature: {
    success: string;
    instinct: string;
    grow: string;
    need: string;
  };
  recommendedDomains: {
    title: string;
    description: string;
    roles: string[];
  }[];
  skillStackingFormula: {
    baseSkill: string;
    amplifier: string;
    uniqueResult: string;
    analysis: string;
  };
  highEnergyContext: string[];
  drainEnergyContext: string[];
  shadowBlindspots: {
    pitfall: string;
    antidote: string;
  }[];
  famousFigures: string[];
}

export interface EnergyLogItem {
  id: string;
  timestamp: string;
  title: string;
  type: "flow" | "energizing" | "draining" | "neutral";
  category: "work" | "study" | "creation" | "social" | "routine";
  note: string;
  energyShift: number; // -3 to +3
}

export interface MirrorFeedbackItem {
  id: string;
  relation: "colleague" | "friend" | "mentor" | "family";
  relationLabel: string;
  content: string;
  strengthsExtracted: string[];
  timestamp: string;
}

export interface UserAssessmentState {
  answers: Record<number, number>; // questionId -> score (1-5)
  qualitativeAnswers: Record<string, string>; // qualitative questionId -> string
  scores: Record<DimensionKey, number>; // 0 - 100
  dominantArchetypeId: string;
  secondaryArchetypeId: string;
  completedAt?: string;
}

export interface AIAnalysisReport {
  executiveSummary: string;
  superpowerTitle: string;
  specificKnowledge: {
    coreDefinition: string;
    uniqueTraits: string[];
  };
  signAnalysis: {
    success: string;
    instinct: string;
    grow: string;
    need: string;
  };
  idealDomains: {
    domainName: string;
    matchReason: string;
    typicalRoles: string[];
    synergyIndex: number;
  }[];
  skillStackingStrategy: {
    primarySkill: string;
    secondarySkill: string;
    leverageFormula: string;
    explanation: string;
  };
  shadowAndBlindspots: {
    blindspot: string;
    antidote: string;
  }[];
  actionRoadmap: {
    phase: string;
    task: string;
  }[];
  goldenQuote: string;
}

export interface SavedAssessmentRecord {
  id: string;
  date: string;
  scores: Record<DimensionKey, number>;
  archetypeId: string;
  archetypeTitle: string;
  answers: Record<number, number>;
  reflectionAnswers: Record<string, string>;
  aiReport?: AIAnalysisReport | null;
}
