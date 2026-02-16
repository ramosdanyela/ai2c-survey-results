/**
 * Renders a single subsection (and its components) for DOCX.
 * No React — only JSON and resolved data.
 */

import type { DocxRenderContext, DocxSection, DocxSubsection, DocxBlock } from "./types";
import { renderComponent } from "./renderComponent";

export type RenderSubsectionResult = {
  subsectionId?: string;
  name?: string;
  blocks: DocxBlock[];
};

/**
 * Renders one subsection: uses section config and subsection config, renders each component.
 * All component outputs are flattened into a single blocks array.
 */
export async function renderSubsection(
  context: DocxRenderContext,
  section: DocxSection,
  subsection: DocxSubsection
): Promise<RenderSubsectionResult | null> {
  const { resolvedData } = context;
  const components = subsection.components ?? section.components ?? [];
  const blocks: DocxBlock[] = [];

  for (const component of components) {
    const componentBlocks = await renderComponent(context, component);
    blocks.push(...componentBlocks);
  }

  void resolvedData;
  return {
    subsectionId: subsection.id,
    name: subsection.name,
    blocks,
  };
}
