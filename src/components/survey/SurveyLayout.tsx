import { useState } from "react";
import { SurveyHeader } from "@/components/survey/SurveyHeader";
import { ContentRenderer } from "@/components/survey/ContentRenderer";
import {
  SurveySidebar,
  SurveySidebarMobile,
} from "@/components/survey/SurveySidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface SurveyLayoutProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function SurveyLayout({
  activeSection,
  onSectionChange,
}: SurveyLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    setIsMobileMenuOpen(false); // Fecha o menu mobile ao selecionar uma seção
  };

  return (
    <div className="min-h-screen flex w-full bg-black">
      {/* Sidebar Desktop - Sempre visível em telas grandes */}
      <SurveySidebar
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />

      {/* Sidebar Mobile - Menu hamburger */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <SurveySidebarMobile
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            onItemClick={() => setIsMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col lg:pl-80">
        <SurveyHeader
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 flex flex-col overflow-auto">
          <div className="flex-1 px-3 sm:px-4 lg:px-6 py-6 lg:py-8">
            <div className="max-w-full xl:max-w-[98%] 2xl:max-w-[96%] mx-auto">
              <ContentRenderer
                activeSection={activeSection}
                onSectionChange={onSectionChange}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
