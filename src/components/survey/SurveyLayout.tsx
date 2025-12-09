import { SidebarProvider } from "@/components/ui/sidebar";
import { SurveySidebar } from "@/components/survey/SurveySidebar";
import { SurveyHeader } from "@/components/survey/SurveyHeader";
import { ContentRenderer } from "@/components/survey/ContentRenderer";

interface SurveyLayoutProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function SurveyLayout({
  activeSection,
  onSectionChange,
}: SurveyLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SurveySidebar
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />

        <main className="flex-1 flex flex-col">
          <SurveyHeader activeSection={activeSection} />

          <div className="flex-1 px-3 sm:px-4 lg:px-6 py-6 lg:py-8 overflow-auto">
            <div className="max-w-full xl:max-w-[98%] 2xl:max-w-[96%] mx-auto">
              <ContentRenderer
                activeSection={activeSection}
                onSectionChange={onSectionChange}
              />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
