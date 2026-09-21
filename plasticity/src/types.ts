export type NodeCategory = 
  | 'paradigm'     // 核心范式转变
  | 'mechanism'    // 关键重塑机制
  | 'neurochem'    // 神经化学驱动
  | 'practice'     // 实践重塑方法
  | 'biology'      // 生理与生活方式支柱
  | 'paradox';     // 可塑性的双刃剑

export type NodeImportance = 'core' | 'high' | 'medium';

export interface MindMapNode {
  id: string;
  label: string;
  shortDesc: string;
  category: NodeCategory;
  importance: NodeImportance;
  iconName?: string;
  details: {
    summary: string;
    keyPrinciple: string;
    scientificExperiment?: string;
    actionProtocol: string[];
    neuroQuote?: string;
    tags: string[];
  };
  children?: MindMapNode[];
}

export interface FlattenedNode {
  node: MindMapNode;
  depth: number;
  x: number;
  y: number;
  parent?: FlattenedNode;
  isExpanded: boolean;
  hasChildren: boolean;
  childCount: number;
}

export interface PracticeProtocol {
  id: string;
  title: string;
  category: string;
  difficulty: '入门' | '进阶' | '核心';
  timeEstimate: string;
  neuroscientificRationale: string;
  steps: string[];
  keyMolecules: string[];
  isCompleted?: boolean;
}
