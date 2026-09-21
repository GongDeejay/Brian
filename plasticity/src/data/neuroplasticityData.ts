import { MindMapNode, PracticeProtocol } from '../types';

export const CATEGORY_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; accent: string; icon: string }
> = {
  paradigm: {
    label: '范式转变',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-800',
    accent: '#d97706',
    icon: 'Sparkles',
  },
  mechanism: {
    label: '关键机制',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-300 dark:border-indigo-800',
    accent: '#6366f1',
    icon: 'Cpu',
  },
  neurochem: {
    label: '化学驱动',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-800',
    accent: '#10b981',
    icon: 'FlaskConical',
  },
  practice: {
    label: '实践方法',
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-300 dark:border-cyan-800',
    accent: '#06b6d4',
    icon: 'Flame',
  },
  biology: {
    label: '生理支柱',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-800',
    accent: '#f43f5e',
    icon: 'Activity',
  },
  paradox: {
    label: '塑性悖论',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-800',
    accent: '#a855f7',
    icon: 'AlertTriangle',
  },
};

export const NEUROPLASTICITY_MINDMAP: MindMapNode = {
  id: 'root',
  label: '《神经可塑性》',
  shortDesc: '大脑并非生来固化的机械回路，而是终身具备动态自我重构能力的生命网络',
  category: 'paradigm',
  importance: 'core',
  iconName: 'Brain',
  details: {
    summary: '神经可塑性（Neuroplasticity）指神经系统随环境、经验、认知训练及损伤而动态改变其结构与功能特性的生物学能力。颠覆了传统“成年大脑结构固定、神经元死不可再生”的机械定位论。',
    keyPrinciple: '大脑具有“用进废退”与“结构追随功能”的动态物理可塑性。经验塑造解剖，意念改变物理连接。',
    scientificExperiment: '诺曼·道伊奇（Norman Doidge）在《重塑大脑，重塑人生》中指出：过去四百年间，医学界将大脑视为不可修改的机械时钟；直到20世纪下半叶，保罗·巴赫-利塔、迈克尔·梅泽尼奇等先驱才证实了成年大脑的皮层地图在持续动态重组。',
    actionProtocol: [
      '接纳“成长型大脑思维”：任何技能与认知障碍均非先天的终身枷锁',
      '建立高强度重复与专注训练环境，启动脑区重组通道',
      '警惕习惯盲区：消极思维模式同样在物理层面被大脑神经回路所加固'
    ],
    neuroQuote: '“大脑是一座活体器官，它根据我们对其提出的要求不断改造自身的布线结构。” —— 诺曼·道伊奇',
    tags: ['脑科学', '认知重塑', '终身可塑性', '核心范式']
  },
  children: [
    {
      id: 'paradigm-shift',
      label: '一、核心范式转变',
      shortDesc: '从机械“硬接线”定位论到动态“终身重塑”网络的认知革命',
      category: 'paradigm',
      importance: 'core',
      iconName: 'Sparkles',
      details: {
        summary: '传统神经学曾认为：儿童期之后大脑神经元不再新生，各功能区像机械硬件芯片一样被死板锁定。神经可塑性研究彻底推翻了这一决定论，证明大脑在衰老至死之前都保持重连潜能。',
        keyPrinciple: '结构随经验流转：大脑是一张时刻根据外部输入重新分配带宽与计算资源的柔性自适应拓扑网络。',
        scientificExperiment: '迈克尔·梅泽尼奇（Michael Merzenich）针对猫与猫头鹰猴的听觉与触觉皮层微电极测绘，发现当某一手指长期使用时，大脑皮层对应区域迅速向外吞噬扩张邻近闲置区。',
        actionProtocol: [
          '打破“老年大脑僵化”的自我限制，保持新认知领域的终身学习',
          '理解神经可塑性是物理形态变化，而非虚幻的心理安慰'
        ],
        neuroQuote: '“大脑不是硬件，而是一台能根据自身运行软件不断重新焊接内部电线的生物计算机。”',
        tags: ['范式革命', '定位论破除', '自适应网络']
      },
      children: [
        {
          id: 'hebbian-theory',
          label: '赫布定律 (Hebbian Rule)',
          shortDesc: '“同频共振，联结强化” (Fire together, wire together)',
          category: 'paradigm',
          importance: 'core',
          iconName: 'Zap',
          details: {
            summary: '唐纳德·赫布（Donald Hebb）于1949年提出的突触强化基本假说：当轴突A反复激发神经元B时，二者之间连接效能产生增长性变化，使未来激发阈值大幅降低。',
            keyPrinciple: '同步激发的神经元，突触连接紧密联合；失去同步激发的连接，突触逐渐退化解离（Neurons out of sync, lose their link）。',
            scientificExperiment: '埃里克·坎德尔（Eric Kandel）用海兔（Aplysia）缩鳃反射实验证实了赫布假说的生物物理学实体，获2000年诺贝尔生理学或医学奖。',
            actionProtocol: [
              '将新习惯与已有的强刺激锚点进行即刻同步捆绑（习惯堆叠法）',
              '练习时保持高集中度，确保目标回路神经元产生紧密同频脉冲'
            ],
            neuroQuote: '“同频放电的神经元会紧密连接，互不相干的神经元会彼此疏远。”',
            tags: ['赫布理论', '突触强化', '神经回路']
          }
        },
        {
          id: 'critical-periods',
          label: '临界期与成年期再开启',
          shortDesc: '从童年敏感窗到成年专注驱动的“门控重塑”',
          category: 'paradigm',
          importance: 'high',
          iconName: 'Clock',
          details: {
            summary: '儿童期存在自发高可塑性的临界期（Critical Period），如语言和视力发育；而成人大脑可塑性虽然常态下被抑制性中间神经元（GABA）设限，但可通过“高度专注+神经调质激增”重新开启。',
            keyPrinciple: '儿童的可塑性是“被动吸收型”，成人的可塑性是“主动专注门控型”。成年重塑必须依仗乙酰胆碱和多巴胺的精准注视。',
            scientificExperiment: '休伯尔和威塞尔（Hubel & Wiesel）的幼猫单眼缝合实验（获诺贝尔奖）揭示了视觉剥夺临界期；后续研究发现，阻断成年猫脑中周围神经网（PNN）或提升特定神经递质，可部分重启临界期塑性。',
            actionProtocol: [
              '成人学习切勿被动听讲：必须建立高注意力驱动与错误即时反馈',
              '每次深度学习控制在75~90分钟（超昼夜节律极限），维持专注力门控开放'
            ],
            neuroQuote: '“成年人的大脑并未关闭重构大门，只是加装了一把只有高度专注才能转动的锁。”',
            tags: ['临界期', '专注门控', '成人学习']
          }
        },
        {
          id: 'neural-darwinism',
          label: '神经达尔文主义与用进废退',
          shortDesc: '皮层疆域的残酷竞争：不使用的回路即刻被邻近功能吞噬',
          category: 'paradigm',
          importance: 'high',
          iconName: 'ShieldAlert',
          details: {
            summary: '杰拉尔德·埃德尔曼（Gerald Edelman）提出神经达尔文主义：神经元与突触在大脑微环境中经历着残酷的“自然选择”。活跃回路夺取营养因子并扩张疆域，闲置回路则迅速萎缩。',
            keyPrinciple: 'Use it or Lose it（用进废退）。大脑资源极其昂贵，皮层实时进行残酷的“房地产争夺战”。',
            scientificExperiment: '将弦乐演奏者的左手手指在躯体感觉皮层上的代表区进行成像，发现其左手指尖皮层面积远超非音乐家；然而停止演奏数年后，扩张皮层会显著回退。',
            actionProtocol: [
              '关键技能需要定期建立“微量唤醒练习”，防止突触连接被修剪',
              '对想戒除的恶习：绝对停止激活旧回路，同时全力铺设新的正向替代回路'
            ],
            neuroQuote: '“在大脑的版图上，没有任何不动产是永久属于某个功能的，弱者会被迅速吞并。”',
            tags: ['用进废退', '皮层竞争', '突触优选']
          }
        }
      ]
    },
    {
      id: 'core-mechanisms',
      label: '二、大脑重塑的关键机制',
      shortDesc: '微观突触、神经递质受体、宏观皮层地图与神经元新生的四重重组',
      category: 'mechanism',
      importance: 'core',
      iconName: 'Cpu',
      details: {
        summary: '大脑重塑并非抽象概念，它发生于纳米级的分子受体增生、微米级的树突棘伸展、细胞级的神经发生、以及厘米级的脑区皮层重绘制。',
        keyPrinciple: '多尺度协同：分子信号（LTP）激活基因转录，促发突触物理增生，驱动功能代偿与髓鞘化加厚。',
        scientificExperiment: '通过双光子活体显微镜观察活体小鼠大脑，在短短数小时的学习刺激后，皮层神经元树突表面就能观察到崭新凸起的蘑菇状树突棘（Dendritic spines）。',
        actionProtocol: [
          '理解不同机制的时间尺度：突触效率改变需几分钟，物理结构生长需几天，髓鞘巩固需数月',
          '为大脑提供充足的结构重塑原料：优质睡眠、蛋白质、磷脂与微量元素'
        ],
        neuroQuote: '“重塑不是一个孤立事件，而是从纳米尺度离子通道到整叶大脑皮层的交响乐。”',
        tags: ['生物机制', '分子突触', '解剖重构']
      },
      children: [
        {
          id: 'synaptic-plasticity',
          label: '突触可塑性 (LTP & LTD)',
          shortDesc: '长时程增强与长时程抑制：信号传导效率的动态增益调节器',
          category: 'mechanism',
          importance: 'core',
          iconName: 'TrendingUp',
          details: {
            summary: '突触可塑性是大脑记忆与学习的微观基石。包括突触传递效率持久增强的长时程增强（LTP）与突触效率持久减弱的长时程抑制（LTD）。',
            keyPrinciple: '高频突触冲击促使AMPA受体大量涌向突触后膜，解除NMDA受体的镁离子阻断，使钙离子内流，永久性提升突触对递质的敏感度。',
            scientificExperiment: 'Terje Lømo在挪威兔海马穿通纤维上首次记录到LTP现象：数十赫兹的高频电刺激，让后续相同强度的刺激诱发了长达数天甚至数周的超高幅兴奋性突触后电位。',
            actionProtocol: [
              '刻意练习中制造“高难度挑战点”，以高唤醒度冲刷促发LTP',
              '练习后保持静息，让突触有时间固化蛋白质合成并稳定新增受体'
            ],
            neuroQuote: '“LTP是大脑给重要连接写下的永久备忘录，而LTD则是删除背景杂音的橡皮擦。”',
            tags: ['LTP', 'LTD', 'AMPA受体', 'NMDA受体']
          }
        },
        {
          id: 'structural-plasticity',
          label: '结构可塑性与髓鞘化 (Myelination)',
          shortDesc: '树突棘形态巨变与少突胶质细胞包裹神经纤维的“千倍加速”',
          category: 'mechanism',
          importance: 'core',
          iconName: 'Network',
          details: {
            summary: '神经可塑性不仅是电信号改变，更是物理器官重构：神经元长出新的树突分支与轴突侧支；更关键的是少突胶质细胞制造髓鞘（Myelin），像绝缘胶布包裹轴突，让跳跃式电传导速率提升多达100倍！',
            keyPrinciple: '髓鞘化是大师级技能熟练度的物理实质。刻意练习本质上是在精密包裹正确回路的髓鞘绝缘层。',
            scientificExperiment: '核磁共振弥散张量成像（DTI）对职业钢琴家大脑的研究显示：童年及少年期高强度练琴者，大脑皮层连接运动区的白质束（髓鞘密度）明显比普通人粗壮数倍。',
            actionProtocol: [
              '在学习任何新动作或知识时慢速精准练习：错误的练习同样会髓鞘化错误回路！',
              '重视欧米茄-3脂肪酸（DHA）等构成髓鞘质的重要脂质摄入'
            ],
            neuroQuote: '“髓鞘包裹着卓越：每一次精准击打和纠错，都在神经轴突上缠绕上一层致密的绝缘磷脂。”',
            tags: ['髓鞘化', '树突棘', '轴突生长', '白质纤维']
          }
        },
        {
          id: 'adult-neurogenesis',
          label: '成人神经发生 (Adult Neurogenesis)',
          shortDesc: '海马体齿状回每天诞生新神经元，终身支持情景记忆与模式分离',
          category: 'mechanism',
          importance: 'high',
          iconName: 'Layers',
          details: {
            summary: '打破“神经元一旦死亡永不可再生”教条：成体大脑的海马体齿状回（Dentate Gyrus）与脑室下区（SVZ）的神经干细胞，终身都在源源不断分化出功能完备的新神经元。',
            keyPrinciple: '新生成的神经元具有极高的可塑性阈值，能够轻松记录全新的环境特征，避免旧记忆受到灾难性遗忘干扰（模式分离能力）。',
            scientificExperiment: '彼得·埃里克森（Peter Eriksson）与弗雷德·盖奇（Fred Gage）在1998年利用BrdU（溴脱氧核苷尿嘧啶）标记技术，在成年人海马组织中确凿证实了新生神经元的存在。',
            actionProtocol: [
              '坚持有氧运动：奔跑是哺乳动物刺激海马体神经干细胞分裂的最强大自然生理信号',
              '避免慢性压力和高皮质醇：长期的应激荷尔蒙会直接杀死海马干细胞并抑制神经发生'
            ],
            neuroQuote: '“即使在你七八十岁时，海马深处依旧有鲜活的胚胎级神经干细胞等待破土而出。”',
            tags: ['神经发生', '海马体', '齿状回', '干细胞']
          }
        },
        {
          id: 'cortical-reorganization',
          label: '皮层重绘与跨模态代偿 (Cross-Modal)',
          shortDesc: '感觉替代与脑区接管：盲人的视觉皮层转为超敏触觉与听觉处理',
          category: 'mechanism',
          importance: 'high',
          iconName: 'GitFork',
          details: {
            summary: '当某个感官通道丧失或某一肢体截肢后，原本负责该区域的大脑皮层并不会闲置荒废，而是被邻近感觉或剩余感官以惊人速度“殖民接管”（跨模态重构）。',
            keyPrinciple: '大脑皮层模块并非为特定硬件（如眼睛）而专门设计，它本质上是一个“通用模式识别计算引擎”。只要有信息流注入，任何皮层都能进行解码。',
            scientificExperiment: '保罗·巴赫-利塔（Paul Bach-y-Rita）发明的触觉视觉替代装置（TVSS）：盲人戴上装有微型摄像机的头盔，图像信号转化为背部或舌尖电刺激阵列，受试者最终能通过“舌头感触”在视觉皮层中生成真实的3D空间视觉感受！',
            actionProtocol: [
              '通过多模态刺激增强学习深度：同时结合听觉、视觉、书写和口述激活更大面积皮层',
              '脑卒中等神经损伤患者务必进行功能替代训练，积极诱导健康皮层代偿接管'
            ],
            neuroQuote: '“我们不是用眼睛在看，是用大脑在看；眼睛只是一个将光波转换为动作电位的数据转码器。” —— 保罗·巴赫-利塔',
            tags: ['皮层重绘', '感觉替代', '跨模态', '巴赫利塔']
          }
        }
      ]
    },
    {
      id: 'chemical-drivers',
      label: '三、神经化学驱动与催化剂',
      shortDesc: '开启大脑可塑性重塑之锁的关键分子开关与神经调质',
      category: 'neurochem',
      importance: 'core',
      iconName: 'FlaskConical',
      details: {
        summary: '可塑性不会凭空发生。大脑重塑受到精密的神经化学环境门控。缺少这四种核心分子的参与，大脑将停留在节能钝化状态，无法启动耗费能量的解剖重构。',
        keyPrinciple: '专注定焦（乙酰胆碱）、警觉就绪（去甲肾上腺素）、奖励强化（多巴胺）以及物理生长肥料（BDNF）构成了大脑重塑的“生化四大支柱”。',
        scientificExperiment: '给成年实验动物直接注入乙酰胆碱激动剂或刺激迈内特基底核（NBM），实验动物在听取非关键频段声音时，听觉皮层会像幼崽临界期一样发生爆发性重构。',
        actionProtocol: [
          '识别自己的生化状态：无精打采时无法促发重塑，过度恐慌焦虑时则会破坏海马',
          '通过微小成就感刻意刺激多巴胺释放，锁死刚建立的成功神经路径'
        ],
        neuroQuote: '“乙酰胆碱打亮舞台聚光灯，去甲肾上腺素拉起安全警报，而BDNF则是搬入建筑工地的水泥和砖块。”',
        tags: ['神经递质', '分子催化', '生化门控']
      },
      children: [
        {
          id: 'acetylcholine',
          label: '乙酰胆碱 (Acetylcholine) - 专注之光',
          shortDesc: '基底前脑释放的微观探照灯，精确标定需重塑的突触集合',
          category: 'neurochem',
          importance: 'core',
          iconName: 'Eye',
          details: {
            summary: '当人全神贯注于某项任务时，基底前脑的迈内特基底核向大脑皮层喷射乙酰胆碱。它能抑制背景杂乱信号，特异性放大目标感受野神经元的兴奋度，开启塑性窗口。',
            keyPrinciple: '无专注，不重塑。漫不经心的重复一万次，也无法改变大脑结构；唯有伴随强专注的微量练习才能引发物理突触重组。',
            scientificExperiment: '研究对比两组受试者按琴键：一组高度专注倾听音准微小差异，另一组边看电视边机械按键。只有专注组受损皮层发生了精细地图扩张，走神组皮层无任何显著改变。',
            actionProtocol: [
              '在学习新动作或概念前进行1~2分钟的视线凝视训练（Visual gaze fixation），快速募集乙酰胆碱',
              '消除环境多任务干扰：每切换一次应用，大脑就必须重置乙酰胆碱聚光灯'
            ],
            neuroQuote: '“乙酰胆碱是大脑在目标神经元上留下的荧光标记：‘今晚睡眠时，重点加固这些突触！’”',
            tags: ['乙酰胆碱', '专注力', '聚光灯', '基底核']
          }
        },
        {
          id: 'bdnf',
          label: '脑源性神经营养因子 (BDNF) - 脑肥料',
          shortDesc: '促进突触萌发、抗凋亡并维持树突棘稳定的神奇蛋白质肥料',
          category: 'neurochem',
          importance: 'core',
          iconName: 'Sprout',
          details: {
            summary: 'BDNF被神经科学家誉为“大脑的神奇肥料（Miracle-Gro for the brain）”。它结合TrkB受体，直接刺激神经元生长突起、加速蛋白质合成、促进树突棘形态成熟并保障新神经元存活。',
            keyPrinciple: 'BDNF既是神经可塑性的前提条件，也是可塑性激活的结果。运动与学习能成倍拉升海马与皮层BDNF基因表达。',
            scientificExperiment: '在转基因敲除BDNF的小鼠脑中，LTP几乎完全消失，小鼠丧失空间迷宫记忆能力；而补充外源性BDNF后，老年动物的记忆与突触密度戏剧性逆转回年轻状态。',
            actionProtocol: [
              '每周进行3~4次20~30分钟中高强度有氧运动（心率达最大心率75%以上），迎来BDNF分泌高峰',
              '适度间歇性断食（如16:8）与桑拿浴同样能激活AMPK通路诱导BDNF升高'
            ],
            neuroQuote: '“没有BDNF的大脑就像久旱的荒地，无论你如何播撒知识的种子，突触都无法扎根发芽。”',
            tags: ['BDNF', '神经营养', '突触生长', 'TrkB']
          }
        },
        {
          id: 'dopamine',
          label: '多巴胺 (Dopamine) - 强化奖励回路',
          shortDesc: '奖励预测误差与回路固化：标记“值得大脑付出能量记住的行为”',
          category: 'neurochem',
          importance: 'high',
          iconName: 'Trophy',
          details: {
            summary: '多巴胺不仅带来愉悦，它在脑科学中是“突触标记物”。当行动结果超出预期（产生正向奖励预测误差）时，腹侧被盖区与黑质释放多巴胺，告知大脑：“刚刚的做法极其正确，立即保存该神经连接！”',
            keyPrinciple: '多巴胺能够将短暂的电生理活性（早期LTP）转化为需要基因转录和新蛋白质合成的持久物理连接（晚期LTP）。',
            scientificExperiment: '沃尔夫勒姆·舒尔茨（Wolfram Schultz）经典猴子条件反射实验：当发现刺激与果汁的意外关联时多巴胺神经元剧烈爆鸣；这股脉冲使突触对谷氨酸的响应持久增强。',
            actionProtocol: [
              '将宏大目标拆分为可达成的“微小胜利（Micro-wins）”，在完成时给予自我内在庆祝与认可',
              '避免在做枯燥而重要的事情时沉溺于高频外界多巴胺垃圾刺激（如短视频、高糖食品）'
            ],
            neuroQuote: '“多巴胺不仅驱使我们前行，它更是大脑在刚跑通的电路上浇铸的水泥防腐漆。”',
            tags: ['多巴胺', '奖励预测误差', '回路加固', '内驱力']
          }
        },
        {
          id: 'norepinephrine',
          label: '去甲肾上腺素 (Norepinephrine) - 警觉门控',
          shortDesc: '蓝斑核释放的警觉信使：制造适度紧迫感与微小挫折驱动的快速重组',
          category: 'neurochem',
          importance: 'high',
          iconName: 'AlertCircle',
          details: {
            summary: '来自脑干蓝斑核（Locus Coeruleus）。当个体遇到新异刺激、犯错或处于适度挑战边界时被激发，提升皮层信噪比，使突触处于高度敏化的可塑状态。',
            keyPrinciple: '没有摩擦力就没有改变。在练习中感受到的“吃力感”和“犯错感”，正是去甲肾上腺素在释放信号：当前回路存在缺陷，必须立刻调整重塑！',
            scientificExperiment: '研究发现：在完全轻松无错误的顺畅练习下，大脑重塑速度极慢；而在错误率保持在15%左右的适度挫折挑战区间（Sweet spot），大脑蓝斑核释放最佳水平去甲肾上腺素，技能习得速度提升最快。',
            actionProtocol: [
              '将“练习中的犯错与挫败感”重新定义为神经系统正在破旧立新的生理重塑信号',
              '维持最佳唤醒度：既不昏昏欲睡（去甲肾过低），也不惊恐失措（去甲肾过高过载）'
            ],
            neuroQuote: '“那种让你抓耳挠腮、感到吃力的微小阻力，正是大脑神经元被电钻重新开孔的声音。”',
            tags: ['去甲肾上腺素', '蓝斑核', '犯错驱动', '适应性压力']
          }
        }
      ]
    },
    {
      id: 'practical-methods',
      label: '四、实践方法与落地工具箱',
      shortDesc: '基于神经可塑性原理的临床康复、习惯改写与超速技能习得方法论',
      category: 'practice',
      importance: 'core',
      iconName: 'Flame',
      details: {
        summary: '《神经可塑性》书中不仅讲述理论，更展示了爱德华·陶布的强制诱导疗法、拉马钱德兰的镜箱疗法、诺曼·道伊奇的认知重置法等彻底改变传统康复学与人类潜能的伟大实践。',
        keyPrinciple: '有针对性、高频次、渐进超负荷、富含错误反馈与主动意图的系统性训练，能够重塑任意可测脑区。',
        scientificExperiment: '爱德华·陶布（Edward Taub）创立的约束诱导运动疗法（CIMT），将中风偏瘫患者原本完好的手臂用吊带完全绑住，强迫患者在数周内只能用瘫痪的患侧手去拿水杯、写字，结果患者多年沉寂的死寂神经回路被彻底唤醒，大脑运动皮层面积爆发式倍增！',
        actionProtocol: [
          '识别自己的“习得性废用”行为，强迫跳出舒适区激活沉睡脑区',
          '运用意念演练配合身体实践，将重塑效能放大数倍'
        ],
        neuroQuote: '“大脑最可怕的退化不是外伤造成的，而是因患者‘放弃尝试’而发生的自发性皮层萎缩。” —— 爱德华·陶布',
        tags: ['实践工具', '临床干预', '习惯改写', '超速学习']
      },
      children: [
        {
          id: 'deliberate-practice',
          label: '刻意练习与微小错误修正 (Deliberate Practice)',
          shortDesc: '处于能力边界边缘的痛苦击打：利用高频反馈重塑脑区拓扑',
          category: 'practice',
          importance: 'core',
          iconName: 'Target',
          details: {
            summary: '安德斯·埃里克森（Anders Ericsson）的刻意练习理论在脑科学中的解释：在大脑舒适区之外的高精细度微观操作，强迫大脑打破原有自动化回路，重新在神经元级别进行微米级重新布线。',
            keyPrinciple: '自动化是大脑可塑性的终点。要继续重塑大脑，必须主动拆解熟练动作，制造“微小不适感与精确纠错”。',
            scientificExperiment: '对伦敦出租车司机的脑结构磁共振研究（Maguire et al.）：为了通过严苛的“The Knowledge”复杂街道考核，司机经过3~4年刻意背诵路线，其负责空间认知的大脑后海马体积明显增厚，且增厚程度与驾龄呈正比。',
            actionProtocol: [
              '拆解大任务为单一微动作进行孤立重击，每次练习仅专注修正一个具体错误',
              '建立即时录像或客观数据反馈机制，不给大脑模糊自欺欺人的空间'
            ],
            neuroQuote: '“机械重复一万小时只会强化平庸；唯有一万次带纠错的精确击打，才能在皮层刻下大师印记。”',
            tags: ['刻意练习', '错误修正', '伦敦出租车', '海马增厚']
          }
        },
        {
          id: 'mental-practice',
          label: '心理模拟与意念演练 (Mental Practice)',
          shortDesc: '纯粹想象动作就能改变大脑运动皮层结构与肌肉激活信号',
          category: 'practice',
          importance: 'core',
          iconName: 'Compass',
          details: {
            summary: '大脑在“生动想象执行某个动作”与“实际身体执行该动作”时，激活的运动辅助区、小脑和运动皮层几乎完全重叠。纯粹的意念演练就能促发物理突触的重构与髓鞘化加厚。',
            keyPrinciple: '神经系统无法彻底区分生动逼真的内心演练与外部真实体验。心智构想能够直接作为物理重塑的输入信号。',
            scientificExperiment: '阿尔瓦罗·帕斯夸尔-莱昂内（Alvaro Pascual-Leone）著名的五指弹琴实验：一组人每天真实练习弹钢琴2小时；另一组人仅闭眼在脑中生动想象手指按键2小时。5天后脑图谱显示：纯意念想象组的运动皮层扩张幅度，与真实动手练习组几乎完全一样！',
            actionProtocol: [
              '在公开演讲、体育竞赛或困难谈话前，进行10分钟闭目第一人称细节意念演练（需包含肌肉发力感和环境感触）',
              '结合真实练习与意念演练：练习5分钟 -> 意念回放1分钟 -> 再次练习，大幅加速学习'
            ],
            neuroQuote: '“思想本身就是一种物理力量，思考就是在用肉眼不可见的雕刻刀重削我们大脑的结构。” —— 诺曼·道伊奇',
            tags: ['意念演练', '运动皮层', '帕斯夸尔莱昂内', '心理模拟']
          }
        },
        {
          id: 'cimt-therapy',
          label: '约束诱导疗法与克服“习得性废用” (CIMT)',
          shortDesc: '强行阻断代偿补偿通道，逼迫沉睡萎缩的患侧神经回路死地求生',
          category: 'practice',
          importance: 'high',
          iconName: 'Lock',
          details: {
            summary: '许多中风患者并非永远丧失了手部神经功能，而是在生病初期由于手不听使唤感到挫败，转而只用好手，导致大脑运动皮层彻底发生“习得性废用（Learned Nonuse）”。CIMT通过物理捆绑好手，强行重启患侧回路。',
            keyPrinciple: '阻断容易的退路，是迫使大脑进行神经重塑最高效的生存逼迫。没有逃避选项时，突触重构效率呈指数级上升。',
            scientificExperiment: '爱德华·陶布的猕猴神经根切断实验与后续针对人类脑卒中患者的双盲临床试验证明：即使瘫痪长达数年甚至十数年的老年患者，在两周的CIMT极限强制使用下，受损肢体运动功能也得到了奇迹般的巨大恢复。',
            actionProtocol: [
              '在学习或戒除不良习惯时，建立“物理隔绝与强制约束”机制（如写重要报告时彻底断网或将手机锁入定时盒）',
              '主动用非惯用手进行刷牙、拿筷子等日常活动，刺激大脑两侧半球突触平衡重组'
            ],
            neuroQuote: '“大脑极度务实：如果你能轻松找到绕过困难的拐杖，它就永远不会浪费力气修补损坏的道路。”',
            tags: ['CIMT', '习得性废用', '强制使用', '爱德华陶布']
          }
        },
        {
          id: 'habit-override',
          label: '习惯回路旁路替换 (Habit Circuit Override)',
          shortDesc: '不要试图硬生生“删除”旧回路，而是在旧触发点上搭建新突触旁路',
          category: 'practice',
          importance: 'high',
          iconName: 'GitCommit',
          details: {
            summary: '已形成的神经回路在解剖学上被高度髓鞘化，强行用意志力“消除回路”几乎是不可能的（越压抑越激活）。大脑重塑的有效策略是：保留原有线索（Cue）和奖赏（Reward），在基底神经节建立崭新的惯常行为（Routine）替代旁路。',
            keyPrinciple: '你无法删除一条已经通车的神经高速公路，但你可以修一条更平坦、多巴胺更丰厚的高铁旁路，让旧公路因无人问津而自然长草荒废。',
            scientificExperiment: '麻省理工学院安·格雷比尔（Ann Graybiel）对大鼠纹状体习惯回路的神经元单胞记录研究：习惯回路一旦形成，即使行为被意志压制，只要原有触发刺激出现，旧神经回路仍会瞬间爆鸣；唯有长期强化新动作，新突触才会接管控制权。',
            actionProtocol: [
              '列出恶习触发线索（如焦虑、无聊、特定时间地点），明确定义替代性健康动作（如深吸气3次+喝一杯温水）',
              '当渴望涌现时默数15秒，等待前额叶皮层接管冲动的杏仁核'
            ],
            neuroQuote: '“重塑不是消灭过去，而是用一条更快、更闪耀的全新神经道路将旧路遗忘在历史尘埃中。”',
            tags: ['习惯替换', '基底节', '旁路理论', '意志力替代']
          }
        },
        {
          id: 'exposure-reconsolidation',
          label: '暴露疗法与记忆再巩固阻断 (Reconsolidation)',
          shortDesc: '回忆处于激活不稳定状态时的短暂塑性窗口，彻底覆写创伤与恐惧反应',
          category: 'practice',
          importance: 'high',
          iconName: 'Shield',
          details: {
            summary: '记忆并非像电脑文件一样刻录在硬盘中。每次提取一段长期记忆时，该记忆神经元网络会被暂时“解冻”，进入长达数小时的不稳定可塑窗口（再巩固期）；此时若注入新的安全信息或阻断蛋白质合成，原有的恐惧与创伤情绪将被彻底剥离重写。',
            keyPrinciple: '回忆即重写。每一次提取记忆，都是大脑对其进行神经化学修润与重新编码的可塑契机。',
            scientificExperiment: '约瑟夫·勒杜（Joseph LeDoux）与卡里姆·纳德（Karim Nader）的恐惧记忆再巩固阻断实验：在给大鼠播放引起恐惧电击的声音后，记忆被唤醒，立即注射蛋白质合成抑制剂，大鼠对该声音的恐惧记忆彻底永久蒸发。',
            actionProtocol: [
              '在安全舒适、心率平缓的环境下，主动重温曾经引发焦虑或挫败的情境，将“安全放松的生理信号”与旧记忆重新绑定',
              '通过书写叙事疗法反复重构挫折经历，剥离杏仁核的恐慌反应，赋予前额叶认知理解'
            ],
            neuroQuote: '“记忆不是静止的照片，而是一部只要被放映出来、就可以即兴重新剪辑并覆写的活体胶片。”',
            tags: ['记忆再巩固', '暴露疗法', '创伤消除', '恐惧消退']
          }
        }
      ]
    },
    {
      id: 'biological-pillars',
      label: '五、生理支柱与生物学优化',
      shortDesc: '大脑重塑的物质燃料：睡眠修剪、有氧运动、正念减压与环境丰富化',
      category: 'biology',
      importance: 'core',
      iconName: 'Activity',
      details: {
        summary: '神经可塑性是一项极度耗能的细胞级重体力活。大脑如果缺乏充足的睡眠、心肺血液循环营养与低皮质醇内环境，任何认知训练都如同无米之炊，无法完成物理突触的新生与固化。',
        keyPrinciple: '白天在意识中“施加压力与刺激标记”，夜晚在潜意识慢波睡眠中“完成物理突触固化与结构修剪”。重塑的实质发生于休息之中。',
        scientificExperiment: '朱利奥·托诺尼（Giulio Tononi）与齐亚拉·奇雷利（Chiara Cirelli）提出的突触稳态假说（SHY）：在清醒学习期间，大脑突触总连接强度不断攀升耗竭能量；唯有在深度慢波睡眠中，大脑才会进行全局性突触等比例修剪，保留最关键连接，消除弱噪点连接。',
        actionProtocol: [
          '将睡眠视作学习闭环不可分割的最后50%部分，缺失睡眠等于白费白天的一切刻意练习',
          '把运动置于重要脑力学习的前后一小时内，享受运动诱发的即时神经生化红利'
        ],
        neuroQuote: '“白天我们播下神经重塑的种子，唯有在深邃黑夜的睡眠梦境中，大脑才悄然将水泥浇筑坚固。”',
        tags: ['生理支柱', '睡眠固化', '有氧运动', '正念冥想']
      },
      children: [
        {
          id: 'aerobic-exercise',
          label: '有氧运动与抗阻训练 (Exercise & Neurogenesis)',
          shortDesc: '心率飙升带动骨骼肌释放鸢尾素与乳酸，穿透血脑屏障催化BDNF狂飙',
          category: 'biology',
          importance: 'core',
          iconName: 'Flame',
          details: {
            summary: '运动被神经生物学界公认为目前唯一能确凿增加海马体体积并成倍提升神经元新生率的天然非药物干预手段。运动时肌肉分泌鸢尾素（Irisin）和组织蛋白酶B，刺激脑内BDNF合成与血管新生（VEGF）。',
            keyPrinciple: '大脑进化为在奔跑探索与解决生存危机中学习。身体处于运动状态时，大脑默认进入最高等级的可塑适应状态。',
            scientificExperiment: '亚瑟·克雷默（Arthur Kramer）对老年人大脑进行的随机对照实验：每周进行3次有氧快走锻炼6个月的老年人，其大脑前额叶皮层和海马体体积增加了1%~2%，逆转了相当于1~2年的年龄相关性脑萎缩！',
            actionProtocol: [
              '在复杂脑力工作或重要课程前安排20分钟中高强度跑步或划船，创造最佳学习脑生化状态',
              '将步行融入日常工作流中（Walking meetings），提升发散性创造突触连接效率'
            ],
            neuroQuote: '“想要拥有敏锐聪明、易于重塑的大脑，你必须先让心脏有力的把富氧血液泵入头颅。” —— 约翰·瑞梯（《运动改造大脑》）',
            tags: ['有氧运动', '海马体积', '鸢尾素', '血管新生']
          }
        },
        {
          id: 'sleep-synaptic-homeostasis',
          label: '慢波睡眠与突触修剪 (Sleep & Synaptic Homeostasis)',
          shortDesc: '非快速眼动睡眠消减全脑杂乱突触，REM睡眠串联新旧记忆拓扑',
          category: 'biology',
          importance: 'core',
          iconName: 'Moon',
          details: {
            summary: '清醒时大脑突触过度饱和，不仅能耗过大，更会使突触无法容纳新信息。慢波深度睡眠（SWS）启动突触修剪，弱化无效突触，把海马体白天的临时信息转存至大脑皮层的永久存储库中。',
            keyPrinciple: '重塑不仅是“做加法”，更重要的是在睡眠中精准“做减法”。没有夜间修剪，大脑神经网将陷入癫痫般的过度拥塞。',
            scientificExperiment: '马修·沃克（Matthew Walker）实验室实验：剥夺受试者一晚睡眠后，海马体学习新事实的能力断崖式下跌近40%；脑电图显示，睡眠纺锤波（Sleep spindles）密度直接预测了第二天可塑性强度的恢复水平。',
            actionProtocol: [
              '保持规律就寝时间，睡前60分钟避免蓝光照射以保护褪黑素正常峰值',
              '深度用脑后若无法入睡，可进行20分钟NSDR（非睡眠深度休息 / 瑜伽凝神），获得突触重置效果'
            ],
            neuroQuote: '“睡眠是大脑的清洁工与雕塑师：它清除代谢垃圾（类淋巴系统），并把粗糙的神经泥塑雕琢成杰作。”',
            tags: ['深度睡眠', '突触稳态', '记忆巩固', '类淋巴系统']
          }
        },
        {
          id: 'mindfulness-stress',
          label: '正念冥想与逆转皮质醇损伤 (Mindfulness & Stress Reset)',
          shortDesc: '缩小过度肥大活跃的杏仁核，增厚理性前额叶皮层与海马神经元密度',
          category: 'biology',
          importance: 'high',
          iconName: 'Smile',
          details: {
            summary: '长期慢性压力分泌的高浓度皮质醇是神经突触的剧毒毒药，它能直接导致海马神经元树突回缩萎缩。而正念冥想训练能够有效降低交感神经兴奋，重建前额叶对下丘脑-垂体-肾上腺轴（HPA轴）的抑制控制。',
            keyPrinciple: '心智训练不仅改变情绪主观感受，更能物理改变情绪调节脑区的灰质密度。',
            scientificExperiment: '萨拉·拉扎尔（Sara Lazar）哈佛大学团队对8周正念减压训练（MBSR）受试者进行核磁共振扫描发现：受试者负责恐惧与焦虑的杏仁核灰质密度显著减少，而负责共情和学习的海马及岛叶灰质密度显著增加。',
            actionProtocol: [
              '每天早晨或工作间隙进行8~15分钟专注呼吸练习，一旦察觉思绪游离，温柔地将注意力拉回鼻息',
              '遇到急性压力时采用“生理性叹气”（两次短促深吸气+一次长而彻底的呼气），立即减缓心率'
            ],
            neuroQuote: '“正念不是什么玄学，它是为长期处于应激过载的大脑安装前额叶理性刹车片的物理体操。”',
            tags: ['正念冥想', '杏仁核萎缩', '皮质醇', '灰质密度']
          }
        },
        {
          id: 'environmental-enrichment',
          label: '环境丰富化与新奇性刺激 (Environmental Enrichment)',
          shortDesc: '打破单调日常：学习外语、乐器、探索陌生路线促发突触爆发性分支',
          category: 'biology',
          importance: 'high',
          iconName: 'Globe',
          details: {
            summary: '将实验动物置于充满转轮、迷宫、复杂玩具和同伴的丰富环境（Enriched Environment）中，其大脑皮层重量增加，突触分支密度增加25%以上。单调重复的环境则是可塑性的大敌。',
            keyPrinciple: '新奇性（Novelty）是大脑最好的防老良药。面对未知挑战时，大脑会瞬间切断自动化惯性，全脑激活可塑性储备。',
            scientificExperiment: '大卫·斯诺登（David Snowdon）著名的修女脑研究（Nun Study）：终身保持高阅读量、热衷智力谜题和社交互动的修女，死后脑解剖发现其大脑早已布满阿尔茨海默病典型的淀粉样蛋白斑块，但在生前却从未表现出任何认知失智症状——庞大的神经元突触储备代偿了器质性损伤！',
            actionProtocol: [
              '每年至少掌握一项跨领域的全新肢体或智力技能（如滑雪、击剑、素描、编程、第二外语）',
              '日常通勤偶尔走一条从未走过的弯道，强迫大脑网格细胞与海马体绘制新地图'
            ],
            neuroQuote: '“丰富多彩的经历为大脑铸造了一道坚不可摧的认知储备长城，连阿尔茨海默病也难以轻易攻破。”',
            tags: ['环境丰富化', '新奇性', '认知储备', '修女研究']
          }
        }
      ]
    },
    {
      id: 'plastic-paradox',
      label: '六、可塑性的双刃剑与消极重塑',
      shortDesc: '可塑性悖论（The Plastic Paradox）：成瘾、幻肢痛、慢性疼痛与负面死循环',
      category: 'paradox',
      importance: 'high',
      iconName: 'AlertTriangle',
      details: {
        summary: '神经可塑性是一把中立的物理雕刻刀。它能让你练就高超技能，也能以同样的无情效率将焦虑、强迫症、成瘾、幻肢痛和慢性疼痛死死焊接在大脑的深层神经网络中。',
        keyPrinciple: 'The Plastic Paradox（可塑性悖论）：正是赋予我们巨大适应与学习能力的大脑可塑性，也让我们极易陷入习惯的坚固牢笼中不可自拔。',
        scientificExperiment: '维拉亚努尔·拉马钱德兰（V.S. Ramachandran）对截肢幻肢痛患者的研究：患者手臂虽然消失，但大脑躯体感觉皮层对应的手臂地图依然存在，并由于失去输入产生疯狂异常放电，被面部神经重组接管，导致患者甚至在摸脸时感到截掉的手指剧痛。拉马钱德兰发明的“镜箱疗法”利用视觉假象成功解除了大脑的错误痛苦映射！',
        actionProtocol: [
          '对反复出现的消极思维反刍（Rumination）保持极度警惕：每一次反刍都在加固抑郁焦虑的物理神经回路',
          '对慢性疼痛进行脑科学认知教育：理解很多非器质性慢性疼痛是大脑皮层敏化的“习得性错误警报”'
        ],
        neuroQuote: '“我们所具有的可塑性，既能让我们灵活自如地适应世界，也能让我们在痛苦的泥潭中越陷越深。” —— 诺曼·道伊奇',
        tags: ['可塑性悖论', '幻肢痛', '拉马钱德兰', '镜箱疗法', '中枢敏化']
      },
      children: [
        {
          id: 'phantom-limb',
          label: '幻肢痛与皮层混乱映射 (Phantom Limb & Mirror Therapy)',
          shortDesc: '失去肢体后的皮层空白区被面部侵入：用镜箱欺骗大脑解开痉挛记忆',
          category: 'paradox',
          importance: 'high',
          iconName: 'Maximize2',
          details: {
            summary: '截肢患者常感到已被切除的肢体存在剧烈攥紧甚至嵌入手掌的剧痛。这是由于大脑运动区仍在发送发力指令，却永远收不到本体感觉反馈，大脑陷入无限死循环并加剧信号强度。',
            keyPrinciple: '神经可塑性导致了皮层感觉地图的交叠混乱；反过来，利用可塑性的跨模态重构能力（视觉欺骗），又可以巧妙重写解脱这一痛苦回路。',
            scientificExperiment: '拉马钱德兰在桌上竖一面镜子，患者将健康的完整手放一侧，残肢放另一侧，通过镜子反射看起来就像那只截除的手重新完好无损地张开放松。患者看着镜子，持续数年无法舒展的幻肢剧痛奇迹般当场彻底消除！',
            actionProtocol: [
              '在应对神经病理性疼痛或创伤应激时，善于利用视觉反馈镜像与多模态感知打破大脑死结',
              '理解感知是大脑做出的“最佳假设推断”，而非客观绝对现实'
            ],
            neuroQuote: '“镜箱疗法堪称神经科学史上的奇迹：一块几十块钱的镜子，胜过了一切昂贵的镇痛麻醉剂。”',
            tags: ['幻肢痛', '镜箱疗法', '感知重构', '拉马钱德兰']
          }
        },
        {
          id: 'central-sensitization',
          label: '慢性疼痛的神经敏化 (Central Sensitization)',
          shortDesc: '当急性疼痛愈合后，神经系统仍将警报阈值锁死在最高灵敏度',
          category: 'paradox',
          importance: 'high',
          iconName: 'ZapOff',
          details: {
            summary: '很多长期腰背痛或纤维肌痛患者的身体组织早已痊愈，但疼痛却依然剧烈。这是因为脊髓背角和大脑感觉皮层对疼痛信号形成了类似LTP的长期增强记忆——大脑学会了如何产生疼痛！',
            keyPrinciple: '慢性疼痛往往是大脑回路的“过度学习”。神经可塑性把原本用来保护机体的警报铃，雕刻成了无法关停的噪音回音室。',
            scientificExperiment: '功能性磁共振（fMRI）对比研究表明：急性疼痛主要激活躯体感觉皮层（痛感定位），而慢性疼痛激活区域逐渐转移至内侧前额叶和伏隔核等情感与痛苦认知网络，疼痛转化为了深层情绪记忆。',
            actionProtocol: [
              '采用疼痛神经科学教育（PNE）：明白“痛感并不等同于身体组织正在受损”，降低警报恐惧',
              '渐进式暴露运动：在无威胁情绪下缓慢活动身体，重新校准大脑皮层的痛苦阈值'
            ],
            neuroQuote: '“疼痛不是身体受损的温度计，而是大脑基于所有信念、恐惧和过去记忆所做出的风险预测警报。”',
            tags: ['中枢敏化', '慢性疼痛', '疼痛记忆', '疼痛教育']
          }
        },
        {
          id: 'addiction-circuits',
          label: '成瘾与消极强迫回路 (Addiction & Maladaptive Plasticity)',
          shortDesc: '高频超级刺激将多巴胺回路深深刻铸，正常日常奖赏彻底钝化',
          category: 'paradox',
          importance: 'high',
          iconName: 'Repeat',
          details: {
            summary: '成瘾（药物、赌博、网络短视频、色情）是神经可塑性被恶意劫持的典型恶果。超生理水平的多巴胺洪流促使伏隔核多巴胺D2受体代偿性大幅下调，同时将触发冲动的神经突触焊接得坚不可摧。',
            keyPrinciple: '成瘾回路是学习能力的病理化升级：大脑太擅长重塑自身，以至于把毁灭自身的行为当作最高优先级的生存技能熟练掌握。',
            scientificExperiment: '诺拉·沃尔科夫（Nora Volkow）对成瘾者大脑的正电子发射断层扫描（PET）证实：成瘾者大脑纹状体的多巴胺受体数量显著干瘪，前额叶对冲动控制的代谢率大幅衰退。但经过数月彻底戒断后，神经突触受体能够重新生长复原。',
            actionProtocol: [
              '实施多巴胺重置（Dopamine Detox）：切断超级人造刺激至少2~4周，让突触后膜D2受体重新萌发',
              '打破即刻满足回路，重塑对“延迟满足与长半衰期成就”的敏感神经元网络'
            ],
            neuroQuote: '“成瘾就是神经系统按照赫布定律一丝不苟执行的悲剧：你重复什么，大脑就忠实地成为什么。”',
            tags: ['成瘾重塑', '多巴胺受体', '伏隔核', '多巴胺重置']
          }
        }
      ]
    }
  ]
};

