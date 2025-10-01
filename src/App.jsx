import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import StudentLayout from './portals/student/StudentLayout';
import StaffLayout from './portals/staff/StaffLayout';
import AdminLayout from './portals/admin/AdminLayout';
import Login from './components/common/Login';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading NCADbook...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const getDefaultRoute = () => {
    if (user.role === 'master_admin' || user.role === 'admin') return '/admin';
    if (user.role === 'staff') return '/staff';
    return '/student';
  };

  return (
    <Router>
      <Routes>
        <Route path="/student/*" element={user.role === 'student' || user.role === 'staff' || user.role === 'admin' || user.role === 'master_admin' ? <StudentLayout /> : <Navigate to={getDefaultRoute()} />} />
        <Route path="/staff/*" element={user.role === 'staff' || user.role === 'admin' || user.role === 'master_admin' ? <StaffLayout /> : <Navigate to={getDefaultRoute()} />} />
        <Route path="/admin/*" element={user.role === 'admin' || user.role === 'master_admin' ? <AdminLayout /> : <Navigate to={getDefaultRoute()} />} />
        <Route path="/" element={<Navigate to={getDefaultRoute()} />} />
      </Routes>
    </Router>
  );
}

export default App;
