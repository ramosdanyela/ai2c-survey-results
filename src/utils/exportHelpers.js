import {
  getQuestionsFromData,
  getQuestionsSection,
  isQuestionsSectionId,
} from "@/services/dataResolver";

/**
 * Get all available subsections for a given section
 */
export function getAllSubsectionsForSection(sectionId, data) {
  // Get sections from data - must come from hook
  if (!data?.sections) return [];
  const section = data.sections.find((s) => s.id === sectionId);
  if (!section) return [];

  // Seção com subseções (executive, support, attributes, etc.)
  if (section.subsections?.length > 0) {
    return section.subsections
      .sort((a, b) => (a.index || 0) - (b.index || 0))
      .map((sub) => ({
        sectionId: section.id,
        subsectionId: sub.id,
        label: sub.name,
      }));
  }

  // Seção responses/questions: subseções dinâmicas a partir de questions
  if (isQuestionsSectionId(sectionId)) {
    const allQuestions = getQuestionsFromData(data);

    if (allQuestions.length === 0) {
      console.warn("Export: No questions found", {
        hasData: !!data,
        hasSections: !!data?.sections,
        questionsSection: getQuestionsSection(data),
      });
      return [];
    }

    // Não aplicar filtros que ocultam questões - todas as questões devem ser exportadas
    // Ordenar questões pelo index do JSON
    const sortedQuestions = allQuestions.sort(
      (a, b) => (a.index || 0) - (b.index || 0),
    );

    return sortedQuestions.map((q, index) => {
      const displayNumber = index + 1;
      return {
        sectionId,
        subsectionId: `responses-${q.id}`,
        label: `Pergunta ${displayNumber}: ${
          q.question && q.question.length > 60
            ? q.question.substring(0, 60) + "..."
            : q.question || ""
        }`,
      };
    });
  }

  return [];
}

/**
 * Get all subsections for all sections (for full report)
 */
export function getAllSubsections(data) {
  const allSubsections = [];

  // Get sections from data - must come from hook
  if (!data?.sections) return [];

  data.sections
    .filter((section) => section.id !== "export") // Export é página do app, não seção de conteúdo
    .forEach((section) => {
      const subsections = getAllSubsectionsForSection(section.id, data);
      allSubsections.push(...subsections);
    });

  return allSubsections;
}

/**
 * Parse selected sections from URL params or array
 * Returns array of { sectionId, subsectionId } objects
 */
export function parseSelectedSections(
  selectedSectionsArray,
  exportFullReport,
  data,
) {
  if (exportFullReport) {
    // Return all subsections
    return getAllSubsections(data);
  }

  // Parse selected subsection IDs
  const parsed = [];

  // Get sections from data - must come from hook
  if (!data?.sections) return [];

  selectedSectionsArray.forEach((subsectionId) => {
    let sectionId = null;
    const sectionWithSub = data.sections.find((s) =>
      s.subsections?.some((sub) => sub.id === subsectionId),
    );
    if (sectionWithSub) {
      sectionId = sectionWithSub.id;
    } else if (subsectionId.startsWith("responses-")) {
      sectionId = getQuestionsSection(data)?.id ?? "responses";
    }

    if (sectionId) {
      // Check for duplicates before adding
      const exists = parsed.some(
        (p) => p.sectionId === sectionId && p.subsectionId === subsectionId,
      );

      if (!exists) {
        // Get the label
        const allSubs = getAllSubsectionsForSection(sectionId, data);
        const found = allSubs.find((sub) => sub.subsectionId === subsectionId);

        parsed.push({
          sectionId,
          subsectionId,
          label: found?.label || subsectionId,
        });
      }
    }
  });

  // Sort by section order and subsection order
  return parsed.sort((a, b) => {
    const sectionA = data.sections.find((s) => s.id === a.sectionId);
    const sectionB = data.sections.find((s) => s.id === b.sectionId);
    const sectionOrderA = sectionA?.index || 999;
    const sectionOrderB = sectionB?.index || 999;

    if (sectionOrderA !== sectionOrderB) {
      return sectionOrderA - sectionOrderB;
    }

    const subsectionA = sectionA?.subsections?.find(
      (sub) => sub.id === a.subsectionId,
    );
    const subsectionB = sectionB?.subsections?.find(
      (sub) => sub.id === b.subsectionId,
    );
    let subOrderA = subsectionA?.index;
    let subOrderB = subsectionB?.index;

    if (subOrderA === undefined && isQuestionsSectionId(a.sectionId)) {
      // Extract question ID and find its index from data
      const questionId = parseInt(a.subsectionId.replace("responses-", ""), 10);
      const allQuestions = getQuestionsFromData(data);
      const question = allQuestions.find((q) => q.id === questionId);
      subOrderA = question?.index || 999;
    }

    if (subOrderB === undefined && isQuestionsSectionId(b.sectionId)) {
      const questionId = parseInt(b.subsectionId.replace("responses-", ""), 10);
      const allQuestions = getQuestionsFromData(data);
      const question = allQuestions.find((q) => q.id === questionId);
      subOrderB = question?.index || 999;
    }

    return (subOrderA || 999) - (subOrderB || 999);
  });
}

/**
 * Use html2canvas to render a live DOM element as a PNG image.
 * Returns an <img> element with the data URI, or null on failure.
 */
async function elementToImage(element) {
  const { default: html2canvas } = await import("html2canvas");

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const dataUri = canvas.toDataURL("image/png");
  const rect = element.getBoundingClientRect();

  const img = document.createElement("img");
  img.src = dataUri;
  img.width = Math.round(rect.width);
  img.style.display = "block";
  img.style.maxWidth = "100%";
  img.style.height = "auto";
  return img;
}

