import { useState, useEffect } from 'react';
import { equipmentAPI, bookingsAPI } from '../../utils/api';
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
import EquipmentQuickView from '../../components/equipment/EquipmentQuickView';
import { useToast } from '../../hooks/useToast';
import { getAccessibleEquipment, getAllDepartments } from '../../services/department.service';
import { useAuth } from '../../contexts/AuthContext';
import { isCrossDepartmentBrowsingEnabled, areEquipmentKitsEnabled } from '../../services/systemSettings.service';
import { getDepartmentsBySchool, SCHOOLS } from '../../config/departments';
import EmptyState from '../../components/common/EmptyState';
import FilterChips from '../../components/common/FilterChips';
import { haptics } from '../../utils/haptics';
import '../../styles/equipment-browse.css';

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
  const [showQuickView, setShowQuickView] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [availabilityFilter, setAvailabilityFilter] = useState({ type: 'all' });
  const { toasts, showToast, removeToast } = useToast();
  const [crossDeptBrowsingEnabled, setCrossDeptBrowsingEnabled] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('my_department'); // 'my_department' or department ID
  const [kitsEnabled, setKitsEnabled] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
    loadDepartments();
  }, [filter, departmentFilter, selectedDepartment]);

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
    const applyFilters = async () => {
      let filtered = equipment;

      // NOTE: Department filtering for students is handled by the dropdown selection
      // and does NOT filter the equipment array - students see all equipment from the API
      // The department dropdown is only for cross-department browsing when enabled
      // Backend returns all equipment for students, filtering by department causes 401 errors

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
        // TODO: Implement backend availability check endpoint
        // For now, just filter by status
        filtered = filtered.filter(item => item.status === 'available');
      }

      setFilteredEquipment(filtered);
      setCurrentPage(1); // Reset to first page when search changes
    };

    applyFilters();
  }, [equipment, searchQuery, availabilityFilter]);

  const loadDepartments = async () => {
    try {
      const areas = await getAllDepartments();
      setDepartments(areas);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadEquipment = async () => {
    setLoading(true);
    try {
      // Build API query parameters
      const params = {};

      // Apply category filter
      if (filter !== 'all') {
        params.category = filter;
      }

      // Apply department filter
      // NOTE: Students don't filter by department in the API call
      // to avoid 401 errors - filtering is done client-side instead
      if (user?.role !== 'student') {
        // Admin/staff department filter
        if (departmentFilter !== 'all') {
          params.department = departmentFilter;
        }
      }

      // Fetch equipment from backend API
      const response = await equipmentAPI.getAll(params);
      const allEquipment = response.equipment || [];

      // TODO: Implement cross-department access grants in backend
      // For now, just use the equipment from the API

      setEquipment(allEquipment);
    } catch (error) {
      console.error('Failed to load equipment:', error);
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = (departmentId) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : '';
  };

  const categories = ['all', 'Camera', 'Computer', 'Lighting', 'Support'];

  const handleCardClick = (item) => {
    setSelectedEquipment(item);
    setShowQuickView(true);
  };

  const handleViewFullDetails = () => {
    setShowQuickView(false);
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
  };

  // Get active filters for filter chips
  const getActiveFilters = () => {
    const activeFilters = [];

    if (filter !== 'all') {
      activeFilters.push({
        id: 'category',
        label: 'Category',
        value: filter
      });
    }

    if (searchQuery.trim()) {
      activeFilters.push({
        id: 'search',
        label: 'Search',
        value: searchQuery.length > 20 ? searchQuery.substring(0, 20) + '...' : searchQuery
      });
    }

    if (departmentFilter !== 'all') {
      const deptName = departments.find(d => d.id === departmentFilter)?.name || departmentFilter;
      activeFilters.push({
        id: 'department',
        label: 'Department',
        value: deptName
      });
    }

    if (selectedDepartment !== 'my_department' && user?.role === 'student') {
      const deptName = selectedDepartment === 'all' ? 'All Departments' : (departments.find(d => d.id === selectedDepartment)?.name || selectedDepartment);
      activeFilters.push({
        id: 'selected_department',
        label: 'Viewing',
        value: deptName
      });
    }

    if (availabilityFilter.type === 'available') {
      activeFilters.push({
        id: 'availability',
        label: 'Availability',
        value: 'Available Only'
      });
    }

    return activeFilters;
  };

  const handleRemoveFilter = (filterId) => {
    switch (filterId) {
      case 'category':
        setFilter('all');
        break;
      case 'search':
        setSearchQuery('');
        break;
      case 'department':
        setDepartmentFilter('all');
        break;
      case 'selected_department':
        setSelectedDepartment('my_department');
        break;
      case 'availability':
        setAvailabilityFilter({ type: 'all' });
        break;
    }
  };

  const handleClearAllFilters = () => {
    setFilter('all');
    setSearchQuery('');
    setDepartmentFilter('all');
    setSelectedDepartment('my_department');
    setAvailabilityFilter({ type: 'all' });
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
      </div>
    );
  }

  return (
    <div className="equipment-browse">
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="browse-header">
          <h2>Browse Equipment</h2>
          <button
            onClick={() => {
              haptics.medium();
              setShowMultiModal(true);
            }}
            className={`btn btn-primary ${loading ? 'loading' : ''}`}
            data-testid="book-multiple-items-btn"
            disabled={loading}
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

      {/* Advanced Filters Toggle */}
      <div className="advanced-filters-toggle">
        <button
          className="btn-advanced-toggle"
          onClick={() => {
            haptics.light();
            setShowAdvancedFilters(!showAdvancedFilters);
          }}
          aria-expanded={showAdvancedFilters}
          aria-controls="advanced-filters-section"
        >
          <span className="toggle-icon">{showAdvancedFilters ? '▼' : '▶'}</span>
          Advanced Filters
          {(filter !== 'all' || (user?.role !== 'student' && departmentFilter !== 'all') || (user?.role === 'student' && selectedDepartment !== 'my_department')) && (
            <span className="filter-badge">
              {[
                filter !== 'all' ? 1 : 0,
                (user?.role !== 'student' && departmentFilter !== 'all') ? 1 : 0,
                (user?.role === 'student' && selectedDepartment !== 'my_department') ? 1 : 0
              ].reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Active Filter Chips */}
      <FilterChips
        filters={getActiveFilters()}
        onRemove={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* Result Count */}
      {!loading && (
        <div className="results-count">
          Showing {filteredEquipment.length} {filteredEquipment.length === 1 ? 'item' : 'items'}
        </div>
      )}

      {user && user.role === 'student' && kitsEnabled && (
        <KitBrowser onBookingSuccess={loadEquipment} />
      )}

      {/* Advanced Filters Section - Collapsible */}
      {showAdvancedFilters && (
        <div id="advanced-filters-section" className={`filter-controls-compact ${!(departments.length > 0 && user?.role !== 'student') && !(user?.role === 'student' && crossDeptBrowsingEnabled) ? 'single-filter' : ''}`}>
        <div>
          <label htmlFor="category-filter" className="filter-label">
            Category
          </label>
          <select
            id="category-filter"
            value={filter}
            onChange={(e) => {
              haptics.light();
              setFilter(e.target.value);
            }}
            className="filter-select"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Department filter for STUDENTS (when cross-dept browsing enabled) */}
        {user?.role === 'student' && crossDeptBrowsingEnabled && departments.length > 0 && (
          <div>
            <label htmlFor="student-department-filter" className="filter-label">
              Department
            </label>
            <select
              id="student-department-filter"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="filter-select"
            >
              <option value="my_department">My Department ({user.department})</option>
              <option value="all">All Departments</option>
              {departments
                .filter(d => d.id !== user.department)
                .map(department => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Department filter for ADMINS/STAFF */}
        {departments.length > 0 && user?.role !== 'student' && (
          <div>
            <label htmlFor="department-filter" className="filter-label">
              Department
            </label>
            <select
              id="department-filter"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Departments</option>
              {departments.map(department => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      )}

      <div className="view-toggle">
        <button
          className={`btn-view ${viewMode === 'large' ? 'active' : ''}`}
          onClick={() => {
            haptics.light();
            setViewMode('large');
          }}
          data-testid="view-large-btn"
        >
          Large Details
        </button>
        <button
          className={`btn-view ${viewMode === 'compact' ? 'active' : ''}`}
          onClick={() => {
            haptics.light();
            setViewMode('compact');
          }}
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
        <EmptyState
          icon="🔍"
          title="No equipment found"
          message="Try adjusting your filters, search terms, or browse a different category."
          action={
            searchQuery || filter !== 'all' || departmentFilter !== 'all' ? (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                  setDepartmentFilter('all');
                  setAvailabilityFilter({ type: 'all' });
                }}
              >
                Clear All Filters
              </button>
            ) : null
          }
        />
      ) : viewMode === 'large' ? (
        <>
          <div className="equipment-grid">
            {paginatedEquipment.map(item => (
            <div key={item.id} className="equipment-card" data-testid="equipment-card">
              <div onClick={() => {
                haptics.light();
                handleCardClick(item);
              }}>
                <EquipmentImage
                  equipment={item}
                  size="medium"
                />
              </div>
              <div className="equipment-info">
                <div className="equipment-header-row">
                  <h3 onClick={() => {
                    haptics.light();
                    handleCardClick(item);
                  }}>{item.product_name}</h3>
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
                </div>
                <p className="category">{item.category}</p>
                <p className="description">{item.description}</p>
                <div className="equipment-meta">
                  <span className="department">{item.department}</span>
                </div>
                {item.isCrossDepartment && (
                  <div className="cross-department-badge">
                    <strong>🔄 Cross-Department Access</strong>
                    <p>From {item.lendingDepartment}</p>
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
                    haptics.medium();
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
                <td onClick={() => {
                  haptics.light();
                  handleCardClick(item);
                }} className="equipment-name-cell">
                  {item.product_name}
                </td>
                <td>{item.category}</td>
                <td>
                  {item.department}
                  {item.isCrossDepartment && (
                    <div className="cross-dept-compact">
                      🔄 From {item.lendingDepartment}
                    </div>
                  )}
                  {item.isInterdisciplinary && (
                    <div className="interdisciplinary-badge">
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
                    onClick={() => {
                      haptics.medium();
                      handleBookClick(item);
                    }}
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

      {showQuickView && selectedEquipment && (
        <EquipmentQuickView
          equipment={selectedEquipment}
          onClose={() => setShowQuickView(false)}
          onBookClick={handleBookClick}
          onViewFullDetails={handleViewFullDetails}
        />
      )}

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
