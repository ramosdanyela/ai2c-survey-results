import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Analytical Table Component (Ranking Table)
 * 
 * Displays data in a sortable table format with ranking support.
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of data objects
 * @param {Array} props.columns - Column configurations: [{ key, label, sortable, formatter }]
 * @param {boolean} [props.showRanking=true] - Show ranking column
 * @param {Object} [props.defaultSort] - Default sort: { key, direction: "asc" | "desc" }
 * @param {string} [props.rankingKey] - Key to use for ranking (defaults to first sortable column)
 */
export function AnalyticalTable({
  data = [],
  columns = [],
  showRanking = true,
  defaultSort,
  rankingKey,
}) {
  const [sortConfig, setSortConfig] = useState(
    defaultSort || (columns.find((c) => c.sortable) 
      ? { key: columns.find((c) => c.sortable).key, direction: "desc" }
      : null)
  );

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      // Handle null/undefined
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Compare values
      let comparison = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [data, sortConfig]);

  // Handle sort
  const handleSort = (key) => {
    if (!columns.find((c) => c.key === key)?.sortable) return;

    setSortConfig((prev) => {
      if (prev?.key === key) {
        // Toggle direction
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      // New column, default to desc
      return { key, direction: "desc" };
    });
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig?.key !== key) {
      return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  // Get ranking value
  const getRankingValue = (item, index) => {
    if (rankingKey) {
      return item[rankingKey];
    }
    // Use sorted value for ranking
    return index + 1;
  };

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Nenhum dado disponível</p>
      </div>
    );
  }

  if (!columns || columns.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Nenhuma coluna configurada</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {showRanking && (
              <TableHead className="w-16 text-center">Rank</TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={column.sortable ? "cursor-pointer select-none hover:bg-muted/50" : ""}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item, index) => (
            <TableRow key={index}>
              {showRanking && (
                <TableCell className="text-center font-semibold">
                  {getRankingValue(item, index)}
                </TableCell>
              )}
              {columns.map((column) => {
                const value = item[column.key];
                const displayValue = column.formatter
                  ? column.formatter(value, item, index)
                  : value;

                return (
                  <TableCell key={column.key}>
                    {displayValue}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

