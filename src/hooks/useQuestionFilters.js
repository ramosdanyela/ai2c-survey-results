import { useState, useEffect, useMemo, useCallback } from "react";
import {
  fetchFilterDefinitions,
  fetchFilteredQuestionData,
} from "@/services/filterService";

/**
 * Hook to manage dynamic filters per question.
 * Integrates with filterService for programmatic filter definitions (API 1)
 * and filtered question data (API 2).
 *
 * @param {Object} options
 * @param {string} options.surveyId - Survey ID (used for API calls)
 * @param {Object} options.data - Data object (for local mode, to get attributes)
 * @param {Object} options.initialFilters - Initial filters per question { questionId: [{ filterType, values }] }
 * @returns {Object}
 */
export function useQuestionFilters({
  surveyId = null,
  data = null,
  initialFilters = {},
}) {
  // State: filters per question { questionId: [{ filterType: "TipodeCliente", values: ["pré-pago"] }] }
  const [questionFilters, setQuestionFiltersInternal] = useState(initialFilters);

  // Filter definitions from API 1
  const [filterDefinitions, setFilterDefinitions] = useState([]);
  const [isLoadingDefinitions, setIsLoadingDefinitions] = useState(false);
  const [definitionsError, setDefinitionsError] = useState(null);

  // Filtered data per question from API 2
  // { [questionId]: { data: {...}, loading: false, error: null, appliedFilters: [...] } }
  const [filteredData, setFilteredData] = useState({});

  // Resolve surveyId from data if not provided
  const resolvedSurveyId = surveyId || data?.metadata?.surveyId || "telmob";

  // Load filter definitions on mount (API 1)
  useEffect(() => {
    let cancelled = false;

    const loadDefinitions = async () => {
      setIsLoadingDefinitions(true);
      setDefinitionsError(null);

      try {
        const result = await fetchFilterDefinitions(resolvedSurveyId);
        if (!cancelled) {
          if (result?.success && result?.data?.filters) {
            setFilterDefinitions(result.data.filters);
          } else {
            setDefinitionsError("Failed to load filter definitions");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setDefinitionsError(err?.message || "Error loading filter definitions");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDefinitions(false);
        }
      }
    };

    loadDefinitions();
    return () => { cancelled = true; };
  }, [resolvedSurveyId]);

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
        if (values.length === 0) {
          newFilters = currentFilters.filter(
            (f) => f.filterType !== filterType
          );
        } else {
          newFilters = [...currentFilters];
          newFilters[existingFilterIndex] = { filterType, values };
        }
      } else {
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
              return null;
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
    // Also clear filtered data for this question
    setFilteredData((prev) => {
      const newData = { ...prev };
      delete newData[questionId];
      return newData;
    });
  }, []);

  // Clear all filters for all questions
  const clearAllFilters = useCallback(() => {
    setQuestionFiltersInternal({});
  }, []);

  // Clear all filtered data (restores original data for all questions)
  const clearFilteredData = useCallback(() => {
    setFilteredData({});
  }, []);

  // Check if a question has active filters
  const hasActiveFilters = useCallback((questionId) => {
    const filters = questionFilters[questionId] || [];
    return filters.some((f) => f.values && f.values.length > 0);
  }, [questionFilters]);

  // Check if any question has active filters
  const hasAnyActiveFilters = useMemo(() => {
    return Object.keys(questionFilters).some((questionId) => {
      const filters = questionFilters[questionId] || [];
      return filters.some((f) => f.values && f.values.length > 0);
    });
  }, [questionFilters]);

  /**
   * Apply filters for a specific question (calls API 2)
   * Converts internal filter format { filterType, values } to API format { filter_id, values }
   */
  const applyFilters = useCallback(async (questionId, filters) => {
    // Convert from internal format to API format
    const apiFilters = filters
      .filter((f) => f.values && f.values.length > 0)
      .map((f) => ({
        filter_id: f.filterType,
        values: f.values,
      }));

    if (apiFilters.length === 0) {
      // No filters to apply - clear filtered data for this question
      setFilteredData((prev) => {
        const newData = { ...prev };
        delete newData[questionId];
        return newData;
      });
      return;
    }

    // Set loading state
    setFilteredData((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        loading: true,
        error: null,
      },
    }));

    try {
      const result = await fetchFilteredQuestionData(
        resolvedSurveyId,
        questionId,
        apiFilters,
      );

      if (result.success && result.data) {
        setFilteredData((prev) => ({
          ...prev,
          [questionId]: {
            data: result.data.data,
            loading: false,
            error: null,
            appliedFilters: apiFilters,
          },
        }));
      } else {
        setFilteredData((prev) => ({
          ...prev,
          [questionId]: {
            data: null,
            loading: false,
            error: result.error || "Erro ao carregar dados filtrados",
            appliedFilters: apiFilters,
          },
        }));
      }
    } catch (err) {
      setFilteredData((prev) => ({
        ...prev,
        [questionId]: {
          data: null,
          loading: false,
          error: err?.message || "Erro ao carregar dados filtrados",
          appliedFilters: apiFilters,
        },
      }));
    }
  }, [resolvedSurveyId]);

  return {
    // State (backward compatibility - direct access to object)
    questionFilters,
    setQuestionFilters,
    setAllQuestionFilters,

    // Per-question operations
    getQuestionFilters,
    updateQuestionFilter,
    removeFilterValue,
    clearQuestionFilters,
    hasActiveFilters,

    // Global operations
    clearAllFilters,
    hasAnyActiveFilters,

    // Filter definitions (API 1)
    filterDefinitions,
    isLoadingDefinitions,
    definitionsError,

    // Filtered data (API 2)
    filteredData,
    applyFilters,
    clearFilteredData,
  };
}
