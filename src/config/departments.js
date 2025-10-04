/**
 * NCAD Department Structure
 *
 * Organized by Schools with nested departments/subject areas
 * Used throughout the system for:
 * - User registration and profiles
 * - Equipment assignment and access control
 * - Cross-departmental request routing
 * - Analytics and reporting
 */

export const SCHOOLS = {
  DESIGN: 'School of Design',
  FINE_ART: 'School of Fine Art',
  EDUCATION: 'School of Education',
  VISUAL_CULTURE: 'School of Visual Culture',
  FIRST_YEAR: 'First Year Studies'
};

export const DEPARTMENTS = {
  // School of Design (2 departments)
  COMMUNICATION_DESIGN: {
    name: 'Communication Design',
    school: SCHOOLS.DESIGN,
    category: 'Design',
    description: 'Graphic Design, Illustration, Moving Image, Fashion, Textiles'
  },
  PRODUCT_DESIGN: {
    name: 'Product Design',
    school: SCHOOLS.DESIGN,
    category: 'Design',
    description: 'Industrial Design, Interaction Design, 3D Design'
  },

  // School of Fine Art (4 departments)
  PAINTING: {
    name: 'Painting',
    school: SCHOOLS.FINE_ART,
    category: 'Fine Art',
    description: 'Traditional and contemporary painting'
  },
  PRINT: {
    name: 'Print',
    school: SCHOOLS.FINE_ART,
    category: 'Fine Art',
    description: 'Printmaking, etching, screen printing, lithography'
  },
  MEDIA: {
    name: 'Media',
    school: SCHOOLS.FINE_ART,
    category: 'Fine Art',
    description: 'Photography, Video Studio, Physical Computing/Printing',
    hasMultipleAdmins: true,
    adminRoles: ['Photography Admin', 'Video Studio Admin', 'Physical Computing Admin']
  },
  SCULPTURE_APPLIED_MATERIALS: {
    name: 'Sculpture & Applied Materials',
    school: SCHOOLS.FINE_ART,
    category: 'Fine Art',
    description: 'Sculpture, Ceramics, Glass, Mixed Media'
  },

  // School of Education (1 department)
  EDUCATION: {
    name: 'Education',
    school: SCHOOLS.EDUCATION,
    category: 'Education',
    description: 'All education programs (BA, Joint Honours, Professional Master)'
  },

  // School of Visual Culture (1 department)
  VISUAL_CULTURE: {
    name: 'Visual Culture',
    school: SCHOOLS.VISUAL_CULTURE,
    category: 'Visual Culture',
    description: 'Theory, History, Critical Studies (BA, MA, MFA)'
  },

  // First Year Studies (2 departments - separate equipment pools)
  FIRST_YEAR_GROUND_FLOOR: {
    name: 'First Year - Ground Floor',
    school: SCHOOLS.FIRST_YEAR,
    category: 'Foundation',
    description: 'Design Building Ground Floor Equipment Pool'
  },
  FIRST_YEAR_TOP_FLOOR: {
    name: 'First Year - Top Floor',
    school: SCHOOLS.FIRST_YEAR,
    category: 'Foundation',
    description: 'Design Building Top Floor Equipment Pool'
  }
};

/**
 * Get all departments as a flat array for dropdowns
 * @returns {Array} Array of department objects with id and display name
 */
export const getDepartmentList = () => {
  return Object.entries(DEPARTMENTS).map(([id, dept]) => ({
    id,
    name: dept.name,
    school: dept.school,
    category: dept.category,
    displayName: `${dept.name} (${dept.school})`
  }));
};

/**
 * Get departments grouped by school
 * @returns {Object} Departments organized by school
 */
export const getDepartmentsBySchool = () => {
  const grouped = {};

  Object.values(SCHOOLS).forEach(school => {
    grouped[school] = [];
  });

  Object.entries(DEPARTMENTS).forEach(([id, dept]) => {
    grouped[dept.school].push({
      id,
      name: dept.name,
      category: dept.category
    });
  });

  return grouped;
};

/**
 * Get departments grouped by category
 * @returns {Object} Departments organized by category
 */
export const getDepartmentsByCategory = () => {
  const grouped = {};

  Object.entries(DEPARTMENTS).forEach(([id, dept]) => {
    if (!grouped[dept.category]) {
      grouped[dept.category] = [];
    }
    grouped[dept.category].push({
      id,
      name: dept.name,
      school: dept.school
    });
  });

  return grouped;
};

/**
 * Get department name by ID
 * @param {string} id - Department ID
 * @returns {string} Department name or id if not found
 */
export const getDepartmentName = (id) => {
  return DEPARTMENTS[id]?.name || id;
};

/**
 * Get school name by department ID
 * @param {string} departmentId - Department ID
 * @returns {string} School name or empty string
 */
export const getSchoolByDepartment = (departmentId) => {
  return DEPARTMENTS[departmentId]?.school || '';
};
