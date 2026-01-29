import { useState, useMemo } from "react";
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
import { Copy, Check, BookOpen, Code, Layout, Palette } from "lucide-react";
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
import { useSurveyData } from "@/hooks/useSurveyData";

/**
 * Página de Referência do JSON Schema
 * Documenta todos os campos, estruturas e componentes disponíveis
 */
export default function JsonReference() {
  const [copiedCode, setCopiedCode] = useState(null);
  const { data: surveyDataJson, loading } = useSurveyData();

  // Hooks precisam ser chamados antes de qualquer return condicional (Rules of Hooks)
  // Nova regra: attributes (e demais seções) não têm mais subseções específicas; sectionData vem de section.data
  const sectionData = useMemo(() => {
    if (!surveyDataJson?.sections) return {};
    // Usa a primeira seção com data para o contexto de exemplos (ex.: executive ou attributes)
    const sectionWithData = surveyDataJson.sections.find(
      (s) => s.data && Object.keys(s.data).length > 0,
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
        npsCategory: surveyDataJson?.metadata?.npsCategory || "Bom",
      },
      uiTexts: surveyDataJson?.uiTexts || {},
      _filterPillsState: null,
    }),
    [surveyDataJson, sectionData],
  );

  const extractSectionData = useMemo(() => {
    const sections = surveyDataJson?.sections || [];
    return {
      ids: [...new Set(sections.map((s) => s.id).filter(Boolean))],
      indexes: [
        ...new Set(
          sections
            .map((s) => s.index)
            .filter((v) => v !== undefined && v !== null),
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
            .filter((v) => v !== undefined && v !== null),
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
          .filter((v) => v !== undefined && v !== null),
      ),
    ].sort((a, b) => a - b);
    const cardStyleVariants = [
      ...new Set(allComponents.map((c) => c.cardStyleVariant).filter(Boolean)),
    ];
    const cardContentVariantsList = [
      ...new Set(
        allComponents.map((c) => c.cardContentVariant).filter(Boolean),
      ),
    ];
    const useDescription = [
      ...new Set(
        allComponents
          .map((c) => c.useDescription)
          .filter((v) => v !== undefined),
      ),
    ];
    const titles = [
      ...new Set(
        allComponents
          .map((c) => c.title)
          .filter((v) => v !== undefined && v !== null),
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
        ["card", "npsScoreCard", "topCategoriesCards", "kpiCard"].includes(t),
      ),
      Containers: types.filter((t) =>
        ["container", "grid-container"].includes(t),
      ),
      Charts: types.filter(
        (t) =>
          t.includes("Chart") ||
          t.includes("Plot") ||
          t.includes("Diagram") ||
          t.includes("Graph") ||
          t.includes("Scorecard"),
      ),
      Tables: types.filter((t) => t.includes("Table")),
      Headers: types.filter((t) => ["h3", "h4"].includes(t)),
      Widgets: types.filter((t) =>
        ["questionsList", "filterPills", "wordCloud", "accordion"].includes(t),
      ),
    };
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
    };
  }, [surveyDataJson]);

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

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Mostra loading enquanto os dados não carregam (depois de todos os hooks)
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

  // Estrutura básica do JSON
  const basicStructure = {
    metadata: {
      version: "string",
      language: "string",
      surveyId: "string",
    },
    sections: [
      {
        id: "string (único)",
        index: "number",
        name: "string",
        icon: "string (nome do ícone)",
        subsections: [
          {
            id: "string (único)",
            index: "number",
            name: "string",
            icon: "string",
            components: [],
            data: {
              // Dados específicos da subseção (opcional)
            },
          },
        ],
        components: [],
        questions: [],
        data: {
          // Dados específicos da seção (opcional)
        },
      },
    ],
    uiTexts: {
      filterPanel: {},
      export: {},
      common: {},
    },
    surveyInfo: {
      title: "string",
      company: "string",
      period: "string",
      totalRespondents: "number",
      responseRate: "number",
      questions: "number",
    },
  };

  // Todos os componentes disponíveis
  const allComponents = Object.keys(componentRegistry);

  // Categorias de componentes
  const componentCategories = {
    Charts: [
      "barChart",
      "sentimentDivergentChart",
      "sentimentStackedChart",
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
    ],
    Cards: ["card", "npsScoreCard", "topCategoriesCards", "kpiCard"],
    Tables: [
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
    ],
    Widgets: ["questionsList", "filterPills", "wordCloud", "accordion"],
    Containers: ["container", "grid-container"],
  };

  // Exemplos de cards
  const cardExamples = {
    basic: {
      type: "card",
      index: 0,
      title: "Título do Card",
      text: "Texto do card com suporte a quebras de linha.\nSegunda linha.",
      cardStyleVariant: "default",
    },
    withDescription: {
      type: "card",
      index: 0,
      useDescription: true,
      text: "Texto usando CardDescription component",
      cardStyleVariant: "default",
      cardContentVariant: "with-description",
    },
    borderLeft: {
      type: "card",
      index: 0,
      title: "Card com Borda",
      text: "Card com borda laranja à esquerda",
      cardStyleVariant: "border-left",
    },
    withNested: {
      type: "card",
      index: 0,
      title: "Card com Componentes",
      text: "Card que contém outros componentes",
      cardStyleVariant: "default",
      components: [
        {
          type: "barChart",
          index: 0,
          dataPath: "sectionData.data",
          config: {},
        },
      ],
    },
    overflowHidden: {
      type: "card",
      index: 0,
      title: "",
      text: "",
      cardStyleVariant: "overflow-hidden",
      components: [
        {
          type: "recommendationsTable",
          index: 0,
          dataPath: "sectionData.recommendationsTable",
        },
      ],
    },
    flexColumn: {
      type: "card",
      index: 0,
      title: "Card Flex Column",
      cardStyleVariant: "flex-column",
      cardContentVariant: "with-charts",
      components: [
        {
          type: "barChart",
          index: 0,
          dataPath: "sectionData.data",
        },
      ],
    },
  };

  // StyleVariants disponíveis
  const cardStyleVariants = Object.keys(cardVariants);
  const cardContentVariantsList = Object.keys(cardContentVariants);
  const titleStyleVariants = Object.keys(cardTitleVariants);

  // Função para renderizar exemplo de componente com dados customizados
  const renderComponentExampleWithData = (
    componentType,
    exampleConfig = {},
    customData = null,
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
        typeof rendered,
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
                    {},
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
                    typeof rendered,
                  );
                  return null;
                }
              } catch (err) {
                console.error(
                  `Erro ao renderizar componente aninhado ${comp.type}:`,
                  err,
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
                  item,
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
                    {},
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
                    typeof rendered,
                  );
                  return null;
                }
              } catch (err) {
                console.error(
                  `Erro ao renderizar componente aninhado ${comp.type}:`,
                  err,
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
                  item,
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
        typeof rendered,
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
    sentimentStackedChart: {
      type: "sentimentStackedChart",
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
              typeof child,
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
        },
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
                disponíveis no JSON
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <SafeRender>
        <Tabs defaultValue="structure" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
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
            <TabsTrigger value="datapath">
              <Code className="w-4 h-4 mr-2" />
              Data Path
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
                              <code>sectionData</code> vem de{" "}
                              <code>section.data</code> (não há mais subseções
                              específicas por atributo)
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
                  Referência completa de todos os campos disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Campos de Componente */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">
                      Campos Comuns de Componentes
                    </h3>
                    <div className="space-y-2">
                      {[
                        {
                          name: "type",
                          required: true,
                          type: "string",
                          desc: "Tipo do componente (obrigatório)",
                          values:
                            extractComponentData.types.length > 0
                              ? extractComponentData.types
                              : null,
                          valuesByCategory: extractComponentData.typeCategories,
                        },
                        {
                          name: "index",
                          required: false,
                          type: "number",
                          desc: "Ordem de renderização",
                          values:
                            extractComponentData.indexes.length > 0
                              ? extractComponentData.indexes
                              : null,
                        },
                        {
                          name: "dataPath",
                          required: false,
                          type: "string",
                          desc: "Caminho para os dados (ex: 'sectionData.data')",
                          values:
                            extractComponentData.dataPaths.length > 0
                              ? extractComponentData.dataPaths
                              : null,
                        },
                        {
                          name: "config",
                          required: false,
                          type: "object",
                          desc: "Configurações específicas do componente",
                          configValues: extractConfigData,
                        },
                        {
                          name: "title",
                          required: false,
                          type: "string",
                          desc: "Título do componente",
                          values:
                            extractComponentData.titles.length > 0
                              ? extractComponentData.titles.slice(0, 10)
                              : null,
                          hasMore: extractComponentData.titles.length > 10,
                        },
                        {
                          name: "text",
                          required: false,
                          type: "string",
                          desc: "Texto do componente (suporta \\n para quebras)",
                          values:
                            extractComponentData.texts.length > 0
                              ? extractComponentData.texts
                              : null,
                        },
                        {
                          name: "cardStyleVariant",
                          required: false,
                          type: "string",
                          desc: "Variante de estilo do card",
                          values:
                            extractComponentData.cardStyleVariants.length > 0
                              ? extractComponentData.cardStyleVariants
                              : null,
                        },
                        {
                          name: "cardContentVariant",
                          required: false,
                          type: "string",
                          desc: "Variante de estilo do conteúdo",
                          values:
                            extractComponentData.cardContentVariantsList
                              .length > 0
                              ? extractComponentData.cardContentVariantsList
                              : null,
                        },
                        {
                          name: "titleStyleVariant",
                          required: false,
                          type: "string",
                          desc: "Variante de estilo do título",
                          values: null,
                        },
                        {
                          name: "useDescription",
                          required: false,
                          type: "boolean",
                          desc: "Usar CardDescription ao invés de div",
                          values:
                            extractComponentData.useDescription.length > 0
                              ? extractComponentData.useDescription
                              : [false],
                        },
                        {
                          name: "components",
                          required: false,
                          type: "array",
                          desc: "Componentes aninhados",
                          values: null,
                        },
                      ].map((field) => (
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
                                        ),
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
                                      ),
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
                                          ),
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
                                          ),
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
                      {[
                        {
                          name: "id",
                          required: true,
                          type: "string",
                          desc: "Identificador único da seção",
                          values:
                            extractSectionData.ids.length > 0
                              ? extractSectionData.ids
                              : null,
                        },
                        {
                          name: "index",
                          required: false,
                          type: "number",
                          desc: "Ordem de exibição",
                          values:
                            extractSectionData.indexes.length > 0
                              ? extractSectionData.indexes
                              : null,
                        },
                        {
                          name: "name",
                          required: false,
                          type: "string",
                          desc: "Nome exibido da seção",
                          values:
                            extractSectionData.names.length > 0
                              ? extractSectionData.names
                              : null,
                        },
                        {
                          name: "icon",
                          required: false,
                          type: "string",
                          desc: "Nome do ícone (lucide-react)",
                          values:
                            extractSectionData.icons.length > 0
                              ? extractSectionData.icons
                              : null,
                        },
                        {
                          name: "subsections",
                          required: false,
                          type: "array",
                          desc: "Array de subseções",
                          values: null,
                        },
                        {
                          name: "data",
                          required: false,
                          type: "object",
                          desc: "Dados específicos da seção",
                          values: null,
                        },
                      ].map((field) => (
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
                                    ),
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
                      {[
                        {
                          name: "id",
                          required: true,
                          type: "string",
                          desc: "Identificador único da subseção",
                          values:
                            extractSubsectionData.ids.length > 0
                              ? extractSubsectionData.ids
                              : null,
                        },
                        {
                          name: "index",
                          required: false,
                          type: "number",
                          desc: "Ordem de exibição",
                          values:
                            extractSubsectionData.indexes.length > 0
                              ? extractSubsectionData.indexes
                              : null,
                        },
                        {
                          name: "name",
                          required: false,
                          type: "string",
                          desc: "Nome exibido da subseção",
                          values:
                            extractSubsectionData.names.length > 0
                              ? extractSubsectionData.names
                              : null,
                        },
                        {
                          name: "icon",
                          required: false,
                          type: "string",
                          desc: "Nome do ícone (lucide-react)",
                          values:
                            extractSubsectionData.icons.length > 0
                              ? extractSubsectionData.icons
                              : null,
                        },
                        {
                          name: "components",
                          required: false,
                          type: "array",
                          desc: "Array de componentes",
                          values: null,
                        },
                        {
                          name: "data",
                          required: false,
                          type: "object",
                          desc: "Dados específicos da subseção",
                          values: null,
                        },
                      ].map((field) => (
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
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TABELAS DE VALORES */}
          <TabsContent value="tables" className="space-y-6">
            {/* Tabela de Campos de Seção */}
            <Card>
              <CardHeader>
                <CardTitle>Campos de Seção - Valores no JSON</CardTitle>
                <CardDescription>
                  Todos os valores únicos encontrados para campos de seção
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
                  Todos os valores únicos encontrados para campos de subseção
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
                  Todos os valores únicos encontrados para campos de componentes
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
                              extractComponentData.typeCategories,
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
                                ),
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
                              ),
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
                              ),
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
                                    : `"${text.substring(0, 50)}${text.length > 50 ? "..." : ""}"`}
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

          {/* DATA PATH - EXEMPLOS DE ESTRUTURAS */}
          <TabsContent value="datapath" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exemplos de Estruturas JSON com Dados</CardTitle>
                <CardDescription>
                  Exemplos práticos de JSON necessários para renderizar cada
                  tipo de componente, incluindo os dados necessários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* GRÁFICOS */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-xl">Gráficos (Charts)</h3>

                    {/* BarChart */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">barChart</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            JSON necessário:
                          </p>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <pre className="text-xs overflow-x-auto">
                              <code>
                                {JSON.stringify(
                                  {
                                    component: {
                                      type: "barChart",
                                      index: 0,
                                      dataPath: "sectionData.barChart",
                                      config: {
                                        dataKey: "percentage",
                                        yAxisDataKey: "option",
                                      },
                                    },
                                    data: {
                                      sectionData: {
                                        barChart: [
                                          {
                                            option: "Muito bom",
                                            value: 221,
                                            percentage: 26,
                                          },
                                          {
                                            option: "Bom",
                                            value: 221,
                                            percentage: 26,
                                          },
                                          {
                                            option: "Regular",
                                            value: 238,
                                            percentage: 28,
                                          },
                                          {
                                            option: "Ruim",
                                            value: 136,
                                            percentage: 16,
                                          },
                                          {
                                            option: "Muito ruim",
                                            value: 34,
                                            percentage: 4,
                                          },
                                        ],
                                      },
                                    },
                                  },
                                  null,
                                  2,
                                )}
                              </code>
                            </pre>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Renderizado:</p>
                          <div className="border rounded-lg p-4 bg-background min-h-[200px]">
                            {renderComponentExampleWithData(
                              "barChart",
                              {
                                type: "barChart",
                                index: 0,
                                dataPath: "sectionData.barChart",
                                config: {
                                  dataKey: "percentage",
                                  yAxisDataKey: "option",
                                },
                              },
                              {
                                ...realData,
                                sectionData: {
                                  ...realData.sectionData,
                                  barChart: [
                                    {
                                      option: "Muito bom",
                                      value: 221,
                                      percentage: 26,
                                    },
                                    {
                                      option: "Bom",
                                      value: 221,
                                      percentage: 26,
                                    },
                                    {
                                      option: "Regular",
                                      value: 238,
                                      percentage: 28,
                                    },
                                    {
                                      option: "Ruim",
                                      value: 136,
                                      percentage: 16,
                                    },
                                    {
                                      option: "Muito ruim",
                                      value: 34,
                                      percentage: 4,
                                    },
                                  ],
                                },
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SentimentStackedChart */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">
                        sentimentStackedChart
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            JSON necessário:
                          </p>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <pre className="text-xs overflow-x-auto">
                              <code>
                                {JSON.stringify(
                                  {
                                    component: {
                                      type: "sentimentStackedChart",
                                      index: 0,
                                      dataPath:
                                        "sectionData.sentimentStackedChart",
                                      config: {
                                        yAxisDataKey: "category",
                                      },
                                    },
                                    data: {
                                      sectionData: {
                                        sentimentStackedChart: [
                                          {
                                            category: "Trabalho em Equipe",
                                            positive: 72.3,
                                            neutral: 18.5,
                                            negative: 9.2,
                                          },
                                          {
                                            category: "Desenvolvimento",
                                            positive: 68.1,
                                            neutral: 22.4,
                                            negative: 9.5,
                                          },
                                          {
                                            category: "Flexibilidade",
                                            positive: 65.2,
                                            neutral: 25.8,
                                            negative: 9.0,
                                          },
                                        ],
                                      },
                                    },
                                  },
                                  null,
                                  2,
                                )}
                              </code>
                            </pre>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Renderizado:</p>
                          <div className="border rounded-lg p-4 bg-background min-h-[200px]">
                            {renderComponentExampleWithData(
                              "sentimentStackedChart",
                              {
                                type: "sentimentStackedChart",
                                index: 0,
                                dataPath: "sectionData.sentimentStackedChart",
                                config: {
                                  yAxisDataKey: "category",
                                },
                              },
                              {
                                ...realData,
                                sectionData: {
                                  ...realData.sectionData,
                                  sentimentStackedChart: [
                                    {
                                      category: "Trabalho em Equipe",
                                      positive: 72.3,
                                      neutral: 18.5,
                                      negative: 9.2,
                                    },
                                    {
                                      category: "Desenvolvimento",
                                      positive: 68.1,
                                      neutral: 22.4,
                                      negative: 9.5,
                                    },
                                    {
                                      category: "Flexibilidade",
                                      positive: 65.2,
                                      neutral: 25.8,
                                      negative: 9.0,
                                    },
                                  ],
                                },
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* NPS Stacked Chart */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">npsStackedChart</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            JSON necessário:
                          </p>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <pre className="text-xs overflow-x-auto">
                              <code>
                                {JSON.stringify(
                                  {
                                    component: {
                                      type: "npsStackedChart",
                                      index: 0,
                                      dataPath: "question.data.npsStackedChart",
                                      config: {},
                                    },
                                    data: {
                                      question: {
                                        data: {
                                          npsStackedChart: [
                                            {
                                              option: "Promotor",
                                              value: 493,
                                              percentage: 58,
                                            },
                                            {
                                              option: "Neutro",
                                              value: 170,
                                              percentage: 20,
                                            },
                                            {
                                              option: "Detrator",
                                              value: 187,
                                              percentage: 22,
                                            },
                                          ],
                                        },
                                      },
                                    },
                                  },
                                  null,
                                  2,
                                )}
                              </code>
                            </pre>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Renderizado:</p>
                          <div className="border rounded-lg p-4 bg-background min-h-[200px]">
                            {renderComponentExampleWithData(
                              "npsStackedChart",
                              {
                                type: "npsStackedChart",
                                index: 0,
                                dataPath: "question.data.npsStackedChart",
                                config: {},
                              },
                              {
                                ...realData,
                                question: {
                                  data: {
                                    npsStackedChart: [
                                      {
                                        option: "Promotor",
                                        value: 493,
                                        percentage: 58,
                                      },
                                      {
                                        option: "Neutro",
                                        value: 170,
                                        percentage: 20,
                                      },
                                      {
                                        option: "Detrator",
                                        value: 187,
                                        percentage: 22,
                                      },
                                    ],
                                  },
                                },
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARDS */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-xl">Cards</h3>

                    {/* Card Básico */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">card (básico)</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            JSON necessário:
                          </p>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <pre className="text-xs overflow-x-auto">
                              <code>
                                {JSON.stringify(
                                  {
                                    component: {
                                      type: "card",
                                      index: 0,
                                      title: "Sobre o Estudo",
                                      text: "Esta pesquisa de satisfação foi conduzida entre janeiro e março de 2025, envolvendo 850 colaboradores.\nO objetivo principal é avaliar o nível de engajamento e identificar áreas de melhoria.",
                                      cardStyleVariant: "default",
                                    },
                                  },
                                  null,
                                  2,
                                )}
                              </code>
                            </pre>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Renderizado:</p>
                          <div className="border rounded-lg p-4 bg-background">
                            {renderComponentExample("card", {
                              type: "card",
                              index: 0,
                              title: "Sobre o Estudo",
                              text: "Esta pesquisa de satisfação foi conduzida entre janeiro e março de 2025, envolvendo 850 colaboradores.\nO objetivo principal é avaliar o nível de engajamento e identificar áreas de melhoria.",
                              cardStyleVariant: "default",
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card com Borda */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">
                        card (border-left)
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            JSON necessário:
                          </p>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <pre className="text-xs overflow-x-auto">
                              <code>
                                {JSON.stringify(
                                  {
                                    component: {
                                      type: "card",
                                      index: 0,
                                      title: "Principais Descobertas",
                                      text: "O NPS organizacional é de 35 pontos, classificado como 'Bom'.\nPrincipais pontos positivos incluem: qualidade do trabalho em equipe (72% positivo).",
                                      cardStyleVariant: "border-left",
                                    },
                                  },
                                  null,
                                  2,
                                )}
                              </code>
                            </pre>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Renderizado:</p>
                          <div className="border rounded-lg p-4 bg-background">
                            {renderComponentExample("card", {
                              type: "card",
                              index: 0,
                              title: "Principais Descobertas",
                              text: "O NPS organizacional é de 35 pontos, classificado como 'Bom'.\nPrincipais pontos positivos incluem: qualidade do trabalho em equipe (72% positivo).",
                              cardStyleVariant: "border-left",
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card com Componentes Aninhados */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">
                        card (com componentes aninhados)
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            JSON necessário:
                          </p>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <pre className="text-xs overflow-x-auto">
                              <code>
                                {JSON.stringify(
                                  {
                                    component: {
                                      type: "card",
                                      index: 0,
                                      title: "Análise de Sentimento",
                                      text: "A análise de sentimento foi realizada com base nas respostas dos funcionários.",
                                      cardStyleVariant: "default",
                                      components: [
                                        {
                                          type: "sentimentDivergentChart",
                                          index: 0,
                                          dataPath:
                                            "sectionData.sentimentDivergentChart",
                                          config: {
                                            yAxisDataKey: "category",
                                          },
                                        },
                                      ],
                                    },
                                    data: {
                                      sectionData: {
                                        sentimentDivergentChart: [
                                          {
                                            category: "Trabalho em Equipe",
                                            positive: 72.3,
                                            neutral: 18.5,
                                            negative: 9.2,
                                          },
                                          {
                                            category: "Desenvolvimento",
                                            positive: 68.1,
                                            neutral: 22.4,
                                            negative: 9.5,
                                          },
                                        ],
                                      },
                                    },
                                  },
                                  null,
                                  2,
                                )}
                              </code>
                            </pre>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Renderizado:</p>
                          <div className="border rounded-lg p-4 bg-background">
                            {renderComponentExampleWithData(
                              "card",
                              {
                                type: "card",
                                index: 0,
                                title: "Análise de Sentimento",
                                text: "A análise de sentimento foi realizada com base nas respostas dos funcionários.",
                                cardStyleVariant: "default",
                                components: [
                                  {
                                    type: "sentimentDivergentChart",
                                    index: 0,
                                    dataPath:
                                      "sectionData.sentimentDivergentChart",
                                    config: {
                                      yAxisDataKey: "category",
                                    },
                                  },
                                ],
                              },
                              {
                                ...realData,
                                sectionData: {
                                  ...realData.sectionData,
                                  sentimentDivergentChart: [
                                    {
                                      category: "Trabalho em Equipe",
                                      positive: 72.3,
                                      neutral: 18.5,
                                      negative: 9.2,
                                    },
                                    {
                                      category: "Desenvolvimento",
                                      positive: 68.1,
                                      neutral: 22.4,
                                      negative: 9.5,
                                    },
                                  ],
                                },
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* NPS Score Card */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">npsScoreCard</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            JSON necessário:
                          </p>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <pre className="text-xs overflow-x-auto">
                              <code>
                                {JSON.stringify(
                                  {
                                    component: {
                                      type: "npsScoreCard",
                                      index: 0,
                                      dataPath: "question.data",
                                      config: {},
                                    },
                                    data: {
                                      question: {
                                        data: {
                                          npsScore: 35,
                                          npsCategory: "Bom",
                                        },
                                      },
                                    },
                                  },
                                  null,
                                  2,
                                )}
                              </code>
                            </pre>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Renderizado:</p>
                          <div className="border rounded-lg p-4 bg-background">
                            {renderComponentExampleWithData(
                              "npsScoreCard",
                              {
                                type: "npsScoreCard",
                                index: 0,
                                dataPath: "question.data",
                                config: {},
                              },
                              {
                                ...realData,
                                question: {
                                  data: {
                                    npsScore: 35,
                                    npsCategory: "Bom",
                                  },
                                },
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TABELAS */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-xl">Tabelas (Tables)</h3>

                    {/* DistributionTable */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">
                        distributionTable
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            JSON necessário:
                          </p>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <pre className="text-xs overflow-x-auto">
                              <code>
                                {JSON.stringify(
                                  {
                                    component: {
                                      type: "distributionTable",
                                      index: 0,
                                      dataPath: "sectionData.distributionTable",
                                      config: {},
                                    },
                                    data: {
                                      sectionData: {
                                        distributionTable: [
                                          {
                                            segment: "Menos de 1 ano",
                                            count: 170,
                                            percentage: 20,
                                          },
                                          {
                                            segment: "1-3 anos",
                                            count: 298,
                                            percentage: 35,
                                          },
                                          {
                                            segment: "3-5 anos",
                                            count: 213,
                                            percentage: 25,
                                          },
                                          {
                                            segment: "Mais de 5 anos",
                                            count: 169,
                                            percentage: 20,
                                          },
                                        ],
                                      },
                                    },
                                  },
                                  null,
                                  2,
                                )}
                              </code>
                            </pre>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Renderizado:</p>
                          <div className="border rounded-lg p-4 bg-background">
                            {renderComponentExampleWithData(
                              "distributionTable",
                              {
                                type: "distributionTable",
                                index: 0,
                                dataPath: "sectionData.distributionTable",
                                config: {},
                              },
                              {
                                ...realData,
                                sectionData: {
                                  ...realData.sectionData,
                                  distributionTable: [
                                    {
                                      segment: "Menos de 1 ano",
                                      count: 170,
                                      percentage: 20,
                                    },
                                    {
                                      segment: "1-3 anos",
                                      count: 298,
                                      percentage: 35,
                                    },
                                    {
                                      segment: "3-5 anos",
                                      count: 213,
                                      percentage: 25,
                                    },
                                    {
                                      segment: "Mais de 5 anos",
                                      count: 169,
                                      percentage: 20,
                                    },
                                  ],
                                },
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SentimentTable */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">sentimentTable</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            JSON necessário:
                          </p>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <pre className="text-xs overflow-x-auto">
                              <code>
                                {JSON.stringify(
                                  {
                                    component: {
                                      type: "sentimentTable",
                                      index: 0,
                                      dataPath: "sectionData.sentimentTable",
                                      config: {},
                                    },
                                    data: {
                                      sectionData: {
                                        sentimentTable: [
                                          {
                                            segment: "Mais de 5 anos",
                                            positive: 78.5,
                                            neutral: 15.5,
                                            negative: 6,
                                          },
                                          {
                                            segment: "3-5 anos",
                                            positive: 72,
                                            neutral: 20,
                                            negative: 8,
                                          },
                                          {
                                            segment: "1-3 anos",
                                            positive: 65.5,
                                            neutral: 25.5,
                                            negative: 9,
                                          },
                                          {
                                            segment: "Menos de 1 ano",
                                            positive: 58,
                                            neutral: 28,
                                            negative: 14,
                                          },
                                        ],
                                      },
                                    },
                                  },
                                  null,
                                  2,
                                )}
                              </code>
                            </pre>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Renderizado:</p>
                          <div className="border rounded-lg p-4 bg-background">
                            {renderComponentExampleWithData(
                              "sentimentTable",
                              {
                                type: "sentimentTable",
                                index: 0,
                                dataPath: "sectionData.sentimentTable",
                                config: {},
                              },
                              {
                                ...realData,
                                sectionData: {
                                  ...realData.sectionData,
                                  sentimentTable: [
                                    {
                                      segment: "Mais de 5 anos",
                                      positive: 78.5,
                                      neutral: 15.5,
                                      negative: 6,
                                    },
                                    {
                                      segment: "3-5 anos",
                                      positive: 72,
                                      neutral: 20,
                                      negative: 8,
                                    },
                                    {
                                      segment: "1-3 anos",
                                      positive: 65.5,
                                      neutral: 25.5,
                                      negative: 9,
                                    },
                                    {
                                      segment: "Menos de 1 ano",
                                      positive: 58,
                                      neutral: 28,
                                      negative: 14,
                                    },
                                  ],
                                },
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RecommendationsTable */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">
                        recommendationsTable
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            JSON necessário:
                          </p>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <pre className="text-xs overflow-x-auto">
                              <code>
                                {JSON.stringify(
                                  {
                                    component: {
                                      type: "recommendationsTable",
                                      index: 0,
                                      dataPath:
                                        "sectionData.recommendationsTable",
                                      config: {},
                                    },
                                    data: {
                                      sectionData: {
                                        recommendationsTable: {
                                          config: {
                                            severityLabels: {
                                              high: "Alto",
                                              medium: "Médio",
                                              low: "Baixo",
                                              critical: "Crítico",
                                            },
                                          },
                                          items: [
                                            {
                                              id: 1,
                                              recommendation:
                                                "Implementar Sistema de Comunicação Interna Mais Eficiente",
                                              severity: "high",
                                              stakeholders: [
                                                "Comunicação Corporativa",
                                                "TI",
                                                "RH",
                                              ],
                                              tasks: [
                                                {
                                                  task: "Avaliar ferramentas de comunicação",
                                                  owner: "TI",
                                                },
                                                {
                                                  task: "Definir estratégia de comunicação",
                                                  owner: "Comunicação",
                                                },
                                              ],
                                            },
                                            {
                                              id: 2,
                                              recommendation:
                                                "Reduzir Processos Burocráticos",
                                              severity: "high",
                                              stakeholders: [
                                                "Operações",
                                                "Processos",
                                              ],
                                              tasks: [
                                                {
                                                  task: "Mapear processos atuais",
                                                  owner: "Processos",
                                                },
                                                {
                                                  task: "Priorizar processos",
                                                  owner: "Liderança",
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      },
                                    },
                                  },
                                  null,
                                  2,
                                )}
                              </code>
                            </pre>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Renderizado:</p>
                          <div className="border rounded-lg p-4 bg-background">
                            {renderComponentExampleWithData(
                              "recommendationsTable",
                              {
                                type: "recommendationsTable",
                                index: 0,
                                dataPath: "sectionData.recommendationsTable",
                                config: {},
                              },
                              {
                                ...realData,
                                sectionData: {
                                  ...realData.sectionData,
                                  recommendationsTable: {
                                    config: {
                                      severityLabels: {
                                        high: "Alto",
                                        medium: "Médio",
                                        low: "Baixo",
                                        critical: "Crítico",
                                      },
                                    },
                                    items: [
                                      {
                                        id: 1,
                                        recommendation:
                                          "Implementar Sistema de Comunicação Interna Mais Eficiente",
                                        severity: "high",
                                        stakeholders: [
                                          "Comunicação Corporativa",
                                          "TI",
                                          "RH",
                                        ],
                                        tasks: [
                                          {
                                            task: "Avaliar ferramentas de comunicação",
                                            owner: "TI",
                                          },
                                          {
                                            task: "Definir estratégia de comunicação",
                                            owner: "Comunicação",
                                          },
                                        ],
                                      },
                                      {
                                        id: 2,
                                        recommendation:
                                          "Reduzir Processos Burocráticos",
                                        severity: "high",
                                        stakeholders: [
                                          "Operações",
                                          "Processos",
                                        ],
                                        tasks: [
                                          {
                                            task: "Mapear processos atuais",
                                            owner: "Processos",
                                          },
                                          {
                                            task: "Priorizar processos",
                                            owner: "Liderança",
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                },
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QUESTÕES */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-xl">
                      Questões (Responses Section)
                    </h3>
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 mb-4">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        <strong>Importante:</strong> As questões{" "}
                        <strong>não possuem</strong> um campo{" "}
                        <code>components</code> no JSON. Os componentes são{" "}
                        <strong>gerados automaticamente</strong> baseados no{" "}
                        <code>questionType</code> usando templates
                        pré-definidos. Cada tipo de questão sempre renderiza os
                        mesmos componentes na mesma ordem.
                      </p>
                    </div>

                    {/* Questão NPS */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">Questão NPS</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Componentes gerados automaticamente:{" "}
                        <code>npsScoreCard</code>, <code>npsStackedChart</code>
                      </p>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            JSON necessário:
                          </p>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <pre className="text-xs overflow-x-auto">
                              <code>
                                {JSON.stringify(
                                  {
                                    question: {
                                      id: 1,
                                      index: 1,
                                      questionType: "nps",
                                      question:
                                        "Em uma escala de 0 a 10, qual a probabilidade de você recomendar nossa empresa?",
                                      summary:
                                        "O NPS organizacional é de 35 pontos, indicando uma base sólida de promotores.",
                                      data: {
                                        npsScore: 35,
                                        npsCategory: "Bom",
                                        npsStackedChart: [
                                          {
                                            option: "Promotor",
                                            value: 493,
                                            percentage: 58,
                                          },
                                          {
                                            option: "Neutro",
                                            value: 170,
                                            percentage: 20,
                                          },
                                          {
                                            option: "Detrator",
                                            value: 187,
                                            percentage: 22,
                                          },
                                        ],
                                      },
                                    },
                                  },
                                  null,
                                  2,
                                )}
                              </code>
                            </pre>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Renderizado:</p>
                          <div className="border rounded-lg p-4 bg-background space-y-4">
                            {renderComponentExampleWithData(
                              "npsScoreCard",
                              {
                                type: "npsScoreCard",
                                index: 0,
                                dataPath: "question.data",
                                config: {},
                              },
                              {
                                ...realData,
                                question: {
                                  data: {
                                    npsScore: 35,
                                    npsCategory: "Bom",
                                    npsStackedChart: [
                                      {
                                        option: "Promotor",
                                        value: 493,
                                        percentage: 58,
                                      },
                                      {
                                        option: "Neutro",
                                        value: 170,
                                        percentage: 20,
                                      },
                                      {
                                        option: "Detrator",
                                        value: 187,
                                        percentage: 22,
                                      },
                                    ],
                                  },
                                },
                              },
                            )}
                            {renderComponentExampleWithData(
                              "npsStackedChart",
                              {
                                type: "npsStackedChart",
                                index: 1,
                                dataPath: "question.data.npsStackedChart",
                                config: {},
                              },
                              {
                                ...realData,
                                question: {
                                  data: {
                                    npsScore: 35,
                                    npsCategory: "Bom",
                                    npsStackedChart: [
                                      {
                                        option: "Promotor",
                                        value: 493,
                                        percentage: 58,
                                      },
                                      {
                                        option: "Neutro",
                                        value: 170,
                                        percentage: 20,
                                      },
                                      {
                                        option: "Detrator",
                                        value: 187,
                                        percentage: 22,
                                      },
                                    ],
                                  },
                                },
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Questão Multiple Choice */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">
                        Questão Multiple Choice
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Componente gerado automaticamente: <code>barChart</code>
                      </p>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            JSON necessário:
                          </p>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <pre className="text-xs overflow-x-auto">
                              <code>
                                {JSON.stringify(
                                  {
                                    question: {
                                      id: 2,
                                      index: 2,
                                      questionType: "multiple-choice",
                                      question:
                                        "Como você avalia o equilíbrio entre vida pessoal e profissional?",
                                      summary:
                                        "A maioria dos funcionários (52%) avalia o equilíbrio como bom ou muito bom.",
                                      data: {
                                        barChart: [
                                          {
                                            option: "Muito bom",
                                            value: 221,
                                            percentage: 26,
                                          },
                                          {
                                            option: "Bom",
                                            value: 221,
                                            percentage: 26,
                                          },
                                          {
                                            option: "Regular",
                                            value: 238,
                                            percentage: 28,
                                          },
                                          {
                                            option: "Ruim",
                                            value: 136,
                                            percentage: 16,
                                          },
                                          {
                                            option: "Muito ruim",
                                            value: 34,
                                            percentage: 4,
                                          },
                                        ],
                                      },
                                    },
                                  },
                                  null,
                                  2,
                                )}
                              </code>
                            </pre>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Renderizado:</p>
                          <div className="border rounded-lg p-4 bg-background min-h-[200px]">
                            {renderComponentExampleWithData(
                              "barChart",
                              {
                                type: "barChart",
                                index: 0,
                                dataPath: "question.data.barChart",
                                config: {
                                  dataKey: "percentage",
                                  yAxisDataKey: "option",
                                },
                              },
                              {
                                ...realData,
                                question: {
                                  data: {
                                    barChart: [
                                      {
                                        option: "Muito bom",
                                        value: 221,
                                        percentage: 26,
                                      },
                                      {
                                        option: "Bom",
                                        value: 221,
                                        percentage: 26,
                                      },
                                      {
                                        option: "Regular",
                                        value: 238,
                                        percentage: 28,
                                      },
                                      {
                                        option: "Ruim",
                                        value: 136,
                                        percentage: 16,
                                      },
                                      {
                                        option: "Muito ruim",
                                        value: 34,
                                        percentage: 4,
                                      },
                                    ],
                                  },
                                },
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Questão Open-Ended */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">
                        Questão Open-Ended
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Componentes gerados automaticamente:{" "}
                        <code>sentimentStackedChart</code>,{" "}
                        <code>topCategoriesCards</code>, <code>wordCloud</code>
                      </p>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            JSON necessário:
                          </p>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <pre className="text-xs overflow-x-auto">
                              <code>
                                {JSON.stringify(
                                  {
                                    question: {
                                      id: 4,
                                      index: 4,
                                      questionType: "open-ended",
                                      question:
                                        "O que você mais valoriza na empresa?",
                                      summary:
                                        "As respostas abertas destacam trabalho em equipe, oportunidades de desenvolvimento e flexibilidade como os principais valores.",
                                      data: {
                                        sentimentStackedChart: [
                                          {
                                            category: "Trabalho em Equipe",
                                            positive: 72.3,
                                            neutral: 18.5,
                                            negative: 9.2,
                                          },
                                          {
                                            category:
                                              "Desenvolvimento Profissional",
                                            positive: 68.1,
                                            neutral: 22.4,
                                            negative: 9.5,
                                          },
                                          {
                                            category: "Flexibilidade",
                                            positive: 65.2,
                                            neutral: 25.8,
                                            negative: 9.0,
                                          },
                                        ],
                                        topCategoriesCards: [
                                          {
                                            rank: 1,
                                            category: "Trabalho em Equipe",
                                            mentions: 425,
                                            percentage: 100,
                                            topics: [
                                              {
                                                topic: "colaboração eficiente",
                                                sentiment: "positive",
                                              },
                                              {
                                                topic: "ambiente colaborativo",
                                                sentiment: "positive",
                                              },
                                              {
                                                topic: "suporte entre colegas",
                                                sentiment: "positive",
                                              },
                                            ],
                                          },
                                          {
                                            rank: 2,
                                            category:
                                              "Desenvolvimento Profissional",
                                            mentions: 312,
                                            percentage: 73,
                                            topics: [
                                              {
                                                topic:
                                                  "oportunidades de crescimento",
                                                sentiment: "positive",
                                              },
                                              {
                                                topic:
                                                  "treinamentos relevantes",
                                                sentiment: "positive",
                                              },
                                              {
                                                topic: "mentoria",
                                                sentiment: "positive",
                                              },
                                            ],
                                          },
                                          {
                                            rank: 3,
                                            category: "Flexibilidade",
                                            mentions: 285,
                                            percentage: 67,
                                            topics: [
                                              {
                                                topic: "horário flexível",
                                                sentiment: "positive",
                                              },
                                              {
                                                topic: "trabalho remoto",
                                                sentiment: "positive",
                                              },
                                              {
                                                topic: "autonomia",
                                                sentiment: "positive",
                                              },
                                            ],
                                          },
                                        ],
                                        wordCloud: [
                                          { text: "equipe", value: 425 },
                                          {
                                            text: "desenvolvimento",
                                            value: 312,
                                          },
                                          { text: "flexibilidade", value: 285 },
                                          { text: "colaboração", value: 198 },
                                          { text: "crescimento", value: 156 },
                                        ],
                                      },
                                    },
                                  },
                                  null,
                                  2,
                                )}
                              </code>
                            </pre>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Renderizado:</p>
                          <div className="border rounded-lg p-4 bg-background space-y-4">
                            {renderComponentExampleWithData(
                              "sentimentStackedChart",
                              {
                                type: "sentimentStackedChart",
                                index: 0,
                                dataPath: "question.data.sentimentStackedChart",
                                config: {},
                              },
                              {
                                ...realData,
                                question: {
                                  data: {
                                    sentimentStackedChart: [
                                      {
                                        category: "Trabalho em Equipe",
                                        positive: 72.3,
                                        neutral: 18.5,
                                        negative: 9.2,
                                      },
                                      {
                                        category:
                                          "Desenvolvimento Profissional",
                                        positive: 68.1,
                                        neutral: 22.4,
                                        negative: 9.5,
                                      },
                                      {
                                        category: "Flexibilidade",
                                        positive: 65.2,
                                        neutral: 25.8,
                                        negative: 9.0,
                                      },
                                    ],
                                    topCategoriesCards: [
                                      {
                                        rank: 1,
                                        category: "Trabalho em Equipe",
                                        mentions: 425,
                                        percentage: 100,
                                        topics: [
                                          {
                                            topic: "colaboração eficiente",
                                            sentiment: "positive",
                                          },
                                          {
                                            topic: "ambiente colaborativo",
                                            sentiment: "positive",
                                          },
                                          {
                                            topic: "suporte entre colegas",
                                            sentiment: "positive",
                                          },
                                        ],
                                      },
                                      {
                                        rank: 2,
                                        category:
                                          "Desenvolvimento Profissional",
                                        mentions: 312,
                                        percentage: 73,
                                        topics: [
                                          {
                                            topic:
                                              "oportunidades de crescimento",
                                            sentiment: "positive",
                                          },
                                          {
                                            topic: "treinamentos relevantes",
                                            sentiment: "positive",
                                          },
                                          {
                                            topic: "mentoria",
                                            sentiment: "positive",
                                          },
                                        ],
                                      },
                                      {
                                        rank: 3,
                                        category: "Flexibilidade",
                                        mentions: 285,
                                        percentage: 67,
                                        topics: [
                                          {
                                            topic: "horário flexível",
                                            sentiment: "positive",
                                          },
                                          {
                                            topic: "trabalho remoto",
                                            sentiment: "positive",
                                          },
                                          {
                                            topic: "autonomia",
                                            sentiment: "positive",
                                          },
                                        ],
                                      },
                                    ],
                                    wordCloud: [
                                      { text: "equipe", value: 425 },
                                      { text: "desenvolvimento", value: 312 },
                                      { text: "flexibilidade", value: 285 },
                                      { text: "colaboração", value: 198 },
                                      { text: "crescimento", value: 156 },
                                    ],
                                  },
                                },
                              },
                            )}
                            {renderComponentExampleWithData(
                              "topCategoriesCards",
                              {
                                type: "topCategoriesCards",
                                index: 1,
                                dataPath: "question.data.topCategoriesCards",
                                config: { title: "Top 3 Categorias" },
                              },
                              {
                                ...realData,
                                question: {
                                  data: {
                                    topCategoriesCards: [
                                      {
                                        rank: 1,
                                        category: "Trabalho em Equipe",
                                        mentions: 425,
                                        percentage: 100,
                                        topics: [
                                          {
                                            topic: "colaboração eficiente",
                                            sentiment: "positive",
                                          },
                                          {
                                            topic: "ambiente colaborativo",
                                            sentiment: "positive",
                                          },
                                          {
                                            topic: "suporte entre colegas",
                                            sentiment: "positive",
                                          },
                                        ],
                                      },
                                      {
                                        rank: 2,
                                        category:
                                          "Desenvolvimento Profissional",
                                        mentions: 312,
                                        percentage: 73,
                                        topics: [
                                          {
                                            topic:
                                              "oportunidades de crescimento",
                                            sentiment: "positive",
                                          },
                                          {
                                            topic: "treinamentos relevantes",
                                            sentiment: "positive",
                                          },
                                          {
                                            topic: "mentoria",
                                            sentiment: "positive",
                                          },
                                        ],
                                      },
                                      {
                                        rank: 3,
                                        category: "Flexibilidade",
                                        mentions: 285,
                                        percentage: 67,
                                        topics: [
                                          {
                                            topic: "horário flexível",
                                            sentiment: "positive",
                                          },
                                          {
                                            topic: "trabalho remoto",
                                            sentiment: "positive",
                                          },
                                          {
                                            topic: "autonomia",
                                            sentiment: "positive",
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                },
                              },
                            )}
                            {renderComponentExampleWithData(
                              "wordCloud",
                              {
                                type: "wordCloud",
                                index: 2,
                                dataPath: "question.data.wordCloud",
                                config: { title: "Nuvem de Palavras" },
                              },
                              {
                                ...realData,
                                question: {
                                  data: {
                                    wordCloud: [
                                      { text: "equipe", value: 425 },
                                      { text: "desenvolvimento", value: 312 },
                                      { text: "flexibilidade", value: 285 },
                                      { text: "colaboração", value: 198 },
                                      { text: "crescimento", value: 156 },
                                    ],
                                  },
                                },
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                    ),
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
                                `card-${name}`,
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
