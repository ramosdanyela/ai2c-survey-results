/**
 * Regras customizadas de validação baseadas no código de renderização
 * Padrão ouro: surveyData.json (seção de questões com id "responses" ou "questions";
 * attributes apenas department, tenure, role; charts com campo "option").
 *
 * - Erros: impedem validação (ex.: seção com questions deve ter id "responses" ou "questions").
 * - Avisos: não falham (ex.: campo "label" em vez de "option", number como string, campo vazio).
 */

// Tipos de componentes válidos (baseado no ComponentRegistry)
const VALID_COMPONENT_TYPES = [
  // Charts
  "barChart",
  "sentimentDivergentChart",
  "sentimentThreeColorChart",
  "npsStackedChart",
  "lineChart",
  "paretoChart",
  "scatterPlot",
  "histogram",
  "quadrantChart",
  "heatmap",
  "sankeyDiagram",
  "stackedBarMECE",
  "evolutionaryScorecard",
  "slopeGraph",
  "waterfallChart",
  // Cards
  "card",
  "npsScoreCard",
  "topCategoriesCards",
  "kpiCard",
  // Tables
  "recommendationsTable",
  "segmentationTable",
  "distributionTable",
  "sentimentTable",
  "npsDistributionTable",
  "npsTable",
  "sentimentImpactTable",
  "positiveCategoriesTable",
  "negativeCategoriesTable",
  "analyticalTable",
  // Widgets
  "questionsList",
  "filterPills",
  "wordCloud",
  "accordion",
  // Containers e Headings
  "container",
  "grid-container",
  "h3",
  "h4",
];

// Tipos de questões válidos
const VALID_QUESTION_TYPES = [
  "nps",
  "open-ended",
  "multiple-choice",
  "single-choice",
];

// Opções válidas para questões NPS
const VALID_NPS_OPTIONS = ["Detrator", "Promotor", "Neutro"];

// Padrão ouro: seção de questões com id "responses"; "questions" também aceito (compatibilidade)
const VALID_SECTION_IDS_QUESTIONS = ["responses", "questions"];

/**
 * Mapeamento: último segmento do dataPath (chave dos dados) → tipos de componente que consomem esses dados.
 * Usado para detectar incoerência (ex.: type "barChart" com dataPath "...distributionTable").
 */
const DATA_PATH_KEY_TO_EXPECTED_TYPES = {
  distributionChart: ["barChart"],
  distributionTable: ["distributionTable"],
  sentimentTable: ["sentimentTable"],
  sentimentImpactTable: ["sentimentImpactTable"],
  satisfactionImpactSentimentChart: [
    "sentimentDivergentChart",
    "sentimentThreeColorChart",
  ],
  satisfactionImpactSentimentTable: ["sentimentImpactTable"],
  positiveCategoriesTable: ["positiveCategoriesTable"],
  negativeCategoriesTable: ["negativeCategoriesTable"],
  recommendationsTable: ["recommendationsTable"],
  segmentationTable: ["segmentationTable"],
  npsDistributionTable: ["npsDistributionTable"],
  npsTable: ["npsTable"],
  npsStackedChart: ["npsStackedChart"],
  wordCloud: ["wordCloud"],
  analyticalTable: ["analyticalTable"],
  lineChart: ["lineChart"],
  paretoChart: ["paretoChart"],
  scatterPlot: ["scatterPlot"],
  histogram: ["histogram"],
  quadrantChart: ["quadrantChart"],
  heatmap: ["heatmap"],
  stackedBarMECE: ["stackedBarMECE"],
  slopeGraph: ["slopeGraph"],
  waterfallChart: ["waterfallChart"],
  evolutionaryScorecard: ["evolutionaryScorecard"],
  respondentIntentChart: ["barChart", "lineChart"],
};

/**
 * Cria resultado de validação (erro ou aviso)
 * @param {string} path
 * @param {string} message
 * @param {"error"|"warning"} [level="error"]
 */
function result(path, message, level = "error") {
  return { path, message, level };
}

function err(path, message) {
  return result(path, message, "error");
}

function warn(path, message) {
  return result(path, message, "warning");
}

/**
 * Resolve path de dados (simula resolveDataPath do código)
 * Suporta currentAttribute que é adicionado dinamicamente para seção "attributes"
 */
