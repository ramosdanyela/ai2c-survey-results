/**
 * Regras customizadas de validação baseadas no código de renderização
 * Estas regras validam lógica de negócio que não pode ser expressa em JSON Schema
 */

// Tipos de componentes válidos (baseado no switch case do GenericSectionRenderer)
const VALID_COMPONENT_TYPES = [
  "card",
  "barChart",
  "sentimentDivergentChart",
  "sentimentStackedChart",
  "sentimentThreeColorChart",
  "recommendationsTable",
  "segmentationTable",
  "distributionTable",
  "sentimentTable",
  "npsDistributionTable",
  "npsTable",
  "sentimentImpactTable",
  "positiveCategoriesTable",
  "negativeCategoriesTable",
  "questionsList",
  "npsStackedChart",
  "npsScoreCard",
  "topCategoriesCards",
  "filterPills",
  "wordCloud",
  "accordion",
];

// Tipos de questões válidos
const VALID_QUESTION_TYPES = ["nps", "closed", "open"];

// Opções válidas para questões NPS
const VALID_NPS_OPTIONS = ["Detrator", "Promotor", "Neutro"];

/**
 * Resolve path de dados (simula resolveDataPath do código)
 * Suporta currentAttribute que é adicionado dinamicamente para seção "attributes"
 */
