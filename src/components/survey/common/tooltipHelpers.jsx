import React from "react";
import { logger } from "@/utils/logger";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Trunca string para tooltip, preservando templates {{ }}
 * @param {string} s - String a ser truncada
 * @param {number} max - Tamanho máximo (padrão: 70)
 * @returns {string} String truncada com "…" no final
 */
export function truncateForTooltip(s, max = 70) {
  if (!s || typeof s !== "string") return "";
  if (s.length <= max) return s;
  return s.slice(0, max) + "…";
}

/**
 * Extrai os paths {{ path }} de um template (ex: "{{sectionData.summary}}" → ["sectionData.summary"]).
 * @param {string} s - String com templates
 * @returns {string[]} Array de paths extraídos
 */
export function extractTemplatePaths(s) {
  if (!s || typeof s !== "string") return [];
  const re = /\{\{\s*([^}]+)\s*\}\}/g;
  const out = [];
  let m;
  while ((m = re.exec(s)) !== null) out.push(m[1].trim());
  return [...new Set(out)];
}

/**
 * Monta o conteúdo do tooltip que mostra a origem dos dados no JSON/schema.
 * Exibe: tipo do componente, dataPath, templates (title/text) e o data path do texto quando usa {{ }}.
 * @param {Object} component - Componente do schema
 * @returns {Array|null} Array de objetos {label, value} ou null se não houver conteúdo
 */
export function getDataSourceTooltipContent(component) {
  if (!component) return null;
  const lines = [];
  const type = component.type || (component.wrapper ? `wrapper:${component.wrapper}` : null);
  if (type) lines.push({ label: "Tipo", value: type });
  if (component.dataPath) lines.push({ label: "dataPath", value: component.dataPath });
  if (component.cardStyleVariant) lines.push({ label: "cardStyleVariant", value: component.cardStyleVariant });
  if (component.cardContentVariant) lines.push({ label: "cardContentVariant", value: component.cardContentVariant });
  if (component.titleStyleVariant) lines.push({ label: "titleStyleVariant", value: component.titleStyleVariant });
  if (component.type === "grid-container" && component.className) lines.push({ label: "className", value: component.className });
  if (component.categoryName && typeof component.categoryName === "string") {
    const cn = component.categoryName;
    lines.push({ label: "categoryName", value: truncateForTooltip(cn, 50) });
    const cnPaths = extractTemplatePaths(cn);
    if (cnPaths.length) lines.push({ label: "categoryName (path)", value: cnPaths.join(", ") });
  }
  if (component.title != null && component.title !== "") {
    const titleStr = String(component.title);
    lines.push({ label: "title", value: truncateForTooltip(titleStr, 60) });
    const titlePaths = extractTemplatePaths(titleStr);
    if (titlePaths.length) lines.push({ label: "title (path)", value: titlePaths.join(", ") });
  }
  // Mostra text só se for template {{ }} ou string curta
  if (component.text != null && component.text !== "") {
    const c = String(component.text);
    if (c.includes("{{") || c.length <= 80)
      lines.push({ label: "text", value: truncateForTooltip(c, 80) });
    else
      lines.push({ label: "text", value: `(texto fixo, ${c.length} caracteres)` });
    const textPaths = extractTemplatePaths(c);
    if (textPaths.length) lines.push({ label: "text (path)", value: textPaths.join(", ") });
  }
  if (component.config?.nodesPath) lines.push({ label: "nodesPath", value: component.config.nodesPath });
  if (component.config?.linksPath) lines.push({ label: "linksPath", value: component.config.linksPath });
  if (component.severityLabelsPath) lines.push({ label: "severityLabelsPath", value: component.severityLabelsPath });
  if (lines.length === 0) return null;
  return lines;
}

/**
 * Envolve o elemento em um tooltip que mostra a origem dos dados (dataPath, tipo, etc.)
 * Não renderiza tooltip em modo export.
 * @param {Object} props - Props do componente
 * @param {Object} props.component - Componente do schema
 * @param {boolean} props.isExport - Se está em modo export
 * @param {React.ReactNode} props.children - Elemento a ser envolvido
 * @returns {React.ReactNode} Elemento com ou sem tooltip
 */
export function DataSourceTooltip({ component, isExport, children }) {
  if (isExport || !children) return children;
  const items = getDataSourceTooltipContent(component);
  if (!items || items.length === 0) return children;
  // Wrapper necessário: TooltipTrigger (asChild) passa ref ao filho. SchemaCard e outros
  // Schema* são function components sem forwardRef; um div DOM aceita ref. O div não altera
  // o layout pois se ajusta ao conteúdo (card, gráfico, etc.).
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>{children}</div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="start"
        sideOffset={6}
        className="max-w-md font-mono text-xs bg-popover border-popover-border"
      >
        <div className="font-sans font-semibold text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
          Fonte no JSON / schema
        </div>
        <dl className="space-y-0.5">
          {items.map(({ label, value }) => (
            <div key={label} className="flex gap-2">
              <dt className="text-muted-foreground shrink-0">{label}:</dt>
              <dd className="text-foreground break-all">{value}</dd>
            </div>
          ))}
        </dl>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Wrapper helper para envolver um elemento com tooltip
 * @param {Object} comp - Componente do schema
 * @param {boolean} isExport - Se está em modo export
 * @param {React.ReactNode} el - Elemento a ser envolvido
 * @returns {React.ReactNode} Elemento com ou sem tooltip
 */
export function wrapWithTooltip(comp, isExport, el) {
  // Se está em modo export ou não há elemento, retorna o elemento (ou null)
  if (isExport || !el) {
    // Garante que não retornamos objetos vazios ou objetos JavaScript
    if (el === null || el === undefined) {
      return null;
    }
    // Se é um elemento React válido, retorna
    if (React.isValidElement(el)) {
      return el;
    }
    // Se é um valor primitivo válido (string, number, boolean), retorna
    if (typeof el !== 'object') {
      return el;
    }
    // Se é um objeto JavaScript mas não é um elemento React válido, retorna null
    logger.warnCritical("wrapWithTooltip: Tentando renderizar objeto inválido:", el, "Tipo:", typeof el);
    return null;
  }
  
  // Garante que el é um elemento React válido antes de envolver com tooltip
  if (!el || !React.isValidElement(el)) {
    if (el && typeof el === 'object') {
      logger.warnCritical("wrapWithTooltip: Elemento não é válido (objeto):", el);
    }
    return null;
  }
  
  return <DataSourceTooltip component={comp} isExport={isExport}>{el}</DataSourceTooltip>;
}
