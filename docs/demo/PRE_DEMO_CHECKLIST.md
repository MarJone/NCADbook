# ✅ Pre-Demo Checklist - NCADbook

**Complete this checklist before your stakeholder presentation**

---

## 📦 **1. Build & Deployment**

### **Local Build Test**
- [ ] Run `npm install` (no errors)
- [ ] Run `npm run build` (successful build)
- [ ] Check `dist` folder created
- [ ] Test with `npm run preview` (site works locally)

### **Netlify Deployment**
- [ ] Deploy to Netlify (drag & drop or CLI)
- [ ] Verify deployed URL works
- [ ] Set environment variable: `VITE_DEMO_MODE=true`
- [ ] Test deployed site on desktop browser
- [ ] Test deployed site on mobile device
- [ ] Bookmark deployed URL

---

## 🎭 **2. Portal Access Verification**

### **Main Portals** (Test each login)
- [ ] **Student Portal** (top-left quadrant)
  - Email: `commdesign.student1@student.ncad.ie`
  - Password: `student123`
  - ✓ Equipment browse works
  - ✓ Booking creation works
  - ✓ My Bookings displays

- [ ] **Staff Portal** (top-right quadrant)
  - Email: `staff.commdesign@ncad.ie`
  - Password: `staff123`
  - ✓ Dashboard loads
  - ✓ Equipment management accessible
  - ✓ Analytics displays

- [ ] **Department Admin Portal** (bottom-left quadrant)
  - Email: `admin.commdesign@ncad.ie`
  - Password: `admin123`
  - ✓ Booking approvals work
  - ✓ Swipe actions functional (mobile)
  - ✓ Equipment notes can be added
  - ✓ Analytics displays

- [ ] **Master Admin Portal** (bottom-right quadrant)
  - Email: `master@ncad.ie`
  - Password: `master123`
  - ✓ Role Management loads
  - ✓ System Settings loads
  - ✓ Feature flags toggle
  - ✓ Access matrix displays

### **Specialized Role Demos** (Access via Role Management)
- [ ] **View-Only Staff** (`/demo/view_only_staff`)
  - ✓ Portal loads
  - ✓ Read-only catalog displays
  - ✓ No booking buttons (read-only confirmed)

- [ ] **Accounts Officer** (`/demo/accounts_officer`)
  - ✓ Portal loads
  - ✓ Financial dashboard displays
  - ✓ Cost tracking visible
  - ✓ Export buttons work

- [ ] **Payroll Coordinator** (`/demo/payroll_coordinator`)
  - ✓ Portal loads
  - ✓ Payroll dashboard displays
  - ✓ Staff allocation charts visible

- [ ] **IT Support** (`/demo/it_support_technician`)
  - ✓ Portal loads
  - ✓ Equipment lifecycle dashboard displays
  - ✓ Maintenance logs visible
  - ✓ System diagnostics accessible

- [ ] **Budget Manager** (`/demo/budget_manager`)
  - ✓ Portal loads
  - ✓ Budget dashboard displays
  - ✓ ROI calculator works
  - ✓ Forecasting charts visible

---

## 📱 **3. Mobile Responsiveness**

### **Test on Actual Devices** (Recommended)
- [ ] iPhone (Safari) - portrait
- [ ] iPhone (Safari) - landscape
- [ ] Android (Chrome) - portrait
- [ ] Android (Chrome) - landscape
- [ ] iPad (Safari) - portrait
- [ ] iPad (Safari) - landscape

### **Test via Browser DevTools** (Minimum)
- [ ] iPhone 12 Pro (390px)
- [ ] Pixel 5 (393px)
- [ ] iPad Air (820px)
- [ ] Desktop (1920px)

### **Mobile Features to Verify**
- [ ] Login map quadrants are tappable
- [ ] Equipment cards display properly
- [ ] Swipe actions work on booking cards
- [ ] Calendar date picker is touch-friendly
- [ ] Bottom navigation visible on mobile
- [ ] No horizontal scrolling
- [ ] Touch targets are large enough (44px minimum)

---

## 🎨 **4. Visual & Asset Check**

### **Images & Assets**
- [ ] Login map image loads (`/login-map-starter.png`)
- [ ] Equipment placeholder images load
- [ ] No broken image icons
- [ ] All icons display correctly

### **Design System**
- [ ] Student portal = Blue theme
- [ ] Staff portal = Green theme
- [ ] Dept Admin portal = Orange theme
- [ ] Master Admin portal = Purple theme
- [ ] Specialized roles have distinct colors
- [ ] Consistent spacing and typography

