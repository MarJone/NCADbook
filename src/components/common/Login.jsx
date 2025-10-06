import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import './Login.css';

export default function Login() {
  const [hoveredPortal, setHoveredPortal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Handle demo login via backend API
  const handleDemoLogin = async (userRole, redirectPath) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 API Login: Authenticating as', userRole);

      // Call backend demo login endpoint
      const response = await authAPI.demoLogin(userRole);

      console.log('✅ Login successful:', response.user.full_name);
      console.log('📧 Email:', response.user.email);
      console.log('🎭 Role:', response.user.role);
      console.log('🏢 Department:', response.user.department);

      // Store user data in localStorage (token is already stored by authAPI)
      localStorage.setItem('ncadbook_user', JSON.stringify(response.user));

      // Navigate to the appropriate portal
      window.location.href = '/NCADbook' + redirectPath;
    } catch (err) {
      console.error('❌ Login failed:', err);
      setError(err.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const portals = [
    {
      id: 'student',
      role: 'student',
      name: 'Student Portal',
      path: '/student',
      coords: '60,60,580,580' // top-left quadrant
    },
    {
      id: 'staff',
      role: 'staff',
      name: 'Staff Portal',
      path: '/staff',
      coords: '620,60,1140,580' // top-right quadrant
    },
    {
      id: 'admin',
      role: 'department_admin',
      name: 'Department Admin',
      path: '/admin',
      coords: '60,620,580,1140' // bottom-left quadrant
    },
    {
      id: 'master',
      role: 'master_admin',
      name: 'Master Admin',
      path: '/admin',
      coords: '620,620,1140,1140' // bottom-right quadrant
    }
  ];

  return (
    <div className="artistic-login-container">
      <div className="portal-map-container">
        <div className="map-wrapper">
          {/* Base image */}
          <img
            src="/NCADbook/login-map-frame2.jpg"
            alt="NCAD Portal Map"
            className="base-map-image"
          />

          {/* Elegant hover overlays for each quadrant */}
          <svg
            viewBox="0 0 1200 1200"
            className="portal-overlay-svg"
          >
            {portals.map((portal) => {
              const [x1, y1, x2, y2] = portal.coords.split(',').map(Number);
              const isHovered = hoveredPortal === portal.id;

              return (
                <g key={portal.id}>
                  {/* Clickable area */}
                  <rect
                    x={x1}
                    y={y1}
                    width={x2 - x1}
                    height={y2 - y1}
                    className={`portal-quadrant ${isHovered ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredPortal(portal.id)}
                    onMouseLeave={() => setHoveredPortal(null)}
                    onClick={() => handleDemoLogin(portal.role, portal.path)}
                    style={{ cursor: isLoading ? 'wait' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
                  />

                  {/* Portal label - appears on hover */}
                  {isHovered && (
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2}
                      className="portal-label"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {portal.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <p className="instruction-text">
          {isLoading
            ? '🔐 Authenticating...'
            : error
            ? `❌ ${error}`
            : hoveredPortal
            ? `Click to enter ${portals.find(p => p.id === hoveredPortal)?.name}`
            : 'Tap any quadrant to enter a portal'}
        </p>
      </div>
    </div>
  );
}
