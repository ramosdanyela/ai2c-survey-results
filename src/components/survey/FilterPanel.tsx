import { useState } from "react";
import { Filter, X, ChevronDown, ChevronRight } from "lucide-react";
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
import { attributeDeepDive } from "@/data/surveyData";

export type FilterType = "state" | "customerType" | "education" | null;

export interface FilterValue {
  filterType: FilterType;
  values: string[];
}

interface FilterPanelProps {
  onFiltersChange?: (filters: FilterValue[]) => void;
}

const filterOptions = [
  { value: "state", label: "Estado" },
  { value: "customerType", label: "Tipo de Cliente" },
  { value: "education", label: "Escolaridade" },
];

export function FilterPanel({ onFiltersChange }: FilterPanelProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValue[]>([]);
  const [selectedFilterType, setSelectedFilterType] =
    useState<FilterType>(null);
  const [openFilters, setOpenFilters] = useState<Set<FilterType>>(new Set());

  // Get available values for a filter type
  const getFilterValues = (filterType: FilterType): string[] => {
    if (!filterType) return [];
    const attribute = attributeDeepDive.attributes.find(
      (attr) => attr.id === filterType
    );
    if (!attribute) return [];
    return attribute.distribution.map((item) => item.segment);
  };

  // Handle filter type selection
  const handleFilterTypeSelect = (value: string) => {
    if (value === "none") {
      setSelectedFilterType(null);
      return;
    }
    const filterType = value as FilterType;
    setSelectedFilterType(filterType);

    // If filter doesn't exist yet, open it automatically
    const exists = activeFilters.find((f) => f.filterType === filterType);
    if (!exists) {
      setOpenFilters((prev) => new Set([...prev, filterType]));
    }
  };

  // Toggle filter collapse
  const toggleFilter = (filterType: FilterType) => {
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
  const handleValueToggle = (
    filterType: FilterType,
    value: string,
    checked: boolean
  ) => {
    if (!filterType) return;

    setActiveFilters((prev) => {
      const existingFilter = prev.find((f) => f.filterType === filterType);
      let newFilters: FilterValue[];

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

      // Auto-open the filter when values are added
      if (checked && !existingFilter) {
        setOpenFilters((prev) => new Set([...prev, filterType]));
      }

      return newFilters;
    });
  };

  // Remove a filter completely
  const handleRemoveFilter = (filterType: FilterType) => {
    setActiveFilters((prev) => {
      const newFilters = prev.filter((f) => f.filterType !== filterType);
      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }
      return newFilters;
    });
  };

  // Remove a specific value from a filter
  const handleRemoveValue = (filterType: FilterType, value: string) => {
    handleValueToggle(filterType, value, false);
  };

  // Get current filter's selected values
  const getSelectedValues = (filterType: FilterType): string[] => {
    const filter = activeFilters.find((f) => f.filterType === filterType);
    return filter?.values || [];
  };

  // Check if a value is selected
  const isValueSelected = (filterType: FilterType, value: string): boolean => {
    return getSelectedValues(filterType).includes(value);
  };

  const availableValues = selectedFilterType
    ? getFilterValues(selectedFilterType)
    : [];

  return (
    <Card className="card-elevated">
      <Collapsible open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <CardContent className="pt-6 pb-6">
          {/* Header - Always visible */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Filtros</h3>
            </div>

            {/* Filter Type Selector - Always visible */}
            <div className="flex-1 min-w-[200px]">
              <Select
                value={selectedFilterType || "none"}
                onValueChange={handleFilterTypeSelect}
              >
                <SelectTrigger id="filter-type" className="w-full">
                  <SelectValue placeholder="Selecione um tipo de filtro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {filterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                      <span className="text-xs font-medium">
                        {filterLabel}:
                      </span>
                      <span>{value}</span>
                      <button
                        onClick={() =>
                          handleRemoveValue(filter.filterType, value)
                        }
                        className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                        aria-label={`Remover ${value}`}
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
              aria-label={isPanelOpen ? "Fechar filtros" : "Abrir filtros"}
            >
              {isPanelOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </CardContent>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-6">
            <div className="space-y-4">
              {/* Active Filters Display - Collapsible */}
              {activeFilters.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <Label className="text-sm text-muted-foreground">
                    Filtros Ativos
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
                                  {filter.values.length} selecionado
                                  {filter.values.length !== 1 ? "s" : ""}
                                </Badge>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFilter(filter.filterType);
                                }}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                                aria-label={`Remover filtro ${filterLabel}`}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-2">
                            <div className="space-y-2 pl-7">
                              <Label className="text-xs text-muted-foreground">
                                Selecione os valores
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
                                          checked as boolean
                                        )
                                      }
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
                                        aria-label={`Remover ${value}`}
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
                    Limpar todos os filtros
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
                      - Selecione os valores
                    </Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableValues.map((value) => (
                        <div
                          key={value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`${selectedFilterType}-${value}`}
                            checked={isValueSelected(selectedFilterType, value)}
                            onCheckedChange={(checked) =>
                              handleValueToggle(
                                selectedFilterType,
                                value,
                                checked as boolean
                              )
                            }
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
                  className="min-w-20"
                >
                  OK
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
