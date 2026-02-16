/**
 * DocxRendererEngine — generates DOCX reports from report JSON and resolved data.
 * Completely decoupled from React; no visual components.
 */

import { Packer } from "docx";
import type { DocxRenderContext } from "./types";
import { renderDocument } from "./renderDocument";

export type {
  DocxRenderContext,
  DocxSection,
  DocxSubsection,
  DocxComponent,
  DocxComponentOutput,
  DocxBlock,
  DocxComponentHandler,
} from "./types";
export { renderDocument } from "./renderDocument";
export { renderComponent, registerComponentHandler, isComponentTypeRegistered } from "./renderComponent";

/**
 * Generates a DOCX report from the given context.
 * @param context - report JSON, resolved data, and selected sections
 * @returns Blob (application/vnd.openxmlformats-officedocument.wordprocessingml.document)
 */
export async function generateDocxReport(context: DocxRenderContext): Promise<Blob> {
  const document = await renderDocument(context);
  return Packer.toBlob(document);
}
