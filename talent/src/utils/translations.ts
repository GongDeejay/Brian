import { DimensionKey, Language } from "../types";

export interface TranslationDictionary {
  appName: string;
  appSub: string;
  badgeTag: string;
  nav: {
    quiz: string;
    qualitative: string;
    report: string;
    energy: string;
    mirror: string;
    theories: string;
    retake: string;
    viewReport: string;
    reportReady: string;
    heuristicBadge: string;
  };
  dimensions: Record<
    DimensionKey,
    {
      name: string;
      shortName: string;
      description: string;
      sourceTheory: string;
      coreQuestion: string;
    }
  >;
  quiz: {
    title: string;
    subtitle: string;
    progress: string;
    dimensionBadge: string;
    prev: string;
    next: string;
    finish: string;
    fillDemo: string;
    reset: string;
    scoringGuide: string;
    options: {
      1: { label: string; desc: string };
      2: { label: string; desc: string };
      3: { label: string; desc: string };
      4: { label: string; desc: string };
      5: { label: string; desc: string };
    };
    unansweredTip: string;
    completedTip: string;
  };
  qualitative: {
    title: string;
    subtitle: string;
    badge: string;
    saveBtn: string;
    saved: string;
    jumpToReport: string;
    tipsTitle: string;
    tipsContent: string;
  };
  report: {
    title: string;
    subtitle: string;
    radarTitle: string;
    radarDesc: string;
    dominantArchetype: string;
    secondaryArchetype: string;
    coreNatureTitle: string;
    specificKnowledgeTitle: string;
    specificKnowledgeDesc: string;
    signTitle: string;
    signSubtitle: string;
    signSuccess: string;
    signInstinct: string;
    signGrow: string;
    signNeed: string;
    recommendedDomains: string;
    skillStacking: string;
    highEnergyZone: string;
    drainEnergyZone: string;
    shadowBlindspots: string;
    famousFigures: string;
    aiDeepDiagnosis: string;
    aiGenerating: string;
    aiCompletedBadge: string;
    offlineModeBadge: string;
    historyTitle: string;
    historyEmpty: string;
    loadRecord: string;
    printExport: string;
    retakeBtn: string;
  };
  energy: {
    title: string;
    subtitle: string;
    statsFlow: string;
    statsDrain: string;
    statsNet: string;
    addBtn: string;
    demoBtn: string;
    emptyText: string;
    typeFlow: string;
    typeEnergizing: string;
    typeDraining: string;
    typeNeutral: string;
    modalTitle: string;
    formTitle: string;
    formCategory: string;
    formType: string;
    formNote: string;
    formShift: string;
    save: string;
    cancel: string;
  };
  mirror: {
    title: string;
    subtitle: string;
    inviteTitle: string;
    inviteDesc: string;
    copyPromptBtn: string;
    copied: string;
    addBtn: string;
    demoBtn: string;
    emptyText: string;
    modalTitle: string;
    relationColleague: string;
    relationFriend: string;
    relationMentor: string;
    relationFamily: string;
    relationLabel: string;
    feedbackContent: string;
    strengthsPlaceholder: string;
    save: string;
    cancel: string;
  };
  theories: {
    title: string;
    subtitle: string;
    badge: string;
    filterAll: string;
    filterVideo: string;
    filterAcademic: string;
    heuristicsTitle: string;
    actionStepsTitle: string;
    sourcePrefix: string;
  };
  footer: {
    tagline: string;
    credits: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  zh: {
    appName: "优势潜能罗盘",
    appSub: "基于视频启发法与经典心理学学术模型的自我擅长领域分析原型",
    badgeTag: "TalentCompass",
    nav: {
      quiz: "量化测评",
      qualitative: "定性反思",
      report: "诊断报告",
      energy: "精力审计日志",
      mirror: "360°外部镜像",
      theories: "学术方法论库",
      retake: "重新测评",
      viewReport: "查看报告",
      reportReady: "已就绪",
      heuristicBadge: "启发式",
    },
    dimensions: {
      naturalEase: {
        name: "隐性优势与自然轻巧度",
        shortName: "轻巧不费力",
        description: "你做起来毫不费力甚至以为是“常识”，但他人却觉得极具门槛或倍感吃力的领域。",
        sourceTheory: "纳瓦尔专长理论 (Specific Knowledge) / 阻力最小法则",
        coreQuestion: "哪些事情对你而言像呼吸般自然，对他人却如劳作般痛苦？",
      },
      energyFlow: {
        name: "精力审计与心流体验",
        shortName: "充能与心流",
        description: "完成该项任务后是让你感到精神倍增还是被榨干？在过程中是否会忘却时间流逝。",
        sourceTheory: "米哈里心流理论 (Csikszentmihalyi Flow) / 盖洛普精力审计",
        coreQuestion: "做哪些事情哪怕连续投入数小时，结束后依然双眼放光、精神饱满？",
      },
      socialMirror: {
        name: "外部镜像与求助盲区",
        shortName: "外部求助盲区",
        description: "他人遇到什么死结时最先想到向你求助？朋友或同事最常真诚赞叹你的独特品质。",
        sourceTheory: "乔哈里视窗 (Johari Window 盲点象限) / 社会认同信号",
        coreQuestion: "他人最习惯把哪类最棘手或杂乱的问题放心地交给你处理？",
      },
      gritTolerance: {
        name: "阻力耐受与细节韧性",
        shortName: "细节阻力耐受",
        description: "在某一领域中，他人觉得痛苦枯燥、难以忍受的繁琐细节，你却能津津有味地死磕到底。",
        sourceTheory: "安吉拉·达克沃斯坚毅理论 (Grit) / 纳瓦尔“枯燥耐受”",
        coreQuestion: "为了追求哪类事情的极致结果，你愿意耐下心反复推敲打磨常人无法忍受的微小细节？",
      },
      cognitiveAptitude: {
        name: "认知与智能倾向",
        shortName: "认知智能倾向",
        description: "你更习惯于逻辑推演、空间视觉、人际共情、自然观察还是言语符号进行深度思考。",
        sourceTheory: "霍兰德职业兴趣 (RIASEC) / 加德纳多元智能理论 (Multiple Intelligences)",
        coreQuestion: "面对新信息时，你的大脑最本能激活哪种信息解码通道？",
      },
      latentDesire: {
        name: "潜意识渴望与本能驱动",
        shortName: "潜能渴望投射",
        description: "你暗自嫉妒或秘密羡慕谁的成就？如果不考虑任何经济报酬与世俗评价，你真正渴望精通什么。",
        sourceTheory: "心理动力学投射机制 (Psychological Projection) / 盖洛普 Instinct 渴望",
        coreQuestion: "当你看到某些特定人物的卓越成果时，内心最隐秘的刺痛与向往是什么？",
      },
    },
    quiz: {
      title: "优势潜能六维深度量化测评",
      subtitle: "共24道情境化自查题目，深度评估您的天赋特异性与内在认知能量结构。",
      progress: "答题进度",
      dimensionBadge: "测评维度",
      prev: "上一题",
      next: "下一题",
      finish: "完成测评并生成报告",
      fillDemo: "一键填入演示数据",
      reset: "重置答案",
      scoringGuide: "基于1-5分李克特量表，请根据你的真实第一直觉打分",
      options: {
        1: { label: "完全不符合", desc: "极少有这种体验，几乎完全不符合我的状态" },
        2: { label: "较不符合", desc: "偶有类似经历，但大多数时候并非如此" },
        3: { label: "部分符合", desc: "在特定情境下存在，中立居中" },
        4: { label: "比较符合", desc: "经常有类似感受，贴合我的日常表现" },
        5: { label: "非常符合", desc: "非常典型，与我的本能直觉完全高度契合" },
      },
      unansweredTip: "还有部分题目未作答，完成所有题目后即可解锁完整量化诊断与AI深度报告！",
      completedTip: "已完成所有题目，点击下方按钮立即查看您的多维天赋诊断报告！",
    },
    qualitative: {
      title: "定性深度启发式反思",
      subtitle: "结合视频中的五大核心挖掘维度与学术启发法，用文字唤醒您沉睡的隐性优势线索。",
      badge: "质性深度挖掘",
      saveBtn: "保存反思心得",
      saved: "已保存反思记录",
      jumpToReport: "前往诊断报告",
      tipsTitle: "💡 填写小贴士",
      tipsContent: "这些质性反思将直接输入给 AI 诊断引擎，用于生成独一无二的纳瓦尔专长组合与 SIGN 天赋模型！请尽可能写下真实的具体细节与场景。",
    },
    report: {
      title: "个人擅长领域与天赋优势诊断报告",
      subtitle: "融合六维量化雷达、定性启发式线索与纳瓦尔专长组合的深度分析报告",
      radarTitle: "六维天赋能量雷达图",
      radarDesc: "基于24道情景化测试的能量倾向与认知优势分布",
      dominantArchetype: "主导优势原型",
      secondaryArchetype: "次级杠杆原型",
      coreNatureTitle: "核心天赋本质",
      specificKnowledgeTitle: "纳瓦尔“专长”（Specific Knowledge）定义",
      specificKnowledgeDesc: "对你如同玩耍，对他人如同劳作的独特特异性能力",
      signTitle: "盖洛普 SIGN 优势特征解码",
      signSubtitle: "Success / Instinct / Grow / Need 四要素解析",
      signSuccess: "成功标志 (Success)：为何你低成本交付高品质？",
      signInstinct: "本能渴望 (Instinct)：你的注意力如何被自动捕获？",
      signGrow: "快速成长 (Grow)：认知陡峭的学习曲线在何处？",
      signNeed: "深层满足 (Need)：完成该任务后精神如何获得闭环？",
      recommendedDomains: "推荐擅长领域与高契合赛道",
      skillStacking: "能力叠加公式 (Skill Stacking Formula)",
      highEnergyZone: "⚡ 充能心流场景 (High Energy)",
      drainEnergyZone: "🪫 严重耗能雷区 (Energy Draining)",
      shadowBlindspots: "⚠️ 优势暗面与盲点破解 (Shadows & Blindspots)",
      famousFigures: "🌟 典型代表人物 (Exemplar Figures)",
      aiDeepDiagnosis: "生成 Gemini AI 深度穿透式诊断",
      aiGenerating: "正在由 Gemini 深度综合全维度数据穿透分析中...",
      aiCompletedBadge: "AI 深度定制分析已就绪",
      offlineModeBadge: "本地基础诊断版",
      historyTitle: "历史测评存档",
      historyEmpty: "暂无历史存档，每次测评生成后都会在此自动归档。",
      loadRecord: "载入此记录",
      printExport: "导出 / 打印报告",
      retakeBtn: "重新测评",
    },
    energy: {
      title: "精力审计日常日志 (Energy Audit Tracker)",
      subtitle: "追踪你的心流事件与耗能枯竭点，用真实生理/心理精力数据定位真优势",
      statsFlow: "心流/充能事件",
      statsDrain: "高能耗竭事件",
      statsNet: "精力净差值",
      addBtn: "记录一条精力事件",
      demoBtn: "填入日常示例",
      emptyText: "暂无精力记录，点击上方按钮记录你的日常精力得失吧！",
      typeFlow: "🌊 心流充能 (Flow +3)",
      typeEnergizing: "⚡ 提振精力 (Energizing +2)",
      typeDraining: "🪫 消耗疲惫 (Draining -2)",
      typeNeutral: "⚖️ 中性平稳 (Neutral 0)",
      modalTitle: "记录精力日志",
      formTitle: "事件简述",
      formCategory: "事件分类",
      formType: "精力感受类型",
      formNote: "心流感受或耗能反思笔记",
      formShift: "精力影响评分 (-3 到 +3)",
      save: "保存记录",
      cancel: "取消",
    },
    mirror: {
      title: "360° 外部镜像与求助盲区 (Social Mirror)",
      subtitle: "乔哈里视窗盲点象限：通过朋友、同事与导师的视角发现自己视而不见的闪光点",
      inviteTitle: "向好友/同事征集反馈的模板文案",
      inviteDesc: "复制下方提示词，发给你信任的3-5位朋友或同事，听听他们眼中你不可替代的过人之处。",
      copyPromptBtn: "复制征询话术",
      copied: "话术已成功复制到剪贴板！",
      addBtn: "录入一条外部反馈",
      demoBtn: "载入真实镜像示例",
      emptyText: "暂无外部镜像记录，点击上方录入或发送提示词给好友吧！",
      modalTitle: "录入外部镜像反馈",
      relationColleague: "同事 / 业务搭档",
      relationFriend: "挚友 / 同学",
      relationMentor: "导师 / 上级领导",
      relationFamily: "家人 / 伴侣",
      relationLabel: "身份标签 (例如：前司高级研发经理)",
      feedbackContent: "对方的原话反馈与具体评价",
      strengthsPlaceholder: "提取的优势关键词 (用逗号或空格隔开)",
      save: "保存反馈",
      cancel: "取消",
    },
    theories: {
      title: "理论依据与学术方法论知识库",
      subtitle: "自我擅长领域探索的学术与启发式全景解析",
      badge: "方法论架构",
      filterAll: "全部方法论",
      filterVideo: "🎬 视频核心启发法则",
      filterAcademic: "🎓 经典心理学术模型",
      heuristicsTitle: "💡 核心启发法则与自查标准：",
      actionStepsTitle: "🛠️ 个人实操练习行动：",
      sourcePrefix: "来源：",
    },
    footer: {
      tagline: "优势潜能罗盘 (TalentCompass) · 启发法来源：Bilibili 视频启发法 + 盖洛普 SIGN 模型 + 霍兰德 RIASEC + 纳瓦尔专长理论",
      credits: "Powered by Google Gemini & React",
    },
  },
  en: {
    appName: "Talent Compass",
    appSub: "A self-discovery assessment prototype grounded in heuristic methods and cognitive psychology models",
    badgeTag: "TalentCompass",
    nav: {
      quiz: "Quantitative Quiz",
      qualitative: "Qualitative Reflection",
      report: "Diagnostic Report",
      energy: "Energy Audit Log",
      mirror: "360° Social Mirror",
      theories: "Theory Codex",
      retake: "Retake Quiz",
      viewReport: "View Report",
      reportReady: "Ready",
      heuristicBadge: "Heuristics",
    },
    dimensions: {
      naturalEase: {
        name: "Natural Ease & Implicit Strength",
        shortName: "Natural Ease",
        description: "Domains where you excel effortlessly and assume it is 'just common sense', while others find it steep and laborious.",
        sourceTheory: "Naval's Specific Knowledge / Principle of Least Resistance",
        coreQuestion: "What feels like effortless play to you, but looks like grueling work to others?",
      },
      energyFlow: {
        name: "Energy Audit & Flow State",
        shortName: "Energy & Flow",
        description: "Tasks that recharge your mental battery rather than draining it, where you lose all track of time.",
        sourceTheory: "Csikszentmihalyi's Flow Theory / Gallup Energy Audit",
        coreQuestion: "Which activities leave you energized and enthusiastic even after several hours of continuous focus?",
      },
      socialMirror: {
        name: "Social Mirror & Help Signals",
        shortName: "Social Mirror",
        description: "The specific knotty problems colleagues and friends instinctively come to you to untangle.",
        sourceTheory: "Johari Window (Blind Spot) / Social Recognition Signals",
        coreQuestion: "What do people spontaneously seek your advice or assistance for without hesitation?",
      },
      gritTolerance: {
        name: "Grit & Detail Tolerance",
        shortName: "Grit & Details",
        description: "Tedious, repetitive details that others find insufferable, yet you enjoy meticulously polishing to perfection.",
        sourceTheory: "Angela Duckworth's Grit / Naval's Boredom Tolerance",
        coreQuestion: "For what craft do you willingly endure repetitive, painstaking iterations with quiet joy?",
      },
      cognitiveAptitude: {
        name: "Cognitive Aptitude & Intelligence",
        shortName: "Cognitive Profile",
        description: "Your brain's preferred default mode: systemic logic, spatial layout, empathy, or linguistic nuance.",
        sourceTheory: "Holland's RIASEC / Gardner's Multiple Intelligences",
        coreQuestion: "When processing new concepts, what encoding channel does your mind naturally rely on?",
      },
      latentDesire: {
        name: "Latent Desire & Instinctive Drive",
        shortName: "Latent Desire",
        description: "Who you secretly envy or admire, and what you would strive to master regardless of external vanity or compensation.",
        sourceTheory: "Psychodynamic Projection Mechanism / Gallup Instinct",
        coreQuestion: "Whose accomplishments trigger that subtle, instinctive pang of envy, signaling your latent potential?",
      },
    },
    quiz: {
      title: "Six-Dimensional Strengths Assessment",
      subtitle: "24 situational questions carefully calibrated to diagnose your cognitive strengths and internal energy profile.",
      progress: "Assessment Progress",
      dimensionBadge: "Assessment Dimension",
      prev: "Previous",
      next: "Next",
      finish: "Complete & Generate Report",
      fillDemo: "Fill Demo Data",
      reset: "Reset Answers",
      scoringGuide: "Based on a 1-5 Likert scale. Rate honestly according to your first intuitive reaction.",
      options: {
        1: { label: "Strongly Disagree", desc: "Rarely true for me; does not reflect my natural approach at all" },
        2: { label: "Disagree", desc: "Occasional glimpse, but usually not how I naturally operate" },
        3: { label: "Neutral", desc: "Sometimes applicable in specific situations; balanced" },
        4: { label: "Agree", desc: "Frequently true; aligns well with my regular behavior and strengths" },
        5: { label: "Strongly Agree", desc: "Completely resonant; strongly defines my intuitive superpower" },
      },
      unansweredTip: "Some questions remain unanswered. Complete all questions to unlock full diagnostic radar and AI insights!",
      completedTip: "All questions completed! Click below to view your personalized multi-dimensional diagnosis report.",
    },
    qualitative: {
      title: "Qualitative Heuristic Reflections",
      subtitle: "Combining video heuristic cues and psychological inquiry to surface your hidden implicit strengths.",
      badge: "In-Depth Inquiry",
      saveBtn: "Save Reflections",
      saved: "Reflections saved successfully",
      jumpToReport: "Go to Report",
      tipsTitle: "💡 Helpful Advice",
      tipsContent: "Your narrative reflections will feed directly into the Gemini AI engine to craft your custom Specific Knowledge formula and SIGN strengths profile. Concrete anecdotes yield the deepest insights!",
    },
    report: {
      title: "Personal Strengths & Talent Diagnostic Report",
      subtitle: "Comprehensive analysis synthesizing 6D quantitative radar, heuristic clues, and Naval's Specific Knowledge stack",
      radarTitle: "6-Dimensional Talent Energy Radar",
      radarDesc: "Cognitive energy distribution and natural aptitude mapping across 24 situational metrics",
      dominantArchetype: "Dominant Archetype",
      secondaryArchetype: "Secondary Leverage Archetype",
      coreNatureTitle: "Core Talent Nature",
      specificKnowledgeTitle: "Naval's 'Specific Knowledge' Formulation",
      specificKnowledgeDesc: "The unique skillset that feels like effortless play to you, but grueling work to others",
      signTitle: "Gallup SIGN Strengths Signature",
      signSubtitle: "Success / Instinct / Grow / Need 4-Factor Breakdown",
      signSuccess: "Success: Why do you deliver high-quality outcomes with low friction?",
      signInstinct: "Instinct: How is your subconscious attention automatically captivated?",
      signGrow: "Grow: Where does your steepest learning curve naturally occur?",
      signNeed: "Need: How does completing this work provide psychological replenishment?",
      recommendedDomains: "Recommended High-Synergy Career Domains",
      skillStacking: "Skill Stacking Formula",
      highEnergyZone: "⚡ High-Energy Flow Scenarios",
      drainEnergyZone: "🪫 Energy-Draining Pitfalls",
      shadowBlindspots: "⚠️ Shadow Sides & Countermeasures",
      famousFigures: "🌟 Exemplar Figures",
      aiDeepDiagnosis: "Generate Deep AI Diagnosis (Gemini)",
      aiGenerating: "Gemini is synthesizing cross-dimensional data for deep diagnosis...",
      aiCompletedBadge: "AI Deep Diagnosis Ready",
      offlineModeBadge: "Base Offline Diagnosis",
      historyTitle: "Assessment History Archive",
      historyEmpty: "No past assessments saved yet. Each new evaluation is automatically archived here.",
      loadRecord: "Load Record",
      printExport: "Export / Print Report",
      retakeBtn: "Retake Assessment",
    },
    energy: {
      title: "Energy Audit Tracker",
      subtitle: "Track your daily flow states and energy drainers to pinpoint true strengths using physiological energy data",
      statsFlow: "Flow / Energizing Events",
      statsDrain: "High-Drain Events",
      statsNet: "Net Energy Balance",
      addBtn: "Log Energy Event",
      demoBtn: "Load Demo Logs",
      emptyText: "No energy logs recorded yet. Click above to log your daily energy shifts!",
      typeFlow: "🌊 Flow State (+3)",
      typeEnergizing: "⚡ Energizing (+2)",
      typeDraining: "🪫 Draining (-2)",
      typeNeutral: "⚖️ Neutral (0)",
      modalTitle: "Log Energy Event",
      formTitle: "Event Summary",
      formCategory: "Category",
      formType: "Energy Feeling",
      formNote: "Reflective Notes & Feelings",
      formShift: "Energy Shift (-3 to +3)",
      save: "Save Log",
      cancel: "Cancel",
    },
    mirror: {
      title: "360° Social Mirror & Blind Spots",
      subtitle: "Johari Window blind spot quadrant: discover overlooked gifts through the eyes of trusted colleagues and mentors",
      inviteTitle: "Invitation Script for Peer Feedback",
      inviteDesc: "Copy this prompt and send it to 3-5 trusted peers to hear what they view as your irreplaceable superpower.",
      copyPromptBtn: "Copy Inquiry Script",
      copied: "Prompt copied to clipboard!",
      addBtn: "Add Peer Feedback",
      demoBtn: "Load Mirror Examples",
      emptyText: "No mirror feedback logs yet. Click above to record or copy the prompt for friends!",
      modalTitle: "Record Peer Feedback",
      relationColleague: "Colleague / Co-worker",
      relationFriend: "Close Friend / Classmate",
      relationMentor: "Mentor / Lead",
      relationFamily: "Family / Partner",
      relationLabel: "Role Title (e.g. Senior Engineering Manager)",
      feedbackContent: "Their verbatim comments & observations",
      strengthsPlaceholder: "Extracted keywords (comma or space separated)",
      save: "Save Feedback",
      cancel: "Cancel",
    },
    theories: {
      title: "Methodology & Academic Theory Codex",
      subtitle: "Academic and heuristic blueprints for identifying personal strengths and domains of excellence",
      badge: "Methodology Codex",
      filterAll: "All Theories",
      filterVideo: "🎬 Video Core Heuristics",
      filterAcademic: "🎓 Classic Academic Models",
      heuristicsTitle: "💡 Core Heuristics & Diagnostic Criteria:",
      actionStepsTitle: "🛠️ Practical Action Exercises:",
      sourcePrefix: "Source: ",
    },
    footer: {
      tagline: "Talent Compass · Heuristics: Bilibili Video Heuristics + Gallup SIGN + Holland RIASEC + Naval Specific Knowledge",
      credits: "Powered by Google Gemini & React",
    },
  },
};
