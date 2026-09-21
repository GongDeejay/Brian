/**
 * 学术原理与范式文献弹窗（AcademicTheoryModal）词条。
 * 约定见 src/i18n/README.md：必须同时提供 zh 与 en，键名用 `theory.<语义>`。
 * 学术内容请使用文献通行英文表述，保留作者与年份引用格式。
 *
 * 术语约定：working memory、updating、complex span、visual capacity、
 * inhibition、d′、Cowan's K、reliability、validity、norm-referenced、
 * fluid intelligence (Gf)、signal detection theory (SDT)、set size。
 * 公式与指标缩写（d′、Z(Hit)、Z(FA)、K = N × (H - F)、DLPFC、FPN、SAT/GRE）
 * 保持原样，不翻译。
 */
export const theory = {
  zh: {
    // 弹窗外壳
    'theory.title': '工作记忆核心学术范式与认知神经基础',
    'theory.subtitle': '工作记忆范式、容量极限与神经可塑性',
    'theory.close': '关闭学术范式说明',
    'theory.understand': '我已知悉，返回训练',

    // 概念总述
    'theory.wmHeading': '工作记忆 (Working Memory, WM) 的本质',
    'theory.wmBodyPre': '工作记忆是人类大脑用于在短时间（几秒到数十秒）内',
    'theory.wmBodyStrong': '保持（Storage）并同时加工（Processing）',
    'theory.wmBodyPost':
      '目标信息的容量有限系统，是阅读理解、逻辑推理、数学演算和决策控制等高阶认知行为的“中央处理器”。现代认知神经科学证实，工作记忆由背外侧前额叶皮层（DLPFC）、顶叶皮层以及基底节构成的额顶控制网络（FPN）协同驱动。',

    // 范式 1：N-back
    'theory.p1Badge': '范式 1：动态刷新与抑制控制',
    'theory.p1Title': 'N-back 任务 (1-back / 2-back / 3-back)',
    'theory.mechanismLabel': '机制：',
    'theory.p1Mechanism':
      '受试者注视持续呈现的序列刺激（空间坐标、字母或符号），判断当前刺激是否与前面倒数第 N 个刺激一致。',
    'theory.keyMechanismsLabel': '关键认知机制：',
    'theory.p1Feature1': '信息动态编码入栈 (Encoding)',
    'theory.p1Feature2': '旧信息移出与遗忘 (Drop & Update)',
    'theory.p1Feature3': '干扰诱导与冲动抑制控制 (Inhibition)',
    'theory.metricsLabel': '统计量化指标：',
    'theory.nbackFormulaNote':
      '采用信号检测论（SDT）敏度指数，有效剔除受试者的猜测偏好（Response Bias）。',

    // 范式 2：OSPAN
    'theory.p2Badge': '范式 2：复杂加工与存储跨度',
    'theory.p2Title': '复杂运算跨度 (Operation Span, OSPAN)',
    'theory.p2Mechanism':
      '双任务范式（Dual-task）。受试者一边验证简单数学算式（加工负荷，例如 (4 × 2) - 3 = 5 是/否），一边在算式后立即牢记目标字母（存储负荷）。在完整 Set 呈现后，必须严格按先后次序回忆出所有字母。',
    'theory.gfLabel': '流体智力预测：',
    'theory.gfBody':
      'OSPAN 是目前学术界预测流体智力（Gf）、学术考试（如 SAT/GRE）以及高级问题解决能力最强悍的心理测量学工具之一。',
    'theory.validityLabel': '有效性约束要求：',
    'theory.validityPre': '运算加工正确率必须维持在 ',
    'theory.validityStrong': '85% 以上',
    'theory.validityPost': '，以证明受试者未通过主动放弃算术加工来单向换取记忆存储。',

    // 范式 3：变化检测与 Cowan's K
    'theory.p3Badge': '范式 3：视空间容量极限测定',
    'theory.p3Title': "视觉变化检测 (Visual Change Detection & Cowan's K)",
    'theory.p3Mechanism':
      '极短瞬间（100~150ms）闪烁一个多色方块阵列（集合大小 Set Size = 4, 6, 8），经过 1000ms 纯粹的工作记忆维持期后，探针重新呈现，判断高亮位置的方块颜色是否改变。',
    'theory.kFormulaLabel': "Cowan's K 容量极限公式：",
    'theory.kPre':
      '其中 N 为方块总数，H 为命中率（Hit: 改变且判断改变），F 为虚报率（False Alarm: 未改变却误判改变）。学术界普遍发现人类的视觉工作记忆离散表征槽位上限为 ',
    'theory.kStrong': '3 ~ 4 个独立客体',
    'theory.kPost': '。K 值为负表示判别低于随机水平，平台会如实呈现而不做 0 截断。',

    // 评估模式说明（数据精度与限制，务必如实翻译）
    'theory.integrityHeading': '评估模式为何不提供逐试次正误反馈？',
    'theory.integrityPre': '标准学术评估版本的三类范式均',
    'theory.integrityStrong': '不在试次层面告知对错',
    'theory.integrityPost':
      '：即时正误反馈会诱发策略调整、猜测偏好与情绪唤醒，从而污染容量与敏感度指标。因此平台默认使用「评估模式」（仅保留刺激起始提示音与注视点等朝向线索），「练习模式」才提供完整的逐试次文本与声音反馈。焦点丢失、切换标签页等意外中断也会被记录并随结果一并报告。',

    // 训练建议
    'theory.trainingHeading': '日常训练与认知可塑性指南',
    'theory.train1Label': '自适应渐进式负荷：',
    'theory.train1':
      '当 2-back 正确率突破 85% 时，勇敢切换至 3-back，迫使前额叶产生神经适应性重组。',
    'theory.train2Label': '间隔练习优于突击：',
    'theory.train2':
      '每天 10~15 分钟的专注轮换训练比周末一次性练习更能稳定强化神经连接与突触修剪。',
    'theory.train3Label': '双任务耐受迁移：',
    'theory.train3':
      '定期进行 OSPAN 训练，可显著提升在日常生活工作中面对多线程打扰时的专注力与抗分心能力。',
  },
  en: {
    // Dialog shell
    'theory.title': 'Core Academic Paradigms of Working Memory & Their Cognitive Neuroscience Basis',
    'theory.subtitle': 'Working Memory Paradigms, Capacity Limits & Neuroplasticity',
    'theory.close': 'Close the paradigm theory explanation',
    'theory.understand': 'Understood — return to training',

    // Concept summary
    'theory.wmHeading': 'The nature of working memory (WM)',
    'theory.wmBodyPre':
      'Working memory is a capacity-limited system for target information over short intervals (seconds to tens of seconds): it must ',
    'theory.wmBodyStrong': 'hold (storage) and simultaneously process (processing) ',
    'theory.wmBodyPost':
      'that information. It acts as the "central processor" for higher-order cognition such as reading comprehension, logical reasoning, mental arithmetic and decision control. Modern cognitive neuroscience shows that working memory is driven jointly by a frontoparietal control network (FPN) comprising the dorsolateral prefrontal cortex (DLPFC), the parietal cortex and the basal ganglia.',

    // Paradigm 1: N-back
    'theory.p1Badge': 'Paradigm 1: Dynamic updating & inhibitory control',
    'theory.p1Title': 'N-back task (1-back / 2-back / 3-back)',
    'theory.mechanismLabel': 'Mechanism: ',
    'theory.p1Mechanism':
      'The participant views a continuously presented sequence of stimuli (spatial locations, letters or symbols) and judges whether the current stimulus matches the one N positions back.',
    'theory.keyMechanismsLabel': 'Key cognitive mechanisms:',
    'theory.p1Feature1': 'Dynamic encoding of information into the focus of attention (encoding)',
    'theory.p1Feature2': 'Dropping and forgetting outdated information (drop & update)',
    'theory.p1Feature3': 'Interference and inhibitory control of prepotent responses (inhibition)',
    'theory.metricsLabel': 'Statistical index:',
    'theory.nbackFormulaNote':
      'A signal detection theory (SDT) sensitivity index, which removes the participant\'s guessing bias (response bias).',

    // Paradigm 2: OSPAN
    'theory.p2Badge': 'Paradigm 2: Complex processing & storage span',
    'theory.p2Title': 'Complex operation span (OSPAN)',
    'theory.p2Mechanism':
      'Dual-task paradigm. The participant verifies simple arithmetic equations (processing load, e.g. (4 × 2) - 3 = 5 true/false) while remembering a target letter immediately after each equation (storage load). After a complete set has been presented, every letter must be recalled in the exact order of presentation.',
    'theory.gfLabel': 'Predicting fluid intelligence:',
    'theory.gfBody':
      'OSPAN is one of the strongest psychometric predictors of fluid intelligence (Gf), academic test performance (e.g. SAT/GRE) and advanced problem solving.',
    'theory.validityLabel': 'Validity requirement:',
    'theory.validityPre': 'Arithmetic accuracy must stay ',
    'theory.validityStrong': 'above 85%',
    'theory.validityPost':
      ', demonstrating that the participant did not trade arithmetic processing for storage.',

    // Paradigm 3: change detection & Cowan's K
    'theory.p3Badge': 'Paradigm 3: Measuring the visuospatial capacity limit',
    'theory.p3Title': "Visual change detection & Cowan's K",
    'theory.p3Mechanism':
      'A multicoloured square array (set size = 4, 6, 8) is flashed very briefly (100–150 ms); after a 1000 ms pure working-memory maintenance interval the probe array reappears, and the participant judges whether the colour of the highlighted square has changed.',
    'theory.kFormulaLabel': "Cowan's K capacity-limit formula:",
    'theory.kPre':
      'where N is the total number of squares, H is the hit rate (Hit: a change occurred and was reported as changed) and F is the false-alarm rate (False Alarm: no change occurred but a change was reported). Human visual working memory is widely found to be limited to about ',
    'theory.kStrong': '3–4 independent objects',
    'theory.kPost':
      ' in discrete representation slots. A negative K means discrimination below chance level; the platform reports it faithfully and does not truncate it to 0.',

    // Assessment-mode note (data precision & limitations — translate faithfully)
    'theory.integrityHeading': 'Why does assessment mode give no trial-by-trial feedback?',
    'theory.integrityPre': 'In the standard academic assessment version, all three paradigms ',
    'theory.integrityStrong': 'give no trial-level correctness feedback',
    'theory.integrityPost':
      ': immediate correctness feedback invites strategy adjustments, guessing biases and emotional arousal, which contaminate capacity and sensitivity indices. The platform therefore defaults to assessment mode (retaining only orienting cues such as stimulus-onset tones and the fixation point); only practice mode provides full trial-by-trial text and sound feedback. Accidental interruptions such as focus loss or tab switching are also recorded and reported together with the result.',

    // Training recommendations
    'theory.trainingHeading': 'Guidelines for daily training & cognitive plasticity',
    'theory.train1Label': 'Adaptive, progressive load: ',
    'theory.train1':
      'once 2-back accuracy exceeds 85%, move up to 3-back to force adaptive reorganisation in the prefrontal cortex.',
    'theory.train2Label': 'Spaced practice beats cramming: ',
    'theory.train2':
      '10–15 minutes of focused, alternating practice per day strengthens neural connections and synaptic pruning more reliably than one long weekend session.',
    'theory.train3Label': 'Transfer of dual-task tolerance: ',
    'theory.train3':
      'regular OSPAN practice markedly improves focus and resistance to distraction when handling many competing demands in daily life and work.',
  },
} as const;
