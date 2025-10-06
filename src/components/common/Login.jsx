import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [hoveredPortal, setHoveredPortal] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Direct login for demo mode - bypasses authentication
  const directLogin = (userRole, redirectPath) => {
    console.log('🎭 DEMO MODE: Direct login as', userRole);

    // Manually create demo user object based on role
    const demoUsers = {
      student: { id: '24', email: 'demo.student@ncad.ie', first_name: 'Demo', surname: 'Student', full_name: 'Demo Student', role: 'student', department: 'COMMUNICATION_DESIGN' },
      staff: { id: '14', email: 'demo.staff@ncad.ie', first_name: 'Demo', surname: 'Staff', full_name: 'Demo Staff', role: 'staff', department: 'COMMUNICATION_DESIGN' },
      department_admin: { id: '2', email: 'demo.admin@ncad.ie', first_name: 'Demo', surname: 'Admin', full_name: 'Demo Admin', role: 'department_admin', department: 'COMMUNICATION_DESIGN' },
      master_admin: { id: '1', email: 'master@ncad.ie', first_name: 'Master', surname: 'Admin', full_name: 'Master Admin', role: 'master_admin', department: 'COMMUNICATION_DESIGN' }
    };

    const user = demoUsers[userRole];

    // Set user in localStorage for demo mode
    const demoData = JSON.parse(localStorage.getItem('ncadbook_demo_data') || '{}');
    demoData.currentUser = user;
    localStorage.setItem('ncadbook_demo_data', JSON.stringify(demoData));

    console.log('✅ Direct login successful:', user.full_name);

    // Force page reload to update auth state
    // Include base path for Vite deployment
    window.location.href = '/NCADbook' + redirectPath;
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
                    onClick={() => directLogin(portal.role, portal.path)}
                    style={{ cursor: 'pointer' }}
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
            : 'Tap any quadrant to enter a portal'}
        </p>
      </div>
    </div>
  );
}
