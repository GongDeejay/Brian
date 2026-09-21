/**
 * N-back 任务词条（含指导语、参数面板、运行界面、结果页）。
 * 约定见 src/i18n/README.md：必须同时提供 zh 与 en，键名用 `nback.<语义>`。
 * 注意：范式指导语与指标名称请使用文献通用译法，不要直译。
 *
 * 术语对照（文献通行英文）：
 * - 命中 / 漏报 / 虚报 / 正确拒绝 → hit / miss / false alarm / correct rejection
 * - d′ → d′（d-prime）；试次 → trial；刺激间隔 → inter-stimulus interval (ISI)
 * - 按键说明必须与组件代码一致：onKeyDown 监听 Space 与 J（见 NBackTask.tsx）。
 */
export const nback = {
  zh: {
    // 头部与指导语
    'nback.badge': '范式 1 · 动态更新与抑制控制',
    'nback.title': 'N-back 任务训练与评估',
    'nback.introPre': '要求在不断推移的信息流中，判断当前刺激是否与倒数第 ',
    'nback.introPost':
      ' 步的刺激一致。用于评估背外侧前额叶皮层 (DLPFC) 的持续动态刷新能力。',
    'nback.start': '开始评估/训练',

    // 参数面板
    'nback.configTitle': '参数调节与测试难度',
    'nback.levelLabel': 'N-back 步长级别 (N)',
    'nback.level1Hint': '基础入门',
    'nback.level2Hint': '经典评估',
    'nback.level3Hint': '高阶挑战',
    'nback.stimulusModeLabel': '刺激类型 (Stimulus Mode)',
    'nback.modeSpatial': '九宫格空间',
    'nback.modeLetter': '字母序列',
    'nback.modeSymbol': '几何图形',
    'nback.trialsLabel': '试次数目 (Trials)',
    'nback.trialsCount': '{count} 次',
    'nback.feedbackGroupAria': '逐试次反馈模式',
    'nback.feedbackLabel': '逐试次反馈 (Feedback)',
    'nback.modeAssessment': '评估模式（默认）',
    'nback.modePractice': '练习模式',
    'nback.feedbackNote':
      '评估模式不提供逐试次正误反馈（标准范式做法），以免引发策略改变与情绪唤醒污染测量，仅保留刺激起始提示音；练习模式保留完整的对错文本与音效。',
    'nback.guideTitle': '操作指南',
    'nback.guidePre': '观察中央刺激，若当前刺激与 ',
    'nback.guideNBack': '{n} 步之前',
    'nback.guidePost': ' 出现的刺激完全相同，请立即按下 ',
    'nback.guideKeySpace': '空格键',
    'nback.guideTail': ' 或点击【匹配】。',

    // 就绪预览
    'nback.readyTitle': '已就绪：{n}-Back {mode}训练',
    'nback.readySpatial': '空间',
    'nback.readyLetter': '字母',
    'nback.readySymbol': '图形',
    'nback.readyDetail':
      '共 {total} 组刺激，单次刺激呈现 {stimulus}ms，间隔 {isi}ms。准备好你的工作记忆缓存！',
    'nback.startNow': '立刻开始实验',

    // 倒计时
    'nback.countdownLabel': '{n}-Back 即将呈现',
    'nback.countdownFocus': '保持注意力高度集中，注视屏幕中央',
    'nback.countdownSr': '{n}-back 任务将在 {seconds} 秒后开始',

    // 运行界面
    'nback.trialCounter': '试次: {current} / {total}',
    'nback.levelInline': '步长: {n}-Back',
    'nback.pausedTitle': '检测到页面失去焦点，实验已暂停',
    'nback.pausedBody':
      '为保障测量有效性，被中断的试次数据不计入统计，继续后将从该试次的刺激呈现阶段重新开始。中断次数与累计离开时长会作为数据有效性指标随结果一并报告。',
    'nback.resume': '继续实验（重新呈现当前试次）',
    'nback.matchButton': '匹配！与前第 {n} 步相同',
    'nback.keySpaceOrJ': 'Space 或 J',
    'nback.noResponseHint': '若不同无需按键，刺激将在 {ms}ms 后自动推进',
    'nback.livePaused': '实验已暂停，等待继续',
    'nback.liveTrial': '第 {current} 试次，共 {total} 试次，{phase}',
    'nback.phaseStimulus': '刺激呈现中',
    'nback.phaseIsi': '刺激间隔',

    // 练习模式逐试次反馈
    'nback.feedbackHit': '✓ 匹配成功 (Hit)',
    'nback.feedbackMiss': '✗ 漏报 (Miss)',
    'nback.feedbackFalseAlarm': '✗ 误报 (False Alarm)',

    // 结果页
    'nback.resultTitle': '{n}-Back 动态更新任务评估结果',
    'nback.resultSubtitle': '前额叶皮层执行功能与信号检测论分析',
    'nback.restart': '重新测试',
    'nback.validityWarn':
      '数据有效性提示：本会话记录到 {interruptions} 次页面失去焦点，累计离开 {seconds} 秒，其中 {restarts} 个试次被重新呈现。解释结果时请考虑这些中断。',
    'nback.validityOk':
      '数据有效性：整个会话未发生中断，焦点保持良好（反馈模式：{mode}）。',
    'nback.dprimeLabel': '信号敏感度 (d′)',
    'nback.dprimeHigh': '极高判别力',
    'nback.dprimeGood': '良好辨别力',
    'nback.dprimeFair': '一般/需提升',
    'nback.accuracyLabel': '综合正确率',
    'nback.accuracyHint': '含命中与正确拒绝',
    'nback.meanRtLabel': '平均反应时',
    'nback.meanRtHint': '命中决策延迟',
    'nback.inhibitionErrorsLabel': '抑制失误 (虚报)',
    'nback.inhibitionErrorsHint': '冲动抑制控制指标',
    'nback.sdTitle': '信号检测论详细分布：',
    'nback.sdHits': '命中 (Hit)',
    'nback.sdMisses': '漏报 (Miss)',
    'nback.sdFalseAlarms': '虚报 (False Alarm)',
    'nback.sdCorrectRejections': '正确拒绝 (CR)',
    'nback.export': '导出结果 (JSON)',
    'nback.backToConfig': '完成并返回配置',
    'nback.exportApp': '工作记忆训练与评估平台',
  },
  en: {
    // Header and instructions
    'nback.badge': 'Paradigm 1 · Dynamic updating & inhibitory control',
    'nback.title': 'N-back Task Training & Assessment',
    'nback.introPre':
      'In a continuously changing stream of stimuli, decide whether the current stimulus matches the one presented ',
    'nback.introPost':
      ' steps back. This assesses sustained dynamic updating in the dorsolateral prefrontal cortex (DLPFC).',
    'nback.start': 'Start assessment / training',

    // Configuration panel
    'nback.configTitle': 'Parameters and task difficulty',
    'nback.levelLabel': 'N-back level (N)',
    'nback.level1Hint': 'Entry level',
    'nback.level2Hint': 'Classic assessment',
    'nback.level3Hint': 'High demand',
    'nback.stimulusModeLabel': 'Stimulus type (mode)',
    'nback.modeSpatial': 'Spatial 3×3 grid',
    'nback.modeLetter': 'Letter sequence',
    'nback.modeSymbol': 'Geometric symbols',
    'nback.trialsLabel': 'Number of trials',
    'nback.trialsCount': '{count} trials',
    'nback.feedbackGroupAria': 'Per-trial feedback mode',
    'nback.feedbackLabel': 'Per-trial feedback',
    'nback.modeAssessment': 'Assessment (default)',
    'nback.modePractice': 'Practice',
    'nback.feedbackNote':
      'Assessment mode gives no per-trial correctness feedback (the standard procedure), so that strategy change and emotional arousal cannot contaminate the measurement; only the stimulus-onset cue sound is kept. Practice mode keeps the full correct/incorrect text and sounds.',
    'nback.guideTitle': 'Instructions',
    'nback.guidePre':
      'Watch the central stimulus. If the current stimulus is exactly the same as the one presented ',
    'nback.guideNBack': '{n} steps earlier',
    'nback.guidePost': ', press ',
    'nback.guideKeySpace': 'Space',
    'nback.guideTail': ' immediately, or click the Match button.',

    // Ready preview
    'nback.readyTitle': 'Ready: {n}-Back {mode} training',
    'nback.readySpatial': 'spatial',
    'nback.readyLetter': 'letter',
    'nback.readySymbol': 'symbol',
    'nback.readyDetail':
      '{total} stimuli in total; each stimulus is presented for {stimulus} ms with a {isi} ms inter-stimulus interval (ISI). Get your working-memory buffer ready!',
    'nback.startNow': 'Start the task now',

    // Countdown
    'nback.countdownLabel': '{n}-Back about to begin',
    'nback.countdownFocus': 'Stay highly focused and keep your eyes on the centre of the screen',
    'nback.countdownSr': 'The {n}-back task will start in {seconds} seconds',

    // Running view
    'nback.trialCounter': 'Trial: {current} / {total}',
    'nback.levelInline': 'Level: {n}-Back',
    'nback.pausedTitle': 'The page lost focus — the task is paused',
    'nback.pausedBody':
      'To protect measurement validity, the interrupted trial is not counted; when you continue, that trial restarts from stimulus onset. The number of interruptions and the total time away are reported with the results as data-validity indicators.',
    'nback.resume': 'Continue (re-present the current trial)',
    'nback.matchButton': 'MATCH! Same as {n} back',
    'nback.keySpaceOrJ': 'Space or J',
    'nback.noResponseHint':
      'If it is different, no key is needed — the next stimulus follows automatically after {ms} ms',
    'nback.livePaused': 'Task paused, waiting to continue',
    'nback.liveTrial': 'Trial {current} of {total}, {phase}',
    'nback.phaseStimulus': 'stimulus on screen',
    'nback.phaseIsi': 'inter-stimulus interval',

    // Practice-mode per-trial feedback
    'nback.feedbackHit': '✓ Hit',
    'nback.feedbackMiss': '✗ Miss',
    'nback.feedbackFalseAlarm': '✗ False alarm',

    // Results
    'nback.resultTitle': '{n}-Back Dynamic Updating Task — Results',
    'nback.resultSubtitle': 'Prefrontal executive function and signal detection analysis',
    'nback.restart': 'Restart',
    'nback.validityWarn':
      'Data validity: this session recorded {interruptions} episode(s) of lost focus, {seconds} s away in total, and {restarts} trial(s) re-presented. Take these interruptions into account when interpreting the results.',
    'nback.validityOk':
      'Data validity: no interruption occurred during the session and focus was maintained (feedback mode: {mode}).',
    'nback.dprimeLabel': 'Signal sensitivity (d′)',
    'nback.dprimeHigh': 'Excellent discriminability',
    'nback.dprimeGood': 'Good discriminability',
    'nback.dprimeFair': 'Fair — room to improve',
    'nback.accuracyLabel': 'Overall accuracy',
    'nback.accuracyHint': 'Hits and correct rejections combined',
    'nback.meanRtLabel': 'Mean response time',
    'nback.meanRtHint': 'Decision latency on hits',
    'nback.inhibitionErrorsLabel': 'Inhibition errors (false alarms)',
    'nback.inhibitionErrorsHint': 'Index of impulsive response control',
    'nback.sdTitle': 'Signal detection breakdown:',
    'nback.sdHits': 'Hit',
    'nback.sdMisses': 'Miss',
    'nback.sdFalseAlarms': 'False alarm',
    'nback.sdCorrectRejections': 'Correct rejection (CR)',
    'nback.export': 'Export results (JSON)',
    'nback.backToConfig': 'Done — back to setup',
    'nback.exportApp': 'Working Memory Training & Assessment Platform',
  },
} as const;
