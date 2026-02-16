/**
 * DOCX handler for text/heading components (h3, h4, paragraph).
 * No React — only JSON and resolved data.
 */

import type { DocxRenderContext, DocxComponent, DocxBlock } from "../types";

/**
 * Renders a text or heading component for DOCX.
 */
export async function handleText(
  component: DocxComponent,
  data: unknown,
  context: DocxRenderContext
): Promise<DocxBlock[]> {
  void data;
  void context;
  const blockType = component.type === "h3" || component.type === "h4" ? "heading" : "paragraph";
  const content = (component.text ?? component.content ?? "") as string;
  if (!content) return [];
  return [{ type: blockType, content }];
}
