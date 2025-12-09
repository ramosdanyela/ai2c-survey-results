import {
  FileText,
  AlertTriangle,
  Users,
  ExternalLink,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COLOR_ORANGE_PRIMARY } from "@/lib/colors";
import {
  executiveReport,
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

const severityColors: Record<SeverityLevel, string> = {
  critical: "bg-severity-critical text-white",
  high: "bg-severity-high text-white",
  medium: "bg-severity-medium text-white",
  low: "bg-severity-low text-white",
};

interface ExecutiveReportProps {
  subSection?: string;
  onSectionChange?: (section: string) => void;
}

export function ExecutiveReport({
  subSection,
  onSectionChange,
}: ExecutiveReportProps) {
  const handleNavigateToImplementation = (recId: number) => {
    if (onSectionChange) {
      // Definir hash na URL para que o ImplementationPlan possa abrir o accordion correto
      window.location.hash = `rec-${recId}`;
      onSectionChange("implementation");
    }
  };
  const showSummary = !subSection || subSection === "executive-summary";
  const showRecommendations =
    !subSection || subSection === "executive-recommendations";

  return (
    <div className="space-y-8 animate-fade-in">
      {showSummary && (
        <section>
          <h2 className="section-title flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Sumário Executivo
          </h2>

          <div className="grid gap-6">
            <Card className="card-elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-card-foreground">
                  Sobre o Estudo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-normal leading-relaxed">
                  {executiveReport.summary.aboutStudy
                    .split("\n")
                    .map((line, index, array) => (
                      <span key={index}>
                        {line}
                        {index < array.length - 1 && <br />}
                      </span>
                    ))}
                </p>
              </CardContent>
            </Card>

            {/* Principais Descobertas e Conclusões lado a lado em telas maiores */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card
                className="card-elevated highlight-container-light border-l-4 bg-muted/10"
                style={{ borderLeftColor: COLOR_ORANGE_PRIMARY }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold text-card-foreground">
                    Principais Descobertas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-normal leading-relaxed">
                    {executiveReport.summary.mainFindings
                      .split("\n")
                      .map((line, index, array) => (
                        <span key={index}>
                          {line}
                          {index < array.length - 1 && <br />}
                        </span>
                      ))}
                  </p>
                </CardContent>
              </Card>

              <Card
                className="card-elevated border-l-4 bg-muted/10"
                style={{ borderLeftColor: COLOR_ORANGE_PRIMARY }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold text-card-foreground">
                    Conclusões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-normal leading-relaxed">
                    {executiveReport.summary.conclusions
                      .split("\n")
                      .map((line, index, array) => (
                        <span key={index}>
                          {line}
                          {index < array.length - 1 && <br />}
                        </span>
                      ))}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {showRecommendations && (
        <section>
          <h2 className="section-title flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Recomendações
          </h2>

          <Card className="card-elevated overflow-hidden bg-muted/10">
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
                  <TableHead className="w-64 text-muted-foreground">
                    Stakeholders
                  </TableHead>
                  {onSectionChange && <TableHead className="w-12"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {executiveReport.recommendations.map((rec) => (
                  <TableRow key={rec.id} className="hover:bg-primary/10">
                    <TableCell className="font-medium text-muted-foreground">
                      {rec.id}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {rec.recommendation}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={severityColors[rec.severity]}>
                        {severityLabels[rec.severity]}
                      </Badge>
                    </TableCell>
                    <TableCell>
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
                    {onSectionChange && (
                      <TableCell>
                        <button
                          onClick={() => handleNavigateToImplementation(rec.id)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title="Ver na Proposta de Implementação"
                          aria-label={`Ver recomendação ${rec.id} na Proposta de Implementação`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>
      )}
    </div>
  );
}
