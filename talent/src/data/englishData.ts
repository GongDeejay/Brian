export const ENGLISH_QUESTIONS: Record<
  number,
  {
    title: string;
    scenario: string;
    academicAnchor: string;
    options: { label: string; score: number; description: string }[];
  }
> = {
  // Dimension 1: naturalEase (1 - 4)
  1: {
    title: "Intuitive Grasp & Low Friction",
    scenario: "When encountering new knowledge, tools, or complex workflows, you often feel 'This is so obvious!', whereas peers around you find the learning curve steep and daunting.",
    academicAnchor: "Naval's Specific Knowledge - Feels like play to you, but work to others",
    options: [
      { label: "Strongly Disagree", score: 1, description: "I rarely experience this; learning new things usually feels harder for me" },
      { label: "Disagree", score: 2, description: "Occasional sparks, but most domains require laborious effort" },
      { label: "Neutral", score: 3, description: "True in a few specific preferred areas" },
      { label: "Agree", score: 4, description: "Friends and colleagues frequently comment on how quickly I pick things up" },
      { label: "Strongly Agree", score: 5, description: "Distinctly true; I intuit structural logic almost instantaneously" },
    ],
  },
  2: {
    title: "Spontaneous Untutored Growth",
    scenario: "Looking back, there are skills you never received formal academic schooling for, yet when handed the task, your instinct produced results well above average.",
    academicAnchor: "Gallup 'Grow' Element - Natural synaptic wiring advantage",
    options: [
      { label: "Strongly Disagree", score: 1, description: "I need rigid, formal instruction to reach a passing grade" },
      { label: "Disagree", score: 2, description: "Things done on intuition tend to have obvious flaws" },
      { label: "Neutral", score: 3, description: "A slight intuition occasionally emerges" },
      { label: "Agree", score: 4, description: "In certain realms, even my self-taught methods outperform standard training" },
      { label: "Strongly Agree", score: 5, description: "Entirely true; my most reliable craft developed purely through autodidactic curiosity" },
    ],
  },
  3: {
    title: "The Common Sense Bias (Privilege of Ease)",
    scenario: "Others marvel at your meticulous handling of something (e.g. dissecting core problems, color harmony, emotional nuances, data models), but inside you think 'Isn't this just basic common sense?'",
    academicAnchor: "Tacit Knowledge - What feels ordinary to you is inaccessible territory to others",
    options: [
      { label: "Strongly Disagree", score: 1, description: "I am acutely conscious that every output costs enormous struggle" },
      { label: "Disagree", score: 2, description: "Rarely do others praise things I did casually" },
      { label: "Neutral", score: 3, description: "Happened once or twice, but not consistently" },
      { label: "Agree", score: 4, description: "Often feel that peers unnecessarily overcomplicate simple issues" },
      { label: "Strongly Agree", score: 5, description: "Constantly true; what feels like bare instinct to me bewilders others" },
    ],
  },
  4: {
    title: "Childhood Unencumbered Exploration",
    scenario: "In early youth or childhood, free of exams or parental expectations, you could spontaneously spend hours or months tinkering with something (blocks, world-building, drawing, disassembling devices, game rules).",
    academicAnchor: "Developmental Aptitude - Unpruned primal curiosity before societal conditioning",
    options: [
      { label: "Strongly Disagree", score: 1, description: "No deep self-directed obsessions as a child; just went with the flow" },
      { label: "Disagree", score: 2, description: "Passions were fleeting and fizzled out rapidly" },
      { label: "Neutral", score: 3, description: "Vague hobbies, but nothing thoroughly investigated" },
      { label: "Agree", score: 4, description: "Distinctly recall one or two realms I was intensely immersed in" },
      { label: "Strongly Agree", score: 5, description: "Profoundly true; those early explorations remain the foundational substrate of my mind" },
    ],
  },

  // Dimension 2: energyFlow (5 - 8)
  5: {
    title: "Energy Replenishment Paradox",
    scenario: "After spending 3-4 uninterrupted hours on a specific type of task, you walk away feeling intellectually refreshed and energized, rather than depleted.",
    academicAnchor: "Gallup 'Need' Dimension & Psychological Energy Audit",
    options: [
      { label: "Strongly Disagree", score: 1, description: "Any 3-hour focus exhausts me completely" },
      { label: "Disagree", score: 2, description: "Usually feel drained regardless of the task" },
      { label: "Neutral", score: 3, description: "Neutral; neither particularly energized nor exhausted" },
      { label: "Agree", score: 4, description: "Specific creative or analytical challenges distinctly revitalize me" },
      { label: "Strongly Agree", score: 5, description: "Fully resonant; working on my zone of genius is my greatest source of vitality" },
    ],
  },
  6: {
    title: "Temporal Disorientation & Flow",
    scenario: "When absorbed in creating, organizing, debugging, or writing, you frequently forget hunger, thirst, or bathroom breaks, only realizing hours have flown by in a blink.",
    academicAnchor: "Mihaly Csikszentmihalyi's Flow State - Loss of self-consciousness and time dilation",
    options: [
      { label: "Strongly Disagree", score: 1, description: "I am always acutely aware of time and constantly check the clock" },
      { label: "Disagree", score: 2, description: "Rarely lose sense of time during work or study" },
      { label: "Neutral", score: 3, description: "Occasional brief flow states, but easily interrupted" },
      { label: "Agree", score: 4, description: "Regularly experience deep absorption when working on engaging problems" },
      { label: "Strongly Agree", score: 5, description: "A frequent hallmark of my best work sessions" },
    ],
  },
  7: {
    title: "Spontaneous Off-Hours Contemplation",
    scenario: "While showering, commuting, or before falling asleep, your brain naturally and happily muses over solutions, designs, or metaphors related to this field without any external pressure.",
    academicAnchor: "Default Mode Network (DMN) - Unprompted cognitive resource allocation",
    options: [
      { label: "Strongly Disagree", score: 1, description: "I shut off completely once off the clock and never ponder work" },
      { label: "Disagree", score: 2, description: "Only think about it when anxious about pending deadlines" },
      { label: "Neutral", score: 3, description: "Occasional stray thoughts appear" },
      { label: "Agree", score: 4, description: "Inspiring solutions frequently pop into my head during casual moments" },
      { label: "Strongly Agree", score: 5, description: "My subconscious loves continuously untangling these puzzles for fun" },
    ],
  },
  8: {
    title: "Drain vs Vitality Disparity",
    scenario: "Comparing routine administrative chores with your core interest: 30 minutes of bureaucratic meetings can drain you completely, while 5 hours on your craft leaves you invigorated.",
    academicAnchor: "Energy Audit Contrast - Identifying authentic cognitive strengths vs draining obligations",
    options: [
      { label: "Strongly Disagree", score: 1, description: "Energy depletion is uniform across all tasks" },
      { label: "Disagree", score: 2, description: "Slight difference, but not noticeable" },
      { label: "Neutral", score: 3, description: "Moderate contrast depending on mood" },
      { label: "Agree", score: 4, description: "Clear contrast: administrative trivialities crush my morale, creative challenges spark me" },
      { label: "Strongly Agree", score: 5, description: "Vividly extreme contrast; energy variance between the two is night and day" },
    ],
  },

  // Dimension 3: socialMirror (9 - 12)
  9: {
    title: "Default Point of Contact for Specific Knots",
    scenario: "Colleagues, classmates, or friends habitually turn to you as their first phone call whenever they hit a specific bottleneck (e.g. debugging, editing, conflict resolution, roadmap planning).",
    academicAnchor: "Johari Window Blind Spot & Social Consensus Signals",
    options: [
      { label: "Strongly Disagree", score: 1, description: "People rarely ask me for specialized help" },
      { label: "Disagree", score: 2, description: "Occasionally asked generic questions, nothing distinctive" },
      { label: "Neutral", score: 3, description: "Sometimes sought after in a shared project context" },
      { label: "Agree", score: 4, description: "Distinct domain where peers consistently consider me the go-to person" },
      { label: "Strongly Agree", score: 5, description: "Clear consensus; whenever this type of knot appears, everyone points to me" },
    ],
  },
  10: {
    title: "Unsolicited Genuine Praise",
    scenario: "Third parties have spontaneously complimented your specific ability without prompting, using expressions like 'How did you see that so clearly?' or 'Your intuition on this is uncanny.'",
    academicAnchor: "Reflected Best Self (RBS) - External mirrors revealing unconscious strengths",
    options: [
      { label: "Strongly Disagree", score: 1, description: "I don't recall receiving this type of feedback" },
      { label: "Disagree", score: 2, description: "Compliments are mostly polite courtesies" },
      { label: "Neutral", score: 3, description: "A few genuine compliments over the years" },
      { label: "Agree", score: 4, description: "Multiple independent mentors or peers highlighted the same core gift" },
      { label: "Strongly Agree", score: 5, description: "A repeated motif across different companies, schools, and social circles" },
    ],
  },
  11: {
    title: "Voluntary Delegation Target",
    scenario: "In team projects, group members naturally feel relieved and gladly hand over a certain segment to you, knowing you will handle it with peerless precision.",
    academicAnchor: "Social Trust & Comparative Advantage Allocation",
    options: [
      { label: "Strongly Disagree", score: 1, description: "Work is divided purely by random assignment" },
      { label: "Disagree", score: 2, description: "No particular segment is trusted to me exclusively" },
      { label: "Neutral", score: 3, description: "Sometimes assigned certain modules" },
      { label: "Agree", score: 4, description: "Teams consistently push the most complex logic/design/communication piece to me" },
      { label: "Strongly Agree", score: 5, description: "Always happens; whenever this component arrives, it's my unquestioned mantle" },
    ],
  },
  12: {
    title: "Third-Party Micro-Nuance Perception",
    scenario: "People comment that you can detect subtle nuances in a situation (a micro-expression, subtle code smell, awkward rhythm, slight pitch change) that others completely miss.",
    academicAnchor: "Expertise Perception Threshold - High-density sensory encoding",
    options: [
      { label: "Strongly Disagree", score: 1, description: "My perception is average or less observant than peers" },
      { label: "Disagree", score: 2, description: "Seldom spot things others miss" },
      { label: "Neutral", score: 3, description: "Occasional keen observations" },
      { label: "Agree", score: 4, description: "Regularly point out critical details that peers overlook" },
      { label: "Strongly Agree", score: 5, description: "My cognitive radar instantly catches subtle dissonances and imbalances" },
    ],
  },

  // Dimension 4: gritTolerance (13 - 16)
  13: {
    title: "Boredom & Tedium Immunity",
    scenario: "A specific phase of work (e.g. cleaning datasets, pixel-aligning UI, rewriting an essay 20 times, researching primary historical papers) that others label as torturous tedium, you find curiously satisfying.",
    academicAnchor: "Naval's Boredom Tolerance & Craftsmanship Psychology",
    options: [
      { label: "Strongly Disagree", score: 1, description: "I detest tedious repetitive work of any kind" },
      { label: "Disagree", score: 2, description: "I quickly get restless and abandon details" },
      { label: "Neutral", score: 3, description: "I can endure it if required, but don't enjoy it" },
      { label: "Agree", score: 4, description: "I find deep meditative tranquility in polishing fine details in my craft" },
      { label: "Strongly Agree", score: 5, description: "Completely resonant; refining the microscopic nuances brings me profound joy" },
    ],
  },
  14: {
    title: "Resilience in Unrewarded Iteration",
    scenario: "When an experiment fails repeatedly or the draft looks rough, you don't feel defeated; instead, your curiosity flares up to troubleshoot exactly why it broke.",
    academicAnchor: "Carol Dweck's Growth Mindset & Domain Frustration Tolerance",
    options: [
      { label: "Strongly Disagree", score: 1, description: "Repeated failure makes me want to quit immediately" },
      { label: "Disagree", score: 2, description: "Frustration quickly overwhelms my interest" },
      { label: "Neutral", score: 3, description: "I persist only if strictly mandated" },
      { label: "Agree", score: 4, description: "Failures in my preferred domain feel like thrilling detective mysteries" },
      { label: "Strongly Agree", score: 5, description: "In this realm, obstacles trigger pure intellectual adrenaline" },
    ],
  },
  15: {
    title: "Obsession with Elegance & Integrity",
    scenario: "Even when nobody will inspect the hidden parts (back-end code format, database schema clarity, interior wiring, footnote citations), you refuse to take shortcuts.",
    academicAnchor: "Intrinsic Motivation & Steve Jobs' 'Back of the Fence' Principle",
    options: [
      { label: "Strongly Disagree", score: 1, description: "If nobody sees it, 'good enough' is fine" },
      { label: "Disagree", score: 2, description: "I generally cut corners whenever convenient" },
      { label: "Neutral", score: 3, description: "I try to keep things reasonably clean" },
      { label: "Agree", score: 4, description: "Unkempt internal structures genuinely bother my sense of order" },
      { label: "Strongly Agree", score: 5, description: "I demand impeccable structural elegance even in unseen places" },
    ],
  },
  16: {
    title: "Voluntary Practice & Deep Immersion",
    scenario: "Without any homework assignment, supervisor requirement, or monetization plan, you voluntarily spend weekends dissecting and practicing this specific subject.",
    academicAnchor: "Anders Ericsson's Deliberate Practice & Autonomous Motivation",
    options: [
      { label: "Strongly Disagree", score: 1, description: "I never practice anything without external compensation" },
      { label: "Disagree", score: 2, description: "Free time is reserved exclusively for passive relaxation" },
      { label: "Neutral", score: 3, description: "Occasionally dabble on a whim" },
      { label: "Agree", score: 4, description: "I regularly spend leisure time exploring books and experiments in my field" },
      { label: "Strongly Agree", score: 5, description: "My weekends and personal time naturally gravitate toward this craft" },
    ],
  },

  // Dimension 5: cognitiveAptitude (17 - 20)
  17: {
    title: "Structural & First-Principles Deconstruction",
    scenario: "Faced with messy, disorganized information, your brain instinctively strips away secondary noise to extract core causal relationships and architecture diagrams.",
    academicAnchor: "System Thinking & First-Principles Reasoning",
    options: [
      { label: "Strongly Disagree", score: 1, description: "Complex systems feel completely overwhelming to me" },
      { label: "Disagree", score: 2, description: "I struggle to see the forest for the trees" },
      { label: "Neutral", score: 3, description: "I can follow someone else's framework" },
      { label: "Agree", score: 4, description: "I naturally construct logic diagrams and flowcharts to understand reality" },
      { label: "Strongly Agree", score: 5, description: "Dissecting chaos into elegant, modular architecture is my primary instinct" },
    ],
  },
  18: {
    title: "Empathic Resonance & Interpersonal Decoding",
    scenario: "In a meeting or conversation, you instantly pick up on unspoken micro-tensions, hidden motivations, and unspoken emotional subtexts beneath words.",
    academicAnchor: "Gardner's Interpersonal Intelligence & Empathic Acuity",
    options: [
      { label: "Strongly Disagree", score: 1, description: "I am oblivious to social cues and emotional nuances" },
      { label: "Disagree", score: 2, description: "I often misunderstand people's real feelings" },
      { label: "Neutral", score: 3, description: "Average interpersonal sensitivity" },
      { label: "Agree", score: 4, description: "I quickly sense what people really want without them saying it" },
      { label: "Strongly Agree", score: 5, description: "My emotional antennae instantly register psychological dynamics in any room" },
    ],
  },
  19: {
    title: "Cross-Disciplinary Analogy & Metaphor",
    scenario: "You love explaining esoteric or abstract concepts by finding unexpected analogies from completely unrelated domains (e.g. explaining software using biology or city planning).",
    academicAnchor: "Lateral Thinking & Associative Fluency",
    options: [
      { label: "Strongly Disagree", score: 1, description: "I prefer literal, rigid definitions only" },
      { label: "Disagree", score: 2, description: "Analogies usually confuse me" },
      { label: "Neutral", score: 3, description: "Can grasp metaphors when others make them" },
      { label: "Agree", score: 4, description: "Frequently coin analogies that make abstract ideas click for people" },
      { label: "Strongly Agree", score: 5, description: "Cross-domain synthesis is the native language of my thoughts" },
    ],
  },
  20: {
    title: "Tangible Execution & Material Realization",
    scenario: "Abstract theorizing leaves you cold until you can build a tangible prototype, sketch a wireframe, or run a concrete experiment to feel its real-world impact.",
    academicAnchor: "Holland's Realistic (R) & Kinesthetic Tactile Intelligence",
    options: [
      { label: "Strongly Disagree", score: 1, description: "I prefer pure theory and dislike physical or concrete execution" },
      { label: "Disagree", score: 2, description: "Rarely care to build physical or live prototypes" },
      { label: "Neutral", score: 3, description: "Balanced between ideas and execution" },
      { label: "Agree", score: 4, description: "Getting my hands dirty building real artifacts gives me the greatest satisfaction" },
      { label: "Strongly Agree", score: 5, description: "I think through building; ideas only become real when instantiated" },
    ],
  },

  // Dimension 6: latentDesire (21 - 24)
  21: {
    title: "The Envy Compass (Latent Potential Projection)",
    scenario: "When you see someone achieve a remarkable milestone in a specific area, you feel a sharp, private pang of jealousy or envy—signaling: 'That is what I was meant to do.'",
    academicAnchor: "Psychological Projection & Envy as an Authentic Career Compass",
    options: [
      { label: "Strongly Disagree", score: 1, description: "I never experience envy or jealousy over others' work" },
      { label: "Disagree", score: 2, description: "Envy is mostly about money or luck, not specific crafts" },
      { label: "Neutral", score: 3, description: "Occasional brief envy toward high achievers" },
      { label: "Agree", score: 4, description: "A very specific group of creators/specialists stirs that distinct pang in me" },
      { label: "Strongly Agree", score: 5, description: "Unmistakable compass; every time I see their craft, my inner voice shouts 'That's my true calling!'" },
    ],
  },
  22: {
    title: "The Post-Wealth Fantasy Test",
    scenario: "If you won the lottery and never needed to earn another dime, after 6 months of luxury travel, you would still voluntarily choose to study or create in this specific domain.",
    academicAnchor: "Self-Determination Theory (SDT) - Pure Intrinsic Motivation Free of Extrinsic Incentives",
    options: [
      { label: "Strongly Disagree", score: 1, description: "If rich, I would never do any kind of focused work again" },
      { label: "Disagree", score: 2, description: "I would just play games and relax forever" },
      { label: "Neutral", score: 3, description: "Uncertain what I would commit to" },
      { label: "Agree", score: 4, description: "I would definitely dedicate my freedom to mastering this craft" },
      { label: "Strongly Agree", score: 5, description: "Without financial constraints, this field is exactly where I would pour my life's energy" },
    ],
  },
  23: {
    title: "Defensive Impatience with Sloppy Standards",
    scenario: "When someone produces mediocre, shallow, or misleading work in this field, you feel a visceral surge of indignation and want to personally set the record straight.",
    academicAnchor: "Primal Standard of Excellence & Domain Territoriality",
    options: [
      { label: "Strongly Disagree", score: 1, description: "I don't care at all if someone does a poor job" },
      { label: "Disagree", score: 2, description: "Rarely triggered by others' sloppy output" },
      { label: "Neutral", score: 3, description: "Mild annoyance, easily ignored" },
      { label: "Agree", score: 4, description: "Seeing low-effort work in my zone of interest genuinely frustrates me" },
      { label: "Strongly Agree", score: 5, description: "Strong instinctive indignation; I feel an obligation to uphold the highest standard" },
    ],
  },
  24: {
    title: "Gravitational Curiosity & Autonomous Deep Dives",
    scenario: "Whenever you enter a bookstore, browse video channels, or read longform articles, your attention is irresistibly pulled toward this topic, even when you planned to read something else.",
    academicAnchor: "Gallup 'Instinct' - Cognitive Gravitational Pull & Spontaneous Inquiry",
    options: [
      { label: "Strongly Disagree", score: 1, description: "My attention is completely randomized by current trends" },
      { label: "Disagree", score: 2, description: "No singular subject pulls my attention consistently" },
      { label: "Neutral", score: 3, description: "Occasional mild curiosity" },
      { label: "Agree", score: 4, description: "I notice my digital bookmarks and books consistently converge on this theme" },
      { label: "Strongly Agree", score: 5, description: "An undeniable gravitational pull that has persisted across years" },
    ],
  },
};

