import { Target, Users2, Heart } from "@/lib/icons";
import { GenericSubsection } from "../common/GenericSubsection";
import { GenericCard } from "../common/GenericCard";
import {
  supportAnalysis as staticSupportAnalysis,
  uiTexts as staticUiTexts,
} from "@/data/surveyData";
import { useSurveyData } from "@/hooks/useSurveyData";
import { SentimentDivergentChart, SimpleBarChart } from "../widgets/Charts";
import { SegmentationTable } from "../widgets/Tables";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMemo } from "react";

export function SupportAnalysis({ subSection }) {
  const isMobile = useIsMobile();
  const {
    data,
    supportAnalysis: hookSupportAnalysis,
    uiTexts: hookUiTexts,
  } = useSurveyData();

  // Get supportAnalysis data - priority: sectionsConfig > root level > static
  const supportAnalysis = useMemo(() => {
    // Priority 1: Check sectionsConfig.sections[].data (data is directly in data, not in supportAnalysis wrapper)
    if (data?.sectionsConfig?.sections) {
      const supportSection = data.sectionsConfig.sections.find(
        (s) => s.id === "support"
      );
      // In sectionsConfig, data is directly in supportSection.data (sentimentAnalysis, respondentIntent, segmentation)
      if (
        supportSection?.data?.sentimentAnalysis ||
        supportSection?.data?.respondentIntent
      ) {
        return supportSection.data;
      }
    }
    // Priority 3: Static fallback
    return staticSupportAnalysis;
  }, [data, hookSupportAnalysis]);

  // Use data from hook if available, fallback to static import
  const uiTexts = hookUiTexts || staticUiTexts;

  // Show only the specific subsection
  const showSentiment = subSection === "support-sentiment";
  const showIntent = subSection === "support-intent";
  const showSegmentation = subSection === "support-segmentation";

  return (
    <div className="space-y-8 animate-fade-in">
      {showSentiment && supportAnalysis?.sentimentAnalysis && (
        <GenericSubsection
          title={
            uiTexts?.supportAnalysis?.sentimentAnalysis ||
            "Análise de Sentimento"
          }
          icon={Heart}
        >
          <GenericCard
            style="elevated"
            contentClassName="pt-6"
            useDescription={true}
            content={supportAnalysis.sentimentAnalysis.description}
          >
            <SentimentDivergentChart
              data={supportAnalysis.sentimentAnalysis.data}
              height={320}
              showGrid={false}
            />
          </GenericCard>
        </GenericSubsection>
      )}

      {showIntent && supportAnalysis?.respondentIntent && (
        <GenericSubsection
          title={
            uiTexts?.supportAnalysis?.respondentIntent ||
            "Intenção de Respondentes"
          }
          icon={Target}
        >
          <GenericCard
            style="elevated"
            contentClassName="pt-6"
            content={supportAnalysis.respondentIntent.description}
          >
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
                uiTexts?.supportAnalysis?.responses || "Respostas",
              ]}
            />
          </GenericCard>
        </GenericSubsection>
      )}

      {showSegmentation && supportAnalysis?.segmentation && (
        <GenericSubsection
          title={uiTexts?.supportAnalysis?.segmentation || "Segmentação"}
          icon={Users2}
        >
          <GenericCard style="elevated">
            <SegmentationTable data={supportAnalysis.segmentation} />
          </GenericCard>
        </GenericSubsection>
      )}
    </div>
  );
}
