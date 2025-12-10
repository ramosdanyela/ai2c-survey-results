import { useState } from "react";
import {
  FileText,
  AlertTriangle,
  Users,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { COLOR_ORANGE_PRIMARY } from "@/lib/colors";
import {
  executiveReport,
  severityLabels,
  implementationPlan,
} from "@/data/surveyData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const severityColors = {
  critical: "bg-severity-critical text-white",
  high: "bg-severity-high text-white",
  medium: "bg-severity-medium text-white",
  low: "bg-severity-low text-white",
};

/**
 * @param {Object} props
 * @param {string} [props.subSection]
 * @param {Function} [props.onSectionChange]
 */
export function ExecutiveReport({ subSection, onSectionChange }) {
  // Estado para controlar quais recomendações têm suas tarefas expandidas
  const [expandedRecs, setExpandedRecs] = useState(new Set());
  // Estado para gerenciar checkboxes das tarefas
  const [checkedTasks, setCheckedTasks] = useState({});

  const toggleRecExpansion = (recId) => {
    setExpandedRecs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recId)) {
        newSet.delete(recId);
      } else {
        newSet.add(recId);
      }
      return newSet;
    });
  };

  const toggleTask = (recId, taskIndex) => {
    const key = `rec-${recId}-task-${taskIndex}`;
    setCheckedTasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Função para obter as tarefas de uma recomendação
  const getRecTasks = (recId) => {
    const rec = implementationPlan.recommendations.find((r) => r.id === recId);
    return rec ? rec.tasks : [];
  };

  // Mostrar apenas a subseção específica
  const showSummary = subSection === "executive-summary";
  const showRecommendations = subSection === "executive-recommendations";

  return (
    <div className="space-y-8 animate-fade-in">
      {showSummary && (
        <section>
          <div className="space-y-6">
            {/* Section Title */}
            <Card className="card-elevated">
              <CardHeader className="py-6 flex items-center justify-center">
                <CardTitle className="text-2xl font-bold text-card-foreground flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Sumário Executivo
                </CardTitle>
              </CardHeader>
            </Card>

            <div className="grid gap-6">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-card-foreground">
                    Sobre o Estudo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  
                  <div className="text-muted-foreground font-normal leading-relaxed space-y-3">
                    {executiveReport.summary.aboutStudy
                      .split("\n")
                      .map((line, index) => (
                        <p key={index} className={line.trim() ? "" : "h-3"}>
                          {line}
                        </p>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Principais Descobertas e Conclusões lado a lado em telas maiores */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card
                  className="card-elevated highlight-container-light border-l-4 bg-muted/10"
                  style={{ borderLeftColor: COLOR_ORANGE_PRIMARY }}
                >
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-card-foreground">
                      Principais Descobertas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground font-normal leading-relaxed space-y-3">
                      {executiveReport.summary.mainFindings
                        .split("\n")
                        .map((line, index) => (
                          <p key={index} className={line.trim() ? "" : "h-3"}>
                            {line}
                          </p>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="card-elevated border-l-4 bg-muted/10"
                  style={{ borderLeftColor: COLOR_ORANGE_PRIMARY }}
                >
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-card-foreground">
                      Conclusões
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground font-normal leading-relaxed space-y-3">
                      {executiveReport.summary.conclusions
                        .split("\n")
                        .map((line, index) => (
                          <p key={index} className={line.trim() ? "" : "h-3"}>
                            {line}
                          </p>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {showRecommendations && (
        <section>
          <div className="space-y-6">
            {/* Section Title */}
            <Card className="card-elevated">
              <CardHeader className="py-6 flex items-center justify-center">
                <CardTitle className="text-2xl font-bold text-card-foreground flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  Recomendações
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="card-elevated overflow-hidden bg-muted/10">
              <CardContent>
                <Table className="table-auto">
                  <TableHeader>
                    <TableRow className="bg-muted/5">
                      <TableHead className="w-12 text-muted-foreground">
                        #
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Recomendação
                      </TableHead>
                      <TableHead className="w-32 text-center text-muted-foreground">
                        Gravidade
                      </TableHead>
                      <TableHead className="w-64 p-0 text-muted-foreground">
                        Stakeholders
                      </TableHead>
                      <TableHead className="w-12 text-muted-foreground"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executiveReport.recommendations.map((rec) => {
                      const isExpanded = expandedRecs.has(rec.id);
                      const tasks = getRecTasks(rec.id);
                      const hasTasks = tasks.length > 0;

                      return (
                        <>
                          <TableRow
                            key={rec.id}
                            className={`hover:bg-primary/10 py-2 ${
                              hasTasks ? "cursor-pointer" : ""
                            }`}
                            onClick={
                              hasTasks
                                ? () => toggleRecExpansion(rec.id)
                                : undefined
                            }
                          >
                            <TableCell className="font-medium text-muted-foreground py-2">
                              {rec.id}
                            </TableCell>
                            <TableCell className="font-medium text-foreground py-2">
                              {rec.recommendation}
                            </TableCell>
                            <TableCell className="text-center py-2">
                              <Badge className={severityColors[rec.severity]}>
                                {severityLabels[rec.severity]}
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
                                    toggleRecExpansion(rec.id);
                                  }}
                                  className="text-muted-foreground hover:text-primary transition-colors inline-block"
                                  title={
                                    isExpanded
                                      ? "Ocultar tarefas"
                                      : "Mostrar tarefas"
                                  }
                                  aria-label={`${
                                    isExpanded ? "Ocultar" : "Mostrar"
                                  } tarefas da recomendação ${rec.id}`}
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
                                <div className="pl-8 pr-4 py-4">
                                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4" />
                                    Tarefas de Implementação
                                  </h3>
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/10">
                                        <TableHead className="w-12 text-muted-foreground"></TableHead>
                                        <TableHead className="text-muted-foreground">
                                          Tarefa
                                        </TableHead>
                                        <TableHead className="w-40 text-muted-foreground">
                                          <div className="flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            Área Responsável
                                          </div>
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {tasks.map((task, index) => {
                                        const taskKey = `rec-${rec.id}-task-${index}`;
                                        const isChecked =
                                          checkedTasks[taskKey] || false;
                                        return (
                                          <TableRow key={index}>
                                            <TableCell>
                                              <Checkbox
                                                checked={isChecked}
                                                onCheckedChange={() =>
                                                  toggleTask(rec.id, index)
                                                }
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
                                              <Badge
                                                variant="outline"
                                                className="font-normal"
                                              >
                                                {task.owner}
                                              </Badge>
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
