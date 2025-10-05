import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredPortal, setHoveredPortal] = useState(null);
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

  const portals = [
    {
      id: 'student',
      email: 'commdesign.student1@student.ncad.ie',
      password: 'student123',
      name: 'Student',
      coords: '60,60,580,580' // top-left quadrant
    },
    {
      id: 'staff',
      email: 'staff.commdesign@ncad.ie',
      password: 'staff123',
      name: 'Staff',
      coords: '620,60,1140,580' // top-right quadrant
    },
    {
      id: 'admin',
      email: 'admin.commdesign@ncad.ie',
      password: 'admin123',
      name: 'Dept Admin',
      coords: '60,620,580,1140' // bottom-left quadrant
    },
    {
      id: 'master',
      email: 'master@ncad.ie',
      password: 'master123',
      name: 'Master Admin',
      coords: '620,620,1140,1140' // bottom-right quadrant
    }
  ];

  return (
    <div className="artistic-login-container">
      {error && <div className="error-banner">{error}</div>}

      <div className="portal-map-container">
        <div className="map-wrapper">
          {/* Base image */}
          <img
            src="/login-map-starter.png"
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
                    onClick={() => !loading && quickLogin(portal.email, portal.password, portal.name)}
                    style={{ cursor: loading ? 'wait' : 'pointer' }}
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
          {hoveredPortal
            ? `Click to enter ${portals.find(p => p.id === hoveredPortal)?.name}`
            : 'Hover over a quadrant to enter your portal'}
        </p>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner-artistic"></div>
          <p>Entering portal...</p>
        </div>
      )}
    </div>
  );
}
