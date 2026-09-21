/**
 * 文献与机制弹窗（LiteratureModal）词条：范式说明、神经机制、参考文献。
 * 约定见 src/i18n/README.md：必须同时提供 zh 与 en，键名用 `lit.<语义>`。
 * 参考文献一律保留文献通行英文与作者年份格式，两种语言下均不翻译。
 */
export const lit = {
  zh: {
    // ---- 弹窗外壳 --------------------------------------------------------
    'lit.title': '认知神经科学分类与模式识别文献全景',
    'lit.subtitle': '学术经典测验、神经回路映射与认知负荷调控理论文献',
    'lit.close': '关闭文献窗口',
    'lit.footerNote': 'NeuroClassify v2.4 · 遵循国际认知心理学与神经科学标准',
    'lit.back': '返回测验',

    // ---- 1. WCST ---------------------------------------------------------
    'lit.wcst.title': '威斯康星卡片分类测验 (WCST, Wisconsin Card Sorting Test)',
    'lit.wcst.tag': '黄金标准 / 执行功能',
    'lit.wcst.circuitLabel': '神经回路：',
    'lit.wcst.circuit':
      '背外侧前额叶皮层 (DLPFC, 假设生成与工作记忆维持) + 前扣带回皮层 (ACC, 冲突检测与负反馈监控) + 尾状体。',
    'lit.wcst.mechanismLabel': '核心机制：',
    'lit.wcst.mechanism':
      '在无明示规则下，受试者根据反馈在工作记忆中激活三维特征（颜色、形状、数量）并推导当前假设。在连续 10 次正确后发生暗中转换。',

    // ---- 2. WPT ----------------------------------------------------------
    'lit.wpt.title': '天气预测任务 (Weather Prediction Task, WPT)',
    'lit.wpt.tag': '概率分类 / 纹状体内隐学习',
    'lit.wpt.circuitLabel': '神经回路：',
    'lit.wpt.circuit':
      '基底神经节/纹状体 (Striatum - 尾状体与壳核，程序性与内隐联结) 与内侧颞叶/海马体 (MTL - 陈述性记忆) 的双分离。',
    'lit.wpt.mechanismLabel': '核心机制：',
    'lit.wpt.mechanism':
      '各线索以概率方式关联天气结果（如 0.756、0.575、0.425、0.244）。受试者无法用单一命题逻辑解决，基底核通过多巴胺强化信号内隐调整突触权重。Poldrack 等（2001, Nature）通过 fMRI 证实随着试验进行，激活由内侧颞叶逐渐转移至纹状体。',

    // ---- 3. ID/ED --------------------------------------------------------
    'lit.ided.title': '注意定势转移测验 (CANTAB ID/ED Set Shifting)',
    'lit.ided.tag': '选择性注意 / 维度惰性',
    'lit.ided.circuitLabel': '神经回路：',
    'lit.ided.circuit':
      '眶额皮层 (OFC - 逆转学习与奖励价值翻转) vs 外侧前额叶皮层 (LPFC - 跨维度的 Extra-Dimensional Shift)。',
    'lit.ided.mechanismLabel': '核心机制：',
    'lit.ided.mechanism':
      '7 个连续阶段，逐步从简单形状辨别 (SD)、复合辨别 (CD) 推进至 EDS。在 EDS 阶段，受试者必须克服对原维度的注意粘滞性，自上而下将注意焦点重定向至无关的线条维度。',

    // ---- 4. COVIS --------------------------------------------------------
    'lit.covis.title': '双系统竞争理论 (Ashby COVIS Model)',
    'lit.covis.body':
      '比较 Rule-Based (RB, 显式语言前额叶) 与 Information-Integration (II, 无法言语概括的皮质-纹状体突触整合)。',

    // ---- 5. Posner 原型 --------------------------------------------------
    'lit.posner.title': '点阵原型抽象 (Posner & Keele, 1968)',
    'lit.posner.body':
      '训练仅使用高斯畸变，测试未见原型。验证大脑形成“中心原型图式 (Central Tendency)”而非孤立记忆样本。',

    // ---- 6. 认知负荷理论 -------------------------------------------------
    'lit.clt.title': '认知负荷调节理论 (Cognitive Load Theory in Category Learning)',
    'lit.clt.intro': '系统目前提供以下三类可调的负荷操控（面板中已逐项标注其实际生效的测验范围）：',
    'lit.clt.intrinsicLabel': '内在负荷 (Intrinsic Load)：',
    'lit.clt.intrinsic':
      '各任务的特征维度数在版本内固定（WCST 为颜色/形状/数量 3 维，ID/ED 为图形/线条 2 维），当前版本不提供维度数量的在线调节；早期版本文案中“2 维至 4 维可调”的说法已移除，因为该功能并不存在。',
    'lit.clt.extraneousLabel': '外在负荷 (Extraneous Load)：',
    'lit.clt.extraneous':
      '刺激上叠加的像素级高斯知觉噪声，以及在刺激区叠加的静态无关几何图形（不参与任何分类规则）。',
    'lit.clt.germaneLabel': '工作记忆与时限压迫 (Germane / Time Pressure)：',
    'lit.clt.germane':
      'WCST 的 3 位数字瞬时保持双任务探测（呈现后间隔 4 次分类再回忆，可跳过），以及 WCST/WPT 的 1.5s~5.0s 反应时限（超时记为未反应）。',
    'lit.clt.caution':
      '注意：以上操控均未做操控效度（manipulation check）检验，因此“负荷升高”只代表刺激/时限参数改变，不能直接等同于某种确定的认知负荷水平。',

    // ---- 文献引用 --------------------------------------------------------
    // 文献条目在 zh 与 en 中完全相同：保留原始英文引用与作者年份格式。
    'lit.refs.lead': '文献引用：',
    'lit.ref.grant1948':
      'Grant, D. A., & Berg, E. (1948). A behavioral analysis of degree of reinforcement and ease of shifting to new responses in a Weigl-type card-sorting problem. Journal of Experimental Psychology, 38(4), 404.',
    'lit.ref.heaton1993':
      'Heaton, R. K., et al. (1993). Wisconsin Card Sorting Test Manual: Revised and Expanded. Psychological Assessment Resources.',
    'lit.ref.knowlton1996':
      'Knowlton, B. J., Mangels, J. A., & Squire, L. R. (1996). A neostriatal habit learning system in humans. Science, 273(5280), 1399-1402.',
    'lit.ref.poldrack2001':
      'Poldrack, R. A., et al. (2001). Interactive memory systems in the human brain. Nature, 414(6863), 546-550.',
    'lit.ref.robbins1998':
      'Robbins, T. W., et al. (1998). Neural systems underlying attentional set-shifting in rodents and primates. Psychopharmacology, 134, 1-18.',
    'lit.ref.dias1996':
      'Dias, R., Robbins, T. W., & Roberts, A. C. (1996). Dissociation in prefrontal cortex of affective and attentional shifts. Nature, 380(6569), 69-72.',
    'lit.ref.ashby2005':
      'Ashby, F. G., & Maddox, W. T. (2005). Human category learning. Annual Review of Psychology, 56, 149-178.',
    'lit.ref.posner1968':
      'Posner, M. I., & Keele, S. W. (1968). On the genesis of abstract ideas. Journal of Experimental Psychology, 77(3), 353-363.',
  },
  en: {
    // ---- Modal shell -----------------------------------------------------
    'lit.title': 'Literature panorama: categorisation and pattern recognition in cognitive neuroscience',
    'lit.subtitle':
      'Classic academic tests, neural-circuit mapping, and the literature on cognitive-load modulation',
    'lit.close': 'Close the literature window',
    'lit.footerNote':
      'NeuroClassify v2.4 · Follows international cognitive-psychology and neuroscience standards',
    'lit.back': 'Back to the test',

    // ---- 1. WCST ---------------------------------------------------------
    'lit.wcst.title': 'Wisconsin Card Sorting Test (WCST)',
    'lit.wcst.tag': 'Gold standard / executive function',
    'lit.wcst.circuitLabel': 'Neural circuit: ',
    'lit.wcst.circuit':
      'Dorsolateral prefrontal cortex (DLPFC — hypothesis generation and working-memory maintenance) + anterior cingulate cortex (ACC — conflict detection and negative-feedback monitoring) + caudate nucleus.',
    'lit.wcst.mechanismLabel': 'Core mechanism: ',
    'lit.wcst.mechanism':
      'With no explicit rule given, the participant activates three-dimensional features in working memory (colour, shape, number) from feedback and infers the current hypothesis. A covert rule shift occurs after 10 consecutive correct responses.',

    // ---- 2. WPT ----------------------------------------------------------
    'lit.wpt.title': 'Weather Prediction Task',
    'lit.wpt.tag': 'Probabilistic categorisation / striatal implicit learning',
    'lit.wpt.circuitLabel': 'Neural circuit: ',
    'lit.wpt.circuit':
      'A double dissociation between the basal ganglia/striatum (caudate and putamen — procedural and implicit associations) and the medial temporal lobe/hippocampus (MTL — declarative memory).',
    'lit.wpt.mechanismLabel': 'Core mechanism: ',
    'lit.wpt.mechanism':
      'Each cue is associated with the weather outcome probabilistically (e.g. 0.756, 0.575, 0.425, 0.244). The task cannot be solved by a single propositional rule; the basal ganglia adjust synaptic weights implicitly through dopaminergic reinforcement signals. Using fMRI, Poldrack et al. (2001, Nature) showed activation shifting gradually from the medial temporal lobe to the striatum as trials progressed.',

    // ---- 3. ID/ED --------------------------------------------------------
    'lit.ided.title': 'CANTAB ID/ED Set Shifting',
    'lit.ided.tag': 'Selective attention / dimensional inertia',
    'lit.ided.circuitLabel': 'Neural circuit: ',
    'lit.ided.circuit':
      'Orbitofrontal cortex (OFC — reversal learning and reward-value reversal) vs lateral prefrontal cortex (LPFC — the extra-dimensional shift across dimensions).',
    'lit.ided.mechanismLabel': 'Core mechanism: ',
    'lit.ided.mechanism':
      'Seven consecutive stages progress from simple discrimination (SD) and compound discrimination (CD) to the EDS. At the EDS stage the participant must overcome attentional stickiness to the previous dimension and redirect the focus of attention top-down to the previously irrelevant line dimension.',

    // ---- 4. COVIS --------------------------------------------------------
    'lit.covis.title': 'Competition between two systems (Ashby’s COVIS model)',
    'lit.covis.body':
      'Contrasts rule-based (RB — explicit, prefrontal/language-based) and information-integration (II — cortico-striatal synaptic integration that cannot be verbalised) category learning.',

    // ---- 5. Posner prototype ---------------------------------------------
    'lit.posner.title': 'Dot-pattern prototype abstraction (Posner & Keele, 1968)',
    'lit.posner.body':
      'Training uses Gaussian distortions only and testing uses unseen prototypes. This tests whether the brain forms a “central tendency” prototype schema rather than storing isolated exemplars.',

    // ---- 6. Cognitive load theory ----------------------------------------
    'lit.clt.title': 'Cognitive load theory in category learning',
    'lit.clt.intro':
      'The system currently offers the following three types of adjustable load manipulation (the panel labels the test range each one actually affects):',
    'lit.clt.intrinsicLabel': 'Intrinsic load: ',
    'lit.clt.intrinsic':
      'the number of feature dimensions per task is fixed within this version (WCST: 3 dimensions — colour/shape/number; ID/ED: 2 dimensions — shape/line). This version does not offer online adjustment of the number of dimensions; the claim of “adjustable from 2 to 4 dimensions” in earlier copy has been removed because that feature does not exist.',
    'lit.clt.extraneousLabel': 'Extraneous load: ',
    'lit.clt.extraneous':
      'pixel-level Gaussian perceptual noise added to the stimulus, and static task-irrelevant geometric shapes overlaid on the stimulus area (they take no part in any classification rule).',
    'lit.clt.germaneLabel': 'Working memory and time pressure (germane load / time pressure): ',
    'lit.clt.germane':
      'the 3-digit immediate-retention dual-task probe in WCST (recall is requested 4 classification trials after presentation and can be skipped), and the 1.5 s–5.0 s response time limit in WCST/WPT (a timeout is recorded as an omission).',
    'lit.clt.caution':
      'Note: none of these manipulations has been checked for manipulation validity, so a “higher load” setting means only that stimulus or timing parameters changed; it cannot be equated directly with any specific level of cognitive load.',

    // ---- References ------------------------------------------------------
    'lit.refs.lead': 'References:',
    'lit.ref.grant1948':
      'Grant, D. A., & Berg, E. (1948). A behavioral analysis of degree of reinforcement and ease of shifting to new responses in a Weigl-type card-sorting problem. Journal of Experimental Psychology, 38(4), 404.',
    'lit.ref.heaton1993':
      'Heaton, R. K., et al. (1993). Wisconsin Card Sorting Test Manual: Revised and Expanded. Psychological Assessment Resources.',
    'lit.ref.knowlton1996':
      'Knowlton, B. J., Mangels, J. A., & Squire, L. R. (1996). A neostriatal habit learning system in humans. Science, 273(5280), 1399-1402.',
    'lit.ref.poldrack2001':
      'Poldrack, R. A., et al. (2001). Interactive memory systems in the human brain. Nature, 414(6863), 546-550.',
    'lit.ref.robbins1998':
      'Robbins, T. W., et al. (1998). Neural systems underlying attentional set-shifting in rodents and primates. Psychopharmacology, 134, 1-18.',
    'lit.ref.dias1996':
      'Dias, R., Robbins, T. W., & Roberts, A. C. (1996). Dissociation in prefrontal cortex of affective and attentional shifts. Nature, 380(6569), 69-72.',
    'lit.ref.ashby2005':
      'Ashby, F. G., & Maddox, W. T. (2005). Human category learning. Annual Review of Psychology, 56, 149-178.',
    'lit.ref.posner1968':
      'Posner, M. I., & Keele, S. W. (1968). On the genesis of abstract ideas. Journal of Experimental Psychology, 77(3), 353-363.',
  },
} as const;
