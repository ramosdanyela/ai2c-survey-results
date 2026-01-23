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
        recommendation: uiTexts?.executiveReport?.tableHeaders?.recommendation || "Recomendação",
        severity: uiTexts?.executiveReport?.tableHeaders?.severity || "Severidade",
        stakeholders: uiTexts?.executiveReport?.tableHeaders?.stakeholders || "Stakeholders",
      },
      tasks: {
        hideTasks: uiTexts?.executiveReport?.tasks?.hideTasks || "Ocultar tarefas",
        showTasks: uiTexts?.executiveReport?.tasks?.showTasks || "Mostrar tarefas",
        hide: uiTexts?.executiveReport?.tasks?.hide || "Ocultar",
        show: uiTexts?.executiveReport?.tasks?.show || "Mostrar",
        implementationTasks: uiTexts?.executiveReport?.tasks?.implementationTasks || "Tarefas de Implementação",
        task: uiTexts?.executiveReport?.tasks?.task || "Tarefa",
        responsibleArea: uiTexts?.executiveReport?.tasks?.responsibleArea || "Área Responsável",
      },
    },
    supportAnalysis: {
      clusterLabel: uiTexts?.supportAnalysis?.clusterLabel || "Cluster",
      clusterDescription: uiTexts?.supportAnalysis?.clusterDescription || "Descrição",
      memberPercentage: uiTexts?.supportAnalysis?.memberPercentage || "% Membros",
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
export function NPSDistributionTable({ data, categoryName }) {
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
        {data.map((item) => (
          <TableRow key={item.segment}>
            <TableCell className="font-medium">{item.segment}</TableCell>
            <TableCell className="text-right">{item.promotores}%</TableCell>
            <TableCell className="text-right">{item.neutros}%</TableCell>
            <TableCell className="text-right">{item.detratores}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ============================================================
// 4. NPS TABLE
// ============================================================
// Used in: AttributeDeepDive - NPS
export function NPSTable({ data, categoryName }) {
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
        {data.map((item) => (
          <TableRow key={item.segment}>
            <TableCell className="font-medium">{item.segment}</TableCell>
            <TableCell
              className="text-right font-bold"
              style={{
                color:
                  item.nps >= 0
                    ? "hsl(var(--chart-positive))"
                    : "hsl(var(--chart-negative))",
              }}
            >
              {item.nps > 0 ? "+" : ""}
              {item.nps}
            </TableCell>
          </TableRow>
        ))}
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
  expandedRecs,
  onToggleRec,
  getRecTasks,
  renderTasksTable,
}) {
  const texts = useTableTexts();
  
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
                  <Badge className={severityColors[rec.severity] || severityColors.medium}>
                    {rec.severity}
                  </Badge>
                </TableCell>
                <TableCell className="p-0 py-2">
                  <div className="flex flex-wrap gap-1">
                    {rec.stakeholders.map((stakeholder) => (
                      <Badge
                        key={stakeholder}
                        variant="outline"
                        className="text-sm"
                      >
                        <Users className="w-3 h-3 mr-1" />
                        {stakeholder}
                      </Badge>
                    ))}
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
export function TasksTable({ tasks, recId, checkedTasks, onToggleTask }) {
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
                  <Badge variant="outline" className="font-normal">
                    {task.owner}
                  </Badge>
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
          .sort((a, b) => b.percentage - a.percentage)
          .map((cluster, index) => (
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
