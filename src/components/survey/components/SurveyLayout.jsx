import { useState, useRef, useEffect } from "react";
import { SurveyHeader } from "@/components/survey/components/SurveyHeader";
import { ContentRenderer } from "@/components/survey/components/ContentRenderer";
import {
  SurveySidebar,
  SurveySidebarMobile,
} from "@/components/survey/components/SurveySidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function SurveyLayout({ activeSection, onSectionChange }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const sidebarRef = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1480);
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

    // Wait one frame to ensure DOM is rendered
    const timeoutId = setTimeout(updateSidebarWidth, 0);
    window.addEventListener("resize", updateSidebarWidth);

    // Use MutationObserver to detect changes in sidebar content
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

  // Scroll content to top on section change. Run after layout (double rAF) so the
  // new content is rendered and the scroll sticks. Reset both the main container
  // and the window, since the page can grow (min-h-screen) and the window may scroll.
  useEffect(() => {
    if (!mainRef.current) return;
    const el = mainRef.current;
    let raf2;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        el.scrollTop = 0;
        window.scrollTo(0, 0);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2 != null) cancelAnimationFrame(raf2);
    };
  }, [activeSection]);

  const handleSectionChange = (section) => {
    onSectionChange(section);
    setIsMobileMenuOpen(false); // Close mobile menu when selecting a section
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Sidebar - Always visible on large screens */}
      <SurveySidebar
        ref={sidebarRef}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />

      {/* Mobile Sidebar - Hamburger menu */}
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

        <main ref={mainRef} className="flex-1 flex flex-col overflow-auto">
          <div className="flex-1 px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
            <div className="max-w-full xl:max-w-[98%] 2xl:max-w-[96%] mx-auto">
              <ContentRenderer activeSection={activeSection} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
