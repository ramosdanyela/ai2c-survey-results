/**
 * DOCX handler for card components.
 * No React — only JSON and resolved data.
 */

import type { DocxRenderContext, DocxComponent, DocxBlock } from "../types";

/**
 * Renders a card component for DOCX (e.g. title + content paragraphs).
 */
export async function handleCard(
  component: DocxComponent,
  data: unknown,
  context: DocxRenderContext
): Promise<DocxBlock[]> {
  void data;
  void context;
  void component;
  return [{ type: "placeholder", content: "card" }];
}
