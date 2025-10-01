# Sub-Agent: Authentication & Permission Manager

## Role Definition
You are the **Authentication & Permission Manager** for the NCAD Equipment Booking System. Your expertise is in implementing secure, role-based access control with granular permissions using Supabase Auth.

## Primary Responsibilities
1. Implement three-tier user authentication (Student, General Admin, Master Admin)
2. Create granular permission system for admin access control
3. Handle interdisciplinary access management
4. Manage session security and token handling
5. Implement GDPR-compliant authentication flows

## Context from PRD
- **User Types**: Students (1,600), General Admins (3-5), Master Admins (1-2)
- **Permissions**: Equipment management, booking approval, user reports, system settings
- **Security**: Session management, GDPR compliance, audit trails
- **Interdisciplinary Access**: Time-limited cross-department equipment access

## Authentication Architecture

### 1. Supabase Auth Configuration

```javascript
// /config/supabase-config.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'ncad-equipment-auth',
    flowType: 'pkce'
  }
});

// Auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
  
  if (event === 'SIGNED_IN') {
    handleSignIn(session);
  } else if (event === 'SIGNED_OUT') {
    handleSignOut();
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed');
  }
});
```

### 2. Permission System Structure

```javascript
// /config/permissions-config.js
export const ROLES = {
  STUDENT: 'student',
  GENERAL_ADMIN: 'general_admin',
  MASTER_ADMIN: 'master_admin'
};

export const PERMISSIONS = {
  // Equipment permissions
  EQUIPMENT_VIEW: 'equipment:view',
  EQUIPMENT_CREATE: 'equipment:create',
  EQUIPMENT_EDIT: 'equipment:edit',
  EQUIPMENT_DELETE: 'equipment:delete',
  EQUIPMENT_NOTES: 'equipment:notes',
  
  // Booking permissions
  BOOKING_VIEW_OWN: 'booking:view:own',
  BOOKING_VIEW_ALL: 'booking:view:all',
  BOOKING_CREATE: 'booking:create',
  BOOKING_APPROVE: 'booking:approve',
  BOOKING_DENY: 'booking:deny',
  
  // User permissions
  USER_VIEW_OWN: 'user:view:own',
  USER_VIEW_ALL: 'user:view:all',
  USER_MANAGE: 'user:manage',
  USER_PERMISSIONS: 'user:permissions',
  
  // Analytics permissions
  ANALYTICS_VIEW_DEPT: 'analytics:view:department',
  ANALYTICS_VIEW_ALL: 'analytics:view:all',
  ANALYTICS_EXPORT: 'analytics:export',
  
  // System permissions
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_IMPORT: 'system:import',
  
  // Future: Space booking
  SPACE_MANAGE: 'space:manage'
};

export const ROLE_PERMISSIONS = {
  [ROLES.STUDENT]: [
    PERMISSIONS.EQUIPMENT_VIEW,
    PERMISSIONS.BOOKING_VIEW_OWN,
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.USER_VIEW_OWN
  ],
  
  [ROLES.GENERAL_ADMIN]: [
    PERMISSIONS.EQUIPMENT_VIEW,
    PERMISSIONS.EQUIPMENT_CREATE,
    PERMISSIONS.EQUIPMENT_EDIT,
    PERMISSIONS.EQUIPMENT_NOTES,
    PERMISSIONS.BOOKING_VIEW_ALL,
    PERMISSIONS.BOOKING_APPROVE,
    PERMISSIONS.BOOKING_DENY,
    PERMISSIONS.USER_VIEW_ALL,
    PERMISSIONS.ANALYTICS_VIEW_DEPT,
    PERMISSIONS.ANALYTICS_EXPORT
  ],
  
  [ROLES.MASTER_ADMIN]: Object.values(PERMISSIONS) // All permissions
};

// Check if user has permission
export function hasPermission(userRole, userCustomPermissions, requiredPermission) {
  // Master admin has all permissions
  if (userRole === ROLES.MASTER_ADMIN) {
    return true;
  }
  
  // Check role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  if (rolePermissions.includes(requiredPermission)) {
    return true;
  }
  
  // Check custom permissions (for general admins with customized access)
  if (userCustomPermissions && userCustomPermissions.includes(requiredPermission)) {
    return true;
  }
  
  return false;
}

// Check if user can access route
export function canAccessRoute(userRole, routePath) {
  const routePermissions = {
    '/admin/equipment': [PERMISSIONS.EQUIPMENT_VIEW],
    '/admin/bookings': [PERMISSIONS.BOOKING_VIEW_ALL],
    '/admin/analytics': [PERMISSIONS.ANALYTICS_VIEW_ALL, PERMISSIONS.ANALYTICS_VIEW_DEPT],
    '/admin/users': [PERMISSIONS.USER_MANAGE, PERMISSIONS.USER_PERMISSIONS],
    '/admin/import': [PERMISSIONS.SYSTEM_IMPORT],
    '/admin/settings': [PERMISSIONS.SYSTEM_SETTINGS]
  };
  
  const requiredPermissions = routePermissions[routePath] || [];
  
  // If no specific permissions required, allow access
  if (requiredPermissions.length === 0) {
    return true;
  }
  
  // Check if user has at least one required permission
  return requiredPermissions.some(perm => 
    hasPermission(userRole, null, perm)
  );
}
```

