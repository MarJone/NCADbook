import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { demoMode } from '../../mocks/demo-mode';
import './Login.css';

export default function Login() {
  const [hoveredPortal, setHoveredPortal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Handle demo login with fallback to demo mode
  const handleDemoLogin = async (userRole, redirectPath) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 Login: Authenticating as', userRole);

      // Try backend API first, fallback to demo mode
      try {
        const response = await authAPI.demoLogin(userRole);

        console.log('✅ API Login successful:', response.user.full_name);
        localStorage.setItem('ncadbook_user', JSON.stringify(response.user));
        window.location.href = '/NCADbook' + redirectPath;
        return;
      } catch (apiError) {
        console.log('⚠️ Backend API unavailable, using demo mode');

        // Fallback to demo mode (for GitHub Pages)
        const demoData = demoMode.getData();
        const user = demoData.users.find(u => u.role === userRole);

        if (!user) {
          throw new Error('Demo user not found');
        }

        console.log('✅ Demo Mode Login successful:', user.full_name);
        console.log('📧 Email:', user.email);
        console.log('🎭 Role:', user.role);
        console.log('🏢 Department:', user.department);

        // Store user data in localStorage
        localStorage.setItem('ncadbook_user', JSON.stringify(user));
        demoMode.setCurrentUser(user);

        // Navigate to the appropriate portal
        window.location.href = '/NCADbook' + redirectPath;
      }
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
                    data-portal={portal.id}
                    data-testid={`portal-${portal.id}`}
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
