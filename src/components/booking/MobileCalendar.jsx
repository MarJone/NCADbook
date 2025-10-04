import { useState, useRef, useEffect } from 'react';
import '../../styles/mobile-calendar.css';

export default function MobileCalendar({
  selectedStartDate,
  selectedEndDate,
  onStartDateChange,
  onEndDateChange,
  minDate = new Date(),
  unavailableDates = [],
  mode = 'range' // 'single' or 'range'
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState(null);
  const calendarRef = useRef(null);
  const touchStartX = useRef(0);

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Swipe gesture for month navigation
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    // Swipe left (next month)
    if (diff > 50) {
      goToNextMonth();
    }
    // Swipe right (previous month)
    else if (diff < -50) {
      goToPreviousMonth();
    }
  };

  // Check if date is unavailable
  const isDateUnavailable = (date) => {
    return unavailableDates.some(unavailable =>
      unavailable.toDateString() === date.toDateString()
    );
  };

  // Check if date is before min date
  const isBeforeMin = (date) => {
    const min = new Date(minDate);
    min.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < min;
  };

  // Check if date is selected
  const isDateSelected = (date) => {
    if (!selectedStartDate) return false;

    const dateStr = date.toDateString();
    const startStr = selectedStartDate.toDateString();

    if (mode === 'single') {
      return dateStr === startStr;
    }

    // Range mode
    if (!selectedEndDate) {
      return dateStr === startStr;
    }

    const endStr = selectedEndDate.toDateString();
    return dateStr === startStr || dateStr === endStr;
  };

  // Check if date is in range
  const isInRange = (date) => {
    if (!selectedStartDate || !selectedEndDate || mode === 'single') return false;

    return date > selectedStartDate && date < selectedEndDate;
  };

  // Handle date click
  const handleDateClick = (day) => {
    const clickedDate = new Date(year, month, day);

    // Prevent selecting unavailable or past dates
    if (isBeforeMin(clickedDate) || isDateUnavailable(clickedDate)) {
      return;
    }

    if (mode === 'single') {
      onStartDateChange(clickedDate);
      return;
    }

    // Range mode
    if (selectingStart || !selectedStartDate) {
      onStartDateChange(clickedDate);
      onEndDateChange(null);
      setSelectingStart(false);
    } else {
      // If clicked date is before start, swap them
      if (clickedDate < selectedStartDate) {
        onEndDateChange(selectedStartDate);
        onStartDateChange(clickedDate);
      } else {
        onEndDateChange(clickedDate);
      }
      setSelectingStart(true);
    }
  };

  // Drag to select range (desktop + mobile)
  const handleMouseDown = (day) => {
    if (mode !== 'range') return;

    const date = new Date(year, month, day);
    if (isBeforeMin(date) || isDateUnavailable(date)) return;

    setIsDragging(true);
    setDragStartDate(date);
    onStartDateChange(date);
    onEndDateChange(null);
  };

  const handleMouseEnter = (day) => {
    if (!isDragging || mode !== 'range') return;

    const date = new Date(year, month, day);
    if (isBeforeMin(date) || isDateUnavailable(date)) return;

    // Set as end date
    if (date > dragStartDate) {
      onEndDateChange(date);
    } else {
      // Dragging backwards - swap
      onStartDateChange(date);
      onEndDateChange(dragStartDate);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStartDate(null);
    setSelectingStart(true);
  };

  // Listen for mouse up anywhere
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Get cell status class
  const getCellClass = (day) => {
    const date = new Date(year, month, day);
    const classes = ['calendar-day'];

    if (isBeforeMin(date)) classes.push('disabled');
    if (isDateUnavailable(date)) classes.push('unavailable');
    if (isDateSelected(date)) classes.push('selected');
    if (isInRange(date)) classes.push('in-range');
    if (date.toDateString() === new Date().toDateString()) classes.push('today');

    return classes.join(' ');
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <button
          key={day}
          type="button"
          className={getCellClass(day)}
          onClick={() => handleDateClick(day)}
          onMouseDown={() => handleMouseDown(day)}
          onMouseEnter={() => handleMouseEnter(day)}
          disabled={isBeforeMin(new Date(year, month, day)) || isDateUnavailable(new Date(year, month, day))}
          data-testid={`calendar-day-${day}`}
          aria-label={`${month + 1}/${day}/${year}`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div
      className="mobile-calendar"
      ref={calendarRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      data-testid="mobile-calendar"
    >
      {/* Calendar header */}
      <div className="calendar-header">
        <button
          type="button"
          className="calendar-nav-btn"
          onClick={goToPreviousMonth}
          aria-label="Previous month"
          data-testid="prev-month-btn"
        >
          ‹
        </button>
        <h3 className="calendar-month-year">
          {monthNames[month]} {year}
        </h3>
        <button
          type="button"
          className="calendar-nav-btn"
          onClick={goToNextMonth}
          aria-label="Next month"
          data-testid="next-month-btn"
        >
          ›
        </button>
      </div>

      {/* Day labels */}
      <div className="calendar-weekdays">
        <div className="calendar-weekday">Sun</div>
        <div className="calendar-weekday">Mon</div>
        <div className="calendar-weekday">Tue</div>
        <div className="calendar-weekday">Wed</div>
        <div className="calendar-weekday">Thu</div>
        <div className="calendar-weekday">Fri</div>
        <div className="calendar-weekday">Sat</div>
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid" data-testid="calendar-grid">
        {renderCalendarDays()}
      </div>

      {/* Selection hint */}
      {mode === 'range' && (
        <div className="calendar-hint">
          {selectingStart && !selectedStartDate && <span>Tap to select start date</span>}
          {!selectingStart && selectedStartDate && !selectedEndDate && <span>Tap to select end date</span>}
          {selectedStartDate && selectedEndDate && <span>Drag to select range or tap to change</span>}
        </div>
      )}
    </div>
  );
}
