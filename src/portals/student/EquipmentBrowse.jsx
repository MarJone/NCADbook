import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';
import BookingModal from '../../components/booking/BookingModal';
import MultiItemBookingModal from '../../components/booking/MultiItemBookingModal';
import EquipmentDetails from '../../components/equipment/EquipmentDetails';
import EquipmentImage from '../../components/equipment/EquipmentImage';
import Toast from '../../components/common/Toast';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import AvailabilityFilter from '../../components/equipment/AvailabilityFilter';
import PullToRefresh from '../../components/common/PullToRefresh';
import KitBrowser from '../../components/equipment/KitBrowser';
import { useToast } from '../../hooks/useToast';
import { getAccessibleEquipment, getAllSubAreas } from '../../services/subArea.service';
import { useAuth } from '../../contexts/AuthContext';
import { isCrossDepartmentBrowsingEnabled, areEquipmentKitsEnabled } from '../../services/systemSettings.service';
import { getDepartmentsBySchool, SCHOOLS } from '../../config/departments';

export default function EquipmentBrowse() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('large'); // Default to large view for equipment cards
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showMultiModal, setShowMultiModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [subAreas, setSubAreas] = useState([]);
  const [subAreaFilter, setSubAreaFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [availabilityFilter, setAvailabilityFilter] = useState({ type: 'all' });
  const { toasts, showToast, removeToast } = useToast();
  const [crossDeptBrowsingEnabled, setCrossDeptBrowsingEnabled] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('my_department'); // 'my_department' or department ID
  const [kitsEnabled, setKitsEnabled] = useState(false);

  // Check if user has permission to view catalog (for staff only)
  const canViewCatalog = () => {
    if (!user) return false;
    // Students and admins always have access
    if (user.role === 'student' || user.role === 'department_admin' || user.role === 'master_admin') return true;
    // Staff users need view_permissions
    if (user.role === 'staff') {
      return user.view_permissions?.can_view_catalog !== false;
    }
    return true;
  };

  useEffect(() => {
    checkCrossDeptBrowsing();
  }, []);

  useEffect(() => {
    loadEquipment();
    loadSubAreas();
  }, [filter, subAreaFilter, selectedDepartment]);

  const checkCrossDeptBrowsing = async () => {
    try {
      const browsing = await isCrossDepartmentBrowsingEnabled();
      setCrossDeptBrowsingEnabled(browsing);

      const kits = await areEquipmentKitsEnabled();
      setKitsEnabled(kits);
    } catch (error) {
      console.error('Failed to check system settings:', error);
    }
  };

  useEffect(() => {
    // Apply search and availability filters to equipment
    let filtered = equipment;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.product_name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    // Apply availability filter
    if (availabilityFilter.type === 'available') {
      filtered = filtered.filter(item => item.status === 'available');
    } else if (availabilityFilter.type === 'custom' && availabilityFilter.date) {
      // Check if equipment is available on the custom date
      filtered = filtered.filter(async item => {
        const bookings = await demoMode.query('bookings', { equipment_id: item.id });
        const isBooked = bookings.some(booking => {
          const start = new Date(booking.start_date);
          const end = new Date(booking.end_date);
          const checkDate = new Date(availabilityFilter.date);
          return checkDate >= start && checkDate <= end && booking.status === 'approved';
        });
        return !isBooked;
      });
    }

    setFilteredEquipment(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [equipment, searchQuery, availabilityFilter]);

  const loadSubAreas = async () => {
    try {
      const areas = await getAllSubAreas();
      setSubAreas(areas);
    } catch (error) {
      console.error('Failed to load sub-areas:', error);
    }
  };

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const currentUser = demoMode.getCurrentUser();

      // If user is student, show their department equipment + any cross-department granted equipment
      if (currentUser && currentUser.role === 'student') {
        const allEquipment = await demoMode.query('equipment');

        let filtered;

        // Check department filter selection
        if (selectedDepartment === 'my_department' || !crossDeptBrowsingEnabled) {
          // 1. Get equipment from student's own department ONLY
          filtered = allEquipment.filter(item => item.department === currentUser.department);
        } else if (selectedDepartment === 'all') {
          // Show ALL departments (if cross-dept browsing is enabled)
          filtered = [...allEquipment];
        } else {
          // Specific department selected
          filtered = allEquipment.filter(item => item.department === selectedDepartment);
        }

        // 2. Check for active cross-department access grants for this student's department
        const accessGrants = await demoMode.query('department_access_grants', {
          requesting_department_id: currentUser.department,
          status: 'active'
        });

        // 3. Add equipment from granted departments
        const today = new Date();
        for (const grant of accessGrants) {
          const grantStart = new Date(grant.start_date);
          const grantEnd = new Date(grant.end_date);

          // Check if grant is currently valid (within date range)
          if (today >= grantStart && today <= grantEnd) {
            // Find matching equipment from the lending department
            const grantedEquipment = allEquipment.filter(item =>
              item.department === grant.lending_department_id &&
              item.product_name === grant.equipment_type
            );

            // Limit to quantity_available and mark as cross-department
            const limitedGrantedEquip = grantedEquipment.slice(0, grant.quantity_available).map(item => ({
              ...item,
              isCrossDepartment: true,
              crossDeptGrantId: grant.id,
              collectionInstructions: grant.collection_instructions,
              crossDeptTerms: grant.terms,
              lendingDepartment: grant.lending_department_id
            }));

            filtered = filtered.concat(limitedGrantedEquip);
          }
        }

        // Apply category filter
        if (filter !== 'all') {
          filtered = filtered.filter(item => item.category === filter);
        }

        // Apply sub-area filter
        if (subAreaFilter !== 'all') {
          filtered = filtered.filter(item => item.sub_area_id === subAreaFilter);
        }

        setEquipment(filtered);
      } else {
        // Admin/staff see all equipment
        const filters = filter === 'all' ? {} : { category: filter };
        let data = await demoMode.query('equipment', filters);

        // Apply sub-area filter for admins/staff too
        if (subAreaFilter !== 'all') {
          data = data.filter(item => item.sub_area_id === subAreaFilter);
        }

        setEquipment(data);
      }
    } catch (error) {
      console.error('Failed to load equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubAreaName = (subAreaId) => {
    const subArea = subAreas.find(sa => sa.id === subAreaId);
    return subArea ? subArea.name : '';
  };

  const categories = ['all', 'Camera', 'Computer', 'Lighting', 'Support'];

  const handleCardClick = (item) => {
    setSelectedEquipment(item);
    setShowDetails(true);
  };

  const handleBookClick = (item) => {
    if (item.status !== 'available') {
      showToast('This equipment is not available for booking', 'error');
      return;
    }
    setSelectedEquipment(item);
    setShowModal(true);
  };

  const handleBookingSuccess = () => {
    showToast('Booking created successfully! Awaiting admin approval.', 'success');
    setShowModal(false);
  };

  const handleMultiBookingSuccess = () => {
    showToast('Multiple bookings created successfully! Awaiting admin approval.', 'success');
    setShowMultiModal(false);
    loadEquipment(); // Reload to show updated availability
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = async () => {
    await loadEquipment();
    await loadSubAreas();
  };

  // Paginate filtered equipment
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEquipment = filteredEquipment.slice(startIndex, endIndex);

  // Check if user has permission to view catalog
  if (!loading && !canViewCatalog()) {
    return (
      <div className="access-restricted">
        <div className="restriction-message">
          <h2>Access Restricted</h2>
          <p>You do not have permission to view the equipment catalog.</p>
          <p>Please contact your department admin to request access.</p>
        </div>
        <style jsx>{`
          .access-restricted {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 60vh;
            padding: 2rem;
          }
          .restriction-message {
            text-align: center;
            max-width: 500px;
            padding: 2rem;
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 8px;
          }
          .restriction-message h2 {
            color: #856404;
            margin-bottom: 1rem;
          }
          .restriction-message p {
            color: #856404;
            margin-bottom: 0.5rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="equipment-browse">
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="browse-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h2>Browse Equipment</h2>
          <button
            onClick={() => setShowMultiModal(true)}
            className="btn btn-primary"
            data-testid="book-multiple-items-btn"
            style={{ whiteSpace: 'nowrap' }}
          >
            Book Multiple Items
          </button>
        </div>

      <SearchBar
        onSearch={handleSearch}
        placeholder="Search equipment by name, description, or category..."
        ariaLabel="Search equipment"
      />

      <AvailabilityFilter onFilterChange={setAvailabilityFilter} />

      {user && user.role === 'student' && kitsEnabled && (
        <KitBrowser onBookingSuccess={loadEquipment} />
      )}

      <div className="filter-controls-compact" style={{
        display: 'grid',
        gridTemplateColumns: (subAreas.length > 0 && user?.role !== 'student') || (user?.role === 'student' && crossDeptBrowsingEnabled) ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr',
        gap: '1rem',
        marginTop: '1rem',
        marginBottom: '1rem',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <div>
          <label htmlFor="category-filter" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
            Category
          </label>
          <select
            id="category-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ced4da',
              fontSize: '0.95rem',
              cursor: 'pointer',
              backgroundColor: 'white'
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Department filter for STUDENTS (when cross-dept browsing enabled) */}
        {user?.role === 'student' && crossDeptBrowsingEnabled && subAreas.length > 0 && (
          <div>
            <label htmlFor="student-department-filter" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
              Department
            </label>
            <select
              id="student-department-filter"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ced4da',
                fontSize: '0.95rem',
                cursor: 'pointer',
                backgroundColor: 'white'
              }}
            >
              <option value="my_department">My Department ({user.department})</option>
              <option value="all">All Departments</option>
              {subAreas
                .filter(sa => sa.id !== user.department)
                .map(subArea => (
                  <option key={subArea.id} value={subArea.id}>
                    {subArea.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Department filter for ADMINS/STAFF */}
        {subAreas.length > 0 && user?.role !== 'student' && (
          <div>
            <label htmlFor="department-filter" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
              Department
            </label>
            <select
              id="department-filter"
              value={subAreaFilter}
              onChange={(e) => setSubAreaFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ced4da',
                fontSize: '0.95rem',
                cursor: 'pointer',
                backgroundColor: 'white'
              }}
            >
              <option value="all">All Departments</option>
              {subAreas.map(subArea => (
                <option key={subArea.id} value={subArea.id}>
                  {subArea.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="view-toggle">
        <button
          className={`btn-view ${viewMode === 'large' ? 'active' : ''}`}
          onClick={() => setViewMode('large')}
          data-testid="view-large-btn"
        >
          Large Details
        </button>
        <button
          className={`btn-view ${viewMode === 'compact' ? 'active' : ''}`}
          onClick={() => setViewMode('compact')}
          data-testid="view-compact-btn"
        >
          Compact List
        </button>
      </div>

      {loading ? (
        viewMode === 'large' ? (
          <div className="equipment-grid">
            <LoadingSkeleton type="card" count={6} />
          </div>
        ) : (
          <table className="equipment-table-compact">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Category</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <LoadingSkeleton type="table-row" count={8} />
            </tbody>
          </table>
        )
      ) : filteredEquipment.length === 0 ? (
        <div className="empty-state">
          <p>No equipment found matching your search criteria.</p>
        </div>
      ) : viewMode === 'large' ? (
        <>
          <div className="equipment-grid">
            {paginatedEquipment.map(item => (
            <div key={item.id} className="equipment-card" data-testid="equipment-card">
              <div onClick={() => handleCardClick(item)} style={{ cursor: 'pointer' }}>
                <EquipmentImage
                  equipment={item}
                  size="medium"
                />
              </div>
              <div className="equipment-info">
                <h3 onClick={() => handleCardClick(item)} style={{ cursor: 'pointer' }}>{item.product_name}</h3>
                <p className="category">{item.category}</p>
                <p className="description">{item.description}</p>
                <div className="equipment-meta">
                  <span className={`status status-${item.status}`}>
                    {item.status}
                  </span>
                  <span className="department">{item.department}</span>
                </div>
                {item.isCrossDepartment && (
                  <div className="cross-department-badge" style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: '#e3f2fd',
                    border: '1px solid #2196f3',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}>
                    <strong style={{ color: '#1976d2' }}>🔄 Cross-Department Access</strong>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#666' }}>
                      From {item.lendingDepartment}
                    </p>
                  </div>
                )}
                {item.isInterdisciplinary && (
                  <div className="interdisciplinary-badge">
                    Available via {getSubAreaName(item.fromSubAreaId)}
                  </div>
                )}
                <button
                  className="btn btn-primary btn-block"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookClick(item);
                  }}
                  disabled={item.status !== 'available'}
                  data-testid="book-equipment-btn"
                >
                  {item.status === 'available' ? 'Book Equipment' : 'Not Available'}
                </button>
              </div>
            </div>
          ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredEquipment.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </>
      ) : (
        <>
          <table className="equipment-table-compact" data-testid="equipment-table-compact">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Category</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEquipment.map(item => (
              <tr key={item.id} data-testid="equipment-row-compact">
                <td onClick={() => handleCardClick(item)} style={{ cursor: 'pointer', fontWeight: '600' }}>
                  {item.product_name}
                </td>
                <td>{item.category}</td>
                <td>
                  {item.department}
                  {item.isCrossDepartment && (
                    <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#1976d2', fontWeight: '600' }}>
                      🔄 From {item.lendingDepartment}
                    </div>
                  )}
                  {item.isInterdisciplinary && (
                    <div className="interdisciplinary-badge" style={{ marginTop: '0.25rem' }}>
                      Via {getSubAreaName(item.fromSubAreaId)}
                    </div>
                  )}
                </td>
                <td>
                  <span className={`status status-${item.status}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleBookClick(item)}
                    disabled={item.status !== 'available'}
                    data-testid="book-equipment-btn-compact"
                  >
                    {item.status === 'available' ? 'Book' : 'Unavailable'}
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredEquipment.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </>
      )}
      </PullToRefresh>

      {showDetails && selectedEquipment && (
        <EquipmentDetails
          equipment={selectedEquipment}
          onClose={() => setShowDetails(false)}
          onBookClick={handleBookClick}
        />
      )}

      {showModal && selectedEquipment && (
        <BookingModal
          equipment={selectedEquipment}
          onClose={() => setShowModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {showMultiModal && (
        <MultiItemBookingModal
          onClose={() => setShowMultiModal(false)}
          onSuccess={handleMultiBookingSuccess}
        />
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
