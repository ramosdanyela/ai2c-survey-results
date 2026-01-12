/**
 * EXAMPLE: Nova Seção usando Componentes Genéricos
 *
 * Este é um exemplo de como criar uma nova seção reaproveitando
 * os componentes genéricos criados. Você pode usar este arquivo
 * como template para criar novas seções.
 *
 * Componentes genéricos disponíveis:
 * - GenericSubsection: Wrapper para subseções com título e ícone
 * - GenericCard: Card reutilizável com suporte a conteúdo, estilos, etc.
 * - useSectionData: Hook para acessar dados do JSON de forma consistente
 */

import { useState } from "react";
import { TrendingUp, BarChart3 } from "@/lib/icons";
import { GenericSubsection } from "../common/GenericSubsection";
import { GenericCard } from "../common/GenericCard";
import { useSectionData } from "@/hooks/useSectionData";
import { SimpleBarChart } from "../widgets/Charts";
import { useIsMobile } from "@/hooks/use-mobile";

export function ExampleNewSection({ subSection }) {
  const { sectionData, resolvePath } = useSectionData("novaSecao");
  const isMobile = useIsMobile();

  // State management (se necessário)
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Show only the specific subsection
  const showOverview = subSection === "nova-secao-overview";
  const showDetails = subSection === "nova-secao-details";

  // Get data from JSON using resolvePath
  const dados = resolvePath("novaSecao.dados");
  const grafico = resolvePath("novaSecao.dados.grafico.dados");

  if (!sectionData) {
    return (
      <div className="space-y-8 animate-fade-in">
        <p>Seção não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {showOverview && (
        <GenericSubsection
          title="Visão Geral"
          icon={BarChart3}
          componentsContainerClassName="grid gap-6"
        >
          {/* Card com conteúdo de texto */}
          <GenericCard
            title="Descrição"
            content={dados?.descricao || ""}
            style="elevated"
          />

          {/* Card com gráfico */}
          {grafico && (
            <GenericCard style="elevated">
              <SimpleBarChart
                data={grafico}
                dataKey="percentage"
                yAxisDataKey="category"
                height={isMobile ? 400 : 320}
                margin={
                  isMobile
                    ? { top: 10, right: 35, left: 4, bottom: 10 }
                    : { top: 10, right: 80, left: 120, bottom: 10 }
                }
                yAxisWidth={isMobile ? 130 : 110}
                hideXAxis={true}
              />
            </GenericCard>
          )}

          {/* Card com resumo */}
          <GenericCard
            title="Resumo"
            content={dados?.resumo || ""}
            style="elevated"
            className="border-l-4 bg-muted/10"
            borderLeftColor="orange"
          />
        </GenericSubsection>
      )}

      {showDetails && (
        <GenericSubsection title="Detalhes" icon={TrendingUp}>
          <GenericCard
            title="Análise Detalhada"
            content="Esta seção contém uma análise mais detalhada dos dados.\n\nOs principais pontos incluem:\n- Ponto 1\n- Ponto 2\n- Ponto 3"
            style="elevated"
          />
        </GenericSubsection>
      )}
    </div>
  );
}
