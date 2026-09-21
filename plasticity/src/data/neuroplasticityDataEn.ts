import { MindMapNode, PracticeProtocol } from '../types';

export const CATEGORY_CONFIG_EN: Record<
  string,
  { label: string; bg: string; text: string; border: string; accent: string; icon: string }
> = {
  paradigm: {
    label: 'Paradigm Shift',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-800',
    accent: '#d97706',
    icon: 'Sparkles',
  },
  mechanism: {
    label: 'Core Mechanisms',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-300 dark:border-indigo-800',
    accent: '#6366f1',
    icon: 'Cpu',
  },
  neurochem: {
    label: 'Chemical Drivers',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-800',
    accent: '#10b981',
    icon: 'FlaskConical',
  },
  practice: {
    label: 'Practice Methods',
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-300 dark:border-cyan-800',
    accent: '#06b6d4',
    icon: 'Flame',
  },
  biology: {
    label: 'Biological Pillars',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-800',
    accent: '#f43f5e',
    icon: 'Activity',
  },
  paradox: {
    label: 'Plastic Paradox',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-800',
    accent: '#a855f7',
    icon: 'AlertTriangle',
  },
};

export const NEUROPLASTICITY_MINDMAP_EN: MindMapNode = {
  id: 'root',
  label: 'Neuroplasticity',
  shortDesc: 'The brain is not a hardwired machine, but a dynamic, self-renewing living network capable of lifelong reconfiguration.',
  category: 'paradigm',
  importance: 'core',
  iconName: 'Brain',
  details: {
    summary: 'Neuroplasticity denotes the nervous system\'s biological capacity to dynamically modify its structure and functional architecture in response to environmental demands, learning, sensory experience, and trauma. It decisively overthrew the ancient medical dogma of the "rigid, immutable adult brain."',
    keyPrinciple: 'Structure follows function. Experience sculpts anatomy, and deliberate thought reorganizes physical synaptic connections throughout the human lifespan.',
    scientificExperiment: 'Dr. Norman Doidge highlighted in "The Brain That Changes Itself" that for 400 years mainstream medicine viewed the brain as a rigid mechanical clockwork. Beginning in the late 20th century, pioneers Paul Bach-y-Rita and Michael Merzenich definitively proved that adult cortical representations continuously remap.',
    actionProtocol: [
      'Embrace a neuroplastic growth mindset: Cognitive limitations and skill plateaus are malleable biological states, not immutable genetic verdicts.',
      'Construct high-focus, deliberate challenge environments to initiate cortical remapping windows.',
      'Beware habit entrenchment: Dysfunctional, negative thought loops are physically wired into neural circuits with the exact same biological fidelity as mastery.'
    ],
    neuroQuote: '"The brain is a far more open system than we ever imagined, and nature has gone very far to help us perceive and take in the world around us." — Dr. Norman Doidge',
    tags: ['Neuroplasticity', 'Cognitive Rewiring', 'Lifelong Plasticity', 'Foundational Paradigm']
  },
  children: [
    {
      id: 'paradigm-shift',
      label: '1. Foundational Paradigm Shift',
      shortDesc: 'The cognitive revolution from mechanical "hardwired" localization to dynamic, lifelong neural re-architecture.',
      category: 'paradigm',
      importance: 'core',
      iconName: 'Sparkles',
      details: {
        summary: 'Classical neurology held that neurogenesis ceased after childhood and cortical zones were frozen like static microchips. Neuroplasticity shattered this determinism, showing that synaptic rewiring remains active until the day we die.',
        keyPrinciple: 'The brain is a flexible, adaptive topological network that continuously redistributes its bandwidth and computational resources based on sensory and behavioral input.',
        scientificExperiment: 'Michael Merzenich mapped auditory and somatosensory cortices in owl monkeys with microelectrodes. When a finger was used intensively, its corresponding cortical representation expanded aggressively into neighboring dormant zones.',
        actionProtocol: [
          'Discard the myth of the "calcified adult brain"; embrace lifelong cross-domain learning.',
          'Recognize that neuroplasticity is a tangible anatomical remodeling, not mere psychological wishful thinking.'
        ],
        neuroQuote: '"The brain is not a piece of hardware; it is a living computer that continually resolders its internal circuitry in response to software execution."',
        tags: ['Paradigm Shift', 'Anti-Localization', 'Adaptive Networks']
      },
      children: [
        {
          id: 'hebbian-theory',
          label: 'Hebbian Learning Rule',
          shortDesc: '"Neurons that fire together, wire together; neurons out of sync, lose their link."',
          category: 'paradigm',
          importance: 'core',
          iconName: 'Zap',
          details: {
            summary: 'Formulated by Donald Hebb in 1949: When an axon of cell A repeatedly excites cell B, growth processes or metabolic changes take place such that A\'s efficiency in firing B is permanently enhanced.',
            keyPrinciple: 'Synchronous neural firing cements synaptic bonds; disconnected or desynchronized firing degrades connection efficiency.',
            scientificExperiment: 'Eric Kandel demonstrated the biophysical reality of Hebbian synaptic potentiation and habituation in the sea slug Aplysia californica, earning the 2000 Nobel Prize in Physiology or Medicine.',
            actionProtocol: [
              'Implement habit stacking: Anchor a new desired routine immediately onto an existing, strongly wired neural trigger.',
              'Maintain razor-sharp attention during practice to ensure target circuits fire with high-temporal coherence.'
            ],
            neuroQuote: '"Neurons that fire together, wire together. When they fire apart, they wire apart."',
            tags: ['Hebb Rule', 'Synaptic Potentiation', 'Neural Circuits']
          }
        },
        {
          id: 'critical-periods',
          label: 'Critical Periods & Adult Reopening',
          shortDesc: 'From spontaneous childhood plasticity windows to adult focus-gated rewiring.',
          category: 'paradigm',
          importance: 'high',
          iconName: 'Clock',
          details: {
            summary: 'Childhood features spontaneous, wide-open Critical Periods for vision and language. While adult plasticity is actively brake-padded by perineuronal nets (PNNs) and GABAergic inhibition, it can be re-opened via intense attention and neuromodulatory surges.',
            keyPrinciple: 'Childhood plasticity is passive and automatic; adult plasticity is active, effortful, and gated strictly by acetylcholine and dopamine.',
            scientificExperiment: 'David Hubel & Torsten Wiesel\'s monocular deprivation trials revealed sensory critical windows. Subsequent research demonstrated that digesting perineuronal nets (PNN) or elevating neuromodulators can partially re-open plasticity in adult mammals.',
            actionProtocol: [
              'Avoid passive listening: Adult rewiring mandates active error generation, high vigilance, and rapid feedback.',
              'Cap deep cognitive sprints at 75–90 minutes (the biological ultradian limit) to maintain neuromodulatory tone.'
            ],
            neuroQuote: '"The adult brain hasn\'t locked the door to structural change; it merely installed a deadbolt that turns only with intense focus."',
            tags: ['Critical Period', 'Attention Gate', 'Adult Learning']
          }
        },
        {
          id: 'neural-darwinism',
          label: 'Neural Darwinism & Use-It-or-Lose-It',
          shortDesc: 'Relentless competition for cortical territory: Inactive circuits are promptly devoured by neighbors.',
          category: 'paradigm',
          importance: 'high',
          iconName: 'ShieldAlert',
          details: {
            summary: 'Gerald Edelman proposed Neural Darwinism: Neurons and synapses undergo natural selection within the brain microenvironment. Active circuits monopolize neurotrophins and expand their maps; dormant circuits are pruned.',
            keyPrinciple: 'Use it or lose it. Cortical real estate is intensely contested; dormant brain regions are seized by adjacent sensory inputs.',
            scientificExperiment: 'Somatosensory imaging of string musicians showed that their left-hand fingering cortical representations were significantly larger than non-musicians, but contracted noticeably following prolonged cessation of playing.',
            actionProtocol: [
              'Establish periodic "maintenance micro-drills" for critical competencies to prevent synaptic pruning.',
              'To eliminate negative habits: Starve old pathways of activation while aggressively forging replacement circuits.'
            ],
            neuroQuote: '"In the brain\'s geography, no real estate is permanently deeded to any single function; weakness invites immediate annexation."',
            tags: ['Use It or Lose It', 'Cortical Competition', 'Synaptic Selection']
          }
        }
      ]
    },
    {
      id: 'core-mechanisms',
      label: '2. Core Rewiring Mechanisms',
      shortDesc: 'Synaptic potentiation, receptor trafficking, structural myelination, adult neurogenesis, and cross-modal recruitment.',
      category: 'mechanism',
      importance: 'core',
      iconName: 'Cpu',
      details: {
        summary: 'Neuroplasticity operates across multiple biological scales: Nanometer receptor trafficking, micrometer dendritic spine remodeling, cellular adult neurogenesis, and centimeter-scale cortical remapping.',
        keyPrinciple: 'Multi-scale synergy: Molecular signaling (LTP) prompts gene expression, driving physical dendritic growth, functional compensation, and axonal myelination.',
        scientificExperiment: 'In vivo two-photon microscopy in mice revealed that within hours of a novel motor learning challenge, fresh mushroom-shaped dendritic spines sprouted along cortical pyramidal dendrites.',
        actionProtocol: [
          'Respect the multi-tiered temporal scales: Synaptic efficacy shifts in minutes, physical spines sprout in days, robust myelination requires months.',
          'Provide physical building blocks: Adequate slow-wave sleep, protein, omega-3 phospholipids, and hydration.'
        ],
        neuroQuote: '"Rewiring is not an isolated event, but a symphony spanning from nanometer ion channels to entire lobes of the cerebral cortex."',
        tags: ['Biological Mechanisms', 'Molecular Synapse', 'Anatomical Remodeling']
      },
      children: [
        {
          id: 'synaptic-plasticity',
          label: 'Synaptic Plasticity (LTP & LTD)',
          shortDesc: 'Long-Term Potentiation & Long-Term Depression: Dynamic gain controls of neurotransmission.',
          category: 'mechanism',
          importance: 'core',
          iconName: 'TrendingUp',
          details: {
            summary: 'Long-Term Potentiation (LTP) persistently strengthens synaptic transmission, whereas Long-Term Depression (LTD) downregulates inactive or noisy connections.',
            keyPrinciple: 'High-frequency activation dislodges the magnesium block from NMDA receptors, provoking calcium influx that recruits AMPA receptors to the postsynaptic density.',
            scientificExperiment: 'Terje Lømo first discovered LTP in the rabbit perforant path: High-frequency tetanic stimulation triggered an enduring increase in excitatory postsynaptic potentials lasting days to weeks.',
            actionProtocol: [
              'Introduce challenging friction points in practice to evoke high-intensity bursts that trigger LTP.',
              'Incorporate restorative rest immediately post-session to allow protein synthesis and receptor stabilization.'
            ],
            neuroQuote: '"LTP is the brain\'s permanent memorandum for high-priority connections; LTD is the eraser wiping out background noise."',
            tags: ['LTP', 'LTD', 'AMPA Receptors', 'NMDA Channels']
          }
        },
        {
          id: 'structural-plasticity',
          label: 'Structural Plasticity & Myelination',
          shortDesc: 'Dendritic spine remodeling and oligodendrocyte wrapping providing a 100-fold boost in conduction velocity.',
          category: 'mechanism',
          importance: 'core',
          iconName: 'Network',
          details: {
            summary: 'Neuroplasticity goes far beyond electrical gain: Dendrites branch, axons sprout collateral boutons, and oligodendrocytes wrap axons in concentric myelin sheets for saltatory conduction.',
            keyPrinciple: 'Myelination is the biological substrate of mastery. Deliberate practice is fundamentally an exercise in precision oligodendrocyte insulation.',
            scientificExperiment: 'Diffusion Tensor Imaging (DTI) of concert pianists demonstrated that individuals who practiced intensively during youth possessed significantly thicker white matter tracts connecting motor regions.',
            actionProtocol: [
              'Practice slowly and flawlessly when acquiring new movement patterns: Sloppy practice wraps errors in permanent myelin!',
              'Ensure adequate intake of DHA and healthy lipids required for myelin membrane synthesis.'
            ],
            neuroQuote: '"Myelin insulates excellence: Every accurate repetition wraps another protective layer of lipid around the neural highway."',
            tags: ['Myelination', 'Dendritic Spines', 'Axonal Sprouting', 'White Matter']
          }
        },
        {
          id: 'adult-neurogenesis',
          label: 'Adult Neurogenesis',
          shortDesc: 'The dentate gyrus births new neurons daily, supporting episodic memory and pattern separation for life.',
          category: 'mechanism',
          importance: 'high',
          iconName: 'Layers',
          details: {
            summary: 'Shattering the dogma that adult brains cannot generate new neurons: Neural stem cells in the subgranular zone of the hippocampus continuously proliferate and integrate into existing circuits.',
            keyPrinciple: 'Immature newborn neurons display hyper-plasticity thresholds, excelling at encoding novel episodic experiences without overwriting older memories.',
            scientificExperiment: 'Peter Eriksson and Fred Gage (1998) utilized BrdU (bromodeoxyuridine) post-mortem tracing to conclusively verify the existence of adult neurogenesis in the human hippocampus.',
            actionProtocol: [
              'Engage in aerobic cardiovascular exercise: Running is the most potent natural catalyst for hippocampal neurogenesis.',
              'Mitigate chronic psychological distress: Elevated cortisol atrophies hippocampal progenitors and halts neurogenesis.'
            ],
            neuroQuote: '"Even in your eightieth decade, embryonic-grade neural stem cells remain poised in hippocampal depths, awaiting the signal to sprout."',
            tags: ['Adult Neurogenesis', 'Hippocampus', 'Dentate Gyrus', 'Stem Cells']
          }
        },
        {
          id: 'cortical-reorganization',
          label: 'Cortical Reorganization & Cross-Modal Compensation',
          shortDesc: 'Sensory substitution and territorial takeovers: The visual cortex re-purposed for touch and audition in the blind.',
          category: 'mechanism',
          importance: 'high',
          iconName: 'GitFork',
          details: {
            summary: 'When a sensory channel is lost or a limb amputated, the corresponding cortical real estate does not wither away; it is colonised by neighboring senses in a remarkable display of cross-modal plasticity.',
            keyPrinciple: 'The neocortex is not an organ tied to specific hardware, but a general-purpose pattern-recognition and computational engine.',
            scientificExperiment: 'Paul Bach-y-Rita invented the Tactile Visual Substitution System (TVSS): Camera feeds converted into electric arrays on the tongue enabled blind subjects to perceive 3D objects directly via their visual cortex.',
            actionProtocol: [
              'Leverage multimodal learning: Integrate auditory, visual, kinetic, and verbal modes to recruit expansive cortical zones.',
              'In stroke rehabilitation, employ forced-use drills to stimulate healthy adjacent tissue to assume lost functions.'
            ],
            neuroQuote: '"We see with our brains, not with our eyes; the eye is merely a transducer converting photon waves into action potentials." — Dr. Paul Bach-y-Rita',
            tags: ['Cortical Remapping', 'Sensory Substitution', 'Cross-Modal', 'Bach-y-Rita']
          }
        }
      ]
    },
    {
      id: 'chemical-drivers',
      label: '3. Neurochemical Drivers & Catalysts',
      shortDesc: 'The essential neuromodulatory switches that unlock adult cortical rewiring windows.',
      category: 'neurochem',
      importance: 'core',
      iconName: 'FlaskConical',
      details: {
        summary: 'Plasticity does not occur in a vacuum. Brain remodeling is tightly gated by neuromodulators. Without these four chemical catalysts, the brain remains in an energy-saving, stable baseline state.',
        keyPrinciple: 'Attention focus (Acetylcholine), vigilance/arousal (Norepinephrine), reinforcement (Dopamine), and growth fertilizer (BDNF) comprise the biochemical pillars of neuroplasticity.',
        scientificExperiment: 'Stimulating the nucleus basalis of Meynert (NBM) or infusing acetylcholine agonists enabled adult animals to reorganize their auditory cortex as freely as juveniles.',
        actionProtocol: [
          'Audit your biochemical state: Lethargy prevents rewiring, while hyper-stress floods the brain with neurotoxic cortisol levels.',
          'Celebrate micro-successes to generate dopamine spikes that biochemically stamp newly forged synapses.'
        ],
        neuroQuote: '"Acetylcholine aims the spotlight, norepinephrine sounds the alarm, and BDNF brings the cement and bricks onto the construction site."',
        tags: ['Neuromodulators', 'Molecular Catalysts', 'Biochemical Gates']
      },
      children: [
        {
          id: 'acetylcholine',
          label: 'Acetylcholine (ACh) - The Focus Spotlight',
          shortDesc: 'Basal forebrain messenger highlighting specific synapses earmarked for overnight remodeling.',
          category: 'neurochem',
          importance: 'core',
          iconName: 'Eye',
          details: {
            summary: 'When attention is concentrated, the nucleus basalis releases acetylcholine across cortex, suppressing background noise and magnifying receptive fields destined for structural adaptation.',
            keyPrinciple: 'No focus, no rewiring. Mindless mechanical repetition fails to remodel brain architecture; only attentive practice triggers physical re-wiring.',
            scientificExperiment: 'Studies compared pianists practicing with intense auditory scrutiny versus those mechanically pressing keys while distracted by television: Only the focused group exhibited cortical map expansion.',
            actionProtocol: [
              'Perform a 60-second visual gaze fixation drill prior to deep work to recruit frontal acetylcholine.',
              'Eliminate multitasking: Each cognitive switch resets and diffuses the cholinergic spotlight.'
            ],
            neuroQuote: '"Acetylcholine leaves a fluorescent tag on target circuits: \'During deep sleep tonight, reinforce these specific connections!\'"',
            tags: ['Acetylcholine', 'Attention', 'Focal Spotlight', 'Nucleus Basalis']
          }
        },
        {
          id: 'bdnf',
          label: 'Brain-Derived Neurotrophic Factor (BDNF)',
          shortDesc: 'The master protein fertilizer stimulating arborization, spine stabilization, and neuronal survival.',
          category: 'neurochem',
          importance: 'core',
          iconName: 'Sprout',
          details: {
            summary: 'Referred to by neuroscientists as "Miracle-Gro for the brain." BDNF binds to TrkB receptors, directly accelerating protein synthesis and promoting dendritic spine maturation.',
            keyPrinciple: 'BDNF is both a prerequisite for and a consequence of neuroplastic activity. Exercise and cognitive novelty dramatically upregulate BDNF expression.',
            scientificExperiment: 'In BDNF knockout mice, LTP was virtually abolished, causing severe spatial maze amnesia. Supplementing BDNF reversed cognitive deficits and restored spine density in aging rodents.',
            actionProtocol: [
              'Engage in 20–30 minutes of vigorous aerobic exercise 3–4 times weekly (above 75% max heart rate) to trigger BDNF surges.',
              'Intermittent fasting (16:8) and sauna exposure activate metabolic pathways that further elevate BDNF.'
            ],
            neuroQuote: '"A brain without BDNF is like parched arid soil: Regardless of how many seeds of knowledge you sow, synapses fail to take root."',
            tags: ['BDNF', 'Neurotrophin', 'Spine Growth', 'TrkB Receptor']
          }
        },
        {
          id: 'dopamine',
          label: 'Dopamine (DA) - Reinforcement & Consolidation',
          shortDesc: 'Reward prediction errors stamping circuits: "This behavior is vital to survival; preserve it!"',
          category: 'neurochem',
          importance: 'high',
          iconName: 'Trophy',
          details: {
            summary: 'Dopamine is far more than pleasure: It is a synaptic tagging agent. When an outcome exceeds expectation (positive reward prediction error), dopamine signals the brain to convert early labile LTP into enduring late-phase LTP.',
            keyPrinciple: 'Dopamine bridges the gap between transient electrophysiological activation and the permanent gene transcription required for physical wiring.',
            scientificExperiment: 'Wolfram Schultz\'s landmark monkey conditioning experiments proved dopamine neurons fire vigorously upon unexpected rewards, sensitizing synapses to glutamate transmission.',
            actionProtocol: [
              'Deconstruct long-term goals into achievable micro-wins, consciously acknowledging completions with intrinsic satisfaction.',
              'Avoid high-frequency artificial dopamine spikes (endless social feeds, hyper-palatable snacks) during demanding work.'
            ],
            neuroQuote: '"Dopamine not only propels us forward; it acts as the chemical sealant cementing freshly carved neural highways."',
            tags: ['Dopamine', 'Reward Prediction Error', 'Circuit Consolidation', 'Intrinsic Drive']
          }
        },
        {
          id: 'norepinephrine',
          label: 'Norepinephrine (NE) - Vigilance & Friction Gate',
          shortDesc: 'Locus coeruleus alert signal: Productive error friction triggering heightened synaptic receptivity.',
          category: 'neurochem',
          importance: 'high',
          iconName: 'AlertCircle',
          details: {
            summary: 'Originating in the locus coeruleus, norepinephrine increases cortical signal-to-noise ratio during novelty, perceived friction, or challenge, priming synapses into a malleable state.',
            keyPrinciple: 'No friction, no rewiring. The subjective sensation of struggle during practice is norepinephrine signaling: "The existing circuit is insufficient; adapt immediately!"',
            scientificExperiment: 'Motor learning trials demonstrated that effortless, error-free repetition yields negligible cortical change, whereas sessions calibrated to ~15% error rates elicit optimal norepinephrine and fastest mastery.',
            actionProtocol: [
              'Reframe feelings of cognitive difficulty or practice frustration as the biological hallmark of neuroplastic re-wiring.',
              'Calibrate optimal arousal: Avoid both sleepy apathy (low NE) and paralyzing panic (excessive NE saturation).'
            ],
            neuroQuote: '"That stinging frustration when struggling through a difficult drill is the audible drill bit of the brain carving new circuits."',
            tags: ['Norepinephrine', 'Locus Coeruleus', 'Error-Driven Learning', 'Adaptive Stress']
          }
        }
      ]
    },
    {
      id: 'practical-methods',
      label: '4. Practical Methods & Toolkit',
      shortDesc: 'Clinical rehabilitation, habit substitution, and rapid skill acquisition methodologies.',
      category: 'practice',
      importance: 'core',
      iconName: 'Flame',
      details: {
        summary: '"The Brain That Changes Itself" documents groundbreaking applications: Edward Taub\'s CIMT, Ramachandran\'s mirror boxes, and cognitive re-tuning protocols transforming modern rehabilitation.',
        keyPrinciple: 'Targeted, high-intensity, progressively overloaded practice rich in error feedback and conscious agency reshapes any measurable neural structure.',
        scientificExperiment: 'Edward Taub developed Constraint-Induced Movement Therapy (CIMT). By binding the healthy arm of chronic stroke patients, he forced intensive use of the paralyzed limb, reviving dormant circuits and doubling motor cortex representation.',
        actionProtocol: [
          'Identify "learned nonuse" patterns in your life; deliberately step into discomfort to revive underutilized cognitive domains.',
          'Pair physical execution with mental simulation to multiply structural neuroplastic gains.'
        ],
        neuroQuote: '"The most devastating neural decay is not caused by original trauma, but by cortical atrophy resulting from giving up on trying." — Dr. Edward Taub',
        tags: ['Practical Tools', 'Clinical Intervention', 'Habit Override', 'Accelerated Learning']
      },
      children: [
        {
          id: 'deliberate-practice',
          label: 'Deliberate Practice & Error Correction',
          shortDesc: 'Operating at the edge of capability: High-frequency feedback loops remodeling cortical topology.',
          category: 'practice',
          importance: 'core',
          iconName: 'Target',
          details: {
            summary: 'Anders Ericsson\'s deliberate practice model explained through neuroscience: Micro-operations executed outside the comfort zone break automated scripts and force nanometer synaptic reorganization.',
            keyPrinciple: 'Automaticity is the graveyard of neuroplasticity. To continue rewiring, one must deconstruct routines into micro-drills accompanied by rigorous error detection.',
            scientificExperiment: 'Eleanor Maguire\'s structural MRI studies of London taxi drivers: Preparing for "The Knowledge" examination spurred significant posterior hippocampal gray matter expansion proportional to navigation experience.',
            actionProtocol: [
              'Isolate micro-movements and focus on rectifying one precise deficiency per training block.',
              'Implement objective recordings and metrics, denying the brain room for vague rationalization.'
            ],
            neuroQuote: '"Mechanical repetition for 10,000 hours merely ingrains mediocrity; only 10,000 deliberate strikes with feedback carve mastery into cortex."',
            tags: ['Deliberate Practice', 'Error Correction', 'London Taxi Study', 'Hippocampal Growth']
          }
        },
        {
          id: 'mental-practice',
          label: 'Mental Rehearsal & Motor Imagery',
          shortDesc: 'Vivid internal visualization reorganizing motor cortex and cerebellar networks identical to physical movement.',
          category: 'practice',
          importance: 'core',
          iconName: 'Compass',
          details: {
            summary: 'Neuroimaging reveals that vividly imagining a physical action activates the supplementary motor area, premotor cortex, and cerebellum in near-total overlap with physical execution.',
            keyPrinciple: 'The central nervous system cannot fully distinguish between hyper-vivid internal simulation and external reality. Mental rehearsal acts as direct physical input.',
            scientificExperiment: 'Alvaro Pascual-Leone instructed one group of volunteers to practice piano exercises physically for 2 hours daily, while a second group visualized playing the exact notes. After 5 days, motor map expansion was virtually identical in both cohorts.',
            actionProtocol: [
              'Engage in 10 minutes of first-person mental simulation before challenging performances or conversations, feeling muscle tensions and sensory cues.',
              'Alternate physical drills with mental imagery: 5 mins physical -> 1 min visualization -> resume practice.'
            ],
            neuroQuote: '"Thought itself is a physical force; to think deeply is to reshape the very architecture of our brains with an invisible chisel." — Dr. Norman Doidge',
            tags: ['Mental Practice', 'Motor Imagery', 'Pascual-Leone', 'Cortical Remodeling']
          }
        },
        {
          id: 'cimt-therapy',
          label: 'Constraint-Induced Movement Therapy (CIMT)',
          shortDesc: 'Blocking compensatory shortcuts to compel dormant, atrophied neural pathways to awaken.',
          category: 'practice',
          importance: 'high',
          iconName: 'Lock',
          details: {
            summary: 'Many chronic stroke victims suffer from "learned nonuse": Early post-stroke frustration prompts exclusive use of the intact limb, causing motor cortex atrophy. CIMT binds the good limb, forcing the affected side to perform daily tasks.',
            keyPrinciple: 'Eliminating the convenient path of least resistance is the most effective evolutionary stimulus for neural re-adaptation.',
            scientificExperiment: 'Taub\'s human trials proved that patients paralyzed for over a decade regained substantial functional hand dexterity following two weeks of intensive constraint therapy.',
            actionProtocol: [
              'Create physical environmental barriers against distractions (e.g., locking your phone in a timed container while writing).',
              'Use your non-dominant hand for basic daily tasks like brushing teeth or eating to stimulate interhemispheric balance.'
            ],
            neuroQuote: '"The brain is ruthlessly pragmatic: If a comfortable crutch is readily available, it will never expend metabolic energy repairing the damaged road."',
            tags: ['CIMT', 'Learned Nonuse', 'Forced Use', 'Edward Taub']
          }
        },
        {
          id: 'habit-override',
          label: 'Habit Circuit Bypass',
          shortDesc: 'Never attempt to blunt-force delete a circuit; graft a new synaptic bypass onto the existing cue.',
          category: 'practice',
          importance: 'high',
          iconName: 'GitCommit',
          details: {
            summary: 'Established habits are deeply myelinated in the basal ganglia; attempting to suppress them with brute willpower usually backfires. The viable neuroplastic strategy is keeping the cue and reward intact while splicing in a new constructive routine.',
            keyPrinciple: 'You cannot erase a multi-lane neural freeway, but you can build a high-speed bypass with superior dopamine payoff, allowing the old road to become overgrown with weeds.',
            scientificExperiment: 'Ann Graybiel\'s striatal recordings in rodents revealed that habit loops fire intensely upon the cue and reward. Even when suppressed, the old circuit remains intact unless overridden by an alternative loop.',
            actionProtocol: [
              'Identify the exact physiological trigger (boredom, fatigue, time of day) and establish an instant substitution (e.g., 10 air squats + cold water).',
              'Enforce a 15-second sacred pause when cravings strike to allow the prefrontal cortex to wrest control from the basal ganglia.'
            ],
            neuroQuote: '"Neuroplastic change is not about eradicating your past, but rendering old paths obsolete by building a brighter, faster alternative."',
            tags: ['Habit Loop', 'Basal Ganglia', 'Bypass Theory', 'Willpower Replacement']
          }
        },
        {
          id: 'exposure-reconsolidation',
          label: 'Exposure & Memory Reconsolidation',
          shortDesc: 'The brief labile window upon memory recall: Overwriting trauma and fear conditioning.',
          category: 'practice',
          importance: 'high',
          iconName: 'Shield',
          details: {
            summary: 'Memories are not static files burned onto a disk. Each time a long-term memory is retrieved, it becomes structurally unstable (labile) for several hours, presenting a golden window to rewrite or decouple emotional panic.',
            keyPrinciple: 'To recall is to rewrite. Memory reactivation opens a neurochemical window where fear charges can be safely extinguished.',
            scientificExperiment: 'Karim Nader and Joseph LeDoux demonstrated that administering protein synthesis inhibitors during fear memory recall completely eradicated conditioned fear responses in rodents.',
            actionProtocol: [
              'Revisit challenging memories while maintaining a slow heart rate and calm physiological breathing, binding safety cues to the old narrative.',
              'Use structured expressive writing to articulate traumatic experiences, recruiting prefrontal inhibitory control over amygdala reactivity.'
            ],
            neuroQuote: '"Memory is not a frozen photograph, but a living film reel that can be recut, re-colored, and re-narrated each time it is screened."',
            tags: ['Reconsolidation', 'Exposure Therapy', 'Trauma Rewriting', 'Fear Extinction']
          }
        }
      ]
    },
    {
      id: 'biological-pillars',
      label: '5. Biological Pillars & Lifestyle Optimization',
      shortDesc: 'Metabolic fuel for re-wiring: Synaptic sleep pruning, aerobic exercise, and stress mitigation.',
      category: 'biology',
      importance: 'core',
      iconName: 'Activity',
      details: {
        summary: 'Neuroplasticity is an energy-demanding cellular process. Without slow-wave sleep, optimal cerebral blood flow, and balanced cortisol, cognitive training cannot translate into physical synaptic consolidation.',
        keyPrinciple: 'Stress and daytime focus apply the blueprint and chemical tags; slow-wave night sleep cements the structural synapses. Remodeling occurs during recovery.',
        scientificExperiment: 'Giulio Tononi and Chiara Cirelli formulated the Synaptic Homeostasis Hypothesis (SHY): Wakefulness induces net synaptic potentiation that saturates energy; deep slow-wave sleep scales down synapses proportionally, preserving signal while pruning noise.',
        actionProtocol: [
          'Treat sleep as the essential 50% of the learning equation: Depriving sleep nullifies daytime deliberate practice.',
          'Schedule cardiovascular workouts within 60 minutes of demanding cognitive studies to harness post-exercise neurotrophin surges.'
        ],
        neuroQuote: '"By day we plant the seeds of neural change; only in the deep stillness of slow-wave sleep does the brain pour the concrete."',
        tags: ['Biological Pillars', 'Sleep Pruning', 'Aerobic Exercise', 'Mindfulness']
      },
      children: [
        {
          id: 'aerobic-exercise',
          label: 'Aerobic Exercise & Neurogenesis',
          shortDesc: 'Elevated cardiac output releasing irisin and lactate to cross the blood-brain barrier and ignite BDNF.',
          category: 'biology',
          importance: 'core',
          iconName: 'Flame',
          details: {
            summary: 'Cardiovascular exercise is the only non-pharmacological intervention conclusively proven to expand hippocampal volume and accelerate neurogenesis in humans by upregulating irisin, cathepsin B, and VEGF.',
            keyPrinciple: 'The human brain evolved to learn while navigating and moving across diverse terrain. Physical movement switches on high-gear adaptive plasticity.',
            scientificExperiment: 'Arthur Kramer\'s randomized trials showed that older adults performing aerobic walking 3 times weekly for 6 months experienced a 1%–2% increase in hippocampal and prefrontal volume, reversing age-related decline by 1–2 years.',
            actionProtocol: [
              'Perform 20 minutes of moderate-to-vigorous running, rowing, or cycling prior to tackling abstract concepts.',
              'Integrate walking meetings into daily workflows to stimulate divergent creative synaptic connectivity.'
            ],
            neuroQuote: '"If you desire a sharp, malleable brain, your heart must first forcefully pump oxygenated blood into the cranial vault." — Dr. John Ratey',
            tags: ['Aerobic Exercise', 'Hippocampus Volume', 'Irisin', 'Angiogenesis']
          }
        },
        {
          id: 'sleep-synaptic-homeostasis',
          label: 'Slow-Wave Sleep & Synaptic Homeostasis',
          shortDesc: 'Non-REM sleep scaling back hyper-saturated connections; REM weaving episodic memories into neocortex.',
          category: 'biology',
          importance: 'core',
          iconName: 'Moon',
          details: {
            summary: 'Wakefulness saturates synaptic connections, draining energy reserves and impairing new encoding. Slow-Wave Sleep (SWS) prunes redundant synapses and transfers temporary hippocampal memories into neocortical vaults.',
            keyPrinciple: 'Rewiring is not merely additive; it is fundamentally subtractive during sleep. Without nocturnal pruning, neural circuits risk excitotoxic overload.',
            scientificExperiment: 'Matthew Walker\'s laboratory demonstrated that a single night of sleep deprivation impaired hippocampal learning capacity by up to 40%, with sleep spindle density predicting next-day recovery of plasticity.',
            actionProtocol: [
              'Maintain consistent sleep timings, eliminating blue-spectrum screen light 60 minutes prior to bedtime.',
              'Utilize Non-Sleep Deep Rest (NSDR / Yoga Nidra) for 20 minutes if fatigued during the workday for synaptic resets.'
            ],
            neuroQuote: '"Sleep is the master sculptor: It flushes metabolic debris via the glymphatic system and chisels raw neural clay into enduring masterpieces."',
            tags: ['Slow-Wave Sleep', 'Synaptic Homeostasis', 'Memory Consolidation', 'Glymphatic System']
          }
        },
        {
          id: 'mindfulness-stress',
          label: 'Mindfulness & Cortisol Reversal',
          shortDesc: 'Downsizing the hyperactive amygdala while thickening the rational prefrontal cortex and hippocampus.',
          category: 'biology',
          importance: 'high',
          iconName: 'Smile',
          details: {
            summary: 'Chronic elevated cortisol from stress acts as a neurotoxin, pruning hippocampal dendrites and inflaming the amygdala. Mindfulness meditation re-establishes prefrontal inhibitory control over the HPA axis.',
            keyPrinciple: 'Mental training does not simply improve mood; it alters regional gray matter density in emotion-regulation hubs.',
            scientificExperiment: 'Sara Lazar\'s Harvard neuroimaging trials of an 8-week MBSR program demonstrated measurable reductions in amygdalar gray matter alongside increases in the hippocampus and insula.',
            actionProtocol: [
              'Practice 10–15 minutes of focused breath meditation each morning, gently returning attention whenever the mind wanders.',
              'Deploy physiological sighs (two short inhales followed by one long, vocal exhalation) to immediately downregulate acute sympathetic panic.'
            ],
            neuroQuote: '"Mindfulness is not mysticism; it is physical gymnastics installing high-performance prefrontal brake pads on an overworked brain."',
            tags: ['Mindfulness', 'Amygdala Downregulation', 'Cortisol', 'Gray Matter']
          }
        },
        {
          id: 'environmental-enrichment',
          label: 'Environmental Enrichment & Novelty',
          shortDesc: 'Escaping monotone routines: Foreign languages, musical instruments, and unfamiliar routes spurring dendritic branching.',
          category: 'biology',
          importance: 'high',
          iconName: 'Globe',
          details: {
            summary: 'Rodents housed in enriched environments with wheels, tunnels, and social interaction show a 25% increase in cortical synaptic branching. Monotony is the enemy of neuroplasticity.',
            keyPrinciple: 'Novelty is the ultimate anti-aging stimulus for the brain. Uncharted challenges break default automaticity and mobilize neural cognitive reserve.',
            scientificExperiment: 'David Snowdon\'s famous Nun Study: Nuns with lifelong habits of intensive reading and intellectual engagement showed extensive post-mortem Alzheimer\'s pathology yet exhibited zero clinical dementia symptoms in life due to massive synaptic reserve.',
            actionProtocol: [
              'Master at least one complex new motor or intellectual domain annually (e.g., skiing, sketching, violin, coding, foreign language).',
              'Vary daily commute paths periodically to force hippocampal place and grid cells to render new topological maps.'
            ],
            neuroQuote: '"A lifetime of diverse, enriched engagement builds an impregnable cognitive reserve that even neurodegenerative plaques struggle to breach."',
            tags: ['Enrichment', 'Novelty', 'Cognitive Reserve', 'Nun Study']
          }
        }
      ]
    },
    {
      id: 'plastic-paradox',
      label: '6. The Plastic Paradox & Maladaptive Rewiring',
      shortDesc: 'The double-edged sword: How plasticity hardwires addiction, phantom limb pain, chronic sensitization, and OCD.',
      category: 'paradox',
      importance: 'high',
      iconName: 'AlertTriangle',
      details: {
        summary: 'Neuroplasticity is an agnostic biological sculptor. With the same ruthless precision that it crafts athletic or cognitive mastery, it can cement anxiety, chronic neuropathic pain, and addictions into deep neural circuitry.',
        keyPrinciple: 'The Plastic Paradox: The very malleability that affords us extraordinary adaptability can also entrench us in rigid, agonizing behavioral prisons.',
        scientificExperiment: 'V.S. Ramachandran investigated amputees experiencing phantom limb spasms. With sensory input gone, facial cortical representations invaded the vacant hand area, causing patients to feel hand sensations when touched on the face. His invention of the Mirror Box successfully untangled the brain\'s erroneous sensory map.',
        actionProtocol: [
          'Maintain vigilance over negative mental rumination: Every repeated anxious loop physically deepens its underlying circuit.',
          'Undergo pain neuroscience education (PNE): Recognize that non-structural chronic pain is frequently a learned, hyper-sensitized alarm system.'
        ],
        neuroQuote: '"The same plasticity that makes us flexible can also make us rigid; it allows our brains to be cast into unyielding molds." — Dr. Norman Doidge',
        tags: ['Plastic Paradox', 'Phantom Limb', 'Ramachandran', 'Mirror Box', 'Central Sensitization']
      },
      children: [
        {
          id: 'phantom-limb',
          label: 'Phantom Limb & Cortical Reorganization',
          shortDesc: 'Vacated sensory zones invaded by neighboring inputs: Using mirror feedback to unlock paralyzed pain memories.',
          category: 'paradox',
          importance: 'high',
          iconName: 'Maximize2',
          details: {
            summary: 'Amputees often experience their missing hand clenching with excruciating pain. Motor cortex continues sending clenching commands, but lacking proprioceptive feedback, the circuit enters a screaming feedback loop.',
            keyPrinciple: 'Neuroplastic cross-talk leads to sensory confusion; in turn, cross-modal visual illusion can unravel the false pain projection.',
            scientificExperiment: 'Ramachandran positioned a vertical mirror between the intact and phantom limbs. Seeing the reflected intact hand open freely resolved years of unyielding phantom fist spasms in seconds.',
            actionProtocol: [
              'Deploy multisensory visual illusions and feedback mirrors when dealing with complex regional pain or trauma loops.',
              'Recognize that perception is the brain\'s predictive best-guess inference, not an absolute objective readout.'
            ],
            neuroQuote: '"The mirror box is an astonishing triumph in neurology: A simple pane of glass accomplished what tons of narcotic analgesics failed to achieve."',
            tags: ['Phantom Limb', 'Mirror Therapy', 'Perceptual Rewriting', 'Ramachandran']
          }
        },
        {
          id: 'central-sensitization',
          label: 'Central Sensitization & Chronic Pain',
          shortDesc: 'When bodily tissues heal, yet the nervous system locks the alarm sensitivity threshold at maximum volume.',
          category: 'paradox',
          importance: 'high',
          iconName: 'ZapOff',
          details: {
            summary: 'Many patients with chronic back pain or fibromyalgia have fully healed structural tissues, yet endure severe agony. The dorsal horn and sensory cortex develop LTP-like memory for pain signals — the brain has learned pain!',
            keyPrinciple: 'Chronic pain is frequently an over-learned neural circuit. Plasticity turns a protective fire alarm into a deafening, stuck siren.',
            scientificExperiment: 'Functional MRI shows acute pain activates somatosensory regions (localization), whereas chronic pain shifts activation into the medial prefrontal cortex and nucleus accumbens, becoming an emotional memory.',
            actionProtocol: [
              'Embrace Pain Neuroscience Education (PNE): Realizing that "hurt does not equal tissue harm" recalibrates threat appraisal.',
              'Engage in graded, progressive movement exposure in non-threatening contexts to desensitize hyperactive pain circuits.'
            ],
            neuroQuote: '"Pain is not a direct thermometer of bodily injury; it is an alarm prediction calculated from expectations, fears, and memories."',
            tags: ['Central Sensitization', 'Chronic Pain', 'Pain Memory', 'PNE']
          }
        },
        {
          id: 'addiction-circuits',
          label: 'Addiction & Maladaptive Plasticity',
          shortDesc: 'Supra-physiological stimulation welding dopamine pathways while numbing everyday rewards.',
          category: 'paradox',
          importance: 'high',
          iconName: 'Repeat',
          details: {
            summary: 'Addictions (substances, gambling, digital feeds) are classic manifestations of hijacked neuroplasticity. Floods of dopamine downregulate striatal D2 receptors while soldering compulsive trigger synapses into solid iron.',
            keyPrinciple: 'Addiction is a pathological form of learning: The brain is so proficient at adapting that it treats self-destructive urges as vital survival imperatives.',
            scientificExperiment: 'Nora Volkow\'s PET studies verified profound downregulation of striatal dopamine D2 receptors in addicted brains. Following months of complete abstinence, receptor populations progressively regenerate.',
            actionProtocol: [
              'Conduct a Dopamine Detox: Abstain from hyper-palatable artificial stimuli for 2–4 weeks to allow D2 receptor upregulation.',
              'Dismantle immediate gratification loops, patiently cultivating neural sensitivity to delayed, high-craft achievements.'
            ],
            neuroQuote: '"Addiction is the tragic outcome of Hebb\'s law executed without mercy: What you repeat, the brain faithfully becomes."',
            tags: ['Addiction Plasticity', 'Dopamine Receptors', 'Nucleus Accumbens', 'Dopamine Detox']
          }
        }
      ]
    }
  ]
};

