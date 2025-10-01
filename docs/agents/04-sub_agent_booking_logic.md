# Sub-Agent: Booking Logic Engine

## Role Definition
You are the **Booking Logic Engine** for the NCAD Equipment Booking System. Your expertise is in implementing complex booking workflows, conflict detection, and automated business rules.

## Primary Responsibilities
1. Implement date selection with weekend auto-inclusion logic
2. Build conflict detection algorithms for multi-item bookings
3. Create strike system automation
4. Handle booking approval workflow
5. Manage equipment status updates based on booking state

## Context from PRD
- **Business Rule**: Friday bookings auto-include weekends
- **Multi-Item**: Students can book multiple equipment items simultaneously
- **Conflicts**: Prevent double-booking of equipment
- **Strike System**: 3-strike system with escalating consequences
- **Performance**: <1 second booking submission time

## Core Booking Logic

### 1. Date Selection with Weekend Auto-Inclusion

```javascript
// /js/booking/date-selector.js
class DateSelector {
  constructor() {
    this.selectedDates = new Set();
    this.unavailableDates = new Set();
    this.provisionalDates = new Set();
  }
  
  /**
   * Select a date and auto-include weekend if Friday is selected
   * @param {Date} date - The date to select
   * @returns {Set} - Set of all selected dates including auto-included dates
   */
  selectDate(date) {
    const dateStr = this.formatDate(date);
    
    // If already selected, deselect it
    if (this.selectedDates.has(dateStr)) {
      this.deselectDate(date);
      return this.selectedDates;
    }
    
    // Check if date is available
    if (this.unavailableDates.has(dateStr)) {
      throw new Error('This date is not available for booking');
    }
    
    // Add the selected date
    this.selectedDates.add(dateStr);
    
    // Auto-include weekend if Friday is selected
    if (date.getDay() === 5) { // Friday
      const saturday = new Date(date);
      saturday.setDate(date.getDate() + 1);
      
      const sunday = new Date(date);
      sunday.setDate(date.getDate() + 2);
      
      this.selectedDates.add(this.formatDate(saturday));
      this.selectedDates.add(this.formatDate(sunday));
      
      console.log('Weekend auto-included with Friday booking');
    }
    
    return this.selectedDates;
  }
  
  /**
   * Deselect a date and remove weekend if applicable
   * @param {Date} date - The date to deselect
   */
  deselectDate(date) {
    const dateStr = this.formatDate(date);
    this.selectedDates.delete(dateStr);
    
    // If deselecting Friday, also remove weekend
    if (date.getDay() === 5) {
      const saturday = new Date(date);
      saturday.setDate(date.getDate() + 1);
      
      const sunday = new Date(date);
      sunday.setDate(date.getDate() + 2);
      
      this.selectedDates.delete(this.formatDate(saturday));
      this.selectedDates.delete(this.formatDate(sunday));
    }
  }
  
  /**
   * Select a date range
   * @param {Date} startDate 
   * @param {Date} endDate 
   */
  selectRange(startDate, endDate) {
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      try {
        this.selectDate(new Date(currentDate));
      } catch (error) {
        console.warn(`Skipping unavailable date: ${currentDate}`);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return this.selectedDates;
  }
  
  /**
   * Get selected date range
   * @returns {Object} - Start and end dates
   */
  getDateRange() {
    if (this.selectedDates.size === 0) {
      return null;
    }
    
    const dates = Array.from(this.selectedDates)
      .map(d => new Date(d))
      .sort((a, b) => a - b);
    
    return {
      startDate: dates[0],
      endDate: dates[dates.length - 1],
      totalDays: dates.length
    };
  }
  
  /**
   * Format date to YYYY-MM-DD string
   */
  formatDate(date) {
    return date.toISOString().split('T')[0];
  }
  
  /**
   * Clear all selections
   */
  clearSelection() {
    this.selectedDates.clear();
  }
}

export const dateSelector = new DateSelector();
```

### 2. Conflict Detection System

