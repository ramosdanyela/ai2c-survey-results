import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  implementationPlan,
  severityLabels,
  type SeverityLevel,
} from "@/data/surveyData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const severityColors: Record<SeverityLevel, string> = {
  critical: "bg-severity-critical text-white",
  high: "bg-severity-high text-white",
  medium: "bg-severity-medium text-white",
  low: "bg-severity-low text-white",
};

const severityBorderColors: Record<SeverityLevel, string> = {
  critical: "border-l-severity-critical",
  high: "border-l-severity-high",
  medium: "border-l-severity-medium",
  low: "border-l-severity-low",
};

interface ImplementationPlanProps {
  openRecId?: number;
}

export function ImplementationPlan({ openRecId }: ImplementationPlanProps) {
  // Estado para gerenciar checkboxes: { "rec-1-task-0": true, ... }
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  // Estado para controlar quais accordions estão abertos - todos começam abertos
  const [openAccordions, setOpenAccordions] = useState<string[]>(
    implementationPlan.recommendations.map((rec) => `rec-${rec.id}`)
  );

  const toggleTask = (recId: number, taskIndex: number) => {
    const key = `rec-${recId}-task-${taskIndex}`;
    setCheckedTasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Abrir accordion quando openRecId for fornecido
  useEffect(() => {
    if (openRecId) {
      const recValue = `rec-${openRecId}`;
      setOpenAccordions((prev) => {
        if (!prev.includes(recValue)) {
          return [...prev, recValue];
        }
        return prev;
      });
      // Scroll para o accordion após um pequeno delay
      setTimeout(() => {
        const accordionItem = document.querySelector(`[value="${recValue}"]`);
        if (accordionItem) {
          accordionItem.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    }
  }, [openRecId]);

  return (
    <div className="space-y-8 animate-fade-in">
      <Accordion
        type="multiple"
        className="space-y-4"
        value={openAccordions}
        onValueChange={setOpenAccordions}
      >
        {implementationPlan.recommendations.map((rec) => (
          <AccordionItem
            key={rec.id}
            value={`rec-${rec.id}`}
            className={`card-elevated overflow-hidden border-l-4 ${
              severityBorderColors[rec.severity]
            }`}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30">
              <div className="flex items-center gap-4 text-left w-full">
                <Badge className={severityColors[rec.severity]}>
                  {severityLabels[rec.severity]}
                </Badge>
                <span className="font-bold flex-1 text-foreground">
                  {rec.title}
                </span>
                <span className="text-sm text-muted-foreground">
                  {rec.tasks.length} tarefas
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Tarefa</TableHead>
                    <TableHead className="w-40">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Área Responsável
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rec.tasks.map((task, index) => {
                    const taskKey = `rec-${rec.id}-task-${index}`;
                    const isChecked = checkedTasks[taskKey] || false;
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleTask(rec.id, index)}
                            className="cursor-pointer"
                          />
                        </TableCell>
                        <TableCell
                          className={
                            isChecked
                              ? "line-through text-muted-foreground"
                              : ""
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
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