function resolveDataPath(obj, path, sectionId = null, sectionData = null) {
  if (!obj || !path) return null;

  // question.* é contexto dinâmico por questão (responses ou questions) — não validar
  if (
    path.startsWith("question.") &&
    VALID_SECTION_IDS_QUESTIONS.includes(sectionId)
  ) {
    return { _isDynamic: true, _path: path };
  }
  // currentAttribute (contexto dinâmico para seção "attributes")
  if (path.startsWith("currentAttribute.") && sectionId === "attributes") {
    const attributePath = path.replace("currentAttribute.", "");
    // Verifica se existe algum atributo no array attributes
    const attributes =
      sectionData?.attributes || resolveDataPath(sectionData, "attributes");
    if (attributes && Array.isArray(attributes) && attributes.length > 0) {
      // Usa o primeiro atributo como exemplo para validar a estrutura
      const firstAttribute = attributes[0];
      return resolveDataPath({ currentAttribute: firstAttribute }, path);
    }
    // Se não tem attributes, não podemos validar, mas não é erro (pode ser template)
    return { _isDynamic: true, _path: attributePath };
  }

  // Handle relative paths with "sectionData." prefix
  // sectionData vem do contexto da seção (sectionData parameter), não de obj.sectionData
  if (path.startsWith("sectionData.")) {
    const relativePath = path.replace("sectionData.", "");
    // Prioridade: usar sectionData passado como parâmetro (dados da seção atual)
    if (sectionData) {
      const resolved = resolveDataPath(
        sectionData,
        relativePath,
        sectionId,
        sectionData
      );
      if (resolved !== null && resolved !== undefined) {
        return resolved;
      }
    }
    // Fallback: tentar obj.sectionData (caso sectionData não tenha sido passado)
    if (obj.sectionData) {
      return resolveDataPath(
        obj.sectionData,
        relativePath,
        sectionId,
        sectionData
      );
    }
    return null;
  }

  // Handle array indices in brackets: attributes[0] -> attributes.0
  const normalizedPath = path.replace(/\[(\d+)\]/g, ".$1");

  const keys = normalizedPath.split(".").filter(Boolean);
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === "object") {
      // Handle array indices
      if (Array.isArray(current) && /^\d+$/.test(key)) {
        const index = parseInt(key, 10);
        if (index >= 0 && index < current.length) {
          current = current[index];
        } else {
          return null;
        }
      } else if (key in current) {
        current = current[key];
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  return current;
}

/**
 * Valida coerência entre type do componente e a chave final do dataPath.
 * Ex.: se dataPath termina em "distributionChart", o type deve ser um que consuma esses dados (ex.: barChart).
 * Se dataPath termina em "distributionTable", o type deve ser "distributionTable".
 * Detecta erros como type "barChart" com dataPath "...distributionTable" ou type "distributionTable" com dataPath "...distributionChart".
 *
 * @param {string} type - Tipo do componente
 * @param {string} dataPath - Caminho dos dados (ex.: sectionData.estado.questions.pergunta3.distributionChart)
 * @param {string} context - Caminho no JSON para mensagem de erro
 * @returns {{ path: string, message: string } | null}
 */
function validateDataPathMatchesComponentType(type, dataPath, context) {
  if (!type || !dataPath || typeof dataPath !== "string") return null;
  const lastSegment = dataPath.split(".").pop();
  if (!lastSegment) return null;

  const expectedTypes = DATA_PATH_KEY_TO_EXPECTED_TYPES[lastSegment];
  if (!expectedTypes) return null; // chave desconhecida, não validar

  if (expectedTypes.includes(type)) return null;

  return {
    path: context,
    message: `Incoerência type/dataPath: o dataPath aponta para "${lastSegment}" (dados de ${expectedTypes.join(" ou ")}), mas o tipo do componente é "${type}". Corrija o "type" para um dos esperados ou o dataPath para dados compatíveis.`,
  };
}

/**
 * Valida se um dataPath aponta para dados válidos
 */
function validateDataPath(
  dataPath,
  data,
  context = "",
  sectionId = null,
  sectionData = null
) {
  if (!dataPath) return null;

  // question.* é contexto dinâmico por questão (responses ou questions)
  if (
    dataPath.startsWith("question.") &&
    VALID_SECTION_IDS_QUESTIONS.includes(sectionId)
  ) {
    return null;
  }
  // currentAttribute é contexto dinâmico (attributes)
  if (dataPath.startsWith("currentAttribute.") && sectionId === "attributes") {
    const attributePath = dataPath.replace("currentAttribute.", "");
    const attributes =
      sectionData?.attributes ||
      resolveDataPath(sectionData, "attributes", sectionId, sectionData);
    if (attributes && Array.isArray(attributes) && attributes.length > 0) {
      // Valida se pelo menos um atributo tem essa propriedade
      const hasProperty = attributes.some((attr) => {
        const value = resolveDataPath(
          { currentAttribute: attr },
          dataPath,
          sectionId,
          sectionData
        );
        return value !== null && value !== undefined;
      });
      if (!hasProperty) {
        return {
          path: context,
          message: `dataPath "${dataPath}" referencia propriedade que não existe nos atributos`,
        };
      }
      // Se tem a propriedade, é válido
      return null;
    }
    // Se não tem attributes, não podemos validar - mas não é erro fatal
    return null;
  }

  // Para sectionData.*, o resolveDataPath já trata isso usando o parâmetro sectionData
  // Não precisamos modificar data, pois resolveDataPath verifica sectionData diretamente
  const resolved = resolveDataPath(data, dataPath, sectionId, sectionData);
  if (resolved === null || resolved === undefined) {
    // Se é contexto dinâmico, não é erro
    if (resolved && typeof resolved === "object" && resolved._isDynamic) {
      return null;
    }
    return {
      path: context,
      message: `dataPath "${dataPath}" não aponta para dados válidos`,
    };
  }

  return null;
}

/**
 * Valida templates {{path}} em strings
 */
function validateTemplates(
  template,
  data,
  context = "",
  sectionId = null,
  sectionData = null
) {
  if (!template || typeof template !== "string") return [];

  const errors = [];
  const templateRegex = /\{\{([^}]+)\}\}/g;
  let match;

  while ((match = templateRegex.exec(template)) !== null) {
    const path = match[1].trim();

    // Se for path de uiTexts, valida em uiTexts
    if (path.startsWith("uiTexts.")) {
      const cleanPath = path.replace(/^uiTexts\./, "");
      const value = resolveDataPath(
        data.uiTexts,
        cleanPath,
        sectionId,
        sectionData
      );
      if (value === null || value === undefined) {
        errors.push({
          path: context,
          message: `Template "${match[0]}" referencia uiTexts.${cleanPath} que não existe`,
        });
      }
    } else if (
      path.startsWith("currentAttribute.") &&
      sectionId === "attributes"
    ) {
      // currentAttribute é contexto dinâmico - valida estrutura
      const attributePath = path.replace("currentAttribute.", "");
      const attributes =
        sectionData?.attributes ||
        resolveDataPath(sectionData, "attributes", sectionId, sectionData);
      if (attributes && Array.isArray(attributes) && attributes.length > 0) {
        const hasProperty = attributes.some((attr) => {
          const value = resolveDataPath(
            { currentAttribute: attr },
            path,
            sectionId,
            sectionData
          );
          return value !== null && value !== undefined;
        });
        if (!hasProperty) {
          errors.push({
            path: context,
            message: `Template "${match[0]}" referencia propriedade que não existe nos atributos`,
          });
        }
      }
      // Se não tem attributes, não podemos validar - mas não é erro fatal
    } else {
      // Caso contrário, valida em data
      const value = resolveDataPath(data, path, sectionId, sectionData);
      if (value === null || value === undefined) {
        // Se é contexto dinâmico, não é erro
        if (value && typeof value === "object" && value._isDynamic) {
          continue;
        }
        errors.push({
          path: context,
          message: `Template "${match[0]}" referencia "${path}" que não existe`,
        });
      }
    }
  }

  return errors;
}

/**
 * Shape esperado pelo código: DistributionTable (Tables.jsx) usa item.segment, item.count.toLocaleString(), item.percentage.
 * Se o JSON tiver formato alternativo (ex.: answer + colunas por estado), item.count é undefined → crash.
 */
function validateDistributionTableShape(resolved, context) {
  const errors = [];
  if (!Array.isArray(resolved)) return errors;
  resolved.forEach((item, i) => {
    const itemCtx = `${context}[${i}]`;
    if (!item || typeof item !== "object") {
      errors.push({
        path: itemCtx,
        message:
          "distributionTable: cada item deve ser um objeto com segment, count, percentage",
      });
      return;
    }
    // Formato errado: usado em pergunta por atributo (answer + colunas dinâmicas) — o código não suporta
    if ("answer" in item && !("segment" in item)) {
      errors.push({
        path: itemCtx,
        message:
          'distributionTable: formato com "answer" e colunas por segmento não é suportado pelo componente DistributionTable. Use itens com segment, count (number), percentage (number).',
      });
      return;
    }
    if (!("segment" in item)) {
      errors.push({
        path: itemCtx,
        message: "distributionTable: item deve ter 'segment'",
      });
    }
    if (!("count" in item)) {
      errors.push({
        path: itemCtx,
        message:
          "distributionTable: item deve ter 'count' (number). O código usa item.count.toLocaleString().",
      });
    } else if (typeof item.count !== "number") {
      errors.push({
        path: `${itemCtx}.count`,
        message: "distributionTable: 'count' deve ser number",
      });
    }
    if (!("percentage" in item)) {
      errors.push({
        path: itemCtx,
        message: "distributionTable: item deve ter 'percentage' (number)",
      });
    } else if (typeof item.percentage !== "number") {
      errors.push({
        path: `${itemCtx}.percentage`,
        message: "distributionTable: 'percentage' deve ser number",
      });
    }
  });
  return errors;
}

/**
 * Shape esperado pelo barChart quando consome distributionChart (ChartRenderers.jsx):
 * getBarChartConfig usa yAxisDataKey "segment" e dataKey "percentage".
 * Se o JSON tiver formato com "answer" e colunas por estado, segment e percentage ficam undefined e o gráfico não renderiza.
 */
function validateDistributionChartShape(resolved, context) {
  const errors = [];
  if (!Array.isArray(resolved)) return errors;
  resolved.forEach((item, i) => {
    const itemCtx = `${context}[${i}]`;
    if (!item || typeof item !== "object") {
      errors.push({
        path: itemCtx,
        message:
          "distributionChart (barChart): cada item deve ser um objeto com segment e percentage",
      });
      return;
    }
    if ("answer" in item && !("segment" in item)) {
      errors.push({
        path: itemCtx,
        message:
          'distributionChart (barChart): formato com "answer" e colunas por segmento não é suportado. Use itens com segment, percentage (number). O código usa item.segment e item.percentage.',
      });
      return;
    }
    if (!("segment" in item)) {
      errors.push({
        path: itemCtx,
        message: "distributionChart (barChart): item deve ter 'segment'",
      });
    }
    if (!("percentage" in item)) {
      errors.push({
        path: itemCtx,
        message:
          "distributionChart (barChart): item deve ter 'percentage' (number)",
      });
    } else if (typeof item.percentage !== "number") {
      errors.push({
        path: `${itemCtx}.percentage`,
        message: "distributionChart (barChart): 'percentage' deve ser number",
      });
    }
  });
  return errors;
}

