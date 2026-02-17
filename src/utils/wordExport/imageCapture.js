import { HTML2CANVAS_OPTIONS } from "./constants";

/**
 * Capture a DOM element as a PNG base64 data URL using html2canvas.
 * @param {HTMLElement} element - The DOM element to capture
 * @param {object} [options] - Override html2canvas options
 * @returns {Promise<{ base64: string, widthPx: number, heightPx: number }>}
 */
export async function captureElementAsBase64(element, options = {}) {
  const { default: html2canvas } = await import("html2canvas");

  const canvas = await html2canvas(element, {
    ...HTML2CANVAS_OPTIONS,
    ...options,
  });

  const base64 = canvas.toDataURL("image/png");
  const rect = element.getBoundingClientRect();

  return {
    base64,
    widthPx: Math.round(rect.width),
    heightPx: Math.round(rect.height),
  };
}
