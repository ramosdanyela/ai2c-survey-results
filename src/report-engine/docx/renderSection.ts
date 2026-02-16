/**
 * Renders a single section (and its subsections) for DOCX.
 * No React — only JSON and resolved data.
 */

import type { DocxRenderContext, DocxSection } from "./types";
import { renderSubsection, type RenderSubsectionResult } from "./renderSubsection";

export type RenderSectionResult = {
  sectionId?: string;
  sectionName?: string;
  subsections: RenderSubsectionResult[];
};

/**
 * Renders one section: finds section config in reportJson and renders each subsection.
 */
export async function renderSection(
  context: DocxRenderContext,
  sectionRef: unknown
): Promise<RenderSectionResult | null> {
  const { reportJson, resolvedData } = context;
  const report = reportJson as { sections?: DocxSection[] };
  const sectionId = typeof sectionRef === "object" && sectionRef !== null && "id" in sectionRef
    ? (sectionRef as { id: string }).id
    : String(sectionRef);

  const section = report?.sections?.find((s) => s.id === sectionId) ?? null;
  if (!section) return null;

  const subsections = section.subsections ?? [];
  const subsectionResults: RenderSubsectionResult[] = [];

  for (const sub of subsections) {
    const subResult = await renderSubsection(context, section, sub);
    if (subResult) subsectionResults.push(subResult);
  }

  void resolvedData;
  const sectionName = typeof section.name === "string" ? section.name : undefined;
  return { sectionId, sectionName, subsections: subsectionResults };
}
