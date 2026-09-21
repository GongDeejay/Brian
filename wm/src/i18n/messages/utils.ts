/**
 * 工具层与共享控件词条（storage / statistics / AbortControl / ProgressBar / useFocusGuard）。
 *
 * 约定见 src/i18n/README.md：必须同时提供 zh 与 en，键名用 `命名空间.语义`。
 * 这些文案的使用者不是某一个范式组件，而是被三个范式共用的工具与非组件模块：
 * - `storage.*` 历史记录摘要与本地存储错误（写入时按当时的语言定格，见 utils/storage.ts）；
 * - `kEval.*`  Cowan's K 的定性档位（`evaluateKScore` 只返回档位 id，文案在这里）；
 * - `abort.*`   中断控件；`progress.*` 进度条；`focus.*` 焦点守卫。
 *
 * 术语：validity / interruption / local storage / estimated remaining /
 * percentile / partial credit，均取文献与产品通行译法，不要直译。
 * i18n entries for shared utilities and non-paradigm components.
 */
export const utils = {
  zh: {
    // ---- 历史记录摘要（storage.ts 写入 history 时生成）----
    'storage.record.nbackScore': '{n}-back | 正确率: {percent}% (d′={dPrime})',
    'storage.record.nbackDetail':
      '命中: {hits}, 虚报: {falseAlarms}, 平均反应时: {rt}ms',
    'storage.record.ospanScore':
      '绝对得分: {score} / {max} | 运算正确率: {percent}%',
    'storage.record.ospanDetail': '总回忆正确项: {total}, 加工平均RT: {rt}ms',
    'storage.record.cdScore': "Cowan's K = {k} | 准确率: {percent}%",
    'storage.record.cdDetail': '测试项阵列 {arrayText}, 平均反应时: {rt}ms',
    'storage.record.arraySizes': '{sizes}',
    'storage.record.arraySizesNone': '—',
    'storage.record.arrayScaleSuffix': ' ({count} 种规模)',

    // ---- 效度后缀（被中断的会话）----
    'storage.validitySuffix': ' · 中断 {count} 次',

    // ---- 本地存储写入失败（诚实表述，不得弱化后果）----
    'storage.error.quota':
      '浏览器本地存储空间不足，本次结果已保留在当前页面，但未能写入本地记录。',
    'storage.error.unavailable':
      '浏览器本地存储不可用（可能处于隐私模式或已禁用），本次结果仅在当前页面有效。',
    'storage.error.writeFailed': '写入本地记录失败，本次结果仅在当前页面有效。',

    // ---- Cowan's K 定性档位（阈值在 utils/statistics.ts，本文件只承载文案）----
    'kEval.noData.rating': '数据不足 (No Data)',
    'kEval.noData.description':
      '本会话没有产生可用的判定数据，无法估计容量上限，建议重新测量。',
    'kEval.belowChance.rating': '低于随机水平 (Below Chance)',
    'kEval.belowChance.description':
      'K 为负值，说明虚报率高于命中率，判别表现低于随机猜测水平。常见原因：作答过快、未理解按键含义、或维持期内明显分心。建议仔细阅读指导语后重新测量。',
    'kEval.superior.rating': '优异 (Superior)',
    'kEval.superior.description':
      '视觉空间工作记忆容量远超成年人常模，多客体并行表征与抗干扰能力极强。',
    'kEval.high.rating': '良好 (High Normal)',
    'kEval.high.description':
      '符合典型健康成人的认知神经心理学常模水平（约 3~4 个独立客体）。',
    'kEval.normal.rating': '中等 (Normal)',
    'kEval.normal.description':
      '处于基础工作记忆容量区间，建议增加视觉变化检测与干扰抑制的日常训练。',
    'kEval.needsTraining.rating': '需提升 (Needs Training)',
    'kEval.needsTraining.description':
      '受瞬时注意力分散或维持期信号衰减影响，可通过渐进式 Set Size 练习增强维持稳定性。',

    // ---- 中断控件 ----
    'abort.buttonAria': '中断当前任务并放弃本次数据',
    'abort.button': '中断/退出',
    'abort.confirmGroupAria': '确认中断',
    'abort.confirmPrompt': '中断并放弃本次数据？',
    'abort.confirm': '确认中断',
    'abort.cancel': '继续实验',

    // ---- 进度条 ----
    'progress.defaultLabel': '总体进度',
    'progress.remaining': '预计剩余 {time}',
    'progress.etaUnderMinute': '约 {seconds} 秒',
    'progress.etaMinutes': '约 {minutes} 分 {seconds} 秒',
    'progress.etaUnknown': '—',
    'progress.aria': '{label}：已完成 {current} / {total}',

    // ---- 焦点守卫（beforeunload 文案）----
    'focus.leaveWarning': '实验正在进行，离开页面将丢失本次测评数据。',
  },
  en: {
    // ---- History record summaries (written by storage.ts) ----
    'storage.record.nbackScore': '{n}-back | Accuracy: {percent}% (d′={dPrime})',
    'storage.record.nbackDetail':
      'Hits: {hits}, False alarms: {falseAlarms}, Mean RT: {rt} ms',
    'storage.record.ospanScore':
      'Absolute score: {score} / {max} | Math accuracy: {percent}%',
    'storage.record.ospanDetail':
      'Total correctly recalled items: {total}, Mean processing RT: {rt} ms',
    'storage.record.cdScore': "Cowan's K = {k} | Accuracy: {percent}%",
    'storage.record.cdDetail':
      'Test arrays {arrayText}, Mean RT: {rt} ms',
    'storage.record.arraySizes': '{sizes}',
    'storage.record.arraySizesNone': '—',
    'storage.record.arrayScaleSuffix': ' ({count} set sizes)',

    // ---- Validity suffix (interrupted sessions) ----
    'storage.validitySuffix': ' · Interrupted {count}×',

    // ---- Local-storage write failures (state the consequence plainly) ----
    'storage.error.quota':
      'Browser local storage is full — this result is kept on the current page but could not be written to the local history.',
    'storage.error.unavailable':
      'Browser local storage is unavailable (private mode or disabled) — this result is valid only on the current page.',
    'storage.error.writeFailed':
      'Writing to local storage failed — this result is valid only on the current page.',

    // ---- Cowan's K qualitative bands (thresholds live in utils/statistics.ts) ----
    'kEval.noData.rating': 'Insufficient data',
    'kEval.noData.description':
      'This session produced no usable responses, so the capacity limit cannot be estimated. Please run the task again.',
    'kEval.belowChance.rating': 'Below chance',
    'kEval.belowChance.description':
      'K is negative, meaning the false-alarm rate exceeded the hit rate — discrimination was worse than chance. Typical causes: responding too quickly, misunderstanding the response keys, or clear distraction during the retention interval. Re-read the instructions and run the task again.',
    'kEval.superior.rating': 'Superior',
    'kEval.superior.description':
      'Visuospatial working-memory capacity is far above the adult norm, with exceptionally strong parallel object representation and resistance to interference.',
    'kEval.high.rating': 'High normal',
    'kEval.high.description':
      'At the level of a typical healthy adult neuropsychological norm (about 3–4 independent objects).',
    'kEval.normal.rating': 'Normal',
    'kEval.normal.description':
      'In the basic working-memory capacity range. Additional daily practice in visual change detection and interference inhibition is recommended.',
    'kEval.needsTraining.rating': 'Needs training',
    'kEval.needsTraining.description':
      'Performance was limited by momentary attentional lapses or decay of the trace during the retention interval; progressive set-size practice can improve maintenance stability.',

    // ---- Abort control ----
    'abort.buttonAria': 'Abort the current task and discard this session’s data',
    'abort.button': 'Abort / Exit',
    'abort.confirmGroupAria': 'Confirm abort',
    'abort.confirmPrompt': 'Abort and discard this session’s data?',
    'abort.confirm': 'Confirm abort',
    'abort.cancel': 'Continue task',

    // ---- Progress bar ----
    'progress.defaultLabel': 'Overall progress',
    'progress.remaining': 'Estimated remaining: {time}',
    'progress.etaUnderMinute': '{seconds} s',
    'progress.etaMinutes': '{minutes} min {seconds} s',
    'progress.etaUnknown': '—',
    'progress.aria': '{label}: {current} / {total} completed',

    // ---- Focus guard (beforeunload copy) ----
    'focus.leaveWarning':
      'The task is running — leaving this page will discard this session’s assessment data.',
  },
} as const;
