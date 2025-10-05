import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import '../../styles/student-strikes.css';

export default function StudentStrikes() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      const { data, error } = await supabase
        .from('student_strike_summary')
        .select('*')
        .order('strike_count', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load strike history for selected student
  const loadStrikeHistory = async (studentId) => {
    try {
      const { data, error } = await supabase
        .from('strike_history')
        .select(`
          *,
          booking:bookings(id, equipment_ids, start_date, end_date),
          issued_by_user:users!strike_history_issued_by_fkey(full_name),
          revoked_by_user:users!strike_history_revoked_by_fkey(full_name)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStrikeHistory(data || []);
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
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase.rpc('revoke_strike', {
        p_strike_id: revokeStrikeId,
        p_admin_id: userData.user.id,
        p_reason: revokeReason
      });

      if (error) throw error;

      if (data.success) {
        alert('Strike revoked successfully');
        setShowRevokeModal(false);
        setRevokeStrikeId(null);
        setRevokeReason('');
        loadStudents();
        if (selectedStudent) {
          loadStrikeHistory(selectedStudent.id);
        }
      } else {
        alert(data.error || 'Failed to revoke strike');
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
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase.rpc('reset_all_strikes', {
        p_admin_id: userData.user.id,
        p_reason: reason
      });

      if (error) throw error;

      if (data.success) {
        alert(data.message);
        loadStudents();
        setSelectedStudent(null);
        setStrikeHistory([]);
      }
    } catch (err) {
      alert('Error resetting strikes: ' + err.message);
    }
  };

  // Filter students by status
  const filteredStudents = students.filter(student => {
    if (filterStatus === 'ALL') return true;
    return student.account_status === filterStatus;
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
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="student-strikes-container">
      <div className="strikes-header">
        <h2>Student Strikes Management</h2>
        <button onClick={handleResetAllStrikes} className="btn-danger">
          Reset All Strikes (New Semester)
        </button>
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
          Restricted ({students.filter(s => s.account_status === 'RESTRICTED').length})
        </button>
        <button
          className={filterStatus === 'WARNING' ? 'active' : ''}
          onClick={() => setFilterStatus('WARNING')}
        >
          Warning ({students.filter(s => s.account_status === 'WARNING').length})
        </button>
        <button
          className={filterStatus === 'GOOD_STANDING' ? 'active' : ''}
          onClick={() => setFilterStatus('GOOD_STANDING')}
        >
          Good Standing ({students.filter(s => s.account_status === 'GOOD_STANDING').length})
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
                  <strong>{student.full_name}</strong>
                  <span className="student-email">{student.email}</span>
                  <span className="student-dept">{student.department}</span>
                </div>
                <div className="student-strikes">
                  <span className={`status-badge ${getStatusColor(student.account_status)}`}>
                    {student.account_status.replace('_', ' ')}
                  </span>
                  <span className="strike-count">
                    {student.strike_count} {student.strike_count === 1 ? 'Strike' : 'Strikes'}
                  </span>
                  {student.blacklist_until && new Date(student.blacklist_until) > new Date() && (
                    <span className="restriction-date">
                      Until {new Date(student.blacklist_until).toLocaleDateString()}
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
              <h3>Strike History: {selectedStudent.full_name}</h3>
              <div className="student-summary">
                <div className="summary-item">
                  <label>Current Strikes:</label>
                  <span className="strike-number">{selectedStudent.strike_count}/3</span>
                </div>
                <div className="summary-item">
                  <label>Account Status:</label>
                  <span className={`status-badge ${getStatusColor(selectedStudent.account_status)}`}>
                    {selectedStudent.account_status.replace('_', ' ')}
                  </span>
                </div>
                {selectedStudent.blacklist_until && (
                  <div className="summary-item">
                    <label>Restricted Until:</label>
                    <span>{new Date(selectedStudent.blacklist_until).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="history-list">
                {strikeHistory.length === 0 ? (
                  <p className="no-history">No strike history found</p>
                ) : (
                  strikeHistory.map(strike => (
                    <div
                      key={strike.id}
                      className={`history-item ${strike.revoked_at ? 'revoked' : ''}`}
                    >
                      <div className="history-header">
                        <span className="strike-badge">Strike #{strike.strike_number}</span>
                        <span className="history-date">
                          {new Date(strike.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="history-details">
                        <p><strong>Reason:</strong> {strike.reason}</p>
                        <p><strong>Days Overdue:</strong> {strike.days_overdue}</p>
                        <p><strong>Restriction:</strong> {strike.restriction_days} days</p>
                        {strike.issued_by_user && (
                          <p><strong>Issued By:</strong> {strike.issued_by_user.full_name}</p>
                        )}
                        {!strike.issued_by && (
                          <p className="automatic-badge">AUTOMATIC</p>
                        )}
                      </div>

                      {strike.revoked_at ? (
                        <div className="revoked-info">
                          <p><strong>REVOKED</strong></p>
                          <p>By: {strike.revoked_by_user?.full_name}</p>
                          <p>Date: {new Date(strike.revoked_at).toLocaleDateString()}</p>
                          <p>Reason: {strike.revoke_reason}</p>
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
        <h3>3-Strike System Rules</h3>
        <ul>
          <li><strong>Strike 1:</strong> Warning only - student can still book equipment</li>
          <li><strong>Strike 2:</strong> 7-day booking restriction</li>
          <li><strong>Strike 3:</strong> 30-day booking restriction</li>
        </ul>
        <p className="info-note">
          Strikes are automatically issued when equipment is returned late.
          Admins can manually revoke strikes if issued in error or for special circumstances.
        </p>
        <p className="info-note">
          At the start of each semester, use "Reset All Strikes" to give students a fresh start.
        </p>
      </div>
    </div>
  );
}