/**
 * Shape esperado: SentimentTable (Tables.jsx) usa item.segment, item.positive%, item.negative%.
 */
function validateSentimentTableShape(resolved, context) {
  const errors = [];
  if (!Array.isArray(resolved)) return errors;
  resolved.forEach((item, i) => {
    const itemCtx = `${context}[${i}]`;
    if (!item || typeof item !== "object") return;
    if (!("segment" in item)) {
      errors.push({
        path: itemCtx,
        message: "sentimentTable: item deve ter 'segment'",
      });
    }
    if (!("positive" in item)) {
      errors.push({
        path: itemCtx,
        message: "sentimentTable: item deve ter 'positive' (number)",
      });
    } else if (typeof item.positive !== "number") {
      errors.push({
        path: `${itemCtx}.positive`,
        message: "sentimentTable: 'positive' deve ser number",
      });
    }
    if (!("negative" in item)) {
      errors.push({
        path: itemCtx,
        message: "sentimentTable: item deve ter 'negative' (number)",
      });
    } else if (typeof item.negative !== "number") {
      errors.push({
        path: `${itemCtx}.negative`,
        message: "sentimentTable: 'negative' deve ser number",
      });
    }
  });
  return errors;
}

/**
 * Shape esperado: NPSDistributionTable (Tables.jsx) usa item[segmentKey], item.promoters, item.neutrals, item.detractors.
 */
function validateNPSDistributionTableShape(resolved, context, component = {}) {
  const errors = [];
  if (!Array.isArray(resolved)) return errors;
  const segmentKey =
    component.config?.yAxisDataKey ?? component.config?.segmentKey ?? "segment";
  resolved.forEach((item, i) => {
    const itemCtx = `${context}[${i}]`;
    if (!item || typeof item !== "object") {
      errors.push({
        path: itemCtx,
        message: "npsDistributionTable: cada item deve ser um objeto",
      });
      return;
    }
    if (!(segmentKey in item)) {
      errors.push({
        path: itemCtx,
        message: `npsDistributionTable: item deve ter '${segmentKey}' (segmento)`,
      });
    }
    ["promoters", "neutrals", "detractors"].forEach((key) => {
      if (!(key in item)) {
        errors.push({
          path: itemCtx,
          message: `npsDistributionTable: item deve ter '${key}' (number)`,
        });
      } else if (typeof item[key] !== "number") {
        errors.push({
          path: `${itemCtx}.${key}`,
          message: `npsDistributionTable: '${key}' deve ser number`,
        });
      }
    });
  });
  return errors;
}

/**
 * Shape esperado: NPSTable (Tables.jsx) usa item[segmentKey], item.NPS ?? item.nps.
 */
function validateNPSTableShape(resolved, context, component = {}) {
  const errors = [];
  if (!Array.isArray(resolved)) return errors;
  const segmentKey =
    component.config?.yAxisDataKey ?? component.config?.segmentKey ?? "segment";
  resolved.forEach((item, i) => {
    const itemCtx = `${context}[${i}]`;
    if (!item || typeof item !== "object") {
      errors.push({
        path: itemCtx,
        message: "npsTable: cada item deve ser um objeto",
      });
      return;
    }
    if (!(segmentKey in item)) {
      errors.push({
        path: itemCtx,
        message: `npsTable: item deve ter '${segmentKey}' (segmento)`,
      });
    }
    const nps = item.NPS ?? item.nps;
    if (nps === undefined || nps === null) {
      errors.push({
        path: itemCtx,
        message: "npsTable: item deve ter 'NPS' ou 'nps' (number)",
      });
    } else if (typeof nps !== "number") {
      errors.push({
        path: itemCtx,
        message: "npsTable: NPS/nps deve ser number",
      });
    }
  });
  return errors;
}

/**
 * Shape esperado: SentimentImpactTable (Tables.jsx) usa item.sentiment e item[segment] para cada segmento.
 */
function validateSentimentImpactTableShape(resolved, context) {
  const errors = [];
  if (!Array.isArray(resolved) || resolved.length === 0) return errors;
  const first = resolved[0];
  if (!first || typeof first !== "object") return errors;
  const segments = Object.keys(first).filter((k) => k !== "sentiment");
  resolved.forEach((item, i) => {
    const itemCtx = `${context}[${i}]`;
    if (!item || typeof item !== "object") {
      errors.push({
        path: itemCtx,
        message: "sentimentImpactTable: cada item deve ser um objeto com sentiment e colunas numéricas",
      });
      return;
    }
    if (!("sentiment" in item)) {
      errors.push({
        path: itemCtx,
        message: "sentimentImpactTable: item deve ter 'sentiment'",
      });
    }
    segments.forEach((seg) => {
      if (seg in item && typeof item[seg] !== "number") {
        errors.push({
          path: `${itemCtx}.${seg}`,
          message: "sentimentImpactTable: valor por segmento deve ser number",
        });
      }
    });
  });
  return errors;
}

/**
 * Shape esperado: PositiveCategoriesTable / NegativeCategoriesTable (Tables.jsx) usa item.category e item[segment].
 */
function validateCategoriesTableShape(resolved, context, tableType) {
  const errors = [];
  if (!Array.isArray(resolved) || resolved.length === 0) return errors;
  const first = resolved[0];
  if (!first || typeof first !== "object") return errors;
  const segments = Object.keys(first).filter((k) => k !== "category");
  resolved.forEach((item, i) => {
    const itemCtx = `${context}[${i}]`;
    if (!item || typeof item !== "object") {
      errors.push({
        path: itemCtx,
        message: `${tableType}: cada item deve ser um objeto com category e colunas numéricas`,
      });
      return;
    }
    if (!("category" in item)) {
      errors.push({
        path: itemCtx,
        message: `${tableType}: item deve ter 'category'`,
      });
    }
    segments.forEach((seg) => {
      if (seg in item && typeof item[seg] !== "number") {
        errors.push({
          path: `${itemCtx}.${seg}`,
          message: `${tableType}: valor por segmento deve ser number`,
        });
      }
    });
  });
  return errors;
}

/**
 * Shape esperado: SegmentationTable (Tables.jsx) usa cluster.cluster, cluster.description, cluster.percentage, cluster.id.
 */
function validateSegmentationTableShape(resolved, context) {
  const errors = [];
  if (!Array.isArray(resolved)) return errors;
  resolved.forEach((item, i) => {
    const itemCtx = `${context}[${i}]`;
    if (!item || typeof item !== "object") {
      errors.push({
        path: itemCtx,
        message: "segmentationTable: cada item deve ser um objeto com cluster, description, percentage",
      });
      return;
    }
    if (!("cluster" in item)) {
      errors.push({ path: itemCtx, message: "segmentationTable: item deve ter 'cluster'" });
    }
    if (!("description" in item)) {
      errors.push({ path: itemCtx, message: "segmentationTable: item deve ter 'description'" });
    }
    if (!("percentage" in item)) {
      errors.push({ path: itemCtx, message: "segmentationTable: item deve ter 'percentage' (number)" });
    } else if (typeof item.percentage !== "number") {
      errors.push({
        path: `${itemCtx}.percentage`,
        message: "segmentationTable: 'percentage' deve ser number",
      });
    }
  });
  return errors;
}

/**
 * Shape esperado: SentimentDivergentChart (Charts.jsx) usa item.positive, item.negative e item[yAxisDataKey].
 */
