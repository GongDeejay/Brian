/**
 * 视觉变化检测（Cowan's K）词条（含指导语、试次阶段提示、结果页）。
 * 约定见 src/i18n/README.md：必须同时提供 zh 与 en，键名用 `cd.<语义>`。
 *
 * 术语采用文献通行英文：change detection / set size / probe / memory array /
 * retention interval / Cowan's K / hit rate / false-alarm rate / fixation cross。
 * 按键说明（F·1 = 未改变，J·2 = 已改变）必须与 ChangeDetectionTask.tsx 的
 * onKeyDown 与按钮绑定保持一致。
 */
export const changeDetection = {
  zh: {
    // ---- 顶部范式简介 ----
    'cd.badge': '范式 3 · 视空间工作记忆容量极限 (K值)',
    'cd.title': '视觉变化检测任务 (Change Detection)',
    'cd.introPre':
      '短瞬间闪烁多色方块阵列（可调节 100ms~1000ms），经历维持期间后重新呈现，判断目标方块颜色是否改变。通过公式 ',
    'cd.introPost': ' 精准测定纯视觉表征容量极限。',
    'cd.start': '开始 K值 测定',

    // ---- 参数面板 ----
    'cd.config.title': '任务参数与难度配置',
    'cd.config.freeAdjust': '自由调节',

    'cd.presets.label': '难度预设 (Presets)',
    'cd.presets.hint.easy': '推荐初学者',
    'cd.presets.hint.standard': '学术基准',
    'cd.presets.hint.hard': '极限挑战',

    'cd.preset.easy.name': '新手入门',
    'cd.preset.easy.tag': '容易',
    'cd.preset.easy.description': '延长至 600ms 观察时间，较小阵列，适合初次体验与习惯流程',
    'cd.preset.standard.name': '经典学术',
    'cd.preset.standard.tag': '标准',
    'cd.preset.standard.description': '约 250ms 闪烁，经典 Cowan (2001) 阵列标准',
    'cd.preset.hard.name': '极速极限',
    'cd.preset.hard.tag': '极难',
    'cd.preset.hard.description': '仅 120ms 超快速瞬时呈现，考验高阶神经感知与表征编码',
    'cd.preset.flash': '闪烁 {ms}ms',

    'cd.sample.label': '刺激呈现闪烁时长 (Flash Duration)',
    'cd.sample.tick100': '100ms (极限超快)',
    'cd.sample.tick350': '350ms (温和)',
    'cd.sample.tick600': '600ms (充裕)',
    'cd.sample.tick1000': '1000ms (轻松)',
    'cd.sample.quick': '快捷预选:',

    'cd.delay.label': '维持期空白间隔 (Retention Delay)',
    'cd.delay.tick300': '300ms (极短)',
    'cd.delay.tick900': '900ms (标准维持)',
    'cd.delay.tick2000': '2000ms (长时衰减)',

    'cd.setSizes.label': '阵列方块数量 (Set Sizes)',
    'cd.setSizes.count': '{sizes} 个方块',
    'cd.setSizes.small.label': '小阵列 [3, 4, 5]',
    'cd.setSizes.small.desc': '难度较低',
    'cd.setSizes.classic.label': '经典 [4, 6, 8]',
    'cd.setSizes.classic.desc': '标准学术',
    'cd.setSizes.challenge.label': '挑战 [6, 8, 10]',
    'cd.setSizes.challenge.desc': '高负荷',

    'cd.feedback.group': '逐试次反馈模式',
    'cd.feedback.label': '逐试次反馈 (Feedback)',
    'cd.feedback.assessment': '评估模式',
    'cd.feedback.assessmentDefault': '评估模式（默认）',
    'cd.feedback.practice': '练习模式',
    'cd.feedback.note':
      '评估模式不显示逐试次正误对错（标准范式做法），以免策略调整与情绪唤醒污染 K 值；练习模式保留完整的对错文本与音效。',

    'cd.trials.label': '每种阵列试次数目',
    'cd.trials.total': '共计 {count} 试次',
    'cd.trials.option': '{count} 次 / 规模 ({total} 轮)',

    // ---- 指导语与按键说明 ----
    'cd.guide.title': '实验交互流程与按键说明',
    'cd.guide.flashPre': '当前闪烁时长设为 ',
    'cd.guide.flashPost': '，若仍感觉吃力可继续在左侧延长。',
    'cd.guide.step1.title': '十字注视',
    'cd.guide.step1.pre': '盯着画面中央 ',
    'cd.guide.step1.post': ' 注视点预备 (500ms)。',
    'cd.guide.step2.title': '记忆闪现',
    'cd.guide.step2.pre': '方块阵列闪现 ',
    'cd.guide.step2.post': '，迅速扫视并脑中快照。',
    'cd.guide.step3.title': '探针比对',
    'cd.guide.step3.pre': '经 {ms}ms 保持后，判断带 ',
    'cd.guide.step3.mark': '「?」',
    'cd.guide.step3.post': ' 探针方块颜色是否变化。',
    'cd.keys.title': '快捷键提示：',
    'cd.keys.same': '颜色未改变 / 相同:',
    'cd.keys.sameKeys': 'F 或 1',
    'cd.keys.changed': '颜色已改变 / 不同:',
    'cd.keys.changedKeys': 'J 或 2',
    'cd.formula.title': "Cowan's K 公式说明",
    'cd.formula.pre': '容量极限 ',
    'cd.formula.post':
      '。通过扣除虚报率 (False Alarm)，消除瞎猜猜测效应。成人常模一般为 3.0 ~ 4.5 个客体。',
    'cd.startWithConfig': '按当前配置开始实验 ({count} 试次)',

    // ---- 运行界面 ----
    'cd.progress.trialLabel': '试次:',
    'cd.progress.arrayLabel': '阵列:',
    'cd.progress.arrayItems': '{count} 项',
    'cd.progress.flash': '闪烁: {ms}ms',
    'cd.feedback.correct': '✓ 正确判定',
    'cd.feedback.wrong': '✗ 判定失误',
    'cd.phase.fixation': '注视十字点...',
    'cd.phase.sample': '记忆彩色方块阵列 ({ms}ms)...',
    'cd.phase.delay': '大脑维持保持期...',
    'cd.phase.test': '探针位置颜色改变了吗？',
    'cd.live.paused': '实验已暂停，等待继续',
    'cd.live.trial': '第 {current} 试次，共 {total} 试次，{phase}',
    'cd.live.phase.fixation': '注视十字',
    'cd.live.phase.sample': '记忆阵列呈现中',
    'cd.live.phase.delay': '维持期',
    'cd.live.phase.test': '请判断探针颜色是否改变',
    'cd.paused.title': '检测到页面失去焦点，实验已暂停',
    'cd.paused.body':
      '为保障测量有效性，被中断的试次将从「注视十字」阶段重新呈现；若该试次已作答，则直接进入下一试次。中断次数与累计离开时长会作为数据有效性指标随结果一并报告。',
    'cd.paused.resume': '继续实验',
    'cd.answer.same': '颜色【未改变 / 相同】',
    'cd.answer.sameHint': '快捷键: F 或 1',
    'cd.answer.changed': '颜色【已改变 / 不同】',
    'cd.answer.changedHint': '快捷键: J 或 2',
    'cd.answer.recorded': '已记录本题作答，请等待下一试次',
    'cd.answer.probePre': '请仅关注带 ',
    'cd.answer.probeMark': '黄色光环「?」',
    'cd.answer.probePost': ' 的目标方块颜色',

    // ---- 结果页 ----
    'cd.result.title': "视觉空间容量极限 (Cowan's K) 评估报告",
    'cd.result.subtitle': 'Cowan (2001) 经典视觉工作记忆独立槽位测定',
    'cd.result.restart': '重新测试',
    'cd.validity.warnLead': '数据有效性提示：本会话记录到 ',
    'cd.validity.warnInterruptions': ' 次页面失去焦点，累计离开 ',
    'cd.validity.warnSeconds': '{seconds} 秒',
    'cd.validity.warnRestartsPre': '，其中 ',
    'cd.validity.warnRestartsPost': ' 个试次被重新呈现。解释 K 值时请考虑这些中断。',
    'cd.validity.ok':
      '数据有效性：整个会话未发生中断，焦点保持良好（反馈模式：{mode}）。',
    'cd.result.rating': '评估等级：{rating} (K = {k})',
    'cd.result.metric.k': "Cowan's K 容量极限",
    'cd.result.metric.kNorm': '典型健康常模 3.0~4.5',
    'cd.result.metric.accuracy': '综合辨别准确率',
    'cd.result.metric.accuracyNote': '命中率与正确拒绝',
    'cd.result.metric.rt': '平均判定反应时',
    'cd.result.metric.rtNote': '提取与比对延迟',
    'cd.result.metric.trials': '测试试次总数',
    'cd.result.metric.trialsNote': '覆盖 Set Size {sizes}',
    'cd.result.breakdown.title': '不同阵列规模 (Set Size) 下的 K 值表现：',
    'cd.result.breakdown.setSize': '阵列大小 N = {n}',
    'cd.result.breakdown.hitRate': '命中率 (H):',
    'cd.result.breakdown.falseAlarmRate': '虚报率 (F):',
    'cd.result.export': '导出结果 (JSON)',
    'cd.result.finish': '完成并返回设置',
    'cd.export.appName': '工作记忆训练与评估平台',

    // ---- K 值分级（与 utils/statistics.ts 的 evaluateKScore 分级一一对应）----
    'cd.kEval.noData.rating': '数据不足 (No Data)',
    'cd.kEval.noData.description':
      '本会话没有产生可用的判定数据，无法估计容量上限，建议重新测量。',
    'cd.kEval.belowChance.rating': '低于随机水平 (Below Chance)',
    'cd.kEval.belowChance.description':
      'K 为负值，说明虚报率高于命中率，判别表现低于随机猜测水平。常见原因：作答过快、未理解按键含义、或维持期内明显分心。建议仔细阅读指导语后重新测量。',
    'cd.kEval.superior.rating': '优异 (Superior)',
    'cd.kEval.superior.description':
      '视觉空间工作记忆容量远超成年人常模，多客体并行表征与抗干扰能力极强。',
    'cd.kEval.high.rating': '良好 (High Normal)',
    'cd.kEval.high.description':
      '符合典型健康成人的认知神经心理学常模水平（约 3~4 个独立客体）。',
    'cd.kEval.normal.rating': '中等 (Normal)',
    'cd.kEval.normal.description':
      '处于基础工作记忆容量区间，建议增加视觉变化检测与干扰抑制的日常训练。',
    'cd.kEval.needsTraining.rating': '需提升 (Needs Training)',
    'cd.kEval.needsTraining.description':
      '受瞬时注意力分散或维持期信号衰减影响，可通过渐进式 Set Size 练习增强维持稳定性。',
  },
  en: {
    // ---- Paradigm intro ----
    'cd.badge': 'Paradigm 3 · Visuospatial working-memory capacity limit (K)',
    'cd.title': 'Visual Change Detection Task',
    'cd.introPre':
      'A multicolour array of squares flashes very briefly (adjustable from 100 to 1000 ms), is followed by a retention interval, then reappears — decide whether the target square has changed colour. The formula ',
    'cd.introPost': ' provides a precise estimate of the limit of pure visual representation capacity.',
    'cd.start': 'Start K assessment',

    // ---- Configuration panel ----
    'cd.config.title': 'Task parameters & difficulty',
    'cd.config.freeAdjust': 'Fully adjustable',

    'cd.presets.label': 'Difficulty presets',
    'cd.presets.hint.easy': 'Recommended for beginners',
    'cd.presets.hint.standard': 'Academic benchmark',
    'cd.presets.hint.hard': 'Extreme challenge',

    'cd.preset.easy.name': 'Beginner',
    'cd.preset.easy.tag': 'Easy',
    'cd.preset.easy.description':
      'Extends the viewing time to 600 ms with smaller arrays — suited to a first run while learning the procedure',
    'cd.preset.standard.name': 'Classic Academic',
    'cd.preset.standard.tag': 'Standard',
    'cd.preset.standard.description': 'A ~250 ms flash, the classic Cowan (2001) array standard',
    'cd.preset.hard.name': 'Ultra-Fast',
    'cd.preset.hard.tag': 'Very hard',
    'cd.preset.hard.description':
      'Only 120 ms of ultra-brief presentation, taxing high-level perceptual encoding and representation',
    'cd.preset.flash': 'Flash {ms} ms',

    'cd.sample.label': 'Flash duration',
    'cd.sample.tick100': '100 ms (extreme)',
    'cd.sample.tick350': '350 ms (moderate)',
    'cd.sample.tick600': '600 ms (ample)',
    'cd.sample.tick1000': '1000 ms (easy)',
    'cd.sample.quick': 'Quick presets:',

    'cd.delay.label': 'Retention interval (blank delay)',
    'cd.delay.tick300': '300 ms (very short)',
    'cd.delay.tick900': '900 ms (standard retention)',
    'cd.delay.tick2000': '2000 ms (long-delay decay)',

    'cd.setSizes.label': 'Array set sizes',
    'cd.setSizes.count': '{sizes} squares',
    'cd.setSizes.small.label': 'Small array [3, 4, 5]',
    'cd.setSizes.small.desc': 'Lower difficulty',
    'cd.setSizes.classic.label': 'Classic [4, 6, 8]',
    'cd.setSizes.classic.desc': 'Standard academic',
    'cd.setSizes.challenge.label': 'Challenge [6, 8, 10]',
    'cd.setSizes.challenge.desc': 'High load',

    'cd.feedback.group': 'Per-trial feedback mode',
    'cd.feedback.label': 'Per-trial feedback',
    'cd.feedback.assessment': 'Assessment mode',
    'cd.feedback.assessmentDefault': 'Assessment mode (default)',
    'cd.feedback.practice': 'Practice mode',
    'cd.feedback.note':
      'Assessment mode shows no per-trial correctness feedback (standard paradigm practice), so that strategy shifts and emotional arousal do not contaminate K; practice mode keeps the full correctness text and sound.',

    'cd.trials.label': 'Trials per set size',
    'cd.trials.total': '{count} trials in total',
    'cd.trials.option': '{count} per set size ({total} trials)',

    // ---- Instructions & key bindings ----
    'cd.guide.title': 'Procedure and response keys',
    'cd.guide.flashPre': 'The current flash duration is ',
    'cd.guide.flashPost': '; if it still feels too hard, you can lengthen it on the left.',
    'cd.guide.step1.title': 'Fixation cross',
    'cd.guide.step1.pre': 'Fixate the ',
    'cd.guide.step1.post': ' at the centre of the screen (500 ms).',
    'cd.guide.step2.title': 'Memory array',
    'cd.guide.step2.pre': 'The square array flashes for ',
    'cd.guide.step2.post': ' — scan it quickly and hold a snapshot in mind.',
    'cd.guide.step3.title': 'Probe comparison',
    'cd.guide.step3.pre': 'After a {ms} ms retention interval, decide whether the colour of the probe square marked ',
    'cd.guide.step3.mark': '“?”',
    'cd.guide.step3.post': ' has changed.',
    'cd.keys.title': 'Keyboard shortcuts:',
    'cd.keys.same': 'Colour unchanged / same:',
    'cd.keys.sameKeys': 'F or 1',
    'cd.keys.changed': 'Colour changed / different:',
    'cd.keys.changedKeys': 'J or 2',
    'cd.formula.title': "Cowan's K formula",
    'cd.formula.pre': 'Capacity limit ',
    'cd.formula.post':
      '. Subtracting the false-alarm rate (F) removes the effect of guessing. The adult norm is typically 3.0–4.5 objects.',
    'cd.startWithConfig': 'Start with this configuration ({count} trials)',

    // ---- Running task ----
    'cd.progress.trialLabel': 'Trial:',
    'cd.progress.arrayLabel': 'Array:',
    'cd.progress.arrayItems': '{count} items',
    'cd.progress.flash': 'Flash: {ms} ms',
    'cd.feedback.correct': '✓ Correct',
    'cd.feedback.wrong': '✗ Incorrect',
    'cd.phase.fixation': 'Fixation cross…',
    'cd.phase.sample': 'Memory array of coloured squares ({ms} ms)…',
    'cd.phase.delay': 'Retention interval — hold the array in mind…',
    'cd.phase.test': 'Has the probe colour changed?',
    'cd.live.paused': 'Task paused — waiting to resume',
    'cd.live.trial': 'Trial {current} of {total}, {phase}',
    'cd.live.phase.fixation': 'fixation cross',
    'cd.live.phase.sample': 'memory array on screen',
    'cd.live.phase.delay': 'retention interval',
    'cd.live.phase.test': 'decide whether the probe colour has changed',
    'cd.paused.title': 'Page focus lost — the task has been paused',
    'cd.paused.body':
      'To protect measurement validity, an interrupted trial is presented again from the fixation cross; if that trial had already been answered, the task moves straight to the next trial. The number of interruptions and the total time away are reported with the results as data-validity indicators.',
    'cd.paused.resume': 'Resume task',
    'cd.answer.same': 'Colour [unchanged / same]',
    'cd.answer.sameHint': 'Key: F or 1',
    'cd.answer.changed': 'Colour [changed / different]',
    'cd.answer.changedHint': 'Key: J or 2',
    'cd.answer.recorded': 'Response recorded — please wait for the next trial',
    'cd.answer.probePre': 'Judge only the colour of the target square with the ',
    'cd.answer.probeMark': 'yellow ring and “?”',
    'cd.answer.probePost': '.',

    // ---- Results ----
    'cd.result.title': "Visuospatial capacity limit (Cowan's K) report",
    'cd.result.subtitle':
      'The classic Cowan (2001) independent-slot measurement of visual working memory',
    'cd.result.restart': 'Restart',
    'cd.validity.warnLead': 'Data validity: this session recorded ',
    'cd.validity.warnInterruptions': ' focus-loss event(s), with a total of ',
    'cd.validity.warnSeconds': '{seconds} s',
    'cd.validity.warnRestartsPre': ' spent away, and ',
    'cd.validity.warnRestartsPost':
      ' trial(s) re-presented. Take these interruptions into account when interpreting K.',
    'cd.validity.ok':
      'Data validity: no interruptions occurred in this session and focus was well maintained (feedback mode: {mode}).',
    'cd.result.rating': 'Rating: {rating} (K = {k})',
    'cd.result.metric.k': "Cowan's K capacity",
    'cd.result.metric.kNorm': 'Typical healthy adult norm 3.0–4.5',
    'cd.result.metric.accuracy': 'Overall discrimination accuracy',
    'cd.result.metric.accuracyNote': 'Hits and correct rejections',
    'cd.result.metric.rt': 'Mean decision time (RT)',
    'cd.result.metric.rtNote': 'Retrieval and comparison latency',
    'cd.result.metric.trials': 'Total test trials',
    'cd.result.metric.trialsNote': 'Set sizes tested: {sizes}',
    'cd.result.breakdown.title': 'K at each set size:',
    'cd.result.breakdown.setSize': 'Set size N = {n}',
    'cd.result.breakdown.hitRate': 'Hit rate (H):',
    'cd.result.breakdown.falseAlarmRate': 'False-alarm rate (F):',
    'cd.result.export': 'Export results (JSON)',
    'cd.result.finish': 'Done — back to settings',
    'cd.export.appName': 'Working Memory Training & Assessment Platform',

    // ---- K rating bands (mirror the bands of evaluateKScore in utils/statistics.ts) ----
    'cd.kEval.noData.rating': 'Insufficient data',
    'cd.kEval.noData.description':
      'This session produced no usable decisions, so the capacity limit cannot be estimated. Re-run the assessment.',
    'cd.kEval.belowChance.rating': 'Below chance',
    'cd.kEval.belowChance.description':
      'K is negative, which means the false-alarm rate exceeded the hit rate and discrimination was below chance. Common causes: answering too quickly, misunderstanding the response keys, or clear distraction during the retention interval. Read the instructions carefully and re-run the assessment.',
    'cd.kEval.superior.rating': 'Superior',
    'cd.kEval.superior.description':
      'Visuospatial working-memory capacity clearly exceeds the adult norm, with very strong parallel representation of multiple objects and resistance to interference.',
    'cd.kEval.high.rating': 'High normal',
    'cd.kEval.high.description':
      'Within the cognitive-neuropsychological norm for typical healthy adults (about 3–4 independent objects).',
    'cd.kEval.normal.rating': 'Normal',
    'cd.kEval.normal.description':
      'In the basic working-memory capacity range; consider adding daily practice in visual change detection and interference inhibition.',
    'cd.kEval.needsTraining.rating': 'Needs training',
    'cd.kEval.needsTraining.description':
      'Performance is limited by momentary attentional lapses or by decay during the retention interval; progressive set-size practice can improve the stability of maintenance.',
  },
} as const;
