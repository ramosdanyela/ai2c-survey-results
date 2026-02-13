import { useState, useMemo, useEffect } from "react";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Check, BookOpen, Code, Layout, Palette, X, List } from "lucide-react";
import { Table as TableIcon } from "@/lib/icons";
import {
  componentRegistry,
  renderComponent,
} from "@/components/survey/common/ComponentRegistry";
import {
  cardVariants,
  cardContentVariants,
  cardTitleVariants,
} from "@/styles/variants";
import { enrichComponentWithStyles } from "@/services/styleResolver";
import { resolveDataPath } from "@/services/dataResolver";
import { useSurveyData } from "@/hooks/useSurveyData";
import {
  getSupportedQuestionTypes,
  questionTypeTemplates,
} from "@/config/questionTemplates";
import { componentCategories } from "@/config/componentCategories";
import { basicStructure } from "@/config/jsonStructureSchema";
import { cardExamples } from "@/config/cardExamples";
import { otherComponentExampleData } from "@/config/otherComponentExampleData";
import {
  metadataFields,
  componentFields,
  sectionFields,
  subsectionFields,
  questionFields,
  surveyInfoFields,
} from "@/config/fieldsReference";

/**
 * Página de Referência do JSON Schema
 * Documenta todos os campos, estruturas e componentes disponíveis
 */
