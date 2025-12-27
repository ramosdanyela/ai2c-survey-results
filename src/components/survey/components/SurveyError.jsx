// ============================================================
// SURVEY ERROR - Componente de erro
// ============================================================
//
// ⚠️ ARQUIVO ISOLADO PARA SIMULAÇÃO
// Pode ser deletado se remover a simulação
//
// ============================================================

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SurveyError({ error, onRetry }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Erro ao carregar dados</CardTitle>
          </div>
          <CardDescription>
            Não foi possível carregar os dados da pesquisa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 rounded-md">
              <p className="text-sm text-destructive font-mono">
                {error.message || "Erro desconhecido"}
              </p>
            </div>
          )}
          {onRetry && (
            <Button onClick={onRetry} className="w-full" variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
