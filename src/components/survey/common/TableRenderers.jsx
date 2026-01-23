import { useState } from "react";
import { resolveDataPath, resolveTemplate } from "@/services/dataResolver";
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
} from "../widgets/Tables";
import { AnalyticalTable } from "../widgets/AnalyticalTable";
import { severityColors } from "@/lib/colors";
import { logger } from "@/utils/logger";

/**
 * Render a recommendations table component based on schema
 * This component needs state management for expand/collapse
 */
export function SchemaRecommendationsTable({ component, data }) {
  // Hooks DEVEM ser chamados antes de qualquer return condicional
  const [expandedRecs, setExpandedRecs] = useState(new Set());
  const [checkedTasks, setCheckedTasks] = useState({});

  try {
    const recommendationsData = resolveDataPath(data, component.dataPath);

    if (!recommendationsData) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Nenhuma recomendação encontrada.</p>
        </div>
      );
    }

    // Support both new structure (object with config and items) and old structure (array)
    let recommendations, severityLabels;
    if (Array.isArray(recommendationsData)) {
      // Old structure: direct array
      recommendations = recommendationsData;
      severityLabels = null;
    } else if (recommendationsData.items && Array.isArray(recommendationsData.items)) {
      // New structure: object with config and items
      recommendations = recommendationsData.items;
      severityLabels = recommendationsData.config?.severityLabels || null;
    } else {
      // Invalid data structure - return empty state silently
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Nenhuma recomendação encontrada.</p>
        </div>
      );
    }

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
    const tableData = resolveDataPath(data, component.dataPath);

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
    const tableData = resolveDataPath(data, component.dataPath);

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
    const tableData = resolveDataPath(data, component.dataPath);

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
 */
export function SchemaNPSDistributionTable({ component, data }) {
  try {
    const tableData = resolveDataPath(data, component.dataPath);
    const categoryName = resolveTemplate(component.categoryName || "", data);

    if (!tableData || !Array.isArray(tableData)) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Nenhum dado de distribuição NPS encontrado.</p>
        </div>
      );
    }

    return (
      <NPSDistributionTable data={tableData} categoryName={categoryName} />
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
 */
export function SchemaNPSTable({ component, data }) {
  try {
    const tableData = resolveDataPath(data, component.dataPath);
    const categoryName = resolveTemplate(component.categoryName || "", data);

    if (!tableData || !Array.isArray(tableData)) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Nenhum dado NPS encontrado.</p>
        </div>
      );
    }

    return <NPSTable data={tableData} categoryName={categoryName} />;
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
    const tableData = resolveDataPath(data, component.dataPath);

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
    const tableData = resolveDataPath(data, component.dataPath);

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
    const tableData = resolveDataPath(data, component.dataPath);

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
 * Render Analytical Table component based on schema
 */
export function SchemaAnalyticalTable({ component, data }) {
  try {
    const tableData = resolveDataPath(data, component.dataPath);
    const config = component.config || {};

    if (!tableData || !Array.isArray(tableData)) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Nenhum dado analítico encontrado.</p>
        </div>
      );
    }

    return (
      <AnalyticalTable
        data={tableData}
        columns={config.columns || []}
        showRanking={config.showRanking !== false}
        defaultSort={config.defaultSort}
        rankingKey={config.rankingKey}
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
