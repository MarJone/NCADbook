import { useState, useEffect } from 'react';
import { equipmentAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { getDepartmentList } from '../../config/departments';
import EquipmentNotes from '../../components/equipment/EquipmentNotes';
import EquipmentForm from '../../components/admin/EquipmentForm';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/common/Toast';

export default function EquipmentManagement() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  const itemsPerPage = 20;
  const { toasts, showToast, removeToast } = useToast();

  const departmentList = getDepartmentList();
  const isMasterAdmin = user?.role === 'master_admin';

  useEffect(() => {
    loadEquipment();
  }, [filter]);

  useEffect(() => {
    // Apply search filter to equipment
    let filtered = equipment;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.product_name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tracking_number.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    setFilteredEquipment(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [equipment, searchQuery]);

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }

      // Department admins see only their department equipment
      if (user?.role === 'department_admin') {
        params.department = user.department;
      }

      const response = await equipmentAPI.getAll(params);
      const data = response.equipment || [];
      setEquipment(data);
    } catch (error) {
      console.error('Failed to load equipment:', error);
      showToast('Failed to load equipment', 'error');
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (equipmentId, newStatus) => {
    try {
      await equipmentAPI.update(equipmentId, { status: newStatus });
      await loadEquipment();
      showToast('Equipment status updated', 'success');
    } catch (error) {
      showToast('Failed to update status: ' + error.message, 'error');
    }
  };

  const handleDepartmentChange = async (equipmentId, newDepartment) => {
    if (!isMasterAdmin) {
      showToast('Only Master Admin can change equipment department', 'error');
      return;
    }

    try {
      await equipmentAPI.update(equipmentId, { department: newDepartment });
      await loadEquipment();
      showToast('Equipment department updated', 'success');
    } catch (error) {
      showToast('Failed to update department: ' + error.message, 'error');
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddEquipment = () => {
    setSelectedEquipment(null);
    setFormMode('add');
    setShowFormModal(true);
  };

  const handleEditEquipment = (item) => {
    setSelectedEquipment(item);
    setFormMode('edit');
    setShowFormModal(true);
  };

  const handleDeleteClick = (item) => {
    setEquipmentToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!equipmentToDelete) return;

    try {
      await equipmentAPI.delete(equipmentToDelete.id);
      setShowDeleteConfirm(false);
      setEquipmentToDelete(null);
      await loadEquipment();
      showToast('Equipment deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete equipment: ' + error.message, 'error');
    }
  };

  const handleFormSuccess = async () => {
    setShowFormModal(false);
    await loadEquipment();
    showToast(formMode === 'add' ? 'Equipment added successfully' : 'Equipment updated successfully', 'success');
  };

  // Paginate filtered equipment
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEquipment = filteredEquipment.slice(startIndex, endIndex);

  return (
    <div className="equipment-management">
      <h2>Equipment Management</h2>
      <p className="subtitle">Manage equipment inventory and status</p>

      <SearchBar
        onSearch={handleSearch}
        placeholder="Search by name, tracking number, or category..."
        ariaLabel="Search equipment"
      />

      <div className="management-controls">
        <div className="filter-controls">
          {['all', 'available', 'booked', 'maintenance'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={filter === status ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={handleAddEquipment}
          className="btn btn-primary"
        >
          + Add Equipment
        </button>
      </div>

      {loading ? (
        <div className="equipment-table">
          <table>
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Category</th>
                <th>Tracking #</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <LoadingSkeleton type="table-row" count={10} />
            </tbody>
          </table>
        </div>
      ) : filteredEquipment.length === 0 ? (
        <div className="empty-state">
          <p>No equipment found{searchQuery ? ' matching your search' : ''}</p>
        </div>
      ) : (
        <>
          <div className="equipment-table">
            <table>
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Category</th>
                  <th>Tracking #</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEquipment.map(item => (
              <tr key={item.id}>
                <td>
                  <strong>{item.product_name}</strong>
                  <br />
                  <small>{item.description}</small>
                </td>
                <td>{item.category}</td>
                <td className="tracking-number">{item.tracking_number}</td>
                <td>
                  {isMasterAdmin ? (
                    <select
                      value={item.department}
                      onChange={(e) => handleDepartmentChange(item.id, e.target.value)}
                      className="department-select"
                    >
                      {departmentList.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span>{item.department}</span>
                  )}
                </td>
                <td>
                  <div className="status-cell">
                    <span className={`availability-badge availability-${item.status}`}>
                      {item.status === 'available' && <span className="badge-icon">✓</span>}
                      {item.status === 'booked' && <span className="badge-icon">●</span>}
                      {item.status === 'maintenance' && <span className="badge-icon">🔧</span>}
                      {item.status === 'out_of_service' && <span className="badge-icon">✕</span>}
                      <span className="badge-text">
                        {item.status === 'available' ? 'Available' :
                         item.status === 'booked' ? 'Booked' :
                         item.status === 'maintenance' ? 'Maintenance' :
                         'Out of Service'}
                      </span>
                    </span>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="status-select-compact"
                      title="Change status"
                    >
                      <option value="available">Available</option>
                      <option value="booked">Booked</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="out_of_service">Out of Service</option>
                    </select>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        setSelectedEquipment(item);
                        setShowDetailModal(true);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditEquipment(item)}
                      className="btn btn-primary btn-sm"
                    >
                      Edit
                    </button>
                    {isMasterAdmin && (
                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredEquipment.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </>
      )}

      {showDetailModal && selectedEquipment && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content equipment-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEquipment.product_name}</h2>
              <button
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="equipment-detail-info">
                <div className="detail-row">
                  <span className="detail-label">Tracking Number:</span>
                  <span className="detail-value tracking-number">{selectedEquipment.tracking_number}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{selectedEquipment.category}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Department:</span>
                  <span className="detail-value">{selectedEquipment.department}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`status status-${selectedEquipment.status}`}>
                    {selectedEquipment.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{selectedEquipment.description}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Requires Justification:</span>
                  <span className="detail-value">{selectedEquipment.requires_justification ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <EquipmentNotes
                equipmentId={selectedEquipment.id}
                equipmentName={selectedEquipment.product_name}
              />
            </div>
          </div>
        </div>
      )}

      {showFormModal && (
        <EquipmentForm
          equipment={selectedEquipment}
          onClose={() => setShowFormModal(false)}
          onSuccess={handleFormSuccess}
          mode={formMode}
        />
      )}

      {showDeleteConfirm && equipmentToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{equipmentToDelete.product_name}</strong>?</p>
              <p style={{ color: '#c00', marginTop: '1rem' }}>⚠️ This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn btn-danger"
              >
                Delete Equipment
              </button>
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