function validateSentimentDivergentChartShape(resolved, context, component = {}) {
  const errors = [];
  if (!Array.isArray(resolved)) return errors;
  const yKey = component.config?.yAxisDataKey || "segment";
  resolved.forEach((item, i) => {
    const itemCtx = `${context}[${i}]`;
    if (!item || typeof item !== "object") return;
    if (typeof item.positive !== "number") {
      errors.push({
        path: itemCtx,
        message: "sentimentDivergentChart: item deve ter 'positive' (number)",
      });
    }
    if (typeof item.negative !== "number") {
      errors.push({
        path: itemCtx,
        message: "sentimentDivergentChart: item deve ter 'negative' (number)",
      });
    }
    if (!(yKey in item) && !("segment" in item) && !("category" in item)) {
      errors.push({
        path: itemCtx,
        message: `sentimentDivergentChart: item deve ter '${yKey}' (ou segment/category) para rótulo`,
      });
    }
  });
  return errors;
}

/**
 * Shape esperado: SentimentThreeColorChart (Charts.jsx) usa item.sentiment e item[segment] — mesmo formato que sentimentImpactTable.
 */
function validateSentimentThreeColorChartShape(resolved, context) {
  return validateSentimentImpactTableShape(resolved, context);
}

/**
 * Shape esperado: TopCategoriesCards (CardRenderers.jsx) usa cat.rank, cat.category, cat.mentions, cat.percentage, cat.topics (opcional).
 */
function validateTopCategoriesCardsShape(resolved, context) {
  const errors = [];
  if (!Array.isArray(resolved)) return errors;
  resolved.forEach((item, i) => {
    const itemCtx = `${context}[${i}]`;
    if (!item || typeof item !== "object") {
      errors.push({
        path: itemCtx,
        message: "topCategoriesCards: cada item deve ser um objeto com rank, category, mentions, percentage",
      });
      return;
    }
    if (!("rank" in item)) {
      errors.push({ path: itemCtx, message: "topCategoriesCards: item deve ter 'rank'" });
    }
    if (!("category" in item)) {
      errors.push({ path: itemCtx, message: "topCategoriesCards: item deve ter 'category'" });
    }
    if (!("mentions" in item)) {
      errors.push({ path: itemCtx, message: "topCategoriesCards: item deve ter 'mentions'" });
    }
    if (!("percentage" in item)) {
      errors.push({ path: itemCtx, message: "topCategoriesCards: item deve ter 'percentage' (number)" });
    } else if (typeof item.percentage !== "number") {
      errors.push({
        path: `${itemCtx}.percentage`,
        message: "topCategoriesCards: 'percentage' deve ser number",
      });
    }
  });
  return errors;
}

/**
 * Shape esperado: KPICard (CardRenderers.jsx) usa objeto com value (ou config.valueKey); label, delta, trend opcionais.
 */
function validateKPICardShape(resolved, context, component = {}) {
  const errors = [];
  if (resolved == null) return errors;
  if (typeof resolved === "object" && !Array.isArray(resolved)) {
    const valueKey = component.config?.valueKey ?? "value";
    if (!(valueKey in resolved)) {
      errors.push({
        path: context,
        message: `kpiCard: dados devem ser objeto com '${valueKey}' (ou número primitivo)`,
      });
    } else if (
      resolved[valueKey] !== null &&
      resolved[valueKey] !== undefined &&
      typeof resolved[valueKey] !== "number"
    ) {
      errors.push({
        path: `${context}.${valueKey}`,
        message: "kpiCard: value deve ser number",
      });
    }
  }
  return errors;
}

/**
 * Shape esperado: WordCloud (WordCloud.jsx) usa word.text e word.value (number).
 */
function validateWordCloudShape(resolved, context) {
  const errors = [];
  if (!Array.isArray(resolved)) return errors;
  resolved.forEach((item, i) => {
    const itemCtx = `${context}[${i}]`;
    if (!item || typeof item !== "object") {
      errors.push({
        path: itemCtx,
        message: "wordCloud: cada item deve ser um objeto com text e value",
      });
      return;
    }
    if (!("text" in item)) {
      errors.push({ path: itemCtx, message: "wordCloud: item deve ter 'text'" });
    }
    if (!("value" in item)) {
      errors.push({ path: itemCtx, message: "wordCloud: item deve ter 'value' (number)" });
    } else if (typeof item.value !== "number") {
      errors.push({
        path: `${itemCtx}.value`,
        message: "wordCloud: 'value' deve ser number",
      });
    }
  });
  return errors;
}

/**
 * Shape esperado pelo StackedBarMECE (StackedBarMECE.jsx + ChartRenderers SchemaStackedBarMECE):
 * - data: array de objetos; cada item = uma barra (categoria no eixo Y).
 * - Cada item deve ter a chave do eixo Y (yAxisDataKey ou categoryKey ou "option") e uma chave por série.
 * - config.series é obrigatório e não vazio: [{ dataKey, name, color? }]; cada dataKey deve existir em todo item e ser number (percentual).
 */
function validateStackedBarMECEShape(resolved, context, component = {}) {
  const errors = [];
  if (!Array.isArray(resolved)) return errors;
  const config = component.config || {};
  const series = config.series;
  const axisKey = config.yAxisDataKey ?? config.categoryKey ?? "option";

  if (!series || !Array.isArray(series) || series.length === 0) {
    errors.push({
      path: context,
      message:
        "stackedBarMECE: config.series é obrigatório e deve ser um array não vazio (ex.: [{ dataKey, name }, ...]). O componente exibe 'Nenhuma série configurada' quando series está vazio.",
    });
    return errors;
  }

  resolved.forEach((item, i) => {
    const itemCtx = `${context}[${i}]`;
    if (!item || typeof item !== "object") {
      errors.push({
        path: itemCtx,
        message: "stackedBarMECE: cada item deve ser um objeto com a chave do eixo Y e as chaves das séries (numbers)",
      });
      return;
    }
    if (!(axisKey in item)) {
      errors.push({
        path: itemCtx,
        message: `stackedBarMECE: item deve ter '${axisKey}' (eixo Y / categoria). Use config.yAxisDataKey ou config.categoryKey para definir.`,
      });
    }
    series.forEach((serie, sIdx) => {
      const dataKey = serie?.dataKey;
      if (!dataKey || typeof dataKey !== "string") {
        errors.push({
          path: context,
          message: `stackedBarMECE: config.series[${sIdx}] deve ter 'dataKey' (string)`,
        });
        return;
      }
      if (!(dataKey in item)) {
        errors.push({
          path: itemCtx,
          message: `stackedBarMECE: item deve ter '${dataKey}' (série configurada em config.series)`,
        });
      } else if (typeof item[dataKey] !== "number") {
        errors.push({
          path: `${itemCtx}.${dataKey}`,
          message: `stackedBarMECE: '${dataKey}' deve ser number (percentual). O gráfico usa domain [0,100] e formata como "%".`,
        });
      }
    });
  });
  return errors;
}

/**
 * Shape esperado pela AnalyticalTable (AnalyticalTable.jsx + TableRenderers SchemaAnalyticalTable):
 * - data: array de objetos (linhas). Colunas podem vir de config.columns ou ser inferidas do primeiro item.
 * - config opcional: columns ([{ key, label?, sortable?, formatter? }]), showRanking, defaultSort ({ key, direction }), rankingKey.
 * - Cada linha deve ser objeto; se config.columns existir, cada row deve ter as chaves column.key.
 */
