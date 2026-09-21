import { DimensionInfo, DimensionKey } from "../types";

export const DIMENSIONS: Record<DimensionKey, DimensionInfo> = {
  naturalEase: {
    key: "naturalEase",
    name: "隐性优势与轻巧度",
    shortName: "轻巧不费力",
    color: "#4f46e5", // Indigo
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    description: "他人视作高门槛甚至需要咬牙克服的技能，你凭借直觉自然上手，感觉像是在玩耍而非工作。",
    sourceTheory: "纳瓦尔专长理论 (Specific Knowledge) & 隐性胜任力",
    coreQuestion: "哪些事情对你来说轻而易举，但对身边80%的人却很困难？",
  },
  energyFlow: {
    key: "energyFlow",
    name: "精力审计与心流状态",
    shortName: "充能与心流",
    color: "#0891b2", // Cyan
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    description: "做完不仅不觉得被掏空，反而双眼放光、精神亢奋；进入过程中经常时间蒸发、高度沉浸。",
    sourceTheory: "奇克森特米哈伊心流理论 (Flow) & 积极心理学精力审计",
    coreQuestion: "哪类活动能让你忘记看手机，结束时依然感到被持续充电？",
  },
  socialMirror: {
    key: "socialMirror",
    name: "外部镜像与求助盲区",
    shortName: "求助盲区",
    color: "#059669", // Emerald
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    description: "自己的特长往往因过于熟悉而变成盲区，但在朋友同事眼中却是一清二楚的求助首选与高频赞赏点。",
    sourceTheory: "乔哈里视窗盲目区 (Johari Window) & 360°多源反馈评估",
    coreQuestion: "大家遇到哪类棘手问题时，总是第一时间来请教你或找你求助？",
  },
  gritTolerance: {
    key: "gritTolerance",
    name: "阻力耐受与细节韧性",
    shortName: "枯燥耐受力",
    color: "#d97706", // Amber
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    description: "任何高级专长90%都是枯燥微小的繁琐细节，你对哪种琐碎和卡点具备天然的抗压与死磕耐心。",
    sourceTheory: "安杰拉·达克沃思坚毅理论 (Grit) & 刻意练习微循环",
    coreQuestion: "在什么事情上，别人改两遍就崩溃，你却能为了极致体验修改五十次？",
  },
  cognitiveAptitude: {
    key: "cognitiveAptitude",
    name: "认知与智能模式倾向",
    shortName: "认知模式",
    color: "#7c3aed", // Violet
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    description: "大脑底层处理信息的偏好通道（数理系统逻辑、人际同理共情、具象美感构图、或战略行动驱动）。",
    sourceTheory: "加德纳多元智能 (Gardner) & 霍兰德职业兴趣六角模型 (RIASEC)",
    coreQuestion: "你习惯用系统框架、人际温度、美学感官还是商业逻辑来理解世界？",
  },
  latentDesire: {
    key: "latentDesire",
    name: "潜意识渴望与反向投射",
    shortName: "嫉妒指南针",
    color: "#e11d48", // Rose
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    description: "嫉妒与强烈的心理防御往往指向你被压抑的真实潜能，暗中羡慕的人正是你内在渴望成为的模样。",
    sourceTheory: "朱莉亚·卡梅农《艺术家之道》嫉妒地图 & 荣格阴影投射理论",
    coreQuestion: "你最秘密嫉妒谁的哪项才能？背后映射了你怎样的未竟天赋？",
  },
};

export interface AcademicArticle {
  id: string;
  category: "video" | "academic" | "methodology";
  title: string;
  source: string;
  author: string;
  summary: string;
  keyHeuristics: string[];
  actionSteps: string[];
  quote: string;
}

