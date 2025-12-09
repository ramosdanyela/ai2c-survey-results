import {
  FileText,
  BarChart3,
  MessageSquare,
  Layers,
  CheckSquare,
  ChevronDown,
  Building2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { surveyInfo } from "@/data/surveyData";
import { cn } from "@/lib/utils";

interface SurveySidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  {
    id: "executive",
    label: "Relatório Executivo",
    icon: FileText,
    subItems: [
      { id: "executive-summary", label: "Sumário Executivo" },
      { id: "executive-recommendations", label: "Recomendações" },
    ],
  },
  {
    id: "support",
    label: "Análises de Suporte",
    icon: BarChart3,
    subItems: [
      { id: "support-sentiment", label: "Análise de Sentimento" },
      { id: "support-intent", label: "Intenção de Respondentes" },
      { id: "support-segmentation", label: "Segmentação" },
    ],
  },
  {
    id: "responses",
    label: "Detalhes das Respostas",
    icon: MessageSquare,
  },
  {
    id: "attributes",
    label: "Aprofundamento por Atributos",
    icon: Layers,
  },
  {
    id: "implementation",
    label: "Proposta de Implementação",
    icon: CheckSquare,
  },
];

export function SurveySidebar({
  activeSection,
  onSectionChange,
}: SurveySidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-sidebar-foreground">
              {surveyInfo.title}
            </h2>
            <div className="space-y-1">
              <p className="text-sm font-medium text-sidebar-foreground/80">
                {surveyInfo.company}
              </p>
              <p className="text-sm font-medium text-sidebar-foreground/80">
                {surveyInfo.period}
              </p>
              <p className="text-sm font-medium text-sidebar-foreground/80">
                {surveyInfo.totalRespondents.toLocaleString()} respondentes
              </p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex items-center justify-center">
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-sidebar-primary" />
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-sm uppercase tracking-wider mb-2">
            Seções
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    isActive={
                      activeSection === item.id ||
                      activeSection.startsWith(item.id + "-")
                    }
                    tooltip={item.label}
                    className={cn(
                      "w-full transition-all duration-200",
                      (activeSection === item.id ||
                        activeSection.startsWith(item.id + "-")) &&
                        "bg-sidebar-accent text-sidebar-primary font-medium"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.subItems && !isCollapsed && (
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform",
                          activeSection.startsWith(item.id) && "rotate-180"
                        )}
                      />
                    )}
                  </SidebarMenuButton>

                  {item.subItems &&
                    !isCollapsed &&
                    activeSection.startsWith(item.id) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => onSectionChange(subItem.id)}
                            className={cn(
                              "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                              activeSection === subItem.id
                                ? "bg-sidebar-primary/20 text-sidebar-primary"
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                            )}
                          >
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <SidebarGroup className="mt-auto">
            <div className="p-4 rounded-lg highlight-container-light mx-2 border border-[hsl(var(--highlight-orange))]/30">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground">
                  {surveyInfo.nps}
                </div>
                <div className="text-sm font-semibold text-foreground mb-2">
                  NPS Score
                </div>
                {/* Barra simples com o score para visualização rápida */}
                <div className="mb-2">
                  <Progress
                    value={(surveyInfo.nps + 100) / 2}
                    className="h-2"
                  />
                </div>
                <div className="mt-1 inline-block px-2 py-0.5 rounded-full highlight-container text-sm font-semibold">
                  {surveyInfo.npsCategory}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-sidebar-border">
                <div className="flex justify-between text-sm">
                  <span className="text-sidebar-foreground/60">
                    Respondentes
                  </span>
                  <span className="font-medium text-sidebar-foreground">
                    {surveyInfo.totalRespondents.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-sidebar-foreground/60">
                    Taxa de Resposta
                  </span>
                  <span className="font-medium text-sidebar-foreground">
                    {surveyInfo.responseRate}%
                  </span>
                </div>
              </div>
            </div>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
