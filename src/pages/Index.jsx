import { useState } from "react";
import { SurveyLayout } from "@/components/survey/components/SurveyLayout";

export default function Index() {
  const [activeSection, setActiveSection] = useState("executive-summary");

  return (
    <SurveyLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    />
  );
}
