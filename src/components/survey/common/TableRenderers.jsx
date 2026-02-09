import { useState } from "react";
import { resolveDataPath } from "@/services/dataResolver";
import {
  RecommendationsTable,
  TasksTable,
  SegmentationTable,
  DistributionTable,
  SentimentTable,
  NPSDistributionTable,
  NPSTable,
  SentimentImpactTable,
  PositiveCategoriesTable,
  NegativeCategoriesTable,
} from "../widgets/tables/Tables";
import { AnalyticalTable } from "../widgets/AnalyticalTable";
import { severityColors } from "@/lib/colors";
import { logger } from "@/utils/logger";

/** Known value keys per table type; the remaining key in the first row is the segment/category key */
const NPS_DISTRIBUTION_VALUE_KEYS = new Set([
  "promoters",
  "neutrals",
  "detractors",
]);
const NPS_TABLE_VALUE_KEYS = new Set(["NPS", "nps"]);

/**
 * Infer segment key from first row when not set in config (e.g. from JSON data keys like "Estado", "Tipo de Cliente").
 * @param {Object[]} tableData - Array of row objects
 * @param {Set<string>} valueKeys - Keys that are value columns, not the segment
 * @returns {string} Inferred key or "segment"
 */
function inferSegmentKeyFromData(tableData, valueKeys) {
  const first =
    Array.isArray(tableData) && tableData.length > 0 ? tableData[0] : null;
  if (!first || typeof first !== "object") return "segment";
  const key = Object.keys(first).find((k) => !valueKeys.has(k));
  return key || "segment";
}

/**
 * Render a recommendations table component based on schema
 * This component needs state management for expand/collapse
 */
export function SchemaRecommendationsTable({ component, data }) {
  // Hooks DEVEM ser chamados antes de qualquer return condicional
  const [expandedRecs, setExpandedRecs] = useState(new Set());
  const [checkedTasks, setCheckedTasks] = useState({});

  try {
    const recommendationsData = resolveDataPath(
      data,
      component.dataPath,
      component.data,
    );

    if (!recommendationsData) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Nenhuma recomendação encontrada.</p>
        </div>
      );
    }

    // New structure: object with config and items
    if (
      !recommendationsData ||
      !recommendationsData.items ||
      !Array.isArray(recommendationsData.items)
    ) {
      // Invalid data structure - return empty state silently
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Nenhuma recomendação encontrada.</p>
        </div>
      );
    }

    const recommendations = recommendationsData.items;
    const severityLabels = recommendationsData.config?.severityLabels || null;

    const toggleRecExpansion = (recId) => {
      setExpandedRecs((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(recId)) {
          newSet.delete(recId);
        } else {
          newSet.add(recId);
        }
        return newSet;
      });
    };

    const toggleTask = (recId, taskIndex) => {
      const key = `rec-${recId}-task-${taskIndex}`;
      setCheckedTasks((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    };

    const getRecTasks = (recId) => {
      const rec = recommendations.find((r) => r.id === recId);
      return rec?.tasks || [];
    };

    return (
      <RecommendationsTable
        recommendations={recommendations}
        severityColors={severityColors}
        severityLabels={severityLabels}
        expandedRecs={expandedRecs}
        onToggleRec={toggleRecExpansion}
        getRecTasks={getRecTasks}
        renderTasksTable={(recId, tasks) => (
          <TasksTable
            tasks={tasks}
            recId={recId}
            checkedTasks={checkedTasks}
            onToggleTask={toggleTask}
          />
        )}
      />
    );
  } catch (error) {
    logger.error(`Erro ao renderizar RecommendationsTable:`, error, {
      component,
      dataPath: component.dataPath,
    });
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          Erro ao carregar tabela de recomendações
        </p>
        <p className="text-sm text-red-500 dark:text-red-300 mt-1">
          {error.message}
        </p>
      </div>
    );
  }
}

/**
 * Render a segmentation table component based on schema
 */
export function SchemaSegmentationTable({ component, data }) {
  try {
    const tableData = resolveDataPath(data, component.dataPath, component.data);

    if (!tableData || !Array.isArray(tableData)) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Nenhum dado de segmentação encontrado.</p>
        </div>
      );
    }

    return <SegmentationTable data={tableData} />;
  } catch (error) {
    logger.error(`Erro ao renderizar SegmentationTable:`, error, {
      component,
      dataPath: component.dataPath,
    });
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          Erro ao carregar tabela de segmentação
        </p>
        <p className="text-sm text-red-500 dark:text-red-300 mt-1">
          {error.message}
        </p>
      </div>
    );
  }
}

