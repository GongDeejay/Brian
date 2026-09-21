/**
 * 注意定势转移（ID/ED）词条：指导语、阶段时间线、刺激呈现、结果页。
 * 约定见 src/i18n/README.md：必须同时提供 zh 与 en，键名用 `ided.<语义>`。
 * 阶段名请用 CANTAB IED 的英文原称（SD/SR/CD/ID/IDR/ED/EDR）。
 */
export const ided = {
  zh: {
    'ided.badge': '注意定势转移 (CANTAB ID/ED)',
    'ided.title': '维度内/维度间定势转移测验 (Intra/Extra-Dimensional Set Shifting)',

    // 指导语（拆段以保留加粗强调）
    'ided.intro.a': '共 {total} 个阶段，每阶段需',
    'ided.intro.criterion': '连续 {criterion} 次答对',
    'ided.intro.b': '才能晋级；每阶段最多 {maxTrials} 次试验，达到上限即判定该阶段未通过。',
    'ided.intro.c': ' 系统',
    'ided.intro.hidden': '不会告知哪一维度相关',
    'ided.intro.d': '，左右位置每试次随机，请仅依据“正确/错误”反馈逐步学习。',

    // 研究者视图
    'ided.researcher.toggle': '研究者视图',
    'ided.researcher.title': '研究者视图：显示各阶段相关维度等会泄露规则的说明',
    'ided.researcher.warning': '研究者视图已开启（以下信息会泄露规则，勿让受试者看到）：',
    'ided.researcher.stageLine':
      '{stage} · 相关维度：{dimension} · 强化项位于配对索引 {index}（屏幕左右位置每试次随机） · {description}',
    'ided.researcher.dimension.shape': '图形',
    'ided.researcher.dimension.line': '线条',

    'ided.action.reset': '重置任务 (Reset)',
    'ided.action.restart': '重新演练 ID/ED 任务',

    // 阶段时间线
    'ided.timeline.title': '阶段演进 (Stages Progression)',
    'ided.timeline.failed': '已在 {stage} 阶段达到 {maxTrials} 次上限',
    'ided.timeline.current': '阶段 {current} / {total}',
    'ided.stageStatus.failed': '✕ 未通过',
    'ided.stageStatus.passed': '✓ 达成',
    'ided.stageStatus.current': '当前进行',
    'ided.stageStatus.pending': '未开始',

    // 实时指标
    'ided.stat.totalErrors': '总错误数',
    'ided.stat.idsErrors': 'IDS 维度内错误',
    'ided.stat.edsErrors': 'EDS 维度间错误',
    'ided.stat.edsShiftCost': 'EDS 定势转移代价',
    'ided.stat.edsShiftCostFormula': 'EDS 错误 − IDS 错误',
    'ided.metric.leftReinforcedTrials': '强化侧为左侧的试次数',
    'ided.metric.rightReinforcedTrials': '强化侧为右侧的试次数',
    'ided.metric.leftReinforcedRatio': '左侧强化占比 (%)',

    // 键盘与判读说明
    'ided.keyboard.intro': '键盘操作：',
    'ided.keyboard.left': ' 选择左侧，',
    'ided.keyboard.right': ' 选择右侧。',
    'ided.note.shiftCostA':
      '注：转移代价为 EDS 错误数减去 IDS 错误数，当受试者在两个阶段都几乎不出错（或都停留在随机水平）时该差值会接近 0。',
    'ided.note.shiftCostB': '需结合 EDS 是否通过一起判读。',

    // 试次舞台
    'ided.hud.stage': '第 {current} / {total} 阶段 · {stage}',
    'ided.hud.instruction': '请依据“正确 / 错误”反馈学习本阶段应选择哪一个刺激；正确的一侧（左或右）每试次随机改变。',
    'ided.progress.criterionAria': '本阶段晋级进度（连续正确次数）',
    'ided.progress.criterionValue': '连续正确 {current} / {required}',
    'ided.progress.criterionLabel': '晋级进度:',
    'ided.progress.trialsAria': '本阶段已用试验数',
    'ided.progress.trialsValue': '本阶段已用 {used} / {maxTrials} 次试验',
    'ided.progress.trialsNote': '本阶段已用 {used} / {maxTrials} 次试验（达上限即判定本阶段未通过）',

    'ided.side.left': '左侧',
    'ided.side.right': '右侧',
    'ided.select.aria': '选择{side}刺激：{description}',
    'ided.select.button': '选择{side}刺激 ({key})',

    'ided.feedback.correct': '反应正确 (Correct)',
    'ided.feedback.advanced': '已晋级下一阶段',
    'ided.feedback.incorrect': '反应错误 (Incorrect)',
    'ided.feedback.waiting': '等待您的第一次选择…',
    'ided.a11y.correct': '反应正确',
    'ided.a11y.incorrect': '反应错误',
    'ided.a11y.advanced': '；已晋级下一阶段',

    // 失败 / 完成
    'ided.fail.title': '测验终止：{stage} 阶段达到 {maxTrials} 次试验上限',
    'ided.fail.body':
      '该阶段在 {maxTrials} 次试验内未能达到“连续 {criterion} 次正确”的晋级标准，按 CANTAB 规则判定本阶段未通过，测验到此结束。已完成的阶段与错误数已记入数据。',
    'ided.fail.stagesCompleted': '已完成阶段',
    'ided.fail.totalErrors': '总错误',
    'ided.fail.failedStageErrors': '失败阶段错误',
    'ided.fail.edsErrors': 'EDS 错误',
    'ided.success.title': '全部 {total} 阶段注意定势转移通关！',
    'ided.success.body':
      '您在第 6 阶段完成了 Extra-Dimensional Shift (EDS)，即把注意从原相关维度转移到另一维度。本结果仅为该测验内部指标，不构成临床判读。',

    // 阶段名称与说明（研究者视图用）
    'ided.stage.sd.name': '简单辨别 (Simple Discrimination)',
    'ided.stage.sd.desc': '学习在两个基础图形中识别出受奖励的目标项。',
    'ided.stage.sr.name': '简单逆转 (Simple Reversal)',
    'ided.stage.sr.desc': '同一图形下奖励规则突然对调，测量初级逆转学习。',
    'ided.stage.cd.name': '复合辨别 (Compound Discrimination)',
    'ided.stage.cd.desc': '引入不相关的线条干扰项（每试次变化），需维持对图形维度的选择性注意。',
    'ided.stage.ids.name': '维度内定势转移 (Intra-Dimensional Shift)',
    'ided.stage.ids.desc': '出现全新图形和全新线条，但分类关键维度仍然是“图形”。',
    'ided.stage.idr.name': '维度内逆转 (ID Reversal)',
    'ided.stage.idr.desc': '新图形中的正确目标对调。',
    'ided.stage.eds.name': '维度间定势转移 (Extra-Dimensional Shift)',
    'ided.stage.eds.desc': '核心测试：注意定势必须从“图形”打破，转移至之前无关的“线条”（图形每试次变化）。',
    'ided.stage.edr.name': '维度间逆转 (ED Reversal)',
    'ided.stage.edr.desc': '在线条规则下奖励对调，验证前额叶对新维度的稳定抑制与灵活调控。',

    // 刺激名称（无障碍描述）
    'ided.stimulus.shape.polygon': '三角形',
    'ided.stimulus.shape.oval': '椭圆',
    'ided.stimulus.shape.star': '星形',
    'ided.stimulus.shape.crescent': '月牙',
    'ided.stimulus.shape.cross': '十字',
    'ided.stimulus.shape.hex': '六边形',
    'ided.stimulus.line.wavy': '波浪线',
    'ided.stimulus.line.zigzag': '锯齿线',
    'ided.stimulus.line.dashed': '虚线',
    'ided.stimulus.line.spiral': '螺旋线',
    'ided.stimulus.line.dots': '点线圈',
    'ided.stimulus.line.crosshatch': '交叉线',
    'ided.stimulus.lineNone': '无线条',
    'ided.stimulus.withLine': '{shape}，叠加{line}',
  },
  en: {
    'ided.badge': 'Intra/Extra-Dimensional Set Shifting (CANTAB ID/ED)',
    'ided.title': 'Intra/Extra-Dimensional Set Shifting Test',

    'ided.intro.a': '{total} stages in total; to advance you must reach ',
    'ided.intro.criterion': '{criterion} consecutive correct responses',
    'ided.intro.b':
      ' within a stage. Each stage allows at most {maxTrials} trials, and hitting that cap fails the stage.',
    'ided.intro.c': ' The system ',
    'ided.intro.hidden': 'never tells you which dimension is relevant',
    'ided.intro.d':
      ', and the left/right position is randomised on every trial. Learn only from the "correct/incorrect" feedback.',

    'ided.researcher.toggle': 'Researcher view',
    'ided.researcher.title': 'Researcher view: reveals the relevant dimension of each stage and other rule-leaking information',
    'ided.researcher.warning': 'Researcher view is ON (the information below leaks the rule — do not show it to participants):',
    'ided.researcher.stageLine':
      '{stage} · Relevant dimension: {dimension} · Reinforced exemplar at pair index {index} (its on-screen left/right position is randomised on every trial) · {description}',
    'ided.researcher.dimension.shape': 'shape',
    'ided.researcher.dimension.line': 'line',

    'ided.action.reset': 'Reset task (Reset)',
    'ided.action.restart': 'Run the ID/ED task again',

    'ided.timeline.title': 'Stages Progression',
    'ided.timeline.failed': 'Hit the {maxTrials}-trial cap at stage {stage}',
    'ided.timeline.current': 'Stage {current} / {total}',
    'ided.stageStatus.failed': '✕ Failed',
    'ided.stageStatus.passed': '✓ Passed',
    'ided.stageStatus.current': 'In progress',
    'ided.stageStatus.pending': 'Not started',

    'ided.stat.totalErrors': 'Total errors',
    'ided.stat.idsErrors': 'IDS errors (intra-dimensional)',
    'ided.stat.edsErrors': 'EDS errors (extra-dimensional)',
    'ided.stat.edsShiftCost': 'EDS shift cost',
    'ided.stat.edsShiftCostFormula': 'EDS errors − IDS errors',
    'ided.metric.leftReinforcedTrials': 'Trials with the reinforced side on the left',
    'ided.metric.rightReinforcedTrials': 'Trials with the reinforced side on the right',
    'ided.metric.leftReinforcedRatio': 'Left-reinforced proportion (%)',

    'ided.keyboard.intro': 'Keyboard: ',
    'ided.keyboard.left': ' select the left stimulus, ',
    'ided.keyboard.right': ' select the right stimulus.',
    'ided.note.shiftCostA':
      'Note: the shift cost is the number of EDS errors minus the number of IDS errors; it approaches 0 when a participant makes almost no errors in either stage (or stays at chance in both).',
    'ided.note.shiftCostB': 'It must therefore be read together with whether EDS was passed.',

    'ided.hud.stage': 'Stage {current} / {total} · {stage}',
    'ided.hud.instruction':
      'Learn from the "correct / incorrect" feedback which stimulus to choose in this stage; the correct side (left or right) changes randomly on every trial.',
    'ided.progress.criterionAria': 'Stage advancement progress (consecutive correct responses)',
    'ided.progress.criterionValue': '{current} / {required} consecutive correct',
    'ided.progress.criterionLabel': 'Advancement progress:',
    'ided.progress.trialsAria': 'Trials used in this stage',
    'ided.progress.trialsValue': '{used} / {maxTrials} trials used in this stage',
    'ided.progress.trialsNote': '{used} / {maxTrials} trials used in this stage (hitting the cap fails the stage)',

    'ided.side.left': 'left',
    'ided.side.right': 'right',
    'ided.select.aria': 'Select the {side} stimulus: {description}',
    'ided.select.button': 'Select {side} stimulus ({key})',

    'ided.feedback.correct': 'Correct',
    'ided.feedback.advanced': 'Advanced to the next stage',
    'ided.feedback.incorrect': 'Incorrect',
    'ided.feedback.waiting': 'Waiting for your first choice…',
    'ided.a11y.correct': 'Correct',
    'ided.a11y.incorrect': 'Incorrect',
    'ided.a11y.advanced': '; advanced to the next stage',

    'ided.fail.title': 'Test terminated: stage {stage} reached the {maxTrials}-trial cap',
    'ided.fail.body':
      'This stage did not reach the criterion of {criterion} consecutive correct responses within {maxTrials} trials, so under CANTAB rules it is scored as failed and the test ends here. Completed stages and error counts have been recorded.',
    'ided.fail.stagesCompleted': 'Stages completed',
    'ided.fail.totalErrors': 'Total errors',
    'ided.fail.failedStageErrors': 'Errors in failed stage',
    'ided.fail.edsErrors': 'EDS errors',
    'ided.success.title': 'All {total} stages of the set-shifting test passed!',
    'ided.success.body':
      'You completed the Extra-Dimensional Shift (EDS) at stage 6, shifting attention away from the previously relevant dimension to the other dimension. This result is an internal index of this test only and does not constitute a clinical interpretation.',

    'ided.stage.sd.name': 'Simple Discrimination (SD)',
    'ided.stage.sd.desc': 'Learn which of two basic shapes is the reinforced target.',
    'ided.stage.sr.name': 'Simple Reversal (SR)',
    'ided.stage.sr.desc': 'The reward contingency for the same shapes is reversed without warning; measures basic reversal learning.',
    'ided.stage.cd.name': 'Compound Discrimination (CD)',
    'ided.stage.cd.desc':
      'An irrelevant line distractor is introduced and varies on every trial, so selective attention to the shape dimension must be maintained.',
    'ided.stage.ids.name': 'Intra-Dimensional Shift (ID)',
    'ided.stage.ids.desc': 'Entirely new shapes and lines appear, but shape remains the relevant dimension.',
    'ided.stage.idr.name': 'Intra-Dimensional Reversal (IDR)',
    'ided.stage.idr.desc': 'The correct target among the new shapes is reversed.',
    'ided.stage.eds.name': 'Extra-Dimensional Shift (ED)',
    'ided.stage.eds.desc':
      'Critical test: the attentional set must be broken away from shape and shifted to the previously irrelevant line dimension (the shapes vary on every trial).',
    'ided.stage.edr.name': 'Extra-Dimensional Reversal (EDR)',
    'ided.stage.edr.desc':
      'The reward contingency is reversed under the line rule, probing stable inhibition and flexible control over the newly relevant dimension.',

    'ided.stimulus.shape.polygon': 'triangle',
    'ided.stimulus.shape.oval': 'ellipse',
    'ided.stimulus.shape.star': 'star',
    'ided.stimulus.shape.crescent': 'crescent',
    'ided.stimulus.shape.cross': 'cross',
    'ided.stimulus.shape.hex': 'hexagon',
    'ided.stimulus.line.wavy': 'wavy line',
    'ided.stimulus.line.zigzag': 'zigzag line',
    'ided.stimulus.line.dashed': 'dashed line',
    'ided.stimulus.line.spiral': 'spiral line',
    'ided.stimulus.line.dots': 'dotted ring',
    'ided.stimulus.line.crosshatch': 'crosshatch',
    'ided.stimulus.lineNone': 'no line',
    'ided.stimulus.withLine': '{shape} with {line} overlaid',
  },
} as const;
