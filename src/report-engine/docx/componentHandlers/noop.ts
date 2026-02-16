/**
 * DOCX handler for component types that are recognized but produce no DOCX output
 * (e.g. container, questionsList, filterPills, accordion, wordCloud).
 * No React — only JSON and resolved data.
 */

import type { DocxRenderContext, DocxComponent, DocxBlock } from "../types";

/**
 * Returns no blocks (component type is recognized but not rendered to DOCX).
 */
export async function handleNoop(
  _component: DocxComponent,
  _data: unknown,
  _context: DocxRenderContext
): Promise<DocxBlock[]> {
  return [];
}
