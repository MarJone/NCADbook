// Kit storage utilities for both user-created and admin-created kits

export const kitStorage = {
  // User custom kits (stored per user)
  getUserKits(userId) {
    const kits = localStorage.getItem(`user_kits_${userId}`);
    return kits ? JSON.parse(kits) : [];
  },

  saveUserKit(userId, kit) {
    const kits = this.getUserKits(userId);
    const newKit = {
      id: Date.now().toString(),
      name: kit.name,
      equipment_ids: kit.equipment_ids,
      created_at: new Date().toISOString(),
      type: 'user'
    };
    kits.push(newKit);
    localStorage.setItem(`user_kits_${userId}`, JSON.stringify(kits));
    return newKit;
  },

  deleteUserKit(userId, kitId) {
    const kits = this.getUserKits(userId);
    const filtered = kits.filter(k => k.id !== kitId);
    localStorage.setItem(`user_kits_${userId}`, JSON.stringify(filtered));
  },

  updateUserKit(userId, kitId, updates) {
    const kits = this.getUserKits(userId);
    const updated = kits.map(k =>
      k.id === kitId ? { ...k, ...updates, updated_at: new Date().toISOString() } : k
    );
    localStorage.setItem(`user_kits_${userId}`, JSON.stringify(updated));
  },

  // Admin preset kits (available to all users)
  getAdminKits() {
    const kits = localStorage.getItem('admin_kits');
    return kits ? JSON.parse(kits) : [];
  },

  saveAdminKit(kit) {
    const kits = this.getAdminKits();
    const newKit = {
      id: Date.now().toString(),
      name: kit.name,
      description: kit.description,
      equipment_ids: kit.equipment_ids,
      department: kit.department || 'all',
      created_at: new Date().toISOString(),
      type: 'admin'
    };
    kits.push(newKit);
    localStorage.setItem('admin_kits', JSON.stringify(kits));
    return newKit;
  },

  deleteAdminKit(kitId) {
    const kits = this.getAdminKits();
    const filtered = kits.filter(k => k.id !== kitId);
    localStorage.setItem('admin_kits', JSON.stringify(filtered));
  },

  updateAdminKit(kitId, updates) {
    const kits = this.getAdminKits();
    const updated = kits.map(k =>
      k.id === kitId ? { ...k, ...updates, updated_at: new Date().toISOString() } : k
    );
    localStorage.setItem('admin_kits', JSON.stringify(updated));
  },

  // Get all kits for a user (their custom kits + admin kits)
  getAllKitsForUser(userId, userDepartment) {
    const userKits = this.getUserKits(userId);
    const adminKits = this.getAdminKits().filter(
      kit => kit.department === 'all' || kit.department === userDepartment
    );
    return [...userKits, ...adminKits];
  }
};
