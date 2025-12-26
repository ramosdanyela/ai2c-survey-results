import { useState } from "react";
import {
  FileText,
  AlertTriangle,
  Users,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  User,
} from "@/lib/icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui-components/card";
import { Badge } from "@/components/ui-components/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { COLOR_ORANGE_PRIMARY } from "@/lib/colors";
import {
  executiveReport,
  severityLabels,
  implementationPlan,
  uiTexts,
} from "@/data/surveyData";
import { RecommendationsTable, TasksTable } from "./tables/Tables";

const severityColors = {
  critical: "bg-severity-critical text-white",
  high: "bg-severity-high text-white",
  medium: "bg-severity-medium text-white",
  low: "bg-severity-low text-white",
};

export function ExecutiveReport({ subSection, onSectionChange }) {
  // State to control which recommendations have their tasks expanded
  const [expandedRecs, setExpandedRecs] = useState(new Set());
  // State to manage task checkboxes
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

  // Function to get tasks for a recommendation
  const getRecTasks = (recId) => {
    const rec = implementationPlan.recommendations.find((r) => r.id === recId);
    return rec ? rec.tasks : [];
  };

  // Show only the specific subsection
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
                  {uiTexts.executiveReport.executiveSummary}
                </CardTitle>
              </CardHeader>
            </Card>

            <div className="grid gap-6">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-card-foreground">
                    {uiTexts.executiveReport.aboutStudy}
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

              {/* Main Findings and Conclusions side by side on larger screens */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card
                  className="card-elevated highlight-container-light border-l-4 bg-muted/10"
                  style={{ borderLeftColor: COLOR_ORANGE_PRIMARY }}
                >
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-card-foreground">
                      {uiTexts.executiveReport.mainFindings}
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
                      {uiTexts.executiveReport.conclusions}
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
                  {uiTexts.executiveReport.recommendations}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="card-elevated overflow-hidden bg-muted/10">
              <CardContent>
                <RecommendationsTable
                  recommendations={executiveReport.recommendations}
                  severityLabels={severityLabels}
                  severityColors={severityColors}
                  expandedRecs={expandedRecs}
                  onToggleRec={toggleRecExpansion}
                  getRecTasks={getRecTasks}
                  renderTasksTable={(recId, tasks) => (
                    <TasksTable
                      tasks={tasks}
                      recId={recId}
                      checkedTasks={checkedTasks}
                      onToggleTask={toggleTask}
                    />
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
