import { useState } from 'react';
import './RecurringBookingSelector.css';

/**
 * Recurring Booking Pattern Selector
 *
 * Allows users to set up recurring room bookings with patterns:
 * - Daily (weekdays only, all days)
 * - Weekly (specific days of week)
 * - Bi-weekly
 * - Monthly (same day each month)
 * - Custom pattern
 */

const RECURRENCE_TYPES = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly'
};

const WEEKDAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' }
];

export default function RecurringBookingSelector({ onPatternChange, initialPattern = null }) {
  const [recurrenceType, setRecurrenceType] = useState(initialPattern?.type || RECURRENCE_TYPES.NONE);
  const [selectedDays, setSelectedDays] = useState(initialPattern?.days || []);
  const [weekdaysOnly, setWeekdaysOnly] = useState(initialPattern?.weekdaysOnly || true);
  const [endDate, setEndDate] = useState(initialPattern?.endDate || '');
  const [occurrences, setOccurrences] = useState(initialPattern?.occurrences || 10);

  const handleRecurrenceTypeChange = (type) => {
    setRecurrenceType(type);

    if (type === RECURRENCE_TYPES.WEEKLY || type === RECURRENCE_TYPES.BIWEEKLY) {
      // Pre-select current day of week if none selected
      if (selectedDays.length === 0) {
        const today = new Date().getDay();
        setSelectedDays([today]);
      }
    }

    updatePattern(type, selectedDays, weekdaysOnly, endDate, occurrences);
  };

  const handleDayToggle = (day) => {
    let newDays;
    if (selectedDays.includes(day)) {
      newDays = selectedDays.filter(d => d !== day);
    } else {
      newDays = [...selectedDays, day].sort((a, b) => a - b);
    }
    setSelectedDays(newDays);
    updatePattern(recurrenceType, newDays, weekdaysOnly, endDate, occurrences);
  };

  const handleWeekdaysOnlyChange = (value) => {
    setWeekdaysOnly(value);
    updatePattern(recurrenceType, selectedDays, value, endDate, occurrences);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    updatePattern(recurrenceType, selectedDays, weekdaysOnly, date, occurrences);
  };

  const handleOccurrencesChange = (count) => {
    setOccurrences(count);
    updatePattern(recurrenceType, selectedDays, weekdaysOnly, endDate, count);
  };

  const updatePattern = (type, days, weekdaysOnly, endDate, occurrences) => {
    if (type === RECURRENCE_TYPES.NONE) {
      onPatternChange(null);
      return;
    }

    const pattern = {
      type,
      days: type === RECURRENCE_TYPES.WEEKLY || type === RECURRENCE_TYPES.BIWEEKLY ? days : [],
      weekdaysOnly: type === RECURRENCE_TYPES.DAILY ? weekdaysOnly : false,
      endDate,
      occurrences: parseInt(occurrences) || 10
    };

    onPatternChange(pattern);
  };

  const getPatternDescription = () => {
    if (recurrenceType === RECURRENCE_TYPES.NONE) return 'No recurrence';

    let desc = '';
    switch (recurrenceType) {
      case RECURRENCE_TYPES.DAILY:
        desc = weekdaysOnly ? 'Every weekday' : 'Every day';
        break;
      case RECURRENCE_TYPES.WEEKLY:
        if (selectedDays.length === 0) {
          desc = 'Weekly (select days)';
        } else {
          const dayNames = selectedDays.map(d => WEEKDAYS[d].label).join(', ');
          desc = `Every ${dayNames}`;
        }
        break;
      case RECURRENCE_TYPES.BIWEEKLY:
        if (selectedDays.length === 0) {
          desc = 'Bi-weekly (select days)';
        } else {
          const dayNames = selectedDays.map(d => WEEKDAYS[d].label).join(', ');
          desc = `Every other ${dayNames}`;
        }
        break;
      case RECURRENCE_TYPES.MONTHLY:
        desc = 'Monthly on the same day';
        break;
    }

    if (endDate) {
      desc += ` until ${new Date(endDate).toLocaleDateString()}`;
    } else {
      desc += ` for ${occurrences} occurrences`;
    }

    return desc;
  };

  return (
    <div className="recurring-booking-selector">
      <div className="recurring-header">
        <h4>Recurring Booking</h4>
        <p className="recurring-description">{getPatternDescription()}</p>
      </div>

      <div className="form-group">
        <label>Recurrence Pattern</label>
        <select
          value={recurrenceType}
          onChange={(e) => handleRecurrenceTypeChange(e.target.value)}
          className="select-input"
        >
          <option value={RECURRENCE_TYPES.NONE}>One-time booking</option>
          <option value={RECURRENCE_TYPES.DAILY}>Daily</option>
          <option value={RECURRENCE_TYPES.WEEKLY}>Weekly</option>
          <option value={RECURRENCE_TYPES.BIWEEKLY}>Bi-weekly</option>
          <option value={RECURRENCE_TYPES.MONTHLY}>Monthly</option>
        </select>
      </div>

      {recurrenceType === RECURRENCE_TYPES.DAILY && (
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={weekdaysOnly}
              onChange={(e) => handleWeekdaysOnlyChange(e.target.checked)}
            />
            <span>Weekdays only (Mon-Fri)</span>
          </label>
        </div>
      )}

      {(recurrenceType === RECURRENCE_TYPES.WEEKLY || recurrenceType === RECURRENCE_TYPES.BIWEEKLY) && (
        <div className="form-group">
          <label>Select Days</label>
          <div className="weekday-selector">
            {WEEKDAYS.map(day => (
              <button
                key={day.value}
                type="button"
                className={`weekday-btn ${selectedDays.includes(day.value) ? 'selected' : ''}`}
                onClick={() => handleDayToggle(day.value)}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {recurrenceType !== RECURRENCE_TYPES.NONE && (
        <>
          <div className="form-group">
            <label>End Recurrence</label>
            <div className="recurrence-end-options">
              <label className="radio-label">
                <input
                  type="radio"
                  name="end-type"
                  checked={!endDate}
                  onChange={() => handleEndDateChange('')}
                />
                <span>After</span>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={occurrences}
                  onChange={(e) => handleOccurrencesChange(e.target.value)}
                  disabled={!!endDate}
                  className="occurrences-input"
                />
                <span>occurrences</span>
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  name="end-type"
                  checked={!!endDate}
                  onChange={() => {
                    const threeMonths = new Date();
                    threeMonths.setMonth(threeMonths.getMonth() + 3);
                    handleEndDateChange(threeMonths.toISOString().split('T')[0]);
                  }}
                />
                <span>On date</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  disabled={!endDate}
                  min={new Date().toISOString().split('T')[0]}
                  className="date-input"
                />
              </label>
            </div>
          </div>

          <div className="recurrence-warning">
            <span className="warning-icon">⚠️</span>
            <p>Recurring bookings will be created for all available slots matching this pattern. Conflicts will be skipped.</p>
          </div>
        </>
      )}
    </div>
  );
}

// Helper function to generate recurring dates
export function generateRecurringDates(startDate, pattern) {
  if (!pattern || pattern.type === RECURRENCE_TYPES.NONE) {
    return [startDate];
  }

  const dates = [];
  const start = new Date(startDate);
  let current = new Date(start);
  let count = 0;

  const maxIterations = pattern.endDate ? 365 : pattern.occurrences;

  while (count < maxIterations) {
    let shouldAdd = false;

    switch (pattern.type) {
      case RECURRENCE_TYPES.DAILY:
        if (pattern.weekdaysOnly) {
          const day = current.getDay();
          shouldAdd = day >= 1 && day <= 5; // Monday to Friday
        } else {
          shouldAdd = true;
        }
        break;

      case RECURRENCE_TYPES.WEEKLY:
        shouldAdd = pattern.days.includes(current.getDay());
        break;

      case RECURRENCE_TYPES.BIWEEKLY:
        const weeksDiff = Math.floor((current - start) / (7 * 24 * 60 * 60 * 1000));
        shouldAdd = weeksDiff % 2 === 0 && pattern.days.includes(current.getDay());
        break;

      case RECURRENCE_TYPES.MONTHLY:
        shouldAdd = current.getDate() === start.getDate();
        break;
    }

    if (shouldAdd) {
      const dateStr = current.toISOString().split('T')[0];

      if (pattern.endDate && dateStr > pattern.endDate) {
        break;
      }

      dates.push(dateStr);
      count++;
    }

    // Move to next day
    current.setDate(current.getDate() + 1);

    if (pattern.endDate && current > new Date(pattern.endDate)) {
      break;
    }
  }

  return dates;
}
