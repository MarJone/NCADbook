import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (testEmail, testPassword) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setError('');
    setLoading(true);

    try {
      await login(testEmail, testPassword);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>NCADbook</h1>
          <p>Equipment Booking System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@ncad.ie"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="test-accounts">
          <p className="test-accounts-title">Demo Accounts:</p>
          <div className="test-accounts-grid">
            <button 
              onClick={() => quickLogin('demo@ncad.ie', 'demo123')}
              className="btn btn-secondary btn-sm"
              disabled={loading}
            >
              Student
            </button>
            <button 
              onClick={() => quickLogin('staff@ncad.ie', 'staff123')}
              className="btn btn-secondary btn-sm"
              disabled={loading}
            >
              Staff
            </button>
            <button 
              onClick={() => quickLogin('admin@ncad.ie', 'admin123')}
              className="btn btn-secondary btn-sm"
              disabled={loading}
            >
              Admin
            </button>
            <button 
              onClick={() => quickLogin('master@ncad.ie', 'master123')}
              className="btn btn-secondary btn-sm"
              disabled={loading}
            >
              Master Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
