import React from "react";
import { Progress } from "@/components/ui/progress";
import { Award } from "@/lib/icons";
import {
  COLOR_ORANGE_PRIMARY,
  RGBA_ORANGE_SHADOW_15,
  RGBA_ORANGE_SHADOW_20,
  RGBA_BLACK_SHADOW_30,
} from "@/lib/colors";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { KPICard } from "../widgets/KPICard";
import { resolveDataPath } from "@/services/dataResolver";

/**
 * Render a card component based on schema
 * Usa cardStyleVariant do JSON para aplicar estilos do código
 */
export function SchemaCard({ component, data, children }) {
  // Use title and text directly (no template resolution needed)
  const title = component.title || "";
  const text = component.text || component.content || "";

  // Text resolution - silently handle empty text (expected in some cases)

  // Debug: log text resolution for flat cards
  if (component.cardStyleVariant === "flat" && component.text) {
    console.log("SchemaCard: Flat card text resolution", {
      original: component.text,
      resolved: text,
      hasText: text && text.trim() !== "",
      component: {
        type: component.type,
        cardStyleVariant: component.cardStyleVariant,
        cardContentVariant: component.cardContentVariant,
      },
    });
  }


  // Usa className do componente enriquecido (resolvido de cardStyleVariant)
  const styleClass = component.className || "card-elevated";

  // Build style object - adiciona cor da borda para variante border-left
  // Remove sombra para variante flat
  const styleObj = {};
  if (component.cardStyleVariant === "border-left") {
    styleObj.borderLeftColor = COLOR_ORANGE_PRIMARY;
  }
  const isFlat = component.cardStyleVariant === "flat";
  if (isFlat) {
    styleObj.boxShadow = "none";
  }

  const useDescription = component.useDescription === true;
  const ContentWrapper = useDescription ? CardDescription : "div";
  
  // Aplica cardContentVariant ao ContentWrapper (não ao CardContent)
  // O textClassName já contém o cardContentVariant resolvido (ex: "space-y-3" para "flat")
  const cardContentVariantClass = component.textClassName || "";
  
  // Base classes para o texto
  const baseTextClasses = useDescription
    ? "text-base leading-relaxed"
    : "text-muted-foreground font-normal leading-relaxed";
  
  // Combina base classes com cardContentVariant
  // Se cardContentVariant for "flat", já terá "space-y-3" do textClassName
  const textBaseClassName = `${baseTextClasses} ${cardContentVariantClass}`.trim();

  // If children are provided, render them instead of text
  const hasChildren = children && React.Children.count(children) > 0;
  const hasText = text && text.trim() !== "";

  // Text resolution - silently handle missing text (expected in some cases)

  // Usa className do componente enriquecido ou fallback
  const titleClassName =
    component.titleClassName || "text-xl font-bold text-card-foreground";
  const finalTextClassName = ""; // CardContent não precisa de className extra quando cardContentVariant é aplicado ao ContentWrapper

  // Handlers para desabilitar hover shadow quando for flat
  const handleMouseEnter = isFlat ? undefined : undefined; // Card component já gerencia
  const handleMouseLeave = isFlat ? undefined : undefined; // Card component já gerencia

  return (
    <Card
      className={styleClass}
      style={Object.keys(styleObj).length > 0 ? styleObj : undefined}
      onMouseEnter={isFlat ? (e) => { e.currentTarget.style.boxShadow = "none"; } : undefined}
      onMouseLeave={isFlat ? (e) => { e.currentTarget.style.boxShadow = "none"; } : undefined}
    >
      {title && (
        <CardHeader>
          <CardTitle className={titleClassName}>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={finalTextClassName}>
        {/* Render text first if it exists */}
        {hasText && (
          <ContentWrapper className={textBaseClassName.trim()}>
            {text.split("\n").map((line, index) => (
              <p key={index} className={line.trim() ? "" : "h-3"}>
                {line}
              </p>
            ))}
          </ContentWrapper>
        )}
        {/* Then render children if they exist */}
        {hasChildren && children}
      </CardContent>
    </Card>
  );
}

/**
 * Render an NPS score card component based on schema
 * All styling is hardcoded - no config needed
 */
export function SchemaNPSScoreCard({ component, data }) {
  const npsData = resolveDataPath(data, component.dataPath || "surveyInfo");
  const uiTexts = resolveDataPath(data, "uiTexts");

  // Use npsScore from question.data (as used in surveyData.json)
  const npsScore = npsData?.npsScore;
  const npsCategory = npsData?.npsCategory;

  if (npsScore === undefined || !uiTexts) {
    return null;
  }

  return (
    <div className="mb-6 flex justify-center">
      <div
        className="p-4 rounded-2xl highlight-container-light border-0 w-full max-w-md"
        style={{
          boxShadow: `0 4px 16px ${RGBA_ORANGE_SHADOW_15}`,
        }}
      >
        <div className="text-center mb-4">
          <div className="text-5xl font-bold text-foreground mb-2">
            {npsScore}
          </div>
          <div className="text-base font-semibold text-foreground mb-3">
            {uiTexts.responseDetails?.npsScore || "NPS Score"}
          </div>
          {/* Simple bar with score for quick visualization */}
          <Progress value={(npsScore + 100) / 2} className="h-3 mb-2" />
          {npsCategory && (
            <div className="inline-block px-3 py-1 rounded-full highlight-container text-base font-semibold">
              {npsCategory}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Render top categories cards component based on schema
 * All styling is hardcoded - no config needed
 */
export function SchemaTopCategoriesCards({ component, data }) {
  const categoriesData = resolveDataPath(data, component.dataPath);
  const uiTexts = resolveDataPath(data, "uiTexts");

  if (!categoriesData || !Array.isArray(categoriesData)) {
    return null;
  }

  const title = component.config?.title || uiTexts?.responseDetails?.top3Categories || "Top 3 Categories";

  return (
    <div className="mb-6">
      <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <Award className="w-4 h-4" style={{ color: COLOR_ORANGE_PRIMARY }} />
        {title ||
          uiTexts?.responseDetails?.top3Categories ||
          "Top 3 Categories"}
      </h4>
      <div className="grid md:grid-cols-3 gap-4">
        {categoriesData.map((cat) => {
          // Separate topics by sentiment
          const positiveTopics = (cat.topics || [])
            .map((topicItem) => {
              const topic =
                typeof topicItem === "string" ? topicItem : topicItem.topic;
              const sentiment =
                typeof topicItem === "string" ? null : topicItem.sentiment;
              return { topic, sentiment };
            })
            .filter((item) => item.sentiment === "positive");

          const negativeTopics = (cat.topics || [])
            .map((topicItem) => {
              const topic =
                typeof topicItem === "string" ? topicItem : topicItem.topic;
              const sentiment =
                typeof topicItem === "string" ? null : topicItem.sentiment;
              return { topic, sentiment };
            })
            .filter((item) => item.sentiment === "negative");

          return (
            <div
              key={cat.rank}
              className="p-4 rounded-lg bg-muted/10 border-0 transition-all duration-300"
              style={{
                boxShadow: `0 4px 16px ${RGBA_BLACK_SHADOW_30}`,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = `0 8px 32px ${RGBA_ORANGE_SHADOW_20}`)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow = `0 4px 16px ${RGBA_BLACK_SHADOW_30}`)
              }
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground">
                  {cat.rank}
                </span>
                <span className="font-bold text-sm">{cat.category}</span>
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                {cat.mentions}{" "}
                {uiTexts?.responseDetails?.mentions || "mentions"} (
                {cat.percentage}%)
              </div>
              {cat.topics && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Positive Column */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                      {uiTexts?.responseDetails?.positive || "Positive"}
                    </div>
                    {positiveTopics.length > 0 ? (
                      positiveTopics.map((item, index) => (
                        <div
                          key={index}
                          className="text-sm flex items-start gap-1.5"
                        >
                          <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                            •
                          </span>
                          <span className="text-foreground">{item.topic}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground italic">
                        {uiTexts?.responseDetails?.noPositiveTopics ||
                          "No positive topics"}
                      </div>
                    )}
                  </div>

                  {/* Negative Column */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
                      {uiTexts?.responseDetails?.negative || "Negative"}
                    </div>
                    {negativeTopics.length > 0 ? (
                      negativeTopics.map((item, index) => (
                        <div
                          key={index}
                          className="text-sm flex items-start gap-1.5"
                        >
                          <span className="text-red-600 dark:text-red-400 mt-0.5">
                            •
                          </span>
                          <span className="text-foreground">{item.topic}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground italic">
                        {uiTexts?.responseDetails?.noNegativeTopics ||
                          "No negative topics"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Render KPI Card component based on schema
 */
export function SchemaKPICard({ component, data }) {
  const kpiData = resolveDataPath(data, component.dataPath);
  const config = component.config || {};

  if (!kpiData) {
    return null;
  }

  // Support both object and direct value
  const value =
    typeof kpiData === "object" ? kpiData[config.valueKey || "value"] : kpiData;
  const label =
    typeof kpiData === "object"
      ? kpiData[config.labelKey || "label"]
      : config.label || "KPI";
  const delta =
    typeof kpiData === "object"
      ? kpiData[config.deltaKey || "delta"]
      : config.delta;
  const trend =
    typeof kpiData === "object"
      ? kpiData[config.trendKey || "trend"]
      : config.trend;
  const target =
    typeof kpiData === "object"
      ? kpiData[config.targetKey || "target"]
      : config.target;

  return (
    <KPICard
      value={value}
      label={label}
      delta={delta}
      trend={trend}
      target={target}
      format={config.format}
      className={config.className}
    />
  );
}
