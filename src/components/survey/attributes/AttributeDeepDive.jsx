import { MapPin, GraduationCap, Building } from "@/lib/icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui-components/card";
import { SubsectionTitle } from "@/components/SubsectionTitle";
import { attributeDeepDive, uiTexts } from "@/data/surveyData";
import { RGBA_BLACK_SHADOW_20 } from "@/lib/colors";
import {
  SentimentStackedChart,
  SimpleBarChart,
  SentimentThreeColorChart,
} from "../shared/charts/Charts";
import {
  DistributionTable,
  SentimentTable,
  NPSDistributionTable,
  NPSTable,
  SentimentImpactTable,
  PositiveCategoriesTable,
  NegativeCategoriesTable,
} from "../shared/tables/Tables";

const attributeIcons = {
  state: MapPin,
  education: GraduationCap,
  customerType: Building,
};

export function AttributeDeepDive({ attributeId }) {
  // If no attributeId, use the first attribute as default
  const defaultAttributeId =
    attributeId || attributeDeepDive.attributes[0]?.id || "customerType";
  const activeAttribute = defaultAttributeId;

  const currentAttribute = attributeDeepDive.attributes.find(
    (attr) => attr.id === activeAttribute
  );

  if (!currentAttribute) {
    return null;
  }

  // Render only the active attribute
  const attr = currentAttribute;
  const Icon = attributeIcons[attr.id] || Building;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Section Title */}
      <SubsectionTitle title={attr.name} icon={Icon} />

      <div className="space-y-6">
        {/* Summary */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-card-foreground">
              {uiTexts.attributeDeepDive.summary}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground leading-relaxed space-y-3">
              {attr.summary.split("\n").map((line, index) => (
                <p key={index} className={line.trim() ? "" : "h-3"}>
                  {line}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Distribution - Horizontal bars Nussbaumer style */}
          <Card className="card-elevated flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-xl font-bold text-card-foreground">
                {uiTexts.attributeDeepDive.distribution}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-shrink-0 mb-4" style={{ height: "400px" }}>
                <SimpleBarChart
                  data={attr.distribution}
                  dataKey="percentage"
                  yAxisDataKey="segment"
                  height={400}
                  margin={{ top: 10, right: 80, left: 120, bottom: 10 }}
                  yAxisWidth={attr.id === "state" ? 150 : 110}
                  tooltipFormatter={(value, name, props) => [
                    uiTexts.attributeDeepDive.tooltip.respondents(
                      props.payload.count,
                      value
                    ),
                    props.payload.segment,
                  ]}
                />
              </div>
              <div>
                <DistributionTable data={attr.distribution} />
              </div>
            </CardContent>
          </Card>

          {/* Sentiment by Segment */}
          <Card className="card-elevated flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-xl font-bold text-foreground">
                {uiTexts.attributeDeepDive.sentimentAnalysis}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-shrink-0 mb-4" style={{ height: "400px" }}>
                <SentimentStackedChart
                  data={attr.sentiment}
                  height={400}
                  showGrid={false}
                  yAxisDataKey="segment"
                />
              </div>
              <div>
                <SentimentTable data={attr.sentiment} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NPS Section */}
        {attr.npsSummary && attr.npsDistribution && (
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">
                {uiTexts.attributeDeepDive.npsQuestion}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">
                  {uiTexts.attributeDeepDive.summary}
                </h3>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  {attr.npsSummary.split("\n").map((line, index) => (
                    <p key={index} className={line.trim() ? "" : "h-3"}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              {/* Responses - NPS Comparison */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4">
                  {uiTexts.attributeDeepDive.responses}
                </h3>
                <div className="space-y-6">
                  {/* NPS Distribution Table */}
                  <div>
                    <h4 className="text-base font-semibold text-foreground mb-3">
                      {uiTexts.attributeDeepDive.promotersNeutralsDetractors}
                    </h4>
                    <NPSDistributionTable
                      data={attr.npsDistribution}
                      attributeName={attr.name}
                    />
                  </div>

                  {/* NPS Table */}
                  <div>
                    <h4 className="text-base font-semibold text-foreground mb-3">
                      {uiTexts.attributeDeepDive.nps}
                    </h4>
                    <NPSTable data={attr.nps} attributeName={attr.name} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Satisfaction Impact Section */}
        {attr.satisfactionImpactSummary && (
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">
                {uiTexts.attributeDeepDive.satisfactionImpactQuestion}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">
                  {uiTexts.attributeDeepDive.summary}
                </h3>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  {attr.satisfactionImpactSummary
                    .split("\n")
                    .map((line, index) => (
                      <p key={index} className={line.trim() ? "" : "h-3"}>
                        {line}
                      </p>
                    ))}
                </div>
              </div>

              {/* Sentiment Analysis */}
              {attr.satisfactionImpactSentiment && (
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3">
                    {uiTexts.attributeDeepDive.sentimentAnalysis}
                  </h3>
                  {/* Single color legend */}
                  <div className="flex justify-center mb-4">
                    <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded"
                          style={{
                            backgroundColor: "hsl(var(--chart-negative))",
                          }}
                        />
                        <span>{uiTexts.attributeDeepDive.negative}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded"
                          style={{
                            backgroundColor: "hsl(var(--chart-neutral))",
                          }}
                        />
                        <span>{uiTexts.attributeDeepDive.notApplicable}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded"
                          style={{
                            backgroundColor: "hsl(var(--chart-positive))",
                          }}
                        />
                        <span>{uiTexts.attributeDeepDive.positive}</span>
                      </div>
                    </div>
                  </div>
                  <SentimentThreeColorChart
                    data={attr.satisfactionImpactSentiment}
                    height={192}
                    showGrid={false}
                    showLegend={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <div className="mt-4">
                    <SentimentImpactTable
                      data={attr.satisfactionImpactSentiment}
                    />
                  </div>
                </div>
              )}

              {/* Positive Sentiment Categories */}
              {attr.positiveCategories &&
                attr.positiveCategories.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-3">
                      {uiTexts.attributeDeepDive.positiveCategories}
                    </h3>
                    <PositiveCategoriesTable data={attr.positiveCategories} />
                  </div>
                )}

              {/* Negative Sentiment Categories */}
              {attr.negativeCategories &&
                attr.negativeCategories.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-3">
                      {uiTexts.attributeDeepDive.negativeCategories}
                    </h3>
                    <NegativeCategoriesTable data={attr.negativeCategories} />
                  </div>
                )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
