/**
 * DOCX handler for chart components.
 * Resolves data, generates PNG via generateChartImage, inserts ImageRun + optional title/description.
 */

import { Paragraph, TextRun, ImageRun, HeadingLevel } from "docx";
import { resolveDataPath } from "@/report-engine/dataResolvers";
import { generateChartImage } from "../chartImageRenderer";
import { base64ToUint8Array } from "../utils";
import type { DocxRenderContext, DocxComponent, DocxBlock } from "../types";

const IMAGE_WIDTH = 500;
const IMAGE_HEIGHT = 300;

function getString(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value.trim() || undefined;
  return String(value).trim() || undefined;
}

/**
 * Renders a chart component for DOCX: optional title (Heading 3), description (paragraph),
 * then chart image (ImageRun in a paragraph).
 */
export async function handleChart(
  component: DocxComponent,
  data: unknown,
  context: DocxRenderContext
): Promise<DocxBlock[]> {
  const resolvedData = context.resolvedData as Record<string, unknown> | null | undefined;
  const chartData = resolveDataPath(resolvedData, component.dataPath ?? null, component.data);

  const props = (component.props ?? component) as Record<string, unknown>;
  const title = getString(props.title);
  const description = getString(props.description);

  const blocks: DocxBlock[] = [];

  if (title) {
    blocks.push({
      type: "heading",
      content: new Paragraph({
        children: [new TextRun(title)],
        heading: HeadingLevel.HEADING_3,
      }),
    });
  }

  if (description) {
    blocks.push({
      type: "paragraph",
      content: new Paragraph({
        children: [new TextRun(description)],
      }),
    });
  }

  const dataForChart = resolvedData ?? (data as Record<string, unknown>);
  const dataUrl = await generateChartImage(
    component as import("../chartImageRenderer").ChartImageComponent,
    dataForChart ?? {}
  );

  if (!dataUrl) {
    return blocks;
  }

  const imageData = base64ToUint8Array(dataUrl);
  const imageParagraph = new Paragraph({
    children: [
      new ImageRun({
        type: "png",
        data: imageData,
        transformation: {
          width: IMAGE_WIDTH,
          height: IMAGE_HEIGHT,
        },
      }),
    ],
  });

  blocks.push({ type: "paragraph", content: imageParagraph });
  return blocks;
}
