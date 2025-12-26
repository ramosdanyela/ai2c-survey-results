import { Target, Users2, Heart, BarChart3 } from "@/lib/icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui-components/card";
import { supportAnalysis, uiTexts } from "@/data/surveyData";
import { SentimentDivergentChart, SimpleBarChart } from "./charts/Charts";
import { SegmentationTable } from "./tables/Tables";
import { useIsMobile } from "@/hooks/use-mobile";

export function SupportAnalysis({ subSection }) {
  const isMobile = useIsMobile();

  // Show only the specific subsection
  const showSentiment = subSection === "support-sentiment";
  const showIntent = subSection === "support-intent";
  const showSegmentation = subSection === "support-segmentation";

  return (
    <div className="space-y-8 animate-fade-in">
      {showSentiment && (
        <section>
          <div className="space-y-6">
            {/* Section Title */}
            <Card className="card-elevated">
              <CardHeader className="py-6 flex items-center justify-center">
                <CardTitle className="text-2xl font-bold text-card-foreground flex items-center gap-2">
                  <Heart className="w-6 h-6" />
                  {uiTexts.supportAnalysis.sentimentAnalysis}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="card-elevated">
              <CardContent className="pt-6">
                <CardDescription className="text-base leading-relaxed space-y-3">
                  {supportAnalysis.sentimentAnalysis.description
                    .split("\n")
                    .map((line, index) => (
                      <p key={index} className={line.trim() ? "" : "h-3"}>
                        {line}
                      </p>
                    ))}
                </CardDescription>
                <SentimentDivergentChart
                  data={supportAnalysis.sentimentAnalysis.data}
                  height={320}
                  showGrid={false}
                />
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {showIntent && (
        <section>
          <div className="space-y-6">
            {/* Section Title */}
            <Card className="card-elevated">
              <CardHeader className="py-6 flex items-center justify-center">
                <CardTitle className="text-2xl font-bold text-card-foreground flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  {uiTexts.supportAnalysis.respondentIntent}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="card-elevated">
              <CardContent className="pt-6">
                <div className="text-muted-foreground font-normal leading-relaxed space-y-3">
                  {supportAnalysis.respondentIntent.description
                    .split("\n")
                    .map((line, index) => (
                      <p key={index} className={line.trim() ? "" : "h-3"}>
                        {line}
                      </p>
                    ))}
                </div>
                <SimpleBarChart
                  data={[...supportAnalysis.respondentIntent.data].sort(
                    (a, b) => b.percentage - a.percentage
                  )}
                  dataKey="percentage"
                  yAxisDataKey="intent"
                  height={isMobile ? 400 : 256}
                  margin={
                    isMobile
                      ? {
                          top: 10,
                          right: 35,
                          left: 4,
                          bottom: 10,
                        }
                      : {
                          top: 10,
                          right: 80,
                          left: 250,
                          bottom: 10,
                        }
                  }
                  yAxisWidth={isMobile ? 130 : 240}
                  yAxisFontSize={isMobile ? 9 : 12}
                  hideXAxis={true}
                  tooltipFormatter={(value, name, props) => [
                    `${props.payload.count.toLocaleString()} (${value}%)`,
                    uiTexts.supportAnalysis.responses,
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {showSegmentation && (
        <section>
          <div className="space-y-6">
            {/* Section Title */}
            <Card className="card-elevated">
              <CardHeader className="py-6 flex items-center justify-center">
                <CardTitle className="text-2xl font-bold text-card-foreground flex items-center gap-2">
                  <Users2 className="w-6 h-6" />
                  {uiTexts.supportAnalysis.segmentation}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="card-elevated">
              <CardContent>
                <SegmentationTable data={supportAnalysis.segmentation} />
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
