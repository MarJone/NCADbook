import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';
import { useAuth } from '../../hooks/useAuth';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';

export default function StudentAssignment() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [subAreas, setSubAreas] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedSubArea, setSelectedSubArea] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const { toasts, showToast, removeToast } = useToast();

  // Check if user is admin or master admin
  const isAdmin = user?.role === 'master_admin' || user?.role === 'admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load students
      const studentsData = await demoMode.query('users', { role: 'student' });
      setStudents(studentsData || []);

      // Load sub-areas
      const subAreasData = await demoMode.query('sub_areas') || [];
      setSubAreas(subAreasData);

      // Load existing assignments
      const assignmentsData = await demoMode.query('user_sub_areas') || [];
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStudentAssignments = (studentId) => {
    return assignments
      .filter(a => a.user_id === studentId)
      .map(a => subAreas.find(sa => sa.id === a.sub_area_id))
      .filter(Boolean);
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    const filtered = getFilteredStudents();
    if (selectedStudents.length === filtered.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filtered.map(s => s.id));
    }
  };

  const handleBulkAssign = async () => {
    if (selectedStudents.length === 0) {
      showToast('Please select at least one student', 'error');
      return;
    }

    if (!selectedSubArea) {
      showToast('Please select a sub-area', 'error');
      return;
    }

    try {
      // Create assignments for all selected students
      const newAssignments = selectedStudents.map(studentId => ({
        user_id: studentId,
        sub_area_id: selectedSubArea,
        assigned_by: user.id,
        assigned_at: new Date().toISOString()
      }));

      // Insert all assignments
      for (const assignment of newAssignments) {
        // Check if already assigned
        const existingAssignment = assignments.find(
          a => a.user_id === assignment.user_id && a.sub_area_id === assignment.sub_area_id
        );

        if (!existingAssignment) {
          await demoMode.insert('user_sub_areas', assignment);
        }
      }

      showToast(`Successfully assigned ${selectedStudents.length} student(s) to sub-area`, 'success');
      setSelectedStudents([]);
      setSelectedSubArea('');
      await loadData();
    } catch (error) {
      showToast('Failed to assign students: ' + error.message, 'error');
    }
  };

  const handleRemoveAssignment = async (studentId, subAreaId) => {
    if (!confirm('Remove this sub-area assignment?')) {
      return;
    }

    try {
      const assignment = assignments.find(
        a => a.user_id === studentId && a.sub_area_id === subAreaId
      );

      if (assignment) {
        await demoMode.delete('user_sub_areas', assignment.id);
        showToast('Assignment removed successfully', 'success');
        await loadData();
      }
    } catch (error) {
      showToast('Failed to remove assignment: ' + error.message, 'error');
    }
  };

  const getFilteredStudents = () => {
    return students.filter(student => {
      const matchesSearch = !searchTerm ||
        student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = filterDepartment === 'all' ||
        student.department === filterDepartment;

      return matchesSearch && matchesDepartment;
    });
  };

  if (!isAdmin) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>Only administrators can manage student assignments.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  const filteredStudents = getFilteredStudents();
  const departments = [...new Set(students.map(s => s.department).filter(Boolean))];

  return (
    <div className="student-assignment">
      <h2>Student Sub-Area Assignment</h2>
      <p className="subtitle">Assign students to sub-areas for equipment access</p>

      {/* Bulk Assignment Section */}
      <div className="dashboard-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h3>Bulk Assignment</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
          Select students below and assign them to a sub-area
        </p>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1', minWidth: '250px', marginBottom: 0 }}>
            <label htmlFor="bulk-sub-area">Sub-Area</label>
            <select
              id="bulk-sub-area"
              className="form-select"
              value={selectedSubArea}
              onChange={(e) => setSelectedSubArea(e.target.value)}
              data-testid="bulk-sub-area-select"
            >
              <option value="">-- Select Sub-Area --</option>
              {subAreas.map(subArea => (
                <option key={subArea.id} value={subArea.id}>
                  {subArea.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleBulkAssign}
            className="btn btn-primary"
            disabled={selectedStudents.length === 0 || !selectedSubArea}
            data-testid="bulk-assign-btn"
            style={{ marginTop: 'var(--spacing-lg)' }}
          >
            Assign Selected ({selectedStudents.length})
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="management-controls" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="filter-controls">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="student-search-input"
          />
          <select
            className="form-select"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            data-testid="department-filter-select"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <button
            onClick={handleSelectAll}
            className="btn btn-secondary"
            data-testid="select-all-btn"
          >
            {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="stat-card stat-info">
          <div className="stat-content">
            <h3>{filteredStudents.length}</h3>
            <p>Students Found</p>
          </div>
        </div>
        <div className="stat-card stat-primary">
          <div className="stat-content">
            <h3>{selectedStudents.length}</h3>
            <p>Selected</p>
          </div>
        </div>
        <div className="stat-card stat-secondary">
          <div className="stat-content">
            <h3>{assignments.length}</h3>
            <p>Total Assignments</p>
          </div>
        </div>
      </div>

      {/* Students Table */}
      {filteredStudents.length === 0 ? (
        <div className="empty-state">
          <h2>No Students Found</h2>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === filteredStudents.length}
                    onChange={handleSelectAll}
                    data-testid="select-all-checkbox"
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Current Sub-Areas</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const studentAssignments = getStudentAssignments(student.id);
                return (
                  <tr key={student.id} data-testid="student-row">
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        data-testid={`student-checkbox-${student.id}`}
                      />
                    </td>
                    <td style={{ fontWeight: '600' }}>{student.full_name}</td>
                    <td>{student.email}</td>
                    <td>{student.department || '-'}</td>
                    <td>
                      {studentAssignments.length === 0 ? (
                        <span style={{ color: 'var(--text-muted)' }}>Not assigned</span>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {studentAssignments.map(subArea => (
                            <span
                              key={subArea.id}
                              className="role-badge"
                              style={{
                                background: 'var(--color-info-pale)',
                                color: 'var(--color-info)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              {subArea.name}
                              <button
                                onClick={() => handleRemoveAssignment(student.id, subArea.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--color-error)',
                                  cursor: 'pointer',
                                  padding: '0 0.25rem',
                                  fontSize: '1rem',
                                  fontWeight: 'bold'
                                }}
                                title="Remove assignment"
                                data-testid={`remove-assignment-${student.id}-${subArea.id}`}
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedStudents([student.id]);
                        }}
                        className="btn btn-sm btn-secondary"
                        data-testid={`assign-btn-${student.id}`}
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="users-stats">
        Showing {filteredStudents.length} of {students.length} students
      </div>

      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
