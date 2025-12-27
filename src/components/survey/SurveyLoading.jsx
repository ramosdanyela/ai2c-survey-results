// ============================================================
// SURVEY LOADING - Componente de loading
// ============================================================
//
// ⚠️ ARQUIVO ISOLADO PARA SIMULAÇÃO
// Pode ser deletado se remover a simulação
//
// ============================================================

import { Loader2 } from "lucide-react";

export function SurveyLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Carregando dados da pesquisa...</p>
      </div>
    </div>
  );
}

