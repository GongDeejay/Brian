/**
 * 认知负荷调节面板（CognitiveLoadPanel）词条：预设、时限、噪点、双任务开关。
 * 约定见 src/i18n/README.md：必须同时提供 zh 与 en，键名用 `load.<语义>`。
 * 面板文案需如实标注每个控件对哪些范式生效 —— 与组件里的 SCOPE 常量保持一致。
 */
export const load = {
  zh: {
    // ---- 面板头部 --------------------------------------------------------
    'load.panelTitle': '认知负荷调节控制器 (Cognitive Load Modulator)',
    'load.subtitle':
      '基于 Sweller 认知负荷理论 (CLT) 的负荷操控；每项控制均标注其实际生效的测验范围',
    'load.collapse': '收起面板',

    // ---- 当前设置读数 ----------------------------------------------------
    'load.current': '当前负荷设置：',
    'load.baselineNote': '（所有负荷开关关闭，测得数据可作为基线对照）',

    // ---- 预设 ------------------------------------------------------------
    'load.presets.label': '实验负荷预设方案',
    'load.preset.baseline.name': '标准临床基线',
    'load.preset.baseline.desc': '无时限 · 零知觉噪点',
    'load.preset.wmStress.name': '工作记忆高压',
    'load.preset.wmStress.desc': '双任务探测(WCST) · 3s限时',
    'load.preset.perceptualNoise.name': '视知觉强干扰',
    'load.preset.perceptualNoise.desc': '高杂波掩蔽 · 无关特征',
    'load.preset.highLoad.name': '极限过载压力',
    'load.preset.highLoad.desc': '2.0s倒计时 · 双任务 · 强噪',

    // ---- 控件一：反应时限 ------------------------------------------------
    'load.timeLimit.title': '反应时限压迫 (Time Limit)',
    'load.timeLimit.selfPaced': '不设限 (Self-paced)',
    'load.timeLimit.seconds': '{seconds} 秒',
    'load.timeLimit.groupAria': '反应时限（秒）',
    'load.timeLimit.desc':
      '限制刺激呈现与加工时间，压榨前额叶瞬时反应资源。生效范围：{scope}。超时记为“未反应 (omission)”，不产生反应时，也不计入非持续性错误。',

    // ---- 控件二：知觉噪声 ------------------------------------------------
    'load.noise.title': '知觉掩蔽噪点 (Visual Noise)',
    'load.noise.valueAria': '知觉噪声 {level}%',
    'load.noise.scaleClear': '清晰无噪 (0%)',
    'load.noise.scaleMid': '中度混淆 (40%)',
    'load.noise.scaleHeavy': '强高斯掩蔽 (80%)',
    'load.noise.scope': '生效范围：{scope}。',

    // ---- 控件三：工作记忆与干扰 ------------------------------------------
    'load.wm.title': '双任务工作记忆探测',
    'load.wm.active': '已启用 (Active)',
    'load.wm.inactive': '已停用',
    'load.wm.checkbox': '随机穿插数字瞬时保持 (Dual-Task Probe)',
    'load.wm.scope':
      '生效范围：{scope}。数字呈现后间隔 4 次分类再要求回忆，可随时跳过。',
    'load.distractor.title': '无关特征干扰叠加',
    'load.distractor.scope':
      '生效范围：{scope}。刺激区叠加静态无关几何图形（不参与分类规则）。',

    // ---- 各控件的实际生效范式（SCOPE） ----------------------------------
    // 与组件 SCOPE 常量一致：时限仅 WCST/WPT；双任务仅 WCST；噪声与干扰覆盖全部五个范式。
    'load.scope.timeLimit': 'WCST / WPT',
    'load.scope.noise': 'WCST / WPT / IDED / Gabor / 原型畸变',
    'load.scope.wmProbe': 'WCST',
    'load.scope.distractor': 'WCST / WPT / IDED / Gabor / 原型畸变',
    'load.scope.paradigm.prototype': '原型畸变',
  },
  en: {
    // ---- Panel header ----------------------------------------------------
    'load.panelTitle': 'Cognitive Load Modulator',
    'load.subtitle':
      'Load manipulations based on Sweller’s cognitive load theory (CLT); each control states the test range in which it actually takes effect',
    'load.collapse': 'Collapse panel',

    // ---- Current settings read-out ---------------------------------------
    'load.current': 'Current load settings: ',
    'load.baselineNote':
      '(all load switches are off, so the recorded data can serve as a baseline comparison)',

    // ---- Presets ---------------------------------------------------------
    'load.presets.label': 'Experimental load presets',
    'load.preset.baseline.name': 'Standard baseline',
    'load.preset.baseline.desc': 'No time limit · zero perceptual noise',
    'load.preset.wmStress.name': 'Working-memory stress',
    'load.preset.wmStress.desc': 'Dual-task probe (WCST) · 3 s limit',
    'load.preset.perceptualNoise.name': 'Strong visual interference',
    'load.preset.perceptualNoise.desc': 'Heavy noise masking · irrelevant features',
    'load.preset.highLoad.name': 'Extreme overload',
    'load.preset.highLoad.desc': '2.0 s countdown · dual task · heavy noise',

    // ---- Control 1: response time limit ----------------------------------
    'load.timeLimit.title': 'Response time limit',
    'load.timeLimit.selfPaced': 'No limit (self-paced)',
    'load.timeLimit.seconds': '{seconds} s',
    'load.timeLimit.groupAria': 'Response time limit (seconds)',
    'load.timeLimit.desc':
      'Limits stimulus presentation and processing time, squeezing momentary prefrontal response resources. Applies to: {scope}. A timeout is recorded as an omission: it produces no reaction time and is not counted as a non-perseverative error.',

    // ---- Control 2: perceptual noise -------------------------------------
    'load.noise.title': 'Perceptual noise mask (visual noise)',
    'load.noise.valueAria': 'Perceptual noise {level}%',
    'load.noise.scaleClear': 'Clear, no noise (0%)',
    'load.noise.scaleMid': 'Moderate confusion (40%)',
    'load.noise.scaleHeavy': 'Heavy Gaussian mask (80%)',
    'load.noise.scope': 'Applies to: {scope}.',

    // ---- Control 3: working memory and interference ----------------------
    'load.wm.title': 'Dual-task working-memory probe',
    'load.wm.active': 'Active',
    'load.wm.inactive': 'Off',
    'load.wm.checkbox': 'Interleaved random digit retention (dual-task probe)',
    'load.wm.scope':
      'Applies to: {scope}. After a digit is shown, recall is requested 4 classification trials later; it can be skipped at any time.',
    'load.distractor.title': 'Irrelevant-feature interference overlay',
    'load.distractor.scope':
      'Applies to: {scope}. Static, task-irrelevant geometric shapes are overlaid on the stimulus area (they take no part in the classification rule).',

    // ---- Paradigms each control actually affects (SCOPE) -----------------
    'load.scope.timeLimit': 'WCST / WPT',
    'load.scope.noise': 'WCST / WPT / IDED / Gabor / prototype distortion',
    'load.scope.wmProbe': 'WCST',
    'load.scope.distractor': 'WCST / WPT / IDED / Gabor / prototype distortion',
    'load.scope.paradigm.prototype': 'prototype distortion',
  },
} as const;
