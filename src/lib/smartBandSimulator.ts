// Smart Band Simulator - Simulates real-time data from a wearable device

export interface SmartBandData {
  heartRate: number;
  bloodOxygen: number;
  steps: number;
  caloriesBurned: number;
  distance: number; // in km
  activeMinutes: number;
  sleepData: {
    deepSleep: number; // minutes
    lightSleep: number; // minutes
    remSleep: number; // minutes
    awake: number; // minutes
    totalSleep: number; // minutes
    sleepQuality: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  };
  temperature: number; // body temperature in Celsius
  stressLevel: number; // 0-100
  timestamp: Date;
  batteryLevel: number; // 0-100
  isConnected: boolean;
}

export interface HistoricalData {
  date: string;
  steps: number;
  calories: number;
  heartRate: number;
  sleep: number;
  distance: number;
}

class SmartBandSimulator {
  private currentData: SmartBandData;
  private listeners: Array<(data: SmartBandData) => void> = [];
  private intervalId: NodeJS.Timeout | null = null;
  private dailyStepGoal = 10000;
  private dailyCalorieGoal = 2000;

  constructor() {
    this.currentData = this.generateInitialData();
  }

  private generateInitialData(): SmartBandData {
    return {
      heartRate: this.getRandomInt(60, 80),
      bloodOxygen: this.getRandomInt(95, 99),
      steps: this.getRandomInt(0, 5000),
      caloriesBurned: this.getRandomInt(0, 1500),
      distance: parseFloat((this.getRandomInt(0, 5000) * 0.0008).toFixed(2)),
      activeMinutes: this.getRandomInt(0, 120),
      sleepData: {
        deepSleep: this.getRandomInt(60, 120),
        lightSleep: this.getRandomInt(120, 240),
        remSleep: this.getRandomInt(60, 90),
        awake: this.getRandomInt(10, 30),
        totalSleep: 0,
        sleepQuality: this.calculateSleepQuality(
          this.getRandomInt(60, 120),
          this.getRandomInt(120, 240),
          this.getRandomInt(60, 90),
          this.getRandomInt(10, 30)
        ),
      },
      temperature: parseFloat((36.5 + Math.random() * 0.5).toFixed(1)),
      stressLevel: this.getRandomInt(20, 50),
      timestamp: new Date(),
      batteryLevel: this.getRandomInt(70, 100),
      isConnected: false, // Start disconnected
    };
  }

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private calculateSleepQuality(deepSleep: number, lightSleep: number, remSleep: number, awake: number): 'Poor' | 'Fair' | 'Good' | 'Excellent' {
    const total = deepSleep + lightSleep + remSleep;
    const deepPercentage = (deepSleep / total) * 100;
    const awakePercentage = (awake / total) * 100;

    if (total < 360 || awakePercentage > 15) return 'Poor';
    if (total < 420 || deepPercentage < 15) return 'Fair';
    if (deepPercentage > 25 && total > 420) return 'Excellent';
    return 'Good';
  }

  // Start simulating real-time data updates (like actual hardware)
  startSimulation(updateInterval: number = 2000) {
    if (this.intervalId) {
      return; // Already running
    }

    this.intervalId = setInterval(() => {
      this.updateData();
      this.notifyListeners();
    }, updateInterval);
  }

  stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private updateData() {
    // Simulate realistic changes in sensor data
    const now = new Date().getHours();
    const isActiveTime = now >= 6 && now <= 22; // Active between 6 AM and 10 PM

    // Heart rate varies based on activity
    if (isActiveTime && Math.random() > 0.7) {
      // Simulate activity - higher heart rate
      this.currentData.heartRate = this.getRandomInt(80, 140);
      this.currentData.steps += this.getRandomInt(10, 50);
      this.currentData.caloriesBurned += this.getRandomInt(5, 15);
      this.currentData.activeMinutes += 1;
    } else {
      // Resting heart rate
      this.currentData.heartRate = this.getRandomInt(60, 85);
      this.currentData.steps += this.getRandomInt(0, 5);
      this.currentData.caloriesBurned += this.getRandomInt(1, 3);
    }

    // Update distance based on steps (average stride ~0.8m)
    this.currentData.distance = parseFloat((this.currentData.steps * 0.0008).toFixed(2));

    // Blood oxygen stays relatively stable
    this.currentData.bloodOxygen = this.getRandomInt(95, 99);

    // Body temperature varies slightly
    this.currentData.temperature = parseFloat((36.5 + Math.random() * 0.5).toFixed(1));

    // Stress level changes gradually
    const stressChange = Math.random() > 0.5 ? 1 : -1;
    this.currentData.stressLevel = Math.max(0, Math.min(100, this.currentData.stressLevel + stressChange));

    // Battery drains slowly
    if (Math.random() > 0.95) {
      this.currentData.batteryLevel = Math.max(0, this.currentData.batteryLevel - 1);
    }

    // Update timestamp
    this.currentData.timestamp = new Date();

    // Store to localStorage for persistence
    this.saveToStorage();
  }