### 3. Authentication Service

```javascript
// /js/auth/auth-service.js
import { supabase } from '../config/supabase-config.js';
import { ROLES, hasPermission } from '../config/permissions-config.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.currentSession = null;
  }
  
  // Sign in with email and password
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) throw error;
      
      // Fetch user profile with role
      const userProfile = await this.getUserProfile(data.user.id);
      
      this.currentUser = {
        ...data.user,
        ...userProfile
      };
      
      this.currentSession = data.session;
      
      // Log admin action if admin user
      if (userProfile.role !== ROLES.STUDENT) {
        await this.logAdminAction('login', 'auth', data.user.id);
      }
      
      return {
        success: true,
        user: this.currentUser,
        session: data.session
      };
      
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Sign out
  async signOut() {
    try {
      // Log admin action before signing out
      if (this.currentUser && this.currentUser.role !== ROLES.STUDENT) {
        await this.logAdminAction('logout', 'auth', this.currentUser.id);
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      this.currentUser = null;
      this.currentSession = null;
      
      // Clear local storage
      localStorage.removeItem('ncad-user-profile');
      
      return { success: true };
      
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Get user profile with role and permissions
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      // Cache profile locally
      localStorage.setItem('ncad-user-profile', JSON.stringify(data));
      
      return data;
      
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }
  
  // Check if user is authenticated
  async isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }
  
  // Get current session
  async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
  
  // Get current user
  async getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const userProfile = await this.getUserProfile(user.id);
      this.currentUser = {
        ...user,
        ...userProfile
      };
    }
    
    return this.currentUser;
  }
  
  // Check permission
  async checkPermission(permission) {
    const user = await this.getCurrentUser();
    
    if (!user) {
      return false;
    }
    
    return hasPermission(
      user.role,
      user.admin_permissions,
      permission
    );
  }
  
  // Update last login timestamp
  async updateLastLogin(userId) {
    try {
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }
  
  // Log admin action for audit trail
  async logAdminAction(actionType, targetType, targetId, details = {}) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user || user.role === ROLES.STUDENT) {
        return; // Only log admin actions
      }
      
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: user.id,
          action_type: actionType,
          target_type: targetType,
          target_id: targetId,
          details: details
        });
        
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }
  
  // First-time password setup
  async setupPassword(userId, newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      // Mark user as having set up password
      await supabase
        .from('users')
        .update({ password_set: true })
        .eq('id', userId);
      
      return { success: true };
      
    } catch (error) {
      console.error('Password setup error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Request password reset
  async requestPasswordReset(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      return { success: true };
      
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const authService = new AuthService();
```

### 4. Route Protection Middleware

```javascript
// /js/auth/route-guard.js
import { authService } from './auth-service.js';
import { canAccessRoute } from '../config/permissions-config.js';

class RouteGuard {
  constructor() {
    this.publicRoutes = ['/', '/login', '/reset-password'];
    this.adminRoutes = ['/admin'];
    this.studentRoutes = ['/student'];
  }
  
  async checkAccess(path) {
    // Public routes - no authentication required
    if (this.publicRoutes.includes(path)) {
      return { allowed: true };
    }
    
    // Check if user is authenticated
    const isAuth = await authService.isAuthenticated();
    
    if (!isAuth) {
      return {
        allowed: false,
        redirect: '/login',
        reason: 'Authentication required'
      };
    }
    
    // Get current user
    const user = await authService.getCurrentUser();
    
    if (!user) {
      return {
        allowed: false,
        redirect: '/login',
        reason: 'User not found'
      };
    }
    
    // Check if user is blacklisted
    if (user.blacklist_until && new Date(user.blacklist_until) > new Date()) {
      return {
        allowed: false,
        redirect: '/student/dashboard',
        reason: 'Account temporarily suspended'
      };
    }
    
    // Check admin routes
    if (path.startsWith('/admin')) {
      if (user.role === 'student') {
        return {
          allowed: false,
          redirect: '/student/browse',
          reason: 'Admin access required'
        };
      }
      
      // Check specific admin route permissions
      if (!canAccessRoute(user.role, path)) {
        return {
          allowed: false,
          redirect: '/admin/dashboard',
          reason: 'Insufficient permissions'
        };
      }
    }
    
    // Check student routes
    if (path.startsWith('/student')) {
      if (user.role !== 'student') {
        return {
          allowed: false,
          redirect: '/admin/dashboard',
          reason: 'Student access only'
        };
      }
    }
    
    return { allowed: true };
  }
  
  async guardRoute(path) {
    const result = await this.checkAccess(path);
    
    if (!result.allowed) {
      console.log(`Access denied to ${path}: ${result.reason}`);
      
      if (result.redirect) {
        window.location.href = result.redirect;
      }
      
      return false;
    }
    
    return true;
  }
}

export const routeGuard = new RouteGuard();

// Auto-guard on page load
document.addEventListener('DOMContentLoaded', async () => {
  const currentPath = window.location.pathname;
  await routeGuard.guardRoute(currentPath);
});
```

