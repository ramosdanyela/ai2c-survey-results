import { useState } from "react";
import { FileText, AlertTriangle } from "@/lib/icons";
import { CardContent } from "@/components/ui/card";
import { GenericSubsection } from "../common/GenericSubsection";
import { GenericCard } from "../common/GenericCard";
import { severityColors } from "@/lib/colors";
import { executiveReport, uiTexts } from "@/data/surveyData";

const severityLabels = uiTexts.severityLabels;
import { RecommendationsTable, TasksTable } from "../widgets/Tables";

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
    const rec = executiveReport.recommendations.find((r) => r.id === recId);
    return rec?.tasks || [];
  };

  // Show only the specific subsection
  const showSummary = subSection === "executive-summary";
  const showRecommendations = subSection === "executive-recommendations";

  return (
    <div className="space-y-8 animate-fade-in">
      {showSummary && (
        <GenericSubsection
          title={uiTexts.executiveReport.executiveSummary}
          icon={FileText}
          componentsContainerClassName="grid gap-6"
        >
          <GenericCard
            title={uiTexts.executiveReport.aboutStudy}
            content={executiveReport.summary.aboutStudy}
            style="elevated"
          />

          {/* Main Findings and Conclusions side by side on larger screens */}
          <div className="grid gap-6 md:grid-cols-2">
            <GenericCard
              title={uiTexts.executiveReport.mainFindings}
              content={executiveReport.summary.mainFindings}
              style="elevated"
              className="highlight-container-light border-l-4 bg-muted/10"
              borderLeftColor="orange"
            />

            <GenericCard
              title={uiTexts.executiveReport.conclusions}
              content={executiveReport.summary.conclusions}
              style="elevated"
              className="border-l-4 bg-muted/10"
              borderLeftColor="orange"
            />
          </div>
        </GenericSubsection>
      )}

      {showRecommendations && (
        <GenericSubsection
          title={uiTexts.executiveReport.recommendations}
          icon={AlertTriangle}
        >
          <GenericCard style="elevated" className="overflow-hidden bg-muted/10">
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
          </GenericCard>
        </GenericSubsection>
      )}
    </div>
  );
}