export const THEORY_ARTICLES: AcademicArticle[] = [
  {
    id: "video-frictionless",
    category: "video",
    title: "法则一：寻找「对你如同玩耍，对他人如同劳作」的隐性专长",
    source: "Bilibili 视频核心方法论 & 硅谷投资人纳瓦尔专长法则",
    author: "纳瓦尔·拉维肯特 (Naval Ravikant)",
    summary: "真正的核心优势往往不是考卷上考出来的，而是你很小的时候就不由自主在摆弄、且不需要别人督促就能完成的事。这种能力对你来说毫不费力，甚至你不认为它是一种“硬技能”，但在别人眼里却极其神奇。社会无法通过标准应试教育大规模量产你的专长，这恰恰是不可替代性的根基。",
    keyHeuristics: [
      "回溯10-18岁无功利目标时的自发兴趣：搭建玩具、折腾系统、给朋友调解心事、画画或写长日记。",
      "注意那些你觉得“这还需要教吗？”的常识点，这往往就是你的认知特权区。",
      "避开社会主流标准模板（如人人都去考同样的证），寻找个人特质与现代杠杆的结合点。",
    ],
    actionSteps: [
      "写下3件你在大学或工作前，自发耗费大量时间但没人付钱给你的事情。",
      "检验自己当前的工作：哪部分让你觉得是纯玩耍？哪部分让你每分钟都在忍耐？",
    ],
    quote: "没有人能在做你自己这件事上与你竞争。",
  },
  {
    id: "video-energy-audit",
    category: "video",
    title: "法则二：精力审计与心流追击——把注意力从「擅长」转向「充能」",
    source: "积极心理学 & 奇克森特米哈伊心流状态研究",
    author: "米哈里·齐克森米哈里 (Mihaly Csikszentmihalyi)",
    summary: "盖洛普研究发现，许多人由于责任心强，做某些事情能拿高分，但做完后身心枯竭，这叫做「虚假优势（Burnout Trap）」。真正属于你的天赋领域，必须同时具备「高胜任力」与「内在充能感」。当挑战与你的专长完美平衡，大脑会进入无自我意识、时间扭曲的心流体验（Flow State）。",
    keyHeuristics: [
      "做完事情后的状态自测：是想瘫倒看无聊短视频（耗竭），还是思维活跃想要进一步优化（充能）？",
      "时间蒸发法则：哪些事情发生时，不知不觉3个小时就过去了？",
      "情绪疗愈特权：当你状态不佳时，进入哪个特定任务能让你自发平静下来？",
    ],
    actionSteps: [
      "进行连续3天的「精力日志追踪」，为每项主要事件打上充能指数（-3 到 +3）。",
      "识别出精力黑洞，制定边界逐步剥离或外包；将充能事件保护为每日核心深度时间。",
    ],
    quote: "心流是意识和谐有序的最优体验，是幸福与潜能的汇合之泉。",
  },
  {
    id: "video-external-mirror",
    category: "video",
    title: "法则三：外部镜像与求助清单——打破「当局者迷」的乔哈里盲区",
    source: "心理学乔哈里视窗 (Johari Window) & 360度人际反馈",
    author: "约瑟夫·鲁夫特 & 哈里·英格汉姆 (Luft & Ingham)",
    summary: "由于自身优势对于自己而言如同呼吸般自然，我们往往对其视而不见，反而过度执着于自己的短板。而身边的同事、朋友、伴侣则是一个个高清镜子。人们在遇到真实痛点时，本能选择的求助对象就是对该领域拥有极高信任度与认可度的人。",
    keyHeuristics: [
      "求助重合率：别人最常找你帮忙改文案、挑衣服、理清代码逻辑、还是梳理人际纠纷？",
      "反常赞赏法：当别人惊叹“你怎么做到的”而你下意识觉得“就这么做啊”，务必把这个点记下来。",
      "乔哈里盲区：盲目区（别人知道而你不知道的自己）往往藏着你真正的金矿。",
    ],
    actionSteps: [
      "向3位不同背景的熟人发送3个开放式问题，请他们不加修饰地描述你最突出的才能。",
      "整理出高频重合词汇，对照自己的职业规划进行校准。",
    ],
    quote: "鱼常常是最后一个发现水的存在的生物。",
  },
  {
    id: "video-grit-friction",
    category: "video",
    title: "法则四：痛苦与枯燥耐受度——你愿意为哪种琐碎细节买单？",
    source: "坚毅力理论 (Grit) & 专业主义微循环",
    author: "安杰拉·达克沃思 (Angela Duckworth)",
    summary: "任何光鲜领域在现实中都有80%-90%的脏活累活。程序员要面对冗长难懂的报错日志；设计师要面对几十次像素微调；优秀的写作者要忍受在白纸前撕扯推敲。区分普通爱好者与真正大师的，不是高光时刻的热情，而是谁在繁琐与枯燥中依然能找到心流与细节满足。",
    keyHeuristics: [
      "垃圾工测试：任何职业都有一袋不可避免的垃圾，你最不反感处理哪一袋？",
      "卡点反应：遇到卡壳时，你是厌恶放弃，还是像解谜游戏一样越挫越勇？",
      "对微小瑕疵的偏执：你在什么细节上哪怕别人看不出来，自己也必须搞到完美？",
    ],
    actionSteps: [
      "反思过去放弃过的赛道：你放弃是因为缺乏才能，还是无法忍受该赛道的日常琐碎？",
      "找到哪怕枯燥你也能自得其乐的工序，这就是你的长期防御城墙。",
    ],
    quote: "坚毅是对长期目标的持久热情与耐力，它比天赋更有预言力。",
  },
  {
    id: "video-envy-compass",
    category: "video",
    title: "法则五：嫉妒指南针——用反向投射照亮被压抑的渴望与潜能",
    source: "《艺术家之道》嫉妒地图 & 荣格深层心理学",
    author: "朱莉亚·卡梅农 (Julia Cameron)",
    summary: "嫉妒在道德上常被避讳，但在潜意识心理学中，它是一个极其精准的雷达。我们绝不会嫉妒一个与自己毫不相关领域的大师（如普通的程序员不会嫉妒一位出色的芭蕾舞演员），我们只会嫉妒那些做着我们内心深处最想做、且隐隐感觉自己也有潜力做成的人。嫉妒是尚未发芽的种子发出的求救信号。",
    keyHeuristics: [
      "嫉妒雷达：刷社交媒体时，哪种成就或生活方式会刺痛你的神经？",
      "解构刺痛点：你嫉妒的到底是他拥有的名利，还是他创造某个作品的自由与能力？",
      "转化动力：将嫉妒转译为愿望清单——“我也想学会这个，并且用我自己的方式做出来”。",
    ],
    actionSteps: [
      "制作一张「嫉妒地图」，列出3个让你暗自嫉妒的人及其特长。",
      "在每个人物后面挖掘潜藏的自我投射：我其实渴望拥有哪项专长？",
    ],
    quote: "嫉妒永远是一张地图。每一张嫉妒地图都标注着你真正的宝藏藏匿点。",
  },
  {
    id: "academic-sign",
    category: "academic",
    title: "盖洛普 SIGN 优势四要素诊断模型",
    source: "盖洛普优势管理与积极心理学",
    author: "马库斯·白金汉 (Marcus Buckingham)",
    summary: "SIGN 模型是全球企业界与个人优势发掘中最经典的学术工具之一。它指出真正的个人优势（Strength）由四个特征同时定义：S (Success 胜任力 - 容易做出高水准成果)、I (Instinct 渴望 - 忍不住主动想做)、G (Grow 快速成长 - 极高悟性与陡峭学习曲线)、N (Need 滋养 - 获得深层精神充沛感)。",
    keyHeuristics: [
      "S: 成效显著，外界普遍认可质量优异。",
      "I: 前摄动机，无需外部KPI考核也会主动尝试。",
      "G: 触类旁通，别人需要一年掌握的概念你几天就能参透本质。",
      "N: 体验闭环，做完感到充实满足，自我效能感大幅提升。",
    ],
    actionSteps: [
      "评估你当前的日常任务是否同时满足 S、I、G、N 四个字母。",
      "针对只满足 S 但缺少 N 的任务（高危耗竭任务），做针对性防范与转移。",
    ],
    quote: "把时间花在弥补弱点上只能让你防止失败，只有发挥优势才能让你走向卓越。",
  },
  {
    id: "academic-riasec",
    category: "academic",
    title: "霍兰德职业兴趣六边形理论 (RIASEC)",
    source: "职业心理学经典奠基理论",
    author: "约翰·霍兰德 (John Holland)",
    summary: "人的职业兴趣与人格倾向可分为六大基本类型：实际型(R - 动手实物)、研究型(I - 思考探究)、艺术型(A - 审美创造)、社会型(S - 助人社交)、企业型(E - 影响商业)、常规型(C - 秩序精密)。当工作环境的人格代码与个人代码匹配时，个体会爆发出最高的工作满意度与创造力。",
    keyHeuristics: [
      "对角线张力：例如研究型(I)与企业型(E)通常代表思考深度与商业推进的张力。",
      "代码复合：绝大多数卓越者是复合型（如 A-I-E 创意探究商业化）。",
      "环境匹配度：避免将一个强艺术型/研究型人格困在强常规型(C)的刻板流水线中。",
    ],
    actionSteps: [
      "梳理自己的前两大主导类型，寻找两者的交叉赛道。",
      "评估现有岗位的文化与要求是否与你的霍兰德核心倾向严重冲突。",
    ],
    quote: "职业选择是个人人格在工作世界中的投射与延伸。",
  },
  {
    id: "academic-ikigai",
    category: "academic",
    title: "Ikigai (生き甲斐) 卓越人生意义罗盘",
    source: "日本冲绳长寿哲学与生涯规划跨学科整合",
    author: "Ikigai 交叉模型",
    summary: "一个人擅长领域的最理想落地状态，是找到「擅长的」、「热爱的」、「世界需要的」与「能获得商业回报的」四重交集。只有擅长和热爱，是没有收入的业余喜好；只有擅长和能赚钱，是无聊枯燥的工具人；只有热爱和世界需要，是清贫的传教士。唯有四叶草闭环，才能形成滚雪球般的长期复利。",
    keyHeuristics: [
      "擅长 (Your Strengths) × 商业回报 (Wealth): 职业 (Profession)",
      "擅长 (Your Strengths) × 热爱 (Your Passion): 激情 (Passion)",
      "热爱 (Your Passion) × 世界需要 (World Needs): 使命 (Mission)",
      "世界需要 (World Needs) × 商业回报 (Wealth): 天职 (Vocation)",
    ],
    actionSteps: [
      "绘制自己的 Ikigai 四叶草草图，标记每个象限的当前进展。",
      "找到目前的断裂点（例如：有擅长与收入，但极度缺乏热爱与使命），制定小步迭代方案。",
    ],
    quote: "Ikigai 是你每天早晨睁开双眼时，内心涌动的那份期待与召唤。",
  },
];
