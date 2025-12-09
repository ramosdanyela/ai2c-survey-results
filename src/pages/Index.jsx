import { useState } from "react";
import { SurveyLayout } from "@/components/survey/SurveyLayout";

export default function Index() {
  const [activeSection, setActiveSection] = useState("executive");

  return (
    <SurveyLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    />
  );
}
