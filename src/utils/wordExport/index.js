import { walkExportDom } from "./domWalker";
import { captureElementAsBase64 } from "./imageCapture";
import { buildDocxDocument } from "./docxBuilder";
import { Packer } from "docx";

/**
 * Export the ExportPreview A4 wrapper to a .docx file.
 * Text/headings become native DOCX elements; charts/tables/cards are captured as PNG images.
 *
 * @param {HTMLElement} a4WrapperElement - The .export-preview-a4-wrapper DOM element
 * @param {string} fileName - Base filename (without extension)
 * @param {(current: number, total: number) => void} [onProgress] - Progress callback
 */
export async function exportToWord(a4WrapperElement, fileName, onProgress) {
  // Wait for any pending canvas/SVG renders
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Walk DOM to get block list
  const blocks = walkExportDom(a4WrapperElement);

  // Count image blocks
  const imageBlocks = blocks.filter((b) => b.type === "image");
  const total = imageBlocks.length;

  // Capture each image block sequentially (html2canvas can race)
  let current = 0;
  for (const block of imageBlocks) {
    current++;
    if (onProgress) onProgress(current, total);

    try {
      block.imageData = await captureElementAsBase64(block.element);
    } catch (err) {
      console.warn("Failed to capture element:", err);
      // Replace with a placeholder text block so the export doesn't break
      block.type = "text";
      block.text = "[Image capture failed]";
    }
  }

  // Build the DOCX document
  const doc = buildDocxDocument(blocks);

  // Pack and download
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
