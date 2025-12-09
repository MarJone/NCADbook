import { useState, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePortalTheme } from '../../contexts/ThemeContext';
import NotificationCenter from '../../components/common/NotificationCenter';
import MobileBottomNav from '../../components/common/MobileBottomNav';
import Breadcrumb from '../../components/common/Breadcrumb';
import { PortalHeader } from '../../components/layout/PortalHeader';
import { SmartSearch } from '../../components/ai/SmartSearch';
import { CommandPalette, useCommandPalette } from '../../components/ai/CommandPalette';
import { AIAssistant, useAIAssistant } from '../../components/ai/AIAssistant';
import Dashboard from './Dashboard';
import BookingApprovals from './BookingApprovals';
import EquipmentManagement from './EquipmentManagement';
import Analytics from './Analytics';
import FeatureFlagManager from './FeatureFlagManager';
import UserManagement from './UserManagement';
import CSVImport from './CSVImport';
import AdminPermissions from './AdminPermissions';
import KitManagement from './KitManagement';
import DepartmentManagement from './SubAreaManagement';
import StudentAssignment from './StudentAssignment';
import InterdisciplinaryAccess from './InterdisciplinaryAccess';
import AccessRequests from './AccessRequests';
import ManageAccessRequests from './ManageAccessRequests';
import DepartmentStaffPermissions from './DepartmentStaffPermissions';
import SystemSettings from '../master-admin/SystemSettings';
import RoleManagement from '../master-admin/RoleManagement';
import AISettings from '../master-admin/AISettings';
import CrossDepartmentRequests from './CrossDepartmentRequests';
import EquipmentKitsManagement from './EquipmentKitsManagement';
import CheckoutVerification from './CheckoutVerification';
import ReturnVerification from './ReturnVerification';
import AccessoryManager from './AccessoryManager';
import BatchLabelPrinting from './BatchLabelPrinting';
import ConditionAssessment from './ConditionAssessment';
import NaturalLanguageQuery from '../master-admin/NaturalLanguageQuery';
import EmailDraftAssistant from '../master-admin/EmailDraftAssistant';
import BookingJustificationAnalyzer from '../master-admin/BookingJustificationAnalyzer';
import './AdminPortal.css';
import './ConditionAssessment.css';
import '../master-admin/NaturalLanguageQuery.css';
import '../master-admin/EmailDraftAssistant.css';
import '../master-admin/BookingJustificationAnalyzer.css';
import './CheckoutVerification.css';
import './ReturnVerification.css';
import './AccessoryManager.css';
import './BatchLabelPrinting.css';
import '../../styles/role-colors.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Determine portal type based on user role
  const isMasterAdmin = user?.role === 'master_admin';
  const portalType = isMasterAdmin ? 'master-admin' : 'dept-admin';

  // Register portal theme
  usePortalTheme(portalType);

  // Command palette for Master Admin
  const { isOpen: isCommandPaletteOpen, open: openCommandPalette, close: closeCommandPalette } = useCommandPalette();

  // AI Assistant state
  const {
    messages,
    isThinking,
    unreadCount,
    sendMessage,
  } = useAIAssistant();

  // Handle command execution
  const handleCommand = useCallback((command) => {
    // Navigate based on command
    const navCommands = {
      'nav-dashboard': '/admin',
      'nav-equipment': '/admin/equipment',
      'nav-users': '/admin/users',
      'nav-bookings': '/admin/approvals',
      'nav-reports': '/admin/analytics',
      'action-add-equipment': '/admin/equipment?action=new',
      'action-add-user': '/admin/users?action=new',
      'action-import-csv': '/admin/csv-import',
      'admin-policies': '/admin/system-settings',
      'admin-settings': '/admin/system-settings',
      'ai-query': '/admin/nlq',
      'ai-condition': '/admin/condition-assessment',
      'ai-email': '/admin/email-draft',
      'ai-justification': '/admin/justification-analyzer',
      'ai-settings': '/admin/ai-settings',
    };

    if (navCommands[command.id]) {
      navigate(navCommands[command.id]);
    }
  }, [navigate]);

  return (
    <div
      className={`admin-portal ${isMasterAdmin ? 'master-admin-portal' : ''}`}
      data-theme="light"
    >
      {/* Enhanced Header with scroll-awareness */}
      <PortalHeader
        portalType={portalType}
        user={user}
        logoSrc="/images/ncad-logo.svg"
        onSearchOpen={() => setIsSearchOpen(true)}
        onCommandPaletteOpen={isMasterAdmin ? openCommandPalette : undefined}
        onMobileMenuToggle={(open) => console.log('Mobile menu:', open)}
        onLogout={logout}
        notificationCount={5}
      />

      {/* Smart Search Modal */}
      {isSearchOpen && (
        <div className="search-modal-backdrop glass-modal-backdrop" onClick={() => setIsSearchOpen(false)}>
          <div className="search-modal glass-modal" onClick={(e) => e.stopPropagation()}>
            <SmartSearch
              onSearch={(query) => {
                console.log('Search:', query);
                setIsSearchOpen(false);
              }}
              onSelectItem={(item) => {
                console.log('Selected:', item);
                setIsSearchOpen(false);
              }}
              placeholder="Search equipment, users, bookings..."
            />
          </div>
        </div>
      )}

      {/* Command Palette (Master Admin only) */}
      {isMasterAdmin && (
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={closeCommandPalette}
          onCommand={handleCommand}
        />
      )}

      <main className="admin-main scroll-reveal-container">
        {/* Breadcrumb Navigation */}
        <Breadcrumb />

        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="approvals" element={<BookingApprovals />} />
          <Route path="equipment" element={<EquipmentManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="kits" element={<KitManagement />} />
          <Route path="departments" element={<DepartmentManagement />} />
          <Route path="student-assignment" element={<StudentAssignment />} />
          <Route path="interdisciplinary" element={<InterdisciplinaryAccess />} />
          <Route path="access-requests" element={<AccessRequests />} />
          <Route path="manage-access-requests" element={<ManageAccessRequests />} />
          <Route path="csv-import" element={<CSVImport />} />
          <Route path="permissions" element={<AdminPermissions />} />
          <Route path="features" element={<FeatureFlagManager />} />
          <Route path="department-staff-permissions" element={<DepartmentStaffPermissions />} />
          <Route path="system-settings" element={<SystemSettings />} />
          <Route path="role-management" element={<RoleManagement />} />
          <Route path="ai-settings" element={<AISettings />} />
          <Route path="cross-department-requests" element={<CrossDepartmentRequests />} />
          <Route path="equipment-kits" element={<EquipmentKitsManagement />} />
          <Route path="checkout" element={<CheckoutVerification />} />
          <Route path="return" element={<ReturnVerification />} />
          <Route path="accessories" element={<AccessoryManager />} />
          <Route path="labels" element={<BatchLabelPrinting />} />
          <Route path="condition-assessment" element={<ConditionAssessment />} />
          {isMasterAdmin && (
            <>
              <Route path="nlq" element={<NaturalLanguageQuery />} />
              <Route path="email-draft" element={<EmailDraftAssistant />} />
              <Route path="justification-analyzer" element={<BookingJustificationAnalyzer />} />
            </>
          )}
        </Routes>
      </main>

      <MobileBottomNav />

      {/* AI Assistant FAB */}
      <AIAssistant
        messages={messages}
        isThinking={isThinking}
        unreadCount={unreadCount}
        onSendMessage={sendMessage}
      />
    </div>
  );
}
