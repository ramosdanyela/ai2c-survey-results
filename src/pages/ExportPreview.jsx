import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GenericSectionRenderer } from "@/components/survey/common/GenericSectionRenderer";
import { ExportTimestamp } from "@/components/export/ExportTimestamp";
import { parseSelectedSections } from "@/utils/exportHelpers";
import { exportToWord } from "@/utils/wordExport";
import { capitalizeTitle } from "@/lib/utils";
import { useSurveyData } from "@/hooks/useSurveyData";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  COLOR_ORANGE_PRIMARY,
  RGBA_BLACK_SHADOW_20,
  COLOR_LIGHT_BACKGROUND,
  RGBA_BLACK_SHADOW_08,
  RGBA_BLACK_SHADOW_10,
  RGBA_ORANGE_SHADOW_15,
  COLOR_GRAY_DARK,
} from "@/lib/colors";
import { Download, Users, TrendingUp, ClipboardList } from "@/lib/icons";
import { getQuestionsFromData } from "@/services/dataResolver";
import { Printer, Cloud, ArrowLeft, FileText, Loader2 } from "lucide-react";

export default function ExportPreview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data, loading } = useSurveyData();
  const [showWordCloud, setShowWordCloud] = useState(true);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });
  const a4WrapperRef = useRef(null);

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

  // Group sections by sectionId; preserve subsection order (sectionsToRender is already sorted by parseSelectedSections)
  const groupedSections = useMemo(() => {
    const groups = {};
    sectionsToRender.forEach((item) => {
      if (!groups[item.sectionId]) {
        groups[item.sectionId] = [];
      }
      const exists = groups[item.sectionId].some(
        (existing) => existing.subsectionId === item.subsectionId
      );
      if (!exists) {
        groups[item.sectionId].push(item);
      }
    });
    return groups;
  }, [sectionsToRender]);

  // Order section IDs by original display order (data.sections index), so selected sections keep their relative order even when some are skipped
  const orderedSectionIds = useMemo(() => {
    if (!data?.sections?.length) return Object.keys(groupedSections);
    const sectionIds = new Set(Object.keys(groupedSections));
    return data.sections
      .filter((s) => sectionIds.has(s.id))
      .sort((a, b) => (a.index ?? 999) - (b.index ?? 999))
      .map((s) => s.id);
  }, [data, groupedSections]);

  // Get section name from sections (capitalized)
  const getSectionName = (sectionId) => {
    const section = data?.sections?.find(
      (s) => s.id === sectionId
    );
    const name = section?.name || sectionId;
    return capitalizeTitle(name);
  };

  // Export functions
  const handleExportPDF = () => {
    window.print();
  };

  const handleExportWord = useCallback(async () => {
    if (!a4WrapperRef.current || !data || isExportingWord) return;
    setIsExportingWord(true);
    setExportProgress({ current: 0, total: 0 });
    try {
      const fileName = data?.surveyInfo?.title
        ? data.surveyInfo.title.replace(/[^a-zA-Z0-9\s]/g, "").trim()
        : "export";
      await exportToWord(a4WrapperRef.current, fileName, (current, total) => {
        setExportProgress({ current, total });
      });
    } catch (err) {
      console.error("Word export failed:", err);
    } finally {
      setIsExportingWord(false);
      setExportProgress({ current: 0, total: 0 });
    }
  }, [data, isExportingWord]);

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
        /* Remove elevated (shadow) and hover from cards – only static styles in export preview/print */
        .export-preview-screen-bg .card-elevated,
        .export-preview-a4-wrapper .card-elevated {
          box-shadow: none !important;
          transition: none !important;
        }
        .export-preview-screen-bg .card-elevated:hover,
        .export-preview-a4-wrapper .card-elevated:hover,
        .export-preview-screen-bg .card-elevated:focus,
        .export-preview-a4-wrapper .card-elevated:focus {
          box-shadow: none !important;
        }
        /* Cards: gap-y entre elementos do mesmo card = 3 (0.75rem) */
        .export-preview-a4-wrapper .card-elevated {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .export-preview-a4-wrapper .card-elevated > div > * + * {
          margin-top: 0.75rem !important;
        }
        /* p-6/pt-6 → p-3 no export preview (CardHeader, CardContent, CardFooter e demais) */
        .export-preview-a4-wrapper .card-elevated > div {
          padding: 0.75rem !important;
        }
        .export-preview-a4-wrapper .card-elevated > div:nth-child(n+2) {
          padding-top: 0 !important;
        }
        .export-preview-a4-wrapper .rounded-lg.border.bg-card.text-card-foreground {
          padding: 0.75rem !important;
        }
        .export-preview-a4-wrapper .export-word-cloud-wrapper {
          padding: 0.75rem !important;
        }
        /* Section header badges: static only, no hover */
        .export-preview-a4-wrapper .export-section-badge {
          pointer-events: none;
          transition: none !important;
        }
        /* Subsection titles: no padding in export preview */
        .export-preview-a4-wrapper .export-subsection-title,
        .export-preview-a4-wrapper .export-subsection-title > div {
          padding: 0 !important;
        }
        /* Center bar charts on the page (they were shifting right); ensure width for mobile/ResponsiveContainer */
        .export-preview-a4-wrapper .export-bar-chart-wrapper {
          width: 100%;
          max-width: 180mm;
          min-width: 0;
          margin-left: auto;
          margin-right: auto;
        }
        .export-preview-a4-wrapper .export-bar-chart-wrapper > div {
          width: 100%;
          min-width: 0;
        }
        /* Card "Sobre o Estudo": no margins/padding in ExportPreview; no top padding */
        .export-preview-a4-wrapper .export-card-sobre-estudo {
          margin: 0 !important;
          padding: 0 !important;
        }
        .export-preview-a4-wrapper .export-card-sobre-estudo > div {
          padding: 0 !important;
        }
        /* Remove top space from wrapper that contains "Sobre o Estudo" card */
        .export-preview-a4-wrapper div:has(> .export-card-sobre-estudo) {
          margin-top: 0 !important;
          padding-top: 0 !important;
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
            background-image: none !important;
          }
          /* Force static styles on print – no hover shadow on cards/titles */
          .export-preview-a4-wrapper .card-elevated,
          .export-preview-a4-wrapper .card-elevated:hover {
            box-shadow: none !important;
            transition: none !important;
          }
          /* Preservar cores de fundo na impressão/PDF (badge laranja da seção) */
          .export-preview-a4-wrapper .export-section-badge {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background-color: #ff9e2b !important;
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
          /* SurveyInfo: evitar quebra depois para não ficar sozinha na página */
          .export-preview-a4-wrapper .export-survey-info-block {
            page-break-after: avoid;
          }
          /* Primeira seção pode quebrar para o início do Sumário executivo acompanhar SurveyInfo na página 1 */
          .export-preview-a4-wrapper .export-first-section {
            page-break-inside: auto;
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

              {/* Export Word Button */}
              <Button
                onClick={handleExportWord}
                disabled={isExportingWord}
                variant="outline"
                className="h-10 px-4"
                style={{
                  borderColor: COLOR_ORANGE_PRIMARY,
                  color: COLOR_ORANGE_PRIMARY,
                }}
              >
                {isExportingWord ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                {isExportingWord
                  ? exportProgress.total > 0
                    ? `Capturing ${exportProgress.current}/${exportProgress.total}...`
                    : "Preparing..."
                  : "Save as Word"}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content: A4 sheet(s) */}
        <main className="export-preview-screen-bg">
          <div className="export-preview-a4-wrapper" ref={a4WrapperRef}>
            {/* SurveyInfo card – above everything, centered */}
            {data?.surveyInfo && (
              <div className="export-survey-info-block w-full flex justify-center mb-5 export-avoid-break" data-word-export="image">
                <div
                  className="w-full max-w-xl rounded-lg p-4 border border-border/50 text-center"
                  style={{
                    backgroundColor: COLOR_LIGHT_BACKGROUND,
                    boxShadow: `0 2px 6px ${RGBA_BLACK_SHADOW_08}`,
                  }}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <h2 className="text-base font-bold text-foreground">
                      {data.surveyInfo.title || ""}
                    </h2>
                    {data.surveyInfo.company && (
                      <div className="text-xs text-foreground">
                        {data.surveyInfo.company}
                      </div>
                    )}
                    {data.surveyInfo.period && (
                      <div className="text-[10px] text-foreground/80">
                        {data.surveyInfo.period}
                      </div>
                    )}
                    <div className="flex flex-wrap justify-center gap-2 mt-1">
                      <div
                        className="rounded-md px-2.5 py-1.5 bg-white min-w-[72px] flex flex-col items-center"
                        style={{
                          boxShadow: `0 1px 2px ${RGBA_BLACK_SHADOW_10}`,
                        }}
                      >
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center mb-0.5"
                          style={{
                            backgroundColor: RGBA_ORANGE_SHADOW_15,
                          }}
                        >
                          <Users
                            className="w-3.5 h-3.5"
                            style={{ color: COLOR_ORANGE_PRIMARY }}
                          />
                        </div>
                        <div
                          className="text-sm font-bold"
                          style={{ color: COLOR_GRAY_DARK }}
                        >
                          {data.surveyInfo.totalRespondents?.toLocaleString(
                            "pt-BR"
                          ) || "0"}
                        </div>
                        <div className="text-[10px] text-foreground/70">
                          {data?.uiTexts?.surveySidebar?.respondents ||
                            "Respondentes"}
                        </div>
                      </div>
                      <div
                        className="rounded-md px-2.5 py-1.5 bg-white min-w-[72px] flex flex-col items-center"
                        style={{
                          boxShadow: `0 1px 2px ${RGBA_BLACK_SHADOW_10}`,
                        }}
                      >
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center mb-0.5"
                          style={{
                            backgroundColor: RGBA_ORANGE_SHADOW_15,
                          }}
                        >
                          <TrendingUp
                            className="w-3.5 h-3.5"
                            style={{ color: COLOR_ORANGE_PRIMARY }}
                          />
                        </div>
                        <div
                          className="text-sm font-bold"
                          style={{ color: COLOR_GRAY_DARK }}
                        >
                          {data.surveyInfo.responseRate != null
                            ? `${Math.round(data.surveyInfo.responseRate)}%`
                            : "0%"}
                        </div>
                        <div className="text-[10px] text-foreground/70">
                          {data?.uiTexts?.surveySidebar?.responseRate ||
                            "Taxa de Adesão"}
                        </div>
                      </div>
                      <div
                        className="rounded-md px-2.5 py-1.5 bg-white min-w-[72px] flex flex-col items-center"
                        style={{
                          boxShadow: `0 1px 2px ${RGBA_BLACK_SHADOW_10}`,
                        }}
                      >
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center mb-0.5"
                          style={{
                            backgroundColor: RGBA_ORANGE_SHADOW_15,
                          }}
                        >
                          <ClipboardList
                            className="w-3.5 h-3.5"
                            style={{ color: COLOR_ORANGE_PRIMARY }}
                          />
                        </div>
                        <div
                          className="text-sm font-bold"
                          style={{ color: COLOR_GRAY_DARK }}
                        >
                          {data.surveyInfo.questions ??
                            (getQuestionsFromData(data) || []).length ??
                            0}
                        </div>
                        <div className="text-[10px] text-foreground/70">
                          {data?.uiTexts?.surveySidebar?.questions ||
                            "Perguntas"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Render each section group in original display order (by section index) */}
            {orderedSectionIds.map((sectionId, sectionIndex) => {
              const subsections = groupedSections[sectionId] || [];
              const isLastSection =
                sectionIndex === orderedSectionIds.length - 1;

                return (
                  <div
                    key={sectionId}
                    className={`w-full mb-8 export-avoid-break ${sectionIndex === 0 ? "export-first-section" : ""}`}
                  >
                    {/* Section Header (only show if section has multiple subsections) - same static style as Export Preview badge */}
                    {subsections.length > 1 && (
                      <div className="mb-6 flex justify-center">
                        <div
                          className="export-section-badge px-4 py-2 rounded-lg inline-flex items-center justify-center"
                          style={{
                            backgroundColor: COLOR_ORANGE_PRIMARY,
                            boxShadow: COLOR_ORANGE_PRIMARY,
                          }}
                          data-word-export="h1"
                          data-word-text={getSectionName(sectionId)}
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
                      <div className="mt-8" data-word-export="separator">
                        <Separator />
                      </div>
                    )}
                  </div>
                );
            })}

            {/* Timestamp at the end */}
            <ExportTimestamp />
          </div>
        </main>
      </div>
    </>
  );
}
