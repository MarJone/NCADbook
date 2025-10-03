import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';
import EquipmentNotes from '../../components/equipment/EquipmentNotes';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export default function EquipmentManagement() {
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
      const filters = filter === 'all' ? {} : { status: filter };
      const data = await demoMode.query('equipment', filters);
      setEquipment(data);
    } catch (error) {
      console.error('Failed to load equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (equipmentId, newStatus) => {
    try {
      await demoMode.update('equipment', { id: equipmentId }, { status: newStatus });
      await loadEquipment();
      alert('Equipment status updated');
    } catch (error) {
      alert('Failed to update status: ' + error.message);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                <td>{item.department}</td>
                <td>
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="out_of_service">Out of Service</option>
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedEquipment(item);
                      setShowDetailModal(true);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    View Details
                  </button>
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
    </div>
  );
}
