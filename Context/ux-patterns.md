# UX Patterns - Academic Equipment Booking System

## The Booking Flow Architecture

The reservation process is a multi-stage conversion funnel. Every step must minimize friction while maintaining institutional compliance.

### Core Flow Stages

```
1. Discovery → 2. Kit Assembly → 3. Time Selection → 4. Policy Review → 5. Confirmation
```

Each stage requires specific UX patterns to prevent drop-off.

---

## Stage 1: Discovery & Search

**Goal**: Help users find the right equipment quickly, not just any equipment.

### Navigation Hierarchy
```
Category (Cameras)
  └─ Sub-Category (DSLR)
      └─ Specific Model (Canon EOS R5)
          └─ Individual Units (CAM-001, CAM-002)
```

### Search Patterns

#### Semantic Search Bar
- **Placement**: Top center, always visible
- **Behavior**: Auto-complete with equipment names and project types
- **Example queries**: "Sony A7", "documentary kit", "VR headset"
- **Min width**: 400px desktop, full-width mobile

#### Project-Based Entry Points
Quick filters for common academic use cases:
- "Documentary Film Kit"
- "Podcast Recording Setup"
- "VR Research Simulation"
- "Photography Studio Essentials"

### Filtering System

#### Filter Categories (Order Matters)
1. **Availability** (most important)
   - Available Now
   - Available This Week
   - Show All

2. **Category** 
   - Cameras, Audio, Lighting, Computing, Accessories

3. **Specifications** (category-specific)
   - Cameras: Sensor Size, Resolution, Mount Type
   - Audio: Microphone Type, Polar Pattern, Interface
   - Lighting: Power, Color Temperature, Portability

4. **Special Requirements**
   - Requires Training
   - Check-Out Only
   - Studio Use Only

#### Filter UI Rules
- **Position**: Left sidebar on desktop, drawer on mobile
- **Sticky behavior**: Filters remain visible during scroll
- **Progressive disclosure**: Show 3-5 main filters, "Show More" for advanced
- **Active filters**: Display as removable chips above results
- **Result count**: Update in real-time as filters change

### Equipment Card (Grid View)

```
┌─────────────────────────────┐
│ [High-res equipment photo]  │
│                             │
├─────────────────────────────┤
│ Equipment Name              │
│ Brief Description           │
│ [Available] [Requires Cert] │
│                             │
│ [Quick View] [Reserve Now]  │
└─────────────────────────────┘
```

**Card Elements**:
- **Image**: High-quality, consistent aspect ratio (4:3 or 1:1)
- **Status badge**: Top-right overlay (Available/Unavailable/Reserved)
- **Title**: Equipment name and model number
- **Quick specs**: 2-3 key specifications
- **Certification badge**: If training required
- **CTAs**: "Quick View" (modal) or "Reserve Now" (direct)

### Empty States
- **No results**: "No equipment matches your filters. Try removing some filters."
- **No availability**: "All items currently reserved. View next available dates →"
- **Use Lottie animation**: Friendly, non-critical visual feedback

---

## Stage 2: Kit Assembly

**Goal**: Enable users to build cohesive project kits with compatible equipment.

### The Kit Cart

#### Visual Structure
```
┌─────────────────────────────────────┐
│ YOUR PROJECT KIT         [Clear All]│
├─────────────────────────────────────┤
│ Canon EOS R5              [Remove]  │
│ CAM-001 • Due: Mar 15              │
│                                     │
│ RF 24-70mm f/2.8          [Remove]  │
│ LENS-042 • Due: Mar 15             │
│                                     │
│ ⚠️ Compatibility Check              │
│ ✓ Lens mount compatible            │
│                                     │
│ Rode VideoMic Pro         [Remove]  │
│ MIC-018 • Due: Mar 15              │
├─────────────────────────────────────┤
│ Total Items: 3                      │
│ Most Restrictive Due Date: Mar 15   │
│ Required Certification: Studio 101  │
│                                     │
│ [Continue to Time Selection]        │
└─────────────────────────────────────┘
```

