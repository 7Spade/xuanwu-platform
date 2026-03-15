"use client";
/**
 * CausalGraphView — workspace causal-graph capability tab.
 *
 * Wave 57: causal-graph.module presentation component.
 * Renders a pure-React SVG DAG — no external vis.js dependency.
 *
 * Layout:
 *  - Nodes arranged in columns by topological depth
 *  - Directed SVG arrows between cause→effect node pairs
 *  - Node card shows kind badge + label
 *  - Sidebar lists impact scope: click a node to see affected count
 *  - Empty state with instructions when no nodes exist
 */

import { useMemo, useState } from "react";
import { Network, Info } from "lucide-react";
import { Badge } from "@/design-system/primitives/ui/badge";
import { useTranslation } from "@/shared/i18n";
import { useCausalGraph } from "./use-causal-graph";
import type { CausalNode, CausalEdge } from "../domain.causal-graph/_entity";

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

const NODE_W = 160;
const NODE_H = 60;
const H_GAP = 80;
const V_GAP = 24;

type NodeLayout = CausalNode & { x: number; y: number; depth: number };

function buildLayout(nodes: CausalNode[], edges: CausalEdge[]): NodeLayout[] {
  // Build adjacency for depth calculation
  const inDegree = new Map<string, number>();
  nodes.forEach((n) => inDegree.set(n.id, 0));
  edges.forEach((e) => {
    inDegree.set(e.effectNodeId, (inDegree.get(e.effectNodeId) ?? 0) + 1);
  });

  const depthMap = new Map<string, number>();
  const queue = nodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0).map((n) => ({ id: n.id, depth: 0 }));
  while (queue.length) {
    const { id, depth } = queue.shift()!;
    depthMap.set(id, Math.max(depthMap.get(id) ?? 0, depth));
    edges
      .filter((e) => e.causeNodeId === id)
      .forEach((e) => queue.push({ id: e.effectNodeId, depth: depth + 1 }));
  }

  // Group by depth
  const byDepth = new Map<number, CausalNode[]>();
  nodes.forEach((n) => {
    const d = depthMap.get(n.id) ?? 0;
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(n);
  });

  const layout: NodeLayout[] = [];
  byDepth.forEach((col, depth) => {
    col.forEach((node, idx) => {
      layout.push({
        ...node,
        depth,
        x: depth * (NODE_W + H_GAP) + 24,
        y: idx * (NODE_H + V_GAP) + 24,
      });
    });
  });
  return layout;
}

// ---------------------------------------------------------------------------
// Kind colour map — separate background and text classes
// ---------------------------------------------------------------------------

type KindColors = { bg: string; text: string };

const KIND_COLOR: Record<string, KindColors> = {
  "work-item":    { bg: "fill-blue-100",   text: "fill-blue-700" },
  "milestone":    { bg: "fill-purple-100", text: "fill-purple-700" },
  "cr":           { bg: "fill-orange-100", text: "fill-orange-700" },
  "qa":           { bg: "fill-green-100",  text: "fill-green-700" },
  "baseline":     { bg: "fill-gray-100",   text: "fill-gray-700" },
  "domain-event": { bg: "fill-yellow-100", text: "fill-yellow-700" },
  "settlement":   { bg: "fill-emerald-100",text: "fill-emerald-700" },
  "audit-entry":  { bg: "fill-rose-100",   text: "fill-rose-700" },
};

