/**
 * Base types for Docx report generation.
 * No React — only JSON report, resolved data, and TypeScript types.
 */

export type DocxRenderContext = {
  reportJson: unknown;
  resolvedData: unknown;
  selectedSections: unknown[];
};

/** Section from report JSON (schema-driven) */
export type DocxSection = {
  id?: string;
  dataPath?: string;
  subsections?: DocxSubsection[];
  components?: DocxComponent[];
  [key: string]: unknown;
};

/** Subsection from report JSON */
export type DocxSubsection = {
  id?: string;
  name?: string;
  index?: number;
  components?: DocxComponent[];
  [key: string]: unknown;
};

/** Component from report JSON (card, table, chart, text, etc.) */
export type DocxComponent = {
  type?: string;
  index?: number;
  dataPath?: string;
  components?: DocxComponent[];
  [key: string]: unknown;
};

/** Result of rendering a single component for DOCX (e.g. paragraph, table, placeholder) */
export type DocxComponentOutput = {
  type: "paragraph" | "table" | "placeholder" | "heading";
  content?: unknown;
  [key: string]: unknown;
};

/** Single block emitted by a DOCX component handler (paragraph, table, heading, etc.) */
export type DocxBlock = {
  type: string;
  content?: unknown;
  [key: string]: unknown;
};

/** Handler signature: component + resolved data + context → DOCX blocks */
export type DocxComponentHandler = (
  component: DocxComponent,
  data: unknown,
  context: DocxRenderContext
) => Promise<DocxBlock[]>;
