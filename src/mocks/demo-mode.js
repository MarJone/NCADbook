import { demoUsers, demoEquipment, demoSpaces, demoBookings, demoSpaceBookings, demoFeatureFlags } from './demo-data.js';

const STORAGE_KEY = 'ncadbook_demo_data';

class DemoMode {
  constructor() {
    this.initializeStorage();
  }

  initializeStorage() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      const initialData = {
        users: demoUsers,
        equipment: demoEquipment,
        spaces: demoSpaces,
        bookings: demoBookings,
        spaceBookings: demoSpaceBookings,
        featureFlags: demoFeatureFlags,
        currentUser: null
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    }
  }

  getData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  setData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async query(collection, filter = {}) {
    await this.simulateDelay();
    const data = this.getData();
    let results = data[collection] || [];
    
    Object.keys(filter).forEach(key => {
      results = results.filter(item => item[key] === filter[key]);
    });
    
    return results;
  }

  async findOne(collection, filter) {
    const results = await this.query(collection, filter);
    return results[0] || null;
  }

  async insert(collection, item) {
    await this.simulateDelay();
    const data = this.getData();
    if (!data[collection]) data[collection] = [];
    data[collection].push(item);
    this.setData(data);
    return item;
  }

  async update(collection, filter, updates) {
    await this.simulateDelay();
    const data = this.getData();
    let updated = 0;
    
    data[collection] = data[collection].map(item => {
      const matches = Object.keys(filter).every(key => item[key] === filter[key]);
      if (matches) {
        updated++;
        return { ...item, ...updates };
      }
      return item;
    });
    
    this.setData(data);
    return updated;
  }

  async delete(collection, filter) {
    await this.simulateDelay();
    const data = this.getData();
    const originalLength = data[collection].length;
    
    data[collection] = data[collection].filter(item => {
      return !Object.keys(filter).every(key => item[key] === filter[key]);
    });
    
    this.setData(data);
    return originalLength - data[collection].length;
  }

  setCurrentUser(user) {
    const data = this.getData();
    data.currentUser = user;
    this.setData(data);
  }

  getCurrentUser() {
    const data = this.getData();
    return data.currentUser;
  }

  clearCurrentUser() {
    const data = this.getData();
    data.currentUser = null;
    this.setData(data);
  }

  simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  }

  reset() {
    localStorage.removeItem(STORAGE_KEY);
    this.initializeStorage();
  }
}

export const demoMode = new DemoMode();