### **UI Elements**
- [ ] Buttons are styled correctly
- [ ] Forms are responsive
- [ ] Cards have proper shadows
- [ ] Toast notifications appear
- [ ] Loading spinners work
- [ ] Modal dialogs display properly

---

## ⚡ **5. Core Feature Testing**

### **Student Workflow**
- [ ] Browse equipment (filters work)
- [ ] Create a booking (date picker works)
- [ ] View booking in "My Bookings"
- [ ] Booking shows pending status

### **Admin Workflow**
- [ ] View pending bookings
- [ ] Swipe to approve (mobile)
- [ ] Click to approve (desktop)
- [ ] Add equipment note (maintenance type)
- [ ] Note appears in equipment details

### **Master Admin Features**
- [ ] Toggle feature flag (enable/disable role)
- [ ] Configure cross-dept access matrix
- [ ] Click "Test Demo Portal" button
- [ ] Demo portal opens in new tab

### **Analytics & Exports**
- [ ] Analytics dashboard displays charts
- [ ] Filter by date range works
- [ ] "Export to PDF" generates PDF
- [ ] "Export to CSV" downloads CSV

---

## 📄 **6. Documentation Preparation**

### **Print Materials**
- [ ] Print `DEMO_CREDENTIALS.md` (landscape mode)
- [ ] Print `DEMO_GUIDE.md` (for reference)
- [ ] Bring physical copies to presentation

### **Digital Materials**
- [ ] Bookmark deployed URL in browser
- [ ] Open `DEMO_GUIDE.md` on second screen
- [ ] Open `DEMO_CREDENTIALS.md` in separate tab
- [ ] Create QR code of deployed URL (optional)

### **Presentation Slides** (If creating PowerPoint/Keynote)
- [ ] Add deployed URL to slides
- [ ] Include login credentials
- [ ] Add key statistics (9 roles, 150 users, 75% time savings)
- [ ] Include success metrics from PRD
- [ ] Add screenshots of key features

---

## 🔧 **7. Technical Prep**

### **Browser Setup**
- [ ] Clear browser cache
- [ ] Disable browser extensions (ad blockers, etc.)
- [ ] Test in incognito/private mode
- [ ] Bookmark all demo portal URLs
- [ ] Pre-open tabs for each role

### **Network & Performance**
- [ ] Test on presentation venue WiFi (if possible)
- [ ] Check site load speed (<3 seconds)
- [ ] Verify no console errors (F12)
- [ ] Test during peak network usage

### **Backup Plan**
- [ ] Local dev server ready (`npm run dev`)
- [ ] Offline version available (if WiFi fails)
- [ ] Have mobile hotspot ready
- [ ] Know how to switch to backup quickly

---

## 👥 **8. Stakeholder Prep**

### **Key Messages to Prepare**
- [ ] **Problem Statement:** Current booking process is manual, time-consuming
- [ ] **Solution:** Automated system saves 75% admin time
- [ ] **Innovation:** 9-role system covers all stakeholder needs
- [ ] **Mobile-First:** 70%+ students use mobile devices
- [ ] **ROI:** Better equipment utilization = cost savings
- [ ] **Timeline:** 2-3 weeks to production deployment

### **Anticipated Questions - Prepare Answers**
- [ ] How long to implement? (2-3 weeks)
- [ ] What are hosting costs? (€50-100/month cloud, €0 on-campus)
- [ ] Can it integrate with existing systems? (Yes - LDAP, SMTP, CSV import)
- [ ] What about data security? (RLS policies, role-based access, GDPR compliant)
- [ ] How do we handle 1,600 users? (Tested, optimized for scale)
- [ ] What if equipment is lost/damaged? (Strike system, blacklisting, damage tracking)

### **Success Metrics to Highlight**
- [ ] 75% admin time reduction
- [ ] 20% equipment utilization increase
- [ ] 70%+ mobile bookings target
- [ ] Reduced repair costs via maintenance tracking
- [ ] Enhanced cross-department collaboration

---

## 🎥 **9. Presentation Setup**

### **Day Before Presentation**
- [ ] Charge laptop fully
- [ ] Charge mobile devices fully
- [ ] Download backup power bank
- [ ] Test projector/screen sharing
- [ ] Verify HDMI/display adapters work
- [ ] Run through demo flow 2-3 times

### **1 Hour Before Presentation**
- [ ] Test WiFi connection
- [ ] Open all needed browser tabs
- [ ] Close unnecessary applications
- [ ] Set laptop to "Do Not Disturb" mode
- [ ] Increase screen brightness
- [ ] Test audio (if demoing notifications)
- [ ] Clear browser history/cookies
- [ ] Login to each portal once (warm cache)

