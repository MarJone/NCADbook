/**
 * Master Admin Configuration Dashboard
 * Manages feature flags and role toggles for the NCAD Booking System
 */

import { supabase } from './config/supabase-config.js';

class MasterAdminConfig {
  constructor() {
    this.featureFlags = [];
    this.userCounts = {};
    this.activityLog = [];
    this.init();
  }

  async init() {
    await this.checkAdminPermissions();
    await this.loadFeatureFlags();
    await this.loadUserCounts();
    await this.loadActivityLog();
    this.attachEventListeners();
    this.updateSystemStatus();
  }

  /**
   * Verify current user is master admin
   */
  async checkAdminPermissions() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = '/login.html';
      return;
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || userData.role !== 'master_admin') {
      this.showToast('Unauthorized: Master Admin access required', 'error');
      setTimeout(() => window.location.href = '/dashboard.html', 2000);
    }
  }

  /**
   * Load all feature flags from database
   */
  async loadFeatureFlags() {
    const { data, error } = await supabase
      .from('system_feature_flags')
      .select('*')
      .order('feature_key');

    if (error) {
      console.error('Error loading feature flags:', error);
      this.showToast('Failed to load feature flags', 'error');
      return;
    }

    this.featureFlags = data;
    this.renderFeatureFlags();
  }

  /**
   * Render feature flags in UI
   */
  renderFeatureFlags() {
    this.featureFlags.forEach(flag => {
      const card = document.querySelector(`[data-feature="${flag.feature_key}"]`);
      if (!card) return;

      const toggle = card.querySelector(`input[data-feature-key="${flag.feature_key}"]`);
      const statusBadge = card.querySelector('.feature-status');

      if (toggle) {
        toggle.checked = flag.is_enabled;
        toggle.disabled = false;
      }

      if (statusBadge) {
        statusBadge.textContent = flag.is_enabled ? 'Enabled' : 'Disabled';
        statusBadge.dataset.status = flag.is_enabled ? 'enabled' : 'disabled';
      }

      // Update card visual state
      if (flag.is_enabled) {
        card.classList.add('enabled');
      } else {
        card.classList.remove('enabled');
      }
    });
  }

  /**
   * Load user counts by role
   */
  async loadUserCounts() {
    const { data, error } = await supabase
      .from('users')
      .select('role');

    if (error) {
      console.error('Error loading user counts:', error);
      return;
    }

    // Count by role
    this.userCounts = data.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Update UI
    this.updateUserCountsInUI();
  }

  /**
   * Update user count displays
   */
  updateUserCountsInUI() {
    // Update role-specific counts in feature cards
    Object.keys(this.userCounts).forEach(role => {
      const countSpan = document.querySelector(`[data-count="${role}"]`);
      if (countSpan) {
        countSpan.textContent = this.userCounts[role];
      }
    });

    // Update system status
    const totalUsers = Object.values(this.userCounts).reduce((a, b) => a + b, 0);
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('student-count').textContent = this.userCounts.student || 0;

    const adminCount = Object.entries(this.userCounts)
      .filter(([role]) => role !== 'student')
      .reduce((sum, [, count]) => sum + count, 0);
    document.getElementById('admin-count').textContent = adminCount;
  }

  /**
   * Load configuration activity log
   */
  async loadActivityLog() {
    const { data, error } = await supabase
      .from('admin_actions')
      .select(`
        *,
        users:admin_id (full_name)
      `)
      .eq('action_type', 'feature_flag_update')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading activity log:', error);
      return;
    }

    this.activityLog = data;
    this.renderActivityLog();
  }

  /**
   * Render activity log table
   */
  renderActivityLog() {
    const tbody = document.getElementById('activity-log-body');

    if (this.activityLog.length === 0) {
      tbody.innerHTML = '<tr class="empty-state"><td colspan="5">No configuration changes recorded yet</td></tr>';
      return;
    }

    tbody.innerHTML = this.activityLog.map(log => {
      const details = log.details || {};
      return `
        <tr>
          <td>${new Date(log.created_at).toLocaleString()}</td>
          <td>${log.users?.full_name || 'Unknown'}</td>
          <td>${details.action || 'Update'}</td>
          <td>${details.feature_name || details.feature_key || 'Unknown'}</td>
          <td><span class="status-badge ${details.new_status}">${details.new_status || '—'}</span></td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Update system status indicators
   */
  updateSystemStatus() {
    // Count enabled features
    const enabledCount = this.featureFlags.filter(f => f.is_enabled).length;
    document.getElementById('enabled-features').textContent = enabledCount;

    // Count active roles (3 core + enabled advanced roles)
    const roleFlags = this.featureFlags.filter(f => f.feature_key.startsWith('role_'));
    const enabledRoles = roleFlags.filter(f => f.is_enabled).length;
    document.getElementById('active-roles').textContent = 3 + enabledRoles;

    // Last change info
    if (this.activityLog.length > 0) {
      const lastChange = this.activityLog[0];
      document.getElementById('last-change').textContent =
        new Date(lastChange.created_at).toLocaleString();
      document.getElementById('last-changed-by').textContent =
        lastChange.users?.full_name || 'Unknown';
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Feature flag toggles
    document.querySelectorAll('.toggle-switch input[type="checkbox"]').forEach(toggle => {
      toggle.addEventListener('change', (e) => this.handleFeatureToggle(e));
    });

    // Danger zone actions
    document.getElementById('disable-all-roles')?.addEventListener('click', () =>
      this.confirmAction('Disable All Advanced Roles',
        'This will immediately disable all advanced roles (View Staff, Accounts, Payroll, IT Support, Budget Manager). Users with these roles will lose access until re-enabled.',
        () => this.disableAllRoles()
      )
    );

    document.getElementById('reset-flags')?.addEventListener('click', () =>
      this.confirmAction('Reset Feature Flags',
        'This will reset ALL feature flags to their default (disabled) state. This action cannot be undone.',
        () => this.resetFeatureFlags()
      )
    );

    // Export log
    document.getElementById('export-log')?.addEventListener('click', () =>
      this.exportActivityLog()
    );

    // Modal controls
    document.getElementById('modal-cancel')?.addEventListener('click', () =>
      this.hideModal()
    );
  }

  /**
   * Handle feature toggle change
   */
  async handleFeatureToggle(event) {
    const featureKey = event.target.dataset.featureKey;
    const isEnabled = event.target.checked;

    // Show confirmation for disabling features
    if (!isEnabled) {
      event.target.checked = true; // Revert temporarily
      this.confirmAction(
        `Disable ${this.getFeatureName(featureKey)}?`,
        this.getDisableWarning(featureKey),
        async () => {
          event.target.checked = false;
          await this.updateFeatureFlag(featureKey, false);
        }
      );
      return;
    }

    // Enable without confirmation
    await this.updateFeatureFlag(featureKey, true);
  }

  /**
   * Update feature flag in database
   */
  async updateFeatureFlag(featureKey, isEnabled) {
    const { data: { user } } = await supabase.auth.getUser();

    // Update feature flag
    const { error: updateError } = await supabase
      .from('system_feature_flags')
      .update({
        is_enabled: isEnabled,
        enabled_by: isEnabled ? user.id : null
      })
      .eq('feature_key', featureKey);

    if (updateError) {
      console.error('Error updating feature flag:', updateError);
      this.showToast('Failed to update feature flag', 'error');
      return;
    }

    // Log the action
    await this.logFeatureChange(featureKey, isEnabled);

    // Reload and update UI
    await this.loadFeatureFlags();
    await this.loadActivityLog();
    this.updateSystemStatus();

    this.showToast(
      `${this.getFeatureName(featureKey)} ${isEnabled ? 'enabled' : 'disabled'} successfully`,
      'success'
    );
  }

  /**
   * Log feature flag change
   */
  async logFeatureChange(featureKey, isEnabled) {
    const { data: { user } } = await supabase.auth.getUser();
    const flag = this.featureFlags.find(f => f.feature_key === featureKey);

    await supabase.from('admin_actions').insert({
      admin_id: user.id,
      action_type: 'feature_flag_update',
      target_type: 'system_configuration',
      target_id: flag.id,
      details: {
        feature_key: featureKey,
        feature_name: flag.feature_name,
        action: isEnabled ? 'enabled' : 'disabled',
        new_status: isEnabled ? 'enabled' : 'disabled',
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Disable all advanced roles
   */
  async disableAllRoles() {
    const roleKeys = this.featureFlags
      .filter(f => f.feature_key.startsWith('role_') && f.feature_key !== 'role_student' && f.feature_key !== 'role_general_admin')
      .map(f => f.feature_key);

    for (const key of roleKeys) {
      await this.updateFeatureFlag(key, false);
    }

    this.showToast('All advanced roles disabled', 'success');
    this.hideModal();
  }

  /**
   * Reset all feature flags to default (disabled)
   */
  async resetFeatureFlags() {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('system_feature_flags')
      .update({
        is_enabled: false,
        enabled_by: null
      })
      .neq('feature_key', ''); // Update all

    if (error) {
      console.error('Error resetting flags:', error);
      this.showToast('Failed to reset feature flags', 'error');
      return;
    }

    // Log the reset action
    await supabase.from('admin_actions').insert({
      admin_id: user.id,
      action_type: 'feature_flag_update',
      target_type: 'system_configuration',
      target_id: null,
      details: {
        action: 'reset_all_flags',
        timestamp: new Date().toISOString()
      }
    });

    await this.loadFeatureFlags();
    await this.loadActivityLog();
    this.updateSystemStatus();
    this.showToast('All feature flags reset to default', 'success');
    this.hideModal();
  }

  /**
   * Export activity log as CSV
   */
  exportActivityLog() {
    const csv = [
      ['Timestamp', 'Admin', 'Action', 'Feature/Role', 'Status'],
      ...this.activityLog.map(log => {
        const details = log.details || {};
        return [
          new Date(log.created_at).toISOString(),
          log.users?.full_name || 'Unknown',
          details.action || 'Update',
          details.feature_name || details.feature_key || 'Unknown',
          details.new_status || '—'
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feature-flag-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    this.showToast('Activity log exported', 'success');
  }

  /**
   * Show confirmation modal
   */
  confirmAction(title, message, onConfirm) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    document.getElementById('confirmation-modal').style.display = 'flex';

    const confirmBtn = document.getElementById('modal-confirm');
    confirmBtn.onclick = async () => {
      await onConfirm();
      this.hideModal();
    };
  }

  /**
   * Hide confirmation modal
   */
  hideModal() {
    document.getElementById('confirmation-modal').style.display = 'none';
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Helper: Get human-readable feature name
   */
  getFeatureName(featureKey) {
    const flag = this.featureFlags.find(f => f.feature_key === featureKey);
    return flag?.feature_name || featureKey;
  }

  /**
   * Helper: Get disable warning message
   */
  getDisableWarning(featureKey) {
    const userCount = this.userCounts[featureKey.replace('role_', '')] || 0;

    if (featureKey.startsWith('role_')) {
      return `${userCount} user(s) currently have this role. They will lose access immediately and will not be able to log in with this role until it is re-enabled.`;
    }

    return 'Disabling this module will affect all related functionality. Dependent roles will lose access to associated features.';
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  new MasterAdminConfig();
});
