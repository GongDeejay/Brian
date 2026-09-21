/**
 * 会话记录服务（sessionStore）词条：任务标签、负荷描述、关键指标、六大维度与限制声明。
 * 约定见 src/i18n/README.md：必须同时提供 zh 与 en，键名用 `session.<语义>`。
 *
 * 说明 / Notes
 * ------------
 * - `session.*` 由非组件代码通过 `translate(lang, key, vars)` 解析（sessionStore.ts）。
 * - `report.*` 是导出 JSON 里面向人的字段（dataStatusNote / notProvided / app）。
 * - `session.limitation.*` 是科研诚信表述，翻译必须如实、不得弱化或省略。
 * - 占位符统一用 `{粗体变量名}`，与 sessionStore.ts 的调用点一一对应。
 */
export const session = {
  zh: {
    // ---- 任务标签（TASK_LABELS 键映射） ----------------------------------
    'session.task.wcst': '威斯康星卡片分类测验 (WCST)',
    'session.task.wpt': '天气预测任务 (WPT)',
    'session.task.ided': '注意定势转移测验 (ID/ED)',
    'session.task.gabor': 'Gabor 斑点分类 (RB / II)',
    'session.task.prototype': '点阵原型畸变测验 (Posner)',
    'session.taskShort.wcst': 'WCST',
    'session.taskShort.wpt': 'WPT',
    'session.taskShort.ided': 'ID/ED',
    'session.taskShort.gabor': 'Gabor',
    'session.taskShort.prototype': '原型畸变',

    // ---- 负荷描述（describeLoad / isLoadActive） --------------------------
    'session.load.timeLimit': '限时 {seconds}s',
    'session.load.wmProbe': '双任务数字探测',
    'session.load.noise': '知觉噪声 {level}%',
    'session.load.distractor': '无关特征干扰',
    'session.load.none': '标准基线（无附加负荷）',
    /** 连接多个已启用负荷项的中间分隔符。 */
    'session.load.separator': ' · ',

    // ---- 单次会话头条指标（describeSession） -----------------------------
    'session.metric.unavailable': '未测得',
    'session.metric.wcst.name': '持续性错误率 (PE Rate)',
    'session.metric.wcst.value': '{rate}%（PE {pe} 次 / 共 {total} 次试验）',
    'session.metric.wpt.name': '最优选择率 (Optimal Rate)',
    'session.metric.wpt.value': '{optimal}%（实际命中率 {hit}%）',
    'session.metric.ided.name': 'EDS 维度间错误数',
    'session.metric.ided.value': '{errors} 次（完成阶段 {stages}/7{tail}）',
    'session.metric.ided.failedTail': '，{stage} 阶段达到 {max} 次上限未通过',
    'session.metric.gabor.name': '信息整合 (II) 条件正确率',
    'session.metric.gabor.value': '{accuracy}%（{trials} 次试验）',
    'session.metric.gabor.notMeasured': '未测得（本次未完成 II 条件试验）',
    'session.metric.prototype.name': '原型优势效应 (Prototype Enhancement)',
    'session.metric.prototype.value': '{effect}pp（原型 {proto}% / 新畸变 {novel}%）',

    // ---- 维度标签与脑区（computeProfile） --------------------------------
    'session.dim.prefrontalFlexibility.label': '前额叶灵活性 (WCST)',
    'session.dim.prefrontalFlexibility.brain': '背外侧前额叶 (DLPFC)',
    'session.dim.striatalImplicitExtraction.label': '基底节内隐提取 (WPT)',
    'session.dim.striatalImplicitExtraction.brain': '纹状体 / 基底核 (Striatum)',
    'session.dim.attentionalSetShifting.label': '注意定势转移 (ID/ED)',
    'session.dim.attentionalSetShifting.brain': '外侧前额叶 / 眶额叶 (OFC)',
    'session.dim.perceptualPrototypeAbstraction.label': '原型模式抽象 (Posner)',
    'session.dim.perceptualPrototypeAbstraction.brain': '腹侧视觉通路 (IT Cortex)',
    'session.dim.informationIntegrationMastery.label': '非言语信息整合 (Gabor)',
    'session.dim.informationIntegrationMastery.brain': '皮层-纹状体突触 (COVIS)',
    'session.dim.cognitiveLoadResilience.label': '高负荷抗压度 (Load)',
    'session.dim.cognitiveLoadResilience.brain': '前扣带回皮层 (ACC)',

    // ---- 维度不可用原因 ------------------------------------------------
    'session.unavailable.wcst':
      '暂无数据：需要一个至少 {min} 次试验的 WCST 完整记录（当前{status}）',
    'session.unavailable.wcst.have': '仅 {trials} 次',
    'session.unavailable.wcst.none': '无记录',
    'session.unavailable.wpt':
      '暂无数据：需要一个至少 {min} 次试验的 WPT 完整记录（当前{status}）',
    'session.unavailable.wpt.have': '仅 {trials} 次',
    'session.unavailable.wpt.none': '无记录',
    'session.unavailable.ided': '暂无数据：需要一段完成至少 1 个 ID/ED 阶段的记录',
    'session.unavailable.prototype':
      '暂无数据：测试阶段需要 ≥{min} 次试验，且同时包含未见原型与新畸变试次（当前测试 {tests} 次 / 原型 {proto} 次 / 新畸变 {novel} 次）',
    'session.unavailable.gabor':
      '暂无数据：需要至少 {min} 次信息整合 (II) 条件试验（当前 {trials} 次）',
    'session.unavailable.load':
      '暂无数据：需要在同一任务下同时具备“标准基线”与至少一项负荷开关（限时/双任务/噪声/干扰）的完整记录，才能比较负荷前后正确率',

    // ---- 维度计算依据（explanation） ------------------------------------
    'session.explain.wcst':
      '完成分类数（权重 60%）与持续性错误率（权重 40%，PE 率 33% 时该项计 0 分）的加权内部指数',
    'session.explain.wpt':
      '直接采用 WPT 引擎的内隐指数（最优选择率占 70%、末区块相对首区块的学习增益占 30%，引擎内截断于 10–98）',
    'session.explain.ided':
      '阶段完成度（满分 70 分）+ 通过 EDS 奖励 30 分 − EDS/IDS 转移代价惩罚（每 1 次扣 5 分，上限 30 分）',
    'session.explain.prototype':
      '以“原型正确率 − 新畸变正确率”（原型优势效应）线性映射：50 分 = 无优势，每 +1pp 加 1 分',
    'session.explain.gabor':
      '直接采用信息整合 (II) 条件正确率（百分制，随机猜测水平 = 50 分），未做常模或阈值校正',
    'session.explain.load': '以 70 分为“负荷下无差异”基准，正确率每变化 1 个百分点计 ±2 分（线性近似）',

    // ---- 维度实测细节（detail） -----------------------------------------
    'session.detail.wcst':
      '{trials} 次试验 · 完成分类 {categories}/6 · PE {pe} 次 ({peRate}%) · 非持续错误 {npe} 次 · 未反应 {omissions} 次',
    'session.detail.wpt':
      '{trials} 次试验 · 最优选择率 {optimal}% · 实际命中率 {accuracy}%{blocks}',
    'session.detail.wpt.blocks': ' · 首/末区块最优率 {first}% → {last}%',
    'session.detail.ided':
      '完成 {stages}/7 阶段 · EDS 错误 {edsErrors} 次 · IDS 错误 {idsErrors} 次 · 转移代价 {shiftCost} · 总错误 {totalErrors} 次{tail}',
    'session.detail.ided.failedTail': ' · {stage} 阶段达 {max} 次上限未通过',
    'session.detail.prototype':
      '学习阶段正确率 {learning}%（{learningTrials} 次）· 未见原型 {proto}%（{protoTrials} 次）· 新畸变 {novel}%（{novelTrials} 次）· 优势 {effect}pp',
    'session.detail.gabor': 'II 条件 {ii}%（{iiTrials} 次）· RB 条件 {rb}',
    'session.detail.gabor.rbValue': '{accuracy}%（{trials} 次）',
    'session.detail.gabor.notMeasured': '未测得',
    'session.detail.load': '比较任务：{tasks} · 平均 {mean}pp',

    // ---- 数据限制声明（DATA_LIMITATIONS，科研诚信表述） ------------------
    'session.limitation.normative':
      '本系统不提供任何临床常模：所有 0–100 数值均为本系统内部指数，未经年龄/教育/性别校正，不具备诊断效力，不能替代标准化临床评估。',
    'session.limitation.wcst':
      'WCST：使用 Heaton 标准的 128 卡（两副完整 64 张牌组）与最多 6 个分类的上限，规则转换为“连续 10 次正确”；但未实现手工施测程序与部分计分衍生指标（如学习到学会、60 卡后停止规则），卡组顺序为程序伪随机生成而非标准固定顺序。',
    'session.limitation.reactionTime':
      '反应时：仅测量“刺激呈现至按键”的浏览器端时间，包含显示器刷新、输入设备与事件调度延迟，未做硬件时标校准；未反应的试次（omission）不产生反应时。',
    'session.limitation.gabor':
      'Gabor：条纹以像素频率生成，未按视角（cycles/degree）标定，屏幕尺寸与观看距离不受控，也未实现阶梯法/恒定刺激法的阈值测量，因此空间频率与对比度不具备跨设备可比性。',
    'session.limitation.ided':
      'ID/ED：阶段内正确维度示例固定、无关维度随机变化，左右位置逐试次随机化；刺激为简化几何图形而非 CANTAB 标准刺激集；每阶段上限 50 次试验，达上限即判定该阶段未通过；未实现 CD_D 阶段。',
    'session.limitation.prototype':
      '原型畸变：测试阶段使用固定的平衡序列（无反馈），学习阶段为交替平衡序列；点阵扰动为高斯微扰，σ 未经心理测量学标定。',
    'session.limitation.loadManipulation':
      '认知负荷操控：知觉噪声为像素级叠加、无关特征干扰为静态图形叠加，均未做操控效度检验；双任务为 3 位数字瞬时保持的简化版本。',
    'session.limitation.storage':
      '数据仅保存在当前浏览器的 sessionStorage 中（上限 40 条），关闭标签页即清除，不上传、不跨设备汇总，也不做去重或受试者编号管理。',

    // ---- 导出报告（buildReport） ----------------------------------------
    'report.app': 'NeuroClassify 认知神经科学分类与模式识别测评系统',
    'report.status.insufficient':
      '数据不足：本报告中没有任何维度具备可解释的最小样本量，因此不存在任何能力分数或临床结论。请先完成至少一项完整测验。',
    'report.status.partial':
      '部分数据：{count} 个维度缺少可解释的最小样本量，这些维度在报告中为 null 并已逐条说明原因；其余维度由实际测量值计算。',
    'report.status.complete': '数据完整：全部 6 个维度均由实际测量值计算得出。',
    'report.notProvided.clinicalIndicators':
      '本系统不产生临床判定语句（如“正常”“优异”“极低耗损”）。此类结论需要标准化常模与临床访谈，工具本身无法给出。',
    'report.notProvided.normativeComparison':
      '未提供常模百分位/标准分对照，因为没有本工具对应的常模数据。',
    'report.notProvided.diagnosis': '本工具为科研与教学演示用途，不用于诊断、分级或任何临床决策。',
  },
  en: {
    // ---- Task labels -----------------------------------------------------
    'session.task.wcst': 'Wisconsin Card Sorting Test (WCST)',
    'session.task.wpt': 'Weather Prediction Task (WPT)',
    'session.task.ided': 'Attentional Set Shifting Test (ID/ED)',
    'session.task.gabor': 'Gabor Patch Classification (RB / II)',
    'session.task.prototype': 'Dot-Pattern Prototype Distortion Test (Posner)',
    'session.taskShort.wcst': 'WCST',
    'session.taskShort.wpt': 'WPT',
    'session.taskShort.ided': 'ID/ED',
    'session.taskShort.gabor': 'Gabor',
    'session.taskShort.prototype': 'Prototype',

    // ---- Load description ------------------------------------------------
    'session.load.timeLimit': '{seconds}s time limit',
    'session.load.wmProbe': 'dual-task digit probe',
    'session.load.noise': '{level}% perceptual noise',
    'session.load.distractor': 'distractor interference',
    'session.load.none': 'Standard baseline (no added load)',
    'session.load.separator': ' · ',

    // ---- Per-session headline metric -------------------------------------
    'session.metric.unavailable': 'Not measured',
    'session.metric.wcst.name': 'Perseverative error rate (PE rate)',
    'session.metric.wcst.value': '{rate}% (PE {pe} / {total} trials)',
    'session.metric.wpt.name': 'Optimal choice rate',
    'session.metric.wpt.value': '{optimal}% (actual hit rate {hit}%)',
    'session.metric.ided.name': 'EDS extra-dimensional errors',
    'session.metric.ided.value': '{errors} (stages completed {stages}/7{tail})',
    'session.metric.ided.failedTail': '; failed {stage} at the {max}-trial cap',
    'session.metric.gabor.name': 'Information-integration (II) accuracy',
    'session.metric.gabor.value': '{accuracy}% ({trials} trials)',
    'session.metric.gabor.notMeasured': 'Not measured (no II-condition trials completed in this run)',
    'session.metric.prototype.name': 'Prototype enhancement effect',
    'session.metric.prototype.value': '{effect} pp (prototype {proto}% / novel distortion {novel}%)',

    // ---- Dimension labels and brain regions ------------------------------
    'session.dim.prefrontalFlexibility.label': 'Prefrontal flexibility (WCST)',
    'session.dim.prefrontalFlexibility.brain': 'Dorsolateral prefrontal cortex (DLPFC)',
    'session.dim.striatalImplicitExtraction.label': 'Striatal implicit extraction (WPT)',
    'session.dim.striatalImplicitExtraction.brain': 'Striatum / basal ganglia',
    'session.dim.attentionalSetShifting.label': 'Attentional set shifting (ID/ED)',
    'session.dim.attentionalSetShifting.brain': 'Lateral prefrontal / orbitofrontal cortex (OFC)',
    'session.dim.perceptualPrototypeAbstraction.label': 'Prototype pattern abstraction (Posner)',
    'session.dim.perceptualPrototypeAbstraction.brain': 'Ventral visual stream (IT cortex)',
    'session.dim.informationIntegrationMastery.label': 'Non-verbal information integration (Gabor)',
    'session.dim.informationIntegrationMastery.brain': 'Cortico-striatal synapses (COVIS)',
    'session.dim.cognitiveLoadResilience.label': 'Resilience under high cognitive load',
    'session.dim.cognitiveLoadResilience.brain': 'Anterior cingulate cortex (ACC)',

    // ---- Why a dimension is unavailable ----------------------------------
    'session.unavailable.wcst':
      'No data: a complete WCST record with at least {min} trials is required (currently {status})',
    'session.unavailable.wcst.have': 'only {trials} trials',
    'session.unavailable.wcst.none': 'no record',
    'session.unavailable.wpt':
      'No data: a complete WPT record with at least {min} trials is required (currently {status})',
    'session.unavailable.wpt.have': 'only {trials} trials',
    'session.unavailable.wpt.none': 'no record',
    'session.unavailable.ided': 'No data: a record that completed at least 1 ID/ED stage is required',
    'session.unavailable.prototype':
      'No data: the test phase requires ≥{min} trials that include both unseen prototypes and novel distortions (currently {tests} test trials / {proto} prototype / {novel} novel distortion)',
    'session.unavailable.gabor':
      'No data: at least {min} information-integration (II) trials are required (currently {trials})',
    'session.unavailable.load':
      'No data: the same task needs both a standard-baseline record and a record with at least one load switch on (time limit / dual task / noise / distractor interference) before accuracy under load can be compared with baseline',

    // ---- How each dimension is derived -----------------------------------
    'session.explain.wcst':
      'Weighted internal index of categories completed (60% weight) and perseverative error rate (40% weight; this term scores 0 at a PE rate of 33%)',
    'session.explain.wpt':
      "The WPT engine's own implicit index (optimal choice rate 70%, learning gain of the last block over the first 30%, truncated by the engine to 10–98)",
    'session.explain.ided':
      'Stage completion (max 70 points) + 30 points for passing EDS − EDS/IDS shift-cost penalty (5 points per shift, capped at 30 points)',
    'session.explain.prototype':
      'Linear mapping of “prototype accuracy − novel-distortion accuracy” (the prototype enhancement effect): 50 points = no enhancement, +1 point per +1 pp',
    'session.explain.gabor':
      'Information-integration (II) condition accuracy used directly (0–100 scale, chance = 50), with no norm-referenced or threshold correction',
    'session.explain.load':
      '70 points is the “no difference under load” reference; each 1 percentage-point change in accuracy counts as ±2 points (linear approximation)',

    // ---- Measured detail strings -----------------------------------------
    'session.detail.wcst':
      '{trials} trials · categories completed {categories}/6 · PE {pe} ({peRate}%) · non-perseverative errors {npe} · omissions {omissions}',
    'session.detail.wpt':
      '{trials} trials · optimal choice rate {optimal}% · actual hit rate {accuracy}%{blocks}',
    'session.detail.wpt.blocks': ' · first/last block optimal rate {first}% → {last}%',
    'session.detail.ided':
      'stages completed {stages}/7 · EDS errors {edsErrors} · IDS errors {idsErrors} · shift cost {shiftCost} · total errors {totalErrors}{tail}',
    'session.detail.ided.failedTail': ' · failed {stage} at the {max}-trial cap',
    'session.detail.prototype':
      'learning-phase accuracy {learning}% ({learningTrials} trials) · unseen prototypes {proto}% ({protoTrials} trials) · novel distortions {novel}% ({novelTrials} trials) · enhancement {effect} pp',
    'session.detail.gabor': 'II condition {ii}% ({iiTrials} trials) · RB condition {rb}',
    'session.detail.gabor.rbValue': '{accuracy}% ({trials} trials)',
    'session.detail.gabor.notMeasured': 'not measured',
    'session.detail.load': 'Tasks compared: {tasks} · mean {mean}pp',

    // ---- Data limitations (research-integrity statement) -----------------
    'session.limitation.normative':
      'This system provides no clinical norms of any kind: every 0–100 value is an internal index of this system, uncorrected for age, education or sex. It has no diagnostic validity and cannot replace a standardised clinical assessment.',
    'session.limitation.wcst':
      'WCST: uses the Heaton-standard 128 cards (two complete 64-card decks) with a maximum of 6 categories, and switches the rule after 10 consecutive correct responses; however, manual administration and some derived scores (such as learning-to-learn and the stop-after-60-cards rule) are not implemented, and the deck order is programmatically pseudo-randomised rather than the standard fixed order.',
    'session.limitation.reactionTime':
      'Reaction time: measures only browser-side time from stimulus onset to key press, which includes display refresh, input-device and event-scheduling latency, with no hardware timestamp calibration; omission trials produce no reaction time.',
    'session.limitation.gabor':
      'Gabor: gratings are generated at a pixel frequency and are not calibrated in degrees of visual angle (cycles/degree). Screen size and viewing distance are uncontrolled, and no staircase or constant-stimuli threshold measurement is implemented, so spatial frequency and contrast are not comparable across devices.',
    'session.limitation.ided':
      'ID/ED: within a stage the example of the correct dimension is fixed while the irrelevant dimension varies randomly, and left/right position is randomised trial by trial; stimuli are simplified geometric shapes rather than the standard CANTAB stimulus set; each stage is capped at 50 trials and reaching the cap marks that stage as failed; the CD_D stage is not implemented.',
    'session.limitation.prototype':
      'Prototype distortion: the test phase uses a fixed counterbalanced sequence (no feedback) and the learning phase an alternating counterbalanced sequence; dot-pattern perturbation is Gaussian with a σ that has not been psychometrically calibrated.',
    'session.limitation.loadManipulation':
      'Cognitive-load manipulations: perceptual noise is applied at the pixel level and distractor interference as a static shape overlay; neither has been checked for manipulation validity, and the dual task is a simplified version of 3-digit immediate retention.',
    'session.limitation.storage':
      'Data are stored only in this browser’s sessionStorage (maximum 40 records) and are cleared when the tab is closed. Nothing is uploaded, aggregated across devices, de-duplicated, or managed by participant code.',

    // ---- Exported report -------------------------------------------------
    'report.app': 'NeuroClassify — cognitive neuroscience categorisation & pattern recognition assessment system',
    'report.status.insufficient':
      'Insufficient data: no dimension in this report reached the minimum sample size for interpretation, so it contains no ability scores and no clinical conclusions. Please complete at least one full test first.',
    'report.status.partial':
      'Partial data: {count} dimension(s) lack the minimum sample size for interpretation and are null in this report, each with a stated reason; the remaining dimensions are computed from measured values.',
    'report.status.complete': 'Complete data: all 6 dimensions are computed from measured values.',
    'report.notProvided.clinicalIndicators':
      'This system produces no clinical verdict statements (such as “normal”, “superior” or “minimal impairment”). Such conclusions require standardised norms and a clinical interview, which the tool itself cannot supply.',
    'report.notProvided.normativeComparison':
      'No normative percentile or standard-score comparison is provided, because no norms exist for this tool.',
    'report.notProvided.diagnosis':
      'This tool is for research and teaching demonstration only and must not be used for diagnosis, grading or any clinical decision.',
  },
} as const;
