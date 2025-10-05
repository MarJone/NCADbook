import React, { useState, useEffect } from 'react';
import { phase8Users } from '../../mocks/demo-data-phase8';
import * as demoStrikeService from '../../services/demo-strike.service';
import '../../styles/student-strikes.css';

export default function StudentStrikesDemo() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [strikeHistory, setStrikeHistory] = useState([]);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeStrikeId, setRevokeStrikeId] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');

  // Load student strike summary
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const studentsWithStrikes = await demoStrikeService.getStudentsWithStrikes(phase8Users);
      setStudents(studentsWithStrikes);
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load strike history for selected student
  const loadStrikeHistory = async (studentId) => {
    try {
      const history = await demoStrikeService.getStrikeHistory(studentId, true, phase8Users);
      setStrikeHistory(history);
    } catch (err) {
      console.error('Error loading strike history:', err);
    }
  };

  // Revoke strike
  const handleRevokeStrike = async () => {
    if (!revokeStrikeId || !revokeReason.trim()) {
      alert('Please provide a reason for revoking the strike');
      return;
    }

    try {
      const result = await demoStrikeService.revokeStrike(
        revokeStrikeId,
        '1', // Master admin ID
        revokeReason
      );

      if (result.success) {
        alert('Strike revoked successfully');
        setShowRevokeModal(false);
        setRevokeStrikeId(null);
        setRevokeReason('');
        loadStudents();
        if (selectedStudent) {
          loadStrikeHistory(selectedStudent.id);
        }
      } else {
        alert(result.error || 'Failed to revoke strike');
      }
    } catch (err) {
      alert('Error revoking strike: ' + err.message);
    }
  };

  // Reset all strikes (start of new semester)
  const handleResetAllStrikes = async () => {
    const confirm = window.confirm(
      'Are you sure you want to reset ALL student strikes? This action cannot be undone.\n\n' +
      'This is typically done at the start of a new semester.'
    );

    if (!confirm) return;

    const reason = prompt('Enter reason for reset (e.g., "New semester - Fall 2024"):');
    if (!reason) return;

    try {
      const result = await demoStrikeService.resetAllStrikes('1', reason);

      if (result.success) {
        alert(result.message);
        loadStudents();
        setSelectedStudent(null);
        setStrikeHistory([]);
      }
    } catch (err) {
      alert('Error resetting strikes: ' + err.message);
    }
  };

  // Issue manual strike (demo feature)
  const handleIssueManualStrike = async (studentId) => {
    const days = prompt('Enter number of days overdue:');
    if (!days || isNaN(days)) return;

    try {
      const result = await demoStrikeService.issueStrike(
        studentId,
        `manual-booking-${Date.now()}`,
        parseInt(days),
        '1' // Master admin ID
      );

      if (result.success) {
        alert(`Strike issued successfully. New strike count: ${result.newStrikeCount}/3`);
        loadStudents();
        if (selectedStudent?.id === studentId) {
          loadStrikeHistory(studentId);
        }
      }
    } catch (err) {
      alert('Error issuing strike: ' + err.message);
    }
  };

  // Filter students by status
  const filteredStudents = students.filter(student => {
    if (filterStatus === 'ALL') return true;
    return student.accountStatus === filterStatus;
  });

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'RESTRICTED': return 'red';
      case 'WARNING': return 'orange';
      case 'GOOD_STANDING': return 'green';
      default: return 'gray';
    }
  };

  if (loading) return <div className="loading">Loading student strikes...</div>;

  return (
    <div className="student-strikes-container">
      <div className="strikes-header">
        <h2>Student Strikes Management (Demo Mode)</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => demoStrikeService.resetDemoData()} className="btn-secondary">
            Reset Demo Data
          </button>
          <button onClick={handleResetAllStrikes} className="btn-danger">
            Reset All Strikes (New Semester)
          </button>
        </div>
      </div>

      <div className="strikes-filters">
        <button
          className={filterStatus === 'ALL' ? 'active' : ''}
          onClick={() => setFilterStatus('ALL')}
        >
          All ({students.length})
        </button>
        <button
          className={filterStatus === 'RESTRICTED' ? 'active' : ''}
          onClick={() => setFilterStatus('RESTRICTED')}
        >
          Restricted ({students.filter(s => s.accountStatus === 'RESTRICTED').length})
        </button>
        <button
          className={filterStatus === 'WARNING' ? 'active' : ''}
          onClick={() => setFilterStatus('WARNING')}
        >
          Warning ({students.filter(s => s.accountStatus === 'WARNING').length})
        </button>
        <button
          className={filterStatus === 'GOOD_STANDING' ? 'active' : ''}
          onClick={() => setFilterStatus('GOOD_STANDING')}
        >
          Good Standing ({students.filter(s => s.accountStatus === 'GOOD_STANDING').length})
        </button>
      </div>

      <div className="strikes-layout">
        {/* Student List */}
        <div className="students-list">
          <h3>Students ({filteredStudents.length})</h3>
          <div className="students-table">
            {filteredStudents.map(student => (
              <div
                key={student.id}
                className={`student-row ${selectedStudent?.id === student.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedStudent(student);
                  loadStrikeHistory(student.id);
                }}
              >
                <div className="student-info">
                  <strong>{student.fullName}</strong>
                  <span className="student-email">{student.email}</span>
                  <span className="student-dept">{student.department}</span>
                </div>
                <div className="student-strikes">
                  <span className={`status-badge ${getStatusColor(student.accountStatus)}`}>
                    {student.accountStatus.replace('_', ' ')}
                  </span>
                  <span className="strike-count">
                    {student.strikeCount} {student.strikeCount === 1 ? 'Strike' : 'Strikes'}
                  </span>
                  {student.blacklistUntil && new Date(student.blacklistUntil) > new Date() && (
                    <span className="restriction-date">
                      Until {new Date(student.blacklistUntil).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strike History Panel */}
        <div className="strike-history-panel">
          {selectedStudent ? (
            <>
              <h3>Strike History: {selectedStudent.fullName}</h3>
              <div className="student-summary">
                <div className="summary-item">
                  <label>Current Strikes:</label>
                  <span className="strike-number">{selectedStudent.strikeCount}/3</span>
                </div>
                <div className="summary-item">
                  <label>Account Status:</label>
                  <span className={`status-badge ${getStatusColor(selectedStudent.accountStatus)}`}>
                    {selectedStudent.accountStatus.replace('_', ' ')}
                  </span>
                </div>
                {selectedStudent.blacklistUntil && (
                  <div className="summary-item">
                    <label>Restricted Until:</label>
                    <span>{new Date(selectedStudent.blacklistUntil).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleIssueManualStrike(selectedStudent.id)}
                className="btn-primary"
                style={{ width: '100%', marginBottom: '15px' }}
              >
                Issue Manual Strike (Demo)
              </button>

              <div className="history-list">
                {strikeHistory.length === 0 ? (
                  <p className="no-history">No strike history found</p>
                ) : (
                  strikeHistory.map(strike => (
                    <div
                      key={strike.id}
                      className={`history-item ${strike.revokedAt ? 'revoked' : ''}`}
                    >
                      <div className="history-header">
                        <span className="strike-badge">Strike #{strike.strikeNumber}</span>
                        <span className="history-date">
                          {new Date(strike.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="history-details">
                        <p><strong>Reason:</strong> {strike.reason}</p>
                        <p><strong>Days Overdue:</strong> {strike.daysOverdue}</p>
                        <p><strong>Restriction:</strong> {strike.restrictionDays} days</p>
                        {strike.issuedByUser && (
                          <p><strong>Issued By:</strong> {strike.issuedByUser.fullName}</p>
                        )}
                        {!strike.issuedBy && (
                          <p className="automatic-badge">AUTOMATIC</p>
                        )}
                      </div>

                      {strike.revokedAt ? (
                        <div className="revoked-info">
                          <p><strong>REVOKED</strong></p>
                          <p>By: {strike.revokedByUser?.fullName || 'Admin'}</p>
                          <p>Date: {new Date(strike.revokedAt).toLocaleDateString()}</p>
                          <p>Reason: {strike.revokeReason}</p>
                        </div>
                      ) : (
                        <button
                          className="btn-revoke"
                          onClick={() => {
                            setRevokeStrikeId(strike.id);
                            setShowRevokeModal(true);
                          }}
                        >
                          Revoke Strike
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>Select a student to view strike history</p>
            </div>
          )}
        </div>
      </div>

      {/* Revoke Strike Modal */}
      {showRevokeModal && (
        <div className="modal-overlay" onClick={() => setShowRevokeModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Revoke Strike</h3>
            <p>Provide a reason for revoking this strike:</p>
            <textarea
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="e.g., Equipment was returned on time, strike issued in error"
              rows="4"
            />
            <div className="modal-actions">
              <button onClick={handleRevokeStrike} className="btn-primary">
                Revoke Strike
              </button>
              <button
                onClick={() => {
                  setShowRevokeModal(false);
                  setRevokeStrikeId(null);
                  setRevokeReason('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="strikes-info-panel">
        <h3>3-Strike System Rules (Demo Mode)</h3>
        <ul>
          <li><strong>Strike 1:</strong> Warning only - student can still book equipment</li>
          <li><strong>Strike 2:</strong> 7-day booking restriction</li>
          <li><strong>Strike 3:</strong> 30-day booking restriction</li>
        </ul>
        <p className="info-note">
          <strong>Demo Features:</strong>
        </p>
        <ul>
          <li>Uses localStorage for persistence (no database required)</li>
          <li>Pre-populated with 3 sample students having strikes</li>
          <li>Click "Issue Manual Strike" to add strikes to any student</li>
          <li>Click "Reset Demo Data" to restore initial state</li>
          <li>All admin functions are fully functional</li>
        </ul>
        <p className="info-note">
          Strikes are automatically issued when equipment is returned late.
          Admins can manually revoke strikes if issued in error or for special circumstances.
        </p>
      </div>
    </div>
  );
}
