import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import StudentLayout from './portals/student/StudentLayout';
import StaffLayout from './portals/staff/StaffLayout';
import AdminLayout from './portals/admin/AdminLayout';
import Login from './components/common/Login';
import ViewOnlyStaffDemo from './portals/demo/ViewOnlyStaffDemo';
import AccountsOfficerDemo from './portals/demo/AccountsOfficerDemo';
import PayrollCoordinatorDemo from './portals/demo/PayrollCoordinatorDemo';
import ITSupportDemo from './portals/demo/ITSupportDemo';
import BudgetManagerDemo from './portals/demo/BudgetManagerDemo';
import './styles/theme.css';
import './styles/mobile-touch-targets.css';
import './styles/smooth-animations.css';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" />;
  }

  if (!allowedRoles.includes(user.role)) {
    const getDefaultRoute = () => {
      if (user.role === 'master_admin' || user.role === 'department_admin') return '/admin';
      if (user.role === 'staff') return '/staff';
      return '/student';
    };
    return <Navigate to={getDefaultRoute()} />;
  }

  return children;
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading NCADbook...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={!user ? <Login /> : <Navigate to={
        user.role === 'master_admin' || user.role === 'department_admin' ? '/admin' :
        user.role === 'staff' ? '/staff' : '/student'
      } />} />

      <Route path="/student/*" element={
        <ProtectedRoute allowedRoles={['student', 'staff', 'department_admin', 'master_admin']}>
          <StudentLayout />
        </ProtectedRoute>
      } />

      <Route path="/staff/*" element={
        <ProtectedRoute allowedRoles={['staff', 'department_admin', 'master_admin']}>
          <StaffLayout />
        </ProtectedRoute>
      } />

      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['department_admin', 'master_admin']}>
          <AdminLayout />
        </ProtectedRoute>
      } />

      {/* Demo Portal Routes - PUBLIC (no login required) */}
      <Route path="/demo/view_only_staff" element={<ViewOnlyStaffDemo />} />
      <Route path="/demo/accounts_officer" element={<AccountsOfficerDemo />} />
      <Route path="/demo/payroll_coordinator" element={<PayrollCoordinatorDemo />} />
      <Route path="/demo/it_support_technician" element={<ITSupportDemo />} />
      <Route path="/demo/budget_manager" element={<BudgetManagerDemo />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router basename="/NCADbook">
            <AppContent />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