```javascript
// /js/booking/conflict-detector.js
import { supabase } from '../config/supabase-config.js';

class ConflictDetector {
  /**
   * Check if equipment is available for the given date range
   * @param {Array<string>} equipmentIds - Equipment UUIDs
   * @param {Date} startDate 
   * @param {Date} endDate 
   * @param {string} excludeBookingId - Booking to exclude (for edits)
   * @returns {Object} - Conflict details
   */
  async checkAvailability(equipmentIds, startDate, endDate, excludeBookingId = null) {
    try {
      // Query for overlapping bookings
      let query = supabase
        .from('bookings')
        .select('id, equipment_ids, start_date, end_date, student_id, users(full_name)')
        .in('status', ['pending', 'approved', 'active'])
        .lte('start_date', endDate.toISOString().split('T')[0])
        .gte('end_date', startDate.toISOString().split('T')[0]);
      
      if (excludeBookingId) {
        query = query.neq('id', excludeBookingId);
      }
      
      const { data: existingBookings, error } = await query;
      
      if (error) throw error;
      
      // Check for equipment conflicts
      const conflicts = [];
      
      for (const booking of existingBookings) {
        const conflictingEquipment = equipmentIds.filter(eqId => 
          booking.equipment_ids.includes(eqId)
        );
        
        if (conflictingEquipment.length > 0) {
          conflicts.push({
            bookingId: booking.id,
            equipmentIds: conflictingEquipment,
            dateRange: {
              start: booking.start_date,
              end: booking.end_date
            },
            bookedBy: booking.users?.full_name || 'Unknown'
          });
        }
      }
      
      return {
        hasConflict: conflicts.length > 0,
        conflicts: conflicts,
        availableEquipment: equipmentIds.filter(eqId => 
          !conflicts.some(c => c.equipmentIds.includes(eqId))
        )
      };
      
    } catch (error) {
      console.error('Error checking availability:', error);
      throw new Error('Failed to check equipment availability');
    }
  }
  
  /**
   * Get detailed availability for each equipment item
   * @param {Array<string>} equipmentIds 
   * @param {Date} startDate 
   * @param {Date} endDate 
   */
  async getDetailedAvailability(equipmentIds, startDate, endDate) {
    const results = [];
    
    for (const equipmentId of equipmentIds) {
      const availability = await this.checkAvailability(
        [equipmentId],
        startDate,
        endDate
      );
      
      results.push({
        equipmentId,
        available: !availability.hasConflict,
        conflicts: availability.conflicts
      });
    }
    
    return results;
  }
  
  /**
   * Find alternative available dates for equipment
   * @param {Array<string>} equipmentIds 
   * @param {Date} preferredStart 
   * @param {number} duration - Number of days
   */
  async suggestAlternativeDates(equipmentIds, preferredStart, duration) {
    const suggestions = [];
    const maxSearchDays = 30; // Search up to 30 days ahead
    
    for (let offset = 0; offset < maxSearchDays; offset++) {
      const testStart = new Date(preferredStart);
      testStart.setDate(testStart.getDate() + offset);
      
      const testEnd = new Date(testStart);
      testEnd.setDate(testStart.getDate() + duration - 1);
      
      const availability = await this.checkAvailability(
        equipmentIds,
        testStart,
        testEnd
      );
      
      if (!availability.hasConflict) {
        suggestions.push({
          startDate: testStart,
          endDate: testEnd,
          available: true
        });
        
        if (suggestions.length >= 5) {
          break; // Return top 5 suggestions
        }
      }
    }
    
    return suggestions;
  }
  
  /**
   * Real-time availability check for calendar display
   * @param {string} equipmentId 
   * @param {Date} month - First day of month to check
   */
  async getMonthAvailability(equipmentId, month) {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    // Get all bookings for this equipment in the month
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('start_date, end_date, status')
      .contains('equipment_ids', [equipmentId])
      .in('status', ['pending', 'approved', 'active'])
      .lte('start_date', endOfMonth.toISOString().split('T')[0])
      .gte('end_date', startOfMonth.toISOString().split('T')[0]);
    
    if (error) throw error;
    
    // Create availability map for each day
    const availability = {};
    const currentDate = new Date(startOfMonth);
    
    while (currentDate <= endOfMonth) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Check if date has any bookings
      const dayBookings = bookings.filter(b => 
        dateStr >= b.start_date && dateStr <= b.end_date
      );
      
      if (dayBookings.length === 0) {
        availability[dateStr] = 'available';
      } else if (dayBookings.some(b => b.status === 'pending')) {
        availability[dateStr] = 'provisional';
      } else {
        availability[dateStr] = 'booked';
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return availability;
  }
}

export const conflictDetector = new ConflictDetector();
```

### 3. Strike System Logic

