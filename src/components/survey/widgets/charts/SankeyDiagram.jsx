import { useMemo } from "react";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { CHART_COLORS } from "@/lib/colors";

/**
 * Sankey Diagram Component
 * 
 * Displays flow and journey data as a Sankey diagram.
 * 
 * @param {Object} props
 * @param {Array} props.nodes - Array of node objects: [{ id, label }]
 * @param {Array} props.links - Array of link objects: [{ source, target, value }]
 * @param {string} [props.nodeKey="id"] - Key for node ID
 * @param {string} [props.nodeLabel="label"] - Key for node label
 * @param {string} [props.linkSource="source"] - Key for link source
 * @param {string} [props.linkTarget="target"] - Key for link target
 * @param {string} [props.linkValue="value"] - Key for link value
 * @param {number} [props.height=400] - Chart height
 * @param {number} [props.width] - Chart width (auto if not provided)
 * @param {number} [props.nodeWidth=15] - Node width
 * @param {number} [props.nodePadding=10] - Padding between nodes
 */
export function SankeyDiagram({
  nodes = [],
  links = [],
  nodeKey = "id",
  nodeLabel = "label",
  linkSource = "source",
  linkTarget = "target",
  linkValue = "value",
  height = 400,
  width,
  nodeWidth = 15,
  nodePadding = 10,
  isExportImage = false,
}) {
  const chartWidth = width || 800;

  // Transform data for d3-sankey
  const { sankeyNodes, sankeyLinks } = useMemo(() => {
    if (!nodes || nodes.length === 0 || !links || links.length === 0) {
      return { sankeyNodes: [], sankeyLinks: [] };
    }

    // Create node map
    const nodeMap = new Map();
    nodes.forEach((node, index) => {
      nodeMap.set(node[nodeKey], { ...node, index });
    });

    // Transform links
    const transformedLinks = links.map((link) => ({
      source: nodeMap.get(link[linkSource])?.index ?? 0,
      target: nodeMap.get(link[linkTarget])?.index ?? 0,
      value: link[linkValue] || 0,
    }));

    // Create sankey layout
    const sankeyGenerator = sankey()
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .extent([
        [1, 1],
        [chartWidth - 1, height - 1],
      ]);

    // Prepare data structure for d3-sankey
    const sankeyData = {
      nodes: nodes.map((node) => ({ name: node[nodeLabel] || node[nodeKey] })),
      links: transformedLinks,
    };

    // Apply layout
    const layout = sankeyGenerator(sankeyData);

    return {
      sankeyNodes: layout.nodes || [],
      sankeyLinks: layout.links || [],
    };
  }, [
    nodes,
    links,
    nodeKey,
    nodeLabel,
    linkSource,
    linkTarget,
    linkValue,
    nodeWidth,
    nodePadding,
    chartWidth,
    height,
  ]);

  const linkPath = sankeyLinkHorizontal();

  if (!nodes || nodes.length === 0 || !links || links.length === 0) {
    return (
      <div
        className="flex items-center justify-center p-8 text-muted-foreground"
        style={{ height }}
      >
        <p>Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div style={{ height, width: "100%", maxWidth: chartWidth }} role="img" aria-label="Diagrama de Sankey" className="overflow-hidden">
      <svg width="100%" height={height} viewBox={`0 0 ${chartWidth} ${height}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible">
        {/* Links */}
        <g className="links">
          {sankeyLinks.map((link, index) => {
            const path = linkPath(link);
            return (
              <path
                key={index}
                d={path}
                fill="none"
                stroke={CHART_COLORS.primary}
                strokeOpacity={0.3}
                strokeWidth={Math.max(1, link.width || 1)}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g className="nodes">
          {sankeyNodes.map((node, index) => (
            <g key={index}>
              <rect
                x={node.x0}
                y={node.y0}
                width={node.x1 - node.x0}
                height={node.y1 - node.y0}
                fill={CHART_COLORS.primary}
                opacity={0.8}
              />
              <text
                x={node.x0 < chartWidth / 2 ? node.x1 + 6 : node.x0 - 6}
                y={(node.y0 + node.y1) / 2}
                dy="0.35em"
                textAnchor={node.x0 < chartWidth / 2 ? "start" : "end"}
                fill={CHART_COLORS.foreground}
                fontSize="12px"
              >
                {node.name}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