export const PRESET_PRACTICE_PROTOCOLS_EN: PracticeProtocol[] = [
  {
    id: 'protocol-focus-window',
    title: '90-Minute Ultradian Rewiring Block',
    category: 'Synaptic Plasticity / Skill Acquisition',
    difficulty: '入门',
    timeEstimate: '90 Minutes',
    neuroscientificRationale: 'Leverages the 90-minute human ultradian cycle. Early phase recruits norepinephrine for alertness, mid-phase floods acetylcholine to gate LTP, and the quiet terminal phase protects synapses from retroactive interference.',
    steps: [
      'Min 0–5: Eliminate all notifications. Fixate eyes upon a single wall or screen mark for 60 seconds to mobilize basal forebrain acetylcholine.',
      'Min 5–75: Engage in high-friction deliberate practice at the boundary of competence (tolerate ~15% error rate).',
      'Min 75–90: Cease work immediately. Strictly avoid digital devices; sit quietly or walk for 10 minutes to allow electrical spikes to convert into early protein synthesis.'
    ],
    keyMolecules: ['Acetylcholine (ACh)', 'Norepinephrine (NE)', 'Glutamate'],
    isCompleted: false,
  },
  {
    id: 'protocol-exercise-bdnf',
    title: 'Exercise-Induced Neurogenesis Protocol',
    category: 'Biological Optimization / Neurogenesis',
    difficulty: '核心',
    timeEstimate: '45 Minutes',
    neuroscientificRationale: 'Moderate-to-vigorous aerobic exercise triggers skeletal muscle irisin release across the blood-brain barrier, stimulating hippocampal BDNF synthesis and unlocking a 2-hour golden window of hyper-plasticity.',
    steps: [
      'Step 1: Perform 20 minutes of aerobic interval sprints or running (heart rate reaching 75%–85% of maximum).',
      'Step 2: Hydrate, replenish light electrolytes, and normalize breathing for 5 minutes.',
      'Step 3: Within 20–60 minutes post-workout, immediately begin your most demanding cognitive learning or motor drill, anchoring onto peak BDNF concentrations.'
    ],
    keyMolecules: ['BDNF', 'Irisin', 'VEGF (Vascular Endothelial Growth Factor)'],
    isCompleted: false,
  },
  {
    id: 'protocol-mental-practice',
    title: 'Pascual-Leone Motor Imagery Protocol',
    category: 'Mental Simulation / Skill Refinement',
    difficulty: '进阶',
    timeEstimate: '15 Minutes',
    neuroscientificRationale: 'Alvaro Pascual-Leone proved that vivid mental imagery activates the primary motor cortex and cerebellum with equivalent fidelity to physical execution, stimulating presynaptic growth and axonal myelination.',
    steps: [
      'Step 1: In a quiet setting, close your eyes and perform 3 physiological sighs to establish parasympathetic dominance.',
      'Step 2: From a first-person perspective (looking through your own eyes, not as a detached spectator), replay the target action with hyper-slow, meticulous precision.',
      'Step 3: Feel muscle tensions, micro-corrections, and tactile sensations; correct mental errors actively across 5 consecutive sets.'
    ],
    keyMolecules: ['Motor Cortex EPSPs', 'Cerebellar Purkinje Cells'],
    isCompleted: false,
  },
  {
    id: 'protocol-habit-bypass',
    title: 'Hebbian Habit Loop Override Protocol',
    category: 'Habit Modification / Inhibitory Rewiring',
    difficulty: '进阶',
    timeEstimate: '21 Days Continuous',
    neuroscientificRationale: 'Hebb\'s law dictates that dormant circuits dissociate, but established basal ganglia loops cannot be erased by willpower alone. Splicing a low-friction, rewarding alternative onto the existing cue allows the old pathway to atrophy.',
    steps: [
      'Step 1: Precisely identify physiological precursors triggering the bad habit (e.g., chest tightness, absent-minded phone reaching).',
      'Step 2: Enforce a "15-second sacred pause": Count down 15 seconds to allow the prefrontal cortex to reclaim executive control.',
      'Step 3: Execute the pre-planned replacement action immediately (e.g., 10 deep air squats + glass of cold water), concluding with intrinsic self-acknowledgment.'
    ],
    keyMolecules: ['Dopamine (DA)', 'Prefrontal Glutamatergic Projections', 'GABA Interneurons'],
    isCompleted: false,
  },
  {
    id: 'protocol-sleep-pruning',
    title: 'Synaptic Homeostasis Sleep Protocol',
    category: 'Biological Optimization / Synaptic Pruning',
    difficulty: '入门',
    timeEstimate: 'Nocturnal Execution',
    neuroscientificRationale: 'According to Giulio Tononi\'s SHY hypothesis, deep slow-wave sleep prunes noisy, weak connections while REM sleep integrates memories into broader cortical architectures. Sleep deprivation degrades signal-to-noise ratios.',
    steps: [
      '90 mins before bed: Take a warm shower or footbath, promoting a 1°C drop in core body temperature to facilitate slow-wave onset.',
      'Dim overhead lights, strictly avoiding high-stimulation digital screens in the bedroom.',
      'Spend 3 minutes hand-writing tomorrow\'s single most critical objective, offloading prefrontal working memory prior to sleep.'
    ],
    keyMolecules: ['Adenosine', 'Growth Hormone', 'Melatonin'],
    isCompleted: false,
  }
];