```javascript
// /js/booking/strike-system.js
import { supabase } from '../config/supabase-config.js';
import { authService } from '../auth/auth-service.js';

class StrikeSystem {
  constructor() {
    this.strikeRules = {
      lateReturn: {
        strikes: 1,
        suspension: null,
        reason: 'Late equipment return'
      },
      damagedEquipment: {
        strikes: 2,
        suspension: 7, // 7 days
        reason: 'Equipment returned damaged'
      },
      noShow: {
        strikes: 1,
        suspension: null,
        reason: 'Failed to collect equipment'
      },
      lostEquipment: {
        strikes: 3,
        suspension: 30, // 30 days
        reason: 'Equipment lost'
      }
    };
    
    this.consequences = {
      1: {
        action: 'warning_email',
        restriction: null,
        message: 'First warning: Please return equipment on time'
      },
      2: {
        action: 'booking_suspension',
        restriction: 7, // days
        message: '1 week booking suspension'
      },
      3: {
        action: 'blacklist',
        restriction: 30, // days
        message: '1 month account suspension'
      }
    };
  }
  
  /**
   * Issue a strike to a user
   * @param {string} userId 
   * @param {string} strikeType - Type of violation
   * @param {string} bookingId - Related booking
   * @param {Object} details - Additional details
   */
  async issueStrike(userId, strikeType, bookingId, details = {}) {
    try {
      const rule = this.strikeRules[strikeType];
      
      if (!rule) {
        throw new Error(`Invalid strike type: ${strikeType}`);
      }
      
      // Get current user data
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('strike_count, full_name, email')
        .eq('id', userId)
        .single();
      
      if (userError) throw userError;
      
      const newStrikeCount = user.strike_count + rule.strikes;
      const consequence = this.consequences[newStrikeCount];
      
      // Update user strike count
      const updates = {
        strike_count: newStrikeCount
      };
      
      // Apply suspension if applicable
      if (consequence && consequence.restriction) {
        const suspensionEnd = new Date();
        suspensionEnd.setDate(suspensionEnd.getDate() + consequence.restriction);
        updates.blacklist_until = suspensionEnd.toISOString();
      }
      
      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      // Log the strike
      await this.logStrike(userId, strikeType, bookingId, {
        ...details,
        newStrikeCount,
        consequence: consequence?.message || 'Warning issued'
      });
      
      // Send notification to user
      await this.sendStrikeNotification(user, strikeType, consequence);
      
      // Log admin action
      await authService.logAdminAction(
        'issue_strike',
        'user',
        userId,
        {
          strikeType,
          bookingId,
          newStrikeCount,
          consequence: consequence?.action
        }
      );
      
      return {
        success: true,
        strikeCount: newStrikeCount,
        consequence: consequence
      };
      
    } catch (error) {
      console.error('Error issuing strike:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Log strike details for audit
   */
  async logStrike(userId, strikeType, bookingId, details) {
    try {
      await supabase
        .from('strike_history')
        .insert({
          user_id: userId,
          strike_type: strikeType,
          booking_id: bookingId,
          details: details,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging strike:', error);
    }
  }
  
  /**
   * Send notification about strike to user
   */
  async sendStrikeNotification(user, strikeType, consequence) {
    // TODO: Integrate with email service
    console.log(`Strike notification sent to ${user.email}`);
    console.log(`Type: ${strikeType}`);
    console.log(`Consequence: ${consequence?.message || 'Warning'}`);
  }
  
  /**
   * Reset strikes for a user (Admin only)
   * @param {string} userId 
   * @param {string} reason - Reason for reset
   */
  async resetStrikes(userId, reason) {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          strike_count: 0,
          blacklist_until: null
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Log admin action
      await authService.logAdminAction(
        'reset_strikes',
        'user',
        userId,
        { reason }
      );
      
      return { success: true };
      
    } catch (error) {
      console.error('Error resetting strikes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Check if user is currently suspended
   * @param {string} userId 
   */
  async isSuspended(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('blacklist_until')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      if (!data.blacklist_until) {
        return false;
      }
      
      return new Date(data.blacklist_until) > new Date();
      
    } catch (error) {
      console.error('Error checking suspension:', error);
      return false;
    }
  }
  
  /**
   * Get strike history for user
   * @param {string} userId 
   */
  async getStrikeHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('strike_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
      
    } catch (error) {
      console.error('Error fetching strike history:', error);
      return [];
    }
  }
  
  /**
   * Automatically check for late returns and issue strikes
   */
  async checkOverdueReturns() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Find all active bookings past their end date
      const { data: overdueBookings, error } = await supabase
        .from('bookings')
        .select('id, student_id, equipment_ids, end_date, users(full_name, email)')
        .eq('status', 'active')
        .lt('end_date', today);
      
      if (error) throw error;
      
      for (const booking of overdueBookings) {
        const daysOverdue = Math.floor(
          (new Date() - new Date(booking.end_date)) / (1000 * 60 * 60 * 24)
        );
        
        // Issue strike if more than 1 day overdue
        if (daysOverdue > 1) {
          await this.issueStrike(
            booking.student_id,
            'lateReturn',
            booking.id,
            {
              daysOverdue,
              equipmentIds: booking.equipment_ids
            }
          );
          
          // Update booking status
          await supabase
            .from('bookings')
            .update({ status: 'overdue' })
            .eq('id', booking.id);
        }
      }
      
      console.log(`Processed ${overdueBookings.length} overdue bookings`);
      
    } catch (error) {
      console.error('Error checking overdue returns:', error);
    }
  }
}

export const strikeSystem = new StrikeSystem();
```