function resolveDataPath(obj, path, sectionId = null, sectionData = null) {
  if (!obj || !path) return null;

  // Handle currentAttribute (contexto dinâmico para seção "attributes")
  if (path.startsWith("currentAttribute.") && sectionId === "attributes") {
    const attributePath = path.replace("currentAttribute.", "");
    // Verifica se existe algum atributo no array attributes
    const attributes = sectionData?.attributes || resolveDataPath(sectionData, "attributes");
    if (attributes && Array.isArray(attributes) && attributes.length > 0) {
      // Usa o primeiro atributo como exemplo para validar a estrutura
      const firstAttribute = attributes[0];
      return resolveDataPath({ currentAttribute: firstAttribute }, path);
    }
    // Se não tem attributes, não podemos validar, mas não é erro (pode ser template)
    return { _isDynamic: true, _path: attributePath };
  }

  // Handle relative paths with "sectionData." prefix
  if (path.startsWith("sectionData.")) {
    const relativePath = path.replace("sectionData.", "");
    if (obj.sectionData) {
      return resolveDataPath(obj.sectionData, relativePath, sectionId, sectionData);
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
 * Valida se um dataPath aponta para dados válidos
 */
function validateDataPath(dataPath, data, context = "", sectionId = null, sectionData = null) {
  if (!dataPath) return null;

  // currentAttribute é contexto dinâmico - valida estrutura, não existência
  if (dataPath.startsWith("currentAttribute.") && sectionId === "attributes") {
    const attributePath = dataPath.replace("currentAttribute.", "");
    const attributes = sectionData?.attributes || resolveDataPath(sectionData, "attributes", sectionId, sectionData);
    if (attributes && Array.isArray(attributes) && attributes.length > 0) {
      // Valida se pelo menos um atributo tem essa propriedade
      const hasProperty = attributes.some(attr => {
        const value = resolveDataPath({ currentAttribute: attr }, dataPath, sectionId, sectionData);
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
function validateTemplates(template, data, context = "", sectionId = null, sectionData = null) {
  if (!template || typeof template !== "string") return [];

  const errors = [];
  const templateRegex = /\{\{([^}]+)\}\}/g;
  let match;

  while ((match = templateRegex.exec(template)) !== null) {
    const path = match[1].trim();

    // Se for path de uiTexts, valida em uiTexts
    if (path.startsWith("uiTexts.")) {
      const cleanPath = path.replace(/^uiTexts\./, "");
      const value = resolveDataPath(data.uiTexts, cleanPath, sectionId, sectionData);
      if (value === null || value === undefined) {
        errors.push({
          path: context,
          message: `Template "${match[0]}" referencia uiTexts.${cleanPath} que não existe`,
        });
      }
    } else if (path.startsWith("currentAttribute.") && sectionId === "attributes") {
      // currentAttribute é contexto dinâmico - valida estrutura
      const attributePath = path.replace("currentAttribute.", "");
      const attributes = sectionData?.attributes || resolveDataPath(sectionData, "attributes", sectionId, sectionData);
      if (attributes && Array.isArray(attributes) && attributes.length > 0) {
        const hasProperty = attributes.some(attr => {
          const value = resolveDataPath({ currentAttribute: attr }, path, sectionId, sectionData);
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
 * Valida estrutura de dados para cada tipo de componente
 */
function validateComponentData(component, data, context = "", sectionId = null, sectionData = null) {
  const errors = [];
  const { type, dataPath } = component;

  if (!type) {
    // Componente sem type mas com wrapper é válido
    if (!component.wrapper) {
      errors.push({
        path: context,
        message: "Componente deve ter 'type' ou 'wrapper'",
      });
    }
    return errors;
  }

  // Valida tipo válido
  if (!VALID_COMPONENT_TYPES.includes(type)) {
    errors.push({
      path: context,
      message: `Tipo de componente inválido: "${type}". Tipos válidos: ${VALID_COMPONENT_TYPES.join(", ")}`,
    });
  }

  // Valida dataPath para componentes que precisam
  const componentsRequiringDataPath = [
    "barChart",
    "sentimentDivergentChart",
    "sentimentStackedChart",
    "sentimentThreeColorChart",
    "recommendationsTable",
    "segmentationTable",
    "distributionTable",
    "sentimentTable",
    "npsDistributionTable",
    "npsTable",
    "sentimentImpactTable",
    "positiveCategoriesTable",
    "negativeCategoriesTable",
    "npsStackedChart",
    "topCategoriesCards",
    "wordCloud",
  ];

  if (componentsRequiringDataPath.includes(type) && !dataPath) {
    errors.push({
      path: context,
      message: `Componente "${type}" requer "dataPath"`,
    });
  }

  // Valida dataPath existe e é array quando necessário
  if (dataPath) {
    const dataPathError = validateDataPath(dataPath, data, context, sectionId, sectionData);
    if (dataPathError) {
      errors.push(dataPathError);
    } else {
      const resolved = resolveDataPath(data, dataPath, sectionId, sectionData);
      const arrayComponents = [
        "barChart",
        "sentimentDivergentChart",
        "sentimentStackedChart",
        "sentimentThreeColorChart",
        "recommendationsTable",
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
      ];

      if (arrayComponents.includes(type)) {
        if (!Array.isArray(resolved)) {
          errors.push({
            path: context,
            message: `Componente "${type}" requer que dataPath "${dataPath}" aponte para um array`,
          });
        } else if (resolved.length === 0) {
          errors.push({
            path: context,
            message: `Componente "${type}" requer que dataPath "${dataPath}" aponte para um array não vazio`,
          });
        }
      }
    }
  }

  // Validações específicas por tipo
  if (type === "npsStackedChart" && dataPath) {
    const resolved = resolveDataPath(data, dataPath);
    if (resolved) {
      // Pode ser array ou objeto
      if (Array.isArray(resolved)) {
        // Array deve ter opções Detrator, Promotor, Neutro
        const options = resolved.map((d) => d.option);
        const missing = VALID_NPS_OPTIONS.filter((opt) => !options.includes(opt));
        if (missing.length > 0) {
          errors.push({
            path: context,
            message: `NPSStackedChart com array requer opções: ${VALID_NPS_OPTIONS.join(", ")}. Faltando: ${missing.join(", ")}`,
          });
        }
      }
    }
  }

  // Valida templates em title e content
  if (component.title) {
    errors.push(...validateTemplates(component.title, data, `${context}.title`, sectionId, sectionData));
  }
  if (component.content) {
    errors.push(...validateTemplates(component.content, data, `${context}.content`, sectionId, sectionData));
  }

  return errors;
}

/**
 * Valida componentes recursivamente
 */
function validateComponents(components, data, context = "", sectionId = null, sectionData = null) {
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
    errors.push(...validateComponentData(component, data, componentContext, sectionId, sectionData));

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
 * Valida renderSchema
 */
function validateRenderSchema(renderSchema, data, sectionData, context = "", sectionId = null) {
  const errors = [];

  if (!renderSchema || typeof renderSchema !== "object") {
    return [
      {
        path: context,
        message: "renderSchema deve ser um objeto",
      },
    ];
  }

  // Adiciona sectionData ao contexto de dados
  const enhancedData = {
    ...data,
    sectionData,
  };

  // Valida subsections
  if (renderSchema.subsections) {
    if (!Array.isArray(renderSchema.subsections)) {
      errors.push({
        path: `${context}.subsections`,
        message: "subsections deve ser um array",
      });
    } else {
      renderSchema.subsections.forEach((subsection, index) => {
        const subsectionContext = `${context}.subsections[${index}]`;
        if (subsection.components) {
          errors.push(
            ...validateComponents(
              subsection.components,
              enhancedData,
              `${subsectionContext}.components`,
              sectionId,
              sectionData
            )
          );
        }
      });
    }
  }

  // Valida components diretos
  if (renderSchema.components) {
    errors.push(
      ...validateComponents(
        renderSchema.components,
        enhancedData,
        `${context}.components`,
        sectionId,
        sectionData
      )
    );
  }

  return errors;
}

/**
 * Valida questões
 */
function validateQuestions(questions, context = "") {
  const errors = [];

  if (!Array.isArray(questions)) {
    return [
      {
        path: context,
        message: "questions deve ser um array",
      },
    ];
  }

  const questionIds = [];
  questions.forEach((question, index) => {
    const questionContext = `${context}[${index}]`;

    // Valida campos obrigatórios
    if (!question.id) {
      errors.push({
        path: questionContext,
        message: "Questão deve ter 'id'",
      });
    } else {
      questionIds.push(question.id);
    }

    if (!question.type) {
      errors.push({
        path: questionContext,
        message: "Questão deve ter 'type'",
      });
    } else if (!VALID_QUESTION_TYPES.includes(question.type)) {
      errors.push({
        path: questionContext,
        message: `Tipo de questão inválido: "${question.type}". Tipos válidos: ${VALID_QUESTION_TYPES.join(", ")}`,
      });
    }

    // Validações específicas por tipo
    if (question.type === "nps") {
      if (question.data && Array.isArray(question.data)) {
        const options = question.data.map((d) => d.option);
        const missing = VALID_NPS_OPTIONS.filter((opt) => !options.includes(opt));
        if (missing.length > 0) {
          errors.push({
            path: questionContext,
            message: `Questão NPS deve ter opções: ${VALID_NPS_OPTIONS.join(", ")}. Faltando: ${missing.join(", ")}`,
          });
        }
      }
    }

    if (question.type === "open") {
      if (!question.sentimentData && !question.wordCloud) {
        errors.push({
          path: questionContext,
          message: "Questão aberta deve ter 'sentimentData' ou 'wordCloud'",
        });
      }
    }

    if (question.type === "closed") {
      if (!question.data || !Array.isArray(question.data)) {
        errors.push({
          path: questionContext,
          message: "Questão fechada deve ter 'data' como array",
        });
      }
    }
  });

  // Valida IDs únicos
  const duplicateIds = questionIds.filter(
    (id, index) => questionIds.indexOf(id) !== index
  );
  if (duplicateIds.length > 0) {
    errors.push({
      path: context,
      message: `IDs de questões duplicados: ${[...new Set(duplicateIds)].join(", ")}`,
    });
  }

  return errors;
}

/**
 * Função principal de validação customizada
 */
export function validateCustomRules(data) {
  const errors = [];

  // Validar IDs únicos de seções
  if (data.sectionsConfig?.sections) {
    const sectionIds = data.sectionsConfig.sections.map((s) => s.id);
    const duplicateSectionIds = sectionIds.filter(
      (id, index) => sectionIds.indexOf(id) !== index
    );
    if (duplicateSectionIds.length > 0) {
      errors.push({
        path: "/sectionsConfig/sections",
        message: `IDs de seções duplicados: ${[...new Set(duplicateSectionIds)].join(", ")}`,
      });
    }

    // Validar índices sequenciais
    const sectionIndices = data.sectionsConfig.sections.map((s) => s.index);
    const sortedIndices = [...sectionIndices].sort((a, b) => a - b);
    const expectedIndices = Array.from(
      { length: sortedIndices.length },
      (_, i) => i
    );

    if (JSON.stringify(sortedIndices) !== JSON.stringify(expectedIndices)) {
      errors.push({
        path: "/sectionsConfig/sections",
        message: `Índices de seções devem começar em 0 e ser sequenciais. Encontrado: ${sectionIndices.join(", ")}`,
      });
    }

    // Validar cada seção
    data.sectionsConfig.sections.forEach((section, index) => {
      const sectionContext = `/sectionsConfig/sections[${index}]`;

      // Validar que seções com hasSchema: true têm data (mas não se for isRoute: true)
      if (section.hasSchema && !section.isRoute && !section.data) {
        errors.push({
          path: sectionContext,
          message: `Seção "${section.name || section.id}" tem hasSchema: true mas não possui propriedade "data"`,
        });
      }

      // Validar que seções sem isRoute: true devem ter hasSchema
      if (!section.isRoute && section.hasSchema === undefined) {
        errors.push({
          path: sectionContext,
          message: `Seção "${section.name || section.id}" deve ter "hasSchema" (ou "isRoute: true" se for rota especial)`,
        });
      }

      // Validar renderSchema se existir
      if (section.data?.renderSchema) {
        const sectionData = section.data;
        errors.push(
          ...validateRenderSchema(
            section.data.renderSchema,
            data,
            sectionData,
            `${sectionContext}.data.renderSchema`,
            section.id
          )
        );
      }

      // Validar IDs únicos de subseções
      if (section.subsections) {
        const subsectionIds = section.subsections.map((s) => s.id);
        const duplicateSubsectionIds = subsectionIds.filter(
          (id, index) => subsectionIds.indexOf(id) !== index
        );
        if (duplicateSubsectionIds.length > 0) {
          errors.push({
            path: `${sectionContext}/subsections`,
            message: `IDs de subseções duplicados na seção "${section.name}": ${[...new Set(duplicateSubsectionIds)].join(", ")}`,
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
            message: `Índices de subseções devem começar em 0 e ser sequenciais. Encontrado: ${subsectionIndices.join(", ")}`,
          });
        }
      }
    });
  }

  // Validar questões (se existirem)
  const responsesSection = data.sectionsConfig?.sections?.find(
    (s) => s.id === "responses"
  );
  if (responsesSection?.data?.questions) {
    errors.push(
      ...validateQuestions(
        responsesSection.data.questions,
        `/sectionsConfig/sections[responses]/data/questions`
      )
    );
  }

  // Validar NPS range
  if (data.surveyInfo?.nps !== undefined) {
    if (data.surveyInfo.nps < -100 || data.surveyInfo.nps > 100) {
      errors.push({
        path: "/surveyInfo/nps",
        message: `NPS deve estar entre -100 e 100. Valor atual: ${data.surveyInfo.nps}`,
      });
    }
  }

  return errors;
}

