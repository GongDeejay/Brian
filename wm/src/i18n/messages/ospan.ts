/**
 * OSPAN（复杂运算跨度）词条（含指导语、算式界面、字母回忆、结果页）。
 * 约定见 src/i18n/README.md：必须同时提供 zh 与 en，键名用 `ospan.<语义>`。
 *
 * 术语对照（文献通行英文）：
 * - 复杂运算跨度 → complex operation span (OSPAN)
 * - 绝对得分 → absolute span score；部分正确计分 → partial-credit score
 * - 轮（一组试次）→ set；试次 → trial；跨度 → span
 * - 按键说明必须与组件代码一致：onKeyDown 接受 Y/y/1/ArrowLeft 表示“正确”，
 *   N/n/2/ArrowRight 表示“错误”（见 OSPANTask.tsx）。
 */
export const ospan = {
  zh: {
    // 头部与指导语
    'ospan.badge': '范式 2 · 高负荷信息加工与存储',
    'ospan.title': '复杂运算跨度任务 (OSPAN)',
    'ospan.intro':
      '经典双任务范式（Dual-task）：一边做算术验算（加工负荷），一边记忆伴随字母（存储负荷），并严格按顺序回忆。流体智力 ($G_f$) 强预测指标。',
    'ospan.start': '开始 OSPAN 评估',

    // 模式选择
    'ospan.modeTitle': '测试模式选择',
    'ospan.modeStandard': '标准学术评估模式',
    'ospan.modeStandardDetail': '跨度梯度 Span 2 → 5 (共4轮)',
    'ospan.modeQuick': '快速练习模式',
    'ospan.modeQuickDetail': '跨度梯度 Span 2 → 4 (共3轮)',
    'ospan.feedbackGroupAria': '逐试次反馈模式',
    'ospan.feedbackLabel': '逐试次反馈 (Feedback)',
    'ospan.modeAssessment': '评估模式（默认）',
    'ospan.modePractice': '练习模式',
    'ospan.feedbackNote':
      '评估模式不给出算式与序列的即时对错反馈（标准范式做法），避免诱发策略改变与情绪唤醒；练习模式保留完整的对错文本与音效。',
    'ospan.engleTitle': '学术规范说明 (Engle 准则)',
    'ospan.engleBodyPre': '受试者必须认真运算每一道题，运算正确率需',
    'ospan.engleBodyStrong': '达到 85% 以上',
    'ospan.engleBodyPost': '，评估结果方才符合学术有效性。切勿放弃运算专心背字母！',

    // 两段式双任务说明（数组型文案，渲染时用 tList）
    'ospan.mechanismTitle': '两段式双任务交替机制',
    'ospan.guideMath': '运算阶段：判断算式是否正确；正确按 Y 或 1，错误按 N 或 2。',
    'ospan.guideLetter': '存储阶段：紧接着屏幕呈现 1 个目标字母（约 1 秒），存入记忆。',
    'ospan.guideRecall': '回忆阶段：每轮结束后，按字母出现的先后顺序依次点击屏幕上的字母按钮回忆。',
    'ospan.startReady': '准备就绪，开始测试',

    // 运行界面通用
    'ospan.setLabel': '轮次: ',
    'ospan.spanLoadLabel': '跨度负荷: ',
    'ospan.mathPhase': '算题阶段 ({current} / {total})',
    'ospan.pausedTitle': '检测到页面失去焦点，实验已暂停',
    'ospan.pausedBody': '中断次数与累计离开时长会作为数据有效性指标随结果一并报告。',
    'ospan.pausedBodyLetter': '继续后当前字母会重新呈现一次，以避免编码被中断的残缺刺激。',
    'ospan.resume': '继续实验',
    'ospan.resumeLetter': '继续实验（重新呈现当前字母）',
    'ospan.resumeRecall': '继续回忆与作答',

    // 算式阶段
    'ospan.mathPrompt': '请迅速验证等式是否成立',
    'ospan.mathHint': '思考并做出判断，请勿为了背诵而故意放弃计算',
    'ospan.answerTrue': '等式正确 [ 是 ]',
    'ospan.answerTrueHint': '快捷键: Y 或 1',
    'ospan.answerFalse': '等式错误 [ 否 ]',
    'ospan.answerFalseHint': '快捷键: N 或 2',

    // 字母阶段
    'ospan.letterPrompt': '牢记此字母 (第 {current} / {total} 个)',
    'ospan.letterStoring': '存入工作记忆暂存区…',

    // 回忆阶段
    'ospan.recallPhase': '序列回忆阶段 · 跨度负荷: Span {span}',
    'ospan.recallOrder': '请按【出现顺序】依次点击对应字母',
    'ospan.recordedSequence': '已记录序列 ({current} / {total})',
    'ospan.undo': '撤销上一个',
    'ospan.submitted': '已提交本序列',
    'ospan.submit': '提交该轮回忆 ({current} / {total})',

    // 练习模式反馈
    'ospan.feedbackMathCorrect': '✓ 运算正确',
    'ospan.feedbackMathWrong': '✗ 运算失误',
    'ospan.feedbackPerfect': '✓ 本序列完全正确',
    'ospan.feedbackPartial': '✗ 序位正确 {correct} / {total}',

    // 屏幕阅读器播报
    'ospan.livePaused': '实验已暂停，等待继续',
    'ospan.liveMath': '第 {set} 轮，跨度 {span}，算题阶段第 {item} 题',
    'ospan.liveLetter': '请记住当前字母',
    'ospan.liveRecall': '第 {set} 轮回忆阶段，跨度 {span}',

    // 结果页
    'ospan.resultTitle': '复杂运算跨度 (OSPAN) 评估报告',
    'ospan.resultSubtitle': 'Turner & Engle (1989) 经典流体智力容量量化',
    'ospan.restart': '重新测试',
    'ospan.validityWarn':
      '数据有效性提示：本会话记录到 {interruptions} 次页面失去焦点，累计离开 {seconds} 秒，其中 {restarts} 个项目被重新呈现。解释结果时请考虑这些中断。',
    'ospan.validityOk':
      '数据有效性：整个会话未发生中断，焦点保持良好（反馈模式：{mode}）。',
    'ospan.validTitle': '学术有效性：有效评估 (Valid OSPAN)',
    'ospan.validWarnTitle': '学术有效性警告：运算正确率低于 85%',
    'ospan.validBodyPre': '运算阶段正确率为 ',
    'ospan.accuracyPct': '{accuracy}%',
    'ospan.validBodyValid':
      '。符合 Engle 心理测量学双任务标准，表明受试者在充分加工的同时保持了高负荷存储。',
    'ospan.validBodyWarn':
      '。心理测量学标准要求运算正确率达 85% 以上，以确保没有通过牺牲加工负荷来单边增加记忆得分。',
    'ospan.absoluteScore': '绝对 OSPAN 得分',
    'ospan.absoluteScoreHint': '全对序列跨度和',
    'ospan.totalScore': '总回忆项目数',
    'ospan.totalScoreHint': '序位完全正确项',
    'ospan.mathAccuracy': '运算加工正确率',
    'ospan.mathAccuracyHint': '标准阈值 ≥85%',
    'ospan.meanMathRt': '算术平均决策耗时',
    'ospan.meanMathRtHint': '加工速度指标',
    'ospan.breakdownTitle': '各跨度序列回忆复盘：',
    'ospan.targetLabel': '目标:',
    'ospan.recalledLabel': '你回忆:',
    'ospan.setPerfect': '完全正确',
    'ospan.setImperfect': '部分/失误',
    'ospan.export': '导出结果 (JSON)',
    'ospan.backToConfig': '完成并返回模式选择',
    'ospan.exportApp': '工作记忆训练与评估平台',
  },
  en: {
    // Header and instructions
    'ospan.badge': 'Paradigm 2 · High-load processing and storage',
    'ospan.title': 'Complex Operation Span Task (OSPAN)',
    'ospan.intro':
      'The classic dual-task paradigm: verify arithmetic (processing load) while memorising the accompanying letters (storage load), then recall them in strict serial order. A strong predictor of fluid intelligence ($G_f$).',
    'ospan.start': 'Start OSPAN assessment',

    // Mode selection
    'ospan.modeTitle': 'Choose a test mode',
    'ospan.modeStandard': 'Standard academic assessment',
    'ospan.modeStandardDetail': 'Span gradient 2 → 5 (4 sets)',
    'ospan.modeQuick': 'Quick practice',
    'ospan.modeQuickDetail': 'Span gradient 2 → 4 (3 sets)',
    'ospan.feedbackGroupAria': 'Per-trial feedback mode',
    'ospan.feedbackLabel': 'Per-trial feedback',
    'ospan.modeAssessment': 'Assessment (default)',
    'ospan.modePractice': 'Practice',
    'ospan.feedbackNote':
      'Assessment mode gives no immediate correct/incorrect feedback for the equations or the letter sequences (the standard procedure), so that strategy change and emotional arousal are not induced. Practice mode keeps the full correct/incorrect text and sounds.',
    'ospan.engleTitle': 'Academic criterion (Engle guideline)',
    'ospan.engleBodyPre':
      'Participants must work through every equation carefully: math accuracy must ',
    'ospan.engleBodyStrong': 'reach 85% or above',
    'ospan.engleBodyPost':
      ' for the assessment to be academically valid. Never abandon the arithmetic in order to concentrate on the letters!',

    // Two-stage dual-task walkthrough (key array, rendered with tList)
    'ospan.mechanismTitle': 'Alternating two-stage dual-task procedure',
    'ospan.guideMath':
      'Math phase: decide whether the equation is correct — press Y or 1 for correct, N or 2 for incorrect.',
    'ospan.guideLetter':
      'Storage phase: the screen then presents one target letter (about 1 s) — commit it to memory.',
    'ospan.guideRecall':
      'Recall phase: at the end of each set, click the on-screen letter buttons in the exact order in which the letters appeared.',
    'ospan.startReady': 'Ready — start the test',

    // Running view, shared
    'ospan.setLabel': 'Set: ',
    'ospan.spanLoadLabel': 'Span load: ',
    'ospan.mathPhase': 'Math phase ({current} / {total})',
    'ospan.pausedTitle': 'The page lost focus — the task is paused',
    'ospan.pausedBody':
      'The number of interruptions and the total time away are reported with the results as data-validity indicators.',
    'ospan.pausedBodyLetter':
      'When you continue, the current letter is presented once more so that no partially encoded stimulus is kept.',
    'ospan.resume': 'Continue',
    'ospan.resumeLetter': 'Continue (re-present the current letter)',
    'ospan.resumeRecall': 'Continue with recall',

    // Math phase
    'ospan.mathPrompt': 'Decide quickly whether the equation is true',
    'ospan.mathHint':
      'Work out the answer and decide — do not deliberately skip the arithmetic in order to rehearse the letters',
    'ospan.answerTrue': 'Equation is correct [ Yes ]',
    'ospan.answerTrueHint': 'Shortcut: Y or 1',
    'ospan.answerFalse': 'Equation is incorrect [ No ]',
    'ospan.answerFalseHint': 'Shortcut: N or 2',

    // Letter phase
    'ospan.letterPrompt': 'Memorise this letter ({current} / {total})',
    'ospan.letterStoring': 'Storing it in the working-memory buffer…',

    // Recall phase
    'ospan.recallPhase': 'Serial recall · Span load: Span {span}',
    'ospan.recallOrder': 'Click the letters in the order in which they appeared',
    'ospan.recordedSequence': 'Recorded sequence ({current} / {total})',
    'ospan.undo': 'Undo last',
    'ospan.submitted': 'Sequence submitted',
    'ospan.submit': 'Submit this set ({current} / {total})',

    // Practice-mode feedback
    'ospan.feedbackMathCorrect': '✓ Correct',
    'ospan.feedbackMathWrong': '✗ Incorrect',
    'ospan.feedbackPerfect': '✓ Whole sequence correct',
    'ospan.feedbackPartial': '✗ {correct} / {total} in the correct position',

    // Screen-reader announcements
    'ospan.livePaused': 'Task paused, waiting to continue',
    'ospan.liveMath': 'Set {set}, span {span}, math item {item}',
    'ospan.liveLetter': 'Memorise the current letter',
    'ospan.liveRecall': 'Set {set}, recall phase, span {span}',

    // Results
    'ospan.resultTitle': 'Complex Operation Span (OSPAN) Report',
    'ospan.resultSubtitle':
      'Turner & Engle (1989) — a classic quantification of fluid-intelligence capacity',
    'ospan.restart': 'Restart',
    'ospan.validityWarn':
      'Data validity: this session recorded {interruptions} episode(s) of lost focus, {seconds} s away in total, and {restarts} item(s) re-presented. Take these interruptions into account when interpreting the results.',
    'ospan.validityOk':
      'Data validity: no interruption occurred during the session and focus was maintained (feedback mode: {mode}).',
    'ospan.validTitle': 'Academic validity: valid assessment (Valid OSPAN)',
    'ospan.validWarnTitle': 'Academic validity warning: math accuracy below 85%',
    'ospan.validBodyPre': 'Math-phase accuracy was ',
    'ospan.accuracyPct': '{accuracy}%',
    'ospan.validBodyValid':
      '. This meets the Engle psychometric dual-task criterion, indicating that the participant maintained high-load storage while processing fully.',
    'ospan.validBodyWarn':
      '. The psychometric criterion requires math accuracy of 85% or above, ensuring that memory scores were not raised one-sidedly by sacrificing the processing load.',
    'ospan.absoluteScore': 'Absolute OSPAN score',
    'ospan.absoluteScoreHint': 'Sum of spans for sets recalled perfectly',
    'ospan.totalScore': 'Total items recalled',
    'ospan.totalScoreHint': 'Items recalled in the correct serial position',
    'ospan.mathAccuracy': 'Math (processing) accuracy',
    'ospan.mathAccuracyHint': 'Benchmark ≥ 85%',
    'ospan.meanMathRt': 'Mean arithmetic decision time',
    'ospan.meanMathRtHint': 'Processing-speed index',
    'ospan.breakdownTitle': 'Set-by-set recall review:',
    'ospan.targetLabel': 'Target:',
    'ospan.recalledLabel': 'You recalled:',
    'ospan.setPerfect': 'Perfect',
    'ospan.setImperfect': 'Partial / error',
    'ospan.export': 'Export results (JSON)',
    'ospan.backToConfig': 'Done — back to mode selection',
    'ospan.exportApp': 'Working Memory Training & Assessment Platform',
  },
} as const;
