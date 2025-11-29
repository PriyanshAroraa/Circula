import { Task } from '../types';

const STORAGE_KEYS = {
  TASKS: 'circula_tasks',
  APP_STATE: 'circula_app_state'
} as const;

export const storage = {
  // Tasks persistence
  getTasks(): Task[] {
    try {
      // Check if localStorage is available
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage is not available');
        return [];
      }

      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!stored) return [];

      const tasks = JSON.parse(stored);

      // Validate task structure and handle corrupted data
      if (!Array.isArray(tasks)) {
        console.warn('Stored tasks data is not an array, resetting');
        this.saveTasks([]);
        return [];
      }

      const validTasks = tasks.filter((task: any) =>
        task &&
        typeof task === 'object' &&
        task.id &&
        task.title &&
        typeof task.startTime === 'number' &&
        typeof task.endTime === 'number'
      );

      // If some tasks were invalid, save the cleaned data
      if (validTasks.length !== tasks.length) {
        console.warn(`Filtered out ${tasks.length - validTasks.length} invalid tasks`);
        this.saveTasks(validTasks);
      }

      return validTasks;
    } catch (error) {
      console.error('Failed to load tasks from storage:', error);
      // Try to clear corrupted data
      try {
        localStorage.removeItem(STORAGE_KEYS.TASKS);
      } catch (clearError) {
        console.error('Failed to clear corrupted storage:', clearError);
      }
      return [];
    }
  },

  saveTasks(tasks: Task[]): void {
    try {
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage is not available');
        return;
      }

      // Check storage quota (rough estimate: 5MB limit)
      const dataSize = JSON.stringify(tasks).length;
      if (dataSize > 4 * 1024 * 1024) { // 4MB limit
        console.error('Task data too large for localStorage');
        throw new Error('Task data exceeds storage limit');
      }

      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks to storage:', error);
      // Could implement fallback to sessionStorage or show user warning
    }
  },

  // App state persistence
  getAppState(): Partial<{ view: string; activeFocusTaskId: string }> {
    try {
      if (typeof localStorage === 'undefined') {
        return {};
      }

      const stored = localStorage.getItem(STORAGE_KEYS.APP_STATE);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load app state from storage:', error);
      return {};
    }
  },

  saveAppState(state: { view?: string; activeFocusTaskId?: string }): void {
    try {
      if (typeof localStorage === 'undefined') {
        return;
      }

      const currentState = this.getAppState();
      const newState = { ...currentState, ...state };
      localStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to save app state to storage:', error);
    }
  },

  // Clear all data
  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.TASKS);
      localStorage.removeItem(STORAGE_KEYS.APP_STATE);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  },

  // Export data for backup
  exportData(): string {
    try {
      const data = {
        tasks: this.getTasks(),
        appState: this.getAppState(),
        exportDate: new Date().toISOString()
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return '{}';
    }
  },

  // Import data from backup
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.tasks && Array.isArray(data.tasks)) {
        this.saveTasks(data.tasks);
      }
      if (data.appState && typeof data.appState === 'object') {
        this.saveAppState(data.appState);
      }
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
};