export const ENGLISH_QUALITATIVE: Record<
  string,
  {
    badge: string;
    title: string;
    subtitle: string;
    heuristicPrinciple: string;
    academicBasis: string;
    guidingPrompts: string[];
    exemplarStory: string;
    placeholder: string;
  }
> = {
  childhood: {
    badge: "Childhood Archaeology",
    title: "1. Early Childhood & Adolescent Unencumbered Absorption",
    subtitle: "What were you spontaneously engrossed in before societal expectations, exams, or monetary rewards conditioned you?",
    heuristicPrinciple: "The Principle of Least Resistance - Natural aptitudes manifest earliest when unconstrained by external incentives.",
    academicBasis: "Developmental Psychology: Primal synaptic density advantage before cultural pruning.",
    guidingPrompts: [
      "In middle school or childhood vacations, what did you tinker with for hours without adults telling you to?",
      "What did you build, collect, write, sketch, or calculate purely for the intrinsic pleasure of it?",
      "What was a project where peers thought you were weirdly patient, but you were having a blast?",
    ],
    exemplarStory: "Example: 'In middle school, before having a computer, I used notebook paper to invent tabletop card game rules, calculating stat balances and writing a 20,000-word fantasy lore universe for my classmates to play, totally oblivious to bedtime.'",
    placeholder: "Reflect on your childhood and adolescent unencumbered obsessions. Describe specific scenes, games, or projects...",
  },
  recentFlow: {
    badge: "Physiological Energy Audit",
    title: "2. The Recent High-Flow & Energy-Replenishment Event",
    subtitle: "Recall a recent experience where you were deeply absorbed and emerged energized rather than drained.",
    heuristicPrinciple: "Energy Audit Contrast - True strengths act as psychological generators, whereas non-strengths act as energy sinks.",
    academicBasis: "Csikszentmihalyi's Flow Theory & Gallup Energy Audit: Balance of challenge and tacit mastery.",
    guidingPrompts: [
      "When was the last time you looked up and several hours had vanished in an instant?",
      "What kind of task leaves you intellectually vibrant even after intense hours of focus?",
      "In that session, what exact part of the process gave you that surge of dopamine?",
    ],
    exemplarStory: "Example: 'Last month I restructured a messy customer service workflow table. Working from 8 PM to 2 AM writing formulas and clean pipelines, I felt completely exhilarated when every node fell into place.'",
    placeholder: "Describe that specific recent flow event, what task it was, and how your energy felt during and after...",
  },
  externalHelp: {
    badge: "Social Blind Spot Mirror",
    title: "3. What Others Habitually Seek Your Help For",
    subtitle: "What specific knotty problems do friends, colleagues, or classmates instinctively trust you to resolve?",
    heuristicPrinciple: "Johari Window Blind Spot - Things you view as mundane common sense are often high-value superpowers to others.",
    academicBasis: "Social Recognition Theory & Tacit Knowledge Asymmetry: External consensus signals authentic comparative advantage.",
    guidingPrompts: [
      "What is the most common reason colleagues or friends ping you with: 'Can you look at this?'",
      "What do you explain in 5 minutes with a quick sketch that took someone else 3 days of confusion?",
      "What praise made you think: 'Wait, doesn't everyone know how to do this?'",
    ],
    exemplarStory: "Example: 'Whether writing thesis literature, choosing laptop specs, or planning travel itineraries, friends always dump their chaotic raw information on me to synthesize the optimal choice.'",
    placeholder: "Describe the specific tasks or advice peers, colleagues, or friends repeatedly ask you to take on...",
  },
  secretEnvy: {
    badge: "Envy as an Authentic Compass",
    title: "4. Secret Admiration & The Envy Compass",
    subtitle: "Whose accomplishments or craft trigger that sharp, subtle pang of envy or admiration in your heart?",
    heuristicPrinciple: "Psychological Projection - You only envy what aligns with your own unactualized potential.",
    academicBasis: "Psychodynamic Projection & Latent Motive Theory: Envy is a precise emotional GPS pointing to your authentic ambitions.",
    guidingPrompts: [
      "Whose articles, videos, code, designs, or presentations make you feel slightly jealous?",
      "When someone in your peer group wins praise, what kind of praise makes your heart sting: 'I could have done that!'",
      "If you could wake up tomorrow with anyone's specific capability, whose would it be and why?",
    ],
    exemplarStory: "Example: 'I secretly envy independent creators who can distill ultra-complex concepts into three intuitive visual diagrams and elegant metaphors. Every time I see their work, I feel a quiet sting of ambition.'",
    placeholder: "Name the creators, peers, or figures you secretly admire or envy, and pinpoint the exact skill you crave...",
  },
  gritDetail: {
    badge: "Tedium Tolerance & Craftsmanship",
    title: "5. The Microscopic Details You Enjoy Polishing",
    subtitle: "What repetitive, tedious nuances do others find agonizing, yet you willingly obsess over with quiet pleasure?",
    heuristicPrinciple: "Naval's Boredom Tolerance - What looks like grueling, unrewarded labor to others is meditation to you.",
    academicBasis: "Angela Duckworth's Grit Theory & Craftsmanship Instinct: Long-term competitive moat built on micro-iterations.",
    guidingPrompts: [
      "What fine detail makes you repeatedly inspect and polish before you can sleep peacefully?",
      "In a project, what part does everyone else rush through or skip, but you insist on perfecting?",
      "What is the equivalent of 'polishing the back of the fence' in your daily work?",
    ],
    exemplarStory: "Example: 'To ensure a technical proposal has zero logical gaps, I will patiently proofread typography, definitions, and code snippets 50 times. Others find it agonizing, but I relish the watchmaker-like precision.'",
    placeholder: "Describe the microscopic details, proofreading, debugging, or formatting you obsessively perfect...",
  },
};

export { ENGLISH_ARCHETYPES, resolveArchetype } from "./englishArchetypes";