function validateAnalyticalTableShape(resolved, context, component = {}) {
  const errors = [];
  if (!Array.isArray(resolved)) return errors;
  const config = component.config || {};
  const columns = config.columns;

  resolved.forEach((item, i) => {
    const itemCtx = `${context}[${i}]`;
    if (!item || typeof item !== "object") {
      errors.push({
        path: itemCtx,
        message: "analyticalTable: cada item deve ser um objeto (linha da tabela)",
      });
      return;
    }
    if (columns && Array.isArray(columns) && columns.length > 0) {
      columns.forEach((col, cIdx) => {
        const key = col?.key;
        if (!key || typeof key !== "string") {
          errors.push({
            path: context,
            message: `analyticalTable: config.columns[${cIdx}] deve ter 'key' (string)`,
          });
          return;
        }
        if (!(key in item)) {
          errors.push({
            path: itemCtx,
            message: `analyticalTable: item deve ter a chave '${key}' (definida em config.columns)`,
          });
        }
      });
    }
  });

  const ds = config.defaultSort;
  if (ds != null && typeof ds === "object") {
    if (!ds.key || typeof ds.key !== "string") {
      errors.push({
        path: context,
        message: "analyticalTable: config.defaultSort deve ter 'key' (string)",
      });
    }
    if (ds.direction != null && !["asc", "desc"].includes(ds.direction)) {
      errors.push({
        path: context,
        message: "analyticalTable: config.defaultSort.direction deve ser 'asc' ou 'desc'",
      });
    }
  }

  return errors;
}

/**
 * Shape esperado: RecommendationsTable items — cada item com id, recommendation, severity, stakeholders (array), tasks (array opcional).
 */
function validateRecommendationsTableItemsShape(resolved, context) {
  const errors = [];
  const items = Array.isArray(resolved) ? resolved : resolved?.items;
  if (!items || !Array.isArray(items)) return errors;
  items.forEach((item, i) => {
    const itemCtx = Array.isArray(resolved)
      ? `${context}[${i}]`
      : `${context}.items[${i}]`;
    if (!item || typeof item !== "object") {
      errors.push({
        path: itemCtx,
        message: "recommendationsTable: cada item deve ter id, recommendation, severity, stakeholders",
      });
      return;
    }
    if (!("id" in item)) {
      errors.push({ path: itemCtx, message: "recommendationsTable: item deve ter 'id'" });
    }
    if (!("recommendation" in item)) {
      errors.push({ path: itemCtx, message: "recommendationsTable: item deve ter 'recommendation'" });
    }
    if (!("severity" in item)) {
      errors.push({ path: itemCtx, message: "recommendationsTable: item deve ter 'severity'" });
    }
    if (!("stakeholders" in item)) {
      errors.push({ path: itemCtx, message: "recommendationsTable: item deve ter 'stakeholders' (array)" });
    } else if (!Array.isArray(item.stakeholders)) {
      errors.push({
        path: `${itemCtx}.stakeholders`,
        message: "recommendationsTable: 'stakeholders' deve ser array",
      });
    }
  });
  return errors;
}

/**
 * Valida estrutura de dados para cada tipo de componente
 */
function validateComponentData(
  component,
  data,
  context = "",
  sectionId = null,
  sectionData = null
) {
  const errors = [];
  const { type, dataPath } = component;

  if (!type) {
    // Componente sem type é inválido (wrapper não é mais usado)
    errors.push({
      path: context,
      message: "Componente deve ter 'type'",
    });
    return errors;
  }

  // Valida tipo válido
  if (type && !VALID_COMPONENT_TYPES.includes(type)) {
    errors.push({
      path: context,
      message: `Tipo de componente inválido: "${type}". Tipos válidos: ${VALID_COMPONENT_TYPES.join(
        ", "
      )}`,
    });
  }

  // Valida dataPath para componentes que precisam
  // container, grid-container, h3, h4, card, accordion, filterPills não requerem dataPath
  // questionsList tem dataPath opcional (usa "responseDetails" como padrão)
  const componentsRequiringDataPath = [
    // Charts
    "barChart",
    "sentimentDivergentChart",
    "sentimentThreeColorChart",
    "npsStackedChart",
    "lineChart",
    "paretoChart",
    "scatterPlot",
    "histogram",
    "quadrantChart",
    "heatmap",
    "sankeyDiagram",
    "stackedBarMECE",
    "evolutionaryScorecard",
    "slopeGraph",
    "waterfallChart",
    // Cards que precisam de dados
    "npsScoreCard",
    "topCategoriesCards",
    "kpiCard",
    // Tables
    "recommendationsTable",
    "segmentationTable",
    "distributionTable",
    "sentimentTable",
    "npsDistributionTable",
    "npsTable",
    "sentimentImpactTable",
    "positiveCategoriesTable",
    "negativeCategoriesTable",
    "analyticalTable",
    // Widgets que precisam de dados
    "wordCloud",
  ];

  if (componentsRequiringDataPath.includes(type) && !dataPath) {
    errors.push({
      path: context,
      message: `Componente "${type}" requer "dataPath"`,
    });
  }

  // Valida coerência type vs. chave do dataPath (ex.: type barChart com dataPath ...distributionTable)
  if (dataPath) {
    const coherenceError = validateDataPathMatchesComponentType(
      type,
      dataPath,
      context
    );
    if (coherenceError) errors.push(coherenceError);
  }

  // Valida dataPath existe e é array quando necessário
  if (dataPath) {
    const dataPathError = validateDataPath(
      dataPath,
      data,
      context,
      sectionId,
      sectionData
    );
    if (dataPathError) {
      errors.push(dataPathError);
    } else {
      // resolveDataPath já trata sectionData.* usando o parâmetro sectionData
      const resolved = resolveDataPath(data, dataPath, sectionId, sectionData);

      // Componentes que requerem arrays diretos
      const arrayComponents = [
        "barChart",
        "sentimentDivergentChart",
        "sentimentThreeColorChart",
        "segmentationTable",
        "distributionTable",
        "sentimentTable",
        "npsDistributionTable",
        "npsTable",
        "sentimentImpactTable",
        "positiveCategoriesTable",
        "negativeCategoriesTable",
        "topCategoriesCards",
        "wordCloud",
        // Novos gráficos que requerem arrays
        "lineChart",
        "paretoChart",
        "analyticalTable",
        "slopeGraph",
        "waterfallChart",
        "scatterPlot",
        "histogram",
        "quadrantChart",
        "heatmap",
        "stackedBarMECE",
      ];

      // Componentes que podem ser array OU objeto com items (estrutura flexível)
      const flexibleArrayComponents = [
        "recommendationsTable", // Pode ser array direto ou objeto com items
      ];

      // distributionTable: array vazio é permitido (código exibe "Nenhum dado"); shape validado abaixo
      const allowsEmptyArray = ["distributionTable"];

      if (arrayComponents.includes(type)) {
        if (!Array.isArray(resolved)) {
          errors.push({
            path: context,
            message: `Componente "${type}" requer que dataPath "${dataPath}" aponte para um array`,
          });
        } else if (
          resolved.length === 0 &&
          !allowsEmptyArray.includes(type)
        ) {
          errors.push({
            path: context,
            message: `Componente "${type}" requer que dataPath "${dataPath}" aponte para um array não vazio`,
          });
        } else if (resolved.length > 0) {
          // Validação de shape conforme contrato código (ESTRATEGIA_VALIDACAO_COMPONENTES.md)
          if (type === "distributionTable") {
            errors.push(
              ...validateDistributionTableShape(resolved, context),
            );
          }
          if (
            type === "barChart" &&
            dataPath.split(".").pop() === "distributionChart"
          ) {
            errors.push(
              ...validateDistributionChartShape(resolved, context),
            );
          }
          if (type === "sentimentTable") {
            errors.push(
              ...validateSentimentTableShape(resolved, context),
            );
          }
          if (type === "npsDistributionTable") {
            errors.push(
              ...validateNPSDistributionTableShape(resolved, context, component),
            );
          }
          if (type === "npsTable") {
            errors.push(
              ...validateNPSTableShape(resolved, context, component),
            );
          }
          if (type === "sentimentImpactTable") {
            errors.push(
              ...validateSentimentImpactTableShape(resolved, context),
            );
          }
          if (type === "positiveCategoriesTable") {
            errors.push(
              ...validateCategoriesTableShape(
                resolved,
                context,
                "positiveCategoriesTable",
              ),
            );
          }
          if (type === "negativeCategoriesTable") {
            errors.push(
              ...validateCategoriesTableShape(
                resolved,
                context,
                "negativeCategoriesTable",
              ),
            );
          }
          if (type === "segmentationTable") {
            errors.push(
              ...validateSegmentationTableShape(resolved, context),
            );
          }
          if (type === "sentimentDivergentChart") {
            errors.push(
              ...validateSentimentDivergentChartShape(
                resolved,
                context,
                component,
              ),
            );
          }
          if (type === "sentimentThreeColorChart") {
            errors.push(
              ...validateSentimentThreeColorChartShape(resolved, context),
            );
          }
          if (type === "topCategoriesCards") {
            errors.push(
              ...validateTopCategoriesCardsShape(resolved, context),
            );
          }
          if (type === "wordCloud") {
            errors.push(...validateWordCloudShape(resolved, context));
          }
          if (type === "stackedBarMECE") {
            errors.push(
              ...validateStackedBarMECEShape(resolved, context, component),
            );
          }
          if (type === "analyticalTable") {
            errors.push(
              ...validateAnalyticalTableShape(resolved, context, component),
            );
          }
        }
      } else if (flexibleArrayComponents.includes(type)) {
        // Valida estrutura flexível: pode ser array OU objeto com items (array)
        if (Array.isArray(resolved)) {
          // Estrutura antiga: array direto - OK
          if (resolved.length === 0) {
            errors.push({
              path: context,
              message: `Componente "${type}" requer que dataPath "${dataPath}" aponte para um array não vazio`,
            });
          }
        } else if (resolved && typeof resolved === "object") {
          // Estrutura nova: objeto com items
          if (!resolved.items || !Array.isArray(resolved.items)) {
            errors.push({
              path: context,
              message: `Componente "${type}" requer que dataPath "${dataPath}" seja um objeto com "items" (array) ou um array direto`,
            });
          } else if (resolved.items.length === 0) {
            errors.push({
              path: context,
              message: `Componente "${type}" requer que dataPath "${dataPath}.items" aponte para um array não vazio`,
            });
          } else {
            errors.push(
              ...validateRecommendationsTableItemsShape(resolved, context),
            );
          }
        } else {
          errors.push({
            path: context,
            message: `Componente "${type}" requer que dataPath "${dataPath}" seja um array ou um objeto com "items" (array)`,
          });
        }
      }
    }
  }

  // kpiCard: dados são objeto ou valor, não array
  if (type === "kpiCard" && dataPath) {
    const resolvedKpi = resolveDataPath(
      data,
      dataPath,
      sectionId,
      sectionData,
    );
    if (resolvedKpi !== null && resolvedKpi !== undefined) {
      errors.push(
        ...validateKPICardShape(resolvedKpi, context, component),
      );
    }
  }

  // recommendationsTable com array direto: validar shape dos itens
  if (type === "recommendationsTable" && dataPath) {
    const resolvedRec = resolveDataPath(
      data,
      dataPath,
      sectionId,
      sectionData,
    );
    if (Array.isArray(resolvedRec) && resolvedRec.length > 0) {
      errors.push(
        ...validateRecommendationsTableItemsShape(resolvedRec, context),
      );
    }
  }

  // Validações específicas por tipo
  if (type === "npsStackedChart" && dataPath) {
    const resolved = resolveDataPath(data, dataPath, sectionId, sectionData);
    if (resolved) {
      // Pode ser array ou objeto
      if (Array.isArray(resolved)) {
        // Array deve ter opções Detrator, Promotor, Neutro
        const options = resolved.map((d) => d.option);
        const missing = VALID_NPS_OPTIONS.filter(
          (opt) => !options.includes(opt)
        );
        if (missing.length > 0) {
          errors.push({
            path: context,
            message: `NPSStackedChart com array requer opções: ${VALID_NPS_OPTIONS.join(
              ", "
            )}. Faltando: ${missing.join(", ")}`,
          });
        }
      }
    }
  }

  // Valida templates em title e text
  if (component.title) {
    errors.push(
      ...validateTemplates(
        component.title,
        data,
        `${context}.title`,
        sectionId,
        sectionData
      )
    );
  }
  if (component.text) {
    errors.push(
      ...validateTemplates(
        component.text,
        data,
        `${context}.text`,
        sectionId,
        sectionData
      )
    );
  }

  return errors;
}

