# Updated Wireframe & UI Requirements

## Mobile-First Responsive Design Updates

### Key UI Changes Required

#### 1. **Admin Notes Interface**
```
Equipment Details Page (Admin View):
┌─────────────────────────────────────┐
│ Canon EOS R5                        │
│ ─────────────────────────────────── │
│ Tracking: CAM-001 (admin only)     │
│ Status: Available                   │
│                                     │
│ Admin Notes:                        │
│ ┌─ Note Type ▼ ──────────────────┐ │
│ │ [Maintenance ▼] [+ Add Note]   │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Last service: Cleaned sensor    │ │
│ │ - Tech Officer Sarah            │ │
│ │ - March 10, 2025                │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Damage Report: Minor scratch    │ │
│ │ - Admin Mike                    │ │
│ │ - March 5, 2025                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Note Categories Dropdown:
- Maintenance
- Damage History  
- Usage Restrictions
- General Notes
```

#### 2. **Metrics Dashboard (New Page)**
```
Admin > Analytics & Reports
┌─────────────────────────────────────┐
│ ⟵ Admin Dashboard                   │
│                                     │
│ 📊 ANALYTICS & REPORTS              │
│                                     │
│ Date Range: [Last Month ▼] [Export]│
│            [Custom Range...]        │
│                                     │
│ ┌─── Quick Stats ─────────────────┐ │
│ │ 89% Equipment Utilization       │ │
│ │ 156 Total Bookings This Month   │ │
│ │ 12 Items in High Demand         │ │
│ │ 3.2 Avg Booking Duration        │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─── Department Breakdown ────────┐ │
│ │ [Chart: Donut chart with        │ │
│ │  Moving Image: 45%              │ │
│ │  Graphic Design: 35%            │ │
│ │  Illustration: 20%]             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─── Popular Equipment ───────────┐ │
│ │ 1. Canon EOS R5     (23 books)  │ │
│ │ 2. MacBook Pro      (19 books)  │ │
│ │ 3. Rode PodMic      (15 books)  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [📄 Export PDF] [📊 Export CSV]    │
└─────────────────────────────────────┘
```

#### 3. **CSV Import Interface**
```
Admin > Import Data
┌─────────────────────────────────────┐
│ ⟵ Admin Dashboard                   │
│                                     │
│ 📁 IMPORT USERS & EQUIPMENT         │
│                                     │
│ ┌─── Import Users ────────────────┐ │
│ │ Required columns:               │ │
│ │ • first_name                    │ │
│ │ • surname                       │ │
│ │ • full_name                     │ │
│ │ • email                         │ │
│ │ • department                    │ │
│ │                                 │ │
│ │ [Choose CSV File] [📋 Template] │ │
│ │ selected_users.csv              │ │
│ │                                 │ │
│ │ [Preview Import] [✓ Import]     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─── Import Equipment ────────────┐ │
│ │ Required columns:               │ │
│ │ • product_name                  │ │
│ │ • tracking_number               │ │
│ │ • description                   │ │
│ │ • link_to_image                 │ │
│ │                                 │ │
│ │ [Choose CSV File] [📋 Template] │ │
│ │ equipment_list.csv              │ │
│ │                                 │ │
│ │ [Preview Import] [✓ Import]     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### 4. **Admin Permissions Management**
```
Master Admin > User Management
┌─────────────────────────────────────┐
│ ⟵ Admin Dashboard                   │
│                                     │
│ 👥 ADMIN USER MANAGEMENT            │
│                                     │
│ ┌─── General Admins ──────────────┐ │
│ │ Sarah Johnson                   │ │
│ │ sarah.j@ncad.ie                 │ │
│ │ Permissions:                    │ │
│ │ ☑ Equipment Management          │ │
│ │ ☐ Space Booking (Future)        │ │
│ │ ☑ User Reports                  │ │
│ │ ☐ System Settings               │ │
│ │ [Save Changes]                  │ │
│ ├─────────────────────────────────┤ │
│ │ Mike Chen                       │ │
│ │ mike.c@ncad.ie                  │ │
│ │ Permissions:                    │ │
│ │ ☑ Equipment Management          │ │
│ │ ☑ Space Booking (Future)        │ │
│ │ ☐ User Reports                  │ │
│ │ ☐ System Settings               │ │
│ │ [Save Changes]                  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [+ Add New Admin]                   │
└─────────────────────────────────────┘
```

## Mobile Responsive Breakpoints

### 📱 **Mobile (320px - 768px)**
```css
/* Key mobile adaptations needed */
.equipment-grid {
  grid-template-columns: 1fr; /* Single column */
  gap: 15px;
}

.calendar-grid {
  font-size: 14px; /* Larger touch targets */
  min-height: 60px; /* Bigger touch areas */
}

.nav-tabs {
  overflow-x: auto; /* Horizontal scroll */
  white-space: nowrap;
}

.btn {
  padding: 18px 25px; /* Larger touch targets */
  margin: 8px 0; /* More spacing */
}