export default function JsonReference() {
  const [copiedCode, setCopiedCode] = useState(null);
  const { data: surveyDataJson, loading, source: dataSourceLabel } = useSurveyData();

  // Hooks precisam ser chamados antes de qualquer return condicional (Rules of Hooks)
  // sectionData pode vir de section.data e/ou de subsection.data; sempre procurar primeiro em sectionData
  const sectionData = useMemo(() => {
    if (!surveyDataJson?.sections) return {};
    // Usa a primeira seção com data para o contexto de exemplos (ex.: executive ou attributes)
    const sectionWithData = surveyDataJson.sections.find(
      (s) => s.data && Object.keys(s.data).length > 0
    );
    if (sectionWithData?.data) return sectionWithData.data;
    // Fallback: qualquer seção com .data
    const anySection = surveyDataJson.sections.find((s) => s.data);
    return anySection?.data || {};
  }, [surveyDataJson]);

  const realData = useMemo(
    () => ({
      ...surveyDataJson,
      sectionData: sectionData,
      surveyInfo: {
        ...(surveyDataJson?.metadata || {}),
        totalRespondents: surveyDataJson?.metadata?.totalRespondents || 850,
        nps: surveyDataJson?.metadata?.nps || 35,
      },
      uiTexts: surveyDataJson?.uiTexts || {},
      _filterPillsState: null,
    }),
    [surveyDataJson, sectionData]
  );

  // Dados de todas as seções merged para a aba Data Path (exemplos com dados reais)
  const mergedSectionData = useMemo(() => {
    const sections = surveyDataJson?.sections || [];
    return Object.assign(
      {},
      ...sections
        .filter((s) => s.data && typeof s.data === "object")
        .map((s) => s.data)
    );
  }, [surveyDataJson]);

  /** Scan completo do relatório: todas as seções, subseções e componentes (type + dataPath) */
  const reportInventory = useMemo(() => {
    const sections = surveyDataJson?.sections || [];
    function collectComponents(items, out) {
      if (!Array.isArray(items)) return;
      items.forEach((item) => {
        if (item.type) {
          out.push({
            type: item.type,
            dataPath: item.dataPath || null,
            index: item.index,
          });
        }
        if (item.components && Array.isArray(item.components)) {
          collectComponents(item.components, out);
        }
      });
    }
    return sections.map((section) => {
      const sectionEntry = {
        id: section.id,
        name: section.name || section.id,
        subsections: [],
        questions: null,
      };
      if (section.subsections && Array.isArray(section.subsections)) {
        sectionEntry.subsections = section.subsections.map((sub) => {
          const comps = [];
          if (sub.components) collectComponents(sub.components, comps);
          return {
            id: sub.id,
            name: sub.name || sub.id,
            components: comps,
          };
        });
      } else if (section.components && Array.isArray(section.components)) {
        const comps = [];
        collectComponents(section.components, comps);
        sectionEntry.subsections = [
          { id: "_", name: "(seção)", components: comps },
        ];
      }
      if (section.questions && Array.isArray(section.questions)) {
        sectionEntry.questions = section.questions.map((q) => ({
          question_id: q.question_id || q.id,
          questionType: q.questionType,
          dataKeys:
            q.data && typeof q.data === "object" ? Object.keys(q.data) : [],
        }));
      }
      return sectionEntry;
    });
  }, [surveyDataJson]);

  const extractSectionData = useMemo(() => {
    const sections = surveyDataJson?.sections || [];
    return {
      ids: [...new Set(sections.map((s) => s.id).filter(Boolean))],
      indexes: [
        ...new Set(
          sections
            .map((s) => s.index)
            .filter((v) => v !== undefined && v !== null)
        ),
      ].sort((a, b) => a - b),
      names: [...new Set(sections.map((s) => s.name).filter(Boolean))],
      icons: [...new Set(sections.map((s) => s.icon).filter(Boolean))],
    };
  }, [surveyDataJson]);

  const extractSubsectionData = useMemo(() => {
    const sections = surveyDataJson?.sections || [];
    const allSubsections = [];
    sections.forEach((section) => {
      if (section.subsections && Array.isArray(section.subsections)) {
        allSubsections.push(...section.subsections);
      }
    });
    return {
      ids: [...new Set(allSubsections.map((s) => s.id).filter(Boolean))],
      indexes: [
        ...new Set(
          allSubsections
            .map((s) => s.index)
            .filter((v) => v !== undefined && v !== null)
        ),
      ].sort((a, b) => a - b),
      names: [...new Set(allSubsections.map((s) => s.name).filter(Boolean))],
      icons: [...new Set(allSubsections.map((s) => s.icon).filter(Boolean))],
    };
  }, [surveyDataJson]);

  const extractComponentData = useMemo(() => {
    const sections = surveyDataJson?.sections || [];
    const allComponents = [];
    function collectComponents(items) {
      if (!Array.isArray(items)) return;
      items.forEach((item) => {
        if (item.type) allComponents.push(item);
        if (item.components && Array.isArray(item.components))
          collectComponents(item.components);
      });
    }
    sections.forEach((section) => {
      if (section.components) collectComponents(section.components);
      if (section.subsections) {
        section.subsections.forEach((subsection) => {
          if (subsection.components) collectComponents(subsection.components);
        });
      }
    });
    const types = [
      ...new Set(allComponents.map((c) => c.type).filter(Boolean)),
    ];
    const indexes = [
      ...new Set(
        allComponents
          .map((c) => c.index)
          .filter((v) => v !== undefined && v !== null)
      ),
    ].sort((a, b) => a - b);
    const cardStyleVariants = [
      ...new Set(allComponents.map((c) => c.cardStyleVariant).filter(Boolean)),
    ];
    const cardContentVariantsList = [
      ...new Set(
        allComponents.map((c) => c.cardContentVariant).filter(Boolean)
      ),
    ];
    const useDescription = [
      ...new Set(
        allComponents
          .map((c) => c.useDescription)
          .filter((v) => v !== undefined)
      ),
    ];
    const titles = [
      ...new Set(
        allComponents
          .map((c) => c.title)
          .filter((v) => v !== undefined && v !== null)
      ),
    ];
    const texts = allComponents
      .map((c) => c.text)
      .filter((v) => v !== undefined && v !== null)
      .slice(0, 5);
    const dataPaths = [
      ...new Set(allComponents.map((c) => c.dataPath).filter(Boolean)),
    ];
    const typeCategories = {
      Cards: types.filter((t) =>
        ["card", "npsScoreCard", "topCategoriesCards", "kpiCard"].includes(t)
      ),
      Containers: types.filter((t) =>
        ["container", "grid-container"].includes(t)
      ),
      Charts: types.filter(
        (t) =>
          t.includes("Chart") ||
          t.includes("Plot") ||
          t.includes("Diagram") ||
          t.includes("Graph") ||
          t.includes("Scorecard")
      ),
      Tables: types.filter((t) => t.includes("Table")),
      Headers: types.filter((t) => ["h3", "h4"].includes(t)),
      Widgets: types.filter((t) => ["filterPills", "wordCloud"].includes(t)),
    };
    // Tipos que têm dataPath no JSON atual (usados no relatório)
    const usedDataPathTypes = [
      ...new Set(
        allComponents
          .filter((c) => c.dataPath)
          .map((c) => c.type)
          .filter(Boolean)
      ),
    ];
    const pathsByType = {};
    const componentSpecByType = {};
    allComponents
      .filter((c) => c.dataPath)
      .forEach((c) => {
        if (!pathsByType[c.type]) {
          pathsByType[c.type] = [];
          componentSpecByType[c.type] = c;
        }
        if (!pathsByType[c.type].includes(c.dataPath))
          pathsByType[c.type].push(c.dataPath);
      });
    return {
      types,
      typeCategories,
      indexes,
      cardStyleVariants,
      cardContentVariantsList,
      useDescription,
      titles,
      texts,
      dataPaths,
      usedDataPathTypes,
      pathsByType,
      componentSpecByType,
    };
  }, [surveyDataJson]);

  // Componentes do registry que têm dataPath mas NÃO estão no JSON atual (para seção "other")
  const otherDataPathTypes = useMemo(() => {
    const used = new Set(extractComponentData.usedDataPathTypes || []);
    const registryTypes = Object.keys(componentRegistry);
    return registryTypes.filter((t) => !used.has(t));
  }, [extractComponentData.usedDataPathTypes]);

  // Estado dos filtros da aba Data Path unificada
  // Tipo = categoria (Charts, Cards, Tables, Widgets, Containers, Outros)
  // Nome = tipo do componente (barChart, card, recommendationsTable, ...)
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);

  const extractConfigData = useMemo(() => {
    const sections = surveyDataJson?.sections || [];
    const allConfigs = [];
    function collectConfigs(items) {
      if (!Array.isArray(items)) return;
      items.forEach((item) => {
        if (item.config && typeof item.config === "object")
          allConfigs.push(item.config);
        if (item.components && Array.isArray(item.components))
          collectConfigs(item.components);
      });
    }
    sections.forEach((section) => {
      if (section.components) collectConfigs(section.components);
      if (section.subsections) {
        section.subsections.forEach((subsection) => {
          if (subsection.components) collectConfigs(subsection.components);
        });
      }
    });
    const yAxisDataKeys = [
      ...new Set(allConfigs.map((c) => c.yAxisDataKey).filter(Boolean)),
    ];
    const dataKeys = [
      ...new Set(allConfigs.map((c) => c.dataKey).filter(Boolean)),
    ];
    return {
      yAxisDataKeys,
      dataKeys,
      hasEmptyConfig: allConfigs.some((c) => Object.keys(c).length === 0),
    };
  }, [surveyDataJson]);

  /** Campos de componente enriquecidos com valores dos extract* (aba Campos) */
  const enrichedComponentFields = useMemo(() => {
    return componentFields.map((field) => {
      const f = { ...field };
      if (field.name === "type") {
        f.values = extractComponentData.types.length > 0 ? extractComponentData.types : null;
        f.valuesByCategory = extractComponentData.typeCategories;
      } else if (field.name === "index") {
        f.values = extractComponentData.indexes.length > 0 ? extractComponentData.indexes : null;
      } else if (field.name === "dataPath") {
        f.values = extractComponentData.dataPaths.length > 0 ? extractComponentData.dataPaths : null;
      } else if (field.name === "config") {
        f.configValues = extractConfigData;
      } else if (field.name === "title") {
        f.values = extractComponentData.titles.length > 0 ? extractComponentData.titles.slice(0, 10) : null;
        f.hasMore = extractComponentData.titles.length > 10;
      } else if (field.name === "text") {
        f.values = extractComponentData.texts.length > 0 ? extractComponentData.texts : null;
      } else if (field.name === "cardStyleVariant") {
        f.values = extractComponentData.cardStyleVariants.length > 0 ? extractComponentData.cardStyleVariants : null;
      } else if (field.name === "cardContentVariant") {
        f.values = extractComponentData.cardContentVariantsList.length > 0 ? extractComponentData.cardContentVariantsList : null;
      } else if (field.name === "titleStyleVariant") {
        f.values = null;
      } else if (field.name === "useDescription") {
        f.values = extractComponentData.useDescription.length > 0 ? extractComponentData.useDescription : [false];
      } else if (field.name === "components") {
        f.values = null;
      }
      return f;
    });
  }, [extractComponentData, extractConfigData]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Todos os componentes disponíveis (registry é a fonte única)
  const allComponents = Object.keys(componentRegistry);

  // StyleVariants disponíveis (variants.js é a fonte única)
  const cardStyleVariants = Object.keys(cardVariants);
  const cardContentVariantsList = Object.keys(cardContentVariants);
  const titleStyleVariants = Object.keys(cardTitleVariants);

  // Função para renderizar exemplo de componente com dados customizados
  const renderComponentExampleWithData = (
    componentType,
    exampleConfig = {},
    customData = null
  ) => {
    const dataToUse = customData || realData;
    try {
      const Component = componentRegistry[componentType];
      if (!Component) {
        return (
          <div className="text-sm text-muted-foreground p-4 border rounded">
            Componente não encontrado: {componentType}
          </div>
        );
      }

      const component = {
        type: componentType,
        index: 0,
        ...exampleConfig,
      };

      let enrichedComponent = enrichComponentWithStyles(component);

      if (enrichedComponent && typeof enrichedComponent === "object") {
        const cleanedComponent = { ...enrichedComponent };
        Object.keys(cleanedComponent).forEach((key) => {
          if (
            cleanedComponent[key] &&
            typeof cleanedComponent[key] === "object" &&
            !Array.isArray(cleanedComponent[key]) &&
            Object.keys(cleanedComponent[key]).length === 0
          ) {
            if (key !== "config") {
              delete cleanedComponent[key];
            }
          }
        });
        enrichedComponent = cleanedComponent;
      }

      const rendered = renderComponent(enrichedComponent, dataToUse, {});

      if (rendered === null || rendered === undefined) {
        return null;
      }

      if (React.isValidElement(rendered)) {
        return rendered;
      }

      console.warn(
        `Componente ${componentType} retornou valor inválido:`,
        rendered,
        "Tipo:",
        typeof rendered
      );
      return null;
    } catch (error) {
      console.error("Erro ao renderizar componente:", error);
      return (
        <div className="text-sm text-muted-foreground p-4 border rounded">
          Erro ao renderizar: {error.message}
        </div>
      );
    }
  };

  // Função para renderizar exemplo de componente
  const renderComponentExample = (componentType, exampleConfig = {}) => {
    try {
      // Containers são tratados de forma especial
      if (componentType === "container" || componentType === "grid-container") {
        const component = {
          type: componentType,
          index: 0,
          ...exampleConfig,
        };

        if (componentType === "container") {
          const nested = (component.components || [])
            .map((comp, idx) => {
              try {
                const nestedComponent = enrichComponentWithStyles(comp);
                const NestedComponent = componentRegistry[comp.type];
                if (NestedComponent) {
                  const rendered = renderComponent(
                    nestedComponent,
                    realData,
                    {}
                  );
                  // Verifica se é um elemento React válido
                  if (rendered === null || rendered === undefined) {
                    return null;
                  }
                  if (React.isValidElement(rendered)) {
                    return <div key={idx}>{rendered}</div>;
                  }
                  // Se não for válido, loga e retorna null
                  console.warn(
                    `Componente aninhado ${comp.type} retornou valor inválido:`,
                    rendered,
                    typeof rendered
                  );
                  return null;
                }
              } catch (err) {
                console.error(
                  `Erro ao renderizar componente aninhado ${comp.type}:`,
                  err
                );
              }
              return null;
            })
            .filter((item) => {
              // Remove null, undefined, e objetos inválidos
              if (item === null || item === undefined) return false;
              if (React.isValidElement(item)) return true;
              // Se for um objeto que não é um elemento React válido, remove
              if (typeof item === "object" && !React.isValidElement(item)) {
                console.warn(
                  "Removendo objeto inválido do array nested:",
                  item
                );
                return false;
              }
              // Valores primitivos válidos (string, number, boolean)
              return typeof item !== "object";
            });

          return <div className="grid gap-6 md:grid-cols-2">{nested}</div>;
        }

        if (componentType === "grid-container") {
          const className = component.className || "grid gap-6 md:grid-cols-2";
          const nested = (component.components || [])
            .map((comp, idx) => {
              try {
                const nestedComponent = enrichComponentWithStyles(comp);
                const NestedComponent = componentRegistry[comp.type];
                if (NestedComponent) {
                  const rendered = renderComponent(
                    nestedComponent,
                    realData,
                    {}
                  );
                  // Verifica se é um elemento React válido
                  if (rendered === null || rendered === undefined) {
                    return null;
                  }
                  if (React.isValidElement(rendered)) {
                    return <div key={idx}>{rendered}</div>;
                  }
                  // Se não for válido, loga e retorna null
                  console.warn(
                    `Componente aninhado ${comp.type} retornou valor inválido:`,
                    rendered,
                    typeof rendered
                  );
                  return null;
                }
              } catch (err) {
                console.error(
                  `Erro ao renderizar componente aninhado ${comp.type}:`,
                  err
                );
              }
              return null;
            })
            .filter((item) => {
              // Remove null, undefined, e objetos inválidos
              if (item === null || item === undefined) return false;
              if (React.isValidElement(item)) return true;
              // Se for um objeto que não é um elemento React válido, remove
              if (typeof item === "object" && !React.isValidElement(item)) {
                console.warn(
                  "Removendo objeto inválido do array nested:",
                  item
                );
                return false;
              }
              // Valores primitivos válidos (string, number, boolean)
              return typeof item !== "object";
            });

          return <div className={className}>{nested}</div>;
        }
      }

      const Component = componentRegistry[componentType];
      if (!Component) {
        return (
          <div className="text-sm text-muted-foreground p-4 border rounded">
            Componente não encontrado: {componentType}
          </div>
        );
      }

      const component = {
        type: componentType,
        index: 0,
        ...exampleConfig,
      };

      let enrichedComponent = enrichComponentWithStyles(component);

      // Validação adicional: garante que enrichedComponent não tenha valores problemáticos
      if (enrichedComponent && typeof enrichedComponent === "object") {
        // Remove qualquer propriedade que seja um objeto vazio que possa causar problemas
        const cleanedComponent = { ...enrichedComponent };
        Object.keys(cleanedComponent).forEach((key) => {
          if (
            cleanedComponent[key] &&
            typeof cleanedComponent[key] === "object" &&
            !Array.isArray(cleanedComponent[key]) &&
            Object.keys(cleanedComponent[key]).length === 0
          ) {
            // Mantém objetos vazios em config, mas garante que não sejam undefined
            if (key !== "config") {
              delete cleanedComponent[key];
            }
          }
        });
        enrichedComponent = cleanedComponent;
      }

      const rendered = renderComponent(enrichedComponent, realData, {});

      // Verifica se é um elemento React válido
      if (rendered === null || rendered === undefined) {
        return null;
      }

      if (React.isValidElement(rendered)) {
        return rendered;
      }

      // Se não for um elemento React válido, loga e retorna null
      console.warn(
        `Componente ${componentType} retornou valor inválido:`,
        rendered,
        "Tipo:",
        typeof rendered
      );
      return null;
    } catch (error) {
      console.error("Erro ao renderizar componente:", error);
      return (
        <div className="text-sm text-muted-foreground p-4 border rounded">
          Erro ao renderizar: {error.message}
        </div>
      );
    }
  };

  // Exemplos de configuração para cada tipo de componente
  const componentExamples = {
    card: {
      type: "card",
      index: 0,
      title: "Exemplo de Card",
      text: "Este é um exemplo de card renderizado.\nCom suporte a múltiplas linhas.",
      cardStyleVariant: "default",
    },
    barChart: {
      type: "barChart",
      index: 0,
      dataPath: "sectionData.data",
      config: {
        dataKey: "percentage",
        yAxisDataKey: "label",
      },
    },
    sentimentDivergentChart: {
      type: "sentimentDivergentChart",
      index: 0,
      dataPath: "sectionData.sentiment",
      config: {
        yAxisDataKey: "segment",
      },
    },
    distributionTable: {
      type: "distributionTable",
      index: 0,
      dataPath: "sectionData.distribution",
    },
    sentimentTable: {
      type: "sentimentTable",
      index: 0,
      dataPath: "sectionData.sentiment",
    },
    container: {
      type: "container",
      index: 0,
      components: [
        {
          type: "card",
          index: 0,
          title: "Card 1",
          text: "Primeiro card no container",
          cardStyleVariant: "default",
        },
        {
          type: "card",
          index: 1,
          title: "Card 2",
          text: "Segundo card no container",
          cardStyleVariant: "default",
        },
      ],
    },
  };

  /** Exemplos de estrutura JSON para componentes no registry que não estão no JSON atual */
  const getOtherComponentExample = (type) => {
    const raw = otherComponentExampleData[type];
    if (raw)
      return JSON.stringify(
        { component: raw.component, data: raw.data },
        null,
        2
      );
    return JSON.stringify(
      {
        component: {
          type,
          index: 0,
          dataPath: `sectionData.${type}`,
          config: {},
        },
        data: {
          sectionData: { [type]: "array ou objeto conforme o componente" },
        },
      },
      null,
      2
    );
  };

  // Mapa: tipo do componente → categoria (Tipo no filtro = chart, card, table, ...)
  const getCategoryForComponentType = (componentType) => {
    for (const [cat, types] of Object.entries(componentCategories)) {
      if (types.includes(componentType)) return cat;
    }
    return "Outros";
  };

  // Lista unificada para aba Data Path (used + other): um único modelo por tipo de componente
  const unifiedList = useMemo(() => {
    const items = [];
    const seenTypes = new Set();
    const { pathsByType = {}, componentSpecByType = {} } = extractComponentData;
    // Used: um item por tipo de componente (primeiro dataPath como modelo)
    // Sempre que existir mock em otherComponentExampleData, usar para exibir JSON completo (cabeçalho + section data)
    Object.keys(pathsByType || {}).forEach((componentType) => {
      const paths = pathsByType[componentType] || [];
      const dataPath = paths[0] || "—";
      const spec = componentSpecByType[componentType];
      const category = getCategoryForComponentType(componentType);
      const exampleData = otherComponentExampleData[componentType];
      const hasMock = exampleData?.data?.sectionData != null;
      const component = hasMock
        ? { ...exampleData.component, dataPath: exampleData.component.dataPath }
        : spec
          ? { ...spec, dataPath }
          : { type: componentType, index: 0, dataPath };
      const dataForRender = hasMock
        ? { ...realData, sectionData: { ...mergedSectionData, ...exampleData.data.sectionData } }
        : { ...realData, sectionData: { ...mergedSectionData } };
      items.push({
        type: componentType,
        category,
        dataPath,
        origin: "used",
        component,
        dataForRender,
        exampleStr: hasMock && exampleData
          ? JSON.stringify(
              { component: exampleData.component, data: exampleData.data },
              null,
              2
            )
          : JSON.stringify(
              { component, data: { sectionData: "(dados da seção/subseção)" } },
              null,
              2
            ),
      });
      seenTypes.add(componentType);
    });
    // Other: excluir apenas tipos que não são Chart/Table/Card (ex.: Widgets sem modelo dataPath simples)
    // Assim todos os Charts, Tables e Cards do registry aparecem na aba Data Path (used ou other).
    const otherFilterExclude = new Set(["accordion", "questionsList"]);
    otherDataPathTypes.forEach((componentType) => {
      if (otherFilterExclude.has(componentType) || seenTypes.has(componentType)) return;
      seenTypes.add(componentType);
      const exampleData = otherComponentExampleData[componentType];
      const dataPath = exampleData?.component?.dataPath || `sectionData.${componentType}`;
      const category = getCategoryForComponentType(componentType);
      const dataForRender = exampleData?.data?.sectionData != null
        ? { ...realData, sectionData: { ...mergedSectionData, ...exampleData.data.sectionData } }
        : realData;
      items.push({
        type: componentType,
        category,
        dataPath,
        origin: "other",
        component: exampleData?.component || { type: componentType, index: 0, dataPath, config: {} },
        dataForRender,
        exampleStr: getOtherComponentExample(componentType),
      });
    });
    return items;
  }, [extractComponentData, otherDataPathTypes, otherComponentExampleData, realData, mergedSectionData]);

  // Opções do dropdown Tipo (categorias: Charts, Cards, Tables, ...) presentes na lista
  const categoriesForDropdown = useMemo(() => {
    const order = ["Charts", "Cards", "Tables", "Widgets", "Containers", "Outros"];
    const present = [...new Set(unifiedList.map((i) => i.category))];
    return order.filter((c) => present.includes(c));
  }, [unifiedList]);

  // Opções do dropdown Nome (nomes dos componentes: barChart, card, ...); filtradas por categorias selecionadas
  const namesForDropdown = useMemo(() => {
    if (selectedCategories.length === 0) {
      return [...new Set(unifiedList.map((i) => i.type))].sort();
    }
    const catSet = new Set(selectedCategories);
    return [...new Set(unifiedList.filter((i) => catSet.has(i.category)).map((i) => i.type))].sort();
  }, [unifiedList, selectedCategories]);

  // Sincronizar selectedNames ao desmarcar categoria
  useEffect(() => {
    if (selectedCategories.length === 0) return;
    const validNames = new Set(
      unifiedList.filter((i) => selectedCategories.includes(i.category)).map((i) => i.type)
    );
    setSelectedNames((prev) => prev.filter((n) => validNames.has(n)));
  }, [selectedCategories, unifiedList]);

  // Lista filtrada: por Tipo (categoria) e por Nome (tipo do componente)
  const filteredList = useMemo(() => {
    let list = unifiedList;
    if (selectedCategories.length > 0) {
      const catSet = new Set(selectedCategories);
      list = list.filter((i) => catSet.has(i.category));
    }
    if (selectedNames.length > 0) {
      const nameSet = new Set(selectedNames);
      list = list.filter((i) => nameSet.has(i.type));
    }
    return list;
  }, [unifiedList, selectedCategories, selectedNames]);

  const clearDataPathFilters = () => {
    setSelectedCategories([]);
    setSelectedNames([]);
  };

  // Mostra loading enquanto os dados não carregam (sempre depois de todos os hooks)
  if (loading || !surveyDataJson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">
            Carregando referência...
          </p>
        </div>
      </div>
    );
  }

  // Error Boundary wrapper para capturar erros de renderização
  const SafeRender = ({ children }) => {
    try {
      // Garante que children não contém objetos inválidos
      const safeChildren = React.Children.toArray(children).map(
        (child, index) => {
          if (child === null || child === undefined) {
            return null;
          }
          if (React.isValidElement(child)) {
            return child;
          }
          // Se for um objeto JavaScript que não é um elemento React válido
          if (typeof child === "object" && !React.isValidElement(child)) {
            console.warn(
              `SafeRender: Tentando renderizar objeto inválido no índice ${index}:`,
              child,
              "Tipo:",
              typeof child
            );
            return null;
          }
          // Se for um valor primitivo válido (string, number, boolean)
          if (typeof child !== "object") {
            return child;
          }
          // Se chegou aqui, é um objeto inválido
          console.warn(`SafeRender: Valor inválido no índice ${index}:`, child);
          return null;
        }
      );
      return <>{safeChildren}</>;
    } catch (error) {
      console.error("Erro ao renderizar:", error);
      return (
        <div className="text-sm text-red-500 p-4 border border-red-500 rounded">
          Erro ao renderizar: {error.message}
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-3xl">JSON Schema Reference</CardTitle>
              <CardDescription className="text-base mt-2">
                Referência completa de todos os campos, estruturas e componentes
                disponíveis no JSON. Baseado em:{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  {dataSourceLabel ?? "—"}
                </code>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <SafeRender>
        <Tabs defaultValue="datapath" className="space-y-4">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="datapath">
              <Code className="w-4 h-4 mr-2" />
              Data Path
            </TabsTrigger>
            <TabsTrigger value="inventario">
              <List className="w-4 h-4 mr-2" />
              Inventário
            </TabsTrigger>
            <TabsTrigger value="structure">
              <Code className="w-4 h-4 mr-2" />
              Estrutura
            </TabsTrigger>
            <TabsTrigger value="fields">
              <Code className="w-4 h-4 mr-2" />
              Campos
            </TabsTrigger>
            <TabsTrigger value="tables">
              <TableIcon className="w-4 h-4 mr-2" />
              Tabelas
            </TabsTrigger>
            <TabsTrigger value="components">
              <Layout className="w-4 h-4 mr-2" />
              Componentes
            </TabsTrigger>
            <TabsTrigger value="cards">
              <Palette className="w-4 h-4 mr-2" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="variants">
              <Palette className="w-4 h-4 mr-2" />
              Variantes
            </TabsTrigger>
          </TabsList>

          {/* ESTRUTURA BÁSICA */}
          <TabsContent value="structure" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estrutura Básica do JSON</CardTitle>
                <CardDescription>
                  Estrutura principal que todo JSON deve seguir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <pre className="text-sm overflow-x-auto">
                      <code>{JSON.stringify(basicStructure, null, 2)}</code>
                    </pre>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">
                      Campos Principais:
                    </h3>

                    <div className="space-y-2">
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Badge variant="outline" className="mt-1">
                          metadata
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">Metadados da Pesquisa</p>
                          <p className="text-sm text-muted-foreground">
                            Informações sobre versão, idioma e ID da pesquisa
                          </p>
                          <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
                            <li>
                              <code>version</code>: Versão do schema (ex: "1.0")
                            </li>
                            <li>
                              <code>language</code>: Idioma (ex: "pt-BR")
                            </li>
                            <li>
                              <code>surveyId</code>: ID único da pesquisa
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Badge variant="outline" className="mt-1">
                          sections
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">Array de Seções</p>
                          <p className="text-sm text-muted-foreground">
                            Cada seção representa uma parte do relatório
                          </p>
                          <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
                            <li>
                              <code>id</code>: Identificador único (string)
                            </li>
                            <li>
                              <code>index</code>: Ordem de exibição (number)
                            </li>
                            <li>
                              <code>name</code>: Nome exibido (string)
                            </li>
                            <li>
                              <code>icon</code>: Nome do ícone (string)
                            </li>
                            <li>
                              <code>subsections</code>: Array de subseções
                              (opcional)
                            </li>
                            <li>
                              <code>components</code>: Array de componentes
                              (opcional, usado quando não há subsections)
                            </li>
                            <li>
                              <code>questions</code>: Array de questões (apenas
                              na seção "responses")
                            </li>
                            <li>
                              <code>data</code>: Dados específicos da seção
                              (opcional)
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Badge variant="outline" className="mt-1">
                          subsections
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">Subseções</p>
                          <p className="text-sm text-muted-foreground">
                            Divisões dentro de uma seção
                          </p>
                          <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
                            <li>
                              <code>id</code>: Identificador único (string)
                            </li>
                            <li>
                              <code>index</code>: Ordem de exibição (number)
                            </li>
                            <li>
                              <code>name</code>: Nome exibido (string)
                            </li>
                            <li>
                              <code>icon</code>: Nome do ícone (string)
                            </li>
                            <li>
                              <code>components</code>: Array de componentes a
                              renderizar
                            </li>
                            <li>
                              <code>data</code>: Dados específicos da subseção
                              (opcional)
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Badge variant="outline" className="mt-1">
                          data
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">Dados da Seção/Subseção</p>
                          <p className="text-sm text-muted-foreground">
                            Objeto contendo os dados específicos usados pelos
                            componentes através do <code>dataPath</code>
                          </p>
                          <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
                            <li>
                              <code>data</code>: Disponível em seções e
                              subseções (opcional)
                            </li>
                            <li>
                              Estrutura varia conforme a seção e os componentes
                              que a utilizam
                            </li>
                            <li>
                              Componentes acessam os dados através do campo{" "}
                              <code>dataPath</code> (ex:{" "}
                              <code>"sectionData.barChart"</code>)
                            </li>
                            <li>
                              <code>sectionData</code> pode vir de{" "}
                              <code>section.data</code> e/ou de{" "}
                              <code>subsection.data</code>; a resolução procura
                              sempre primeiro em <code>sectionData</code>
                            </li>
                            <li>
                              Para seção "responses": contém <code>config</code>{" "}
                              com configurações de categorias NPS
                            </li>
                            <li>
                              Outras seções: contêm dados específicos (ex:{" "}
                              <code>distribution</code>,{" "}
                              <code>recommendationsTable</code>, etc.)
                            </li>
                            <li>
                              <strong>Nota:</strong> O campo{" "}
                              <code>questions</code> está no nível da seção
                              "responses", não dentro de <code>data</code>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Badge variant="outline" className="mt-1">
                          components
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">Componentes</p>
                          <p className="text-sm text-muted-foreground">
                            Elementos renderizáveis (cards, gráficos, tabelas,
                            etc.)
                          </p>
                          <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
                            <li>
                              <code>type</code>: Tipo do componente
                              (obrigatório)
                            </li>
                            <li>
                              <code>index</code>: Ordem de renderização (number)
                            </li>
                            <li>
                              <code>dataPath</code>: Caminho para os dados
                              (string)
                            </li>
                            <li>
                              <code>config</code>: Configurações específicas
                              (object)
                            </li>
                            <li>
                              <code>components</code>: Componentes aninhados
                              (array, opcional)
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Badge variant="outline" className="mt-1">
                          questions
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">
                            Questões (apenas seção "responses")
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Array de questões disponível apenas na seção
                            "responses"
                          </p>
                          <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
                            <li>
                              <code>id</code>: Identificador único da questão
                              (number)
                            </li>
                            <li>
                              <code>index</code>: Ordem de exibição (number)
                            </li>
                            <li>
                              <code>questionType</code>: Tipo da questão ("nps",
                              "multiple-choice", "single-choice", "open-ended")
                            </li>
                            <li>
                              <code>question</code>: Texto da questão (string)
                            </li>
                            <li>
                              <code>summary</code>: Resumo/análise da questão
                              (string)
                            </li>
                            <li>
                              <code>data</code>: Dados específicos da questão
                              (object)
                            </li>
                          </ul>
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            Nota: Os componentes são gerados automaticamente
                            baseados no questionType, não há campo "components"
                            nas questões.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Badge variant="outline" className="mt-1">
                          uiTexts
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">Textos Traduzíveis</p>
                          <p className="text-sm text-muted-foreground">
                            Objeto contendo textos traduzíveis da interface
                          </p>
                          <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
                            <li>
                              <code>filterPanel</code>: Textos do painel de
                              filtros (object)
                            </li>
                            <li>
                              <code>export</code>: Textos relacionados à
                              exportação (object)
                            </li>
                            <li>
                              <code>common</code>: Textos comuns (loading,
                              errors, etc.) (object)
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Badge variant="outline" className="mt-1">
                          surveyInfo
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">Informações da Pesquisa</p>
                          <p className="text-sm text-muted-foreground">
                            Metadados gerais sobre a pesquisa
                          </p>
                          <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
                            <li>
                              <code>title</code>: Título da pesquisa (string)
                            </li>
                            <li>
                              <code>company</code>: Nome da empresa (string)
                            </li>
                            <li>
                              <code>period</code>: Período da pesquisa (string)
                            </li>
                            <li>
                              <code>totalRespondents</code>: Total de
                              respondentes (number)
                            </li>
                            <li>
                              <code>responseRate</code>: Taxa de resposta
                              (number)
                            </li>
                            <li>
                              <code>questions</code>: Número total de questões
                              (number)
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CAMPOS */}
          <TabsContent value="fields" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campos e Propriedades</CardTitle>
                <CardDescription>
                  Referência dos campos que o código aceita (metadata, sections, components, questions, uiTexts, surveyInfo).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Campos de metadata */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Campos de metadata (raiz)</h3>
                    <div className="space-y-2">
                      {metadataFields.map((field) => (
                        <div key={field.name} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="flex flex-col gap-1 min-w-[120px]">
                            <code className="text-sm font-mono font-semibold">{field.name}</code>
                            <Badge variant="destructive" className="text-xs w-fit">Obrigatório</Badge>
                          </div>
                          <div className="flex-1">
                            <Badge variant="secondary" className="text-xs">{field.type}</Badge>
                            <p className="text-sm text-muted-foreground mt-1">{field.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Campos de Componente */}
                    <div className="space-y-3">
                    <h3 className="font-semibold text-lg">
                      Campos Comuns de Componentes
                    </h3>
                    <div className="space-y-2">
                      {enrichedComponentFields.map((field) => (
                        <div
                          key={field.name}
                          className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="flex flex-col gap-1 min-w-[120px]">
                            <code className="text-sm font-mono font-semibold">
                              {field.name}
                            </code>
                            {field.required && (
                              <Badge
                                variant="destructive"
                                className="text-xs w-fit"
                              >
                                Obrigatório
                              </Badge>
                            )}
                            {!field.required && (
                              <Badge
                                variant="outline"
                                className="text-xs w-fit"
                              >
                                Opcional
                              </Badge>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {field.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {field.desc}
                            </p>

                            {/* Valores encontrados no JSON */}
                            {field.values && field.values.length > 0 && (
                              <div className="mt-2 p-2 bg-background rounded border">
                                <p className="text-xs font-semibold mb-1 text-muted-foreground">
                                  Valores encontrados no JSON:
                                </p>
                                {field.valuesByCategory ? (
                                  <div className="space-y-2">
                                    {Object.entries(field.valuesByCategory).map(
                                      ([category, types]) =>
                                        types.length > 0 && (
                                          <div key={category}>
                                            <Badge
                                              variant="secondary"
                                              className="text-xs mb-1"
                                            >
                                              {category}:
                                            </Badge>
                                            <div className="flex flex-wrap gap-1 ml-2">
                                              {types.map((val) => (
                                                <Badge
                                                  key={val}
                                                  variant="outline"
                                                  className="text-xs"
                                                >
                                                  {val}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {field.values.map((val, idx) =>
                                      typeof val === "string" &&
                                      val.length > 50 ? (
                                        <div
                                          key={idx}
                                          className="text-xs text-muted-foreground truncate max-w-[200px]"
                                          title={val}
                                        >
                                          "{val.substring(0, 50)}..."
                                        </div>
                                      ) : typeof val === "string" &&
                                        val === "" ? (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          (string vazia)
                                        </Badge>
                                      ) : typeof val === "string" ? (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          "{val}"
                                        </Badge>
                                      ) : (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {String(val)}
                                        </Badge>
                                      )
                                    )}
                                    {field.hasMore && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        ... e mais{" "}
                                        {extractComponentData.titles.length -
                                          10}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Valores de config */}
                            {field.configValues && (
                              <div className="mt-2 p-2 bg-background rounded border">
                                <p className="text-xs font-semibold mb-1 text-muted-foreground">
                                  Campos de config encontrados:
                                </p>
                                <div className="space-y-1">
                                  {field.configValues.yAxisDataKeys.length >
                                    0 && (
                                    <div>
                                      <span className="text-xs font-medium">
                                        yAxisDataKey:{" "}
                                      </span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {field.configValues.yAxisDataKeys.map(
                                          (key) => (
                                            <Badge
                                              key={key}
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {key}
                                            </Badge>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {field.configValues.dataKeys.length > 0 && (
                                    <div>
                                      <span className="text-xs font-medium">
                                        dataKey:{" "}
                                      </span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {field.configValues.dataKeys.map(
                                          (key) => (
                                            <Badge
                                              key={key}
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {key}
                                            </Badge>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {field.configValues.hasEmptyConfig && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      config: {"{}"} (objeto vazio)
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Campos de Seção */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Campos de Seção</h3>
                    <div className="space-y-2">
                      {sectionFields.map((field) => ({
                        ...field,
                        values: field.valuesKey ? extractSectionData[field.valuesKey] : null,
                      })).map((field) => (
                        <div
                          key={field.name}
                          className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="flex flex-col gap-1 min-w-[120px]">
                            <code className="text-sm font-mono font-semibold">
                              {field.name}
                            </code>
                            {field.required && (
                              <Badge
                                variant="destructive"
                                className="text-xs w-fit"
                              >
                                Obrigatório
                              </Badge>
                            )}
                            {!field.required && (
                              <Badge
                                variant="outline"
                                className="text-xs w-fit"
                              >
                                Opcional
                              </Badge>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {field.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {field.desc}
                            </p>

                            {/* Valores encontrados no JSON */}
                            {field.values && field.values.length > 0 && (
                              <div className="mt-2 p-2 bg-background rounded border">
                                <p className="text-xs font-semibold mb-1 text-muted-foreground">
                                  Valores encontrados no JSON:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {field.values.map((val, idx) =>
                                    typeof val === "string" &&
                                    val.length > 30 ? (
                                      <div
                                        key={idx}
                                        className="text-xs text-muted-foreground"
                                        title={val}
                                      >
                                        "{val.substring(0, 30)}..."
                                      </div>
                                    ) : typeof val === "string" ? (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        "{val}"
                                      </Badge>
                                    ) : (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {String(val)}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Campos de Subseção */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">
                      Campos de Subseção
                    </h3>
                    <div className="space-y-2">
                      {subsectionFields.map((field) => ({
                        ...field,
                        values: field.valuesKey ? extractSubsectionData[field.valuesKey] : null,
                      })).map((field) => (
                        <div
                          key={field.name}
                          className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="flex flex-col gap-1 min-w-[120px]">
                            <code className="text-sm font-mono font-semibold">
                              {field.name}
                            </code>
                            {field.required && (
                              <Badge
                                variant="destructive"
                                className="text-xs w-fit"
                              >
                                Obrigatório
                              </Badge>
                            )}
                            {!field.required && (
                              <Badge
                                variant="outline"
                                className="text-xs w-fit"
                              >
                                Opcional
                              </Badge>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {field.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {field.desc}
                            </p>

                            {/* Valores encontrados no JSON */}
                            {field.values && field.values.length > 0 && (
                              <div className="mt-2 p-2 bg-background rounded border">
                                <p className="text-xs font-semibold mb-1 text-muted-foreground">
                                  Valores encontrados no JSON:
                                </p>
                                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                                  {field.values.map((val, idx) =>
                                    typeof val === "string" &&
                                    val.length > 30 ? (
                                      <div
                                        key={idx}
                                        className="text-xs text-muted-foreground"
                                        title={val}
                                      >
                                        "{val.substring(0, 30)}..."
                                      </div>
                                    ) : typeof val === "string" ? (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        "{val}"
                                      </Badge>
                                    ) : (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {String(val)}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Campos de Questão (seção responses) */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Campos de Questão (section.questions[])</h3>
                    <p className="text-sm text-muted-foreground">
                      Tipos aceitos: <code className="bg-muted px-1 rounded text-xs">{getSupportedQuestionTypes().join(", ")}</code> (definidos em <code className="bg-muted px-1 rounded text-xs">questionTemplates.js</code>).
                    </p>
                    <div className="space-y-2">
                      {questionFields.map((field) => (
                        <div key={field.name} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="flex flex-col gap-1 min-w-[120px]">
                            <code className="text-sm font-mono font-semibold">{field.name}</code>
                            <Badge variant={field.required ? "destructive" : "outline"} className="text-xs w-fit">
                              {field.required ? "Obrigatório" : "Opcional"}
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <Badge variant="secondary" className="text-xs">{field.type}</Badge>
                            <p className="text-sm text-muted-foreground mt-1">{field.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Campos de surveyInfo e uiTexts */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">surveyInfo e uiTexts (raiz)</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <code className="text-sm font-mono font-semibold">surveyInfo</code>
                        <Badge variant="outline" className="text-xs ml-2">object</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          title, company, period, totalRespondents, responseRate, questions, nps, npsCategory. Usado em cabeçalhos e export.
                        </p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <code className="text-sm font-mono font-semibold">uiTexts</code>
                        <Badge variant="outline" className="text-xs ml-2">object</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          Textos da interface: filterPanel, export, common, responseDetails, attributeDeepDive, etc. Resolvidos via <code className="bg-muted px-0.5 rounded text-xs">uiTexts.*</code> no dataResolver.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TABELAS DE VALORES */}
          <TabsContent value="tables" className="space-y-6">
            {/* Tipos aceitos pelo código */}
            <Card>
              <CardHeader>
                <CardTitle>Tipos de componente aceitos pelo código (registry)</CardTitle>
                <CardDescription>
                  Lista canônica do <code className="bg-muted px-1 rounded text-xs">ComponentRegistry</code>. O JSON pode usar qualquer um destes tipos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Tipos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(componentCategories).map(([cat, types]) => (
                        <TableRow key={cat}>
                          <TableCell><Badge variant="secondary">{cat}</Badge></TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {types.map((t) => (
                                <code key={t} className="bg-muted px-1.5 py-0.5 rounded text-xs">{t}</code>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tipos de questão aceitos (questionTemplates)</CardTitle>
                <CardDescription>
                  <code className="bg-muted px-1 rounded text-xs">questionType</code> em <code className="bg-muted px-1 rounded text-xs">section.questions[]</code> deve ser um destes valores.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>questionType</TableHead>
                        <TableHead>Componentes do template</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getSupportedQuestionTypes().map((qt) => {
                        const template = questionTypeTemplates[qt] || [];
                        const comps = template.map((c) => c.type).join(", ");
                        return (
                          <TableRow key={qt}>
                            <TableCell><code className="bg-muted px-1.5 py-0.5 rounded text-xs">{qt}</code></TableCell>
                            <TableCell className="text-sm text-muted-foreground">{comps || "—"}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Campos de Seção */}
            <Card>
              <CardHeader>
                <CardTitle>Campos de Seção - Valores no JSON</CardTitle>
                <CardDescription>
                  Valores únicos encontrados no JSON carregado para campos de seção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campo</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valores Únicos Encontrados</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <code>id</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">string</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {extractSectionData.ids.map((id) => (
                              <Badge key={id} variant="outline">
                                {id}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>index</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">number</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {extractSectionData.indexes.map((idx) => (
                              <Badge key={idx} variant="outline">
                                {idx}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>name</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">string</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {extractSectionData.names.map((name) => (
                              <div key={name}>"{name}"</div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>icon</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">string</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {extractSectionData.icons.map((icon) => (
                              <Badge key={icon} variant="outline">
                                {icon}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Campos de Subseção */}
            <Card>
              <CardHeader>
                <CardTitle>Campos de Subseção - Valores no JSON</CardTitle>
                <CardDescription>
                  Valores únicos encontrados no JSON carregado para campos de subseção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campo</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valores Únicos Encontrados</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <code>id</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">string</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                            {extractSubsectionData.ids.map((id) => (
                              <div key={id}>{id}</div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>index</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">number</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {extractSubsectionData.indexes.map((idx) => (
                              <Badge key={idx} variant="outline">
                                {idx}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>name</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">string</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                            {extractSubsectionData.names.map((name) => (
                              <div key={name}>"{name}"</div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>icon</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">string</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {extractSubsectionData.icons.map((icon) => (
                              <Badge key={icon} variant="outline">
                                {icon}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Campos de Componente */}
            <Card>
              <CardHeader>
                <CardTitle>Campos de Componente - Valores no JSON</CardTitle>
                <CardDescription>
                  Valores únicos encontrados no JSON carregado para campos de componentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campo</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valores Únicos Encontrados</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <code>type</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            string (obrigatório)
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            {Object.entries(
                              extractComponentData.typeCategories
                            ).map(
                              ([category, types]) =>
                                types.length > 0 && (
                                  <div key={category}>
                                    <Badge variant="secondary" className="mb-1">
                                      {category}:
                                    </Badge>
                                    <div className="flex flex-wrap gap-1">
                                      {types.map((type) => (
                                        <Badge key={type} variant="outline">
                                          {type}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>index</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">number</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {extractComponentData.indexes.map((idx) => (
                              <Badge key={idx} variant="outline">
                                {idx}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>cardStyleVariant</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">string</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {extractComponentData.cardStyleVariants.map(
                              (variant) => (
                                <Badge key={variant} variant="outline">
                                  {variant}
                                </Badge>
                              )
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>cardContentVariant</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">string</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {extractComponentData.cardContentVariantsList.map(
                              (variant) => (
                                <Badge key={variant} variant="outline">
                                  {variant}
                                </Badge>
                              )
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>useDescription</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">boolean</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {extractComponentData.useDescription.map((val) => (
                              <Badge key={String(val)} variant="outline">
                                {String(val)}
                              </Badge>
                            ))}
                            {extractComponentData.useDescription.length ===
                              0 && (
                              <Badge variant="outline">
                                false (padrão quando omitido)
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>title</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">string</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                            {extractComponentData.titles.length > 0 ? (
                              extractComponentData.titles.map((title, idx) => (
                                <div key={idx}>
                                  "{title === "" ? "(string vazia)" : title}"
                                </div>
                              ))
                            ) : (
                              <div className="text-muted-foreground">
                                Nenhum título encontrado
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>text</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">string</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                            {extractComponentData.texts.length > 0 ? (
                              extractComponentData.texts.map((text, idx) => (
                                <div key={idx} className="truncate">
                                  {text === ""
                                    ? '"" (string vazia)'
                                    : `"${text.substring(0, 50)}${
                                        text.length > 50 ? "..." : ""
                                      }"`}
                                </div>
                              ))
                            ) : (
                              <div className="text-muted-foreground">
                                Nenhum texto encontrado
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>dataPath</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">string</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                            {extractComponentData.dataPaths.map((path, idx) => (
                              <div key={idx}>
                                <code>{path}</code>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Config */}
            <Card>
              <CardHeader>
                <CardTitle>Campos de Config - Valores no JSON</CardTitle>
                <CardDescription>
                  Configurações específicas encontradas em componentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campo de Config</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valores Encontrados</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <code>yAxisDataKey</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">string</Badge>
                        </TableCell>
                        <TableCell>
                          {extractConfigData.yAxisDataKeys.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {extractConfigData.yAxisDataKeys.map((key) => (
                                <Badge key={key} variant="outline">
                                  {key}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Nenhum valor encontrado
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>dataKey</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">string</Badge>
                        </TableCell>
                        <TableCell>
                          {extractConfigData.dataKeys.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {extractConfigData.dataKeys.map((key) => (
                                <Badge key={key} variant="outline">
                                  {key}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Nenhum valor encontrado
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                      {extractConfigData.hasEmptyConfig && (
                        <TableRow>
                          <TableCell>
                            <code>config: {"{}"}</code>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">object</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              Objeto vazio (configurações padrão)
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DATA PATH - Unificado (used + other) com filtros */}
          <TabsContent value="datapath" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Path</CardTitle>
                <CardDescription>
                  Componentes e dataPaths usados no JSON e disponíveis no registry.
                  Filtre por tipo e nome.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Filtros: Tipo e Nome com pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9">
                          Tipo {selectedCategories.length > 0 ? `(${selectedCategories.length})` : ""}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 max-h-80 overflow-y-auto" align="start">
                        <div className="space-y-2">
                          {categoriesForDropdown.map((cat) => (
                            <label
                              key={cat}
                              className="flex items-center gap-2 cursor-pointer text-sm"
                            >
                              <Checkbox
                                checked={selectedCategories.includes(cat)}
                                onCheckedChange={(checked) => {
                                  setSelectedCategories((prev) =>
                                    checked ? [...prev, cat] : prev.filter((c) => c !== cat)
                                  );
                                }}
                              />
                              <span>{cat}</span>
                            </label>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9">
                          Nome {selectedNames.length > 0 ? `(${selectedNames.length})` : ""}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 max-h-80 overflow-y-auto" align="start">
                        <div className="space-y-2">
                          {namesForDropdown.map((name) => (
                            <label
                              key={name}
                              className="flex items-center gap-2 cursor-pointer text-sm"
                            >
                              <Checkbox
                                checked={selectedNames.includes(name)}
                                onCheckedChange={(checked) => {
                                  setSelectedNames((prev) =>
                                    checked ? [...prev, name] : prev.filter((n) => n !== name)
                                  );
                                }}
                              />
                              <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{name}</code>
                            </label>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    {(selectedCategories.length > 0 || selectedNames.length > 0) && (
                      <Button variant="ghost" size="sm" onClick={clearDataPathFilters}>
                        Limpar filtros
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCategories.map((cat) => (
                      <Badge key={cat} variant="secondary" className="gap-1 pr-1">
                        {cat}
                        <button
                          type="button"
                          aria-label={`Remover ${cat}`}
                          className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                          onClick={() => setSelectedCategories((prev) => prev.filter((x) => x !== cat))}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {selectedNames.map((n) => (
                      <Badge key={n} variant="outline" className="gap-1 pr-1 font-mono text-xs">
                        {n}
                        <button
                          type="button"
                          aria-label={`Remover ${n}`}
                          className="rounded-full hover:bg-muted-foreground/20 p-0.5 shrink-0"
                          onClick={() => setSelectedNames((prev) => prev.filter((x) => x !== n))}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-8 mt-6">
                  {filteredList.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6">
                      Nenhum componente encontrado. Ajuste os filtros.
                    </p>
                  ) : (
                    filteredList.map((item) => (
                      <div key={item.type} className="space-y-3">
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <code className="bg-muted px-2 py-0.5 rounded">{item.type}</code>
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Estrutura JSON (componente + dados):</p>
                            <div className="bg-muted/50 rounded-lg p-3 overflow-x-auto max-h-[320px] overflow-y-auto">
                              <pre className="text-xs">
                                <code>{item.exampleStr ?? JSON.stringify({ component: item.component, data: { sectionData: "(dados da seção)" } }, null, 2)}</code>
                              </pre>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Renderizado:</p>
                            <div className="border rounded-lg p-4 bg-background min-h-[200px]">
                              {renderComponentExampleWithData(
                                item.type,
                                item.component,
                                item.dataForRender
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INVENTÁRIO DO RELATÓRIO */}
          <TabsContent value="inventario" className="space-y-4">
            {/* Tipos aceitos pelo código (registry) */}
            <Card>
              <CardHeader>
                <CardTitle>Tipos aceitos pelo código (registry)</CardTitle>
                <CardDescription>
                  Todos os tipos de componente que o código reconhece (
                  <code className="bg-muted px-1 rounded text-xs">ComponentRegistry</code>
                  ). O JSON pode usar qualquer um destes tipos em seções/subseções ou nos templates de questão.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Tipos de componente</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(componentCategories).map(([cat, types]) => (
                        <TableRow key={cat}>
                          <TableCell>
                            <Badge variant="secondary">{cat}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {types.map((t) => (
                                <code key={t} className="bg-muted px-1.5 py-0.5 rounded text-xs">
                                  {t}
                                </code>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell>
                          <Badge variant="outline">Registry (total)</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {allComponents.length} tipos registrados
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventário do relatório (JSON carregado)</CardTitle>
                <CardDescription>
                  Scan completo de seções, subseções e componentes no JSON carregado (
                  <code className="bg-muted px-1 rounded text-xs">
                    {dataSourceLabel ?? "—"}
                  </code>
                  ). Inclui componentes por seção/subseção e questões por tipo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reportInventory.map((section) => (
                    <div key={section.id} className="space-y-2">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Badge variant="secondary">{section.id}</Badge>
                        {section.name}
                      </h3>
                      {section.subsections.map((sub) => (
                        <div
                          key={sub.id}
                          className="pl-4 border-l-2 border-muted space-y-2"
                        >
                          <h4 className="text-sm font-medium text-muted-foreground">
                            {sub.name}
                          </h4>
                          {sub.components.length > 0 ? (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>dataPath</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {sub.components.map((c, i) => (
                                    <TableRow key={`${c.type}-${i}`}>
                                      <TableCell>
                                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                                          {c.type}
                                        </code>
                                      </TableCell>
                                      <TableCell className="font-mono text-xs">
                                        {c.dataPath || "—"}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Sem componentes com type/dataPath
                            </p>
                          )}
                        </div>
                      ))}
                      {section.questions && section.questions.length > 0 && (
                        <div className="pl-4 border-l-2 border-muted space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Questões (dados gerados por tipo)
                          </h4>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>question_id</TableHead>
                                  <TableHead>questionType</TableHead>
                                  <TableHead>
                                    dataKeys no question.data
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {section.questions.map((q) => (
                                  <TableRow
                                    key={q.question_id || q.questionType}
                                  >
                                    <TableCell className="font-mono text-xs">
                                      {q.question_id}
                                    </TableCell>
                                    <TableCell>
                                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                                        {q.questionType}
                                      </code>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                      {q.dataKeys.join(", ") || "—"}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMPONENTES */}
          <TabsContent value="components" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Todos os Componentes Disponíveis</CardTitle>
                <CardDescription>
                  {allComponents.length} tipos de componentes registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(componentCategories).map(
                    ([category, components]) => (
                      <div key={category} className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Badge variant="secondary">{category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            ({components.length} componentes)
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {components.map((componentType) => (
                            <Card key={componentType} className="p-3">
                              <div className="flex items-center justify-between">
                                <code className="text-sm font-mono font-semibold">
                                  {componentType}
                                </code>
                                <Badge variant="outline" className="text-xs">
                                  {category}
                                </Badge>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CARDS */}
          <TabsContent value="cards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Variações de Cards</CardTitle>
                <CardDescription>
                  Exemplos de todas as formas de usar o componente card
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(cardExamples).map(([name, example]) => (
                    <Card key={name} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold capitalize">{name}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(
                                JSON.stringify(example, null, 2),
                                `card-${name}`
                              )
                            }
                          >
                            {copiedCode === `card-${name}` ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>

                        {/* Layout de duas colunas: JSON à esquerda, Renderização à direita */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* JSON */}
                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              Estrutura JSON:
                            </p>
                            <div className="bg-muted/50 rounded-lg p-3">
                              <pre className="text-xs overflow-x-auto">
                                <code>{JSON.stringify(example, null, 2)}</code>
                              </pre>
                            </div>
                          </div>

                          {/* Renderização */}
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Renderizado:</p>
                            <div className="border rounded-lg p-4 bg-background">
                              {renderComponentExample("card", example)}
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium mb-1">Características:</p>
                          <ul className="list-disc ml-4 space-y-1">
                            {example.useDescription && (
                              <li>
                                Usa <code>CardDescription</code> component
                              </li>
                            )}
                            {example.cardStyleVariant && (
                              <li>
                                CardStyleVariant:{" "}
                                <code>{example.cardStyleVariant}</code>
                              </li>
                            )}
                            {example.cardContentVariant && (
                              <li>
                                CardContentVariant:{" "}
                                <code>{example.cardContentVariant}</code>
                              </li>
                            )}
                            {example.components && (
                              <li>
                                Contém {example.components.length} componente(s)
                                aninhado(s)
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VARIANTES */}
          <TabsContent value="variants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Variantes de Estilo</CardTitle>
                <CardDescription>
                  Todas as opções de cardStyleVariant, cardContentVariant e
                  titleStyleVariant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* StyleVariants */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">
                      cardStyleVariant (Card)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {cardStyleVariants.map((variant) => (
                        <Card key={variant} className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <code className="text-sm font-mono font-semibold">
                                {variant}
                              </code>
                              <Badge variant="outline">Card</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Classes:{" "}
                              <code className="text-xs">
                                {cardVariants[variant]}
                              </code>
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* TextStyleVariants */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">
                      cardContentVariant (CardContent)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {cardContentVariantsList.map((variant) => (
                        <Card key={variant} className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <code className="text-sm font-mono font-semibold">
                                {variant}
                              </code>
                              <Badge variant="outline">Content</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Classes:{" "}
                              <code className="text-xs">
                                {cardContentVariants[variant]}
                              </code>
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* TitleStyleVariants */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">
                      titleStyleVariant (CardTitle)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {titleStyleVariants.map((variant) => (
                        <Card key={variant} className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <code className="text-sm font-mono font-semibold">
                                {variant}
                              </code>
                              <Badge variant="outline">Title</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Classes:{" "}
                              <code className="text-xs">
                                {cardTitleVariants[variant]}
                              </code>
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SafeRender>
    </div>
  );
}
