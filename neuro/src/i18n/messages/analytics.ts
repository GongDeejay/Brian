/**
 * 分析看板（AnalyticsDashboard）词条：雷达图、指数卡、临床指标解释、限制声明、导出与清空。
 * 约定见 src/i18n/README.md：必须同时提供 zh 与 en，键名用 `analytics.<语义>`。
 * 指标与限制声明必须与 sessionStore 的英文口径一致。
 */
export const analytics = {
  zh: {
    // ---- 顶部横幅 --------------------------------------------------------
    'analytics.badge': '多维神经认知画像 (Neuro-Cognitive Profiler)',
    'analytics.badgeNote': '仅基于实际完成的测验记录',
    'analytics.title': '分类与模式识别能力多维评估报告',
    'analytics.intro':
      '本页所有数值均由您在本机实际完成的测验记录计算得出（WCST / WPT / ID/ED / Gabor / 原型畸变）。未完成或样本量不足的维度一律显示为',
    'analytics.introNoData': '“暂无数据”',
    'analytics.introTail': '，系统不会用示范值或估计值填补。',

    // ---- 数据状态 --------------------------------------------------------
    'analytics.status.heading': '数据状态：',
    'analytics.dimensionJoin': '：',
    'analytics.status.none': '尚无任何测验记录',
    'analytics.status.partial': '部分维度可用（{available}/6）',
    'analytics.status.complete': '全部 6 个维度均可用',
    'analytics.status.summaryPrefix': '已记录会话 ',
    'analytics.status.summaryMid': ' 条（覆盖 {covered}/5 个测验范式），保存在本浏览器 sessionStorage 中，关闭标签页即清除。需要说明的是：',
    'analytics.status.noClinical': '本系统不输出临床结论',
    'analytics.status.summaryTail':
      '（如“正常”“优异”“极低耗损”），此类判读需要标准化常模与临床访谈；导出的报告同样只包含实测数据与数据不足的明确说明。',
    'analytics.status.emptyPrefix':
      '导出的报告在无数据时不会包含任何分数：',
    'analytics.status.emptyMid': '，6 个维度全部为 ',
    'analytics.status.emptyTail': '，并逐条说明缺失原因与系统局限。',
    'analytics.inlineCodeInsufficient': 'dataStatus = "insufficient"',
    'analytics.inlineCodeNull': 'null',

    // ---- 雷达图 ----------------------------------------------------------
    'analytics.radar.title': '脑区神经认知能力雷达图 (Cognitive Radar)',
    'analytics.radar.fullMark': '满分 100',
    'analytics.radar.note':
      '每一轴均来自一次完整测验的实测值；标有“暂无数据”的轴在图上以 0 绘制，仅表示尚无测量，不代表能力为 0。',
    'analytics.radar.series': '受试者实测分',
    'analytics.radar.subjectNoData': '{label}（暂无数据）',
    'analytics.radar.tooltipScore': '{score} 分',
    'analytics.radar.tooltipNoData': '暂无数据（未完成该测验或样本量不足）',
    'analytics.radar.composite': '综合指数（可用维度均值）',
    'analytics.radar.compositeValue': '{score} / 100',
    'analytics.radar.compositeNote': '由 {count} 个可用维度取平均；不可用维度不参与计算',
    'analytics.radar.sessionCount': '已记录会话数',
    'analytics.radar.sessionCountNote': '每个维度取该范式最近一次完整记录',

    // ---- 维度明细 --------------------------------------------------------
    'analytics.dims.title': '维度得分与计算依据（逐项可追溯）',
    'analytics.dims.score': '{score} / 100',
    'analytics.dims.basis': '计算依据：{explanation}',

    // ---- 各范式实测指标 --------------------------------------------------
    'analytics.indicators.title': '各测验最近一次实测指标',
    'analytics.indicators.note': '未完成的范式显示“无记录”',
    'analytics.indicators.noRecord': '无记录',
    'analytics.indicators.load': '负荷设置：{load} · 用时 {seconds}s',
    'analytics.indicators.empty':
      '暂无数据：完成一次完整的测验后，此处会显示实测指标。',
    'analytics.indicators.emptyGabor':
      '暂无数据：完成一次完整的 Gabor 分类试次并提交后，此处会显示实测指标。',
    'analytics.verdict.heading': '关于临床结论：',
    'analytics.verdict.body':
      '本系统不生成“正常 / 优异 / 极低耗损”等判定语句。此类结论必须依托标准化常模、受试者人口学信息与临床访谈，而本工具没有对应常模数据，因此报告的 ',
    'analytics.verdict.tail': ' 字段会明确说明这些内容未被提供。',
    'analytics.inlineCodeNotProvided': 'notProvided',

    // ---- 指标行标签（buildIndicatorRows） --------------------------------
    'analytics.row.wcst.trials': '试验数 / 完成分类',
    'analytics.row.wcst.trialsValue': '{trials} 次 / {categories} of 6',
    'analytics.row.wcst.pe': '持续性错误率 (PE)',
    'analytics.row.wcst.peValue': '{rate}%（PE {errors} 次）',
    'analytics.row.wcst.errors': '非持续性错误 / 未反应',
    'analytics.row.wcst.errorsValue': '{npe} / {omissions} 次',
    'analytics.row.wpt.trials': '试验数 / 作答数',
    'analytics.row.wpt.trialsValue': '{total} / {responded} 次',
    'analytics.row.wpt.optimal': '最优选择率',
    'analytics.row.wpt.optimalValue': '{rate}%',
    'analytics.row.wpt.accuracy': '实际命中率',
    'analytics.row.wpt.accuracyValue': '{rate}%',
    'analytics.row.wpt.timeouts': '未反应次数',
    'analytics.row.wpt.timeoutsValue': '{count} 次',
    'analytics.row.ided.stages': '完成阶段',
    'analytics.row.ided.stagesValue': '{stages} of 7',
    'analytics.row.ided.errors': 'EDS / IDS 错误',
    'analytics.row.ided.errorsValue': '{eds} / {ids} 次',
    'analytics.row.ided.shiftCost': 'EDS 定势转移代价',
    'analytics.row.ided.shiftCostValue': '{cost}',
    'analytics.row.ided.result': 'EDS 结果',
    'analytics.row.ided.failed': '{stage} 阶段达 {max} 次上限未通过',
    'analytics.row.ided.passed': '已通过',
    'analytics.row.ided.notReached': '未进行到 EDS',
    'analytics.row.gabor.trials': '试验数',
    'analytics.row.gabor.trialsValue': '{count} 次',
    'analytics.row.gabor.ii': 'II 条件正确率',
    'analytics.row.gabor.iiValue': '{rate}%（{trials} 次）',
    'analytics.row.gabor.rb': 'RB 条件正确率',
    'analytics.row.gabor.rbValue': '{rate}%（{trials} 次）',
    'analytics.row.rt': '平均反应时',
    'analytics.row.rtValue': '{ms} ms',
    'analytics.row.rtValueSampled': '{ms} ms（n={n}）',
    'analytics.row.notMeasured': '未测得',
    'analytics.row.prototype.trials': '学习 / 测试试次',
    'analytics.row.prototype.trialsValue': '{learning} / {test} 次',
    'analytics.row.prototype.accuracies': '未见原型 / 新畸变正确率',
    'analytics.row.prototype.accuraciesValue': '{proto}% / {novel}%',
    'analytics.row.prototype.effect': '原型优势效应',
    'analytics.row.prototype.effectValue': '{effect}pp',

    // ---- 会话流水 --------------------------------------------------------
    'analytics.history.title': '测验记录流水（{count} 条）',
    'analytics.history.note': '最新记录在最下方',
    'analytics.history.empty': '暂无记录。请先完成任一测验（WCST / WPT / ID/ED / Gabor / 原型畸变）的完整一轮。',
    'analytics.history.caption': '本机已记录的测验会话',
    'analytics.history.colTime': '时间',
    'analytics.history.colTask': '测验',
    'analytics.history.colAccuracy': '正确率',
    'analytics.history.colKeyMetric': '关键指标',
    'analytics.history.colLoad': '负荷设置',
    'analytics.history.colDuration': '用时',

    // ---- 操作 ------------------------------------------------------------
    'analytics.action.export': '导出评估报告 (JSON)',
    'analytics.action.clear': '清除记录',
    'analytics.confirmClear':
      '确定要清除本浏览器会话中记录的全部测验数据吗？此操作不可撤销。',
  },
  en: {
    // ---- Header banner ---------------------------------------------------
    'analytics.badge': 'Multidimensional neuro-cognitive profile',
    'analytics.badgeNote': 'Based only on tests actually completed',
    'analytics.title': 'Multidimensional categorisation and pattern-recognition report',
    'analytics.intro':
      'Every value on this page is computed from tests you actually completed on this device (WCST / WPT / ID/ED / Gabor / prototype distortion). Any dimension that is incomplete or below the minimum sample size is shown as',
    'analytics.introNoData': '“no data”',
    'analytics.introTail':
      '; the system never fills a gap with a demonstration or estimated value.',

    // ---- Data status -----------------------------------------------------
    'analytics.status.heading': 'Data status: ',
    'analytics.dimensionJoin': ': ',
    'analytics.status.none': 'no test records yet',
    'analytics.status.partial': 'some dimensions available ({available}/6)',
    'analytics.status.complete': 'all 6 dimensions available',
    'analytics.status.summaryPrefix': '',
    'analytics.status.summaryMid':
      ' recorded session(s) ({covered}/5 paradigms covered), kept in this browser’s sessionStorage and cleared when the tab is closed. Note that ',
    'analytics.status.noClinical': 'this system outputs no clinical conclusions',
    'analytics.status.summaryTail':
      ' (such as “normal”, “superior” or “minimal impairment”): that kind of interpretation requires standardised norms and a clinical interview. The exported report likewise contains measured data only, plus explicit statements of what is missing.',
    'analytics.status.emptyPrefix':
      'With no data, the exported report contains no scores at all: ',
    'analytics.status.emptyMid': ', all 6 dimensions are ',
    'analytics.status.emptyTail':
      ', and the reason for each missing value and each system limitation is stated individually.',
    'analytics.inlineCodeInsufficient': 'dataStatus = "insufficient"',
    'analytics.inlineCodeNull': 'null',

    // ---- Radar chart -----------------------------------------------------
    'analytics.radar.title': 'Brain-region neuro-cognitive radar',
    'analytics.radar.fullMark': 'out of 100',
    'analytics.radar.note':
      'Each axis comes from one complete test run. An axis marked “no data” is drawn at 0 on the chart: that means no measurement exists yet, not that ability is 0.',
    'analytics.radar.series': 'Participant measured score',
    'analytics.radar.subjectNoData': '{label} (no data)',
    'analytics.radar.tooltipScore': '{score} points',
    'analytics.radar.tooltipNoData': 'No data (test not completed, or sample size too small)',
    'analytics.radar.composite': 'Composite index (mean of available dimensions)',
    'analytics.radar.compositeValue': '{score} / 100',
    'analytics.radar.compositeNote':
      'Averaged over {count} available dimension(s); unavailable dimensions are excluded',
    'analytics.radar.sessionCount': 'Recorded sessions',
    'analytics.radar.sessionCountNote':
      'Each dimension uses the most recent complete run of that paradigm',

    // ---- Dimension breakdown ---------------------------------------------
    'analytics.dims.title': 'Dimension scores and how they were derived (auditable item by item)',
    'analytics.dims.score': '{score} / 100',
    'analytics.dims.basis': 'Derivation: {explanation}',

    // ---- Per-paradigm measured indicators --------------------------------
    'analytics.indicators.title': 'Most recent measured indicators per test',
    'analytics.indicators.note': 'Tests not yet completed show “no record”',
    'analytics.indicators.noRecord': 'No record',
    'analytics.indicators.load': 'Load settings: {load} · duration {seconds}s',
    'analytics.indicators.empty': 'No data: complete one full test run and the measured indicators will appear here.',
    'analytics.indicators.emptyGabor':
      'No data: complete one full run of Gabor classification trials and submit it, and the measured indicators will appear here.',
    'analytics.verdict.heading': 'On clinical conclusions: ',
    'analytics.verdict.body':
      'This system generates no verdict statements such as “normal / superior / minimal impairment”. Such conclusions require standardised norms, participant demographic information and a clinical interview; this tool has no matching normative data, so the report’s ',
    'analytics.verdict.tail': ' field states explicitly that these were not provided.',
    'analytics.inlineCodeNotProvided': 'notProvided',

    // ---- Indicator row labels --------------------------------------------
    'analytics.row.wcst.trials': 'Trials / categories completed',
    'analytics.row.wcst.trialsValue': '{trials} / {categories} of 6',
    'analytics.row.wcst.pe': 'Perseverative error rate (PE)',
    'analytics.row.wcst.peValue': '{rate}% (PE {errors})',
    'analytics.row.wcst.errors': 'Non-perseverative errors / omissions',
    'analytics.row.wcst.errorsValue': '{npe} / {omissions}',
    'analytics.row.wpt.trials': 'Trials / responses',
    'analytics.row.wpt.trialsValue': '{total} / {responded}',
    'analytics.row.wpt.optimal': 'Optimal choice rate',
    'analytics.row.wpt.optimalValue': '{rate}%',
    'analytics.row.wpt.accuracy': 'Actual hit rate',
    'analytics.row.wpt.accuracyValue': '{rate}%',
    'analytics.row.wpt.timeouts': 'Omissions',
    'analytics.row.wpt.timeoutsValue': '{count}',
    'analytics.row.ided.stages': 'Stages completed',
    'analytics.row.ided.stagesValue': '{stages} of 7',
    'analytics.row.ided.errors': 'EDS / IDS errors',
    'analytics.row.ided.errorsValue': '{eds} / {ids}',
    'analytics.row.ided.shiftCost': 'EDS set-shifting cost',
    'analytics.row.ided.shiftCostValue': '{cost}',
    'analytics.row.ided.result': 'EDS outcome',
    'analytics.row.ided.failed': 'failed {stage} at the {max}-trial cap',
    'analytics.row.ided.passed': 'Passed',
    'analytics.row.ided.notReached': 'EDS not reached',
    'analytics.row.gabor.trials': 'Trials',
    'analytics.row.gabor.trialsValue': '{count}',
    'analytics.row.gabor.ii': 'II condition accuracy',
    'analytics.row.gabor.iiValue': '{rate}% ({trials} trials)',
    'analytics.row.gabor.rb': 'RB condition accuracy',
    'analytics.row.gabor.rbValue': '{rate}% ({trials} trials)',
    'analytics.row.rt': 'Mean reaction time',
    'analytics.row.rtValue': '{ms} ms',
    'analytics.row.rtValueSampled': '{ms} ms (n={n})',
    'analytics.row.notMeasured': 'not measured',
    'analytics.row.prototype.trials': 'Learning / test trials',
    'analytics.row.prototype.trialsValue': '{learning} / {test}',
    'analytics.row.prototype.accuracies': 'Unseen prototype / novel distortion accuracy',
    'analytics.row.prototype.accuraciesValue': '{proto}% / {novel}%',
    'analytics.row.prototype.effect': 'Prototype enhancement effect',
    'analytics.row.prototype.effectValue': '{effect} pp',

    // ---- Session history -------------------------------------------------
    'analytics.history.title': 'Test record log ({count} records)',
    'analytics.history.note': 'Newest record at the bottom',
    'analytics.history.empty':
      'No records yet. Complete one full run of any test (WCST / WPT / ID/ED / Gabor / prototype distortion) first.',
    'analytics.history.caption': 'Test sessions recorded on this device',
    'analytics.history.colTime': 'Time',
    'analytics.history.colTask': 'Test',
    'analytics.history.colAccuracy': 'Accuracy',
    'analytics.history.colKeyMetric': 'Key metric',
    'analytics.history.colLoad': 'Load settings',
    'analytics.history.colDuration': 'Duration',

    // ---- Actions ---------------------------------------------------------
    'analytics.action.export': 'Export assessment report (JSON)',
    'analytics.action.clear': 'Clear records',
    'analytics.confirmClear':
      'Delete every test record stored in this browser session? This cannot be undone.',
  },
} as const;
