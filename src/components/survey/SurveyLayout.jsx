import { useState, useRef, useEffect } from "react";
import { SurveyHeader } from "@/components/survey/SurveyHeader";
import { ContentRenderer } from "@/components/survey/ContentRenderer";
import {
  SurveySidebar,
  SurveySidebarMobile,
} from "@/components/survey/SurveySidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function SurveyLayout({ activeSection, onSectionChange }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);

    return () => {
      window.removeEventListener("resize", checkIsDesktop);
    };
  }, []);

  useEffect(() => {
    const updateSidebarWidth = () => {
      if (sidebarRef.current && isDesktop) {
        setSidebarWidth(sidebarRef.current.offsetWidth);
      } else {
        setSidebarWidth(0);
      }
    };

    // Aguardar um frame para garantir que o DOM está renderizado
    const timeoutId = setTimeout(updateSidebarWidth, 0);
    window.addEventListener("resize", updateSidebarWidth);

    // Usar MutationObserver para detectar mudanças no conteúdo da sidebar
    const observer = new MutationObserver(updateSidebarWidth);
    if (sidebarRef.current) {
      observer.observe(sidebarRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateSidebarWidth);
      observer.disconnect();
    };
  }, [activeSection, isDesktop]);

  const handleSectionChange = (section) => {
    onSectionChange(section);
    setIsMobileMenuOpen(false); // Fecha o menu mobile ao selecionar uma seção
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar Desktop - Sempre visível em telas grandes */}
      <SurveySidebar
        ref={sidebarRef}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />

      {/* Sidebar Mobile - Menu hamburger */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="left"
          className="p-0 bg-sidebar border-0 h-full overflow-hidden w-full sm:w-[320px]"
        >
          <SurveySidebarMobile
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            onItemClick={() => setIsMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div
        className="flex-1 flex flex-col transition-all duration-200"
        style={{
          marginLeft: isDesktop ? `${sidebarWidth}px` : "0",
        }}
      >
        <SurveyHeader
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 flex flex-col overflow-auto">
          <div className="flex-1 px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
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