/**
 * Render a distribution table component based on schema
 */
export function SchemaDistributionTable({ component, data }) {
  try {
    const tableData = resolveDataPath(data, component.dataPath, component.data);

    if (!tableData || !Array.isArray(tableData)) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Nenhum dado de distribuição encontrado.</p>
        </div>
      );
    }

    return <DistributionTable data={tableData} />;
  } catch (error) {
    logger.error(`Erro ao renderizar DistributionTable:`, error, {
      component,
      dataPath: component.dataPath,
    });
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          Erro ao carregar tabela de distribuição
        </p>
        <p className="text-sm text-red-500 dark:text-red-300 mt-1">
          {error.message}
        </p>
      </div>
    );
  }
}

/**
 * Render a sentiment table component based on schema
 */
export function SchemaSentimentTable({ component, data }) {
  try {
    const tableData = resolveDataPath(data, component.dataPath, component.data);

    if (!tableData || !Array.isArray(tableData)) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Nenhum dado de sentimento encontrado.</p>
        </div>
      );
    }

    return <SentimentTable data={tableData} />;
  } catch (error) {
    logger.error(`Erro ao renderizar SentimentTable:`, error, {
      component,
      dataPath: component.dataPath,
    });
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          Erro ao carregar tabela de sentimento
        </p>
        <p className="text-sm text-red-500 dark:text-red-300 mt-1">
          {error.message}
        </p>
      </div>
    );
  }
}

/**
 * Render an NPS distribution table component based on schema
 * Uses component.config.yAxisDataKey (e.g. "Tipo_de_Cliente") as the segment/category key when present.
 */
export function SchemaNPSDistributionTable({ component, data }) {
  try {
    const tableData = resolveDataPath(data, component.dataPath, component.data);
    const categoryName = component.categoryName || "";
    const segmentKey =
      component.config?.yAxisDataKey ||
      component.segmentKey ||
      (tableData && Array.isArray(tableData) && tableData.length > 0
        ? inferSegmentKeyFromData(tableData, NPS_DISTRIBUTION_VALUE_KEYS)
        : "segment");

    if (!tableData || !Array.isArray(tableData)) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Nenhum dado de distribuição NPS encontrado.</p>
        </div>
      );
    }

    return (
      <NPSDistributionTable
        data={tableData}
        categoryName={categoryName}
        segmentKey={segmentKey}
      />
    );
  } catch (error) {
    logger.error(`Erro ao renderizar NPSDistributionTable:`, error, {
      component,
      dataPath: component.dataPath,
    });
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          Erro ao carregar tabela de distribuição NPS
        </p>
        <p className="text-sm text-red-500 dark:text-red-300 mt-1">
          {error.message}
        </p>
      </div>
    );
  }
}

/**
 * Render an NPS table component based on schema
 * Uses component.config.yAxisDataKey (e.g. "Tipo_de_Cliente") as the segment/category key when present.
 */
export function SchemaNPSTable({ component, data }) {
  try {
    const tableData = resolveDataPath(data, component.dataPath, component.data);
    const categoryName = component.categoryName || "";
    const segmentKey =
      component.config?.yAxisDataKey ||
      component.segmentKey ||
      (tableData && Array.isArray(tableData) && tableData.length > 0
        ? inferSegmentKeyFromData(tableData, NPS_TABLE_VALUE_KEYS)
        : "segment");

    if (!tableData || !Array.isArray(tableData)) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Nenhum dado NPS encontrado.</p>
        </div>
      );
    }

    return (
      <NPSTable
        data={tableData}
        categoryName={categoryName}
        segmentKey={segmentKey}
      />
    );
  } catch (error) {
    logger.error(`Erro ao renderizar NPSTable:`, error, {
      component,
      dataPath: component.dataPath,
    });
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          Erro ao carregar tabela NPS
        </p>
        <p className="text-sm text-red-500 dark:text-red-300 mt-1">
          {error.message}
        </p>
      </div>
    );
  }
}

/**
 * Render a sentiment impact table component based on schema
 */
