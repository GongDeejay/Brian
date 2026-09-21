export type Language = 'zh' | 'en';

export interface Translations {
  // Brand & Header
  appTitle: string;
  appBadge: string;
  appSubtitle: string;
  tabMindmap: string;
  tabSimulator: string;
  tabProtocols: string;
  searchPlaceholder: string;
  filterLabel: string;
  filterAll: string;
  btnBookIntro: string;
  btnSimulator: string;
  btnEnterSimulator: string;
  btnDisclaimer: string;

  // Header Banner Ribbon
  bannerTitle: string;
  bannerDesc: string;
  ribbonTitle: string;
  ribbonDesc: string;

  // Pillars Strip
  pillarsTitle: string;
  pillarsStripTitle: string;
  pillarsSubMechanisms: string;
  pillarsInspectAction: string;

  // MindMap Controls & Canvas
  viewTree: string;
  viewRadial: string;
  viewBento: string;
  expandAll: string;
  collapseBranches: string;
  zoomReset: string;
  canvasTip: string;
  searchResultsFound: string;
  noSearchResults: string;
  clickToInspect: string;
  subMechanismsCount: string;

  // Node Detail Drawer
  importanceCore: string;
  importanceHigh: string;
  importancePractice: string;
  corePrincipleTitle: string;
  scientificExplanationTitle: string;
  classicExperimentTitle: string;
  actionProtocolTitle: string;
  subMechanismsTitle: string;
  tagsTitle: string;
  btnAddToPlan: string;
  btnAddedToPlan: string;
  closeDrawer: string;

  // Synaptic Simulator
  simTitle: string;
  simBadge: string;
  simSubtitle: string;
  simSynapticStrength: string;
  simConductionSpeed: string;
  simAxonTerminal: string;
  simDendriticSpine: string;
  simAmpaReceptor: string;
  simNmdaReceptor: string;
  simPulseCount: string;
  simFiring: string;
  simReady: string;
  simControlTitle: string;
  btnFirePulse: string;
  btnDeliberatePractice: string;
  btnInjectBdnf: string;
  btnInjectBdnfActive: string;
  btnWrapMyelin: string;
  btnDisuseLtd: string;
  btnResetSim: string;
  simElectrophysiologyLog: string;
  simCoreInsightTitle: string;
  simCoreInsightText: string;

  // Practice Protocol Tracker
  protoBadge: string;
  protoTitle: string;
  protoSubtitle: string;
  protoProgressToday: string;
  protoItemsCount: string;
  protoReset: string;
  protoMarkDone: string;
  protoDifficulty: string;
  protoRationaleTitle: string;
  protoStepsTitle: string;
  protoKeyMolecules: string;
  protoCustomDrillsTitle: string;
  protoCustomDrillsSubtitle: string;
  protoDeleteDrill: string;
  protoDrillPlaceholder: string;
  btnAddDrill: string;

