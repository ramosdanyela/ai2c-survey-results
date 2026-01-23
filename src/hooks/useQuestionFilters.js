import { useState, useEffect, useMemo, useCallback } from "react";

/**
 * Hook to manage dynamic filters per question (state, customerType, education, etc.)
 * Currently manages local state, but prepared for API integration
 * 
 * @param {Object} options
 * @param {string} options.surveyId - Survey ID (required for API mode)
 * @param {boolean} options.apiMode - Whether to use API (default: false)
 * @param {Object} options.data - Data object (for local mode, to get attributes)
 * @param {Object} options.initialFilters - Initial filters per question { questionId: [{ filterType, values }] }
 * @returns {Object} { questionFilters, setQuestionFilters, availableFilters, appliedFilters, isLoading, error }
 */
export function useQuestionFilters({
  surveyId = null,
  apiMode = false,
  data = null,
  initialFilters = {},
}) {
  // State: filters per question { questionId: [{ filterType: "state", values: ["SP", "RJ"] }] }
  const [questionFilters, setQuestionFiltersInternal] = useState(initialFilters);
  
  // API state (for future integration)
  const [availableFilters, setAvailableFilters] = useState([]); // [{ id, label, type, values: [{ value, label, count }] }]
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get available filters from API
  useEffect(() => {
    if (apiMode && surveyId) {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call when ready
      // fetch(`/api/surveys/${surveyId}/filters`)
      //   .then(res => res.json())
      //   .then(result => {
      //     if (result.success) {
      //       setAvailableFilters(result.data.filters || []);
      //     }
      //   })
      //   .catch(err => setError(err))
      //   .finally(() => setIsLoading(false));
      
      // For now, just set loading to false
      setIsLoading(false);
    }
  }, [apiMode, surveyId]);

  // Get filters for a specific question
  const getQuestionFilters = useCallback((questionId) => {
    return questionFilters[questionId] || [];
  }, [questionFilters]);

  // Set filters for a specific question (direct replacement)
  const setQuestionFilters = useCallback((questionId, filters) => {
    setQuestionFiltersInternal((prev) => ({
      ...prev,
      [questionId]: filters,
    }));
  }, []);
  
  // Set all filters at once (for backward compatibility)
  const setAllQuestionFilters = useCallback((filters) => {
    setQuestionFiltersInternal(filters);
  }, []);

  // Update a single filter for a question
  const updateQuestionFilter = useCallback((questionId, filterType, values) => {
    setQuestionFiltersInternal((prev) => {
      const currentFilters = prev[questionId] || [];
      const existingFilterIndex = currentFilters.findIndex(
        (f) => f.filterType === filterType
      );

      let newFilters;
      if (existingFilterIndex >= 0) {
        // Update existing filter
        if (values.length === 0) {
          // Remove filter if no values
          newFilters = currentFilters.filter(
            (f) => f.filterType !== filterType
          );
        } else {
          // Update values
          newFilters = [...currentFilters];
          newFilters[existingFilterIndex] = { filterType, values };
        }
      } else {
        // Add new filter
        if (values.length > 0) {
          newFilters = [...currentFilters, { filterType, values }];
        } else {
          newFilters = currentFilters;
        }
      }

      return {
        ...prev,
        [questionId]: newFilters,
      };
    });
  }, []);

  // Remove a filter value from a question
  const removeFilterValue = useCallback((questionId, filterType, value) => {
    setQuestionFiltersInternal((prev) => {
      const currentFilters = prev[questionId] || [];
      const updatedFilters = currentFilters
        .map((filter) => {
          if (filter.filterType === filterType && filter.values) {
            const updatedValues = filter.values.filter((v) => v !== value);
            if (updatedValues.length === 0) {
              return null; // Remove filter if no values left
            }
            return { ...filter, values: updatedValues };
          }
          return filter;
        })
        .filter(Boolean);

      return {
        ...prev,
        [questionId]: updatedFilters,
      };
    });
  }, []);

  // Clear all filters for a question
  const clearQuestionFilters = useCallback((questionId) => {
    setQuestionFiltersInternal((prev) => {
      const newFilters = { ...prev };
      delete newFilters[questionId];
      return newFilters;
    });
  }, []);

  // Clear all filters for all questions
  const clearAllFilters = useCallback(() => {
    setQuestionFiltersInternal({});
  }, []);

  // Check if a question has active filters
  const hasActiveFilters = useCallback((questionId) => {
    const filters = questionFilters[questionId] || [];
    return filters.some((f) => f.values && f.values.length > 0);
  }, [questionFilters]);

  // Get applied filters in API format
  // Converts { questionId: [{ filterType, values }] } to { filterType: [values] }
  // For API: filters are global, not per question
  const appliedFilters = useMemo(() => {
    if (!apiMode) {
      // In local mode, return empty (filters are per question)
      return {};
    }

    // In API mode, aggregate all question filters into a single applied filters object
    // This assumes that in API mode, filters are global (not per question)
    const aggregated = {};
    Object.values(questionFilters).forEach((filters) => {
      filters.forEach((filter) => {
        if (!aggregated[filter.filterType]) {
          aggregated[filter.filterType] = [];
        }
        // Merge values (avoid duplicates)
        filter.values.forEach((value) => {
          if (!aggregated[filter.filterType].includes(value)) {
            aggregated[filter.filterType].push(value);
          }
        });
      });
    });
    return aggregated;
  }, [apiMode, questionFilters]);

  // Get filter options for local mode (from data attributes)
  const localFilterOptions = useMemo(() => {
    if (apiMode || !data) return [];

    // Get attributes from data (similar to FilterPanel)
    // This would need to be implemented based on your data structure
    // For now, return empty array - can be extended later
    return [];
  }, [apiMode, data]);

  // Get available filter options (from API or local)
  const filterOptions = useMemo(() => {
    if (apiMode) {
      // Return API filters
      return availableFilters.map((filter) => ({
        value: filter.id,
        label: filter.label,
        type: filter.type,
        values: filter.values || [],
      }));
    } else {
      // Return local filter options (from data attributes)
      return localFilterOptions;
    }
  }, [apiMode, availableFilters, localFilterOptions]);

  return {
    // State (backward compatibility - direct access to object)
    questionFilters,
    setQuestionFilters, // (questionId, filters) => void
    setAllQuestionFilters, // (allFilters) => void
    
    // Per-question operations
    getQuestionFilters,
    updateQuestionFilter,
    removeFilterValue,
    clearQuestionFilters,
    hasActiveFilters,
    
    // Global operations
    clearAllFilters,
    
    // API-related (for future)
    availableFilters: filterOptions,
    appliedFilters,
    isLoading,
    error,
    
    // Mode
    apiMode,
  };
}
