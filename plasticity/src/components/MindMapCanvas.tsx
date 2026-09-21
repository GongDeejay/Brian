import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  Cpu, 
  Flame, 
  FlaskConical, 
  Activity, 
  AlertTriangle,
  Layers,
  Search,
  CheckCircle,
  Eye,
  SlidersHorizontal,
  FolderTree,
  CircleDot,
  LayoutGrid
} from 'lucide-react';
import { MindMapNode, NodeCategory } from '../types';
import { CATEGORY_CONFIG } from '../data/neuroplasticityData';
import { CATEGORY_CONFIG_EN } from '../data/neuroplasticityDataEn';
import { Language, TRANSLATIONS } from '../data/translations';

interface MindMapCanvasProps {
  rootNode: MindMapNode;
  onSelectNode: (node: MindMapNode) => void;
  selectedNodeId?: string;
  searchQuery: string;
  activeCategoryFilter: string;
  lang?: Language;
}

export type ViewLayoutMode = 'tree' | 'radial' | 'bento';

interface PositionedNode {
  node: MindMapNode;
  x: number;
  y: number;
  depth: number;
  parent?: PositionedNode;
  hasChildren: boolean;
  isExpanded: boolean;
  category: NodeCategory;
}

export const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  rootNode,
  onSelectNode,
  selectedNodeId,
  searchQuery,
  activeCategoryFilter,
  lang = 'zh',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang];
  const categories = lang === 'en' ? CATEGORY_CONFIG_EN : CATEGORY_CONFIG;

  // Canvas View Transformation
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 40 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<ViewLayoutMode>('tree');

  // Expanded nodes map (default: root & level 1 expanded)
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    root: true,
    'paradigm-shift': true,
    'core-mechanisms': true,
    'chemical-drivers': true,
    'practical-methods': true,
    'biological-pillars': true,
    'plastic-paradox': true,
  });

  const toggleExpand = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const expandAll = () => {
    const allIds: Record<string, boolean> = {};
    const traverse = (n: MindMapNode) => {
      allIds[n.id] = true;
      n.children?.forEach(traverse);
    };
    traverse(rootNode);
    setExpandedNodes(allIds);
  };

  const collapseToLevel1 = () => {
    const l1Ids: Record<string, boolean> = { root: true };
    rootNode.children?.forEach(c => {
      l1Ids[c.id] = false;
    });
    setExpandedNodes(l1Ids);
  };

  // Reset View
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 40, y: 40 });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on canvas background
    if ((e.target as HTMLElement).closest('.interactive-node-card')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || true) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom(z => Math.max(0.4, Math.min(2.2, z * zoomFactor)));
    }
  };

  // Auto-expand nodes that match search query
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const lower = searchQuery.toLowerCase();
    const toExpand: Record<string, boolean> = { root: true };

    const checkMatch = (n: MindMapNode): boolean => {
      let isMatch = 
        n.label.toLowerCase().includes(lower) || 
        n.shortDesc.toLowerCase().includes(lower) || 
        n.details.summary.toLowerCase().includes(lower) ||
        n.details.tags.some(t => t.toLowerCase().includes(lower));

      if (n.children) {
        for (const child of n.children) {
          if (checkMatch(child)) {
            isMatch = true;
            toExpand[n.id] = true;
          }
        }
      }
      return isMatch;
    };

    checkMatch(rootNode);
    setExpandedNodes(prev => ({ ...prev, ...toExpand }));
  }, [searchQuery, rootNode]);

  // Compute Layout Tree Coordinates
  const { positionedNodes, connections, canvasBounds } = useMemo(() => {
    const nodes: PositionedNode[] = [];
    const conns: { from: PositionedNode; to: PositionedNode }[] = [];
    let currentY = 80;
    const nodeWidth = 260;
    const colSpacing = 340;
    const rowSpacing = 95;

    // Helper to filter nodes based on category filter & search
    const isCategoryVisible = (cat: string) => {
      if (activeCategoryFilter === 'all') return true;
      return cat === activeCategoryFilter;
    };

    // Recursive tree layout calculation (Horizontal hierarchy)
    const layoutNode = (
      n: MindMapNode, 
      depth: number, 
      parentPos?: PositionedNode
    ): PositionedNode => {
      const hasChildren = Boolean(n.children && n.children.length > 0);
      const isExpanded = Boolean(expandedNodes[n.id]);

      // Calculate X coordinate based on depth
      const x = depth === 0 ? 60 : 60 + depth * colSpacing;
      
      const pNode: PositionedNode = {
        node: n,
        x,
        y: currentY,
        depth,
        parent: parentPos,
        hasChildren,
        isExpanded,
        category: n.category
      };

      if (parentPos) {
        conns.push({ from: parentPos, to: pNode });
      }

      if (hasChildren && isExpanded && n.children) {
        const filteredChildren = n.children.filter(c => 
          depth === 0 ? isCategoryVisible(c.category) : true
        );

        if (filteredChildren.length > 0) {
          const childNodes: PositionedNode[] = [];
          filteredChildren.forEach((child) => {
            const cPos = layoutNode(child, depth + 1, pNode);
            childNodes.push(cPos);
          });
          // Center parent Y between its children
          const firstChildY = childNodes[0].y;
          const lastChildY = childNodes[childNodes.length - 1].y;
          pNode.y = (firstChildY + lastChildY) / 2;
        } else {
          currentY += rowSpacing;
        }
      } else {
        currentY += rowSpacing;
      }

      nodes.push(pNode);
      return pNode;
    };

    layoutNode(rootNode, 0);

    // Calculate canvas size bounds
    const maxX = Math.max(...nodes.map(n => n.x + nodeWidth), 1200);
    const maxY = Math.max(...nodes.map(n => n.y + 120), 800);

    return {
      positionedNodes: nodes,
      connections: conns,
      canvasBounds: { width: maxX + 100, height: maxY + 100 }
    };
  }, [rootNode, expandedNodes, activeCategoryFilter]);

  // Check if a node is currently searched
  const isSearchMatch = (node: MindMapNode) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      node.label.toLowerCase().includes(q) ||
      node.shortDesc.toLowerCase().includes(q) ||
      node.details.tags.some(t => t.toLowerCase().includes(q))
    );
  };

  return (
    <div className="relative w-full h-[680px] lg:h-[750px] bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden select-none flex flex-col shadow-inner">
      {/* Top Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* View Mode Switcher */}
        <div className="pointer-events-auto flex items-center bg-zinc-900/90 backdrop-blur-md p-1 rounded-xl border border-zinc-700/80 shadow-lg text-xs">
          <button
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'tree'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            {t.viewTree}
          </button>
          <button
            onClick={() => setViewMode('bento')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'bento'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            {t.viewBento}
          </button>
        </div>

        {/* Tree Zoom & Expand Controls */}
        <div className="pointer-events-auto flex items-center gap-2 bg-zinc-900/90 backdrop-blur-md p-1 rounded-xl border border-zinc-700/80 shadow-lg text-xs">
          <button
            onClick={expandAll}
            className="px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title={t.expandAll}
          >
            {t.expandAll}
          </button>
          <button
            onClick={collapseToLevel1}
            className="px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title={t.collapseBranches}
          >
            {t.collapseBranches}
          </button>

          <div className="h-4 w-[1px] bg-zinc-700 mx-0.5" />

          <button
            onClick={() => setZoom(z => Math.min(2.0, z + 0.15))}
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-zinc-400 min-w-[36px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title={t.zoomReset}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      {viewMode === 'tree' ? (
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className={`w-full h-full cursor-grab active:cursor-grabbing overflow-hidden relative ${
            isDragging ? 'cursor-grabbing' : ''
          }`}
        >
          {/* Subtle neural grid background */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#4338ca 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              backgroundPosition: `${pan.x}px ${pan.y}px`,
            }}
          />

          {/* SVG Canvas for Bezier Connectors */}
          <svg
            className="absolute inset-0 pointer-events-none w-full h-full"
            style={{ overflow: 'visible' }}
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              <defs>
                <linearGradient id="conn-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {connections.map((conn, idx) => {
                const startX = conn.from.x + (conn.from.depth === 0 ? 240 : 250);
                const startY = conn.from.y + 40;
                const endX = conn.to.x;
                const endY = conn.to.y + 40;
                const cX1 = startX + (endX - startX) * 0.5;
                const cY1 = startY;
                const cX2 = startX + (endX - startX) * 0.5;
                const cY2 = endY;

                const catCfg = CATEGORY_CONFIG[conn.to.category] || CATEGORY_CONFIG.paradigm;
                const isSelected = selectedNodeId === conn.to.node.id || selectedNodeId === conn.from.node.id;

                return (
                  <g key={`conn-${idx}`}>
                    <path
                      d={`M ${startX} ${startY} C ${cX1} ${cY1}, ${cX2} ${cY2}, ${endX} ${endY}`}
                      fill="none"
                      stroke={isSelected ? catCfg.accent : '#374151'}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      strokeDasharray={conn.to.depth > 1 ? undefined : undefined}
                      className="transition-all duration-300"
                    />
                    {/* Pulsing signal dot on connected paths */}
                    <circle
                      cx={(startX + endX) / 2}
                      cy={(startY + endY) / 2}
                      r={isSelected ? 3.5 : 2}
                      fill={catCfg.accent}
                      opacity={0.7}
                    />
                  </g>
                );
              })}
            </g>
          </svg>

          {/* HTML Nodes Layer */}
          <div
            className="absolute top-0 left-0 pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              width: canvasBounds.width,
              height: canvasBounds.height,
            }}
          >
            {positionedNodes.map(pNode => {
              const node = pNode.node;
              const isRoot = pNode.depth === 0;
              const isSelected = selectedNodeId === node.id;
              const matched = isSearchMatch(node);
              const catConfig = categories[node.category] || categories.paradigm;

              return (
                <div
                  key={node.id}
                  style={{
                    position: 'absolute',
                    left: `${pNode.x}px`,
                    top: `${pNode.y}px`,
                    width: isRoot ? '240px' : '260px',
                  }}
                  className="pointer-events-auto interactive-node-card group"
                >
                  <div
                    onClick={() => onSelectNode(node)}
                    className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer shadow-lg relative ${
                      isRoot
                        ? 'bg-indigo-950/90 border-indigo-500 shadow-indigo-900/40 text-white'
                        : isSelected
                        ? 'bg-zinc-900 border-indigo-400 ring-2 ring-indigo-500/40 shadow-xl'
                        : matched
                        ? 'bg-zinc-900 border-amber-400 ring-2 ring-amber-400/40 text-zinc-100'
                        : 'bg-zinc-900/90 hover:bg-zinc-850 border-zinc-800 hover:border-zinc-700 text-zinc-200'
                    }`}
                  >
                    {/* Top tag and category */}
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1"
                        style={{
                          borderColor: `${catConfig.accent}60`,
                          color: catConfig.accent,
                          backgroundColor: `${catConfig.accent}15`,
                        }}
                      >
                        {catConfig.label}
                      </span>

                      {/* Expand / Collapse Button if has children */}
                      {pNode.hasChildren && (
                        <button
                          onClick={(e) => toggleExpand(node.id, e)}
                          className="px-1.5 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 font-mono flex items-center gap-1 transition-colors cursor-pointer"
                          title={pNode.isExpanded ? '收起子节点' : '展开子节点'}
                        >
                          {pNode.isExpanded ? (
                            <>
                              <ChevronDown className="w-3 h-3" />
                              <span>{node.children?.length}</span>
                            </>
                          ) : (
                            <>
                              <ChevronRight className="w-3 h-3" />
                              <span>+{node.children?.length}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Node Title */}
                    <h4 className="text-sm font-bold leading-tight group-hover:text-indigo-300 transition-colors">
                      {node.label}
                    </h4>

                    {/* Short Description */}
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                      {node.shortDesc}
                    </p>

                    {/* Hover trigger hint */}
                    <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-indigo-400" />
                        点击查看深度机制与实验
                      </span>
                      {node.importance === 'core' && (
                        <span className="text-amber-400 font-bold">★ 核心</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Bento Matrix Panoramic Mode (全景矩阵导图) */
        <div className="w-full h-full overflow-y-auto p-6 space-y-6 bg-zinc-950">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Root Header Box */}
            <div 
              onClick={() => onSelectNode(rootNode)}
              className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:border-indigo-500 transition-colors"
            >
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  全脑可塑性宏观视野
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  《神经可塑性》：大脑终身自我重构法则
                </h2>
                <p className="text-sm text-zinc-300 mt-1 max-w-3xl leading-relaxed">
                  {rootNode.shortDesc}
                </p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shrink-0 flex items-center gap-1.5">
                查看全书导论与总纲
              </button>
            </div>

            {/* 6 Category Clusters in responsive bento grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rootNode.children?.map(catNode => {
                const catConfig = categories[catNode.category] || categories.paradigm;
                return (
                  <div
                    key={catNode.id}
                    className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-sm"
                  >
                    <div>
                      {/* Cluster Header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-lg border"
                          style={{
                            borderColor: catConfig.accent,
                            color: catConfig.accent,
                            backgroundColor: `${catConfig.accent}15`,
                          }}
                        >
                          {catConfig.label}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {catNode.children?.length || 0} {t.pillarsSubMechanisms}
                        </span>
                      </div>

                      {/* Cluster Title */}
                      <h3 
                        onClick={() => onSelectNode(catNode)}
                        className="text-base font-bold text-zinc-100 hover:text-indigo-400 cursor-pointer transition-colors"
                      >
                        {catNode.label}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {catNode.shortDesc}
                      </p>

                      {/* Sub-node pills */}
                      <div className="mt-4 space-y-2">
                        {catNode.children?.map(sub => (
                          <div
                            key={sub.id}
                            onClick={() => onSelectNode(sub)}
                            className="p-2.5 rounded-xl bg-zinc-950/70 hover:bg-zinc-800 border border-zinc-800/80 flex items-start justify-between gap-2 cursor-pointer transition-colors group"
                          >
                            <div>
                              <div className="text-xs font-semibold text-zinc-200 group-hover:text-indigo-300">
                                {sub.label}
                              </div>
                              <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                                {sub.shortDesc}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 shrink-0 mt-0.5" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectNode(catNode)}
                      className="mt-4 pt-3 border-t border-zinc-800/80 text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center justify-between w-full cursor-pointer"
                    >
                      <span>{t.pillarsInspectAction}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Canvas Footer Help */}
      <div className="absolute bottom-3 left-4 text-xs text-zinc-400 bg-zinc-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-zinc-800 pointer-events-none hidden sm:flex items-center gap-3">
        <span>{t.canvasTip}</span>
      </div>
    </div>
  );
};
