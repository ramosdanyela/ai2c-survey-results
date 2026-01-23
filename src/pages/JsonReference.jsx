import { useState, useMemo } from "react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Check, ChevronRight, ChevronDown, BookOpen, Code, Layout, Palette } from "lucide-react";
import { Table as TableIcon } from "@/lib/icons";
import { componentRegistry, renderComponent } from "@/components/survey/common/ComponentRegistry";
import { cardVariants, cardContentVariants, cardTitleVariants } from "@/styles/variants";
import { enrichComponentWithStyles } from "@/services/styleResolver";
import surveyDataJson from "@/data/surveyData.json";

/**
 * Página de Referência do JSON Schema
 * Documenta todos os campos, estruturas e componentes disponíveis
 */
export default function JsonReference() {
  const [copiedCode, setCopiedCode] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Estrutura básica do JSON
  const basicStructure = {
    metadata: {
      version: "string",
      language: "string",
      surveyId: "string"
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
            components: []
          }
        ],
        data: {
          // Dados específicos da seção
        }
      }
    ],
    uiTexts: {
      // Textos traduzíveis
    }
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
      "waterfallChart"
    ],
    Cards: [
      "card",
      "npsScoreCard",
      "topCategoriesCards",
      "kpiCard"
    ],
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
      "analyticalTable"
    ],
    Widgets: [
      "questionsList",
      "filterPills",
      "wordCloud",
      "accordion"
    ],
    Containers: [
      "container",
      "grid-container"
    ]
  };

  // Exemplos de cards
  const cardExamples = {
    basic: {
      type: "card",
      index: 0,
      title: "Título do Card",
      text: "Texto do card com suporte a quebras de linha.\nSegunda linha.",
      cardStyleVariant: "default"
    },
    withDescription: {
      type: "card",
      index: 0,
      useDescription: true,
      text: "Texto usando CardDescription component",
      cardStyleVariant: "default",
      cardContentVariant: "with-description"
    },
    borderLeft: {
      type: "card",
      index: 0,
      title: "Card com Borda",
      text: "Card com borda laranja à esquerda",
      cardStyleVariant: "border-left"
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
          config: {}
        }
      ]
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
          dataPath: "sectionData.recommendationsTable"
        }
      ]
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
          dataPath: "sectionData.data"
        }
      ]
    }
  };

  // StyleVariants disponíveis
  const cardStyleVariants = Object.keys(cardVariants);
  const cardContentVariantsList = Object.keys(cardContentVariants);
  const titleStyleVariants = Object.keys(cardTitleVariants);

  // Usa dados reais do surveyData.json
  // Prepara os dados no formato esperado pelos componentes
  const attributesSection = surveyDataJson.sections?.find(s => s.id === "attributes");
  
  // Garante que sectionData existe e tem a estrutura correta
  const sectionData = attributesSection?.data || {};
  
  const realData = {
    ...surveyDataJson,
    sectionData: sectionData,
    surveyInfo: {
      ...(surveyDataJson.metadata || {}),
      totalRespondents: surveyDataJson.metadata?.totalRespondents || 850,
      nps: surveyDataJson.metadata?.nps || 35,
      npsCategory: surveyDataJson.metadata?.npsCategory || "Bom"
    },
    uiTexts: surveyDataJson.uiTexts || {},
    // Garante que não há valores undefined que possam causar problemas
    _filterPillsState: null
  };

  // Funções para extrair dados reais do JSON
  const extractSectionData = useMemo(() => {
    const sections = surveyDataJson.sections || [];
    
    return {
      ids: [...new Set(sections.map(s => s.id).filter(Boolean))],
      indexes: [...new Set(sections.map(s => s.index).filter(v => v !== undefined && v !== null))].sort((a, b) => a - b),
      names: [...new Set(sections.map(s => s.name).filter(Boolean))],
      icons: [...new Set(sections.map(s => s.icon).filter(Boolean))],
    };
  }, []);

  const extractSubsectionData = useMemo(() => {
    const sections = surveyDataJson.sections || [];
    const allSubsections = [];
    
    sections.forEach(section => {
      if (section.subsections && Array.isArray(section.subsections)) {
        allSubsections.push(...section.subsections);
      }
    });
    
    return {
      ids: [...new Set(allSubsections.map(s => s.id).filter(Boolean))],
      indexes: [...new Set(allSubsections.map(s => s.index).filter(v => v !== undefined && v !== null))].sort((a, b) => a - b),
      names: [...new Set(allSubsections.map(s => s.name).filter(Boolean))],
      icons: [...new Set(allSubsections.map(s => s.icon).filter(Boolean))],
    };
  }, []);

  const extractComponentData = useMemo(() => {
    const sections = surveyDataJson.sections || [];
    const allComponents = [];
    
    function collectComponents(items) {
      if (!Array.isArray(items)) return;
      
      items.forEach(item => {
        if (item.type) {
          allComponents.push(item);
        }
        if (item.components && Array.isArray(item.components)) {
          collectComponents(item.components);
        }
      });
    }
    
    sections.forEach(section => {
      if (section.components) {
        collectComponents(section.components);
      }
      if (section.subsections) {
        section.subsections.forEach(subsection => {
          if (subsection.components) {
            collectComponents(subsection.components);
          }
        });
      }
    });
    
    const types = [...new Set(allComponents.map(c => c.type).filter(Boolean))];
    const indexes = [...new Set(allComponents.map(c => c.index).filter(v => v !== undefined && v !== null))].sort((a, b) => a - b);
    const cardStyleVariants = [...new Set(allComponents.map(c => c.cardStyleVariant).filter(Boolean))];
    const cardContentVariantsList = [...new Set(allComponents.map(c => c.cardContentVariant).filter(Boolean))];
    const useDescription = [...new Set(allComponents.map(c => c.useDescription).filter(v => v !== undefined))];
    const titles = [...new Set(allComponents.map(c => c.title).filter(v => v !== undefined && v !== null))];
    const texts = allComponents
      .map(c => c.text)
      .filter(v => v !== undefined && v !== null)
      .slice(0, 5); // Limita a 5 exemplos
    const dataPaths = [...new Set(allComponents.map(c => c.dataPath).filter(Boolean))];
    
    // Categorizar tipos
    const typeCategories = {
      Cards: types.filter(t => ['card', 'npsScoreCard', 'topCategoriesCards', 'kpiCard'].includes(t)),
      Containers: types.filter(t => ['container', 'grid-container'].includes(t)),
      Charts: types.filter(t => t.includes('Chart') || t.includes('Plot') || t.includes('Diagram') || t.includes('Graph') || t.includes('Scorecard')),
      Tables: types.filter(t => t.includes('Table')),
      Headers: types.filter(t => ['h3', 'h4'].includes(t)),
      Widgets: types.filter(t => ['questionsList', 'filterPills', 'wordCloud', 'accordion'].includes(t)),
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
  }, []);

  const extractConfigData = useMemo(() => {
    const sections = surveyDataJson.sections || [];
    const allConfigs = [];
    
    function collectConfigs(items) {
      if (!Array.isArray(items)) return;
      
      items.forEach(item => {
        if (item.config && typeof item.config === 'object') {
          allConfigs.push(item.config);
        }
        if (item.components && Array.isArray(item.components)) {
          collectConfigs(item.components);
        }
      });
    }
    
    sections.forEach(section => {
      if (section.components) {
        collectConfigs(section.components);
      }
      if (section.subsections) {
        section.subsections.forEach(subsection => {
          if (subsection.components) {
            collectConfigs(subsection.components);
          }
        });
      }
    });
    
    const yAxisDataKeys = [...new Set(allConfigs.map(c => c.yAxisDataKey).filter(Boolean))];
    const dataKeys = [...new Set(allConfigs.map(c => c.dataKey).filter(Boolean))];
    return {
      yAxisDataKeys,
      dataKeys,
      hasEmptyConfig: allConfigs.some(c => Object.keys(c).length === 0),
    };
  }, []);

  // Função para renderizar exemplo de componente
  const renderComponentExample = (componentType, exampleConfig = {}) => {
    try {
      // Containers são tratados de forma especial
      if (componentType === "container" || componentType === "grid-container") {
        const component = {
          type: componentType,
          index: 0,
          ...exampleConfig
        };
        
        if (componentType === "container") {
          const nested = (component.components || []).map((comp, idx) => {
            try {
              const nestedComponent = enrichComponentWithStyles(comp);
              const NestedComponent = componentRegistry[comp.type];
              if (NestedComponent) {
                const rendered = renderComponent(nestedComponent, realData, {});
                // Verifica se é um elemento React válido
                if (rendered === null || rendered === undefined) {
                  return null;
                }
                if (React.isValidElement(rendered)) {
                  return (
                    <div key={idx}>
                      {rendered}
                    </div>
                  );
                }
                // Se não for válido, loga e retorna null
                console.warn(`Componente aninhado ${comp.type} retornou valor inválido:`, rendered, typeof rendered);
                return null;
              }
            } catch (err) {
              console.error(`Erro ao renderizar componente aninhado ${comp.type}:`, err);
            }
            return null;
          }).filter(item => {
            // Remove null, undefined, e objetos inválidos
            if (item === null || item === undefined) return false;
            if (React.isValidElement(item)) return true;
            // Se for um objeto que não é um elemento React válido, remove
            if (typeof item === 'object' && !React.isValidElement(item)) {
              console.warn("Removendo objeto inválido do array nested:", item);
              return false;
            }
            // Valores primitivos válidos (string, number, boolean)
            return typeof item !== 'object';
          });
          
          return (
            <div className="grid gap-6 md:grid-cols-2">
              {nested}
            </div>
          );
        }
        
        if (componentType === "grid-container") {
          const className = component.className || "grid gap-6 md:grid-cols-2";
          const nested = (component.components || []).map((comp, idx) => {
            try {
              const nestedComponent = enrichComponentWithStyles(comp);
              const NestedComponent = componentRegistry[comp.type];
              if (NestedComponent) {
                const rendered = renderComponent(nestedComponent, realData, {});
                // Verifica se é um elemento React válido
                if (rendered === null || rendered === undefined) {
                  return null;
                }
                if (React.isValidElement(rendered)) {
                  return (
                    <div key={idx}>
                      {rendered}
                    </div>
                  );
                }
                // Se não for válido, loga e retorna null
                console.warn(`Componente aninhado ${comp.type} retornou valor inválido:`, rendered, typeof rendered);
                return null;
              }
            } catch (err) {
              console.error(`Erro ao renderizar componente aninhado ${comp.type}:`, err);
            }
            return null;
          }).filter(item => {
            // Remove null, undefined, e objetos inválidos
            if (item === null || item === undefined) return false;
            if (React.isValidElement(item)) return true;
            // Se for um objeto que não é um elemento React válido, remove
            if (typeof item === 'object' && !React.isValidElement(item)) {
              console.warn("Removendo objeto inválido do array nested:", item);
              return false;
            }
            // Valores primitivos válidos (string, number, boolean)
            return typeof item !== 'object';
          });
          
          return (
            <div className={className}>
              {nested}
            </div>
          );
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
        ...exampleConfig
      };

      let enrichedComponent = enrichComponentWithStyles(component);
      
      // Validação adicional: garante que enrichedComponent não tenha valores problemáticos
      if (enrichedComponent && typeof enrichedComponent === 'object') {
        // Remove qualquer propriedade que seja um objeto vazio que possa causar problemas
        const cleanedComponent = { ...enrichedComponent };
        Object.keys(cleanedComponent).forEach(key => {
          if (cleanedComponent[key] && typeof cleanedComponent[key] === 'object' && 
              !Array.isArray(cleanedComponent[key]) && 
              Object.keys(cleanedComponent[key]).length === 0) {
            // Mantém objetos vazios em config, mas garante que não sejam undefined
            if (key !== 'config') {
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
      console.warn(`Componente ${componentType} retornou valor inválido:`, rendered, "Tipo:", typeof rendered);
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
      cardStyleVariant: "default"
    },
    barChart: {
      type: "barChart",
      index: 0,
      dataPath: "sectionData.data",
      config: {
        dataKey: "percentage",
        yAxisDataKey: "label"
      }
    },
    sentimentStackedChart: {
      type: "sentimentStackedChart",
      index: 0,
      dataPath: "sectionData.sentiment",
      config: {
        yAxisDataKey: "segment"
      }
    },
    distributionTable: {
      type: "distributionTable",
      index: 0,
      dataPath: "sectionData.distribution"
    },
    sentimentTable: {
      type: "sentimentTable",
      index: 0,
      dataPath: "sectionData.sentiment"
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
          cardStyleVariant: "default"
        },
        {
          type: "card",
          index: 1,
          title: "Card 2",
          text: "Segundo card no container",
          cardStyleVariant: "default"
        }
      ]
    }
  };

  // Error Boundary wrapper para capturar erros de renderização
  const SafeRender = ({ children }) => {
    try {
      // Garante que children não contém objetos inválidos
      const safeChildren = React.Children.toArray(children).map((child, index) => {
        if (child === null || child === undefined) {
          return null;
        }
        if (React.isValidElement(child)) {
          return child;
        }
        // Se for um objeto JavaScript que não é um elemento React válido
        if (typeof child === 'object' && !React.isValidElement(child)) {
          console.warn(`SafeRender: Tentando renderizar objeto inválido no índice ${index}:`, child, "Tipo:", typeof child);
          return null;
        }
        // Se for um valor primitivo válido (string, number, boolean)
        if (typeof child !== 'object') {
          return child;
        }
        // Se chegou aqui, é um objeto inválido
        console.warn(`SafeRender: Valor inválido no índice ${index}:`, child);
        return null;
      });
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
                Referência completa de todos os campos, estruturas e componentes disponíveis no JSON
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <SafeRender>
      <Tabs defaultValue="structure" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="structure">
            <Code className="w-4 h-4 mr-2" />
            Estrutura
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
          <TabsTrigger value="fields">
            <Code className="w-4 h-4 mr-2" />
            Campos
          </TabsTrigger>
          <TabsTrigger value="tables">
            <TableIcon className="w-4 h-4 mr-2" />
            Tabelas
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
                  <h3 className="font-semibold text-lg">Campos Principais:</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <Badge variant="outline" className="mt-1">metadata</Badge>
                      <div className="flex-1">
                        <p className="font-medium">Metadados da Pesquisa</p>
                        <p className="text-sm text-muted-foreground">
                          Informações sobre versão, idioma e ID da pesquisa
                        </p>
                        <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
                          <li><code>version</code>: Versão do schema (ex: "1.0")</li>
                          <li><code>language</code>: Idioma (ex: "pt-BR")</li>
                          <li><code>surveyId</code>: ID único da pesquisa</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <Badge variant="outline" className="mt-1">sections</Badge>
                      <div className="flex-1">
                        <p className="font-medium">Array de Seções</p>
                        <p className="text-sm text-muted-foreground">
                          Cada seção representa uma parte do relatório
                        </p>
                        <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
                          <li><code>id</code>: Identificador único (string)</li>
                          <li><code>index</code>: Ordem de exibição (number)</li>
                          <li><code>name</code>: Nome exibido (string)</li>
                          <li><code>icon</code>: Nome do ícone (string)</li>
                          <li><code>subsections</code>: Array de subseções (opcional)</li>
                          <li><code>data</code>: Dados específicos da seção</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <Badge variant="outline" className="mt-1">subsections</Badge>
                      <div className="flex-1">
                        <p className="font-medium">Subseções</p>
                        <p className="text-sm text-muted-foreground">
                          Divisões dentro de uma seção
                        </p>
                        <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
                          <li><code>id</code>: Identificador único (string)</li>
                          <li><code>index</code>: Ordem de exibição (number)</li>
                          <li><code>name</code>: Nome exibido (string)</li>
                          <li><code>icon</code>: Nome do ícone (string)</li>
                          <li><code>components</code>: Array de componentes a renderizar</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <Badge variant="outline" className="mt-1">components</Badge>
                      <div className="flex-1">
                        <p className="font-medium">Componentes</p>
                        <p className="text-sm text-muted-foreground">
                          Elementos renderizáveis (cards, gráficos, tabelas, etc.)
                        </p>
                        <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
                          <li><code>type</code>: Tipo do componente (obrigatório)</li>
                          <li><code>index</code>: Ordem de renderização (number)</li>
                          <li><code>dataPath</code>: Caminho para os dados (string)</li>
                          <li><code>config</code>: Configurações específicas (object)</li>
                          <li><code>components</code>: Componentes aninhados (array, opcional)</li>
                        </ul>
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
                {Object.entries(componentCategories).map(([category, components]) => (
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
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Exemplos Renderizados dos Principais Componentes */}
          <Card>
            <CardHeader>
              <CardTitle>Exemplos Renderizados</CardTitle>
              <CardDescription>
                Veja como os componentes aparecem quando renderizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Card Example */}
                {componentExamples.card && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Card</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">JSON:</p>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <pre className="text-xs overflow-x-auto">
                            <code>{JSON.stringify(componentExamples.card, null, 2)}</code>
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Renderizado:</p>
                        <div className="border rounded-lg p-4 bg-background">
                          {renderComponentExample("card", componentExamples.card)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* BarChart Example */}
                {componentExamples.barChart && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">BarChart</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">JSON:</p>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <pre className="text-xs overflow-x-auto">
                            <code>{JSON.stringify(componentExamples.barChart, null, 2)}</code>
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Renderizado:</p>
                        <div className="border rounded-lg p-4 bg-background">
                          {renderComponentExample("barChart", componentExamples.barChart)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SentimentStackedChart Example */}
                {componentExamples.sentimentStackedChart && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">SentimentStackedChart</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">JSON:</p>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <pre className="text-xs overflow-x-auto">
                            <code>{JSON.stringify(componentExamples.sentimentStackedChart, null, 2)}</code>
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Renderizado:</p>
                        <div className="border rounded-lg p-4 bg-background">
                          {renderComponentExample("sentimentStackedChart", componentExamples.sentimentStackedChart)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* DistributionTable Example */}
                {componentExamples.distributionTable && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">DistributionTable</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">JSON:</p>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <pre className="text-xs overflow-x-auto">
                            <code>{JSON.stringify(componentExamples.distributionTable, null, 2)}</code>
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Renderizado:</p>
                        <div className="border rounded-lg p-4 bg-background">
                          {renderComponentExample("distributionTable", componentExamples.distributionTable)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Container Example */}
                {componentExamples.container && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Container</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">JSON:</p>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <pre className="text-xs overflow-x-auto">
                            <code>{JSON.stringify(componentExamples.container, null, 2)}</code>
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Renderizado:</p>
                        <div className="border rounded-lg p-4 bg-background">
                          {renderComponentExample("container", componentExamples.container)}
                        </div>
                      </div>
                    </div>
                  </div>
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
                          onClick={() => copyToClipboard(JSON.stringify(example, null, 2), `card-${name}`)}
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
                          <p className="text-sm font-medium">Estrutura JSON:</p>
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
                            <li>Usa <code>CardDescription</code> component</li>
                          )}
                          {example.cardStyleVariant && (
                            <li>CardStyleVariant: <code>{example.cardStyleVariant}</code></li>
                          )}
                          {example.cardContentVariant && (
                            <li>CardContentVariant: <code>{example.cardContentVariant}</code></li>
                          )}
                          {example.components && (
                            <li>Contém {example.components.length} componente(s) aninhado(s)</li>
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
                Todas as opções de cardStyleVariant, cardContentVariant e titleStyleVariant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* StyleVariants */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">cardStyleVariant (Card)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cardStyleVariants.map((variant) => (
                      <Card key={variant} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <code className="text-sm font-mono font-semibold">{variant}</code>
                            <Badge variant="outline">Card</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Classes: <code className="text-xs">{cardVariants[variant]}</code>
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* TextStyleVariants */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">cardContentVariant (CardContent)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cardContentVariantsList.map((variant) => (
                      <Card key={variant} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <code className="text-sm font-mono font-semibold">{variant}</code>
                            <Badge variant="outline">Content</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Classes: <code className="text-xs">{cardContentVariants[variant]}</code>
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* TitleStyleVariants */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">titleStyleVariant (CardTitle)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {titleStyleVariants.map((variant) => (
                      <Card key={variant} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <code className="text-sm font-mono font-semibold">{variant}</code>
                            <Badge variant="outline">Title</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Classes: <code className="text-xs">{cardTitleVariants[variant]}</code>
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
                  <h3 className="font-semibold text-lg">Campos Comuns de Componentes</h3>
                  <div className="space-y-2">
                    {[
                      { name: "type", required: true, type: "string", desc: "Tipo do componente (obrigatório)" },
                      { name: "index", required: false, type: "number", desc: "Ordem de renderização" },
                      { name: "dataPath", required: false, type: "string", desc: "Caminho para os dados (ex: 'sectionData.data')" },
                      { name: "config", required: false, type: "object", desc: "Configurações específicas do componente" },
                      { name: "title", required: false, type: "string", desc: "Título (suporta templates {{...}})" },
                      { name: "text", required: false, type: "string", desc: "Texto (suporta templates e \\n para quebras)" },
                      { name: "cardStyleVariant", required: false, type: "string", desc: "Variante de estilo do card" },
                      { name: "cardContentVariant", required: false, type: "string", desc: "Variante de estilo do conteúdo" },
                      { name: "titleStyleVariant", required: false, type: "string", desc: "Variante de estilo do título" },
                      { name: "useDescription", required: false, type: "boolean", desc: "Usar CardDescription ao invés de div" },
                      { name: "components", required: false, type: "array", desc: "Componentes aninhados" },
                      { name: "className", required: false, type: "string", desc: "Classes CSS customizadas" },
                    ].map((field) => (
                      <div key={field.name} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="flex flex-col gap-1 min-w-[120px]">
                          <code className="text-sm font-mono font-semibold">{field.name}</code>
                          {field.required && (
                            <Badge variant="destructive" className="text-xs w-fit">Obrigatório</Badge>
                          )}
                          {!field.required && (
                            <Badge variant="outline" className="text-xs w-fit">Opcional</Badge>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">{field.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{field.desc}</p>
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
                      { name: "id", required: true, type: "string", desc: "Identificador único da seção" },
                      { name: "index", required: false, type: "number", desc: "Ordem de exibição" },
                      { name: "name", required: false, type: "string", desc: "Nome exibido da seção" },
                      { name: "icon", required: false, type: "string", desc: "Nome do ícone (lucide-react)" },
                      { name: "subsections", required: false, type: "array", desc: "Array de subseções" },
                      { name: "data", required: false, type: "object", desc: "Dados específicos da seção" },
                    ].map((field) => (
                      <div key={field.name} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="flex flex-col gap-1 min-w-[120px]">
                          <code className="text-sm font-mono font-semibold">{field.name}</code>
                          {field.required && (
                            <Badge variant="destructive" className="text-xs w-fit">Obrigatório</Badge>
                          )}
                          {!field.required && (
                            <Badge variant="outline" className="text-xs w-fit">Opcional</Badge>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">{field.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{field.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Templates */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Templates e DataPaths</h3>
                  <Card className="p-4">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium mb-2">Templates ({"{{...}}"})</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          Use <code className="bg-muted px-1 rounded">{`{{path}}`}</code> para referenciar dados ou textos:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                          <li><code>{"{{uiTexts.section.name}}"}</code> - Textos traduzíveis</li>
                          <li><code>{"{{sectionData.summary}}"}</code> - Dados da seção</li>
                          <li><code>{"{{data.field}}"}</code> - Dados do contexto</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">DataPaths</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          Caminhos para acessar dados:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                          <li><code>sectionData.field</code> - Dados da seção atual</li>
                          <li><code>sectionData.array[0]</code> - Primeiro item de array</li>
                          <li><code>uiTexts.path.to.text</code> - Textos traduzíveis</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
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
                      <TableCell><code>id</code></TableCell>
                      <TableCell><Badge variant="secondary">string</Badge></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {extractSectionData.ids.map(id => (
                            <Badge key={id} variant="outline">{id}</Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>index</code></TableCell>
                      <TableCell><Badge variant="secondary">number</Badge></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {extractSectionData.indexes.map(idx => (
                            <Badge key={idx} variant="outline">{idx}</Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>name</code></TableCell>
                      <TableCell><Badge variant="secondary">string</Badge></TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {extractSectionData.names.map(name => (
                            <div key={name}>"{name}"</div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>icon</code></TableCell>
                      <TableCell><Badge variant="secondary">string</Badge></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {extractSectionData.icons.map(icon => (
                            <Badge key={icon} variant="outline">{icon}</Badge>
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
                      <TableCell><code>id</code></TableCell>
                      <TableCell><Badge variant="secondary">string</Badge></TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                          {extractSubsectionData.ids.map(id => (
                            <div key={id}>{id}</div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>index</code></TableCell>
                      <TableCell><Badge variant="secondary">number</Badge></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {extractSubsectionData.indexes.map(idx => (
                            <Badge key={idx} variant="outline">{idx}</Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>name</code></TableCell>
                      <TableCell><Badge variant="secondary">string</Badge></TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                          {extractSubsectionData.names.map(name => (
                            <div key={name}>"{name}"</div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>icon</code></TableCell>
                      <TableCell><Badge variant="secondary">string</Badge></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {extractSubsectionData.icons.map(icon => (
                            <Badge key={icon} variant="outline">{icon}</Badge>
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
                      <TableCell><code>type</code></TableCell>
                      <TableCell><Badge variant="destructive">string (obrigatório)</Badge></TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {Object.entries(extractComponentData.typeCategories).map(([category, types]) => (
                            types.length > 0 && (
                              <div key={category}>
                                <Badge variant="secondary" className="mb-1">{category}:</Badge>
                                <div className="flex flex-wrap gap-1">
                                  {types.map(type => (
                                    <Badge key={type} variant="outline">{type}</Badge>
                                  ))}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>index</code></TableCell>
                      <TableCell><Badge variant="secondary">number</Badge></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {extractComponentData.indexes.map(idx => (
                            <Badge key={idx} variant="outline">{idx}</Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>cardStyleVariant</code></TableCell>
                      <TableCell><Badge variant="secondary">string</Badge></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {extractComponentData.cardStyleVariants.map(variant => (
                            <Badge key={variant} variant="outline">{variant}</Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>cardContentVariant</code></TableCell>
                      <TableCell><Badge variant="secondary">string</Badge></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {extractComponentData.cardContentVariantsList.map(variant => (
                            <Badge key={variant} variant="outline">{variant}</Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>useDescription</code></TableCell>
                      <TableCell><Badge variant="secondary">boolean</Badge></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {extractComponentData.useDescription.map(val => (
                            <Badge key={String(val)} variant="outline">{String(val)}</Badge>
                          ))}
                          {extractComponentData.useDescription.length === 0 && (
                            <Badge variant="outline">false (padrão quando omitido)</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>title</code></TableCell>
                      <TableCell><Badge variant="secondary">string</Badge></TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                          {extractComponentData.titles.length > 0 ? (
                            extractComponentData.titles.map((title, idx) => (
                              <div key={idx}>"{title === "" ? "(string vazia)" : title}"</div>
                            ))
                          ) : (
                            <div className="text-muted-foreground">Nenhum título encontrado</div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>text</code></TableCell>
                      <TableCell><Badge variant="secondary">string</Badge></TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                          {extractComponentData.texts.length > 0 ? (
                            extractComponentData.texts.map((text, idx) => (
                              <div key={idx} className="truncate">
                                {text === "" ? '"" (string vazia)' : `"${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`}
                              </div>
                            ))
                          ) : (
                            <div className="text-muted-foreground">Nenhum texto encontrado</div>
                          )}
                          <div className="text-xs text-muted-foreground italic mt-2">
                            Nota: Templates {"{{}}"} foram removidos. Use texto direto.
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>dataPath</code></TableCell>
                      <TableCell><Badge variant="secondary">string</Badge></TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                          {extractComponentData.dataPaths.map((path, idx) => (
                            <div key={idx}><code>{path}</code></div>
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
                      <TableCell><code>yAxisDataKey</code></TableCell>
                      <TableCell><Badge variant="secondary">string</Badge></TableCell>
                      <TableCell>
                        {extractConfigData.yAxisDataKeys.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {extractConfigData.yAxisDataKeys.map(key => (
                              <Badge key={key} variant="outline">{key}</Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Nenhum valor encontrado</div>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>dataKey</code></TableCell>
                      <TableCell><Badge variant="secondary">string</Badge></TableCell>
                      <TableCell>
                        {extractConfigData.dataKeys.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {extractConfigData.dataKeys.map(key => (
                              <Badge key={key} variant="outline">{key}</Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Nenhum valor encontrado</div>
                        )}
                      </TableCell>
                    </TableRow>
                    {extractConfigData.hasEmptyConfig && (
                      <TableRow>
                        <TableCell><code>config: {"{}"}</code></TableCell>
                        <TableCell><Badge variant="secondary">object</Badge></TableCell>
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
      </Tabs>
      </SafeRender>
    </div>
  );
}
