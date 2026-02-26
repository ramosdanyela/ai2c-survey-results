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
import { breakLinesAfterPeriod, parseBulletItems } from "@/lib/utils";
import { resolveDataPath } from "@/services/dataResolver";

/**
 * Render a card component based on schema
 * Usa cardStyleVariant do JSON para aplicar estilos do código
 */
export function SchemaCard({ component, data, children, isExport = false }) {
  // Use title and text directly (no template resolution needed)
  const title = component.title || "";
  const rawText = component.text || component.content || "";
  const text = breakLinesAfterPeriod(rawText);

  // Text resolution - silently handle empty text (expected in some cases)

  // Usa className do componente enriquecido (resolvido de cardStyleVariant)
  // Quando cardStyleVariant é "flat", className pode ser ""; não usar fallback nesse caso
  const isSobreEstudo = isExport && title.trim() === "Sobre o Estudo";
  const styleClass = [
    component.className !== undefined ? component.className : "card-elevated",
    isSobreEstudo ? "export-card-sobre-estudo" : "",
    isExport ? "min-w-0" : "",
  ]
    .filter(Boolean)
    .join(" ");

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

  // Aplica cardContentVariant ao ContentWrapper (não ao CardContent)
  // O textClassName já contém o cardContentVariant resolvido (ex: "space-y-3" para "flat")
  const cardContentVariantClass = component.textClassName || "";

  // Base classes para o texto
  const baseTextClasses = useDescription
    ? "text-base leading-relaxed"
    : "text-muted-foreground font-normal leading-relaxed";

  // Combina base classes com cardContentVariant
  // Se cardContentVariant for "flat", já terá "space-y-3" do textClassName
  const textBaseClassName =
    `${baseTextClasses} ${cardContentVariantClass}`.trim();

  // If children are provided, render them instead of text
  const hasChildren = children && React.Children.count(children) > 0;
  const hasText = text && text.trim() !== "";
  const bulletData = hasText ? parseBulletItems(text) : null;
  const isBulletList = bulletData && bulletData.items.length > 0;
  // Avoid <p> inside <p>: use div when content has multiple paragraphs or list (CardDescription is <p>)
  const contentHasBlockElements =
    isBulletList || (hasText && text.trim().split("\n").length > 1);
  const ContentWrapper =
    useDescription && !contentHasBlockElements ? CardDescription : "div";

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
      disableHover={isExport}
      onMouseEnter={
        isFlat
          ? (e) => {
              e.currentTarget.style.boxShadow = "none";
            }
          : undefined
      }
      onMouseLeave={
        isFlat
          ? (e) => {
              e.currentTarget.style.boxShadow = "none";
            }
          : undefined
      }
    >
      {title && (
        <CardHeader
          {...(isExport && {
            "data-word-export": "h3",
            "data-word-text": title,
          })}
        >
          <CardTitle className={titleClassName}>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={finalTextClassName}>
        {/* Render text first if it exists */}
        {hasText && (
          <ContentWrapper
            className={`pt-5 ${textBaseClassName}`.trim()}
            {...(isExport &&
              !isBulletList && {
                "data-word-export": "text",
                "data-word-text": text.trim(),
              })}
          >
            {isBulletList ? (
              <>
                {bulletData.intro ? (
                  isExport ? (
                    <div
                      data-word-export="text"
                      data-word-text={bulletData.intro.trim()}
                    >
                      {bulletData.intro.split("\n").map((line, index) => (
                        <p key={index} className={line.trim() ? "" : "h-3"}>
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : (
                    bulletData.intro.split("\n").map((line, index) => (
                      <p key={index} className={line.trim() ? "" : "h-3"}>
                        {line}
                      </p>
                    ))
                  )
                ) : null}
                {isExport ? (
                  <div
                    data-word-export="list"
                    data-word-list={JSON.stringify(bulletData.items)}
                  >
                    <ul className="list-disc pl-6 space-y-1.5">
                      {bulletData.items.map((item, index) => (
                        <li key={index} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <ul className="list-disc pl-6 space-y-1.5">
                    {bulletData.items.map((item, index) => (
                      <li key={index} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              text.split("\n").map((line, index) => (
                <p key={index} className={line.trim() ? "" : "h-3"}>
                  {line}
                </p>
              ))
            )}
          </ContentWrapper>
        )}
        {/* Then render children if they exist - wrap in div with spacing so nested cards/layout render correctly */}
        {hasChildren && (
          <div className={cardContentVariantClass || "space-y-6"}>
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Render an NPS score card component based on schema
 * All styling is hardcoded - no config needed
 */
export function SchemaNPSScoreCard({ component, data }) {
  const npsData = resolveDataPath(
    data,
    component.dataPath || "surveyInfo",
    component.data,
  );
  const uiTexts = resolveDataPath(data, "uiTexts");

  // Use npsScore from question.data (as used in surveyData.json)
  const npsScore = npsData?.npsScore;

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
        </div>
      </div>
    </div>
  );
}

/**
 * Render top categories cards component based on schema
 * All styling is hardcoded - no config needed
 * @param {boolean} isExport - When true, uses fixed layout and print-friendly styles (no hover, stable grid)
 * @param {boolean} isExportFormatWord - When true (só no export Word), rank = só número na cor, sem círculo
 */
export function SchemaTopCategoriesCards({
  component,
  data,
  isExport = false,
  isExportFormatWord = false,
}) {
  const categoriesData = resolveDataPath(
    data,
    component.dataPath,
    component.data,
  );
  const uiTexts = resolveDataPath(data, "uiTexts");

  if (!categoriesData || !Array.isArray(categoriesData)) {
    return null;
  }

  const title =
    uiTexts?.responseDetails?.topCategories ||
    component.config?.title ||
    "Top Categorias";

  return (
    <div className={isExport ? "mb-6 export-top3-categories min-w-0" : "mb-6 min-w-0"}>
      <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <Award className="w-4 h-4" style={{ color: COLOR_ORANGE_PRIMARY }} />
        {title}
      </h4>
      <div
        className={
          isExport ? "grid grid-cols-3 gap-4 min-w-0" : "grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-0"
        }
      >
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
              className="p-4 rounded-lg bg-muted/10 border-0 transition-all duration-300 min-w-0"
              style={{
                boxShadow: `0 4px 16px ${RGBA_BLACK_SHADOW_30}`,
                ...(isExport && { breakInside: "avoid", minWidth: 0 }),
              }}
              onMouseEnter={
                isExport
                  ? undefined
                  : (e) =>
                      (e.currentTarget.style.boxShadow = `0 8px 32px ${RGBA_ORANGE_SHADOW_20}`)
              }
              onMouseLeave={
                isExport
                  ? undefined
                  : (e) =>
                      (e.currentTarget.style.boxShadow = `0 4px 16px ${RGBA_BLACK_SHADOW_30}`)
              }
            >
              <div className="flex items-center gap-2 min-w-0">
                {isExportFormatWord ? (
                  <span className="text-sm font-bold text-primary shrink-0">
                    {cat.rank}
                  </span>
                ) : (
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground shrink-0 leading-none min-w-[1.5rem] min-h-[1.5rem]"
                    style={{ lineHeight: 1 }}
                  >
                    {cat.rank}
                  </span>
                )}
                <div className="flex flex-col justify-center min-h-[1.5rem] min-w-0">
                  <span className="font-bold text-sm break-words">{cat.category}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                {cat.mentions}{" "}
                {uiTexts?.responseDetails?.mentions || "mentions"} (
                {cat.percentage}%)
              </div>
              {cat.topics && (
                <div className="grid grid-cols-1 top3:grid-cols-2 gap-4 min-w-0">
                  {/* Positive Column */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                      {uiTexts?.responseDetails?.positive || "Positive"}
                    </div>
                    {positiveTopics.length > 0 ? (
                      positiveTopics.map((item, index) => (
                        <div
                          key={index}
                          className="text-sm flex items-start gap-1.5 min-w-0"
                        >
                          <span className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0">
                            •
                          </span>
                          <span className="text-foreground break-words min-w-0">{item.topic}</span>
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
                  <div className="space-y-1.5 min-w-0">
                    <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
                      {uiTexts?.responseDetails?.negative || "Negative"}
                    </div>
                    {negativeTopics.length > 0 ? (
                      negativeTopics.map((item, index) => (
                        <div
                          key={index}
                          className="text-sm flex items-start gap-1.5 min-w-0"
                        >
                          <span className="text-red-600 dark:text-red-400 mt-0.5 shrink-0">
                            •
                          </span>
                          <span className="text-foreground break-words min-w-0">{item.topic}</span>
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
  const kpiData = resolveDataPath(data, component.dataPath, component.data);
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