export const PRESET_PRACTICE_PROTOCOLS: PracticeProtocol[] = [
  {
    id: 'protocol-focus-window',
    title: '90分钟专注门控协议 (Ultradian Rewiring Block)',
    category: '突触重塑 / 技能习得',
    difficulty: '入门',
    timeEstimate: '90 分钟',
    neuroscientificRationale: '利用人类90分钟超昼夜节律（Ultradian cycle）。前期由去甲肾上腺素提升警觉，中期乙酰胆碱高密度打亮专注聚光灯促发LTP，末期保持静息防止逆向修剪。',
    steps: [
      '第0-5分钟：消除所有通知，双眼凝视墙壁或屏幕单一黑点60秒，快速募集基底核乙酰胆碱；',
      '第5-75分钟：进行高强度、处于能力边界的刻意练习（容忍15%左右的失误与阻力感）；',
      '第75-90分钟：立即停手，严禁刷手机或处理杂务，闭目静坐或散步10分钟，让突触电信号平稳转换为早期蛋白质合成。'
    ],
    keyMolecules: ['乙酰胆碱 (ACh)', '去甲肾上腺素 (NE)', '谷氨酸'],
    isCompleted: false,
  },
  {
    id: 'protocol-exercise-bdnf',
    title: '运动-BDNF学习协同协议 (Exercise-Induced Neurogenesis)',
    category: '生理优化 / 神经发生',
    difficulty: '核心',
    timeEstimate: '45 分钟',
    neuroscientificRationale: '中高强度有氧运动促使骨骼肌释放鸢尾素并穿透血脑屏障，刺激海马体释放海量BDNF神经营养因子，在运动后提供长达2小时的黄金可塑性窗口。',
    steps: [
      '第1步：进行20分钟中高强度有氧运动（间歇冲刺或快跑，心率达到最大心率75%~85%）；',
      '第2步：补水及简单碳水化合物/电解质，稍事擦汗并平稳呼吸5分钟；',
      '第3步：在运动结束后的20~60分钟内，立刻开始当天最困难的抽象概念学习或新运动技能练习，乘着高浓度BDNF东风扎根突触。'
    ],
    keyMolecules: ['BDNF', '鸢尾素 (Irisin)', 'VEGF (血管内皮生长因子)'],
    isCompleted: false,
  },
  {
    id: 'protocol-mental-practice',
    title: '意念演练-皮层重构协议 (Pascual-Leone Motor Imagery)',
    category: '心智模拟 / 技能精进',
    difficulty: '进阶',
    timeEstimate: '15 分钟',
    neuroscientificRationale: '帕斯夸尔-莱昂内实验证实：生动的心理意象能以与物理动作相同的保真度激活初级运动皮层与小脑，促发突触前膜生长与白质纤维髓鞘化。',
    steps: [
      '第1步：找安静环境闭目，做3次生理性叹气使副交感神经占优；',
      '第2步：以第一人称视角（从自己的眼睛看出去，而非第三人称旁观）极其缓慢而精细地在脑中回放目标动作；',
      '第3步：用心感受每一个手指、发力肌群甚至空气阻力的细节感知，每次回放修正脑海中出现的微小偏差，连续做5组。'
    ],
    keyMolecules: ['运动皮层突触后电位', '小脑浦肯野细胞'],
    isCompleted: false,
  },
  {
    id: 'protocol-habit-bypass',
    title: '坏习惯旁路消退协议 (Hebbian Habit Loop Override)',
    category: '习惯改写 / 抑制重塑',
    difficulty: '进阶',
    timeEstimate: '持续 21 天',
    neuroscientificRationale: '赫布定律证明“不使用的回路会逐渐解离”，但旧回路无法被意志力直接擦除。唯有为旧有线索（Cue）无缝嫁接低摩擦、高多巴胺的新惯常行为，才能使旧突触自然荒废。',
    steps: [
      '第1步：精确捕捉触发恶习的微小生理前兆（如感到胸闷、手指无意识摸手机、特定时间点）；',
      '第2步：强行插入“15秒神圣暂停”：心中默数15秒，等待前额叶皮层从基底节惯性中夺回控制权；',
      '第3步：立即执行预先设计好的替代动作（如做10个深蹲、大口饮水、嚼薄荷糖），完成后主动对自己赞叹微笑，释放内源性多巴胺锁死新路径。'
    ],
    keyMolecules: ['多巴胺 (Dopamine)', '前额叶谷氨酸能投射', 'GABA抑制性中间神经元'],
    isCompleted: false,
  },
  {
    id: 'protocol-sleep-pruning',
    title: '慢波睡眠突触稳态协议 (Synaptic Pruning & Consolidation)',
    category: '生理优化 / 稳态修剪',
    difficulty: '入门',
    timeEstimate: '夜间执行',
    neuroscientificRationale: '根据朱利奥·托诺尼突触稳态假说，深度慢波睡眠负责全面修剪弱连接，REM睡眠负责将记忆整合至新皮质大拓扑中。缺少慢波睡眠会导致突触信噪比严重劣化。',
    steps: [
      '睡前90分钟洗温水澡或泡脚，促进核心体温下降1~2度诱导深度睡眠脑电波；',
      '关闭顶灯，仅保留低矮温暖光源，禁止在床上浏览强刺激信息；',
      '睡前花3分钟手写下明天最关键的1项任务，将前额叶工作记忆卸载，避免夜间持续消耗脑神经元。'
    ],
    keyMolecules: ['腺苷 (Adenosine)', '生长激素', '褪黑素'],
    isCompleted: false,
  }
];