### 4. Booking Workflow Manager

```javascript
// /js/booking/booking-workflow.js
import { supabase } from '../config/supabase-config.js';
import { authService } from '../auth/auth-service.js';
import { conflictDetector } from './conflict-detector.js';
import { strikeSystem } from './strike-system.js';

class BookingWorkflow {
  /**
   * Create a new booking request
   * @param {Object} bookingData 
   */
  async createBooking(bookingData) {
    try {
      const user = await authService.getCurrentUser();
      
      // Check if user is suspended
      const isSuspended = await strikeSystem.isSuspended(user.id);
      if (isSuspended) {
        throw new Error('Your account is currently suspended. Please contact admin.');
      }
      
      // Validate booking data
      this.validateBookingData(bookingData);
      
      // Check for conflicts
      const conflicts = await conflictDetector.checkAvailability(
        bookingData.equipmentIds,
        new Date(bookingData.startDate),
        new Date(bookingData.endDate)
      );
      
      if (conflicts.hasConflict) {
        return {
          success: false,
          error: 'Equipment not available for selected dates',
          conflicts: conflicts.conflicts
        };
      }
      
      // Create booking
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          student_id: user.id,
          equipment_ids: bookingData.equipmentIds,
          start_date: bookingData.startDate,
          end_date: bookingData.endDate,
          purpose: bookingData.purpose || null,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Send notification to admins
      await this.notifyAdmins(data);
      
      return {
        success: true,
        booking: data
      };
      
    } catch (error) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Approve a booking (Admin only)
   * @param {string} bookingId 
   * @param {string} adminNotes 
   */
  async approveBooking(bookingId, adminNotes = '') {
    try {
      const admin = await authService.getCurrentUser();
      
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'approved',
          approved_by: admin.id,
          approved_at: new Date().toISOString(),
          admin_notes: adminNotes
        })
        .eq('id', bookingId)
        .select('*, users(full_name, email)')
        .single();
      
      if (error) throw error;
      
      // Update equipment status
      await this.updateEquipmentStatus(data.equipment_ids, 'booked');
      
      // Send notification to student
      await this.notifyStudent(data, 'approved');
      
      // Log admin action
      await authService.logAdminAction(
        'approve_booking',
        'booking',
        bookingId
      );
      
      return {
        success: true,
        booking: data
      };
      
    } catch (error) {
      console.error('Error approving booking:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Deny a booking (Admin only)
   * @param {string} bookingId 
   * @param {string} reason 
   */
  async denyBooking(bookingId, reason) {
    try {
      const admin = await authService.getCurrentUser();
      
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'denied',
          approved_by: admin.id,
          approved_at: new Date().toISOString(),
          admin_notes: reason
        })
        .eq('id', bookingId)
        .select('*, users(full_name, email)')
        .single();
      
      if (error) throw error;
      
      // Send notification to student
      await this.notifyStudent(data, 'denied');
      
      // Log admin action
      await authService.logAdminAction(
        'deny_booking',
        'booking',
        bookingId,
        { reason }
      );
      
      return {
        success: true,
        booking: data
      };
      
    } catch (error) {
      console.error('Error denying booking:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Mark equipment as returned
   * @param {string} bookingId 
   * @param {Object} returnData - Condition notes, etc.
   */
  async markAsReturned(bookingId, returnData = {}) {
    try {
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Check if returned late
      const today = new Date();
      const endDate = new Date(booking.end_date);
      const isLate = today > endDate;
      
      if (isLate) {
        // Issue strike for late return
        await strikeSystem.issueStrike(
          booking.student_id,
          'lateReturn',
          bookingId,
          {
            returnDate: today.toISOString().split('T')[0],
            dueDate: booking.end_date
          }
        );
      }
      
      // Update booking
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'completed',
          return_date: today.toISOString(),
          return_condition: returnData.condition || 'good',
          return_notes: returnData.notes || null
        })
        .eq('id', bookingId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update equipment status back to available
      await this.updateEquipmentStatus(booking.equipment_ids, 'available');
      
      // Log admin action
      await authService.logAdminAction(
        'mark_returned',
        'booking',
        bookingId,
        returnData
      );
      
      return {
        success: true,
        booking: data,
        wasLate: isLate
      };
      
    } catch (error) {
      console.error('Error marking as returned:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Cancel a booking
   * @param {string} bookingId 
   * @param {string} reason 
   */
  async cancelBooking(bookingId, reason = '') {
    try {
      const user = await authService.getCurrentUser();
      
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancel_reason: reason,
          cancelled_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update equipment status
      await this.updateEquipmentStatus(data.equipment_ids, 'available');
      
      return {
        success: true,
        booking: data
      };
      
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Helper: Update equipment status
   */
  async updateEquipmentStatus(equipmentIds, status) {
    try {
      await supabase
        .from('equipment')
        .update({ status })
        .in('id', equipmentIds);
    } catch (error) {
      console.error('Error updating equipment status:', error);
    }
  }
  
  /**
   * Helper: Validate booking data
   */
  validateBookingData(data) {
    if (!data.equipmentIds || data.equipmentIds.length === 0) {
      throw new Error('At least one equipment item must be selected');
    }
    
    if (!data.startDate || !data.endDate) {
      throw new Error('Start and end dates are required');
    }
    
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    
    if (start > end) {
      throw new Error('End date must be after start date');
    }
    
    if (start < new Date()) {
      throw new Error('Cannot book dates in the past');
    }
  }
  
  /**
   * Helper: Notify admins of new booking
   */
  async notifyAdmins(booking) {
    // TODO: Implement email notifications
    console.log('Admin notification:', booking);
  }
  
  /**
   * Helper: Notify student of booking status
   */
  async notifyStudent(booking, status) {
    // TODO: Implement email notifications
    console.log(`Student notification (${status}):`, booking);
  }
}

export const bookingWorkflow = new BookingWorkflow();
```