  private saveToStorage() {
    localStorage.setItem('smartband_current_data', JSON.stringify(this.currentData));
  }

  private loadFromStorage() {
    const stored = localStorage.getItem('smartband_current_data');
    if (stored) {
      this.currentData = JSON.parse(stored);
      this.currentData.timestamp = new Date(this.currentData.timestamp);
    }
  }

  // Subscribe to data updates
  subscribe(callback: (data: SmartBandData) => void) {
    this.listeners.push(callback);
    // Immediately send current data
    callback(this.currentData);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.currentData }));
  }

  // Get current data snapshot
  getCurrentData(): SmartBandData {
    this.loadFromStorage();
    return { ...this.currentData };
  }

  // Reset daily stats (call at midnight)
  resetDailyStats() {
    // Archive today's data before reset
    this.archiveDailyData();
    
    this.currentData.steps = 0;
    this.currentData.caloriesBurned = 0;
    this.currentData.distance = 0;
    this.currentData.activeMinutes = 0;
    this.saveToStorage();
  }

  // Generate historical data for charts (last 7 days)
  generateHistoricalData(days: number = 7): HistoricalData[] {
    const history: HistoricalData[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      history.push({
        date: date.toISOString().split('T')[0],
        steps: this.getRandomInt(5000, 12000),
        calories: this.getRandomInt(1500, 2500),
        heartRate: this.getRandomInt(65, 85),
        sleep: this.getRandomInt(360, 480), // minutes
        distance: parseFloat((this.getRandomInt(4, 10)).toFixed(1)),
      });
    }

    return history;
  }

  // Generate hourly data for today
  generateTodayHourlyData(): Array<{ hour: string; heartRate: number; steps: number; calories: number }> {
    const hourlyData = [];
    const currentHour = new Date().getHours();

    for (let i = 0; i <= currentHour; i++) {
      hourlyData.push({
        hour: `${i.toString().padStart(2, '0')}:00`,
        heartRate: this.getRandomInt(60, 120),
        steps: this.getRandomInt(100, 1000),
        calories: this.getRandomInt(50, 200),
      });
    }

    return hourlyData;
  }

  private archiveDailyData() {
    const archives = this.getArchivedData();
    const today = new Date().toISOString().split('T')[0];
    
    archives[today] = {
      date: today,
      steps: this.currentData.steps,
      calories: this.currentData.caloriesBurned,
      heartRate: this.currentData.heartRate,
      sleep: this.currentData.sleepData.totalSleep,
      distance: this.currentData.distance,
    };

    // Keep only last 30 days
    const keys = Object.keys(archives).sort().slice(-30);
    const trimmed: Record<string, HistoricalData> = {};
    keys.forEach(key => {
      trimmed[key] = archives[key];
    });

    localStorage.setItem('smartband_archives', JSON.stringify(trimmed));
  }

  private getArchivedData(): Record<string, HistoricalData> {
    const stored = localStorage.getItem('smartband_archives');
    return stored ? JSON.parse(stored) : {};
  }

  getHistoricalDataFromArchive(days: number = 7): HistoricalData[] {
    const archives = this.getArchivedData();
    const today = new Date();
    const result: HistoricalData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      if (archives[dateKey]) {
        result.push(archives[dateKey]);
      } else {
        // Generate mock data if no archive exists
        result.push({
          date: dateKey,
          steps: this.getRandomInt(5000, 12000),
          calories: this.getRandomInt(1500, 2500),
          heartRate: this.getRandomInt(65, 85),
          sleep: this.getRandomInt(360, 480),
          distance: parseFloat((this.getRandomInt(4, 10)).toFixed(1)),
        });
      }
    }

    return result;
  }

  // Simulate connection status
  toggleConnection() {
    this.currentData.isConnected = !this.currentData.isConnected;
    this.notifyListeners();
  }

  // Set goals
  setDailyGoals(steps: number, calories: number) {
    this.dailyStepGoal = steps;
    this.dailyCalorieGoal = calories;
  }

  getDailyGoals() {
    return {
      steps: this.dailyStepGoal,
      calories: this.dailyCalorieGoal,
    };
  }

  // Calculate progress percentages
  getProgress() {
    return {
      steps: Math.min(100, Math.round((this.currentData.steps / this.dailyStepGoal) * 100)),
      calories: Math.min(100, Math.round((this.currentData.caloriesBurned / this.dailyCalorieGoal) * 100)),
    };
  }
}

// Singleton instance
export const smartBand = new SmartBandSimulator();
