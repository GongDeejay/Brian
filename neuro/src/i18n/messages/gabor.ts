/**
 * Gabor 双系统任务（RB/II）词条：模式切换、指导语、研究者视图、结果页。
 * 约定见 src/i18n/README.md：必须同时提供 zh 与 en，键名用 `gabor.<语义>`。
 * RB=rule-based, II=information-integration，请保留 COVIS 术语。
 */
export const gabor = {
  zh: {
    'gabor.badge': '认知双系统竞争 (COVIS Model)',
    'gabor.title': 'Gabor斑 规则分类 vs. 信息整合分类 (RB vs. II Task)',

    // 指导语（拆段以保留加粗强调）
    'gabor.intro.a': '认知心理学经典的条纹斑块分类测验。基于连续两维刺激：',
    'gabor.intro.freq': '空间条纹频率 (Cycles)',
    'gabor.intro.mid': ' 与',
    'gabor.intro.orient': '倾斜朝向角 (Orientation)',
    'gabor.intro.b':
      '。对比显式可言语规则 (Rule-Based) 与不可言语化的对角信息整合 (Information-Integration)。为保持效度，',
    'gabor.intro.hidden': '刺激的具体特征值默认对受试者隐藏',
    'gabor.intro.c': '。',

    // 研究者视图（警告语义不得弱化）
    'gabor.researcher.show': '研究者视图',
    'gabor.researcher.hide': '关闭研究者视图',
    'gabor.researcher.title': '研究者视图：显示刺激特征值与分类规则（对受试者显示会破坏信息整合条件的效度）',
    'gabor.researcher.warning': '研究者视图（以下数值不得展示给受试者）：',
    'gabor.researcher.stimulus':
      '当前刺激 → 条纹频率 {frequency}（像素相对单位，未按视角标定） · 朝向 {orientation}° · 刺激噪声种子 {seed} · 正确类别 {category}',
    'gabor.researcher.rules': 'RB 规则：频率 ≥ 5.0 → B，否则 A ｜ II 规则：10×频率 + 朝向 ≥ 95 → B，否则 A',

    'gabor.action.reset': '清空重置',

    // 任务模式
    'gabor.mode.aria': '任务模式切换',
    'gabor.mode.ii.title': '非言语信息整合 (Information-Integration)',
    'gabor.mode.ii.sub': '对角决策面 · 基底核尾状体网络 · 无法言语归纳',
    'gabor.mode.rb.title': '显式单维规则 (Rule-Based)',
    'gabor.mode.rb.sub': '正交单维界限 · 前额叶言语工作记忆主导',

    // 实时指标
    'gabor.stat.modeTrials': '当前模式试验次数',
    'gabor.stat.modeAccuracy': '当前模式准确率',
    'gabor.stat.notMeasured': '未测得',
    'gabor.stat.avgRt': '平均反应时',
    'gabor.stat.rtSamples': '基于 {count} 次作答',
    'gabor.stat.features': '刺激特征（受试者视图）',
    'gabor.stat.hidden': '已隐藏',

    // 键盘与局限声明
    'gabor.keyboard.intro': '键盘操作：按 ',
    'gabor.keyboard.a': ' 归入类别 A，按 ',
    'gabor.keyboard.b': ' 归入类别 B。',
    'gabor.note.limitA':
      '已知局限：条纹频率为像素相对单位，未按视角 (cycles/degree) 标定，屏幕尺寸与观看距离不受控，因此不具备跨设备可比性。',
    'gabor.note.limitB': '本任务也未实现阶梯法阈值测量。',

    // 刺激舞台
    'gabor.stimulus.title': '实时数学合成 Gabor 斑刺激 (Mathematical Gabor Patch)',
    'gabor.stimulus.aria': 'Gabor 斑刺激（条纹频率与朝向已隐藏）',
    'gabor.renderFailed.title': '无法绘制刺激：当前浏览器未提供可用的 2D 画布上下文',
    'gabor.renderFailed.body': '请更换浏览器或关闭画布硬件加速限制后重试；此情况下不应继续作答。',
    'gabor.choice.a': '归入类别 A (Category A)',
    'gabor.choice.b': '归入类别 B (Category B)',
    'gabor.feedback.correct': '分类正确！',
    'gabor.feedback.incorrect': '分类错误！',
    'gabor.a11y.correct': '分类正确',
    'gabor.a11y.incorrect': '分类错误',

    // 记录面板
    'gabor.record.title': '记录本轮结果',
    'gabor.record.body':
      '本任务为开放式试次，需手动提交才会写入认知画像。每次提交只记录上次提交之后新完成的试次（当前待记录 {pending} 次，已记录 {submitted} 次）。至少需 {minTrials} 次才能形成可解释的样本。',
    'gabor.record.submit': '提交并记录 {count} 次试验',
    'gabor.record.iiAccuracy': 'II 条件正确率',
    'gabor.record.rbAccuracy': 'RB 条件正确率',
    'gabor.record.trialCount': '({count} 次)',
    'gabor.record.covisGap': 'RB − II 差值 (COVIS 指标)',
    'gabor.record.covisGapNote': '需两种条件各有样本才有意义',
    'gabor.record.totalTrials': '总试验数',
    'gabor.record.covisNoteA':
      '说明：RB − II 差值为 COVIS 双系统理论中常用的分离指标，但本实现未做等化难度匹配，两条件的经验难度未必等价。',
    'gabor.record.covisNoteB': '因此该差值仅供内部参考。',
  },
  en: {
    'gabor.badge': 'Competition between cognitive systems (COVIS model)',
    'gabor.title': 'Gabor Patch Rule-Based vs. Information-Integration Categorisation (RB vs. II Task)',

    'gabor.intro.a':
      'A classic grating-patch categorisation task from cognitive psychology, built on two continuous stimulus dimensions: ',
    'gabor.intro.freq': 'spatial frequency (cycles)',
    'gabor.intro.mid': ' and ',
    'gabor.intro.orient': 'orientation (degrees)',
    'gabor.intro.b':
      '. It contrasts an explicitly verbalisable rule (rule-based) with a non-verbalisable diagonal information-integration boundary. To preserve validity, ',
    'gabor.intro.hidden': 'the concrete stimulus feature values are hidden from participants by default',
    'gabor.intro.c': '.',

    'gabor.researcher.show': 'Researcher view',
    'gabor.researcher.hide': 'Close researcher view',
    'gabor.researcher.title':
      'Researcher view: shows the stimulus feature values and the categorisation rule (showing them to participants destroys the validity of the information-integration condition)',
    'gabor.researcher.warning': 'Researcher view (the values below must NOT be shown to participants):',
    'gabor.researcher.stimulus':
      'Current stimulus → spatial frequency {frequency} (pixel-relative units, not calibrated in degrees of visual angle) · orientation {orientation}° · stimulus noise seed {seed} · correct category {category}',
    'gabor.researcher.rules':
      'RB rule: frequency ≥ 5.0 → B, otherwise A | II rule: 10×frequency + orientation ≥ 95 → B, otherwise A',

    'gabor.action.reset': 'Clear and reset',

    'gabor.mode.aria': 'Task mode switch',
    'gabor.mode.ii.title': 'Non-verbal information integration (Information-Integration)',
    'gabor.mode.ii.sub': 'Diagonal decision bound · basal ganglia / caudate network · not verbalisable',
    'gabor.mode.rb.title': 'Explicit single-dimension rule (Rule-Based)',
    'gabor.mode.rb.sub': 'Orthogonal single-dimension bound · prefrontal verbal working memory',

    'gabor.stat.modeTrials': 'Trials in current mode',
    'gabor.stat.modeAccuracy': 'Accuracy in current mode',
    'gabor.stat.notMeasured': 'Not measured',
    'gabor.stat.avgRt': 'Mean RT',
    'gabor.stat.rtSamples': 'Based on {count} responses',
    'gabor.stat.features': 'Stimulus features (participant view)',
    'gabor.stat.hidden': 'Hidden',

    'gabor.keyboard.intro': 'Keyboard: press ',
    'gabor.keyboard.a': ' to assign Category A, press ',
    'gabor.keyboard.b': ' to assign Category B.',
    'gabor.note.limitA':
      'Known limitations: spatial frequency is expressed in pixel-relative units and is not calibrated in degrees of visual angle (cycles/degree); screen size and viewing distance are uncontrolled, so the measure is not comparable across devices.',
    'gabor.note.limitB': 'This task also does not implement staircase threshold estimation.',

    'gabor.stimulus.title': 'Gabor patch generated mathematically in real time (Mathematical Gabor Patch)',
    'gabor.stimulus.aria': 'Gabor patch stimulus (spatial frequency and orientation hidden)',
    'gabor.renderFailed.title': 'Cannot draw the stimulus: this browser did not provide a usable 2D canvas context',
    'gabor.renderFailed.body': 'Try another browser, or disable canvas hardware-acceleration limits and retry; do not continue responding in this state.',
    'gabor.choice.a': 'Assign to Category A (Category A)',
    'gabor.choice.b': 'Assign to Category B (Category B)',
    'gabor.feedback.correct': 'Correct categorisation!',
    'gabor.feedback.incorrect': 'Incorrect categorisation!',
    'gabor.a11y.correct': 'Correct categorisation',
    'gabor.a11y.incorrect': 'Incorrect categorisation',

    'gabor.record.title': 'Record this block',
    'gabor.record.body':
      'This task is open-ended, so a block is written to the cognitive profile only when you submit it manually. Each submission records only the trials completed since the previous submission (currently {pending} pending, {submitted} already recorded). At least {minTrials} trials are needed for an interpretable sample.',
    'gabor.record.submit': 'Submit and record {count} trials',
    'gabor.record.iiAccuracy': 'II condition accuracy',
    'gabor.record.rbAccuracy': 'RB condition accuracy',
    'gabor.record.trialCount': '({count} trials)',
    'gabor.record.covisGap': 'RB − II difference (COVIS index)',
    'gabor.record.covisGapNote': 'Meaningful only when both conditions have trials',
    'gabor.record.totalTrials': 'Total trials',
    'gabor.record.covisNoteA':
      'Note: the RB − II difference is a dissociation index commonly used in COVIS dual-system theory, but this implementation does not equate difficulty across the two conditions, so their empirical difficulty need not be equivalent.',
    'gabor.record.covisNoteB': 'The difference is therefore for internal reference only.',
  },
} as const;