## Usage Examples

### Complete Booking Flow
```javascript
import { dateSelector } from './js/booking/date-selector.js';
import { conflictDetector } from './js/booking/conflict-detector.js';
import { bookingWorkflow } from './js/booking/booking-workflow.js';

// Student selects dates
const startDate = new Date('2025-03-17');
dateSelector.selectDate(startDate); // Auto-includes weekend if Friday

// Check for conflicts
const conflicts = await conflictDetector.checkAvailability(
  ['eq-123', 'eq-456'],
  startDate,
  new Date('2025-03-21')
);

// Create booking if no conflicts
if (!conflicts.hasConflict) {
  const result = await bookingWorkflow.createBooking({
    equipmentIds: ['eq-123', 'eq-456'],
    startDate: '2025-03-17',
    endDate: '2025-03-21',
    purpose: 'Final year film project'
  });
}
```

## Testing Checklist
- [ ] Weekend auto-inclusion works for Friday selections
- [ ] Conflict detection prevents double-booking
- [ ] Strike system issues correct penalties
- [ ] Booking approval workflow functions properly
- [ ] Equipment status updates correctly
- [ ] Late returns trigger strikes automatically
- [ ] Suspended users cannot make bookings
- [ ] Calendar shows accurate availability

## Performance Optimization
- Cache availability data for frequently viewed months
- Batch conflict checks for multiple equipment
- Debounce calendar interactions
- Use database indexes for date range queries

## Next Steps
1. Integrate with frontend calendar UI
2. Implement real-time availability updates
3. Create admin booking management interface
4. Set up automated strike checking (cron job)
5. Build notification system
6. Add booking history analytics