// Hybrid Smart Band - Uses real Bluetooth data when available, falls back to simulation

import { smartBand } from './smartBandSimulator';
import { bluetoothManager, BluetoothSmartBandData } from './bluetoothManager';

export type DataSource = 'simulation' | 'bluetooth';

interface HybridSmartBandState {
  dataSource: DataSource;
  bluetoothDevice: string | null;
  isConnecting: boolean;
}

class HybridSmartBand {
  private state: HybridSmartBandState = {
    dataSource: 'simulation',
    bluetoothDevice: null,
    isConnecting: false,
  };
  
  private hasInitialConnection = false;

  private bluetoothData: Partial<BluetoothSmartBandData> = {};
  private stateListeners: Array<(state: HybridSmartBandState) => void> = [];
  private dataListeners: Array<(data: ReturnType<typeof this.getCurrentData>) => void> = [];

  constructor() {
    // Subscribe to Bluetooth data
    bluetoothManager.subscribe((data) => {
      this.handleBluetoothData(data);
    });
  }

  /**
   * Get current data - from Bluetooth if available, otherwise simulation
   */
  getCurrentData() {
    const simulatedData = smartBand.getCurrentData();

    if (this.state.dataSource === 'bluetooth' && bluetoothManager.isConnected()) {
      // Merge Bluetooth data with simulated data (Bluetooth takes priority)
      return {
        ...simulatedData,
        heartRate: this.bluetoothData.heartRate ?? simulatedData.heartRate,
        bloodOxygen: this.bluetoothData.bloodOxygen ?? simulatedData.bloodOxygen,
        batteryLevel: this.bluetoothData.battery ?? simulatedData.batteryLevel,
        steps: this.bluetoothData.steps ?? simulatedData.steps,
        isConnected: true,
        timestamp: this.bluetoothData.timestamp ?? simulatedData.timestamp,
      };
    }

    // Return data only if we have initial connection
    return this.hasInitialConnection ? simulatedData : { ...simulatedData, isConnected: false };
  }

  /**
   * Connect to a real Bluetooth smart band
   */
  async connectBluetoothDevice(): Promise<{ success: boolean; deviceName?: string; error?: string }> {
    this.state.isConnecting = true;
    this.notifyStateListeners();

    try {
      const deviceInfo = await bluetoothManager.connectDevice();
      
      this.state.dataSource = 'bluetooth';
      this.state.bluetoothDevice = deviceInfo.name;
      this.state.isConnecting = false;
      this.hasInitialConnection = true;
      
      // Stop simulation when using real device
      smartBand.stopSimulation();
      
      this.notifyStateListeners();
      this.notifyDataListeners(); // Notify immediately with new data

      return {
        success: true,
        deviceName: deviceInfo.name,
      };
    } catch (error) {
      this.state.isConnecting = false;
      this.notifyStateListeners();

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to device',
      };
    }
  }

  /**
   * Disconnect Bluetooth device and switch back to simulation
   */
  async disconnectBluetoothDevice() {
    await bluetoothManager.disconnect();
    
    this.state.dataSource = 'simulation';
    this.state.bluetoothDevice = null;
    this.bluetoothData = {};
    
    // Resume simulation
    smartBand.startSimulation();
    
    this.notifyStateListeners();
  }

  /**
   * Handle incoming Bluetooth data
   */
  private handleBluetoothData(data: BluetoothSmartBandData) {
    // Update stored Bluetooth data
    if (data.heartRate !== undefined) {
      this.bluetoothData.heartRate = data.heartRate;
    }
    if (data.bloodOxygen !== undefined) {
      this.bluetoothData.bloodOxygen = data.bloodOxygen;
    }
    if (data.battery !== undefined) {
      this.bluetoothData.battery = data.battery;
    }
    if (data.steps !== undefined) {
      this.bluetoothData.steps = data.steps;
    }
    this.bluetoothData.timestamp = data.timestamp;

    console.log('Received Bluetooth data:', data);
    
    // Notify data listeners about the update
    this.notifyDataListeners();
  }
  
  /**
   * Notify data listeners
   */
  private notifyDataListeners() {
    const currentData = this.getCurrentData();
    this.dataListeners.forEach(listener => listener(currentData));
  }

  /**
   * Get current state
   */
  getState(): HybridSmartBandState {
    return { ...this.state };
  }

  /**
   * Check if using real Bluetooth device
   */
  isUsingBluetooth(): boolean {
    return this.state.dataSource === 'bluetooth' && bluetoothManager.isConnected();
  }

  /**
   * Subscribe to state changes
   */
  subscribeToState(callback: (state: HybridSmartBandState) => void) {
    this.stateListeners.push(callback);
    // Immediately notify with current state
    callback(this.getState());
    
    return () => {
      this.stateListeners = this.stateListeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Notify state listeners
   */
  private notifyStateListeners() {
    const state = this.getState();
    this.stateListeners.forEach(listener => listener(state));
  }

  /**
   * Get Bluetooth device info
   */
  getBluetoothDeviceInfo() {
    return bluetoothManager.getDeviceInfo();
  }

  /**
   * Start simulation (when not using Bluetooth)
   */
  startSimulation() {
    if (this.state.dataSource === 'simulation') {
      this.hasInitialConnection = true;
      smartBand.startSimulation();
      this.notifyDataListeners(); // Notify immediately with initial data
    }
  }

  /**
   * Stop simulation
   */
  stopSimulation() {
    smartBand.stopSimulation();
  }

  /**
   * Subscribe to data updates (works for both sources)
   */
  subscribe(callback: (data: ReturnType<typeof this.getCurrentData>) => void) {
    // Add to our own listeners for Bluetooth data
    this.dataListeners.push(callback);
    
    // Also subscribe to simulation updates
    const unsubscribeSimulation = smartBand.subscribe(() => {
      // When simulation updates, notify with current data (which may include Bluetooth)
      if (this.state.dataSource === 'simulation') {
        callback(this.getCurrentData());
      }
    });
    
    // Return combined unsubscribe function
    return () => {
      this.dataListeners = this.dataListeners.filter(listener => listener !== callback);
      unsubscribeSimulation();
    };
  }

  /**
   * Get historical data (always from simulation/storage)
   */
  getHistoricalData(days: number = 7) {
    return smartBand.getHistoricalDataFromArchive(days);
  }

  /**
   * Get progress
   */
  getProgress() {
    return smartBand.getProgress();
  }
}

// Singleton instance
export const hybridSmartBand = new HybridSmartBand();