  // Footer & Disclaimer
  footerNote: string;
  disclaimerTitle: string;
  disclaimerSubtitle: string;
  disclaimerAcademicTitle: string;
  disclaimerAcademicText: string;
  disclaimerMedicalTitle: string;
  disclaimerMedicalText: string;
  disclaimerPrivacyTitle: string;
  disclaimerPrivacyText: string;
  disclaimerButtonAcknowledge: string;
  disclaimerFooterNotice: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  zh: {
    appTitle: '《神经可塑性》互动思维导图',
    appBadge: '原著脑科学全景',
    appSubtitle: '可视化大脑重塑的关键机制、神经化学催化剂与日常实践方法论',
    tabMindmap: '交互式思维导图',
    tabSimulator: '赫布突触模拟沙盘',
    tabProtocols: '大脑重塑实践协议',
    searchPlaceholder: '搜索神经机制、分子(BDNF)、实验(梅泽尼奇/海马体)或实践...',
    filterLabel: '分类:',
    filterAll: '全脑视野 (全部)',
    btnBookIntro: '原著精要背景',
    btnSimulator: '进入突触沙盘',
    btnEnterSimulator: '进入突触沙盘',
    btnDisclaimer: '医疗与学术声明',

    bannerTitle: '《神经可塑性》核心思维脉络：用进废退与动态布线',
    bannerDesc: '本图谱完整解构了诺曼·道伊奇与莫赫布·科斯塔迪的原著观点。点击任意节点可展开经典生物学实验、突触级反应机制以及每日可执行的重塑实践指令。',
    ribbonTitle: '《神经可塑性》核心思维脉络：用进废退与动态布线',
    ribbonDesc: '本图谱完整解构了诺曼·道伊奇与莫赫布·科斯塔迪的原著观点。点击任意节点可展开经典生物学实验、突触级反应机制以及每日可执行的重塑实践指令。',

    pillarsTitle: '原著六大核心知识模块速览 (点击快速穿透至节点)',
    pillarsStripTitle: '原著六大核心知识模块速览 (点击快速穿透至节点)',
    pillarsSubMechanisms: '个子机制',
    pillarsInspectAction: '查看实验与行动协议',

    viewTree: '经典树状图',
    viewRadial: '星轨发散图',
    viewBento: '全景矩阵模式',
    expandAll: '全部展开',
    collapseBranches: '收缩分支',
    zoomReset: '居中重置',
    canvasTip: '💡 拖拽空白处移动画布 • 滚轮缩放视图 • 点击节点阅读原著实验与行动协议',
    searchResultsFound: '个匹配节点',
    noSearchResults: '未匹配到相关机制节点，请尝试其他关键词',
    clickToInspect: '点击展开深度机制',
    subMechanismsCount: '个子分支',

    importanceCore: '核心基石',
    importanceHigh: '高度重要',
    importancePractice: '实操落地',
    corePrincipleTitle: '重塑核心定律',
    scientificExplanationTitle: '生理机制深度解析',
    classicExperimentTitle: '经典科学实验与临床实证',
    actionProtocolTitle: '日常刻意重塑实践指令',
    subMechanismsTitle: '下辖分支与微观机制',
    tagsTitle: '检索标签',
    btnAddToPlan: '纳入今日重塑实践计划',
    btnAddedToPlan: '已加入重塑行动协议',
    closeDrawer: '关闭详情面板',

    simTitle: '赫布突触重塑动态模拟沙盘',
    simBadge: '微观细胞级仿真',
    simSubtitle: '亲手验证《神经可塑性》核心：“Neurons that fire together, wire together (同频共振，联结强化)”',
    simSynapticStrength: '突触强度',
    simConductionSpeed: '传导速度',
    simAxonTerminal: '轴突末梢 (前膜)',
    simDendriticSpine: '树突棘 (后膜)',
    simAmpaReceptor: 'AMPA受体 (信号增强)',
    simNmdaReceptor: 'NMDA受体 (塑性大门)',
    simPulseCount: '动作电位释放计数',
    simFiring: '⚡ 动作电位传导中...',
    simReady: '准备就绪',
    simControlTitle: '重塑干预控制台',
    btnFirePulse: '激发单次动作电位 (Fire Pulse)',
    btnDeliberatePractice: '密集刻意练习 (促发LTP)',
    btnInjectBdnf: '注入BDNF肥料',
    btnInjectBdnfActive: 'BDNF已注入',
    btnWrapMyelin: '加厚髓鞘 (+1层)',
    btnDisuseLtd: '闲置废用 (促发LTD)',
    btnResetSim: '重置实验',
    simElectrophysiologyLog: '细胞重塑实时电生理日志',
    simCoreInsightTitle: '原著核心洞见：',
    simCoreInsightText: '高频连续刺激（密集刻意练习）使得突触后膜AMPA受体数量大增，解除NMDA受体镁离子阻断，形成长时程增强（LTP）；随后少突胶质细胞包裹髓鞘，将临时电生理活动固化为永久性的高导速生理网络。',

    protoBadge: '科学实操转化',
    protoTitle: '大脑重塑临床与日常实践协议清单',
    protoSubtitle: '将《神经可塑性》书中关于海马体神经发生、突触LTP、髓鞘加厚及习惯旁路替代的理论，转化为每日可落地的微习惯。',
    protoProgressToday: '今日重塑实践达标率',
    protoItemsCount: '项',
    protoReset: '重置今日打卡',
    protoMarkDone: '标记为已实践',
    protoDifficulty: '难度',
    protoRationaleTitle: '脑神经生物学机制原理：',
    protoStepsTitle: '科学执行步骤与细则：',
    protoKeyMolecules: '关键激活神经分子',
    protoCustomDrillsTitle: '自定义重塑微动作 (Micro-Drills)',
    protoCustomDrillsSubtitle: '记录你今天打算打破的一个自动化习惯或新皮层刺激练习',
    protoDeleteDrill: '删除',
    protoDrillPlaceholder: '例如：闭目单脚站立30秒（刺激小脑前庭突触平衡）...',
    btnAddDrill: '添加微动作',

    footerNote: '基于认知神经科学经典《神经可塑性》与《重塑大脑，重塑人生》核心科学论据构建 • 交互式脑科学思维导图系统',
    disclaimerTitle: '学术科普与健康医疗免责声明',
    disclaimerSubtitle: '关于本站内容的学术渊源、使用范围与医疗合规说明',
    disclaimerAcademicTitle: '一、学术渊源与版权合理使用声明',
    disclaimerAcademicText: '本项目为非营利性神经科学知识可视化与认知探索工具，内容系统梳理并参考自神经科学学者诺曼·道伊奇博士（Norman Doidge, M.D.）专著《重塑大脑，重塑人生》（The Brain That Changes Itself）、莫赫布·科斯塔迪（Moheb Costandi）专著《Neuroplasticity》及国际经同行评议的公开科学研究文献。\n\n本网站不代表原著作者、出版机构或任何官方团体的商业立场，亦无商业附属或许可合作关系。所有神经解剖学规律、突触电生理常识与历史科学实验介绍均属于客观自然法则与公有领域科学事实，文字内容为自主提炼之教育性陈述，严格遵守知识产权法律中的“思想与表达二分法”和“合理使用（Fair Use）”原则。',
    disclaimerMedicalTitle: '二、非医疗诊断与健康免责声明（重要）',
    disclaimerMedicalText: '【本平台绝非医疗机构，亦不提供任何临床处方】\n\n1. 本应用展示的所有脑科学原理、思维导图、突触沙盘模型、约束诱导运动疗法（CIMT）、习惯覆写步骤、幻肢痛镜箱假说、慢性疼痛感知教育及睡眠建议，纯属认知科普与学术探讨性质，绝不构成任何医学诊断、临床康复指导、治疗方案或疗效保证。\n2. 若您或他人正在经历脑卒中（中风）后遗症、神经损伤、慢性神经病理性疼痛、幻肢痛、药物或行为成瘾、抑郁焦虑等中枢神经或心理疾患，请务必及时前往正规医院寻求具有法定执业资质的神经科医师、康复治疗师或临床专科医师的诊疗指导，绝不可因浏览本站内容而延误就医或擅自调整既定医疗方案。\n3. 用户依据本网站任何信息开展的个人自学训练或行为实验，均由用户自行负责。',
    disclaimerPrivacyTitle: '三、本地隐私与数据透明度保障',
    disclaimerPrivacyText: '本应用完全基于现代前端无状态架构构建，您的所有每日协议打卡记录、自定义神经微动作和突触模拟器参数均纯粹保存于您本地设备的浏览器内部存储（LocalStorage）中。\n\n本平台不会在服务器端收集、储存或出售您的任何个人健康数据或浏览隐私。',
    disclaimerButtonAcknowledge: '我已阅读并理解声明',
    disclaimerFooterNotice: '本站内容仅供脑科学科普与学术研讨，不构成临床医疗诊断或治疗方案 • 数据本地保存保障隐私'
  },
  en: {
    appTitle: 'Neuroplasticity Interactive Mind Map',
    appBadge: 'Brain Science Panorama',
    appSubtitle: 'Visualizing key mechanisms of brain rewiring, neurochemical drivers, and actionable protocols',
    tabMindmap: 'Interactive Mind Map',
    tabSimulator: 'Hebbian Synapse Sandbox',
    tabProtocols: 'Brain Rewiring Protocols',
    searchPlaceholder: 'Search neural mechanisms, molecules (BDNF), experiments (Merzenich), or drills...',
    filterLabel: 'Category:',
    filterAll: 'Whole Brain (All)',
    btnBookIntro: 'Book Background',
    btnSimulator: 'Synapse Simulator',
    btnEnterSimulator: 'Synapse Simulator',
    btnDisclaimer: 'Medical & Academic Disclaimer',

    bannerTitle: 'Neuroplasticity Core Paradigm: Use It or Lose It & Dynamic Rewiring',
    bannerDesc: 'This knowledge map fully deconstructs the seminal insights of Dr. Norman Doidge and Moheb Costandi. Click any node to explore classic biological experiments, synaptic reactions, and daily actionable rewiring protocols.',
    ribbonTitle: 'Neuroplasticity Core Paradigm: Use It or Lose It & Dynamic Rewiring',
    ribbonDesc: 'This knowledge map fully deconstructs the seminal insights of Dr. Norman Doidge and Moheb Costandi. Click any node to explore classic biological experiments, synaptic reactions, and daily actionable rewiring protocols.',

    pillarsTitle: 'Six Core Knowledge Pillars (Click to jump to node)',
    pillarsStripTitle: 'Six Core Knowledge Pillars (Click to jump to node)',
    pillarsSubMechanisms: 'sub-mechanisms',
    pillarsInspectAction: 'View Experiments & Protocols',

    viewTree: 'Hierarchical Tree',
    viewRadial: 'Radial Nebula',
    viewBento: 'Panoramic Matrix',
    expandAll: 'Expand All',
    collapseBranches: 'Collapse Branches',
    zoomReset: 'Reset View',
    canvasTip: '💡 Drag empty area to pan • Scroll to zoom • Click node for experiments & protocols',
    searchResultsFound: 'nodes matched',
    noSearchResults: 'No matching nodes found. Try different keywords.',
    clickToInspect: 'Click to inspect',
    subMechanismsCount: 'sub-mechanisms',

    importanceCore: 'Core Pillar',
    importanceHigh: 'High Impact',
    importancePractice: 'Practical Application',
    corePrincipleTitle: 'Core Principle of Rewiring',
    scientificExplanationTitle: 'Mechanism & Scientific Rationale',
    classicExperimentTitle: 'Classic Experiments & Clinical Cases',
    actionProtocolTitle: 'Actionable Rewiring Protocol',
    subMechanismsTitle: 'Sub-Mechanisms & Branches',
    tagsTitle: 'Key Concepts & Tags',
    btnAddToPlan: 'Add to My Daily Rewiring Practice',
    btnAddedToPlan: 'Included in Daily Practice Protocols',
    closeDrawer: 'Close Details Panel',

    simTitle: 'Hebbian Synapse & Synaptic Plasticity Simulator',
    simBadge: 'Cellular Micro-Simulation',
    simSubtitle: 'Test the core rule in real-time: "Neurons that fire together, wire together"',
    simSynapticStrength: 'Synaptic Strength',
    simConductionSpeed: 'Conduction Velocity',
    simAxonTerminal: 'Axon Bouton (Presynaptic)',
    simDendriticSpine: 'Dendritic Spine (Postsynaptic)',
    simAmpaReceptor: 'AMPA Receptor (Signal)',
    simNmdaReceptor: 'NMDA Receptor (Plasticity Gate)',
    simPulseCount: 'Action Potentials Fired',
    simFiring: '⚡ Spike Transmitting...',
    simReady: 'Ready',
    simControlTitle: 'Rewiring Intervention Controls',
    btnFirePulse: 'Fire Single Action Potential (ACh/Glu)',
    btnDeliberatePractice: 'Deliberate Burst Train (Induce LTP)',
    btnInjectBdnf: 'Infuse BDNF Fertilizer',
    btnInjectBdnfActive: 'BDNF Infused',
    btnWrapMyelin: 'Wrap Myelin (+1 Layer)',
    btnDisuseLtd: 'Prolonged Disuse (Induce LTD)',
    btnResetSim: 'Reset Experiment',
    simElectrophysiologyLog: 'Electrophysiological Event Log',
    simCoreInsightTitle: 'Core Scientific Insight: ',
    simCoreInsightText: 'High-frequency action potentials drive AMPA receptor insertion and magnesium unblocking of NMDA channels, forming Long-Term Potentiation (LTP). Oligodendrocytes then insulate axons with myelin, turning transient spikes into permanent neural highways.',

    protoBadge: 'Clinical to Practical',
    protoTitle: 'Brain Rewiring Daily Action Protocols',
    protoSubtitle: 'Translating adult neurogenesis, synaptic LTP, and habit bypass theory into daily actionable micro-drills.',
    protoProgressToday: 'Today\'s Protocol Completion',
    protoItemsCount: 'protocols',
    protoReset: 'Reset Today\'s Drills',
    protoMarkDone: 'Mark as Completed',
    protoDifficulty: 'Difficulty',
    protoRationaleTitle: 'Neuroscientific Rationale:',
    protoStepsTitle: 'Execution Steps & Criteria:',
    protoKeyMolecules: 'Key Activated Biomarkers',
    protoCustomDrillsTitle: 'Custom Brain Rewiring Micro-Drills',
    protoCustomDrillsSubtitle: 'Track a specific automated habit loop you intend to interrupt or an unfamiliar motor drill today.',
    protoDeleteDrill: 'Delete',
    protoDrillPlaceholder: 'e.g., Stand on one leg with eyes closed for 30s (vestibular-cerebellar synaptogenesis)...',
    btnAddDrill: 'Add Micro-Drill',

    footerNote: 'Built upon core cognitive neuroscience principles from "The Brain That Changes Itself" and "Neuroplasticity" • Interactive Mind Map System',
    disclaimerTitle: 'Academic Reference & Medical Disclaimer',
    disclaimerSubtitle: 'Important legal notices regarding educational scope, copyright fair use, and health guidelines',
    disclaimerAcademicTitle: '1. Academic Reference & Fair Use Statement',
    disclaimerAcademicText: 'This project is an independent, non-profit educational and scientific visualization tool. Its conceptual framework synthesizes publicly available research literature, including the acclaimed publications of Dr. Norman Doidge, M.D. ("The Brain That Changes Itself"), Moheb Costandi ("Neuroplasticity"), and peer-reviewed studies in cognitive neuroscience.\n\nThis application is NOT affiliated with, sponsored by, or an official publication of the authors, original publishers, or commercial entities. Scientific principles, neuroanatomical facts, and historical experimental findings represent public-domain natural laws. All accompanying summaries represent transformative, educational syntheses adhering strictly to the Idea-Expression Dichotomy and Fair Use doctrines of intellectual property law.',
    disclaimerMedicalTitle: '2. Medical & Health Disclaimer (Critical Notice)',
    disclaimerMedicalText: '[NOT MEDICAL ADVICE / NOT A CLINICAL PROVIDER]\n\n1. All neurobiological mechanisms, synaptic models, Constraint-Induced Movement Therapy (CIMT) reviews, habit loop override techniques, phantom limb mirror box discussions, pain neuroscience insights, and lifestyle protocols presented on this website are strictly for educational and academic exploration. THEY DO NOT CONSTITUTE MEDICAL ADVICE, CLINICAL DIAGNOSES, REHABILITATION PRESCRIPTIONS, OR THERAPEUTIC GUARANTEES.\n2. If you or someone you know is suffering from a stroke, traumatic brain injury, neurological deficit, neuropathic chronic pain, phantom limb spasms, addiction, clinical depression, or psychiatric disorders, please seek evaluation and care from a licensed neurologist, physical therapist, or medical professional immediately. Never disregard or delay seeking clinical medical advice because of content read on this platform.\n3. Any personal application of the cognitive drills or lifestyle protocols featured herein is undertaken entirely at the user\'s sole discretion and responsibility.',
    disclaimerPrivacyTitle: '3. Client-Side Privacy & Data Transparency',
    disclaimerPrivacyText: 'This web application is built entirely as a client-side architecture. All practice completion states, customized daily drills, and simulation parameters are stored exclusively within your local browser storage (LocalStorage).\n\nNo personal health data, behavioral telemetry, or private information is transmitted to or collected by external servers.',
    disclaimerButtonAcknowledge: 'I Have Read & Understand the Disclaimer',
    disclaimerFooterNotice: 'For cognitive neuroscience education & research only • Not medical advice • 100% private local storage'
  }
};