/* Mobile-specific interactions */
.swipe-action {
  /* Enable for booking approval cards */
  touch-action: pan-x;
}
```

### 📱 **Tablet (768px - 1024px)**
```css
.equipment-grid {
  grid-template-columns: repeat(2, 1fr);
}

.admin-stats {
  grid-template-columns: repeat(2, 1fr);
}

/* Tablet-optimized admin panel */
.swipe-actions {
  display: flex; /* Show swipe hints */
}
```

### 🖥️ **Desktop (1024px+)**
```css
.equipment-grid {
  grid-template-columns: repeat(3, 1fr);
}

.admin-stats {
  grid-template-columns: repeat(4, 1fr);
}
```

## Enhanced Navigation Structure

```
Main Navigation (Responsive):
├── 🏠 Dashboard
├── 🔍 Browse Equipment
├── 📅 My Bookings  
├── 📊 Analytics (Admin only)
├── ⚙️ Admin Tools
│   ├── Equipment Management
│   ├── Booking Management
│   ├── User Management (Master Admin)
│   ├── Import Data
│   └── System Settings (Master Admin)
└── 👤 Profile
```

## Mobile-Specific UI Patterns

### **Touch-Friendly Elements**
- Minimum 44px touch targets
- Swipe gestures for admin actions
- Pull-to-refresh on booking lists
- Sticky headers during scroll
- Bottom navigation for key actions

### **Progressive Enhancement**
- Core functionality works without JavaScript
- Enhanced interactions with JavaScript enabled
- Graceful degradation for older mobile browsers
- Offline-ready message when network unavailable

### **Mobile Calendar Adaptations**
```
Mobile Calendar View:
┌─────────────────────────┐
│ ← March 2025 →          │
│ ─────────────────────── │
│ S  M  T  W  T  F  S     │
│                         │
│ ○  ○  ○  ○  ○  ●  ○     │ Large touch targets
│ 2  3  4  5  6  7  8     │ 60px minimum height
│                         │
│ ○  ⚠  ⚠  ⚠  ⚠  ●  ○     │ 
│ 9  10 11 12 13 14 15    │
│                         │
│ ○  ●  ●  ✗  ✗  ●  ○     │
│ 16 17 18 19 20 21 22    │ 
└─────────────────────────┘

Legend (Mobile):
● Available  ⚠ Provisional  ✗ Booked  ● Selected
```

## Image Management Interface

```
Equipment > Add/Edit Item
┌─────────────────────────────────────┐
│ Product Image:                      │
│ ┌─── Current Image ───────────────┐ │
│ │ [📷 Camera placeholder image]   │ │
│ │                                 │ │
│ │ 📂 Browse Images                │ │
│ │ └─ /images/equipment/           │ │
│ │    ├─ camera_icon.jpg           │ │
│ │    ├─ laptop_icon.jpg           │ │
│ │    ├─ audio_icon.jpg            │ │
│ │    └─ default_equipment.jpg     │ │
│ │                                 │ │
│ │ [Upload New Image]              │ │
│ │ [Use Default Image]             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Image URL (Auto-filled):            │
│ /images/equipment/canon_r5.jpg      │
└─────────────────────────────────────┘
```

## Interdisciplinary Access Interface

```
Department Admin > Cross-Department Access
┌─────────────────────────────────────┐
│ 🤝 INTERDISCIPLINARY ACCESS         │
│                                     │
│ Grant Access to Our Equipment:      │
│ ┌─────────────────────────────────┐ │
│ │ Student: Emma Wilson            │ │
│ │ From: Fine Arts Department      │ │
│ │ Requested by: Prof. Smith       │ │
│ │ Equipment: Video editing suite  │ │
│ │ Duration: [2 weeks ▼]           │ │
│ │ Start Date: [Mar 20, 2025]      │ │
│ │ End Date: [Apr 3, 2025] (auto)  │ │
│ │                                 │ │
│ │ [✓ Approve] [✗ Deny]            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Current Access Granted:             │
│ • John Doe (Architecture) - 5 days │
│ • Sarah Kim (Fine Arts) - 12 days  │ │
│                                     │
│ [View Full Access Log]              │
└─────────────────────────────────────┘
```

## Animation & Interaction Guidelines

### **Mobile Animations**
- Smooth 300ms transitions for state changes
- Haptic feedback simulation with subtle animations
- Loading states with skeleton screens
- Swipe gesture visual feedback
- Pull-to-refresh animations

### **Touch Interactions**
- Visual feedback on touch (button press states)
- Swipe-to-action animations for admin tasks
- Long-press context menus
- Drag-and-drop for calendar interactions
- Zoom gestures for calendar month navigation

### **Performance Considerations**
- CSS transforms instead of layout changes
- Debounced search inputs (300ms delay)
- Lazy loading for equipment images
- Virtual scrolling for large equipment lists
- Cached data for offline-ready experience

This wireframe update ensures the system provides an excellent experience across all devices while maintaining the sophisticated functionality required for institutional use.