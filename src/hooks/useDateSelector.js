/**
 * useDateSelector Hook
 * Handles date selection with smart weekend auto-inclusion
 *
 * Features:
 * - Auto-includes Saturday/Sunday when Friday is selected as end date
 * - Provides visual indicators for weekend inclusion
 * - Calculates rental duration
 */

import { useState, useCallback, useMemo } from 'react';

/**
 * Check if a date is a Friday
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
function isFriday(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.getDay() === 5;
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
function isWeekend(date) {
  const d = date instanceof Date ? date : new Date(date);
  const day = d.getDay();
  return day === 0 || day === 6;
}

/**
 * Get the next Monday after a date
 * @param {Date} date - Starting date
 * @returns {Date}
 */
function getNextMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + daysUntilMonday);
  return d;
}

/**
 * Format date to YYYY-MM-DD string
 * @param {Date} date - Date to format
 * @returns {string}
 */
function formatDateString(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse date string to Date object
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @returns {Date|null}
 */
function parseDateString(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Calculate number of days between two dates
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {number}
 */
function daysBetween(start, end) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((end - start) / oneDay)) + 1;
}

/**
 * useDateSelector Hook
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoIncludeWeekend - Whether to auto-include weekends (default: true)
 * @param {number} options.maxDays - Maximum booking duration (default: 14)
 * @returns {Object} Date selector state and handlers
 */
export function useDateSelector(options = {}) {
  const {
    autoIncludeWeekend = true,
    maxDays = 14,
  } = options;

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [originalEndDate, setOriginalEndDate] = useState(''); // Before weekend extension
  const [weekendIncluded, setWeekendIncluded] = useState(false);

  /**
   * Handle start date change
   */
  const handleStartDateChange = useCallback((dateStr) => {
    setStartDate(dateStr);

    // If end date is before new start date, clear it
    if (endDate && dateStr && endDate < dateStr) {
      setEndDate('');
      setOriginalEndDate('');
      setWeekendIncluded(false);
    }
  }, [endDate]);

  /**
   * Handle end date change with weekend auto-inclusion
   */
  const handleEndDateChange = useCallback((dateStr) => {
    if (!dateStr) {
      setEndDate('');
      setOriginalEndDate('');
      setWeekendIncluded(false);
      return;
    }

    const endDateObj = parseDateString(dateStr);

    // Check if we should auto-include weekend
    if (autoIncludeWeekend && isFriday(endDateObj)) {
      // Extend to Sunday
      const sunday = new Date(endDateObj);
      sunday.setDate(sunday.getDate() + 2);

      setOriginalEndDate(dateStr);
      setEndDate(formatDateString(sunday));
      setWeekendIncluded(true);
    } else if (autoIncludeWeekend && endDateObj.getDay() === 6) {
      // If Saturday selected, extend to Sunday
      const sunday = new Date(endDateObj);
      sunday.setDate(sunday.getDate() + 1);

      setOriginalEndDate(dateStr);
      setEndDate(formatDateString(sunday));
      setWeekendIncluded(true);
    } else {
      setOriginalEndDate('');
      setEndDate(dateStr);
      setWeekendIncluded(false);
    }
  }, [autoIncludeWeekend]);

  /**
   * Remove weekend extension (user override)
   */
  const removeWeekendExtension = useCallback(() => {
    if (originalEndDate) {
      setEndDate(originalEndDate);
      setOriginalEndDate('');
      setWeekendIncluded(false);
    }
  }, [originalEndDate]);

  /**
   * Calculate rental duration info
   */
  const durationInfo = useMemo(() => {
    if (!startDate || !endDate) {
      return { days: 0, includesWeekend: false, message: '' };
    }

    const start = parseDateString(startDate);
    const end = parseDateString(endDate);
    const days = daysBetween(start, end);

    let weekendDays = 0;
    const current = new Date(start);
    while (current <= end) {
      if (isWeekend(current)) {
        weekendDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    let message = `${days} day${days !== 1 ? 's' : ''}`;
    if (weekendDays > 0 && weekendIncluded) {
      message += ` (includes weekend)`;
    }

    return {
      days,
      weekendDays,
      includesWeekend: weekendIncluded,
      isOverLimit: days > maxDays,
      message,
    };
  }, [startDate, endDate, weekendIncluded, maxDays]);

  /**
   * Reset all dates
   */
  const reset = useCallback(() => {
    setStartDate('');
    setEndDate('');
    setOriginalEndDate('');
    setWeekendIncluded(false);
  }, []);

  /**
   * Set dates programmatically
   */
  const setDates = useCallback((start, end) => {
    setStartDate(start);
    handleEndDateChange(end);
  }, [handleEndDateChange]);

  return {
    // State
    startDate,
    endDate,
    originalEndDate,
    weekendIncluded,
    durationInfo,

    // Handlers
    handleStartDateChange,
    handleEndDateChange,
    removeWeekendExtension,
    reset,
    setDates,

    // Utilities
    isValidRange: startDate && endDate && startDate <= endDate && !durationInfo.isOverLimit,
  };
}

export default useDateSelector;