const DEFAULT_KIND_COLORS: KindColors = { bg: "fill-muted", text: "fill-muted-foreground" };

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CausalGraphViewProps {
  workspaceId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CausalGraphView({ workspaceId }: CausalGraphViewProps) {
  const t = useTranslation("zh-TW");
  const { nodes, edges, loading, error } = useCausalGraph(workspaceId);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const layout = useMemo(() => buildLayout(nodes, edges), [nodes, edges]);
  const layoutMap = useMemo(() => new Map(layout.map((n) => [n.id, n])), [layout]);

  const svgW = layout.length
    ? Math.max(...layout.map((n) => n.x + NODE_W)) + 40
    : 400;
  const svgH = layout.length
    ? Math.max(...layout.map((n) => n.y + NODE_H)) + 40
    : 200;

  const selectedNode = selectedId ? layoutMap.get(selectedId) : null;
  const affectedEdges = selectedId
    ? edges.filter((e) => e.causeNodeId === selectedId)
    : [];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Network className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold tracking-tight">
          {t("workspace.causalGraph.title")}
        </h2>
        {!loading && (
          <Badge variant="secondary" className="ml-auto h-5 px-2 text-[10px]">
            {nodes.length} {t("workspace.causalGraph.nodes")}
          </Badge>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Loading */}
      {loading && (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      )}

      {/* Empty state */}
      {!loading && nodes.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-10 text-center">
          <Network className="size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            {t("workspace.causalGraph.empty")}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {t("workspace.causalGraph.emptyHint")}
          </p>
        </div>
      )}

      {/* SVG DAG + sidebar */}
      {!loading && nodes.length > 0 && (
        <div className="flex gap-4">
          {/* DAG canvas */}
          <div className="flex-1 overflow-auto rounded-2xl border border-border/50 bg-muted/20">
            <svg
              width={svgW}
              height={svgH}
              className="font-sans"
            >
              {/* Edges */}
              {edges.map((edge) => {
                const from = layoutMap.get(edge.causeNodeId);
                const to = layoutMap.get(edge.effectNodeId);
                if (!from || !to) return null;
                const x1 = from.x + NODE_W;
                const y1 = from.y + NODE_H / 2;
                const x2 = to.x;
                const y2 = to.y + NODE_H / 2;
                const mx = (x1 + x2) / 2;
                const opacity = edge.confidence ?? 1;
                return (
                  <g key={edge.id}>
                    <path
                      d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeOpacity={opacity * 0.6}
                      className="text-muted-foreground"
                      markerEnd="url(#arrow)"
                    />
                    {edge.confidence < 1 && (
                      <text
                        x={mx}
                        y={(y1 + y2) / 2 - 4}
                        fontSize={9}
                        fill="currentColor"
                        className="text-muted-foreground"
                        textAnchor="middle"
                      >
                        {Math.round(edge.confidence * 100)}%
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Arrow marker */}
              <defs>
                <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" className="fill-muted-foreground" fill="currentColor" opacity={0.6} />
                </marker>
              </defs>

              {/* Nodes */}
              {layout.map((node) => {
                const isSelected = node.id === selectedId;
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x},${node.y})`}
                    onClick={() => setSelectedId(isSelected ? null : node.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect
                      width={NODE_W}
                      height={NODE_H}
                      rx={10}
                      className={`${isSelected ? "stroke-primary" : "stroke-border"} fill-card`}
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    <text
                      x={NODE_W / 2}
                      y={18}
                      textAnchor="middle"
                      fontSize={9}
                      fontWeight={600}
                      className={`uppercase tracking-widest ${(KIND_COLOR[node.kind] ?? DEFAULT_KIND_COLORS).text}`}
                      fill="currentColor"
                    >
                      {node.kind}
                    </text>
                    <text
                      x={NODE_W / 2}
                      y={36}
                      textAnchor="middle"
                      fontSize={11}
                      className="fill-foreground"
                      fill="currentColor"
                    >
                      {node.label.length > 18 ? `${node.label.slice(0, 18)}…` : node.label}
                    </text>
                    <text
                      x={NODE_W / 2}
                      y={50}
                      textAnchor="middle"
                      fontSize={9}
                      className="fill-muted-foreground"
                      fill="currentColor"
                    >
                      {new Date(node.occurredAt).toLocaleDateString("zh-TW", { month: "short", day: "numeric" })}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Sidebar */}
          <div className="w-56 shrink-0 rounded-2xl border border-border/50 bg-card p-3 flex flex-col gap-3">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Info className="size-3" />
              {t("workspace.causalGraph.sidebar")}
            </p>
            {selectedNode ? (
              <div className="flex flex-col gap-2">
                <Badge variant="outline" className="text-xs self-start">
                  {selectedNode.kind}
                </Badge>
                <p className="text-sm font-medium">{selectedNode.label}</p>
                <p className="text-xs text-muted-foreground">
                  {t("workspace.causalGraph.effects").replace("{n}", String(affectedEdges.length))}
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {affectedEdges.map((e) => {
                    const effectNode = layoutMap.get(e.effectNodeId);
                    return (
                      <li key={e.id} className="truncate">
                        → {effectNode?.label ?? e.effectNodeId}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {t("workspace.causalGraph.clickNode")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
