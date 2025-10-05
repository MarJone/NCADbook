/**
 * Demo Strike Service - Local state management for 3-strike system
 * Works without database - uses localStorage for persistence in demo mode
 */

const STORAGE_KEY = 'demo_strike_data';

// Initialize demo strike data
const initializeDemoData = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    return JSON.parse(existing);
  }

  // Initial demo data with some students having strikes
  const initialData = {
    userStrikes: {
      // Student with 1 strike (warning only)
      '24': {
        strikeCount: 1,
        blacklistUntil: null
      },
      // Student with 2 strikes (7-day restriction)
      '25': {
        strikeCount: 2,
        blacklistUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      // Student with 3 strikes (30-day restriction)
      '26': {
        strikeCount: 3,
        blacklistUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
    },
    strikeHistory: [
      {
        id: 'strike-1',
        studentId: '24',
        bookingId: 'booking-demo-1',
        strikeNumber: 1,
        reason: 'Equipment returned 2 day(s) late',
        daysOverdue: 2,
        restrictionDays: 0,
        blacklistUntil: null,
        issuedBy: null, // null = automatic
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        revokedAt: null,
        revokedBy: null,
        revokeReason: null
      },
      {
        id: 'strike-2',
        studentId: '25',
        bookingId: 'booking-demo-2',
        strikeNumber: 1,
        reason: 'Equipment returned 1 day(s) late',
        daysOverdue: 1,
        restrictionDays: 0,
        blacklistUntil: null,
        issuedBy: null,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        revokedAt: null,
        revokedBy: null,
        revokeReason: null
      },
      {
        id: 'strike-3',
        studentId: '25',
        bookingId: 'booking-demo-3',
        strikeNumber: 2,
        reason: 'Equipment returned 3 day(s) late',
        daysOverdue: 3,
        restrictionDays: 7,
        blacklistUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        issuedBy: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        revokedAt: null,
        revokedBy: null,
        revokeReason: null
      },
      {
        id: 'strike-4',
        studentId: '26',
        bookingId: 'booking-demo-4',
        strikeNumber: 1,
        reason: 'Equipment returned 4 day(s) late',
        daysOverdue: 4,
        restrictionDays: 0,
        blacklistUntil: null,
        issuedBy: null,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        revokedAt: null,
        revokedBy: null,
        revokeReason: null
      },
      {
        id: 'strike-5',
        studentId: '26',
        bookingId: 'booking-demo-5',
        strikeNumber: 2,
        reason: 'Equipment returned 2 day(s) late',
        daysOverdue: 2,
        restrictionDays: 7,
        blacklistUntil: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // Expired
        issuedBy: null,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        revokedAt: null,
        revokedBy: null,
        revokeReason: null
      },
      {
        id: 'strike-6',
        studentId: '26',
        bookingId: 'booking-demo-6',
        strikeNumber: 3,
        reason: 'Equipment returned 5 day(s) late',
        daysOverdue: 5,
        restrictionDays: 30,
        blacklistUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        issuedBy: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        revokedAt: null,
        revokedBy: null,
        revokeReason: null
      }
    ]
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
};

// Save data to localStorage
const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Get current demo data
const getData = () => {
  return initializeDemoData();
};

/**
 * Check if student can make a booking
 */
export const canStudentBook = async (studentId) => {
  const data = getData();
  const userStrike = data.userStrikes[studentId] || { strikeCount: 0, blacklistUntil: null };

  // Check if blacklisted and still within restriction period
  if (userStrike.blacklistUntil && new Date(userStrike.blacklistUntil) > new Date()) {
    return {
      canBook: false,
      reason: `Account restricted until ${new Date(userStrike.blacklistUntil).toLocaleDateString()} due to ${userStrike.strikeCount} strike(s) for late returns`,
      strikeCount: userStrike.strikeCount,
      blacklistUntil: userStrike.blacklistUntil
    };
  }

  // Clear expired blacklist
  if (userStrike.blacklistUntil && new Date(userStrike.blacklistUntil) <= new Date()) {
    userStrike.blacklistUntil = null;
    data.userStrikes[studentId] = userStrike;
    saveData(data);
  }

  return {
    canBook: true,
    reason: 'Account in good standing',
    strikeCount: userStrike.strikeCount,
    blacklistUntil: null
  };
};

/**
 * Get student's current strike status
 */
export const getStrikeStatus = async (studentId) => {
  const data = getData();
  const userStrike = data.userStrikes[studentId] || { strikeCount: 0, blacklistUntil: null };
  const history = data.strikeHistory.filter(s => s.studentId === studentId && !s.revokedAt);

  return {
    strikeCount: userStrike.strikeCount,
    blacklistUntil: userStrike.blacklistUntil,
    history: history,
    isRestricted: userStrike.blacklistUntil && new Date(userStrike.blacklistUntil) > new Date()
  };
};

/**
 * Manually issue a strike (admin only)
 */
export const issueStrike = async (studentId, bookingId, daysOverdue, adminId) => {
  const data = getData();
  const currentStrike = data.userStrikes[studentId] || { strikeCount: 0, blacklistUntil: null };

  const newStrikeCount = Math.min(currentStrike.strikeCount + 1, 3);
  let restrictionDays = 0;
  let blacklistUntil = null;

  // Determine restriction based on strike number
  if (newStrikeCount === 1) {
    restrictionDays = 0;
    blacklistUntil = null;
  } else if (newStrikeCount === 2) {
    restrictionDays = 7;
    blacklistUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  } else if (newStrikeCount === 3) {
    restrictionDays = 30;
    blacklistUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  // Update user strikes
  data.userStrikes[studentId] = {
    strikeCount: newStrikeCount,
    blacklistUntil: blacklistUntil
  };

  // Add to history
  const strikeId = `strike-${Date.now()}`;
  const newStrike = {
    id: strikeId,
    studentId: studentId,
    bookingId: bookingId,
    strikeNumber: newStrikeCount,
    reason: `Equipment returned ${daysOverdue} day(s) late`,
    daysOverdue: daysOverdue,
    restrictionDays: restrictionDays,
    blacklistUntil: blacklistUntil,
    issuedBy: adminId,
    createdAt: new Date().toISOString(),
    revokedAt: null,
    revokedBy: null,
    revokeReason: null
  };

  data.strikeHistory.push(newStrike);
  saveData(data);

  return {
    success: true,
    strikeId: strikeId,
    previousStrikes: currentStrike.strikeCount,
    newStrikeCount: newStrikeCount,
    restrictionDays: restrictionDays,
    blacklistUntil: blacklistUntil
  };
};

/**
 * Revoke a strike (admin only)
 */
export const revokeStrike = async (strikeId, adminId, reason) => {
  const data = getData();
  const strike = data.strikeHistory.find(s => s.id === strikeId);

  if (!strike) {
    return {
      success: false,
      error: 'Strike not found'
    };
  }

  if (strike.revokedAt) {
    return {
      success: false,
      error: 'Strike already revoked'
    };
  }

  // Mark strike as revoked
  strike.revokedAt = new Date().toISOString();
  strike.revokedBy = adminId;
  strike.revokeReason = reason;

  // Decrement student strike count
  const userStrike = data.userStrikes[strike.studentId];
  if (userStrike) {
    userStrike.strikeCount = Math.max(userStrike.strikeCount - 1, 0);

    // Clear blacklist if strikes reduced below threshold
    if (userStrike.strikeCount < 2) {
      userStrike.blacklistUntil = null;
    }

    data.userStrikes[strike.studentId] = userStrike;
  }

  saveData(data);

  return {
    success: true,
    studentId: strike.studentId,
    newStrikeCount: userStrike ? userStrike.strikeCount : 0,
    message: 'Strike revoked successfully'
  };
};

/**
 * Reset all strikes (admin only - typically at start of semester)
 */
export const resetAllStrikes = async (adminId, reason) => {
  const data = getData();

  const affectedStudents = Object.keys(data.userStrikes).filter(
    studentId => data.userStrikes[studentId].strikeCount > 0
  ).length;

  // Reset all user strikes
  data.userStrikes = {};

  // Keep history but note the reset
  // (In production, you might archive this)

  saveData(data);

  return {
    success: true,
    affectedStudents: affectedStudents,
    message: `Reset strikes for ${affectedStudents} students`
  };
};

/**
 * Get notification data for email/notification
 */
export const getStrikeNotificationData = async (studentId, userFullName, userEmail) => {
  const data = getData();
  const userStrike = data.userStrikes[studentId] || { strikeCount: 0, blacklistUntil: null };

  let message = '';
  if (userStrike.strikeCount === 1) {
    message = 'This is your first warning. Please return equipment on time to avoid restrictions.';
  } else if (userStrike.strikeCount === 2) {
    message = `This is your second strike. Your account is restricted until ${new Date(userStrike.blacklistUntil).toLocaleDateString()}. Future late returns may result in longer restrictions.`;
  } else if (userStrike.strikeCount >= 3) {
    message = `This is your third strike. Your account is restricted until ${new Date(userStrike.blacklistUntil).toLocaleDateString()}. Please contact admin to discuss reinstatement.`;
  }

  return {
    studentEmail: userEmail,
    studentName: userFullName,
    strikeCount: userStrike.strikeCount,
    blacklistUntil: userStrike.blacklistUntil,
    message: message
  };
};

/**
 * Get all students with strikes (admin view)
 */
export const getStudentsWithStrikes = async (allUsers) => {
  const data = getData();

  return allUsers
    .filter(user => user.role === 'student')
    .map(user => {
      const userStrike = data.userStrikes[user.id] || { strikeCount: 0, blacklistUntil: null };
      const isRestricted = userStrike.blacklistUntil && new Date(userStrike.blacklistUntil) > new Date();

      let accountStatus = 'GOOD_STANDING';
      if (isRestricted) {
        accountStatus = 'RESTRICTED';
      } else if (userStrike.strikeCount >= 2) {
        accountStatus = 'WARNING';
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        surname: user.surname,
        fullName: user.full_name,
        department: user.department,
        strikeCount: userStrike.strikeCount,
        blacklistUntil: userStrike.blacklistUntil,
        accountStatus: accountStatus,
        totalStrikesIssued: data.strikeHistory.filter(s => s.studentId === user.id && !s.revokedAt).length,
        lastStrikeDate: data.strikeHistory
          .filter(s => s.studentId === user.id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.createdAt || null
      };
    });
};

/**
 * Get strike history for a student
 */
export const getStrikeHistory = async (studentId, includeRevoked = false, allUsers = []) => {
  const data = getData();

  let history = data.strikeHistory.filter(s => s.studentId === studentId);

  if (!includeRevoked) {
    history = history.filter(s => !s.revokedAt);
  }

  // Enrich with user names if available
  return history.map(strike => {
    const issuedByUser = allUsers.find(u => u.id === strike.issuedBy);
    const revokedByUser = allUsers.find(u => u.id === strike.revokedBy);

    return {
      ...strike,
      issuedByUser: issuedByUser ? { fullName: issuedByUser.full_name } : null,
      revokedByUser: revokedByUser ? { fullName: revokedByUser.full_name } : null
    };
  });
};

/**
 * Simulate automatic strike on late return
 */
export const checkLateReturn = async (booking) => {
  const today = new Date();
  const endDate = new Date(booking.end_date);

  const daysOverdue = Math.floor((today - endDate) / (1000 * 60 * 60 * 24));

  if (daysOverdue > 0) {
    const result = await issueStrike(
      booking.student_id,
      booking.id,
      daysOverdue,
      null // null = automatic
    );
    return {
      strikeIssued: true,
      ...result
    };
  }

  return {
    strikeIssued: false
  };
};

/**
 * Reset demo data to initial state
 */
export const resetDemoData = () => {
  localStorage.removeItem(STORAGE_KEY);
  initializeDemoData();
};

export default {
  canStudentBook,
  getStrikeStatus,
  issueStrike,
  revokeStrike,
  resetAllStrikes,
  getStrikeNotificationData,
  getStudentsWithStrikes,
  getStrikeHistory,
  checkLateReturn,
  resetDemoData
};
