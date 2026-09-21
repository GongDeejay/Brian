/**
 * 原型畸变任务（Posner & Keele）词条：学习/测试阶段、反馈、结果页。
 * 约定见 src/i18n/README.md：必须同时提供 zh 与 en，键名用 `proto.<语义>`。
 * typicality、prototype、transfer 等术语按文献用法。
 */
export const proto = {
  zh: {
    'proto.badge': '原型图式与模式识别 (Prototype Abstraction)',
    'proto.title': '点阵原型畸变抽象测验 (Dot-Pattern Prototype Test)',

    // 指导语（拆段以保留加粗强调）
    'proto.intro.a': '认知心理学经典的模式识别与概念形成测验。受试者在学习阶段（{count} 次，有反馈）',
    'proto.intro.neverPrototype': '绝对看不到纯正原型',
    'proto.intro.b': '，仅通过高斯微扰的散点图形试错分类。测试阶段（{count} 次，',
    'proto.intro.noFeedback': '无任何对错反馈',
    'proto.intro.c': '）加入',
    'proto.intro.novelPrototype': '从未见过的真正原型',
    'proto.intro.d': '，测量大脑是否自发抽象出中心原型图式（原型优势效应）。',

    'proto.action.reset': '重置测验 (Reset)',
    'proto.action.startTestEarly': '提前进入原型测试阶段',
    'proto.action.restart': '重新开始一轮',

    // 阶段与进度
    'proto.phase.learning': '阶段一：畸变样本试错学习（有反馈）',
    'proto.phase.test': '阶段二：原型抽象模式测试（无反馈）',
    'proto.progress.learning': '学习进程: {current}/{total}',
    'proto.progress.test': '测试进度: {current}/{total}',
    'proto.a11y.learningTrial': '学习阶段，第 {current} 次试次',
    'proto.a11y.testTrial': '测试阶段，第 {current} 次试次，共 {total} 次',
    'proto.notice.learningDone': '学习阶段结束：测试阶段开始，本阶段不提供任何对错反馈。',
    'proto.notice.earlyTest': '已提前进入测试阶段：本阶段不提供任何对错反馈。',

    // 实时指标
    'proto.stat.learningAccuracy': '学习阶段正确率',
    'proto.stat.prototypeAccuracy': '未见原型识别率',
    'proto.stat.novelDistortionAccuracy': '新畸变识别率',
    'proto.stat.enhancement': '原型优势效应',
    'proto.stat.enhancementFormula': '原型率 − 新畸变率',
    'proto.stat.notMeasured': '未测得',
    'proto.stat.trialCount': '({count} 次)',
    'proto.stat.avgRt': '平均反应时',
    'proto.stat.rtSamples': '基于 {count} 次作答',

    // 键盘与序列说明
    'proto.keyboard.intro': '键盘操作：按 ',
    'proto.keyboard.a': ' 归入星座类别 A，按 ',
    'proto.keyboard.b': ' 归入星座类别 B。',
    'proto.note.testSequenceA':
      '测试阶段的分类序列为预先固定、类别与材料类型均衡的序列，且不提供反馈。',
    'proto.note.testSequenceB': '因此该阶段的成绩反映的是此前的学习结果，而非在线学习。',

    // 刺激舞台
    'proto.stimulus.learningTitle': '九散点畸变样本 (Distorted Exemplar)',
    'proto.stimulus.testTitle': '模式识别辨识点阵 (Evaluation Pattern)',
    'proto.stimulus.learningAria': '待分类的九点畸变图形',
    'proto.stimulus.testAria': '待判断类别的九点图形',
    'proto.renderFailed.title': '无法绘制刺激：当前浏览器未提供可用的 2D 画布上下文',
    'proto.renderFailed.body': '请更换浏览器后重试；此情况下不应继续作答。',
    'proto.choice.a': '属于星座类别 A',
    'proto.choice.b': '属于星座类别 B',
    'proto.feedback.correct': '模式分类正确！',
    'proto.feedback.incorrect': '模式分类错误！',
    'proto.feedback.noFeedbackTest': '测试阶段不提供对错反馈（已记录 {current}/{total} 次）',

    // 完成态
    'proto.complete.title': '本轮原型畸变测验已完成并记入数据',
    'proto.complete.learningValue': '{accuracy}%（{count} 次）',
    'proto.complete.prototypeVsNovel': '未见原型 / 新畸变',
    'proto.complete.noteA':
      '说明：原型优势效应为同一测试序列内“未见原型正确率 − 新畸变正确率”的差值；本序列每类各 {perType} 次，A/B 各半，且测试阶段无反馈。',
    'proto.complete.noteB': '该差值未经常模校正，不能单独作为能力判读依据。',
  },
  en: {
    'proto.badge': 'Prototype abstraction and pattern recognition (Prototype Abstraction)',
    'proto.title': 'Dot-Pattern Prototype Distortion Abstraction Test',

    'proto.intro.a':
      'A classic pattern-recognition and concept-formation task. During the training phase ({count} trials, with feedback) participants ',
    'proto.intro.neverPrototype': 'never see the undistorted prototype',
    'proto.intro.b':
      ' and must instead categorise Gaussian-perturbed dot patterns by trial and error. The transfer phase ({count} trials, ',
    'proto.intro.noFeedback': 'with no correctness feedback at all',
    'proto.intro.c': ') includes ',
    'proto.intro.novelPrototype': 'never-before-seen true prototypes',
    'proto.intro.d':
      ', testing whether the brain spontaneously abstracts the central prototype schema (the prototype-advantage effect).',

    'proto.action.reset': 'Reset test (Reset)',
    'proto.action.startTestEarly': 'Start the prototype transfer phase early',
    'proto.action.restart': 'Start a new run',

    'proto.phase.learning': 'Phase 1: trial-and-error learning on distorted exemplars (with feedback)',
    'proto.phase.test': 'Phase 2: prototype abstraction test (no feedback)',
    'proto.progress.learning': 'Training progress: {current}/{total}',
    'proto.progress.test': 'Test progress: {current}/{total}',
    'proto.a11y.learningTrial': 'Training phase, trial {current}',
    'proto.a11y.testTrial': 'Test phase, trial {current} of {total}',
    'proto.notice.learningDone': 'Training phase finished: the transfer phase begins, and no correctness feedback is given in it.',
    'proto.notice.earlyTest': 'Transfer phase started early: no correctness feedback is given in it.',

    'proto.stat.learningAccuracy': 'Training accuracy',
    'proto.stat.prototypeAccuracy': 'Accuracy on unseen prototypes',
    'proto.stat.novelDistortionAccuracy': 'Accuracy on novel distortions',
    'proto.stat.enhancement': 'Prototype-advantage effect',
    'proto.stat.enhancementFormula': 'prototype accuracy − novel-distortion accuracy',
    'proto.stat.notMeasured': 'Not measured',
    'proto.stat.trialCount': '({count} trials)',
    'proto.stat.avgRt': 'Mean RT',
    'proto.stat.rtSamples': 'Based on {count} responses',

    'proto.keyboard.intro': 'Keyboard: press ',
    'proto.keyboard.a': ' to assign Category A, press ',
    'proto.keyboard.b': ' to assign Category B.',
    'proto.note.testSequenceA':
      'The categorisation sequence in the transfer phase is fixed in advance and balanced across categories and material types, and gives no feedback.',
    'proto.note.testSequenceB': 'Performance in that phase therefore reflects prior learning rather than online learning.',

    'proto.stimulus.learningTitle': 'Nine-dot distorted exemplar (Distorted Exemplar)',
    'proto.stimulus.testTitle': 'Pattern-recognition evaluation pattern (Evaluation Pattern)',
    'proto.stimulus.learningAria': 'Nine-dot distorted figure to be categorised',
    'proto.stimulus.testAria': 'Nine-dot figure whose category is to be judged',
    'proto.renderFailed.title': 'Cannot draw the stimulus: this browser did not provide a usable 2D canvas context',
    'proto.renderFailed.body': 'Try another browser and retry; do not continue responding in this state.',
    'proto.choice.a': 'Belongs to Category A',
    'proto.choice.b': 'Belongs to Category B',
    'proto.feedback.correct': 'Pattern categorised correctly!',
    'proto.feedback.incorrect': 'Pattern categorised incorrectly!',
    'proto.feedback.noFeedbackTest': 'No correctness feedback is given in the transfer phase ({current}/{total} recorded)',

    'proto.complete.title': 'This run of the prototype-distortion test is complete and has been recorded',
    'proto.complete.learningValue': '{accuracy}% ({count} trials)',
    'proto.complete.prototypeVsNovel': 'Unseen prototype / novel distortion',
    'proto.complete.noteA':
      'Note: the prototype-advantage effect is the difference between accuracy on unseen prototypes and accuracy on novel distortions within the same test sequence; this sequence contains {perType} trials of each type, split evenly across A and B, with no feedback in the transfer phase.',
    'proto.complete.noteB':
      'That difference has not been norm-referenced and cannot by itself support an ability interpretation.',
  },
} as const;
