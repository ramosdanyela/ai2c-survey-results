import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  User,
} from "@/lib/icons";
import { useSurveyData } from "@/hooks/useSurveyData";
import { severityTextColors } from "@/lib/colors";

// Helper function to get uiTexts with fallbacks
function useTableTexts() {
  const { uiTexts } = useSurveyData();

  return {
    attributeDeepDive: {
      segment: uiTexts?.attributeDeepDive?.segment || "Segmento",
      quantity: uiTexts?.attributeDeepDive?.quantity || "Quantidade",
      percentage: uiTexts?.attributeDeepDive?.percentage || "%",
      positive: uiTexts?.attributeDeepDive?.positive || "Positivo",
      negative: uiTexts?.attributeDeepDive?.negative || "Negativo",
      promoters: uiTexts?.attributeDeepDive?.promoters || "Promotores",
      neutrals: uiTexts?.attributeDeepDive?.neutrals || "Neutros",
      detractors: uiTexts?.attributeDeepDive?.detractors || "Detratores",
      nps: uiTexts?.attributeDeepDive?.nps || "NPS",
      sentiment: uiTexts?.attributeDeepDive?.sentiment || "Sentimento",
      category: uiTexts?.attributeDeepDive?.category || "Categoria",
    },
    executiveReport: {
      tableHeaders: {
        number: uiTexts?.executiveReport?.tableHeaders?.number || "#",
        recommendation:
          uiTexts?.executiveReport?.tableHeaders?.recommendation ||
          "Recomendação",
        severity:
          uiTexts?.executiveReport?.tableHeaders?.severity || "Severidade",
        stakeholders:
          uiTexts?.executiveReport?.tableHeaders?.stakeholders ||
          "Stakeholders",
      },
      tasks: {
        hideTasks:
          uiTexts?.executiveReport?.tasks?.hideTasks || "Ocultar tarefas",
        showTasks:
          uiTexts?.executiveReport?.tasks?.showTasks || "Mostrar tarefas",
        hide: uiTexts?.executiveReport?.tasks?.hide || "Ocultar",
        show: uiTexts?.executiveReport?.tasks?.show || "Mostrar",
        implementationTasks:
          uiTexts?.executiveReport?.tasks?.implementationTasks ||
          "Tarefas de Implementação",
        task: uiTexts?.executiveReport?.tasks?.task || "Tarefa",
        responsibleArea:
          uiTexts?.executiveReport?.tasks?.responsibleArea ||
          "Área Responsável",
      },
    },
    supportAnalysis: {
      clusterLabel: uiTexts?.supportAnalysis?.clusterLabel || "Cluster",
      clusterDescription:
        uiTexts?.supportAnalysis?.clusterDescription || "Descrição",
      memberPercentage:
        uiTexts?.supportAnalysis?.memberPercentage || "% Membros",
      clusterId: uiTexts?.supportAnalysis?.clusterId || "ID",
    },
  };
}

// ============================================================
// SURVEY TABLES - All table components used in the project
// ============================================================
// This file contains all table components used
// in the survey components.
//
// Available components:
// 1. DistributionTable - Distribution table with segment, quantity, percentage
// 2. SentimentTable - Sentiment table with segment, positive, negative
// 3. NPSDistributionTable - NPS distribution table (promoters, neutrals, detractors)
// 4. NPSTable - NPS table with segment and NPS score
// 5. SentimentImpactTable - Sentiment impact table with dynamic segments
// 6. PositiveCategoriesTable - Positive categories table with dynamic segments
// 7. NegativeCategoriesTable - Negative categories table with dynamic segments
// 8. RecommendationsTable - Recommendations table with expandable tasks
// 9. TasksTable - Tasks table nested inside recommendations
// 10. SegmentationTable - Segmentation table with clusters

