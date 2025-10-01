# Equipment Booking System - Updated Claude Code Implementation Prompt

## Visual Reference
Please reference the provided wireframe for the complete UI/UX design and the new mobile-first responsive requirements document for specific interface adaptations.

## Project Overview
Build a comprehensive, mobile-first equipment booking system for educational institutions with responsive design, student and admin portals, real-time availability tracking, approval workflows, GDPR-compliant data management, and scalable architecture for future room/space booking integration.

## Core Requirements

### 🎯 Enhanced User Roles & Authentication
- **Students**: Browse equipment, make bookings, track reservations, view strike status (mobile-optimized)
- **General Admins**: Manage assigned equipment, approve bookings, add detailed notes (permission-controlled)
- **Master Admins**: Full system control, user permission management, analytics access
- **Authentication**: Simple login system with role-based access control
- **Security**: Session management, granular permission system, GDPR compliance

### 📱 Mobile-First Student Portal Features
1. **Responsive Equipment Browse Page**
   - Touch-friendly search/filter for 200+ equipment items
   - Categories: Cameras, Laptops, Audio, Accessories, etc.
   - Real-time availability status with visual indicators
   - Multi-select equipment for batch booking (swipe/tap interactions)
   - Equipment details: description, category, images with lazy loading
   - Minimum 44px touch targets for mobile interactions

2. **Mobile-Optimized Booking Calendar**
   - Large touch targets (60px minimum) for date selection
   - Swipe navigation between months
   - Color-coded availability with clear mobile legend:
     - White: Available
     - Yellow: Provisionally booked
     - Red: Unavailable/booked
     - Blue: Selected dates
   - Smart weekend selection: Friday auto-selects Sat/Sun
   - Touch-friendly comments section
   - Booking conflict prevention with visual feedback

3. **Responsive Student Dashboard**
   - Mobile-optimized booking cards with swipe actions
   - Strike status visualization (3-dot system)
   - Quick-return functionality
   - Pull-to-refresh booking updates
   - Booking history with infinite scroll

### 🔧 Enhanced Admin Portal Features
1. **Equipment Management with Admin Notes**
   - Add/edit/remove equipment with image management
   - **Multi-field admin notes system**:
     - Dropdown categories: Maintenance, Damage History, Usage Restrictions, General
     - Timeline view of all notes with admin attribution
     - Category-specific note templates
   - Set status: Available, Maintenance, Out of Service
   - GDPR-compliant CSV import with validation and preview
   - Equipment tracking numbers (admin-only visibility)
   - Local image storage with default fallbacks

2. **Booking Management with Mobile Support**
   - Touch-optimized dashboard with key metrics
   - Swipe actions for approve/deny on tablets
   - Track overdue returns with automated notifications
   - Booking history and analytics
   - Mobile-responsive approval workflow

3. **Comprehensive Analytics & Reporting (New Page)**
   - **Metrics Dashboard** with exportable data:
     - Equipment utilization rates
     - Department usage breakdowns
     - Popular equipment rankings
     - User activity patterns
     - Financial impact tracking
   - **Export Capabilities**:
     - CSV export for data analysis
     - PDF reports for presentations
     - Custom date ranges (last month, custom selection)
   - **Visual Analytics**:
     - Donut charts for department breakdowns
     - Line charts for usage trends
     - Bar charts for equipment popularity
     - Mobile-responsive chart design

4. **Advanced User & Permission Management**
   - **Master Admin Controls**:
     - Grant/revoke general admin permissions
     - Toggle access to different system areas
     - Future room/space booking permissions
   - **Interdisciplinary Access Management**:
     - Time-limited cross-department equipment access
     - Admin-controlled approval process
     - Access logging and audit trails

### 📊 Enhanced Data Management
**Primary Database**: Supabase (free tier) with mobile optimization
**CSV Import System**: GDPR-compliant with validation and preview
**Image Management**: Local storage with CDN-ready architecture

