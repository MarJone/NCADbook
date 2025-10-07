import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../utils/api';
import { getDepartmentList } from '../../config/departments';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/common/Toast';

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    surname: '',
    role: 'student',
    department: 'Moving Image Design'
  });
  const { toasts, showToast, removeToast } = useToast();

  const departmentList = getDepartmentList();

  // Only master admin can access
  if (user.role !== 'master_admin') {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>Only Master Admins can manage users.</p>
      </div>
    );
  }

  useEffect(() => {
    loadUsers();
  }, [filterRole, filterDepartment]);

  useEffect(() => {
    // Apply search filter to users
    let filtered = users;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.full_name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [users, searchQuery]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterRole !== 'all') params.role = filterRole;
      if (filterDepartment !== 'all') params.department = filterDepartment;

      const response = await usersAPI.getAll(params);
      const userData = response.users || [];
      setUsers(userData);
    } catch (error) {
      console.error('Failed to load users:', error);
      showToast('Failed to load users', 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!formData.email || !formData.password || !formData.first_name || !formData.surname) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        surname: formData.surname,
        full_name: `${formData.first_name} ${formData.surname}`,
        role: formData.role,
        department: formData.department
      };

      await usersAPI.create(userData);
      setShowAddModal(false);
      setFormData({
        email: '',
        password: '',
        first_name: '',
        surname: '',
        role: 'student',
        department: 'Moving Image Design'
      });
      await loadUsers();
      showToast('User created successfully', 'success');
    } catch (error) {
      showToast('Failed to create user: ' + error.message, 'error');
    }
  };

  const handleEditUser = async () => {
    if (!formData.first_name || !formData.surname) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const updatedData = {
        first_name: formData.first_name,
        surname: formData.surname,
        full_name: `${formData.first_name} ${formData.surname}`,
        role: formData.role,
        department: formData.department
      };

      // Include password only if changed
      if (formData.password) {
        updatedData.password = formData.password;
      }

      await usersAPI.update(selectedUser.id, updatedData);
      setShowEditModal(false);
      setSelectedUser(null);
      await loadUsers();
      showToast('User updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update user: ' + error.message, 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await usersAPI.delete(userId);
      await loadUsers();
      showToast('User deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete user: ' + error.message, 'error');
    }
  };

  const openEditModal = (userToEdit) => {
    setSelectedUser(userToEdit);
    setFormData({
      email: userToEdit.email,
      password: '', // Don't pre-fill password
      first_name: userToEdit.first_name,
      surname: userToEdit.surname,
      role: userToEdit.role,
      department: userToEdit.department
    });
    setShowEditModal(true);
  };

  const roles = [
    { value: 'student', label: 'Student' },
    { value: 'staff', label: 'Staff' },
    { value: 'department_admin', label: 'Department Admin' },
    { value: 'master_admin', label: 'Master Admin' }
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Paginate filtered users
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="user-management">
      <h2>User Management</h2>
      <p className="subtitle">Manage user accounts, roles, and permissions</p>

      <SearchBar
        onSearch={handleSearch}
        placeholder="Search by name or email..."
        ariaLabel="Search users"
      />

      <div className="management-controls">
        <div className="filter-controls">

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="select-input"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="select-input"
          >
            <option value="all">All Departments</option>
            {departmentList.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            + Add User
          </button>
        </div>
      </div>

      {loading ? (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <LoadingSkeleton type="table-row" count={10} />
            </tbody>
          </table>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <p>No users found{searchQuery ? ' matching your search' : ''}</p>
        </div>
      ) : (
        <>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map(u => (
              <tr key={u.id}>
                <td>
                  <strong>{u.full_name}</strong>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`role-badge role-${u.role}`}>
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td>{u.department}</td>
                <td>{new Date(u.created_at).toLocaleDateString('en-IE')}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => openEditModal(u)}
                      className="btn btn-secondary btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id, u.full_name)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="first-name">First Name *</label>
                  <input
                    id="first-name"
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="surname">Surname *</label>
                  <input
                    id="surname"
                    type="text"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                    placeholder="user@ncad.ie"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Role *</label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="select-input"
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department *</label>
                  <select
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="select-input"
                  >
                    {departmentList.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="btn btn-primary"
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User - {selectedUser.full_name}</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="edit-first-name">First Name *</label>
                  <input
                    id="edit-first-name"
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-surname">Surname *</label>
                  <input
                    id="edit-surname"
                    type="text"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-email">Email</label>
                  <input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    className="form-input"
                    disabled
                    title="Email cannot be changed"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-password">Password</label>
                  <input
                    id="edit-password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="form-input"
                    placeholder="Leave blank to keep current"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-role">Role *</label>
                  <select
                    id="edit-role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="select-input"
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-department">Department *</label>
                  <select
                    id="edit-department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="select-input"
                  >
                    {departmentList.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditUser}
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
