import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const quickLogin = async (testEmail, testPassword, roleName) => {
    setError('');
    setLoading(true);

    try {
      await login(testEmail, testPassword);
    } catch (err) {
      setError(`Failed to login as ${roleName}: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>NCADbook</h1>
          <p>Equipment Booking System</p>
          <p className="demo-note">Demo Mode - Click a role to explore</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="demo-accounts">
          <h3>Select Your Role:</h3>
          <div className="demo-accounts-grid">
            <button
              onClick={() => quickLogin('commdesign.student1@student.ncad.ie', 'student123', 'Student')}
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              <span className="role-name">Student</span>
              <span className="role-desc">Browse & book equipment</span>
            </button>
            <button
              onClick={() => quickLogin('staff.commdesign@ncad.ie', 'staff123', 'Staff')}
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              <span className="role-name">Staff</span>
              <span className="role-desc">Equipment + room booking</span>
            </button>
            <button
              onClick={() => quickLogin('admin.commdesign@ncad.ie', 'admin123', 'Department Admin')}
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              <span className="role-name">Department Admin</span>
              <span className="role-desc">Manage department & request access</span>
            </button>
            <button
              onClick={() => quickLogin('master@ncad.ie', 'master123', 'Master Admin')}
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              <span className="role-name">Master Admin</span>
              <span className="role-desc">Full system control</span>
            </button>
          </div>

          {loading && (
            <div className="loading-message">
              Logging in...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
