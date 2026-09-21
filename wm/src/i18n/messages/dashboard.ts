/**
 * 认知画像与报告（CognitiveDashboard / RadarChart）词条。
 * 约定见 src/i18n/README.md：必须同时提供 zh 与 en，键名用 `dash.<语义>`。
 *
 * 术语约定（文献通行英文，不要直译）：
 * - 动态刷新 updating；复杂跨度 complex span；视空间容量 visual capacity；
 *   抑制控制 inhibition control；加工速度 processing speed；常模 norm/normative；
 *   效度/中断 validity；Cowan's K；d′。
 * 注意：维度归一化与雷达图几何计算不在本文件；这里只承载文案。
 */
export const dashboard = {
  zh: {
    // 顶部总览
    'dash.title': '个人工作记忆综合画像与测评总览',
    'dash.compositeLabel': '综合指数',
    'dash.noData': '暂无数据',
    'dash.compositeFullTitle': '五个维度均有实测数据',
    'dash.compositePartialTitle': '仅 {measured} / {total} 个维度有实测数据，该指数为部分维度均值',
    'dash.compositePartialShort': '（部分维度 {measured}/{total}）',
    'dash.progress': '已完成三大范式中的 {count} / 3 项评测 · 仅由实测维度生成雷达模型',

    // 清除记录与撤销确认
    'dash.clearRecords': '清除记录',
    'dash.clearConfirmAria': '确认清除本地记录',
    'dash.clearConfirmPrompt': '确认清除全部 {count} 条记录？',
    'dash.clearConfirm': '确认清除',

    // 五个维度（label 用于雷达轴与明细行，source 为指标来源）
    'dash.dim.updating': '动态刷新力',
    'dash.dim.span': '复杂加工跨度',
    'dash.dim.capacity': '视空间容量',
    'dash.dim.speed': '加工响应敏捷度',
    'dash.dim.inhibition': '抗干扰抑制控制',
    'dash.source.nbackDPrime': "N-back d′",
    'dash.source.ospanRecall': 'OSPAN 序列回忆',
    'dash.source.cowanK': "Cowan's K",
    'dash.source.meanRt': '平均反应时',
    'dash.source.nbackFalseAlarms': 'N-back 虚报',

    // 雷达图卡片
    'dash.radarCardTitle': '五维工作记忆认知雷达',
    'dash.radarNotEnough': '已测量的维度不足 3 项',
    'dash.noRecords': '尚无测评记录',
    'dash.radarHint':
      '至少 3 个维度（通常需完成两项以上范式）后才会绘制雷达图。当前已测量维度：',
    'dash.none': '无',
    'dash.points': '{value} 分',
    'dash.radarFitted':
      '由 N-back (更新/抑制)、OSPAN (双任务跨度)、视觉变化检测 (K值) 的实测结果联合拟合',

    // 评估与建议卡片
    'dash.adviceTitle': '神经认知评估与学术建议',
    'dash.noDataExplanation':
      '完成任意一项任务后即可生成画像。在没有任何实测数据时，平台不会用默认基准分代替你的成绩，因此此处不显示综合指数与能力等级判定。',
    'dash.levelExceptional': '🌟 卓越级认知水平 (Top 10% 顶尖容量)',
    'dash.levelHighAverage': '✨ 优秀/健康常模水平 (High Average)',
    'dash.levelPlastic': '⚡ 具备可塑性提升空间 (High Plasticity)',
    'dash.preliminary': '初步画像（{measured} / {total} 个维度）',
    'dash.missingWarning':
      '尚有 {missing} 个维度没有实测数据（{names}）。综合指数为已完成维度的平均值，暂不给出能力等级判定，以免以未测量的维度推断你的水平。',
    'dash.dynamicNature':
      '工作记忆并非固定不变的先天智力，而是受前额叶皮层突触强化驱动的高度动态系统。',
    'dash.tipUpdatingLabel': '动态刷新专项：',
    'dash.tipUpdating':
      '每日坚持 10 分钟 2-back 或 3-back 空间训练，强力激活背外侧前额叶皮层 (DLPFC)。',
    'dash.tipInhibitionLabel': '抗干扰与双任务：',
    'dash.tipInhibition':
      '进行 OSPAN 练习以抵抗阅读/编码等深层心流下的瞬时干扰中断。',
    'dash.tipCapacityLabel': '视空间扩容：',
    'dash.tipCapacity':
      '在变化检测中训练多客体整体感知与特征绑定（Chunking 组块策略）。',

    // 快速跳转
    'dash.jumpTitle': '快速进入指定专项范式：',
    'dash.jumpChangeDetection': '视觉K值',

    // 三大范式摘要卡片
    'dash.nbackStat': '正确率 {accuracy}% · {n}-back',
    'dash.ospanScoreOf': '/ {max} 分',
    'dash.ospanStat': '算术正确率 {accuracy}%',
    'dash.cdStat': '辨别率 {accuracy}% · 常模 3.0~4.5',
    'dash.interrupted': ' · 曾中断 {count} 次（效度提示）',
    'dash.nbackEmpty': '暂无测试数据，点击进入开始首次测评',
    'dash.ospanEmpty': '暂无测试数据，点击进入开始双任务评测',
    'dash.cdEmpty': '暂无测试数据，点击测定视觉离散槽位上限',
    'dash.retest': '再测一次',
    'dash.startNow': '立即评测',

    // 历史日志
    'dash.historyTitle': '历次训练与评测日志 (最近 {count} 轮)',

    // 雷达图无障碍文案
    'dash.radarAria': '认知维度雷达图：{summary}',
    'dash.radarTitle': '认知维度雷达图（{count} 维）：{summary}',
    'dash.axisValue': '{label} {value} 分',
    'dash.summarySeparator': '，',
    'dash.listSeparator': '、',
  },
  en: {
    // Overview banner
    'dash.title': 'Personal Working Memory Profile & Assessment Overview',
    'dash.compositeLabel': 'Composite index',
    'dash.noData': 'No data',
    'dash.compositeFullTitle': 'All five dimensions have measured data',
    'dash.compositePartialTitle':
      'Only {measured} of {total} dimensions have measured data; this index is the mean of those dimensions',
    'dash.compositePartialShort': ' (partial: {measured}/{total})',
    'dash.progress':
      'Completed {count} of 3 paradigm assessments · the radar model is built from measured dimensions only',

    // Clearing records
    'dash.clearRecords': 'Clear records',
    'dash.clearConfirmAria': 'Confirm clearing local records',
    'dash.clearConfirmPrompt': 'Delete all {count} record(s)?',
    'dash.clearConfirm': 'Confirm clear',

    // Five dimensions
    'dash.dim.updating': 'Updating',
    'dash.dim.span': 'Complex span',
    'dash.dim.capacity': 'Visual capacity',
    'dash.dim.speed': 'Processing speed',
    'dash.dim.inhibition': 'Inhibition control',
    'dash.source.nbackDPrime': "N-back d′",
    'dash.source.ospanRecall': 'OSPAN serial recall',
    'dash.source.cowanK': "Cowan's K",
    'dash.source.meanRt': 'Mean RT',
    'dash.source.nbackFalseAlarms': 'N-back false alarms',

    // Radar card
    'dash.radarCardTitle': 'Five-dimension working memory radar',
    'dash.radarNotEnough': 'Fewer than 3 dimensions measured',
    'dash.noRecords': 'No assessment records yet',
    'dash.radarHint':
      'The radar chart is drawn only once at least three dimensions have been measured. Dimensions measured so far: ',
    'dash.none': 'none',
    'dash.points': '{value} pts',
    'dash.radarFitted':
      'Fitted jointly from the measured N-back (updating/inhibition), OSPAN (dual-task span) and visual change detection (K) results',

    // Assessment & advice card
    'dash.adviceTitle': 'Neurocognitive Assessment & Academic Notes',
    'dash.noDataExplanation':
      'Complete any one task to generate a profile. With no measured data at all, the platform never substitutes a default baseline for your scores, so no composite index and no ability classification are shown here.',
    'dash.levelExceptional': '🌟 Exceptional cognitive level (top-10% capacity)',
    'dash.levelHighAverage': '✨ High average / healthy normative level',
    'dash.levelPlastic': '⚡ Room for improvement (high plasticity)',
    'dash.preliminary': 'Preliminary profile ({measured} of {total} dimensions)',
    'dash.missingWarning':
      '{missing} dimension(s) still have no measured data ({names}). The composite index is the mean of the completed dimensions only; no ability classification is given, so that unmeasured dimensions are never used to infer your level.',
    'dash.dynamicNature':
      'Working memory is not a fixed, innate intellectual capacity but a highly dynamic system driven by synaptic strengthening in the prefrontal cortex.',
    'dash.tipUpdatingLabel': 'Updating: ',
    'dash.tipUpdating':
      'Ten minutes of 2-back or 3-back spatial training every day strongly engages the dorsolateral prefrontal cortex (DLPFC).',
    'dash.tipInhibitionLabel': 'Inhibition & dual-tasking: ',
    'dash.tipInhibition':
      'OSPAN practice helps resist momentary interference during deep reading or encoding.',
    'dash.tipCapacityLabel': 'Visual capacity: ',
    'dash.tipCapacity':
      'Change detection trains multi-object perception and feature binding (chunking strategies).',

    // Quick launch
    'dash.jumpTitle': 'Jump straight into a specific paradigm:',
    'dash.jumpChangeDetection': 'Visual K',

    // Paradigm summary cards
    'dash.nbackStat': 'Accuracy {accuracy}% · {n}-back',
    'dash.ospanScoreOf': '/ {max} pts',
    'dash.ospanStat': 'Arithmetic accuracy {accuracy}%',
    'dash.cdStat': 'Discrimination {accuracy}% · normative 3.0–4.5',
    'dash.interrupted': ' · {count} interruption(s) (validity flag)',
    'dash.nbackEmpty': 'No data yet — tap to start your first assessment',
    'dash.ospanEmpty': 'No data yet — tap to start the dual-task assessment',
    'dash.cdEmpty': 'No data yet — tap to measure your visual slot limit',
    'dash.retest': 'Test again',
    'dash.startNow': 'Start now',

    // History log
    'dash.historyTitle': 'Training & assessment log (last {count} session(s))',

    // Radar accessibility text
    'dash.radarAria': 'Cognitive dimension radar: {summary}',
    'dash.radarTitle': 'Cognitive dimension radar ({count} axes): {summary}',
    'dash.axisValue': '{label} {value} pts',
    'dash.summarySeparator': ', ',
    'dash.listSeparator': ', ',
  },
} as const;
