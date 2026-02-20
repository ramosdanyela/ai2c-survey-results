/**
 * Walk the ExportPreview A4 wrapper DOM and classify elements
 * using explicit `data-word-export` attributes set by React components.
 *
 * This is a clean separation layer: components declare their export type
 * via data attributes (only when isExport=true), and this walker reads them.
 *
 * @param {HTMLElement} a4Wrapper - The .export-preview-a4-wrapper element
 * @returns {Array<ExportBlock>} Ordered list of blocks
 */
export function walkExportDom(a4Wrapper) {
  const blocks = [];
  processChildren(a4Wrapper, blocks);
  return blocks;
}

function isHidden(el) {
  if (el.classList?.contains("no-print")) return true;
  const style = window.getComputedStyle(el);
  return style.display === "none" || style.visibility === "hidden";
}

function processChildren(container, blocks) {
  const children = container.children;
  if (!children) return;

  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (isHidden(el)) continue;

    const exportType = el.getAttribute?.("data-word-export");

    if (exportType) {
      // Element has an explicit export type - classify and DON'T recurse
      const block = classify(el, exportType);
      if (block) {
        if (Array.isArray(block)) {
          blocks.push(...block);
        } else {
          blocks.push(block);
        }
      }
    } else if (el.children && el.children.length > 0) {
      // No export type - recurse into children
      processChildren(el, blocks);
    }
    // Leaf nodes without data-word-export are ignored (decorative)
  }
}

function classify(el, exportType) {
  switch (exportType) {
    case "image":
      return { type: "image", element: el };

    case "h1": {
      const text = el.getAttribute("data-word-text") || getPlainText(el);
      return text ? { type: "heading", text, level: 1 } : null;
    }

    case "h2": {
      const text = el.getAttribute("data-word-text") || getPlainText(el);
      if (!text) return null;
      const blocks = [{ type: "heading", text, level: 2 }];
      // Check for summary text in a child with data-word-export="text"
      const summaryEl = el.querySelector?.('[data-word-export="text"]');
      if (summaryEl) {
        const summaryText =
          summaryEl.getAttribute("data-word-text") || getPlainText(summaryEl);
        if (summaryText) blocks.push({ type: "text", text: summaryText });
      }
      return blocks;
    }

    case "h3": {
      const text = el.getAttribute("data-word-text") || getPlainText(el);
      return text ? { type: "heading", text, level: 3 } : null;
    }

    case "h4": {
      const text = el.getAttribute("data-word-text") || getPlainText(el);
      return text ? { type: "heading", text, level: 4 } : null;
    }

    case "text": {
      const text = el.getAttribute("data-word-text") || getPlainText(el);
      return text ? { type: "text", text } : null;
    }

    case "list": {
      const listJson = el.getAttribute("data-word-list");
      if (!listJson) return null;
      try {
        const items = JSON.parse(listJson);
        if (!Array.isArray(items) || items.length === 0) return null;
        return { type: "list", items: items.map((i) => String(i).trim()).filter(Boolean) };
      } catch {
        return null;
      }
    }

    case "separator":
      return { type: "separator" };

    case "timestamp": {
      const text = el.getAttribute("data-word-text") || getPlainText(el);
      return text ? { type: "timestamp", text } : null;
    }

    case "skip":
      return null;

    default:
      return null;
  }
}

/**
 * Extract plain text from an element, stripping SVGs/icons.
 */
function getPlainText(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll("svg, img, .lucide").forEach((n) => n.remove());
  return (clone.textContent || "").replace(/\s+/g, " ").trim();
}
