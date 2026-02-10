import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GenericSectionRenderer } from "@/components/survey/common/GenericSectionRenderer";
import { ExportTimestamp } from "@/components/export/ExportTimestamp";
import { parseSelectedSections } from "@/utils/exportHelpers";
import { useSurveyData } from "@/hooks/useSurveyData";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { COLOR_ORANGE_PRIMARY, RGBA_BLACK_SHADOW_20 } from "@/lib/colors";
import { Download } from "@/lib/icons";
import { Printer, Cloud, ArrowLeft } from "lucide-react";

export default function ExportPreview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data, loading } = useSurveyData();
  const [showWordCloud, setShowWordCloud] = useState(true);

  // Parse URL parameters
  const exportFullReport = searchParams.get("fullReport") === "true";
  const selectedSectionsParam = searchParams.get("sections");
  const selectedSectionsArray = selectedSectionsParam
    ? selectedSectionsParam.split(",")
    : [];

  // Parse and get all sections to render
  const sectionsToRender = useMemo(() => {
    if (!data) return [];
    const parsed = parseSelectedSections(
      selectedSectionsArray,
      exportFullReport,
      data
    );
    return parsed;
  }, [data, selectedSectionsArray, exportFullReport]);

  // Redirect if no sections selected (only after data is loaded)
  useEffect(() => {
    if (
      !loading &&
      data &&
      sectionsToRender.length === 0 &&
      !exportFullReport
    ) {
      navigate("/export");
    }
  }, [sectionsToRender, exportFullReport, navigate, loading, data]);

  // Group sections by sectionId for better organization
  const groupedSections = useMemo(() => {
    const groups = {};
    sectionsToRender.forEach((item) => {
      if (!groups[item.sectionId]) {
        groups[item.sectionId] = [];
      }
      // Check for duplicates before adding
      const exists = groups[item.sectionId].some(
        (existing) => existing.subsectionId === item.subsectionId
      );
      if (!exists) {
        groups[item.sectionId].push(item);
      }
    });
    return groups;
  }, [sectionsToRender]);

  // Get section name from sections
  const getSectionName = (sectionId) => {
    const section = data?.sections?.find(
      (s) => s.id === sectionId
    );
    return section?.name || sectionId;
  };

  // Export functions
  const handleExportPDF = () => {
    window.print();
  };

  // Show loading state
  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* A4 preview + print styles */}
      <style>{`
        /* A4 dimensions: 210mm x 297mm. Margins: 10mm top/bottom, 5mm left/right */
        .export-preview-a4-wrapper {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 10mm 5mm;
          background: white;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          box-sizing: border-box;
          overflow: visible;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .export-preview-screen-bg {
          min-height: 100vh;
          background: #e5e7eb;
          padding: 1.5rem 1rem 2rem;
          overflow: visible;
        }
        .export-preview-screen-bg .export-preview-a4-wrapper {
          margin-bottom: 2rem;
        }
        /* Remove elevated (shadow) from cards on this page only */
        .export-preview-screen-bg .card-elevated,
        .export-preview-a4-wrapper .card-elevated {
          box-shadow: none !important;
          transition: none;
        }
        .export-preview-screen-bg .card-elevated:hover,
        .export-preview-a4-wrapper .card-elevated:hover {
          box-shadow: none !important;
        }
        /* Center bar charts on the page (they were shifting right) */
        .export-preview-a4-wrapper .export-bar-chart-wrapper {
          width: 100%;
          max-width: 180mm;
          margin-left: auto;
          margin-right: auto;
        }
        .export-preview-a4-wrapper .export-bar-chart-wrapper > div {
          width: 100%;
        }
        /* Card "Sobre o Estudo": no margins/padding only in ExportPreview */
        .export-preview-a4-wrapper .export-card-sobre-estudo {
          margin: 0 !important;
          padding: 0 !important;
        }
        .export-preview-a4-wrapper .export-card-sobre-estudo > div {
          padding: 0 !important;
        }
        @media print {
          .no-print {
            display: none !important;
          }
          body, html, .export-preview-screen-bg, .export-preview-a4-wrapper {
            overflow: visible !important;
          }
          body, .export-preview-screen-bg {
            background: white !important;
            padding: 0 !important;
          }
          .export-preview-a4-wrapper {
            width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          @page {
            size: A4;
            margin: 10mm 5mm;
          }
          header {
            page-break-after: avoid;
          }
          .mb-8, .export-avoid-break {
            page-break-inside: avoid;
          }
          /* Top 3 Categorias: keep block together so cards are not cut */
          .export-top3-categories {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header
          className="sticky top-0 z-10 bg-background no-print"
          style={{
            boxShadow: `0 2px 8px ${RGBA_BLACK_SHADOW_20}`,
          }}
        >
          <div className="px-6 sm:px-8 lg:px-24 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <Button
                onClick={() => navigate("/export")}
                variant="outline"
                className="h-10 px-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              <div
                className="text-white px-4 py-2 rounded-lg flex items-center gap-2"
                style={{
                  backgroundColor: COLOR_ORANGE_PRIMARY,
                  boxShadow: `0 4px 16px ${COLOR_ORANGE_PRIMARY}40`,
                }}
              >
                <Download className="w-4 h-4 flex-shrink-0" />
                <h1 className="text-2xl font-bold text-white whitespace-nowrap">
                  Export Preview
                </h1>
              </div>
            </div>

            {/* Export Controls */}
            <div className="flex items-center gap-4">
              {/* Word Cloud Toggle */}
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="export-word-cloud-toggle"
                  className="text-sm text-foreground cursor-pointer whitespace-nowrap"
                >
                  Word Cloud
                </Label>
                <Switch
                  id="export-word-cloud-toggle"
                  checked={showWordCloud}
                  onCheckedChange={setShowWordCloud}
                />
              </div>

              {/* Export PDF Button */}
              <Button
                onClick={handleExportPDF}
                className="h-10 px-4"
                style={{
                  backgroundColor: COLOR_ORANGE_PRIMARY,
                  color: "white",
                }}
              >
                <Printer className="w-4 h-4 mr-2" />
                Save as PDF
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content: A4 sheet(s) */}
        <main className="export-preview-screen-bg">
          <div className="export-preview-a4-wrapper">
            {/* Render each section group */}
            {Object.entries(groupedSections).map(
              ([sectionId, subsections], sectionIndex, sectionsArray) => {
                const isLastSection = sectionIndex === sectionsArray.length - 1;

                return (
                  <div key={sectionId} className="mb-8 export-avoid-break">
                    {/* Section Header (only show if section has multiple subsections) - same static style as Export Preview badge */}
                    {subsections.length > 1 && (
                      <div className="mb-6 flex justify-center">
                        <div
                          className="px-4 py-2 rounded-lg inline-flex items-center justify-center"
                          style={{
                            backgroundColor: COLOR_ORANGE_PRIMARY,
                            boxShadow: `0 4px 16px ${COLOR_ORANGE_PRIMARY}40`,
                          }}
                        >
                          <h2 className="text-2xl font-bold text-white">
                            {getSectionName(sectionId)}
                          </h2>
                        </div>
                      </div>
                    )}

                    {/* Render each subsection */}
                    {subsections.map((item, subsectionIndex) => (
                      <div
                        key={`${item.sectionId}-${item.subsectionId}`}
                        className={subsectionIndex > 0 ? "mt-8" : ""}
                      >
                        {/* Render the subsection content */}
                        <GenericSectionRenderer
                          key={`renderer-${item.sectionId}-${item.subsectionId}`}
                          sectionId={item.sectionId}
                          subSection={item.subsectionId}
                          isExport={true}
                          exportWordCloud={showWordCloud}
                        />
                      </div>
                    ))}

                    {/* Section divider at the end (except for last section) */}
                    {!isLastSection && (
                      <div className="mt-8">
                        <Separator />
                      </div>
                    )}
                  </div>
                );
              }
            )}

            {/* Timestamp at the end */}
            <ExportTimestamp />
          </div>
        </main>
      </div>
    </>
  );
}
