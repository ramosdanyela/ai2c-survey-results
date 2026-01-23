import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Maximize2, Minimize2, RefreshCw } from "lucide-react";
import { useSurveyData } from "@/hooks/useSurveyData";

/**
 * Componente para renderizar um item da árvore JSON
 */
function JsonTreeItem({ path, keyName, value, depth = 0, expandedPaths, onToggle }) {
  const isObject = value !== null && typeof value === "object" && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;
  const hasChildren = isExpandable && (isArray ? value.length > 0 : Object.keys(value).length > 0);
  const isExpanded = expandedPaths.has(path);

  const getType = () => {
    if (isArray) return "array";
    if (isObject) return "object";
    return typeof value;
  };

  const getValueDisplay = () => {
    if (isObject || isArray) {
      const length = isArray ? value.length : Object.keys(value).length;
      return `${length} ${length === 1 ? "item" : "items"}`;
    }
    if (typeof value === "string" && value.length > 100) {
      return `"${value.substring(0, 100)}..."`;
    }
    if (typeof value === "string") {
      return `"${value}"`;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    return String(value);
  };

  const getIcon = () => {
    if (!isExpandable) {
      return <File className="w-4 h-4 text-muted-foreground" />;
    }
    return isExpanded ? (
      <FolderOpen className="w-4 h-4 text-blue-500" />
    ) : (
      <Folder className="w-4 h-4 text-blue-400" />
    );
  };

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (isExpandable) {
        onToggle(path);
      }
    },
    [isExpandable, path, onToggle]
  );

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted/50 rounded cursor-pointer transition-colors group"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={handleClick}
      >
        {isExpandable ? (
          <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        ) : (
          <div className="w-5 flex-shrink-0" />
        )}
        <div className="flex-shrink-0">{getIcon()}</div>
        <span className="font-medium text-foreground min-w-0">{keyName}</span>
        <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded flex-shrink-0">
          {getType()}
        </span>
        <span className="text-sm text-muted-foreground ml-auto truncate max-w-md text-right">
          {getValueDisplay()}
        </span>
      </div>

      {isExpanded && hasChildren && (
        <div className="border-l-2 border-muted/30 ml-2">
          {isArray
            ? value.map((item, index) => {
                const itemPath = `${path}[${index}]`;
                return (
                  <JsonTreeItem
                    key={itemPath}
                    path={itemPath}
                    keyName={`[${index}]`}
                    value={item}
                    depth={depth + 1}
                    expandedPaths={expandedPaths}
                    onToggle={onToggle}
                  />
                );
              })
            : Object.entries(value).map(([k, v]) => {
                const itemPath = path ? `${path}.${k}` : k;
                return (
                  <JsonTreeItem
                    key={itemPath}
                    path={itemPath}
                    keyName={k}
                    value={v}
                    depth={depth + 1}
                    expandedPaths={expandedPaths}
                    onToggle={onToggle}
                  />
                );
              })}
        </div>
      )}
    </div>
  );
}

/**
 * Coleta todos os paths do JSON recursivamente
 */
function collectAllPaths(obj, currentPath = "", paths = new Set()) {
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const path = `${currentPath}[${index}]`;
      if (item && typeof item === "object") {
        paths.add(path);
        collectAllPaths(item, path, paths);
      }
    });
  } else if (obj && typeof obj === "object") {
    Object.entries(obj).forEach(([key, value]) => {
      const path = currentPath ? `${currentPath}.${key}` : key;
      if (value && typeof value === "object") {
        paths.add(path);
        collectAllPaths(value, path, paths);
      }
    });
  }
  return paths;
}

/**
 * Componente principal para visualizar o JSON
 */
export default function JsonViewer() {
  // Carrega dados dinamicamente usando o hook
  const { data: surveyData, loading, error, refetch, isFetching } = useSurveyData();

  // Função para calcular paths iniciais expandidos
  const calculateInitialPaths = useCallback((data) => {
    if (!data || typeof data !== "object") return new Set();
    
    const initial = new Set();
    // Adiciona paths dos primeiros 2 níveis
    Object.keys(data).forEach((key) => {
      initial.add(key);
      const value = data[key];
      if (value && typeof value === "object") {
        if (Array.isArray(value)) {
          // Para arrays, expande o primeiro item se existir
          if (value.length > 0 && value[0] && typeof value[0] === "object") {
            initial.add(`${key}[0]`);
          }
        } else {
          // Para objetos, expande as primeiras propriedades
          Object.keys(value).slice(0, 3).forEach((subKey) => {
            initial.add(`${key}.${subKey}`);
          });
        }
      }
    });
    return initial;
  }, []);

  // Estado de paths expandidos - recalcula quando os dados mudam
  const [expandedPaths, setExpandedPaths] = useState(() => new Set());

  // Recalcula paths iniciais quando os dados mudam
  useEffect(() => {
    if (surveyData) {
      setExpandedPaths(calculateInitialPaths(surveyData));
    }
  }, [surveyData, calculateInitialPaths]);

  const togglePath = useCallback((path) => {
    setExpandedPaths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  }, []);

  const expandAll = useCallback(() => {
    if (!surveyData) return;
    const allPaths = collectAllPaths(surveyData);
    setExpandedPaths(allPaths);
  }, [surveyData]);

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set());
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Renderiza estado de loading
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Carregando estrutura do JSON...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Renderiza estado de erro
  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <p className="text-sm text-destructive">Erro ao carregar dados: {error.message}</p>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Renderiza conteúdo quando não há dados
  if (!surveyData) {
    return (
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-2xl">JSON Structure Viewer</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Visualização hierárquica do arquivo surveyData.json - Clique para expandir/colapsar
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isFetching}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button variant="outline" size="sm" onClick={expandAll} disabled={!surveyData}>
                <Maximize2 className="w-4 h-4 mr-2" />
                Expandir Tudo
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                <Minimize2 className="w-4 h-4 mr-2" />
                Colapsar Tudo
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4 overflow-auto max-h-[85vh] border font-mono text-sm">
            <div className="space-y-0.5">
              {Object.entries(surveyData).map(([key, value]) => (
                <JsonTreeItem
                  key={key}
                  path={key}
                  keyName={key}
                  value={value}
                  depth={0}
                  expandedPaths={expandedPaths}
                  onToggle={togglePath}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
