// Mock Backend - Replaces Supabase with localStorage

const STORAGE_KEYS = {
  USERS: 'health_app_users',
  CURRENT_USER: 'health_app_current_user',
  HEALTH_DATA: 'health_app_data',
};

export interface HealthProfile {
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
}

export interface HealthData {
  stress?: number[];
  calories?: number[];
  steps?: number[];
  sleep?: number[];
  heartRate?: number[];
  [key: string]: unknown;
}

export interface MockUser {
  id: string;
  email: string;
  password: string; // In real app, this would be hashed
  displayName: string;
  photoURL: string | null;
  createdAt: string;
  healthProfile: HealthProfile | null;
}

export interface AuthResponse {
  user: MockUser | null;
  error: Error | null;
}

class MockBackend {
  // Initialize with some demo data
  constructor() {
    this.initializeDemoData();
  }

  private initializeDemoData() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      const demoUser: MockUser = {
        id: 'demo-user-123',
        email: 'demo@health.app',
        password: 'demo123',
        displayName: 'Demo User',
        photoURL: null,
        createdAt: new Date().toISOString(),
        healthProfile: {
          age: 30,
          weight: 70,
          height: 175,
          gender: 'male',
        },
      };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([demoUser]));
    }
  }

  private getUsers(): MockUser[] {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  }

  private saveUsers(users: MockUser[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  private getCurrentUser(): MockUser | null {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  }

  private setCurrentUser(user: MockUser | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // Auth methods
  async signIn(email: string, password: string): Promise<AuthResponse> {
    await this.delay(500); // Simulate network delay

    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return {
        user: null,
        error: new Error('Invalid email or password'),
      };
    }

    this.setCurrentUser(user);
    return { user, error: null };
  }

  async signUp(email: string, password: string, displayName: string): Promise<AuthResponse> {
    await this.delay(500); // Simulate network delay

    const users = this.getUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return {
        user: null,
        error: new Error('User already exists with this email'),
      };
    }

    const newUser: MockUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email,
      password,
      displayName,
      photoURL: null,
      createdAt: new Date().toISOString(),
      healthProfile: null,
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser);

    return { user: newUser, error: null };
  }

  async signOut(): Promise<{ error: Error | null }> {
    await this.delay(300);
    this.setCurrentUser(null);
    return { error: null };
  }

  async getSession(): Promise<{ user: MockUser | null }> {
    await this.delay(200);
    return { user: this.getCurrentUser() };
  }

  async updateUser(updates: Partial<MockUser>): Promise<AuthResponse> {
    await this.delay(400);

    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return { user: null, error: new Error('No user logged in') };
    }

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
      return { user: null, error: new Error('User not found') };
    }

    const updatedUser = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUser;
    this.saveUsers(users);
    this.setCurrentUser(updatedUser);

    return { user: updatedUser, error: null };
  }

  // Subscribe to auth changes (simplified version)
  onAuthStateChange(callback: (user: MockUser | null) => void) {
    // Check for changes periodically
    const interval = setInterval(() => {
      const user = this.getCurrentUser();
      callback(user);
    }, 1000);

    return {
      unsubscribe: () => clearInterval(interval),
    };
  }

  // Helper method to simulate network delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health data methods (for future use)
  async saveHealthData(userId: string, data: HealthData): Promise<{ error: Error | null }> {
    await this.delay(300);
    
    const healthData = this.getAllHealthData();
    healthData[userId] = { ...healthData[userId], ...data };
    localStorage.setItem(STORAGE_KEYS.HEALTH_DATA, JSON.stringify(healthData));
    
    return { error: null };
  }

  async getHealthData(userId: string): Promise<{ data: HealthData | null; error: Error | null }> {
    await this.delay(300);
    
    const healthData = this.getAllHealthData();
    return { data: healthData[userId] || null, error: null };
  }

  private getAllHealthData(): Record<string, HealthData> {
    const data = localStorage.getItem(STORAGE_KEYS.HEALTH_DATA);
    return data ? JSON.parse(data) : {};
  }
}

export const mockBackend = new MockBackend();
