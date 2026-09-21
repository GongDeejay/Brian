/**
 * 天气预测任务（WPT）词条：指导语、线索卡、概率说明、学习曲线、结果页。
 * 约定见 src/i18n/README.md：必须同时提供 zh 与 en，键名用 `wpt.<语义>`。
 * 概率与线索相关表述请与 Knowlton (1996) 一致。
 */
export const wpt = {
  zh: {
    'wpt.badge': '概率与直觉分类 (Probabilistic Classification)',
    'wpt.title': '天气预测任务 (Weather Prediction Task, WPT)',
    // 指导语：夹在强调 span 之间的片段被拆成独立键，拼回后语义与原文一致。
    'wpt.intro.lead': '评估大脑',
    'wpt.intro.striatum': '基底神经节/纹状体 (Striatum)',
    'wpt.intro.body':
      '对海量模糊概率线索进行“内隐特征提取”的能力。每张几何牌与天气仅有不确定概率关联，无法凭单次逻辑推导，只能依赖直觉分类培养“盘感”。',
    'wpt.intro.trials': '共 {count} 次试验，14 种合法线索组合均衡呈现。',
    'wpt.reset': '重新洗牌',
    'wpt.decoder.toggleTitle':
      '研究者视图：会显示贝叶斯概率与最优决策，受试者开启后将破坏该测验的效度',
    'wpt.decoder.show': '研究者视图（概率透视）',
    'wpt.decoder.hide': '关闭研究者视图',
    'wpt.decoder.noticeTitle': '研究者视图已开启：',
    'wpt.decoder.noticeBody':
      '下方将显示各牌的先验概率与贝叶斯后验概率。若受试者看到这些数值，本测验将退化为显式概率计算任务，其“内隐学习”的测量效度即失效。',

    'wpt.metric.progress': '试验进度',
    'wpt.metric.noResponseNote': '未反应 {count} 次（不计入比率）',
    'wpt.metric.optimalRate': '最优选择率 (Optimal Rate)',
    'wpt.metric.accuracy': '实际命中率 (Accuracy)',
    'wpt.metric.implicitIndex': '基底节内隐指数',
    'wpt.metric.meanRt': '平均反应时',
    'wpt.metric.rtNotMeasured': '未测得',
    'wpt.metric.rtSample': '基于 {count} 次作答',

    'wpt.keyboard.lead': '键盘操作：按',
    'wpt.keyboard.rain': '预测下雨，按',
    'wpt.keyboard.sun': '预测晴天。',
    'wpt.keyboard.note':
      '“基底节内隐指数”为本系统内部换算（最优选择率 70% + 区块学习增益 30%，截断于 10–98），非常模分数。',

    'wpt.decoder.bannerTitle': '学术文献规范 (Knowlton 1996) 各卡片独立降水先验概率：',
    'wpt.decoder.priorCard': '塔罗 #{index} {name}',
    'wpt.decoder.priorValue': 'P(雨)={value}',
    'wpt.decoder.strongCue': '(强提示)',
    'wpt.decoder.weakCue': '(弱提示)',
    'wpt.decoder.footnote':
      '当多张牌组合呈现时，系统依贝叶斯定理实时更新后验降雨概率。健康受试者通常在 20-50 次试验中逐渐逼近贝叶斯最优决策（该说法为文献中的群体趋势，不构成对单个受试者的判读）。',

    'wpt.arena.cuePattern': '当前气候占卜几何牌阵 (Active Cue Pattern)',
    'wpt.arena.allDone': '全部 {count} 次试验已完成',
    'wpt.arena.predictRain': '预测下雨 (Rain)',
    'wpt.arena.predictSun': '预测晴天 (Sun)',
    'wpt.timer.label': '直觉决断倒计时',
    'wpt.timer.remaining': '剩余 {seconds} 秒',

    'wpt.feedback.reveal': '实际天气揭晓：',
    'wpt.feedback.rain': '下雨天 (Rain)',
    'wpt.feedback.sun': '晴空日 (Sun)',
    'wpt.feedback.timeout': '超时未作答（未反应）',
    'wpt.feedback.correct': '预测命中',
    'wpt.feedback.incorrect': '预测未中',
    'wpt.feedback.posterior': '贝叶斯P(雨): {value}% ({verdict})',
    'wpt.feedback.optimal': '最优决策',
    'wpt.feedback.suboptimal': '次优决策',

    'wpt.announce.weather': '实际天气：{weather}',
    'wpt.announce.rain': '下雨',
    'wpt.announce.sun': '晴天',
    'wpt.announce.timeout': '本次未在时限内作答，已记为未反应',
    'wpt.announce.hit': '您的预测命中',
    'wpt.announce.miss': '您的预测未命中',
    'wpt.announce.posterior': '贝叶斯后验降雨概率 {value}%',
    'wpt.announce.separator': '；',

    'wpt.complete.title': '本轮 WPT 已完成并记入数据',
    'wpt.complete.trials': '完成试验数',
    'wpt.complete.responded': '（作答 {count}）',
    'wpt.complete.optimalRate': '最优选择率',
    'wpt.complete.accuracy': '实际命中率',
    'wpt.complete.slope': '首→末区块最优率变化',
    'wpt.complete.slopeNotMeasured': '未测得',
    'wpt.complete.note':
      '随机猜测的最优选择率约为 50–60%（取决于组合分布），实际命中率受结果随机性影响，单次测验的命中率不能直接作为能力判读。',
    'wpt.complete.restart': '重新洗牌开始新一轮',

    'wpt.curve.title': '内隐学习进程折线图 (Implicit Learning Trajectory)',
    'wpt.curve.subtitle':
      '以 10 次试验为一个 Block，展示最优选择率随试验进程的攀升曲线（基底节习惯形成规律）',
    'wpt.curve.blockTick': 'Block {block}',
    'wpt.curve.blockTooltip': 'Block {block} (第 {from}-{to} 次试验)',
    'wpt.curve.optimalLine': '最优选择率 (Optimal Choice %)',
    'wpt.curve.actualLine': '实际正确率 (Actual Accuracy %)',

    'wpt.cue.triangles': '三角星云 (Triangles)',
    'wpt.cue.diamonds': '嵌套棱形 (Diamonds)',
    'wpt.cue.circles': '同心圆环 (Circles)',
    'wpt.cue.squares': '方形矩阵 (Squares)',
    'wpt.cue.trianglesShort': '三角',
    'wpt.cue.diamondsShort': '棱形',
    'wpt.cue.circlesShort': '圆环',
    'wpt.cue.squaresShort': '网格',
    'wpt.card.label': '塔罗 #{index}',
    'wpt.card.active': '呈递',
    'wpt.card.dormant': '休眠',
  },
  en: {
    'wpt.badge': 'Probabilistic classification',
    'wpt.title': 'Weather Prediction Task (WPT)',
    'wpt.intro.lead': 'Assesses the ability of the ',
    'wpt.intro.striatum': 'basal ganglia / striatum',
    'wpt.intro.body':
      ' to perform “implicit feature extraction” on a large number of ambiguous probabilistic cues. Each geometric card is related to the weather only probabilistically, so no single trial can be solved by logic — performance depends on intuitive categorisation and a growing “feel” for the task.',
    'wpt.intro.trials': ' {count} trials in total; all 14 legal cue combinations are presented with equal frequency.',
    'wpt.reset': 'Reshuffle',
    'wpt.decoder.toggleTitle':
      'Researcher view: displays Bayesian probabilities and the optimal choice. Enabling it for a participant invalidates the validity of this test.',
    'wpt.decoder.show': 'Researcher view (probability decoder)',
    'wpt.decoder.hide': 'Close researcher view',
    'wpt.decoder.noticeTitle': 'Researcher view is on: ',
    'wpt.decoder.noticeBody':
      'the prior probability of each card and the Bayesian posterior will be shown below. If a participant sees these values, the task degenerates into explicit probability calculation and its validity as a measure of implicit learning is lost.',

    'wpt.metric.progress': 'Trial progress',
    'wpt.metric.noResponseNote': 'No response: {count} (excluded from the rates)',
    'wpt.metric.optimalRate': 'Optimal choice rate',
    'wpt.metric.accuracy': 'Actual accuracy',
    'wpt.metric.implicitIndex': 'Basal ganglia implicit index',
    'wpt.metric.meanRt': 'Mean RT',
    'wpt.metric.rtNotMeasured': 'Not measured',
    'wpt.metric.rtSample': 'Based on {count} responses',

    'wpt.keyboard.lead': 'Keyboard: press',
    'wpt.keyboard.rain': 'to predict rain, press',
    'wpt.keyboard.sun': 'to predict sun.',
    'wpt.keyboard.note':
      'The “basal ganglia implicit index” is an internal transformation (70% weight on the optimal choice rate + 30% on the block learning gain, clipped to 10–98); it is not a norm-referenced score.',

    'wpt.decoder.bannerTitle': 'Per Knowlton (1996), the independent rain prior of each cue card:',
    'wpt.decoder.priorCard': 'Cue card #{index} {name}',
    'wpt.decoder.priorValue': 'P(rain) = {value}',
    'wpt.decoder.strongCue': '(strong cue)',
    'wpt.decoder.weakCue': '(weak cue)',
    'wpt.decoder.footnote':
      'When several cards are presented together, the system updates the posterior rain probability in real time using Bayes’ theorem. Healthy participants typically approach the Bayesian optimal choice over 20–50 trials (this is a group-level trend from the literature, not a reading of any individual participant).',

    'wpt.arena.cuePattern': 'Active cue pattern',
    'wpt.arena.allDone': 'All {count} trials completed',
    'wpt.arena.predictRain': 'Predict rain',
    'wpt.arena.predictSun': 'Predict sun',
    'wpt.timer.label': 'Intuition countdown',
    'wpt.timer.remaining': '{seconds} s remaining',

    'wpt.feedback.reveal': 'Actual weather:',
    'wpt.feedback.rain': 'Rain',
    'wpt.feedback.sun': 'Sun',
    'wpt.feedback.timeout': 'Timed out — no response',
    'wpt.feedback.correct': 'Prediction correct',
    'wpt.feedback.incorrect': 'Prediction incorrect',
    'wpt.feedback.posterior': 'Bayesian P(rain): {value}% ({verdict})',
    'wpt.feedback.optimal': 'optimal choice',
    'wpt.feedback.suboptimal': 'suboptimal choice',

    'wpt.announce.weather': 'Actual weather: {weather}',
    'wpt.announce.rain': 'rain',
    'wpt.announce.sun': 'sun',
    'wpt.announce.timeout': 'No response within the time limit; recorded as a timeout',
    'wpt.announce.hit': 'Your prediction was correct',
    'wpt.announce.miss': 'Your prediction was incorrect',
    'wpt.announce.posterior': 'Bayesian posterior rain probability {value}%',
    'wpt.announce.separator': '; ',

    'wpt.complete.title': 'This WPT session is complete and has been recorded',
    'wpt.complete.trials': 'Trials completed',
    'wpt.complete.responded': '(answered: {count})',
    'wpt.complete.optimalRate': 'Optimal choice rate',
    'wpt.complete.accuracy': 'Actual accuracy',
    'wpt.complete.slope': 'Optimal rate change, first → last block',
    'wpt.complete.slopeNotMeasured': 'Not measured',
    'wpt.complete.note':
      'Guessing at random gives an optimal choice rate of roughly 50–60% (depending on the combination distribution), and actual accuracy is affected by outcome randomness; a single session’s accuracy cannot be read directly as ability.',
    'wpt.complete.restart': 'Reshuffle and start a new session',

    'wpt.curve.title': 'Implicit learning trajectory',
    'wpt.curve.subtitle':
      'Blocks of 10 trials, showing the rise in optimal choice rate across the session (habit formation in the basal ganglia).',
    'wpt.curve.blockTick': 'Block {block}',
    'wpt.curve.blockTooltip': 'Block {block} (trials {from}–{to})',
    'wpt.curve.optimalLine': 'Optimal choice rate (%)',
    'wpt.curve.actualLine': 'Actual accuracy (%)',

    'wpt.cue.triangles': 'Triangles',
    'wpt.cue.diamonds': 'Diamonds',
    'wpt.cue.circles': 'Circles',
    'wpt.cue.squares': 'Squares',
    'wpt.cue.trianglesShort': 'triangles',
    'wpt.cue.diamondsShort': 'diamonds',
    'wpt.cue.circlesShort': 'circles',
    'wpt.cue.squaresShort': 'squares',
    'wpt.card.label': 'Cue card #{index}',
    'wpt.card.active': 'Active',
    'wpt.card.dormant': 'Dormant',
  },
} as const;
