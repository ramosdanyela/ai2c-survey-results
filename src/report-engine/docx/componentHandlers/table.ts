/**
 * DOCX handler for table components.
 * If resolved data is an array: builds a docx Table with header row (keys or config.columns)
 * and one row per item. No fixed styles; Word-native compatible.
 */

import { Table, TableRow, TableCell, Paragraph, TextRun } from "docx";
import type { DocxRenderContext, DocxComponent, DocxBlock } from "../types";

type ColumnDef = { key?: string; label?: string; [k: string]: unknown };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getColumns(component: DocxComponent, firstRow: Record<string, unknown>): ColumnDef[] {
  const config = component.config as { columns?: ColumnDef[] } | undefined;
  if (config?.columns && Array.isArray(config.columns) && config.columns.length > 0) {
    return config.columns.map((col) => ({
      key: typeof col.key === "string" ? col.key : String(col?.key ?? ""),
      label: typeof col.label === "string" ? col.label : (col.key != null ? String(col.key) : ""),
    }));
  }
  return Object.keys(firstRow).map((key) => ({ key, label: key }));
}

function buildTableRows(
  data: unknown[],
  columns: ColumnDef[]
): TableRow[] {
  const rows: TableRow[] = [];

  const headerCells = columns.map((col) => {
    const p = new Paragraph({ children: [new TextRun(col.label)] });
    return new TableCell({ children: [p] });
  });
  rows.push(
    new TableRow({
      children: headerCells,
      tableHeader: true,
    })
  );

  for (const row of data) {
    if (!isRecord(row)) continue;
    const cells = columns.map((col) => {
      const value = col.key in row ? row[col.key] : "";
      const p = new Paragraph({ children: [new TextRun(String(value ?? ""))] });
      return new TableCell({ children: [p] });
    });
    rows.push(new TableRow({ children: cells }));
  }

  return rows;
}

/**
 * Renders a table component for DOCX when resolved data is an array.
 */
export async function handleTable(
  component: DocxComponent,
  data: unknown,
  _context: DocxRenderContext
): Promise<DocxBlock[]> {
  if (!Array.isArray(data) || data.length === 0) return [];

  const first = data[0];
  if (!isRecord(first)) return [];

  const columns = getColumns(component, first);
  if (columns.length === 0) return [];

  const tableRows = buildTableRows(data, columns);
  const table = new Table({
    rows: tableRows,
  });

  return [{ type: "table", content: table }];
}
