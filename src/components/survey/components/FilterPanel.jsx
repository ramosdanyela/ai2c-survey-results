import { useState, useEffect } from "react";
import {
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  FileText,
  CheckSquare,
  CircleDot,
  TrendingUp,
} from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSurveyData } from "@/hooks/useSurveyData";
import { useMemo } from "react";
import { getAttributesFromData } from "@/services/dataResolver";

export function FilterPanel({
  onFiltersChange,
  questionFilter,
  onQuestionFilterChange,
  selectedQuestionId,
  onSelectedQuestionIdChange,
  questions = [],
  hideQuestionFilters = false,
  initialFilters = [],
}) {
  const { data } = useSurveyData();
  const uiTexts = data?.uiTexts;
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [selectedFilterType, setSelectedFilterType] = useState(null);
  const [openFilters, setOpenFilters] = useState(new Set());

  // Helper function to get filterPanel text with fallback
  const getFilterText = (key, fallback) => {
    return uiTexts?.filterPanel?.[key] || fallback;
  };

  // Get attributes dynamically from data
  const attributes = useMemo(() => {
    return getAttributesFromData(data) || [];
  }, [data]);

  // Build filter options dynamically from attributes
  const filterOptions = useMemo(() => {
    if (!attributes.length || !uiTexts?.filterPanel) return [];

    return attributes.map((attr) => ({
      value: attr.id,
      label: uiTexts?.filterPanel?.[attr.id] || attr.name || attr.id,
    }));
  }, [attributes, uiTexts]);

  // Build valid filter types dynamically
  const VALID_FILTER_TYPES = useMemo(() => {
    const types = attributes.map((attr) => attr.id);
    types.push(null);
    return types;
  }, [attributes]);

  // Sync activeFilters with initialFilters when they change
  useEffect(() => {
    setActiveFilters(initialFilters);
  }, [initialFilters]);

  // Get available values for a filter type
  const getFilterValues = (filterType) => {
    if (!filterType || !attributes.length) return [];
    const attribute = attributes.find((attr) => attr.id === filterType);
    if (!attribute || !attribute.distribution) return [];
    return attribute.distribution.map((item) => item.segment);
  };

  // Handle filter type selection
  const handleFilterTypeSelect = (value) => {
    if (value === "none") {
      setSelectedFilterType(null);
      return;
    }
    // Validate that the value is a valid FilterType
    if (!VALID_FILTER_TYPES.includes(value)) {
      // Invalid filterType - ignore silently (invalid input from user)
      return;
    }
    const filterType = value;
    setSelectedFilterType(filterType);

    // Open the main accordion when any filter other than "none" is selected
    setIsPanelOpen(true);

    // If filter doesn't exist yet, open it automatically
    const exists = activeFilters.find((f) => f.filterType === filterType);
    if (!exists) {
      setOpenFilters((prev) => new Set([...prev, filterType]));
    }
  };

  // Toggle filter collapse
  const toggleFilter = (filterType) => {
    setOpenFilters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(filterType)) {
        newSet.delete(filterType);
      } else {
        newSet.add(filterType);
      }
      return newSet;
    });
  };

  // Handle value selection for a filter
  const handleValueToggle = (filterType, value, checked) => {
    if (!filterType) return;

    setActiveFilters((prev) => {
      const existingFilter = prev.find((f) => f.filterType === filterType);
      let newFilters;

      if (existingFilter) {
        if (checked) {
          // Add value if not already present
          if (!existingFilter.values.includes(value)) {
            newFilters = prev.map((f) =>
              f.filterType === filterType
                ? { ...f, values: [...f.values, value] }
                : f
            );
          } else {
            newFilters = prev;
          }
        } else {
          // Remove value
          const updatedValues = existingFilter.values.filter(
            (v) => v !== value
          );
          if (updatedValues.length === 0) {
            // Remove filter if no values left
            newFilters = prev.filter((f) => f.filterType !== filterType);
          } else {
            newFilters = prev.map((f) =>
              f.filterType === filterType ? { ...f, values: updatedValues } : f
            );
          }
        }
      } else {
        // Create new filter
        if (checked) {
          newFilters = [...prev, { filterType, values: [value] }];
        } else {
          newFilters = prev;
        }
      }

      // Notify parent component
      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }

      // Auto-open the main accordion and the filter when values are added
      if (checked) {
        setIsPanelOpen(true);
        if (!existingFilter) {
          setOpenFilters((prev) => new Set([...prev, filterType]));
        }
      }

      return newFilters;
    });
  };

  // Remove a filter completely
  const handleRemoveFilter = (filterType) => {
    setActiveFilters((prev) => {
      const newFilters = prev.filter((f) => f.filterType !== filterType);
      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }
      return newFilters;
    });
  };

  // Remove a specific value from a filter
  const handleRemoveValue = (filterType, value) => {
    handleValueToggle(filterType, value, false);
  };

  // Get current filter's selected values
  const getSelectedValues = (filterType) => {
    const filter = activeFilters.find((f) => f.filterType === filterType);
    return filter?.values || [];
  };

  // Check if a value is selected
  const isValueSelected = (filterType, value) => {
    return getSelectedValues(filterType).includes(value);
  };

  const availableValues = selectedFilterType
    ? getFilterValues(selectedFilterType)
    : [];

  const content = (
    <Collapsible open={isPanelOpen} onOpenChange={setIsPanelOpen}>
      <div className={`${hideQuestionFilters ? "px-6" : ""} pt-6 pb-6`}>
        {/* Question Type Filter Pills */}
        {!hideQuestionFilters &&
          questionFilter !== undefined &&
          onQuestionFilterChange && (
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <Badge
                variant={questionFilter === "all" ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-xs font-normal rounded-full ${
                  questionFilter === "all"
                    ? "bg-[hsl(var(--custom-blue))]/70 hover:bg-[hsl(var(--custom-blue))]/80"
                    : ""
                }`}
                onClick={() => onQuestionFilterChange("all")}
              >
                {getFilterText("all", "Todas")}
              </Badge>
              <Badge
                variant={questionFilter === "open-ended" ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-xs font-normal rounded-full inline-flex items-center gap-1.5 ${
                  questionFilter === "open-ended"
                    ? "bg-[hsl(var(--custom-blue))]/70 hover:bg-[hsl(var(--custom-blue))]/80"
                    : ""
                }`}
                onClick={() => onQuestionFilterChange("open-ended")}
              >
                <FileText className="w-3 h-3" />
                {getFilterText("open-ended", "Campo Aberto")}
              </Badge>
              <Badge
                variant={questionFilter === "multiple-choice" ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-xs font-normal rounded-full inline-flex items-center gap-1.5 ${
                  questionFilter === "multiple-choice"
                    ? "bg-[hsl(var(--custom-blue))]/70 hover:bg-[hsl(var(--custom-blue))]/80"
                    : ""
                }`}
                onClick={() => onQuestionFilterChange("multiple-choice")}
              >
                <CheckSquare className="w-3 h-3" />
                {getFilterText("multiple-choice", "Múltipla Escolha")}
              </Badge>
              <Badge
                variant={questionFilter === "single-choice" ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-xs font-normal rounded-full inline-flex items-center gap-1.5 ${
                  questionFilter === "single-choice"
                    ? "bg-[hsl(var(--custom-blue))]/70 hover:bg-[hsl(var(--custom-blue))]/80"
                    : ""
                }`}
                onClick={() => onQuestionFilterChange("single-choice")}
              >
                <CircleDot className="w-3 h-3" />
                {getFilterText("single-choice", "Escolha única")}
              </Badge>
              <Badge
                variant={questionFilter === "nps" ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-xs font-normal rounded-full inline-flex items-center gap-1.5 ${
                  questionFilter === "nps"
                    ? "bg-[hsl(var(--custom-blue))]/70 hover:bg-[hsl(var(--custom-blue))]/80"
                    : ""
                }`}
                onClick={() => onQuestionFilterChange("nps")}
              >
                <TrendingUp className="w-3 h-3" />
                {getFilterText("nps", "NPS")}
              </Badge>
            </div>
          )}

        {/* Question Selector */}
        {!hideQuestionFilters &&
          onSelectedQuestionIdChange &&
          questions.length > 0 && (
            <div className="mb-4">
              <Label className="text-sm text-muted-foreground mb-2 block">
                {getFilterText("filterByQuestion", "Filtrar por questão:")}
              </Label>
              <Select
                value={selectedQuestionId?.toString() || "all"}
                onValueChange={(value) => {
                  if (value === "all") {
                    onSelectedQuestionIdChange(null);
                  } else {
                    onSelectedQuestionIdChange(parseInt(value, 10));
                  }
                }}
              >
                <SelectTrigger className="w-full border-0 focus:ring-[hsl(var(--custom-blue))] bg-[hsl(var(--custom-blue))]/70 hover:bg-[hsl(var(--custom-blue))]/80 text-white">
                  <SelectValue
                    placeholder={getFilterText(
                      "selectQuestion",
                      "Selecione uma questão"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="all"
                    className="focus:bg-[hsl(var(--custom-blue))]/20 focus:text-white"
                  >
                    {getFilterText("allQuestions", "Todas as questões")}
                  </SelectItem>
                  {questions.map((q, index) => {
                    const isNPS = q.questionType === "nps";
                    const questionType = isNPS
                      ? getFilterText("nps", "NPS")
                      : q.questionType === "open-ended"
                      ? getFilterText("open-ended", "Campo Aberto")
                      : q.questionType === "single-choice"
                      ? getFilterText("single-choice", "Escolha única")
                      : getFilterText("multiple-choice", "Múltipla Escolha");
                    const truncatedQuestion =
                      q.question.length > 80
                        ? q.question.substring(0, 80) + "..."
                        : q.question;
                    // Renumber questions: index + 1 (excluding Q3)
                    const displayNumber = index + 1;

                    return (
                      <SelectItem
                        key={q.id}
                        value={q.id.toString()}
                        className="focus:bg-[hsl(var(--custom-blue))]/20 focus:text-white"
                      >
                        <span className="font-semibold">
                          {getFilterText("questionPrefix", "Q")}
                          {displayNumber}:
                        </span>{" "}
                        {truncatedQuestion} ({questionType})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

        {/* Header - Always visible */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[hsl(var(--custom-blue))]" />
            <h3 className="font-semibold text-sm">
              {getFilterText("filters", "Filtros")}
            </h3>
          </div>

          {/* Filter Type Selector - Always visible */}
          <div className="flex-shrink-0">
            <Select
              value={selectedFilterType || "none"}
              onValueChange={handleFilterTypeSelect}
            >
              <SelectTrigger
                id="filter-type"
                className="w-auto border-[hsl(var(--custom-blue))] focus:ring-[hsl(var(--custom-blue))]"
              >
                <SelectValue
                  placeholder={getFilterText(
                    "selectFilterType",
                    "Selecione um tipo de filtro"
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="none"
                  className="focus:bg-[hsl(var(--custom-blue))]/20 focus:text-white"
                >
                  {getFilterText("none", "Nenhum")}
                </SelectItem>
                {filterOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="focus:bg-[hsl(var(--custom-blue))]/20 focus:text-white"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear All Filters Button - Always visible when there are active filters */}
          {activeFilters.length > 0 && (
            <button
              onClick={() => {
                setActiveFilters([]);
                setSelectedFilterType(null);
                setOpenFilters(new Set());
                if (onFiltersChange) {
                  onFiltersChange([]);
                }
              }}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors ml-auto"
            >
              {getFilterText("clearAll", "Limpar todos")}
            </button>
          )}

          {/* Active Filters Pills - Shown when closed */}
          {!isPanelOpen && activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {activeFilters.map((filter) => {
                const filterLabel = filterOptions.find(
                  (opt) => opt.value === filter.filterType
                )?.label;
                return filter.values.map((value) => (
                  <Badge
                    key={`${filter.filterType}-${value}`}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    <span className="text-xs font-medium">{filterLabel}:</span>
                    <span>{value}</span>
                    <button
                      onClick={() =>
                        handleRemoveValue(filter.filterType, value)
                      }
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                      aria-label={`Remove ${value}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ));
              })}
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={
              isPanelOpen
                ? getFilterText("closeFilters", "Fechar filtros")
                : getFilterText("openFilters", "Abrir filtros")
            }
          >
            {isPanelOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <CollapsibleContent>
        <div className="pt-0 pb-6 px-6">
          <div className="space-y-4">
            {/* Active Filters Display - Collapsible */}
            {activeFilters.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <Label className="text-sm text-muted-foreground">
                  {getFilterText("activeFilters", "Filtros Ativos")}
                </Label>
                <div className="space-y-2">
                  {activeFilters.map((filter) => {
                    const filterLabel = filterOptions.find(
                      (opt) => opt.value === filter.filterType
                    )?.label;
                    const isOpen = openFilters.has(filter.filterType);
                    const filterValues = getFilterValues(filter.filterType);

                    return (
                      <Collapsible
                        key={filter.filterType}
                        open={isOpen}
                        onOpenChange={() => toggleFilter(filter.filterType)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between w-full p-3 rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                              {isOpen ? (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span className="font-medium text-sm">
                                {filterLabel}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {filter.values.length}{" "}
                                {filter.values.length !== 1
                                  ? getFilterText(
                                      "selectedPlural",
                                      "selecionados"
                                    )
                                  : getFilterText("selected", "selecionado")}
                              </Badge>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFilter(filter.filterType);
                              }}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              aria-label={`Remove filter ${filterLabel}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2">
                          <div className="space-y-2 pl-7">
                            <Label className="text-xs text-muted-foreground">
                              {getFilterText(
                                "selectValues",
                                "Selecione os valores"
                              )}
                            </Label>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {filterValues.map((value) => (
                                <div
                                  key={value}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`${filter.filterType}-${value}`}
                                    checked={isValueSelected(
                                      filter.filterType,
                                      value
                                    )}
                                    onCheckedChange={(checked) =>
                                      handleValueToggle(
                                        filter.filterType,
                                        value,
                                        checked
                                      )
                                    }
                                    className="border-[hsl(var(--custom-blue))] data-[state=checked]:bg-[hsl(var(--custom-blue))] data-[state=checked]:text-white focus-visible:ring-[hsl(var(--custom-blue))]"
                                  />
                                  <Label
                                    htmlFor={`${filter.filterType}-${value}`}
                                    className="text-sm font-normal cursor-pointer flex-1"
                                  >
                                    {value}
                                  </Label>
                                </div>
                              ))}
                            </div>
                            {/* Selected values as pills */}
                            {filter.values.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-2">
                                {filter.values.map((value) => (
                                  <Badge
                                    key={`${filter.filterType}-${value}`}
                                    variant="secondary"
                                    className="flex items-center gap-1 pr-1"
                                  >
                                    <span>{value}</span>
                                    <button
                                      onClick={() =>
                                        handleRemoveValue(
                                          filter.filterType,
                                          value
                                        )
                                      }
                                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                                      aria-label={`Remove ${value}`}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    setActiveFilters([]);
                    setSelectedFilterType(null);
                    setOpenFilters(new Set());
                    if (onFiltersChange) {
                      onFiltersChange([]);
                    }
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  {getFilterText("clearAllFilters", "Limpar todos os filtros")}
                </button>
              </div>
            )}

            {/* Value Selection for new filter (shown when filter type is selected but not yet added) */}
            {selectedFilterType &&
              availableValues.length > 0 &&
              !activeFilters.find(
                (f) => f.filterType === selectedFilterType
              ) && (
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-sm text-muted-foreground">
                    {
                      filterOptions.find(
                        (opt) => opt.value === selectedFilterType
                      )?.label
                    }{" "}
                    - {getFilterText("selectValues", "Selecione os valores")}
                  </Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableValues.map((value) => (
                      <div key={value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${selectedFilterType}-${value}`}
                          checked={isValueSelected(selectedFilterType, value)}
                          onCheckedChange={(checked) =>
                            handleValueToggle(
                              selectedFilterType,
                              value,
                              checked
                            )
                          }
                          className="border-[hsl(var(--custom-blue))] data-[state=checked]:bg-[hsl(var(--custom-blue))] data-[state=checked]:text-white focus-visible:ring-[hsl(var(--custom-blue))]"
                        />
                        <Label
                          htmlFor={`${selectedFilterType}-${value}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {value}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* OK Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={() => setIsPanelOpen(false)}
                className="min-w-20 bg-[hsl(var(--custom-blue))] text-white hover:bg-[hsl(var(--custom-blue))]/80"
              >
                {getFilterText("ok", "OK")}
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );

  // If hideQuestionFilters is true, don't use Card (for use in Popover)
  if (hideQuestionFilters) {
    return <div className="w-full">{content}</div>;
  }

  return <Card className="card-elevated border-0 shadow-none">{content}</Card>;
}