/**
 * Valida componentes recursivamente
 */
function validateComponents(
  components,
  data,
  context = "",
  sectionId = null,
  sectionData = null
) {
  const errors = [];

  if (!Array.isArray(components)) {
    return [
      {
        path: context,
        message: "components deve ser um array",
      },
    ];
  }

  components.forEach((component, index) => {
    const componentContext = `${context}[${index}]`;
    errors.push(
      ...validateComponentData(
        component,
        data,
        componentContext,
        sectionId,
        sectionData
      )
    );

    // Valida componentes aninhados
    if (component.components && Array.isArray(component.components)) {
      errors.push(
        ...validateComponents(
          component.components,
          data,
          `${componentContext}.components`,
          sectionId,
          sectionData
        )
      );
    }
  });

  return errors;
}

/**
 * Valida subsections com componentes diretamente
 * NOTA: Não há mais renderSchema. Componentes estão diretamente em subsections[].components
 */
function validateSubsections(
  subsections,
  data,
  sectionData,
  context = "",
  sectionId = null
) {
  const errors = [];

  if (!Array.isArray(subsections)) {
    return [
      {
        path: context,
        message: "subsections deve ser um array",
      },
    ];
  }

  subsections.forEach((subsection, index) => {
    const subsectionContext = `${context}[${index}]`;

    // Valida campos obrigatórios da subseção
    if (!subsection.id) {
      errors.push({
        path: subsectionContext,
        message: "Subseção deve ter 'id'",
      });
    }
    if (subsection.index === undefined) {
      errors.push({
        path: subsectionContext,
        message: "Subseção deve ter 'index'",
      });
    }
    if (!subsection.name) {
      errors.push({
        path: subsectionContext,
        message: "Subseção deve ter 'name'",
      });
    }
    if (!subsection.icon) {
      errors.push({
        path: subsectionContext,
        message: "Subseção deve ter 'icon'",
      });
    }

    // Valida componentes diretamente em subsections[].components
    // Passa data e sectionData separadamente para que resolveDataPath funcione corretamente
    if (subsection.components && Array.isArray(subsection.components)) {
      errors.push(
        ...validateComponents(
          subsection.components,
          data, // Passa data original
          `${subsectionContext}.components`,
          sectionId,
          sectionData // Passa sectionData separadamente
        )
      );
    }
  });

  return errors;
}

/**
 * Alertas: campo esperado (ex: option) recebeu outro (ex: label)
 */
function checkChartItemFieldName(
  items,
  context,
  fieldExpected = "option",
  fieldAlternate = "label"
) {
  const out = [];
  if (!Array.isArray(items)) return out;
  items.forEach((item, i) => {
    if (
      item &&
      item[fieldAlternate] !== undefined &&
      item[fieldExpected] === undefined
    ) {
      out.push(
        warn(
          `${context}[${i}]`,
          `Campo esperado "${fieldExpected}", recebido "${fieldAlternate}". Use "${fieldExpected}" (padrão ouro).`
        )
      );
    }
  });
  return out;
}

/**
 * Alertas: campo que deveria ser number está como string
 */