**Enhanced Data Structure**:
```sql
-- Enhanced Users table
Users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  student_id VARCHAR UNIQUE,
  first_name VARCHAR NOT NULL,
  surname VARCHAR NOT NULL,
  full_name VARCHAR NOT NULL,
  department VARCHAR NOT NULL,
  role ENUM('student', 'general_admin', 'master_admin') DEFAULT 'student',
  admin_permissions JSONB, -- Granular permission control
  strike_count INTEGER DEFAULT 0,
  blacklist_until TIMESTAMP,
  interdisciplinary_access JSONB, -- Time-limited cross-dept access
  created_at TIMESTAMP,
  last_login TIMESTAMP
);

-- Enhanced Equipment table
Equipment (
  id UUID PRIMARY KEY,
  product_name VARCHAR NOT NULL,
  tracking_number VARCHAR UNIQUE, -- Admin-only field
  description TEXT,
  image_url VARCHAR, -- Local storage path
  category VARCHAR NOT NULL,
  status ENUM('available', 'booked', 'maintenance', 'out_of_service'),
  qr_code VARCHAR, -- Future QR scanning support
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Multi-category admin notes
EquipmentNotes (
  id UUID PRIMARY KEY,
  equipment_id UUID REFERENCES Equipment(id),
  note_type ENUM('maintenance', 'damage', 'usage', 'general') NOT NULL,
  note_content TEXT NOT NULL,
  created_by UUID REFERENCES Users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Enhanced Bookings
Bookings (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES Users(id),
  equipment_ids UUID[] NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  purpose TEXT,
  status ENUM('pending', 'approved', 'denied', 'active', 'completed', 'cancelled'),
  created_at TIMESTAMP,
  approved_by UUID REFERENCES Users(id),
  approved_at TIMESTAMP,
  admin_notes TEXT
);

-- Admin actions audit trail
AdminActions (
  id UUID PRIMARY KEY,
  admin_id UUID REFERENCES Users(id),
  action_type VARCHAR NOT NULL,
  target_type VARCHAR NOT NULL,
  target_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMP
);

-- Interdisciplinary access tracking
CrossDepartmentAccess (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES Users(id),
  equipment_category VARCHAR,
  granted_by UUID REFERENCES Users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('active', 'expired', 'revoked'),
  created_at TIMESTAMP
);
```

### 📄 GDPR-Compliant CSV Import System
**User Import Format**:
```csv
first_name,surname,full_name,email,department
John,Smith,John Smith,john.smith@ncad.ie,Moving Image Design
Sarah,Johnson,Sarah Johnson,sarah.j@ncad.ie,Graphic Design
```

**Equipment Import Format**:
```csv
product_name,tracking_number,description,link_to_image
Canon EOS R5,CAM-001,Professional mirrorless camera,canon_r5.jpg
MacBook Pro 16",LAP-005,M2 Max editing laptop,macbook_pro.jpg
```

**Import Process**:
1. File upload with validation
2. Data preview with error highlighting
3. Duplicate detection (skip duplicates)
4. Batch processing with progress indicators
5. Success/error reporting

### 🔄 Business Logic Enhancements

1. **Enhanced Booking Workflow**:
   - Student selects equipment → chooses dates → submits request
   - Admin receives notification → reviews with full equipment history
   - Approval/denial with admin notes
   - Auto-email notifications with mobile-friendly templates
   - Equipment status updates in real-time

2. **Advanced Return Tracking**:
   - Mobile-friendly return marking
   - Admin verification with condition notes
   - Overdue tracking with escalating notifications
   - Auto-strike system with admin override capabilities

3. **Enhanced Strike System Logic**:
   ```javascript
   const StrikeRules = {
     lateReturn: { strikes: 1, suspension: null },
     damagedEquipment: { strikes: 2, suspension: '1 week' },
     noShow: { strikes: 1, suspension: null },
     
     consequences: {
       1: { action: 'warning_email', restriction: null },
       2: { action: 'booking_suspension', restriction: '1 week' },
       3: { action: 'blacklist', restriction: '1 month' }
     }
   };
   ```

4. **Permission Management Logic**:
   ```javascript
   const AdminPermissions = {
     general_admin: {
       equipment_management: true,
       booking_approval: true,
       user_reports: false,
       system_settings: false,
       space_booking: false // Future feature
     },
     
     master_admin: {
       all_permissions: true,
       permission_management: true,
       system_configuration: true
     }
   };
   ```

### 📧 Enhanced Notification System
**Mobile-Optimized Emails**:
- Responsive email templates
- Clear action buttons
- Equipment images and details
- Mobile-friendly formatting

**Notification Triggers**:
- Booking submitted → Admin notification
- Booking approved/denied → Student notification
- Equipment overdue → Student + Admin notification
- Strike issued → Student notification
- Cross-department access granted → Student notification

### 🎨 Mobile-First Frontend Implementation

**Responsive Architecture**:
```
Mobile Breakpoints:
├── Mobile: 320px - 768px (single column, large touch targets)
├── Tablet: 768px - 1024px (two columns, swipe actions)
└── Desktop: 1024px+ (three columns, hover states)
```

**CSS Framework Structure**:
```css
/* Mobile-first base styles */
.equipment-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

/* Touch-friendly interactions */
.btn {
  min-height: 44px;
  padding: 18px 25px;
  font-size: 16px; /* Prevents zoom on iOS */
}

.calendar-day {
  min-height: 60px;
  min-width: 44px;
}

/* Tablet adaptations */
@media (min-width: 768px) {
  .equipment-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .swipe-actions {
    display: flex;
  }
}

/* Desktop enhancements */
@media (min-width: 1024px) {
  .equipment-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .hover-states {
    display: block;
  }
}
```

