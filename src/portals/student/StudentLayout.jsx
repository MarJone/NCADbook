import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePortalTheme } from '../../contexts/ThemeContext';
import NotificationCenter from '../../components/common/NotificationCenter';
import MobileBottomNav from '../../components/common/MobileBottomNav';
import Breadcrumb from '../../components/common/Breadcrumb';
import { PortalHeader } from '../../components/layout/PortalHeader';
import { SmartSearch } from '../../components/ai/SmartSearch';
import { AIAssistant, useAIAssistant } from '../../components/ai/AIAssistant';
import StudentDashboard from './StudentDashboard';
import EquipmentBrowse from './EquipmentBrowse';
import MyBookings from './MyBookings';
import './StudentPortal.css';
import '../../styles/role-colors.css';

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Register portal theme
  usePortalTheme('student');

  // AI Assistant state
  const {
    messages,
    isThinking,
    unreadCount,
    sendMessage,
  } = useAIAssistant();

  // Mock data for smart search
  const recentSearches = [
    { id: 1, text: 'Canon EOS R5' },
    { id: 2, text: 'Audio recorder' },
  ];

  const trendingItems = [
    { id: 1, name: 'Sony A7 IV', category: 'camera', bookings: 15 },
    { id: 2, name: 'Zoom H6', category: 'audio', bookings: 12 },
  ];

  return (
    <div className="student-portal" data-theme="light">
      {/* Enhanced Header with scroll-awareness */}
      <PortalHeader
        portalType="student"
        user={user}
        logoSrc="/images/ncad-logo.svg"
        onSearchOpen={() => setIsSearchOpen(true)}
        onMobileMenuToggle={(open) => console.log('Mobile menu:', open)}
        onLogout={logout}
        notificationCount={3}
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
              recentSearches={recentSearches}
              trendingItems={trendingItems}
              placeholder="Search equipment... try 'camera for portraits'"
            />
          </div>
        </div>
      )}

      <main className="student-main scroll-reveal-container">
        {/* Breadcrumb Navigation */}
        <Breadcrumb />

        <Routes>
          <Route index element={<StudentDashboard />} />
          <Route path="equipment" element={<EquipmentBrowse />} />
          <Route path="bookings" element={<MyBookings />} />
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