export function SchemaSentimentImpactTable({ component, data }) {
  try {
    const tableData = resolveDataPath(data, component.dataPath, component.data);

    if (!tableData || !Array.isArray(tableData)) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Nenhum dado de impacto de sentimento encontrado.</p>
        </div>
      );
    }

    return <SentimentImpactTable data={tableData} />;
  } catch (error) {
    logger.error(`Erro ao renderizar SentimentImpactTable:`, error, {
      component,
      dataPath: component.dataPath,
    });
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          Erro ao carregar tabela de impacto de sentimento
        </p>
        <p className="text-sm text-red-500 dark:text-red-300 mt-1">
          {error.message}
        </p>
      </div>
    );
  }
}

/**
 * Render a positive categories table component based on schema
 */
export function SchemaPositiveCategoriesTable({ component, data }) {
  try {
    const tableData = resolveDataPath(data, component.dataPath, component.data);

    if (!tableData || !Array.isArray(tableData)) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Nenhuma categoria positiva encontrada.</p>
        </div>
      );
    }

    return <PositiveCategoriesTable data={tableData} />;
  } catch (error) {
    logger.error(`Erro ao renderizar PositiveCategoriesTable:`, error, {
      component,
      dataPath: component.dataPath,
    });
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          Erro ao carregar tabela de categorias positivas
        </p>
        <p className="text-sm text-red-500 dark:text-red-300 mt-1">
          {error.message}
        </p>
      </div>
    );
  }
}

/**
 * Render a negative categories table component based on schema
 */
export function SchemaNegativeCategoriesTable({ component, data }) {
  try {
    const tableData = resolveDataPath(data, component.dataPath, component.data);

    if (!tableData || !Array.isArray(tableData)) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Nenhuma categoria negativa encontrada.</p>
        </div>
      );
    }

    return <NegativeCategoriesTable data={tableData} />;
  } catch (error) {
    logger.error(`Erro ao renderizar NegativeCategoriesTable:`, error, {
      component,
      dataPath: component.dataPath,
    });
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          Erro ao carregar tabela de categorias negativas
        </p>
        <p className="text-sm text-red-500 dark:text-red-300 mt-1">
          {error.message}
        </p>
      </div>
    );
  }
}

/**
 * Extract array from resolved value: may be the array itself or inside an object (e.g. sectionData.ranking, component.data.analyticalTable).
 */
function getAnalyticalTableArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    if (Array.isArray(raw.analyticalTable)) return raw.analyticalTable;
    if (Array.isArray(raw.ranking)) return raw.ranking;
    const firstArray = Object.values(raw).find((v) => Array.isArray(v));
    if (firstArray) return firstArray;
  }
  return null;
}

/**
 * Infer columns from first row keys when config.columns is missing.
 */
function inferAnalyticalColumns(rows) {
  const first = rows && rows[0];
  if (!first || typeof first !== "object") return [];
  return Object.keys(first).map((key) => ({
    key,
    label: key,
    sortable: true,
  }));
}

/**
 * Render Analytical Table component based on schema
 */
export function SchemaAnalyticalTable({ component, data }) {
  try {
    let raw = resolveDataPath(data, component.dataPath, component.data);
    if (raw == null && data?.sectionData) {
      raw = data.sectionData;
    }
    const tableData = getAnalyticalTableArray(raw);
    const config = component.config || {};

    if (!tableData || tableData.length === 0) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Nenhum dado analítico encontrado.</p>
        </div>
      );
    }

    const columns =
      config.columns && config.columns.length > 0
        ? config.columns.map((col) => ({
            ...col,
            sortable: col.sortable !== false,
          }))
        : inferAnalyticalColumns(tableData);

    if (columns.length === 0) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Nenhuma coluna disponível.</p>
        </div>
      );
    }

    return (
      <AnalyticalTable
        data={tableData}
        columns={columns}
        showRanking={config.showRanking === true}
        {...(config.defaultSort != null && { defaultSort: config.defaultSort })}
        {...(config.rankingKey != null && { rankingKey: config.rankingKey })}
      />
    );
  } catch (error) {
    logger.error(`Erro ao renderizar AnalyticalTable:`, error, {
      component,
      dataPath: component.dataPath,
    });
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          Erro ao carregar tabela analítica
        </p>
        <p className="text-sm text-red-500 dark:text-red-300 mt-1">
          {error.message}
        </p>
      </div>
    );
  }
}
