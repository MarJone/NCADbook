import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { demoMode } from '../../mocks/demo-mode';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

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
    department: 'Moving Image'
  });

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
      let filters = {};
      if (filterRole !== 'all') filters.role = filterRole;
      if (filterDepartment !== 'all') filters.department = filterDepartment;

      let data = await demoMode.query('users', filters);
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!formData.email || !formData.password || !formData.first_name || !formData.surname) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const newUser = {
        id: Date.now().toString(),
        ...formData,
        full_name: `${formData.first_name} ${formData.surname}`,
        created_at: new Date().toISOString().split('T')[0]
      };

      await demoMode.insert('users', newUser);
      setShowAddModal(false);
      setFormData({
        email: '',
        password: '',
        first_name: '',
        surname: '',
        role: 'student',
        department: 'Moving Image'
      });
      loadUsers();
      alert('User created successfully');
    } catch (error) {
      alert('Failed to create user: ' + error.message);
    }
  };

  const handleEditUser = async () => {
    if (!formData.first_name || !formData.surname) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const updatedData = {
        ...formData,
        full_name: `${formData.first_name} ${formData.surname}`
      };

      await demoMode.update('users', { id: selectedUser.id }, updatedData);
      setShowEditModal(false);
      setSelectedUser(null);
      loadUsers();
      alert('User updated successfully');
    } catch (error) {
      alert('Failed to update user: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    // Prevent deleting test accounts
    if (['1', '2', '3', '4'].includes(userId)) {
      alert('Cannot delete demo test accounts');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await demoMode.delete('users', { id: userId });
      loadUsers();
      alert('User deleted successfully');
    } catch (error) {
      alert('Failed to delete user: ' + error.message);
    }
  };

  const openEditModal = (userToEdit) => {
    setSelectedUser(userToEdit);
    setFormData({
      email: userToEdit.email,
      password: userToEdit.password,
      first_name: userToEdit.first_name,
      surname: userToEdit.surname,
      role: userToEdit.role,
      department: userToEdit.department
    });
    setShowEditModal(true);
  };

  const departments = ['Moving Image', 'Graphic Design', 'Illustration', 'Administration'];
  const roles = [
    { value: 'student', label: 'Student' },
    { value: 'staff', label: 'Staff' },
    { value: 'admin', label: 'Admin' },
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
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
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
                      disabled={['1', '2', '3', '4'].includes(u.id)}
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
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
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
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
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
    </div>
  );
}