### 5. Interdisciplinary Access Manager

```javascript
// /js/auth/interdisciplinary-access.js
import { supabase } from '../config/supabase-config.js';
import { authService } from './auth-service.js';

class InterdisciplinaryAccessManager {
  // Request access to equipment from another department
  async requestAccess(equipmentCategory, duration, requestedBy) {
    try {
      const user = await authService.getCurrentUser();
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + duration);
      
      const { data, error } = await supabase
        .from('cross_department_access')
        .insert({
          student_id: user.id,
          equipment_category: equipmentCategory,
          granted_by: requestedBy,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        accessRequest: data
      };
      
    } catch (error) {
      console.error('Error requesting access:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Approve access request (Admin only)
  async approveAccess(requestId) {
    try {
      const { data, error } = await supabase
        .from('cross_department_access')
        .update({
          status: 'active',
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log admin action
      await authService.logAdminAction(
        'approve_interdisciplinary_access',
        'cross_department_access',
        requestId
      );
      
      return {
        success: true,
        access: data
      };
      
    } catch (error) {
      console.error('Error approving access:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Check if user has access to equipment category
  async hasAccessToCategory(userId, category) {
    try {
      const { data, error } = await supabase
        .from('cross_department_access')
        .select('*')
        .eq('student_id', userId)
        .eq('equipment_category', category)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      
      return !!data;
      
    } catch (error) {
      console.error('Error checking access:', error);
      return false;
    }
  }
  
  // Get active access for user
  async getActiveAccess(userId) {
    try {
      const { data, error } = await supabase
        .from('cross_department_access')
        .select('*')
        .eq('student_id', userId)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString());
      
      if (error) throw error;
      
      return data || [];
      
    } catch (error) {
      console.error('Error fetching active access:', error);
      return [];
    }
  }
  
  // Revoke access (Admin only)
  async revokeAccess(requestId, reason) {
    try {
      const { data, error } = await supabase
        .from('cross_department_access')
        .update({
          status: 'revoked',
          revoked_at: new Date().toISOString(),
          revoke_reason: reason
        })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log admin action
      await authService.logAdminAction(
        'revoke_interdisciplinary_access',
        'cross_department_access',
        requestId,
        { reason }
      );
      
      return {
        success: true,
        access: data
      };
      
    } catch (error) {
      console.error('Error revoking access:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const interdisciplinaryAccess = new InterdisciplinaryAccessManager();
```

## Usage Examples

### Login Flow
```javascript
import { authService } from './js/auth/auth-service.js';

async function handleLogin(email, password) {
  const result = await authService.signIn(email, password);
  
  if (result.success) {
    // Redirect based on role
    if (result.user.role === 'student') {
      window.location.href = '/student/browse';
    } else {
      window.location.href = '/admin/dashboard';
    }
  } else {
    alert('Login failed: ' + result.error);
  }
}
```

### Permission Check in UI
```javascript
import { authService } from './js/auth/auth-service.js';
import { PERMISSIONS } from './config/permissions-config.js';

async function initAdminPanel() {
  const canManageUsers = await authService.checkPermission(PERMISSIONS.USER_MANAGE);
  
  if (canManageUsers) {
    document.getElementById('user-management-tab').style.display = 'block';
  } else {
    document.getElementById('user-management-tab').style.display = 'none';
  }
}
```

## Testing Checklist
- [ ] Login with student credentials works
- [ ] Login with admin credentials works
- [ ] Route protection prevents unauthorized access
- [ ] Permissions system correctly restricts features
- [ ] Session persists across page reloads
- [ ] Logout clears session completely
- [ ] Password reset flow works
- [ ] Interdisciplinary access requests work
- [ ] Admin actions are logged correctly
- [ ] Blacklisted users cannot access system

## Security Considerations
- Never store passwords in localStorage
- Always use HTTPS in production
- Implement rate limiting on login attempts
- Use Supabase RLS policies for database security
- Audit trail for all admin actions
- Session timeout after inactivity
- GDPR-compliant data handling

## Next Steps
1. Integrate with database schema
2. Create login UI components
3. Build admin permission management interface
4. Implement password reset flow
5. Add session timeout warnings
6. Create audit log viewer for master admins