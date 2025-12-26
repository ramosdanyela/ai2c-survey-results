import { ExecutiveReport } from "@/components/survey/ExecutiveReport";
import { SupportAnalysis } from "@/components/survey/SupportAnalysis";
import { ResponseDetails } from "@/components/survey/ResponseDetails";
import { AttributeDeepDive } from "@/components/survey/AttributeDeepDive";
import { responseDetails, attributeDeepDive } from "@/data/surveyData";

// Get all questions for navigation
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
    .sort((a, b) => a.id - b.id);
  return allQuestions.map((q) => `responses-${q.id}`);
};

// Get all attribute subsections for navigation
const getAllAttributes = () => {
  const attributeIcons = {
    state: true,
    education: true,
    customerType: true,
  };
  return attributeDeepDive.attributes
    .filter((attr) => attr.id in attributeIcons)
    .map((attr) => `attributes-${attr.id}`);
};

// Complete list of all subsections in order
const allSubsections = [
  "executive-summary",
  "executive-recommendations",
  "support-sentiment",
  "support-intent",
  "support-segmentation",
  ...getAllAttributes(),
  ...getAllQuestions(),
];

function getNextSection(currentSection) {
  // Normalize the current section
  let normalizedSection = currentSection;

  // If it's just "executive" or "support", map to the first subsection
  if (currentSection === "executive") {
    normalizedSection = "executive-summary";
  } else if (currentSection === "support") {
    normalizedSection = "support-sentiment";
  } else if (currentSection === "attributes") {
    // If it's just "attributes", map to the first attribute
    const attributes = getAllAttributes();
    normalizedSection = attributes[0] || "attributes";
  } else if (currentSection === "responses") {
    // If it's just "responses", map to the first question
    const questions = getAllQuestions();
    normalizedSection = questions[0] || "responses";
  }

  const currentIndex = allSubsections.indexOf(normalizedSection);

  // If not found or is the last subsection, return null
  if (currentIndex === -1 || currentIndex === allSubsections.length - 1) {
    return null;
  }

  // Return the next subsection
  return allSubsections[currentIndex + 1];
}

function getPreviousSection(currentSection) {
  // Normalize the current section
  let normalizedSection = currentSection;

  // If it's just "executive" or "support", map to the first subsection
  if (currentSection === "executive") {
    normalizedSection = "executive-summary";
  } else if (currentSection === "support") {
    normalizedSection = "support-sentiment";
  } else if (currentSection === "attributes") {
    // If it's just "attributes", map to the first attribute
    const attributes = getAllAttributes();
    normalizedSection = attributes[0] || "attributes";
  } else if (currentSection === "responses") {
    // If it's just "responses", map to the first question
    const questions = getAllQuestions();
    normalizedSection = questions[0] || "responses";
  }

  const currentIndex = allSubsections.indexOf(normalizedSection);

  // If not found or is the first subsection, return null
  if (currentIndex === -1 || currentIndex === 0) {
    return null;
  }

  // Return the previous subsection
  return allSubsections[currentIndex - 1];
}

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
