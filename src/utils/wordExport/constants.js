// A4 page dimensions in twips (1 twip = 1/1440 inch)
export const PAGE_WIDTH = 11906; // 210mm
export const PAGE_HEIGHT = 16838; // 297mm
export const PAGE_MARGIN = 567; // ~10mm

// Usable width in EMU (English Metric Units, 1 inch = 914400 EMU)
export const USABLE_WIDTH_EMU = Math.round(
  ((PAGE_WIDTH - 2 * PAGE_MARGIN) / 1440) * 914400
);

// Usable height in EMU (page height minus top + bottom margins)
export const USABLE_HEIGHT_EMU = Math.round(
  ((PAGE_HEIGHT - 2 * PAGE_MARGIN) / 1440) * 914400
);

// html2canvas options
export const HTML2CANVAS_OPTIONS = {
  scale: 2,
  useCORS: true,
  backgroundColor: "#ffffff",
  logging: false,
};