/**
 * Selectors for elements that should be rendered as images in Word export.
 * Charts and tables don't translate well to Word HTML, so we screenshot them.
 */
const IMAGE_SELECTORS = [
  ".recharts-responsive-container",
  ".export-bar-chart-wrapper",
  "table",
];

/**
 * Convert charts and tables in the original DOM to PNG images,
 * then replace the matching elements in the clone with those images.
 * Everything else (text, headings, badges) remains as HTML.
 */
async function convertComplexElementsToImages(originalContainer, cloneContainer) {
  for (const selector of IMAGE_SELECTORS) {
    const originals = originalContainer.querySelectorAll(selector);
    const clones = cloneContainer.querySelectorAll(selector);

    for (let i = 0; i < originals.length && i < clones.length; i++) {
      try {
        const img = await elementToImage(originals[i]);
        if (img && clones[i].parentNode) {
          clones[i].parentNode.replaceChild(img, clones[i]);
        }
      } catch (err) {
        console.warn("Failed to convert element to image:", selector, err);
      }
    }
  }
}

/**
 * Convert any remaining SVG elements (icons, etc.) in the clone to inline PNG images.
 * Runs after convertComplexElementsToImages so chart SVGs are already handled.
 */
async function convertRemainingSvgsToImages(container) {
  const svgs = container.querySelectorAll("svg");
  const promises = Array.from(svgs).map(async (svg) => {
    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      const canvas = document.createElement("canvas");
      const width = svg.getAttribute("width") || svg.clientWidth || 24;
      const height = svg.getAttribute("height") || svg.clientHeight || 24;
      canvas.width = Number(width) * 2;
      canvas.height = Number(height) * 2;
      const ctx = canvas.getContext("2d");
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0, Number(width), Number(height));

      const pngDataUri = canvas.toDataURL("image/png");
      URL.revokeObjectURL(url);

      const imgElement = document.createElement("img");
      imgElement.src = pngDataUri;
      imgElement.width = Number(width);
      imgElement.height = Number(height);
      imgElement.style.display = "inline-block";
      imgElement.style.verticalAlign = "middle";

      svg.parentNode.replaceChild(imgElement, svg);
    } catch {
      svg.remove();
    }
  });

  await Promise.all(promises);
}

/**
 * Generate a Word (.doc) document from an HTML container element and trigger download.
 * Charts and tables are rendered as PNG images (pixel-perfect).
 * Everything else (text, titles, badges) is kept as HTML.
 * @param {HTMLElement} containerElement - The DOM element whose content will be exported
 * @param {string} fileName - The name of the downloaded file (without extension)
 */
export async function generateWordDocument(containerElement, fileName) {
  // Clone the container so we don't modify the actual DOM
  const clone = containerElement.cloneNode(true);

  // Remove elements that should not appear in the export
  clone.querySelectorAll(".no-print").forEach((el) => el.remove());

  // 1. Render charts & tables as images (uses html2canvas on ORIGINAL elements,
  //    then replaces matching elements in the CLONE)
  await convertComplexElementsToImages(containerElement, clone);

  // 2. Convert any leftover SVGs (icons) in the clone
  await convertRemainingSvgsToImages(clone);

  // 3. Inline computed styles on remaining HTML elements for Word compatibility
  inlineComputedStyles(containerElement, clone);

  // Build Word-compatible HTML with Office XML namespaces
  const htmlString = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: 210mm 297mm;
      margin: 10mm 15mm;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #1a1a1a;
      font-size: 11pt;
      line-height: 1.4;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>${clone.innerHTML}</body>
</html>`;

  // BOM (\ufeff) ensures Word reads the encoding correctly
  const blob = new Blob(["\ufeff", htmlString], {
    type: "application/msword",
  });

  // Trigger download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export as Word using the structured DocxRenderer (no html2canvas, no DOM clone).
 * @param {object} data - Full report/survey data (used as reportJson and resolvedData)
 * @param {Array<{ sectionId: string, subsectionId: string, label?: string }>} sectionsToRender - Selected sections/subsections from parseSelectedSections
 * @param {string} fileName - Base name for the file (without extension)
 */
export async function handleStructuredDocxExport(data, sectionsToRender, fileName) {
  const { generateDocxReport } = await import("@/report-engine/docx");
  const context = {
    reportJson: data,
    resolvedData: data,
    selectedSections: sectionsToRender,
  };
  const blob = await generateDocxReport(context);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Walk the original DOM tree and the cloned tree in parallel,
 * copying key computed styles as inline styles on the clone.
 * Skips elements that were already replaced with images.
 */
function inlineComputedStyles(original, clone) {
  const PROPS = [
    "color",
    "background-color",
    "font-size",
    "font-weight",
    "font-family",
    "text-align",
    "padding",
    "margin",
    "border",
    "border-radius",
    "display",
    "flex-direction",
    "gap",
    "justify-content",
    "align-items",
    "width",
    "max-width",
    "min-width",
  ];

  if (original.nodeType !== 1 || clone.nodeType !== 1) return;
  // Skip if the clone element was replaced with an <img>
  if (clone.tagName === "IMG" && clone.src?.startsWith("data:")) return;

  const computed = window.getComputedStyle(original);
  for (const prop of PROPS) {
    const val = computed.getPropertyValue(prop);
    if (val) {
      clone.style.setProperty(prop, val);
    }
  }

  const origChildren = original.children;
  const cloneChildren = clone.children;
  const len = Math.min(origChildren.length, cloneChildren.length);
  for (let i = 0; i < len; i++) {
    inlineComputedStyles(origChildren[i], cloneChildren[i]);
  }
}
