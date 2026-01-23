import { useState, useEffect, useMemo, useRef } from "react";

/**
 * Hook to manage question type filter state (all, nps, open-ended, multiple-choice, single-choice)
 * Unifies the three redundant states into a single source of truth
 * 
 * @param {Object} options
 * @param {Object} options.data - Data object that may contain _filterPillsState
 * @param {Object} options.externalFilterState - External filter state (optional, for compatibility)
 * @param {string} options.initialQuestionTypeFilter - Initial filter value (default: "all")
 * @param {boolean} options.initialShowWordCloud - Initial word cloud state (default: true)
 * @returns {Object} { questionTypeFilter, setQuestionTypeFilter, showWordCloud, setShowWordCloud }
 */
export function useQuestionTypeFilter({
  data,
  externalFilterState = null,
  initialQuestionTypeFilter = "all",
  initialShowWordCloud = true,
}) {
  // Single source of truth - internal state
  const [questionTypeFilter, setQuestionTypeFilterInternal] = useState(initialQuestionTypeFilter);
  const [showWordCloud, setShowWordCloudInternal] = useState(initialShowWordCloud);

  // Track sync counter for re-renders when _filterPillsState changes
  const [syncCounter, setSyncCounter] = useState(0);
  const prevFilterRef = useRef(null);
  const prevWordCloudRef = useRef(null);

  // Initialize from _filterPillsState if available
  useEffect(() => {
    if (data?._filterPillsState) {
      const pillsFilter = data._filterPillsState.questionTypeFilter || data._filterPillsState.questionFilter;
      const pillsWordCloud = data._filterPillsState.showWordCloud;
      
      if (pillsFilter !== undefined && pillsFilter !== questionTypeFilter) {
        setQuestionTypeFilterInternal(pillsFilter || "all");
      }
      if (pillsWordCloud !== undefined && pillsWordCloud !== showWordCloud) {
        setShowWordCloudInternal(pillsWordCloud);
      }
    }
  }, [data?._filterPillsState]); // Only on mount/destroy

  // Polling to detect changes in _filterPillsState (mutations don't trigger React re-renders)
  useEffect(() => {
    if (data?._filterPillsState) {
      // Initialize refs
      if (prevFilterRef.current === null) {
        prevFilterRef.current = data._filterPillsState.questionTypeFilter || data._filterPillsState.questionFilter;
      }
      if (prevWordCloudRef.current === null) {
        prevWordCloudRef.current = data._filterPillsState.showWordCloud;
      }
      
      const interval = setInterval(() => {
        const currentFilter = data._filterPillsState?.questionTypeFilter || data._filterPillsState?.questionFilter;
        const currentWordCloud = data._filterPillsState?.showWordCloud;

        const filterChanged = currentFilter !== prevFilterRef.current;
        const wordCloudChanged = currentWordCloud !== prevWordCloudRef.current;
        
        if (filterChanged || wordCloudChanged) {
          prevFilterRef.current = currentFilter;
          prevWordCloudRef.current = currentWordCloud;
          
          if (filterChanged && currentFilter !== undefined) {
            setQuestionTypeFilterInternal(currentFilter || "all");
          }
          if (wordCloudChanged && currentWordCloud !== undefined) {
            setShowWordCloudInternal(currentWordCloud);
          }
          
          setSyncCounter((prev) => prev + 1);
        }
      }, 50);

      return () => clearInterval(interval);
    } else {
      prevFilterRef.current = null;
      prevWordCloudRef.current = null;
    }
  }, [data?._filterPillsState]);

  // Sync with externalFilterState if provided
  useEffect(() => {
    if (externalFilterState) {
      const externalFilter = externalFilterState.questionTypeFilter || externalFilterState.questionFilter;
      const externalWordCloud = externalFilterState.showWordCloud;

      if (externalFilter !== undefined && externalFilter !== questionTypeFilter) {
        setQuestionTypeFilterInternal(externalFilter || "all");
      }
      if (externalWordCloud !== undefined && externalWordCloud !== showWordCloud) {
        setShowWordCloudInternal(externalWordCloud);
      }
    }
  }, [externalFilterState?.questionTypeFilter, externalFilterState?.questionFilter, externalFilterState?.showWordCloud]);

  // Get current value - prioritize _filterPillsState, then external, then internal
  const currentQuestionTypeFilter = useMemo(() => {
    const pillsFilter = data?._filterPillsState?.questionTypeFilter || data?._filterPillsState?.questionFilter;
    if (pillsFilter !== undefined) {
      return pillsFilter || "all";
    }
    const externalFilter = externalFilterState?.questionTypeFilter || externalFilterState?.questionFilter;
    if (externalFilter !== undefined) {
      return externalFilter || "all";
    }
    return questionTypeFilter;
  }, [data?._filterPillsState?.questionTypeFilter, data?._filterPillsState?.questionFilter, externalFilterState?.questionTypeFilter, externalFilterState?.questionFilter, questionTypeFilter, syncCounter]);

  const currentShowWordCloud = useMemo(() => {
    const pillsWordCloud = data?._filterPillsState?.showWordCloud;
    if (pillsWordCloud !== undefined) {
      return pillsWordCloud;
    }
    if (externalFilterState?.showWordCloud !== undefined) {
      return externalFilterState.showWordCloud;
    }
    return showWordCloud;
  }, [data?._filterPillsState?.showWordCloud, externalFilterState?.showWordCloud, showWordCloud, syncCounter]);

  // Setters that update all sources
  const setQuestionTypeFilter = (value) => {
    const filterValue = value || "all";
    
    // Update internal state
    setQuestionTypeFilterInternal(filterValue);
    
    // Update _filterPillsState if exists
    if (data && typeof data === "object" && !Array.isArray(data)) {
      if (data._filterPillsState) {
        data._filterPillsState.questionTypeFilter = filterValue;
        // Keep backward compatibility
        data._filterPillsState.questionFilter = filterValue;
        if (data._filterPillsState.setQuestionTypeFilter) {
          data._filterPillsState.setQuestionTypeFilter(filterValue);
        }
        // Backward compatibility
        if (data._filterPillsState.setQuestionFilter) {
          data._filterPillsState.setQuestionFilter(filterValue);
        }
      }
    }
    
    // Update external state if available
    if (externalFilterState?.setQuestionTypeFilter) {
      try {
        externalFilterState.setQuestionTypeFilter(filterValue);
      } catch (e) {
        // Silently handle errors
      }
    }
    // Backward compatibility
    if (externalFilterState?.setQuestionFilter) {
      try {
        externalFilterState.setQuestionFilter(filterValue);
      } catch (e) {
        // Silently handle errors
      }
    }
  };

  const setShowWordCloud = (value) => {
    // Update internal state
    setShowWordCloudInternal(value);
    
    // Update _filterPillsState if exists
    if (data && typeof data === "object" && !Array.isArray(data)) {
      if (data._filterPillsState) {
        data._filterPillsState.showWordCloud = value;
        if (data._filterPillsState.setShowWordCloud) {
          data._filterPillsState.setShowWordCloud(value);
        }
      }
    }
    
    // Update external state if available
    if (externalFilterState?.setShowWordCloud) {
      try {
        externalFilterState.setShowWordCloud(value);
      } catch (e) {
        // Silently handle errors
      }
    }
  };

  return {
    questionTypeFilter: currentQuestionTypeFilter,
    setQuestionTypeFilter,
    showWordCloud: currentShowWordCloud,
    setShowWordCloud,
  };
}