function checkNumberNotString(value, context, fieldName) {
  if (value === undefined || value === null) return [];
  if (typeof value === "string") {
    return [
      warn(
        context,
        `Campo "${fieldName}" deveria ser number, está como string.`
      ),
    ];
  }
  return [];
}

/**
 * Alertas: campo vazio (string vazia)
 */
function checkNotEmptyString(value, context, fieldName) {
  if (value === "" || (typeof value === "string" && value.trim() === "")) {
    return [warn(context, `Campo "${fieldName}" está vazio.`)];
  }
  return [];
}

/**
 * Charts (em dados de questão) cujos itens devem ter 'value' e 'percentage'.
 * Baseado no código: npsStackedChart e barChart (QuestionsList, SchemaBarChart, NPS) usam item.value e item.percentage.
 * Outros charts (sentimentDivergentChart, lineChart, paretoChart, etc.) usam outras chaves (positive/negative, x/y, category/value).
 */
const QUESTION_CHART_KEYS_REQUIRING_VALUE_AND_PERCENTAGE = [
  "npsStackedChart",
  "barChart",
];

/**
 * Alertas: item deve ter value e percentage; avisa quando tem só um deles.
 * Aplicado apenas aos charts listados em QUESTION_CHART_KEYS_REQUIRING_VALUE_AND_PERCENTAGE.
 */
function checkChartItemValueAndPercentage(items, context) {
  const out = [];
  if (!Array.isArray(items)) return out;
  items.forEach((item, i) => {
    if (!item) return;
    const hasValue = item.value !== undefined && item.value !== null;
    const hasPercentage =
      item.percentage !== undefined && item.percentage !== null;
    if (hasPercentage && !hasValue) {
      out.push(
        warn(
          `${context}[${i}]`,
          "Item deve ter 'value' e 'percentage'; tem apenas 'percentage'."
        )
      );
    }
    if (hasValue && !hasPercentage) {
      out.push(
        warn(
          `${context}[${i}]`,
          "Item deve ter 'value' e 'percentage'; tem apenas 'value'."
        )
      );
    }
  });
  return out;
}

/**
 * Valida questões
 */
function validateQuestions(questions, context = "") {
  const errors = [];

  if (!Array.isArray(questions)) {
    return [err(context, "questions deve ser um array")];
  }

  const questionIds = [];
  questions.forEach((question, index) => {
    const questionContext = `${context}[${index}]`;

    // Campos numéricos não devem ser string
    if (question.id !== undefined && question.id !== null) {
      errors.push(
        ...checkNumberNotString(question.id, `${questionContext}.id`, "id")
      );
      questionIds.push(question.id);
    }
    if (question.index !== undefined && question.index !== null) {
      errors.push(
        ...checkNumberNotString(
          question.index,
          `${questionContext}.index`,
          "index"
        )
      );
    }

    // Valida campos obrigatórios
    if (question.id === undefined || question.id === null) {
      errors.push(err(questionContext, "Questão deve ter 'id'"));
    }

    if (question.index === undefined || question.index === null) {
      errors.push(err(questionContext, "Questão deve ter 'index'"));
    }

    if (!question.question) {
      errors.push(
        err(questionContext, "Questão deve ter 'question' (texto da pergunta)")
      );
    } else {
      errors.push(
        ...checkNotEmptyString(
          question.question,
          `${questionContext}.question`,
          "question"
        )
      );
    }

    // Valida questionType (não type)
    if (!question.questionType) {
      errors.push(
        err(questionContext, "Questão deve ter 'questionType' (não 'type')")
      );
    } else if (!VALID_QUESTION_TYPES.includes(question.questionType)) {
      errors.push(
        err(
          questionContext,
          `Tipo de questão inválido: "${
            question.questionType
          }". Tipos válidos: ${VALID_QUESTION_TYPES.join(", ")}`
        )
      );
    }

    if (question.type && !question.questionType) {
      errors.push(
        err(
          questionContext,
          "Questões devem usar 'questionType' (não 'type'). Use 'questionType' para questões."
        )
      );
    }

    // Validações específicas por tipo (usando questionType)
    if (question.questionType === "nps") {
      if (
        question.data &&
        question.data.npsStackedChart &&
        Array.isArray(question.data.npsStackedChart)
      ) {
        const chart = question.data.npsStackedChart;
        const options = chart.map((d) => d.option);
        const missing = VALID_NPS_OPTIONS.filter(
          (opt) => !options.includes(opt)
        );
        if (missing.length > 0) {
          errors.push(
            err(
              questionContext,
              `Questão NPS deve ter opções em data.npsStackedChart: ${VALID_NPS_OPTIONS.join(
                ", "
              )}. Faltando: ${missing.join(", ")}`
            )
          );
        }
        // Alerta: option vs label
        errors.push(
          ...checkChartItemFieldName(
            chart,
            `${questionContext}.data.npsStackedChart`,
            "option",
            "label"
          )
        );
        // Alerta: value/percentage como string
        chart.forEach((item, i) => {
          const ctx = `${questionContext}.data.npsStackedChart[${i}]`;
          if (item && item.value !== undefined) {
            errors.push(
              ...checkNumberNotString(item.value, `${ctx}.value`, "value")
            );
          }
          if (item && item.percentage !== undefined) {
            errors.push(
              ...checkNumberNotString(
                item.percentage,
                `${ctx}.percentage`,
                "percentage"
              )
            );
          }
        });
        // npsStackedChart: itens devem ter value e percentage (QUESTION_CHART_KEYS_REQUIRING_VALUE_AND_PERCENTAGE)
        errors.push(
          ...checkChartItemValueAndPercentage(
            chart,
            `${questionContext}.data.npsStackedChart`
          )
        );
      }
      if (question.data) {
        if (question.data.npsScore === undefined) {
          errors.push(
            err(questionContext, "Questão NPS deve ter 'data.npsScore'")
          );
        } else {
          errors.push(
            ...checkNumberNotString(
              question.data.npsScore,
              `${questionContext}.data.npsScore`,
              "npsScore"
            )
          );
        }
      }
    }

    if (question.questionType === "open-ended") {
      if (question.data) {
        const hasSentiment =
          (question.data.sentimentDivergentChart &&
            Array.isArray(question.data.sentimentDivergentChart)) ||
          (question.data.sentimentStackedChart &&
            Array.isArray(question.data.sentimentStackedChart));
        const hasWordCloud =
          question.data.wordCloud && Array.isArray(question.data.wordCloud);
        const hasTopCategories =
          question.data.topCategoriesCards &&
          Array.isArray(question.data.topCategoriesCards);

        if (!hasSentiment && !hasWordCloud && !hasTopCategories) {
          errors.push(
            err(
              questionContext,
              "Questão open-ended deve ter pelo menos um de: 'data.sentimentDivergentChart' (ou 'data.sentimentStackedChart'), 'data.wordCloud', ou 'data.topCategoriesCards'"
            )
          );
        }
        // Aviso: arrays vazios (falta dado para renderizar)
        if (
          question.data.wordCloud &&
          Array.isArray(question.data.wordCloud) &&
          question.data.wordCloud.length === 0
        ) {
          errors.push(
            warn(
              `${questionContext}.data.wordCloud`,
              "Array wordCloud vazio; preencher para exibir nuvem de palavras."
            )
          );
        }
        if (
          question.data.sentimentCategories &&
          Array.isArray(question.data.sentimentCategories) &&
          question.data.sentimentCategories.length === 0
        ) {
          errors.push(
            warn(
              `${questionContext}.data.sentimentCategories`,
              "Array sentimentCategories vazio; preencher para exibir."
            )
          );
        }
        if (
          question.data.topicsByCategory &&
          Array.isArray(question.data.topicsByCategory) &&
          question.data.topicsByCategory.length === 0
        ) {
          errors.push(
            warn(
              `${questionContext}.data.topicsByCategory`,
              "Array topicsByCategory vazio; preencher para exibir."
            )
          );
        }
      }
    }

    if (
      question.questionType === "multiple-choice" ||
      question.questionType === "single-choice"
    ) {
      if (
        !question.data ||
        !question.data.barChart ||
        !Array.isArray(question.data.barChart)
      ) {
        errors.push(
          err(
            questionContext,
            "Questão multiple-choice/single-choice deve ter 'data.barChart' como array"
          )
        );
      } else {
        const chart = question.data.barChart;
        errors.push(
          ...checkChartItemFieldName(
            chart,
            `${questionContext}.data.barChart`,
            "option",
            "label"
          )
        );
        chart.forEach((item, i) => {
          const ctx = `${questionContext}.data.barChart[${i}]`;
          if (item && item.value !== undefined) {
            errors.push(
              ...checkNumberNotString(item.value, `${ctx}.value`, "value")
            );
          }
          if (item && item.percentage !== undefined) {
            errors.push(
              ...checkNumberNotString(
                item.percentage,
                `${ctx}.percentage`,
                "percentage"
              )
            );
          }
        });
        // barChart: itens devem ter value e percentage (QUESTION_CHART_KEYS_REQUIRING_VALUE_AND_PERCENTAGE)
        errors.push(
          ...checkChartItemValueAndPercentage(
            chart,
            `${questionContext}.data.barChart`
          )
        );
      }
    }
  });

  // Valida IDs únicos
  const duplicateIds = questionIds.filter(
    (id, index) => questionIds.indexOf(id) !== index
  );
  if (duplicateIds.length > 0) {
    errors.push(
      err(
        context,
        `IDs de questões duplicados: ${[...new Set(duplicateIds)].join(", ")}`
      )
    );
  }

  return errors;
}

