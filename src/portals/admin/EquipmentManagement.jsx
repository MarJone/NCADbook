import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';

export default function EquipmentManagement() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  useEffect(() => {
    loadEquipment();
  }, [filter]);

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

  if (loading) {
    return <div className="loading">Loading equipment...</div>;
  }

  return (
    <div className="equipment-management">
      <h2>Equipment Management</h2>
      <p className="subtitle">Manage equipment inventory and status</p>

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
            {equipment.map(item => (
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
                  <button className="btn btn-secondary btn-sm">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="equipment-stats">
        <p>Showing {equipment.length} equipment item(s)</p>
      </div>
    </div>
  );
}
