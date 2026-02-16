/**
 * Renders the full document from context: sections → subsections → components.
 * Builds a docx Document with HeadingLevel 1 per section.name, HeadingLevel 2 per subsection.name.
 * No fixed sections; no hardcoded names. A4 margins 720 twips.
 */

import { Document, Paragraph, TextRun, HeadingLevel, Table } from "docx";
import type { DocxRenderContext, DocxBlock } from "./types";
import { renderSection } from "./renderSection";

const A4_MARGIN_TWIPS = 720;

function isDocxFileChild(value: unknown): value is Paragraph | Table {
  if (!value || typeof value !== "object") return false;
  const name = (value as { constructor?: { name?: string } }).constructor?.name ?? "";
  return name === "Paragraph" || name === "Table";
}

/** Normalize selectedSections: (sectionId | { id } | { sectionId, subsectionId })[] → unique section IDs in order + optional subsection filter */
function normalizeSelectedSections(selectedSections: unknown[]): { sectionIds: string[]; subsectionFilter: Map<string, Set<string>> } {
  const sectionIds: string[] = [];
  const seenSections = new Set<string>();
  const subsectionFilter = new Map<string, Set<string>>();

  for (const ref of selectedSections) {
    if (ref == null) continue;
    let sectionId: string;
    let subsectionId: string | undefined;
    if (typeof ref === "string") {
      sectionId = ref;
    } else if (typeof ref === "object" && "id" in ref && typeof (ref as { id: unknown }).id === "string") {
      sectionId = (ref as { id: string }).id;
    } else if (typeof ref === "object" && "sectionId" in ref && typeof (ref as { sectionId: unknown }).sectionId === "string") {
      sectionId = (ref as { sectionId: string }).sectionId;
      subsectionId = typeof (ref as { subsectionId?: unknown }).subsectionId === "string" ? (ref as { subsectionId: string }).subsectionId : undefined;
    } else {
      continue;
    }
    if (!seenSections.has(sectionId)) {
      seenSections.add(sectionId);
      sectionIds.push(sectionId);
    }
    if (subsectionId) {
      let set = subsectionFilter.get(sectionId);
      if (!set) {
        set = new Set();
        subsectionFilter.set(sectionId, set);
      }
      set.add(subsectionId);
    }
  }

  return { sectionIds, subsectionFilter };
}

/**
 * Renders the document by iterating selected sections, then subsections, then components.
 * Returns a docx Document instance (use Packer.toBlob(document) to get a Blob).
 */
export async function renderDocument(context: DocxRenderContext): Promise<Document> {
  const { reportJson, resolvedData, selectedSections } = context;
  const raw = Array.isArray(selectedSections) ? selectedSections : [];
  const { sectionIds, subsectionFilter } = normalizeSelectedSections(raw);
  const children: (Paragraph | Table)[] = [];

  for (const sectionId of sectionIds) {
    const sectionResult = await renderSection(context, sectionId);
    if (!sectionResult) continue;

    const sectionTitle = sectionResult.sectionName ?? sectionResult.sectionId ?? "";
    if (sectionTitle) {
      children.push(
        new Paragraph({
          children: [new TextRun(sectionTitle)],
          heading: HeadingLevel.HEADING_1,
        })
      );
    }

    const allowedSubs = subsectionFilter.get(sectionId);

    for (const subResult of sectionResult.subsections) {
      if (allowedSubs && allowedSubs.size > 0 && subResult.subsectionId != null && !allowedSubs.has(subResult.subsectionId)) {
        continue;
      }
      const subsectionTitle = subResult.name ?? subResult.subsectionId ?? "";
      if (subsectionTitle) {
        children.push(
          new Paragraph({
            children: [new TextRun(subsectionTitle)],
            heading: HeadingLevel.HEADING_2,
          })
        );
      }

      for (const block of subResult.blocks as DocxBlock[]) {
        if (isDocxFileChild(block.content)) {
          children.push(block.content);
        }
      }
    }
  }

  void reportJson;
  void resolvedData;

  const sectionOptions = {
    properties: {
      page: {
        margin: {
          top: A4_MARGIN_TWIPS,
          bottom: A4_MARGIN_TWIPS,
          left: A4_MARGIN_TWIPS,
          right: A4_MARGIN_TWIPS,
        },
      },
    },
    children,
  };

  return new Document({
    sections: [sectionOptions],
  });
}
