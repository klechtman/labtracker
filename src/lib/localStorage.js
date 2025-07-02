// localStorage utility for persisting app data
const STORAGE_KEY = 'labtracker_data';

export const localStorage = {
  // Save data to localStorage
  save: (data) => {
    try {
      const serializedData = JSON.stringify(data);
      window.localStorage.setItem(STORAGE_KEY, serializedData);
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  },

  // Load data from localStorage
  load: () => {
    try {
      const serializedData = window.localStorage.getItem(STORAGE_KEY);
      if (serializedData) {
        return JSON.parse(serializedData);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
    return null;
  },

  // Clear all stored data
  clear: () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}; 