// ============================================================
// 1. DISTRIBUTION TABLE
// ============================================================
// Used in: AttributeDeepDive - Distribution
export function DistributionTable({ data }) {
  const texts = useTableTexts();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{texts.attributeDeepDive.segment}</TableHead>
          <TableHead className="text-right">
            {texts.attributeDeepDive.quantity}
          </TableHead>
          <TableHead className="text-right">
            {texts.attributeDeepDive.percentage}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...data]
          .sort((a, b) => b.percentage - a.percentage)
          .map((item) => (
            <TableRow key={item.segment}>
              <TableCell className="font-medium">{item.segment}</TableCell>
              <TableCell className="text-right">
                {item.count.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-medium">
                {item.percentage}%
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}

// ============================================================
// 2. SENTIMENT TABLE
// ============================================================
// Used in: AttributeDeepDive - Sentiment by Segment
export function SentimentTable({ data }) {
  const texts = useTableTexts();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{texts.attributeDeepDive.segment}</TableHead>
          <TableHead
            className="text-right"
            style={{ color: "hsl(var(--chart-positive))" }}
          >
            {texts.attributeDeepDive.positive}
          </TableHead>
          <TableHead className="text-right text-destructive">
            {texts.attributeDeepDive.negative}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.segment}>
            <TableCell className="font-medium">{item.segment}</TableCell>
            <TableCell
              className="text-right"
              style={{ color: "hsl(var(--chart-positive))" }}
            >
              {item.positive}%
            </TableCell>
            <TableCell className="text-right text-destructive">
              {item.negative}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ============================================================
// 3. NPS DISTRIBUTION TABLE
// ============================================================
// Used in: AttributeDeepDive - NPS Distribution
// Data shape: array of { [segmentKey], promoters, neutrals, detractors }
// segmentKey from component.config.yAxisDataKey or "segment"
export function NPSDistributionTable({
  data,
  categoryName,
  segmentKey = "segment",
}) {
  const texts = useTableTexts();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{categoryName}</TableHead>
          <TableHead className="text-right">
            {texts.attributeDeepDive.promoters}
          </TableHead>
          <TableHead className="text-right">
            {texts.attributeDeepDive.neutrals}
          </TableHead>
          <TableHead className="text-right">
            {texts.attributeDeepDive.detractors}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => {
          const segmentValue = item[segmentKey];
          return (
            <TableRow key={segmentValue}>
              <TableCell className="font-medium">{segmentValue}</TableCell>
              <TableCell className="text-right">{item.promoters}%</TableCell>
              <TableCell className="text-right">{item.neutrals}%</TableCell>
              <TableCell className="text-right">{item.detractors}%</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// ============================================================
// 4. NPS TABLE
// ============================================================
// Used in: AttributeDeepDive - NPS
// Data shape: array of { [segmentKey], NPS } (segmentKey from config.yAxisDataKey or "segment")
export function NPSTable({ data, categoryName, segmentKey = "segment" }) {
  const texts = useTableTexts();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{categoryName}</TableHead>
          <TableHead className="text-right">
            {texts.attributeDeepDive.nps}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => {
          const segmentValue = item[segmentKey];
          const nps = item.NPS ?? item.nps;
          return (
            <TableRow key={segmentValue}>
              <TableCell className="font-medium">{segmentValue}</TableCell>
              <TableCell
                className="text-right font-bold"
                style={{
                  color:
                    nps >= 0
                      ? "hsl(var(--chart-positive))"
                      : "hsl(var(--chart-negative))",
                }}
              >
                {nps > 0 ? "+" : ""}
                {nps}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// ============================================================
// 5. SENTIMENT IMPACT TABLE
// ============================================================
// Used in: AttributeDeepDive - Satisfaction Impact Sentiment
export function SentimentImpactTable({ data }) {
  const texts = useTableTexts();
  if (!data || data.length === 0) return null;

  const segments = Object.keys(data[0]).filter((key) => key !== "sentiment");

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{texts.attributeDeepDive.sentiment}</TableHead>
          {segments.map((segment) => (
            <TableHead key={segment} className="text-right">
              {segment}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.sentiment}>
            <TableCell className="font-medium">{item.sentiment}</TableCell>
            {segments.map((segment) => (
              <TableCell
                key={segment}
                className="text-right"
                style={{
                  color:
                    item.sentiment === texts.attributeDeepDive.positive
                      ? "hsl(var(--chart-positive))"
                      : item.sentiment === texts.attributeDeepDive.negative
                        ? "hsl(var(--chart-negative))"
                        : undefined,
                }}
              >
                {item[segment]}%
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ============================================================
// 6. POSITIVE CATEGORIES TABLE
// ============================================================
// Used in: AttributeDeepDive - Positive Categories
export function PositiveCategoriesTable({ data }) {
  const texts = useTableTexts();
  if (!data || data.length === 0) return null;

  const segments = Object.keys(data[0]).filter((key) => key !== "category");

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{texts.attributeDeepDive.category}</TableHead>
          {segments.map((segment) => (
            <TableHead key={segment} className="text-right">
              {segment}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((cat) => (
          <TableRow key={cat.category}>
            <TableCell className="font-medium">{cat.category}</TableCell>
            {segments.map((segment) => (
              <TableCell
                key={segment}
                className="text-right"
                style={{
                  color: "hsl(var(--chart-positive))",
                }}
              >
                {cat[segment]}%
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ============================================================
// 7. NEGATIVE CATEGORIES TABLE
// ============================================================
// Used in: AttributeDeepDive - Negative Categories
export function NegativeCategoriesTable({ data }) {
  const texts = useTableTexts();
  if (!data || data.length === 0) return null;

  const segments = Object.keys(data[0]).filter((key) => key !== "category");

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{texts.attributeDeepDive.category}</TableHead>
          {segments.map((segment) => (
            <TableHead key={segment} className="text-right">
              {segment}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((cat) => (
          <TableRow key={cat.category}>
            <TableCell className="font-medium">{cat.category}</TableCell>
            {segments.map((segment) => (
              <TableCell key={segment} className="text-right text-destructive">
                {cat[segment]}%
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ============================================================
// 8. RECOMMENDATIONS TABLE
// ============================================================
// Used in: ExecutiveReport - Recommendations
export function RecommendationsTable({
  recommendations,
  severityColors,
  severityLabels,
  expandedRecs,
  onToggleRec,
  getRecTasks,
  renderTasksTable,
  isExport = false,
  isExportFormatWord = false,
}) {
  const texts = useTableTexts();

  // Helper function to get the display label for severity
  const getSeverityLabel = (severity) => {
    if (severityLabels && severityLabels[severity]) {
      return severityLabels[severity];
    }
    return severity;
  };

  return (
    <Table className="table-auto">
      <TableHeader>
        <TableRow className="bg-muted/5">
          <TableHead className="w-12 text-muted-foreground">
            {texts.executiveReport.tableHeaders.number}
          </TableHead>
          <TableHead className="text-muted-foreground">
            {texts.executiveReport.tableHeaders.recommendation}
          </TableHead>
          <TableHead className="w-32 text-center text-muted-foreground">
            {texts.executiveReport.tableHeaders.severity}
          </TableHead>
          <TableHead className="w-64 p-0 text-muted-foreground">
            {texts.executiveReport.tableHeaders.stakeholders}
          </TableHead>
          <TableHead className="w-12 text-muted-foreground"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recommendations.map((rec) => {
          const isExpanded = expandedRecs.has(rec.id);
          const tasks = getRecTasks(rec.id);
          const hasTasks = tasks.length > 0;
          // Use English severity for color lookup, Portuguese label for display
          const severityLabel = getSeverityLabel(rec.severity);

          return (
            <React.Fragment>
              <TableRow
                key={rec.id}
                className={`hover:bg-primary/10 py-2 ${
                  hasTasks ? "cursor-pointer" : ""
                }`}
                onClick={hasTasks ? () => onToggleRec(rec.id) : undefined}
              >
                <TableCell className="font-medium text-muted-foreground py-2">
                  {rec.id}
                </TableCell>
                <TableCell className="font-medium text-foreground py-2">
                  {rec.recommendation}
                </TableCell>
                <TableCell className="text-center py-2">
                  {isExportFormatWord ? (
                    <span
                      className={`text-xs font-semibold ${
                        severityTextColors[rec.severity] ||
                        severityTextColors.medium
                      }`}
                    >
                      {severityLabel}
                    </span>
                  ) : (
                    <Badge
                      className={`leading-none align-middle ${severityColors[rec.severity] || severityColors.medium}`}
                    >
                      {severityLabel}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="p-0 py-2">
                  <div className="flex flex-wrap gap-1">
                    {isExportFormatWord ? (
                      rec.stakeholders.map((stakeholder, idx) => (
                        <span
                          key={stakeholder}
                          className="text-sm text-foreground"
                        >
                          {stakeholder}
                          {idx < rec.stakeholders.length - 1 ? ", " : ""}
                        </span>
                      ))
                    ) : (
                      rec.stakeholders.map((stakeholder) => (
                        <Badge
                          key={stakeholder}
                          variant="outline"
                          className="text-sm"
                        >
                          <Users className="w-3 h-3 mr-1" />
                          {stakeholder}
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  {hasTasks && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleRec(rec.id);
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors inline-block"
                      title={
                        isExpanded
                          ? texts.executiveReport.tasks.hideTasks
                          : texts.executiveReport.tasks.showTasks
                      }
                      aria-label={`${
                        isExpanded
                          ? texts.executiveReport.tasks.hide
                          : texts.executiveReport.tasks.show
                      } tasks for recommendation ${rec.id}`}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
              {hasTasks && isExpanded && (
                <TableRow>
                  <TableCell colSpan={5} className="p-0 bg-muted/5">
                    {renderTasksTable(rec.id, tasks)}
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}

// ============================================================
// 9. TASKS TABLE
// ============================================================
// Used in: ExecutiveReport - Tasks (nested inside Recommendations)
export function TasksTable({ tasks, recId, checkedTasks, onToggleTask, isExportFormatWord = false }) {
  const texts = useTableTexts();
  return (
    <div className="pl-8 pr-4 py-4">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <ClipboardList className="w-4 h-4" />
        {texts.executiveReport.tasks.implementationTasks}
      </h3>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/10">
            <TableHead className="w-12 text-muted-foreground"></TableHead>
            <TableHead className="text-muted-foreground">
              {texts.executiveReport.tasks.task}
            </TableHead>
            <TableHead className="w-40 text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {texts.executiveReport.tasks.responsibleArea}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task, index) => {
            const taskKey = `rec-${recId}-task-${index}`;
            const isChecked = checkedTasks[taskKey] || false;
            return (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => onToggleTask(recId, index)}
                    className="cursor-pointer"
                  />
                </TableCell>
                <TableCell
                  className={
                    isChecked
                      ? "line-through text-muted-foreground/50"
                      : "text-foreground"
                  }
                >
                  {task.task}
                </TableCell>
                <TableCell>
                  {isExportFormatWord ? (
                    <span className="text-sm text-foreground">{task.owner}</span>
                  ) : (
                    <Badge variant="outline" className="font-normal">
                      {task.owner}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================================
// 10. SEGMENTATION TABLE
// ============================================================
// Used in: SupportAnalysis - Segmentation
export function SegmentationTable({ data }) {
  const texts = useTableTexts();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">
            {texts.supportAnalysis.clusterLabel}
          </TableHead>
          <TableHead>{texts.supportAnalysis.clusterDescription}</TableHead>
          <TableHead className="w-[150px] text-right">
            {texts.supportAnalysis.memberPercentage}
          </TableHead>
          <TableHead className="w-[100px] text-center">
            {texts.supportAnalysis.clusterId}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...data]
          .sort((a, b) => {
            const hasId = (x) =>
              x.id != null &&
              x.id !== "" &&
              String(x.id).trim() !== "";
            const aHasId = hasId(a);
            const bHasId = hasId(b);
            if (aHasId && !bHasId) return -1;
            if (!aHasId && bHasId) return 1;
            const aIdx = a.index;
            const bIdx = b.index;
            if (aIdx != null && bIdx != null)
              return Number(aIdx) - Number(bIdx);
            if (aIdx != null) return -1;
            if (bIdx != null) return 1;
            return (b.percentage ?? 0) - (a.percentage ?? 0);
          })
          .map((cluster) => (
            <TableRow key={cluster.cluster}>
              <TableCell className="font-semibold">{cluster.cluster}</TableCell>
              <TableCell className="text-muted-foreground">
                {cluster.description}
              </TableCell>
              <TableCell className="text-right">
                <span className="font-bold text-foreground">
                  {cluster.percentage}%
                </span>
              </TableCell>
              <TableCell className="text-center text-muted-foreground">
                {cluster.id || "-"}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