### **Equipment Checklist**
- [ ] Laptop (fully charged)
- [ ] Power adapter
- [ ] HDMI/display adapter
- [ ] Mobile device (for mobile demo)
- [ ] Clicker/presenter remote (optional)
- [ ] Printed credentials sheet
- [ ] Printed demo guide
- [ ] Business cards/contact info

---

## 🚨 **10. Troubleshooting Prep**

### **Know How to Handle**
- [ ] **Login fails:** Check CAPS LOCK, try refresh, use backup credentials
- [ ] **Page won't load:** Clear cache, try incognito, switch to backup
- [ ] **WiFi issues:** Switch to mobile hotspot, use local dev server
- [ ] **Demo data looks wrong:** Reset demo data (System Settings)
- [ ] **Feature not working:** Have screenshot/video backup ready
- [ ] **Projector issues:** Have screen sharing backup (Zoom/Teams)

### **Emergency Contacts**
- [ ] IT support number (for venue WiFi issues)
- [ ] Development team contact (for technical questions)
- [ ] Netlify status page bookmarked (status.netlify.com)

---

## 📊 **11. Data & Statistics Ready**

### **Quick Stats to Quote**
- [ ] **9 user roles** covering all stakeholders
- [ ] **150 demo users** across departments
- [ ] **150 equipment items** fully cataloged
- [ ] **10 departments** + 3 Media sub-departments
- [ ] **94KB design tokens** design system
- [ ] **239KB total CSS** (optimized)
- [ ] **9 feature flags** for system configuration
- [ ] **2-3 weeks** to production timeline

### **ROI Calculations Ready**
- [ ] Current admin hours spent on bookings: ___ hours/week
- [ ] 75% reduction = ___ hours saved/week
- [ ] Cost savings = ___ hours × €___ /hour × 52 weeks
- [ ] Equipment utilization improvement: 20% increase
- [ ] Reduced repair costs: Better tracking = ___ % savings

---

## ✨ **12. Final Polish**

### **Last-Minute Checks** (Morning of Presentation)
- [ ] Test deployed URL one more time
- [ ] Check all 9 roles still accessible
- [ ] Verify no new console errors
- [ ] Ensure all images load
- [ ] Test PDF/CSV exports work
- [ ] Confirm mobile responsiveness
- [ ] Review key talking points

### **Presentation Flow**
- [ ] Introduction (2 min): Problem & solution
- [ ] Student experience demo (5 min)
- [ ] Admin portal demo (7 min)
- [ ] Master admin features (5 min)
- [ ] Specialized roles tour (8 min)
- [ ] Q&A and next steps (3-5 min)
- [ ] **Total: 30 minutes** (adjust as needed)

---

## 🎯 **Success Criteria**

**Demo is ready when:**

✅ All 9 roles are accessible and functional
✅ Mobile responsiveness verified on 3+ devices
✅ All core features tested and working
✅ Documentation printed and ready
✅ Backup plan prepared
✅ Presentation flow rehearsed
✅ Questions anticipated and answered
✅ Technical setup tested in venue
✅ Emergency contacts ready
✅ Confidence level: HIGH

---

## 📞 **Day-of-Presentation Checklist**

**30 Minutes Before:**
- [ ] Arrive early
- [ ] Test venue WiFi
- [ ] Connect to projector
- [ ] Open all browser tabs
- [ ] Login to all portals
- [ ] Test swipe gestures on mobile
- [ ] Review DEMO_GUIDE.md key points
- [ ] Have credentials sheet visible

**5 Minutes Before:**
- [ ] Close email/Slack/notifications
- [ ] Full screen browser
- [ ] Increase font size if needed (Ctrl/Cmd +)
- [ ] Test one final login
- [ ] Take a deep breath
- [ ] You've got this! 🚀

---

## 📝 **Post-Demo Checklist**

**After Presentation:**
- [ ] Collect stakeholder feedback
- [ ] Note any questions you couldn't answer
- [ ] Schedule follow-up meetings
- [ ] Share deployed URL via email
- [ ] Send demo guide PDF to attendees
- [ ] Document requested features/changes
- [ ] Update project roadmap based on feedback
- [ ] Celebrate successful demo! 🎉

---

**Demo Version:** 2.0.0
**Last Updated:** October 2025
**Status:** 🟢 Ready for Stakeholder Demo

**Good luck with your presentation! You've built something amazing.** ✨
