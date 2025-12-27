import { ExecutiveReport } from "@/components/survey/executive/ExecutiveReport";
import { SupportAnalysis } from "@/components/survey/support/SupportAnalysis";
import { ResponseDetails } from "@/components/survey/responses/ResponseDetails";
import { AttributeDeepDive } from "@/components/survey/attributes/AttributeDeepDive";
import { responseDetails, attributeDeepDive } from "@/data/surveyData";

// Get all questions for navigation (sorted by index, excluding Q3)
const getAllQuestions = () => {
  const allQuestions = [
    ...responseDetails.closedQuestions.map((q) => ({
      ...q,
      type: "closed",
    })),
    ...responseDetails.openQuestions.map((q) => ({
      ...q,
      type: "open",
    })),
  ]
    .filter((q) => q.id !== 3) // Hide Q3
    .sort((a, b) => (a.index || 0) - (b.index || 0));
  return allQuestions.map((q) => `responses-${q.id}`);
};

// Get all attribute subsections for navigation (sorted by index)
const getAllAttributes = () => {
  return attributeDeepDive.attributes
    .filter((attr) => attr.icon)
    .sort((a, b) => (a.index || 0) - (b.index || 0))
    .map((attr) => `attributes-${attr.id}`);
};

export function ContentRenderer({ activeSection, onSectionChange }) {
  let content;

  // Normalize activeSection to ensure it's a specific subsection
  let normalizedSection = activeSection;
  if (activeSection === "executive") {
    normalizedSection = "executive-summary";
  } else if (activeSection === "support") {
    normalizedSection = "support-sentiment";
  } else if (activeSection === "attributes") {
    // If it's just "attributes", map to the first attribute
    const attributes = getAllAttributes();
    normalizedSection = attributes[0] || "attributes";
  }

  // Render executive sections
  if (normalizedSection.startsWith("executive")) {
    // Always pass the specific subsection
    content = (
      <ExecutiveReport
        subSection={normalizedSection}
        onSectionChange={onSectionChange}
      />
    );
  }
  // Render support analyses
  else if (normalizedSection.startsWith("support")) {
    // Always pass the specific subsection
    content = <SupportAnalysis subSection={normalizedSection} />;
  }
  // Render response details
  else if (
    normalizedSection === "responses" ||
    normalizedSection.startsWith("responses-")
  ) {
    // Extract question ID if it's a specific subsection (e.g., responses-1)
    const questionIdMatch = normalizedSection.match(/responses-(\d+)/);
    const questionId = questionIdMatch
      ? parseInt(questionIdMatch[1], 10)
      : undefined;
    // Use key to ensure component updates when questionId changes
    // This ensures the combined logic (open accordion + scroll) is applied
    content = (
      <ResponseDetails key={`question-${questionId}`} questionId={questionId} />
    );
  }
  // Render attribute deep dive
  else if (
    normalizedSection === "attributes" ||
    normalizedSection.startsWith("attributes-")
  ) {
    // Extract attribute ID if it's a specific subsection (e.g., attributes-customerType)
    const attributeIdMatch = normalizedSection.match(/attributes-(.+)/);
    const attributeId = attributeIdMatch ? attributeIdMatch[1] : undefined;
    content = <AttributeDeepDive attributeId={attributeId} />;
  }
  // Fallback to first subsection
  else {
    content = (
      <ExecutiveReport
        subSection="executive-summary"
        onSectionChange={onSectionChange}
      />
    );
  }

  return <div className="space-y-8">{content}</div>;
}
