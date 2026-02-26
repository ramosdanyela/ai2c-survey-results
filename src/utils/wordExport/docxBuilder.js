import {
  Document,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
} from "docx";
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_MARGIN,
  USABLE_WIDTH_EMU,
  USABLE_HEIGHT_EMU,
} from "./constants";

/**
 * Convert a base64 data URL to a Uint8Array for docx ImageRun.
 */
function base64ToUint8Array(dataUrl) {
  const base64 = dataUrl.split(",")[1];
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Build a DOCX Document from an array of ExportBlock objects.
 *
 * @param {Array<ExportBlock>} blocks
 * @returns {Document}
 */
export function buildDocxDocument(blocks) {
  const children = [];

  for (const block of blocks) {
    switch (block.type) {
      case "image":
        children.push(buildImageParagraph(block));
        break;
      case "heading":
        children.push(buildHeadingParagraph(block));
        break;
      case "text":
        children.push(...buildTextParagraphs(block));
        break;
      case "list":
        children.push(...buildListParagraphs(block));
        break;
      case "spacer":
        children.push(buildSpacerParagraph());
        break;
      case "separator":
        children.push(buildSeparatorParagraph());
        break;
      case "timestamp":
        children.push(buildTimestampParagraph(block));
        break;
    }
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
            },
            margin: {
              top: PAGE_MARGIN,
              bottom: PAGE_MARGIN,
              left: PAGE_MARGIN,
              right: PAGE_MARGIN,
            },
          },
        },
        children,
      },
    ],
  });
}

function buildImageParagraph(block) {
  const { base64, widthPx, heightPx } = block.imageData;
  const data = base64ToUint8Array(base64);

  // Scale to fit within both usable width AND height, maintaining aspect ratio.
  // Using the smallest scale factor ensures the image never overflows the page
  // in either dimension, which is required for keepLines to work correctly.
  const usableWidthPx = (USABLE_WIDTH_EMU / 914400) * 96;  // EMU -> inches -> px at 96dpi
  const usableHeightPx = (USABLE_HEIGHT_EMU / 914400) * 96;
  const scale = Math.min(1, usableWidthPx / widthPx, usableHeightPx / heightPx);
  const finalWidthEmu = Math.round(widthPx * scale * (914400 / 96));
  const finalHeightEmu = Math.round(heightPx * scale * (914400 / 96));

  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    // keepLines: prevents Word from splitting the image across two pages.
    // If the image doesn't fit on the current page, Word moves it entirely
    // to the next page instead of cutting it at the page boundary.
    keepLines: true,
    children: [
      new ImageRun({
        data,
        transformation: {
          width: Math.round(finalWidthEmu / 9525), // EMU to points for docx lib
          height: Math.round(finalHeightEmu / 9525),
        },
        type: "png",
      }),
    ],
  });
}

function buildHeadingParagraph(block) {
  const levelMap = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
  };

  return new Paragraph({
    heading: levelMap[block.level] || HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text: block.text,
        bold: true,
        font: "Arial",
        size: block.level === 1 ? 32 : block.level === 2 ? 26 : block.level === 3 ? 24 : 22,
      }),
    ],
  });
}

function buildTextParagraphs(block) {
  const lines = (block.text || "").split("\n");
  return lines.map((line, i) =>
    new Paragraph({
      spacing: {
        after: i < lines.length - 1 ? 80 : 120,
      },
      children: [
        new TextRun({
          text: line,
          font: "Arial",
          size: 22, // 11pt in half-points
        }),
      ],
    }),
  );
}

/**
 * Build one paragraph per list item with Word bullet formatting.
 * @param {{ type: 'list', items: string[] }} block
 * @returns {Paragraph[]}
 */
function buildListParagraphs(block) {
  const { items } = block;
  if (!items || items.length === 0) return [];
  return items.map((item) =>
    new Paragraph({
      bullet: { level: 0 },
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: item,
          font: "Arial",
          size: 22,
        }),
      ],
    }),
  );
}

function buildSpacerParagraph() {
  return new Paragraph({
    spacing: { after: 200 },
    children: [],
  });
}

function buildSeparatorParagraph() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: "CCCCCC",
      },
    },
    children: [],
  });
}

function buildTimestampParagraph(block) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200 },
    children: [
      new TextRun({
        text: block.text,
        font: "Arial",
        size: 18, // 9pt
        color: "888888",
      }),
    ],
  });
}
