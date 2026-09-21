import { ArchetypeProfile, Language } from "../types";
import { ARCHETYPES } from "./archetypes";

type EnglishArchetype = Pick<
  ArchetypeProfile,
  | "title"
  | "subtitle"
  | "tagline"
  | "coreNature"
  | "specificKnowledge"
  | "signSignature"
  | "recommendedDomains"
  | "skillStackingFormula"
  | "highEnergyContext"
  | "drainEnergyContext"
  | "shadowBlindspots"
  | "famousFigures"
>;

/** Keys MUST match Chinese ARCHETYPES ids so English reports do not fall back to Chinese copy. */
export const ENGLISH_ARCHETYPES: Record<string, EnglishArchetype> = {
  architect: {
    title: "System Architect & Logic Deconstructor",
    subtitle: "The System Architect",
    tagline: "Transforming chaos into order, engineering indestructible first-principles systems",
    coreNature:
      "You possess an exceptional gift for systemic modeling and causal deconstruction. Faced with messy information, you instinctively identify causal chains, construct taxonomies, and architect scalable, self-consistent frameworks.",
    specificKnowledge:
      "Dimensional abstraction of underlying logic. While others fight fires in fragmented symptoms, you immediately spot the structural root cause and engineer an automated pipeline.",
    signSignature: {
      success: "Unrivaled reliability when designing complex workflows, optimizing architecture, and diagnosing root causes.",
      instinct: "Visceral intolerance for chaotic, inefficient systems; an urgent urge to rebuild and streamline them.",
      grow: "Steep, effortless mastery of algorithms, models, frameworks, and structural mechanics.",
      need: "A deep sense of internal harmony when all cogs in a system mesh flawlessly.",
    },
    recommendedDomains: [
      {
        title: "Complex Systems Engineering & Architecture",
        description: "High-complexity software architecture, cloud-native distributed systems, hardware design systems",
        roles: ["System Architect", "Engineering Lead", "Director of Engineering"],
      },
      {
        title: "Operating Systems & Digital Strategy",
        description: "Designing enterprise operating platforms, workflow automation and growth models",
        roles: ["Strategic Operations Architect", "Digital Transformation Specialist", "Business Process Consultant"],
      },
      {
        title: "Knowledge Engineering & Disciplinary Reconstruction",
        description: "Turning chaotic emerging knowledge into teachable curricula and methods",
        roles: ["Knowledge Architect", "Think-tank Researcher", "Methodology Author"],
      },
    ],
    skillStackingFormula: {
      baseSkill: "Deep systems modeling and logical deconstruction",
      amplifier: "Product/commercial acumen or visual explanation",
      uniqueResult: "High-leverage digital systems builder / elite complexity consultant",
      analysis:
        "Logic alone can trap you in back-office engineering. Stack systems thinking with commercial judgment and clear expression, and you become the scarce link between technology and strategy.",
    },
    highEnergyContext: [
      "Blank-page architecture blueprints",
      "Hunting down elusive root causes",
      "Polishing reusable automation toolkits",
    ],
    drainEnergyContext: [
      "Mechanical pipelines with no room to optimize",
      "Politics-driven conflict with no causal logic",
    ],
    shadowBlindspots: [
      {
        pitfall: "Over-design and decision paralysis: delaying market validation to chase theoretical purity.",
        antidote: "Ship a deliberately imperfect MVP and enforce strict time-boxing.",
      },
      {
        pitfall: "Blindness to irrational human emotion: assuming people will follow if the logic is right.",
        antidote: "Treat psychological safety and emotion as first-class variables in the model.",
      },
    ],
    famousFigures: ["Linus Torvalds (Linux)", "Ray Dalio (Principles)", "John von Neumann"],
  },

  catalyst: {
    title: "Empathic Catalyst & Empowering Mentor",
    subtitle: "The Empathic Catalyst",
    tagline: "Illuminating human potential, bridging emotional divides through radiant empathy",
    coreNature:
      "Your superpower is interpersonal intuition. You catch unspoken tensions, see others' fears and gifts, and create psychological safety that lets people open and grow.",
    specificKnowledge:
      "High-bandwidth emotional decoding and catalytic communication. You sense what people truly need and how to rally diverse personalities toward a shared aim.",
    signSignature: {
      success: "High psychological safety, team alignment, counseling outcomes and talent growth.",
      instinct: "When someone is lost or hurting, you instinctively move closer and listen.",
      grow: "Rapid grasp of human dynamics, counseling craft, group psychology and storytelling.",
      need: "Deep fulfillment when someone transforms or flourishes under your encouragement.",
    },
    recommendedDomains: [
      {
        title: "Executive Coaching & Personal Growth",
        description: "C-suite coaching, psychological capital development, career-transition supervision",
        roles: ["Executive Leadership Coach", "Senior Counselor", "Career Mentor"],
      },
      {
        title: "Organization Development & Talent (OD / L&D)",
        description: "Building high-safety teams that unlock self-driven knowledge work",
        roles: ["OD Specialist", "Chief Talent Officer", "Team Agile Coach"],
      },
      {
        title: "High-Trust Community & Empathic Media",
        description: "Linking a specific community with sincere, high-touch narrative",
        roles: ["Deep-interview Producer", "Community Host", "Healing Writer / Speaker"],
      },
    ],
    skillStackingFormula: {
      baseSkill: "Deep empathy and insight into human nature",
      amplifier: "Structured diagnostic models and commercial judgment",
      uniqueResult: "High-impact executive coach / elite organization-change catalyst",
      analysis:
        "Pure empathy can turn you into an emotional dumping ground. Add structured diagnosis and commercial sight, and warmth becomes a high-leverage change catalyst.",
    },
    highEnergyContext: [
      "One-to-one conversations that unlock a stuck knot",
      "Mediating a polarized team into shared ground",
      "Drafting a potential-awakening plan for someone lost",
    ],
    drainEnergyContext: [
      "Cold, metric-only downsizing cultures",
      "Performative, mask-wearing social rituals",
    ],
    shadowBlindspots: [
      {
        pitfall: "Emotional sponge and burnout: absorbing others' distress until you are depleted.",
        antidote: "Install clear interpersonal boundaries — their homework is theirs.",
      },
      {
        pitfall: "People-pleasing and conflict avoidance: delaying necessary hard truths to keep harmony.",
        antidote: "Practice radical candor: unvarnished honesty is the deepest respect.",
      },
    ],
    famousFigures: ["Carl Rogers", "Brené Brown", "Oprah Winfrey"],
  },

  alchemist: {
    title: "Aesthetic Alchemist & Narrative Creator",
    subtitle: "The Sensory Alchemist",
    tagline: "Turning the ordinary into poetry — sensory alchemy that gives things a soul",
    coreNature:
      "You have extraordinary aesthetic discrimination for visuals, language, light, tone and space. You cannot tolerate ugliness; you instinctively extract tension and metaphor that hits the senses.",
    specificKnowledge:
      "An original aesthetic vocabulary and sensory rhythm. Even dry technical documents become infectious once they pass through your hands.",
    signSignature: {
      success: "Work with unmistakable aesthetic identity and emotional reach — people remember it.",
      instinct: "Crude layout, wording or space triggers a physiological urge to rebuild it.",
      grow: "Rapid absorption of art movements, metaphor and visual languages.",
      need: "Ultimate flow when a vague beautiful idea becomes a concrete artifact in your hands.",
    },
    recommendedDomains: [
      {
        title: "Premium Brand & Experience Design",
        description: "Luxury concept definition, visual DNA, high-end retail space",
        roles: ["Creative Director", "Brand Aesthetics Advisor", "Experience Designer"],
      },
      {
        title: "Independent Content IP & Narrative",
        description: "High-quality visual storytelling, concept art, long-form editorial",
        roles: ["Independent Creator", "Concept Designer", "Film / Publishing Producer"],
      },
      {
        title: "HCI Aesthetics & Digital Art",
        description: "High-fidelity interfaces, affective interaction, generative aesthetics",
        roles: ["Lead UI/UX Designer", "Digital Aesthetics Partner", "Creative Technologist"],
      },
    ],
    skillStackingFormula: {
      baseSkill: "Elite aesthetic intuition and narrative magnetism",
      amplifier: "Frontier tools (AI chain / code) or commercial operations",
      uniqueResult: "One-person creative lab / category-defining product auteur",
      analysis:
        "Taste alone can strand you as an impoverished artist. Stack digital leverage or commercial channels and your style scales a hundredfold.",
    },
    highEnergyContext: [
      "Unconstrained zero-to-one creative conception",
      "Polishing type, light and rhythm until it sings",
      "Collecting the world's finest aesthetic references",
    ],
    drainEnergyContext: [
      "Mechanical form-filling with no aesthetic bar",
      "Being overridden by clients who cannot see design",
    ],
    shadowBlindspots: [
      {
        pitfall: "Perfectionist delay: never shipping because it is not yet stunning.",
        antidote: "Treat each release as a living draft; finished beats perfect.",
      },
      {
        pitfall: "Self-indulgent niche: form over the audience's real need.",
        antidote: "Before making, answer: whose anxiety does this relieve?",
      },
    ],
    famousFigures: ["Steve Jobs", "Kenya Hara (MUJI)", "Wes Anderson"],
  },

  pathfinder: {
    title: "Visionary Pathfinder & Strategic Scout",
    subtitle: "The Pathfinder",
    tagline: "Crossing fog as an explorer, cutting a trail through unmapped terrain",
    coreNature:
      "You have a rare nose for future discontinuities. While others wait, you sense a paradigm shift and dare to enter the unknown.",
    specificKnowledge:
      "High-odds strategic bets under incomplete information, using probabilistic intuition and first principles.",
    signSignature: {
      success: "Catching early inflection points and finding a third path through deadlock.",
      instinct: "Suffocation in static rules; hunger for new continents and overturned orders.",
      grow: "Agile synthesis of macroeconomics, frontier tech and competitive evolution.",
      need: "The conquest high when a non-consensus bet is later proven and the first wins land.",
    },
    recommendedDomains: [
      {
        title: "Early Venture & Risk Capital",
        description: "Zero-to-one bets, angel investing and incubation",
        roles: ["Serial Founder", "Venture Partner", "Early Incubator Host"],
      },
      {
        title: "Corporate Strategy Innovation & New Markets",
        description: "Opening unknown markets and a second growth curve",
        roles: ["Chief Strategy Officer", "New-business Explorer", "Overseas Market Pioneer"],
      },
      {
        title: "Frontier Tech Commercialization",
        description: "Turning AI models and hard-tech concepts into paid use cases",
        roles: ["AI Product Explorer", "Tech Commercialization Advisor", "Futurist"],
      },
    ],
    skillStackingFormula: {
      baseSkill: "Foresight and the nerve to open a new board",
      amplifier: "Capital mechanics and core-team building",
      uniqueResult: "Breakout operator / unicorn-grade strategic leader",
      analysis:
        "Vision without resources is just talk. Add capital leverage and ruthless landing tactics, and prophecy becomes an empire.",
    },
    highEnergyContext: [
      "Studying unexplored tech or business models",
      "War-gaming a breakout from a crisis",
      "Brainstorming with equally adventurous peers",
    ],
    drainEnergyContext: [
      "Mature pipelines where the end is visible",
      "Risk-averse bureaucracy and endless approvals",
    ],
    shadowBlindspots: [
      {
        pitfall: "Novelty addiction: abandoning a domain once it needs fine-grained operations.",
        antidote: "Pair with an operations-order partner; own 0→1, not 10→100.",
      },
      {
        pitfall: "Gambler's bias: treating high risk as high return.",
        antidote: "Fire cheap bullets first; scale only after the ranging shot hits.",
      },
    ],
    famousFigures: ["Elon Musk", "Peter Thiel (Zero to One)", "Columbus"],
  },

  craftsman: {
    title: "Meticulous Craftsman & Quality Guardian",
    subtitle: "The Precision Craftsman",
    tagline: "Millimeter-scale craft — the bedrock of certainty and extreme quality",
    coreNature:
      "You hold a near-religious standard for quality. Tiny defects, data drift or process flaws cannot hide. You polish rough drafts into Swiss-watch reliability.",
    specificKnowledge:
      "Unforgiving control of detail and stability. In a noisy age you represent unshakeable professionalism.",
    signSignature: {
      success: "Code, finance, contracts or engineering you gate almost never produce safety accidents.",
      instinct: "A drive to align tools, unify code style, and hunt every typo.",
      grow: "Steep mastery of precision standards, compliance risk and engineering extremes.",
      need: "Quiet solidity when a flawless, fully compliant artifact is delivered.",
    },
    recommendedDomains: [
      {
        title: "Mission-Critical Engineering & Quality Architecture",
        description: "High-concurrency finance cores, aerospace software, precision medical devices",
        roles: ["Chief Risk Officer", "SRE Lead", "Director of Quality Engineering"],
      },
      {
        title: "Precision Compliance, Audit & Legal Architecture",
        description: "Cross-border M&A review, listed-company audit and tax architecture",
        roles: ["Senior Compliance Counsel", "Financial Audit Expert", "Compliance Risk Officer"],
      },
      {
        title: "High Craft & Precision Making",
        description: "Fine arts, precision handwork, independently forged software",
        roles: ["Lean Software Craftsman", "Bespoke Artisan", "Master Restorer"],
      },
    ],
    skillStackingFormula: {
      baseSkill: "Unmatched precision control and quality obsession",
      amplifier: "Automation scripts and toolchain design",
      uniqueResult: "Ten-in-one engineering artisan / elite safety-and-compliance authority",
      analysis:
        "Manual perfectionism burns out. Encode the obsession into toolchains and process, and you become an irreplaceable foundation.",
    },
    highEnergyContext: [
      "Uninterrupted deep debugging and micro-tuning",
      "Turning chaotic files into perfect specification",
      "Closing a high-severity hole no one else saw",
    ],
    drainEnergyContext: [
      "Good-enough cultures that shrug at defects",
      "Chaotic teams with no rules and constant U-turns",
    ],
    shadowBlindspots: [
      {
        pitfall: "Control-freak bottleneck: refusing to delegate because others' small errors feel intolerable.",
        antidote: "Separate fatal red lines from grey zones where trial is allowed.",
      },
      {
        pitfall: "Missing the window: polishing a corner while the market window closes.",
        antidote: "Ship a usable beta; perfect in subsequent patches.",
      },
    ],
    famousFigures: ["Jiro Ono", "Charlie Munger", "Donald Knuth"],
  },

  analyst: {
    title: "Deep Analyst & First-Principles Inquisitor",
    subtitle: "The Deep Analyst",
    tagline: "Dissecting appearances with reason; reaching truth with data and facts",
    coreNature:
      "You run a precise, skeptical mind. You distrust second-hand claims and chase primary evidence. You unpick contradiction until the real mechanism is visible.",
    specificKnowledge:
      "Research that cuts through market noise. However dazzling the pitch, three questions expose the logical hole.",
    signSignature: {
      success: "Research notes, models and fact-checks with unusual credibility and penetrating power.",
      instinct: "Faced with a sensational claim: what is the sample? Does causality hold? Were variables controlled?",
      grow: "Rapid absorption of statistics, experimental design, data cleaning and causal inference.",
      need: "Pure intellectual pleasure when a public fog is torn open by a tight proof.",
    },
    recommendedDomains: [
      {
        title: "Investment Research & Quantitative Analysis",
        description: "Equity research, hedge-fund quant, macro cycle analysis",
        roles: ["Buy-side Analyst", "Quant Researcher", "Chief Economist Associate"],
      },
      {
        title: "Business Intelligence & Data Science",
        description: "Mining opportunity from user behavior; prediction and decision algorithms",
        roles: ["Chief Data Scientist", "BI Analyst", "Growth Strategist"],
      },
      {
        title: "Investigative Reporting & Policy Research",
        description: "Using facts and data to move public policy or expose industry failure",
        roles: ["Investigative Journalist", "Think-tank Analyst", "Journal Reviewer"],
      },
    ],
    skillStackingFormula: {
      baseSkill: "Penetrating logical analysis and data deduction",
      amplifier: "Vivid public explanation and commercial application",
      uniqueResult: "Category thought-leader / elite decision-making counsel",
      analysis:
        "Research without translation stays in the ivory tower. Convert deep insight into forceful commercial advice and every CEO wants you as a north star.",
    },
    highEnergyContext: [
      "Pulling patterns from a huge raw dataset",
      "Overturning a false consensus with solid proof",
      "Reading thousand-page white papers and filings",
    ],
    drainEnergyContext: [
      "Gut-feel meetings with no evidence",
      "Low-quality arguments driven by emotion and error",
    ],
    shadowBlindspots: [
      {
        pitfall: "Analysis paralysis: forever waiting for a larger sample before acting.",
        antidote: "Use Bezos's 70% information rule — decide once you have most of the picture.",
      },
      {
        pitfall: "Cold sharpness that wounds: exposing holes without regard for dignity.",
        antidote: "Be ruthless with propositions, gentle with people.",
      },
    ],
    famousFigures: ["Michael Lewis", "Charlie Munger", "Nate Silver"],
  },

  connector: {
    title: "Value Connector & Ecosystem Multiplier",
    subtitle: "The Value Multiplier",
    tagline: "A magician of networks — resources recombined until value compounds",
    coreNature:
      "You have rare intuition for networks, exchange value and ecosystem synergy. You see idle treasure in A's hands that B desperately needs, and design a deal where both win and surplus is created.",
    specificKnowledge:
      "Seamless weaving of social capital and commercial networks. Nothing is isolated; everything is a latent collaboration graph.",
    signSignature: {
      success: "Outsized outcomes in negotiation, alliance-building, resource integration and fundraising.",
      instinct: "On meeting someone, you automatically ask: who would they spark with?",
      grow: "Fast mastery of business models, incentives, network science and bargaining theory.",
      need: "Intense satisfaction when a multi-party deal lands and a mutual ecosystem starts spinning.",
    },
    recommendedDomains: [
      {
        title: "Strategic BD & M&A Integration",
        description: "Giant-to-giant alliances, ecosystem investment and integration",
        roles: ["Chief Business Officer", "M&A Partner", "Executive Search Advisor"],
      },
      {
        title: "Platform Economy & Industrial Internet",
        description: "Rules that connect both sides of a marketplace and spin network effects",
        roles: ["Platform Ecosystem Lead", "Developer Relations Director", "Industrial Internet Host"],
      },
      {
        title: "High-end Matching & Cross-border Brokering",
        description: "Matching creators, scientists or experts with capital and industry landing",
        roles: ["Elite Agent", "Public-private Advisor", "Venture Accelerator Partner"],
      },
    ],
    skillStackingFormula: {
      baseSkill: "Super-connector instinct and commercial matchmaking",
      amplifier: "Domain literacy and contract-design skill",
      uniqueResult: "Irreplaceable ecosystem steward / elite deal-maker behind the curtain",
      analysis:
        "Rolodex-only operators become shallow brokers. Add real domain understanding and deal architecture, and you can move an industry.",
    },
    highEnergyContext: [
      "Pairing two unrelated top talents into partners",
      "Landing a hard introduction to a key person",
      "Designing a genuinely two-sided strategic alliance",
    ],
    drainEnergyContext: [
      "Long isolation in a dark room with no collaboration",
      "Closed organizations that refuse to cooperate",
    ],
    shadowBlindspots: [
      {
        pitfall: "Scattered energy: living in rooms and relationships while hard skills atrophy.",
        antidote: "Cut low-yield socializing; deepen one core moat each year.",
      },
      {
        pitfall: "Over-transactional relationships: turning people into chips and eroding trust.",
        antidote: "Practice Adam Grant's giving: uncounted generosity builds the strongest reputation.",
      },
    ],
    famousFigures: ["Reid Hoffman (LinkedIn)", "Robert Merton", "Legendary Goldman bankers"],
  },

  polymath: {
    title: "Adaptive Polymath & Cross-Disciplinary Synthesizer",
    subtitle: "The Adaptive Polymath",
    tagline: "A boundary-crossing generalist, inventing new species in the gaps between fields",
    coreNature:
      "You refuse a single job label. You learn across disciplines at high speed. Others drill one tunnel for life; you borrow A's core logic into B and create hybrids no specialist predicted.",
    specificKnowledge:
      "Meta-learning and conceptual transfer. You are the default pick for complex problems with no precedent.",
    signSignature: {
      success: "Explosive output on compound projects that need tech, aesthetics, commerce and human nature at once.",
      instinct: "Once a field is fully mapped, your gaze jumps to the next unknown ridge.",
      grow: "You hold the master key of learning how to learn — new tools yield in days.",
      need: "Ultimate intellectual freedom when distant ideas click into a new artifact.",
    },
    recommendedDomains: [
      {
        title: "Solopreneurship & One-Person Companies",
        description: "Owning R&D, design, growth and commercialization in a lean digital business",
        roles: ["Independent Creator", "Solo Full-stack Builder", "One-person CEO"],
      },
      {
        title: "Cross-disciplinary Incubation",
        description: "Projects spanning life science, AI, sociology and design",
        roles: ["Chief Exploration Officer", "Cross-field Innovation Mentor", "Generalist Product VP"],
      },
      {
        title: "Enterprise Diagnosis & Special Operations",
        description: "Airborne specialist for multi-department system deadlocks",
        roles: ["Special-project Lead", "Consulting Engagement Director", "Integrated Operations Director"],
      },
    ],
    skillStackingFormula: {
      baseSkill: "Elite meta-learning and cross-domain transfer",
      amplifier: "Deep craft in one or two anchor fields (T or π shape)",
      uniqueResult: "Unmatched hybrid innovator / most resilient super-individual of the agile era",
      analysis:
        "Jack of all trades, master of none is the trap. Reach the top 15% in two distant fields and the product of the intersection is nearly unique.",
    },
    highEnergyContext: [
      "Learning a demanding new discipline from scratch",
      "Running a concept-to-product loop alone",
      "Solving a software problem with a biology analogy",
    ],
    drainEnergyContext: [
      "A decade as a single-function cog",
      "Silos that forbid crossing into other work",
    ],
    shadowBlindspots: [
      {
        pitfall: "The generalist trap: great breadth, insufficient depth, crushed by a specialist.",
        antidote: "Build a π-shaped stack with two mutually supporting technical anchors.",
      },
      {
        pitfall: "Unfinished leaps: leaving at 80% when a new toy appears.",
        antidote: "A contract with yourself: close a measurable loop before opening the next.",
      },
    ],
    famousFigures: ["Leonardo da Vinci", "Naval Ravikant", "Richard Feynman"],
  },
};

export function resolveArchetype(id: string, lang: Language = "zh"): ArchetypeProfile {
  const zh = ARCHETYPES[id] || ARCHETYPES.architect;
  if (lang !== "en") return zh;
  const en = ENGLISH_ARCHETYPES[id];
  if (!en) return zh;
  return {
    ...zh,
    ...en,
    id: zh.id,
    badgeColor: zh.badgeColor,
    accentColor: zh.accentColor,
  };
}