/**
 * Função principal de validação customizada
 * NOTA: Estrutura atualizada - sections diretamente no nível raiz (não sectionsConfig.sections)
 * Componentes estão diretamente em subsections[].components (não há mais renderSchema)
 */
export function validateCustomRules(data) {
  const errors = [];

  // Validar IDs únicos de seções
  // Estrutura nova: sections diretamente no nível raiz
  if (data.sections && Array.isArray(data.sections)) {
    const sectionIds = data.sections.map((s) => s.id);
    const duplicateSectionIds = sectionIds.filter(
      (id, index) => sectionIds.indexOf(id) !== index
    );
    if (duplicateSectionIds.length > 0) {
      errors.push({
        path: "/sections",
        message: `IDs de seções duplicados: ${[
          ...new Set(duplicateSectionIds),
        ].join(", ")}`,
      });
    }

    // Validar índices sequenciais
    const sectionIndices = data.sections.map((s) => s.index);
    const sortedIndices = [...sectionIndices].sort((a, b) => a - b);
    const expectedIndices = Array.from(
      { length: sortedIndices.length },
      (_, i) => i
    );

    if (JSON.stringify(sortedIndices) !== JSON.stringify(expectedIndices)) {
      errors.push({
        path: "/sections",
        message: `Índices de seções devem começar em 0 e ser sequenciais. Encontrado: ${sectionIndices.join(
          ", "
        )}`,
      });
    }

    // Validar cada seção
    data.sections.forEach((section, index) => {
      const sectionContext = `/sections[${index}]`;

      // Construir sectionData de forma genérica para qualquer seção com subsections
      // (exceto a de questions/responses, cujas "subseções" vêm de section.questions)
      let sectionData = { ...(section.data || {}) };
      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach((sub) => {
          const key = sub.id.startsWith(section.id + "-")
            ? sub.id.slice(section.id.length + 1)
            : sub.id;
          sectionData[key] = sub.data ?? {};
        });
        // Para seção attributes, manter sectionData.attributes (array) para currentAttribute.*
        if (section.id === "attributes") {
          sectionData.attributes = section.subsections.map(
            (sub) => sub.data ?? {}
          );
        }
      }

      // Validar subsections com componentes diretamente
      if (section.subsections && Array.isArray(section.subsections)) {
        // Validar IDs únicos de subseções
        const subsectionIds = section.subsections.map((s) => s.id);
        const duplicateSubsectionIds = subsectionIds.filter(
          (id, index) => subsectionIds.indexOf(id) !== index
        );
        if (duplicateSubsectionIds.length > 0) {
          errors.push({
            path: `${sectionContext}/subsections`,
            message: `IDs de subseções duplicados na seção "${
              section.name || section.id
            }": ${[...new Set(duplicateSubsectionIds)].join(", ")}`,
          });
        }

        // Validar índices sequenciais de subseções
        const subsectionIndices = section.subsections.map((s) => s.index);
        const sortedSubIndices = [...subsectionIndices].sort((a, b) => a - b);
        const expectedSubIndices = Array.from(
          { length: sortedSubIndices.length },
          (_, i) => i
        );

        if (
          JSON.stringify(sortedSubIndices) !==
          JSON.stringify(expectedSubIndices)
        ) {
          errors.push({
            path: `${sectionContext}/subsections`,
            message: `Índices de subseções devem começar em 0 e ser sequenciais. Encontrado: ${subsectionIndices.join(
              ", "
            )}`,
          });
        }

        // Validar componentes em subsections[].components
        errors.push(
          ...validateSubsections(
            section.subsections,
            data,
            sectionData,
            `${sectionContext}.subsections`,
            section.id
          )
        );
      }

      // Validar componentes diretos na seção (se não houver subsections)
      if (section.components && Array.isArray(section.components)) {
        errors.push(
          ...validateComponents(
            section.components,
            data, // Passa data original
            `${sectionContext}.components`,
            section.id,
            sectionData // Passa sectionData separadamente
          )
        );
      }
    });
  }

  // Padrão ouro: a seção que contém 'questions' deve ter id "responses" ou "questions"
  const sectionWithQuestions = data.sections?.find(
    (s) => Array.isArray(s.questions) && s.questions.length > 0
  );
  if (sectionWithQuestions) {
    if (!VALID_SECTION_IDS_QUESTIONS.includes(sectionWithQuestions.id)) {
      const idx = data.sections.indexOf(sectionWithQuestions);
      errors.push(
        err(
          `/sections[${idx}]`,
          `A seção que contém 'questions' deve ter id "responses" ou "questions". Encontrado: "${sectionWithQuestions.id}"`
        )
      );
    }
    const sectionIdx = data.sections.indexOf(sectionWithQuestions);
    errors.push(
      ...validateQuestions(
        sectionWithQuestions.questions,
        `/sections[${sectionIdx}]/questions`
      )
    );
  }

  // Validar NPS range
  if (data.surveyInfo?.nps !== undefined) {
    errors.push(
      ...checkNumberNotString(data.surveyInfo.nps, "/surveyInfo/nps", "nps")
    );
    if (
      typeof data.surveyInfo.nps === "number" &&
      (data.surveyInfo.nps < -100 || data.surveyInfo.nps > 100)
    ) {
      errors.push(
        err(
          "/surveyInfo/nps",
          `NPS deve estar entre -100 e 100. Valor atual: ${data.surveyInfo.nps}`
        )
      );
    }
  }
  if (data.surveyInfo?.totalRespondents !== undefined) {
    errors.push(
      ...checkNumberNotString(
        data.surveyInfo.totalRespondents,
        "/surveyInfo/totalRespondents",
        "totalRespondents"
      )
    );
  }
  if (data.surveyInfo?.responseRate !== undefined) {
    errors.push(
      ...checkNumberNotString(
        data.surveyInfo.responseRate,
        "/surveyInfo/responseRate",
        "responseRate"
      )
    );
  }

  return errors;
}