#### Kit Cart Rules
- **Position**: Sticky right sidebar (desktop), bottom sheet (mobile)
- **Always visible**: Minimize/expand but never fully hidden
- **Item count badge**: Show total items in collapsed state
- **Auto-validation**: Check compatibility in real-time
- **Due date logic**: Calculate unified due date (most restrictive)

### Compatibility Validation

Real-time checks for:
- **Lens Mount**: Camera body + lens compatibility
- **Power**: Battery + charger pairing
- **Interface**: Microphone + recorder compatibility
- **Studio Resources**: Space booking + equipment syncing

#### Validation Messaging
```
✓ Lens mount compatible with camera body
⚠️ Consider adding: Memory Card (SD UHS-II)
❌ This microphone requires XLR recorder (not in kit)
```

---

## Stage 3: Time Selection

**Goal**: Allow users to select optimal time slots with full visibility of availability.

### Calendar Grid Interface

```
┌─────────────────────────────────────────────┐
│ [← March 2025 →]                            │
├─────────────────────────────────────────────┤
│  Mon   Tue   Wed   Thu   Fri   Sat   Sun   │
├─────────────────────────────────────────────┤
│   1     2     3     4     5     6     7     │
│  [●]   [●]   [○]   [○]   [●]   [—]   [—]   │
│                                             │
│   8     9    10    11    12    13    14    │
│  [●]   [○]   [○]   [●]   [●]   [—]   [—]   │
└─────────────────────────────────────────────┘

● = Available  ○ = Limited  — = Unavailable
```

#### Calendar UI Rules
- **View options**: Month, week, or day view
- **Visual density**: Minimize clutter—show only essential info
- **Selection mode**: Click date → time slot picker appears
- **Multi-day loans**: Drag to select date range
- **Availability legend**: Always visible, minimal space

### Time Slot Picker

After selecting a date:
```
┌─────────────────────────────┐
│ PICKUP TIME - March 10      │
├─────────────────────────────┤
│ ○ 8:00 AM - 12:00 PM        │
│ ● 12:00 PM - 5:00 PM ✓      │
│ ○ 5:00 PM - 8:00 PM         │
└─────────────────────────────┘

┌─────────────────────────────┐
│ RETURN BY - March 15        │
├─────────────────────────────┤
│ ● 5:00 PM (Required) ✓      │
└─────────────────────────────┘
```

---

## Stage 4: Policy Review & Acceptance

**Goal**: Ensure transparency and obtain explicit consent before final commitment.

### Policy Accordion Interface

```
┌──────────────────────────────────────────┐
│ REVIEW YOUR BORROWING CONTRACT          │
├──────────────────────────────────────────┤
│ ▼ Loan Terms & Conditions               │
│   • Pickup: March 10, 12:00 PM          │
│   • Return: March 15, 5:00 PM           │
│   • Late fee: $10/day per item          │
│   • Damage policy: User responsibility  │
│                                          │
│ ▼ Required Training Verification        │
│   ✓ Studio 101 Certification            │
│   Completed: Jan 15, 2025               │
│                                          │
│ ▼ Your Borrowing Capacity               │
│   • Current items: 0                    │
│   • After this booking: 3               │
│   • Weekly limit: 5 items               │
│   • Remaining capacity: 2 items         │
│                                          │
│ □ I have read and agree to the terms    │
│   above and accept responsibility for   │
│   the equipment during the loan period. │
│                                          │
│ [Back to Time Selection]                │
│ [Confirm & Accept Borrowing Contract]   │
└──────────────────────────────────────────┘
```

---

## Stage 5: Confirmation & Next Steps

**Goal**: Provide clear confirmation and set expectations for pickup.

### Success State