**JavaScript Mobile Optimizations**:
```javascript
// Touch event handling
const handleSwipe = (element, callback) => {
  let startX, startY, endX, endY;
  
  element.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  });
  
  element.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    endY = e.changedTouches[0].clientY;
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      callback(deltaX > 0 ? 'right' : 'left');
    }
  });
};

// Performance optimizations
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Lazy loading for images
const observeImages = () => {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
};
```

### 🔧 Technical Architecture

**File Structure (Enhanced)**:
```
/
├── index.html (responsive login page)
├── student/
│   ├── browse.html (mobile-optimized equipment browser)
│   ├── booking.html (touch-friendly calendar)
│   └── dashboard.html (swipe-enabled booking management)
├── admin/
│   ├── equipment.html (equipment management with notes)
│   ├── bookings.html (booking approval with analytics)
│   ├── analytics.html (NEW: metrics dashboard with exports)
│   ├── users.html (permission management)
│   └── import.html (NEW: CSV import with validation)
├── css/
│   ├── main.css (mobile-first responsive styles)
│   ├── components.css (reusable responsive components)
│   ├── animations.css (touch-friendly animations)
│   └── mobile.css (mobile-specific optimizations)
├── js/
│   ├── auth.js (role-based authentication)
│   ├── booking-logic.js (enhanced booking workflow)
│   ├── calendar.js (touch-optimized calendar)
│   ├── admin-notes.js (NEW: multi-category notes system)
│   ├── analytics.js (NEW: metrics and export functionality)
│   ├── csv-import.js (NEW: GDPR-compliant import system)
│   ├── permissions.js (NEW: granular admin permissions)
│   ├── mobile-interactions.js (touch and swipe handling)
│   └── performance.js (lazy loading, debouncing)
├── images/
│   ├── equipment/ (local equipment images)
│   ├── default_equipment.jpg (fallback image)
│   └── placeholders/ (loading placeholders)
└── config/
    ├── supabase-config.js
    └── permissions-config.js (NEW: permission definitions)
```

### 🚀 Enhanced Implementation Priority

1. **Phase 1**: Mobile-first core booking system
   - Responsive student browse → touch calendar → admin approval
   - Basic admin notes functionality
   - CSV import with validation

2. **Phase 2**: Enhanced admin features
   - Multi-category notes system
   - Analytics dashboard with exports
   - Granular permission management

3. **Phase 3**: Advanced features
   - Interdisciplinary access system
   - QR code infrastructure
   - Performance optimizations

### 💻 Mobile Development Considerations

**Performance**:
- Lazy load equipment images with intersection observer
- Debounce search inputs (300ms)
- Virtual scrolling for large equipment lists
- Service worker foundation for offline capability
- Optimize images for mobile (WebP with fallbacks)

**Accessibility**:
- Minimum 44px touch targets
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode support
- Voice-over compatibility

**User Experience**:
- Loading states with skeleton screens
- Pull-to-refresh on booking lists
- Haptic feedback simulation with animations
- Swipe gestures for common actions
- Offline-ready architecture foundation

### 🧪 Testing Strategy

**Responsive Testing**:
- Mobile devices (iOS Safari, Android Chrome)
- Tablet interfaces (iPad, Android tablets)
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Touch vs. mouse interaction patterns

**Core User Flows to Test**:
- Mobile equipment booking end-to-end
- Admin approval workflow on tablets
- CSV import validation process
- Analytics export functionality
- Permission management system
- Cross-department access workflow

### 📋 Deployment & Hosting

**Mobile-Optimized Hosting**:
- CDN for image delivery
- Gzip compression for CSS/JS
- Browser caching strategies
- Progressive Web App manifest
- Service worker for offline support

**Performance Monitoring**:
- Core Web Vitals tracking
- Mobile performance metrics
- User interaction analytics
- Error reporting and logging

## Future Enhancement Roadmap

### **Phase 4**: Advanced Mobile Features
- Camera integration for QR code scanning
- Voice search capabilities
- Full offline mode with sync
- Push notifications
- Biometric authentication

### **Phase 5**: Room/Space Booking Integration
- Hourly booking system alongside daily equipment
- Floor plan integration with touch navigation
- Combined equipment + space booking packages
- Capacity management with visual indicators

### **Phase 6**: Institutional Scaling
- Multi-campus support
- Advanced analytics with machine learning
- Integration with academic calendar systems
- API for third-party integrations

## Success Metrics

**Mobile-Specific KPIs**:
- 70%+ bookings completed on mobile devices
- <3 second load times on 3G networks
- 95%+ touch interaction success rate
- 4.5/5 mobile user satisfaction score

**System Performance**:
- 99%+ uptime during academic hours
- <500ms search response times
- 80%+ student adoption within 3 months
- 75% reduction in administrative time

---

**Note**: This implementation emphasizes mobile-first design while maintaining full desktop functionality. The system architecture supports future scaling to room/space bookings and provides comprehensive analytics for data-driven decision making. All features are designed with GDPR compliance and institutional security requirements in mind.