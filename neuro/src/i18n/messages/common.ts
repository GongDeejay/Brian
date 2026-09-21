/**
 * 通用词条：应用外壳、导航、页脚、语言切换与账号相关文案。
 *
 * 约定 / Convention
 * ----------------
 * 每个模块导出 `{ zh, en }` 两份词条，键名用 `命名空间.语义` 形式。
 * 两种语言必须同时给出，否则 `en.ts` 的 `Record<MessageKey, string>` 会编译报错。
 * `account.*` 与 `consent.*` 的文案与工作记忆平台保持一致，便于统一的账号体验。
 */
export const common = {
  zh: {
    'app.title': 'NeuroClassify',
    'app.titleFull': 'NeuroClassify 分类与模式识别',
    'app.subtitle': '认知神经科学分类测验与模式识别评估平台',
    'app.version': 'v2.4',

    'nav.aria': '测验任务切换',
    'nav.wcst': '威斯康星卡片 (WCST)',
    'nav.wcst.short': 'WCST',
    'nav.wpt': '天气预测任务 (WPT)',
    'nav.wpt.short': 'WPT',
    'nav.ided': '注意定势转移 (ID/ED)',
    'nav.ided.short': 'ID/ED',
    'nav.gabor': 'Gabor双系统 (COVIS)',
    'nav.gabor.short': 'Gabor',
    'nav.prototype': '原型畸变 (Posner)',
    'nav.prototype.short': '原型畸变',
    'nav.analytics': '认知画像与报告',
    'nav.analytics.short': '报告',
    'nav.sessionsCount': '已记录 {count} 条',

    /** 任务页签上的简短定位标注（宽屏可见）。 */
    'nav.tag.wcst': '前额叶灵活性',
    'nav.tag.wpt': '基底节概率直觉',
    'nav.tag.ided': '维度控制',
    'nav.tag.gabor': '规则vs整合',
    'nav.tag.prototype': '模式抽象',
    'nav.tag.analytics': '多维雷达',
    'nav.srLabel': '测验任务',
    'nav.srComplete': '（已完成测验）',

    'load.title': '认知负荷调节',
    'load.customBadge': '（已启用非基线负荷设置）',

    'action.home': '返回首页',
    'action.literature': '文献与机制',
    'action.celebrationOn': '关闭庆祝特效（在科研情境下建议保持关闭）',
    'action.celebrationOff': '开启庆祝特效（默认关闭：可能引入情绪唤醒混淆）',
    'action.celebrationState': '庆祝特效（彩带纸屑）{state}',
    'action.on': '已开启',
    'action.off': '已关闭',
    'action.audioOn': '关闭实验反馈音效',
    'action.audioOff': '开启实验反馈音效',
    'action.audioState': '实验反馈音效{state}',
    'action.language': '切换语言',
    'action.languageTo': '切换到 {lang}',
    /** 语言切换按钮上的缩写（当前 / 目标语言）。 */
    'action.langShort.zh': '中',
    'action.langShort.en': 'EN',
    /** 语言名称，用于 `action.languageTo` 的 {lang} 变量；各语言下写法一致（自名）。 */
    'lang.zh.name': '中文',
    'lang.en.name': 'English',

    /** 懒加载面板占位文案（App.tsx 的 PanelFallback）。 */
    'common.loadingPanel': '正在加载{panel}…',
    'panel.wpt': '天气预测任务',
    'panel.analytics': '结果分析看板',

    'footer.disclaimer':
      '本平台为科研与教学用演示工具：所输出的全部数值均为本系统内部指数，未经常模校正，不构成临床诊断或医疗建议。',
    'footer.suite': '认知神经科学执行功能与模式识别实验室套件',

    'account.signIn': '登录',
    'account.signOut': '退出登录',
    'account.register': '注册',
    'account.email': '邮箱',
    'account.password': '密码',
    'account.passwordConfirm': '确认密码',
    'account.displayName': '昵称（可选）',
    'account.subjectCode': '受试者编号',
    'account.subjectCodeHint': '由研究者提供的编号，无需注册即可开始测试',
    'account.startAnonymous': '不登录直接开始',
    'account.signedInAs': '已登录：{name}',
    'account.syncPending': '有 {count} 条本地记录待上传',
    'account.syncNow': '立即同步',
    'account.syncing': '正在同步…',
    'account.syncDone': '已同步 {count} 条记录',
    'account.syncFailed': '同步失败，记录仍保存在本机',
    'account.myData': '我的数据',
    'account.exportData': '导出我的全部数据',
    'account.deleteAccount': '删除账号与全部数据',
    'account.deleteConfirm': '此操作不可撤销，将永久删除你的账号和全部测评记录。确认继续？',

    'consent.title': '知情同意与数据说明',
    'consent.intro': '在开始上传数据前，请阅读并确认以下内容。',
    'consent.point1': '本平台的测评数据用于教学、训练与科研分析，不构成医学诊断。',
    'consent.point2': '登录后，测评结果会保存到服务器，以便跨设备查看变化趋势；未登录时数据仅保存在本机浏览器。',
    'consent.point3': '我们只保存测评指标与任务参数，不收集姓名、身份证号等身份信息。受试者以编号标识。',
    'consent.point4': '你可以随时导出自己的全部数据，也可以要求删除账号与所有记录。',
    'consent.point5': '研究者仅能看到编号化的测评数据，不会据此推断你的身份。',
    'consent.accept': '我已阅读并同意',
    'consent.decline': '暂不同意（仅本机保存）',
    'consent.version': '同意条款版本：{version}',

    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.close': '关闭',
    'common.loading': '加载中…',
    'common.retry': '重试',
    'common.optional': '可选',
    'common.required': '必填',

    /**
     * 顶层错误边界（ErrorBoundary）。类组件，不用 hook，
     * 由 `translate(readLang(), key)` 解析，语言来源见 ErrorBoundary.tsx。
     */
    'error.title': '测验界面出现异常',
    'error.body':
      '页面在渲染时遇到未预期的错误，为避免展示不完整或错误的测验内容，程序已停止当前界面。您已完成的测验记录保存在本浏览器的会话存储中，重新载入后仍可查看。',
    'error.unknown': '未知错误',
    'error.reload': '重新载入页面',
    'error.resetSession': '清空本次会话记录并重载',
    'error.technical': '技术细节（供开发者排查）',
    /** 控制台日志前缀，两种语言下都保留英文标识以便检索。 */
    'error.consoleLabel': '[NeuroClassify] render error:',
  },
  en: {
    'app.title': 'NeuroClassify',
    'app.titleFull': 'NeuroClassify Categorisation & Pattern Recognition',
    'app.subtitle': 'Cognitive neuroscience categorisation and pattern-recognition assessment platform',
    'app.version': 'v2.4',

    'nav.aria': 'Test task navigation',
    'nav.wcst': 'Wisconsin Card Sorting (WCST)',
    'nav.wcst.short': 'WCST',
    'nav.wpt': 'Weather Prediction Task (WPT)',
    'nav.wpt.short': 'WPT',
    'nav.ided': 'Intra/Extra-dimensional Set Shifting (ID/ED)',
    'nav.ided.short': 'ID/ED',
    'nav.gabor': 'Gabor Dual Systems (COVIS)',
    'nav.gabor.short': 'Gabor',
    'nav.prototype': 'Prototype Distortion (Posner)',
    'nav.prototype.short': 'Prototype',
    'nav.analytics': 'Cognitive Profile & Report',
    'nav.analytics.short': 'Report',
    'nav.sessionsCount': '{count} recorded',

    'nav.tag.wcst': 'Prefrontal flexibility',
    'nav.tag.wpt': 'Striatal probabilistic intuition',
    'nav.tag.ided': 'Dimensional control',
    'nav.tag.gabor': 'Rule vs integration',
    'nav.tag.prototype': 'Pattern abstraction',
    'nav.tag.analytics': 'Multidimensional radar',
    'nav.srLabel': 'Test task',
    'nav.srComplete': ' (already completed)',

    'load.title': 'Cognitive load',
    'load.customBadge': '(non-baseline load settings active)',

    'action.home': 'Back to home',
    'action.literature': 'Literature & mechanisms',
    'action.celebrationOn': 'Turn off celebration effects (recommended off in research settings)',
    'action.celebrationOff': 'Turn on celebration effects (off by default: may introduce emotional-arousal confounds)',
    'action.celebrationState': 'Celebration effects (confetti) {state}',
    'action.on': 'on',
    'action.off': 'off',
    'action.audioOn': 'Turn off experiment feedback audio',
    'action.audioOff': 'Turn on experiment feedback audio',
    'action.audioState': 'Experiment feedback audio {state}',
    'action.language': 'Switch language',
    'action.languageTo': 'Switch to {lang}',
    'action.langShort.zh': '中',
    'action.langShort.en': 'EN',
    'lang.zh.name': '中文',
    'lang.en.name': 'English',

    'common.loadingPanel': 'Loading {panel}…',
    'panel.wpt': 'the Weather Prediction Task',
    'panel.analytics': 'the results dashboard',

    'footer.disclaimer':
      'This platform is a demonstration tool for research and teaching. All reported values are internal indices that have not been norm-referenced and do not constitute a clinical diagnosis or medical advice.',
    'footer.suite': 'Cognitive neuroscience executive function & pattern recognition laboratory suite',

    'account.signIn': 'Sign in',
    'account.signOut': 'Sign out',
    'account.register': 'Create account',
    'account.email': 'Email',
    'account.password': 'Password',
    'account.passwordConfirm': 'Confirm password',
    'account.displayName': 'Display name (optional)',
    'account.subjectCode': 'Participant code',
    'account.subjectCodeHint': 'A code issued by the researcher — no account needed to begin',
    'account.startAnonymous': 'Continue without signing in',
    'account.signedInAs': 'Signed in as {name}',
    'account.syncPending': '{count} local record(s) waiting to upload',
    'account.syncNow': 'Sync now',
    'account.syncing': 'Syncing…',
    'account.syncDone': 'Synced {count} record(s)',
    'account.syncFailed': 'Sync failed — records are still stored on this device',
    'account.myData': 'My data',
    'account.exportData': 'Export all of my data',
    'account.deleteAccount': 'Delete account and all data',
    'account.deleteConfirm': 'This cannot be undone. Your account and every assessment record will be permanently deleted. Continue?',

    'consent.title': 'Informed consent and data notice',
    'consent.intro': 'Please read and confirm the following before any data is uploaded.',
    'consent.point1': 'This platform is for teaching, training and research analysis. It does not provide a medical diagnosis.',
    'consent.point2': 'When signed in, results are stored on the server so you can review change over time across devices. When signed out, data stays only in this browser.',
    'consent.point3': 'We store assessment metrics and task parameters only — no names or identity documents. Participants are identified by code.',
    'consent.point4': 'You may export all of your data at any time, and you may request deletion of your account and every record.',
    'consent.point5': 'Researchers see coded assessment data only, and cannot use it to identify you.',
    'consent.accept': 'I have read and agree',
    'consent.decline': 'Not now (keep data on this device only)',
    'consent.version': 'Consent version: {version}',

    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.loading': 'Loading…',
    'common.retry': 'Retry',
    'common.optional': 'optional',
    'common.required': 'required',

    'error.title': 'The test interface encountered a problem',
    'error.body':
      'An unexpected error occurred while rendering this page. To avoid showing incomplete or incorrect test content, the interface has been halted. Your completed test records are stored in this browser’s session storage and will still be available after a reload.',
    'error.unknown': 'Unknown error',
    'error.reload': 'Reload the page',
    'error.resetSession': 'Clear this session’s records and reload',
    'error.technical': 'Technical details (for developers)',
    'error.consoleLabel': '[NeuroClassify] render error:',
  },
} as const;