```
┌──────────────────────────────────────────┐
│         ✓ RESERVATION CONFIRMED          │
├──────────────────────────────────────────┤
│ Your equipment is reserved!              │
│                                          │
│ PICKUP DETAILS                           │
│ Date: March 10, 2025                     │
│ Time: 12:00 PM - 12:30 PM                │
│ Location: Media Lab, Room 103            │
│                                          │
│ WHAT TO BRING                            │
│ • Student ID                             │
│ • This confirmation (digital or printed) │
│                                          │
│ ITEMS IN YOUR KIT (3)                    │
│ • Canon EOS R5 (CAM-001)                 │
│ • RF 24-70mm f/2.8 (LENS-042)            │
│ • Rode VideoMic Pro (MIC-018)            │
│                                          │
│ RETURN BY: March 15, 5:00 PM             │
│                                          │
│ [Add to Calendar] [View My Dashboard]    │
│ [Print Confirmation] [Email Receipt]     │
└──────────────────────────────────────────┘
```

---

## The Student Dashboard (Post-Booking)

**Goal**: Proactive control center for managing active and upcoming loans.

### Dashboard Layout

```
┌─────────────────────────────────────────────┐
│ WELCOME BACK, [NAME]                        │
│ Your borrowing capacity: 3/5 items          │
├─────────────────────────────────────────────┤
│ ACTIVE LOANS (2)                            │
│                                             │
│ Canon EOS R5                    ⏱️ 2d 14h   │
│ Due: March 15, 5:00 PM          🔥 $10/day │
│ [Renew] [Report Issue] [Return Early]      │
│                                             │
│ Sony A7 III                     ⏱️ 5d 8h    │
│ Due: March 18, 5:00 PM                     │
│ [Renew] [Report Issue] [Return Early]      │
│                                             │
├─────────────────────────────────────────────┤
│ UPCOMING RESERVATIONS (1)                   │
│                                             │
│ Pickup: March 20, 10:00 AM                 │
│ 3 items • Studio 101 Required ✓            │
│ [View Details] [Modify] [Cancel]           │
│                                             │
├─────────────────────────────────────────────┤
│ BORROWING HISTORY                           │
│ [View Past Loans]                           │
│                                             │
│ YOUR RELIABILITY SCORE: ⭐⭐⭐⭐⭐             │
│ 98% on-time return rate (24 loans)         │
└─────────────────────────────────────────────┘
```

---

## Progress Indicators

Every multi-step flow needs clear progress tracking.

### Visual Progress Bar

```
[●]────[●]────[○]────[○]────[○]
Search  Kit   Time  Policy  Done
```

---

## Accessibility Patterns

### Keyboard Navigation
- **Tab order**: Logical, left-to-right, top-to-bottom
- **Focus indicators**: 3px blue ring, high contrast
- **Skip links**: "Skip to main content", "Skip to filters"
- **Escape key**: Close modals and drawers

### Screen Reader Support
```html
<!-- Equipment card example -->
<article role="article" aria-label="Canon EOS R5 Camera">
  <img alt="Canon EOS R5 professional camera" />
  <div role="status" aria-live="polite">
    <span class="sr-only">Availability status:</span>
    Available
  </div>
  <button aria-label="Add Canon EOS R5 to your project kit">
    Add to Kit
  </button>
</article>
```

---

## Mobile-Specific Patterns

### Responsive Adaptations

#### Filter Drawer (Mobile)
- **Trigger**: "Filters" button with count badge
- **Behavior**: Slide up from bottom
- **Actions**: "Apply" (close + filter) or "Clear All"

#### Kit Cart (Mobile)
- **Default**: Collapsed, sticky bottom bar with count
- **Tap to expand**: Full-screen overlay with items
- **Swipe to remove**: Native iOS/Android pattern

---

## Key Performance Principles

1. **Speed**: Every screen transition < 200ms
2. **Clarity**: No ambiguous CTAs or states
3. **Transparency**: Always show capacity, fees, requirements
4. **Accountability**: Positive framing, countdown urgency
5. **Trust**: Premium visuals signal reliable systems