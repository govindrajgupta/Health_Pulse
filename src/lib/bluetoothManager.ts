// Bluetooth Smart Band Integration
// Connects to real smart bands/watches via Web Bluetooth API

export interface BluetoothDeviceInfo {
  id: string;
  name: string;
  connected: boolean;
}

export interface BluetoothSmartBandData {
  heartRate?: number;
  bloodOxygen?: number;
  steps?: number;
  battery?: number;
  timestamp: Date;
}

class BluetoothSmartBandManager {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private characteristics: Map<string, BluetoothRemoteGATTCharacteristic> = new Map();
  private listeners: Array<(data: BluetoothSmartBandData) => void> = [];

  // Standard Bluetooth GATT Service UUIDs
  private readonly HEART_RATE_SERVICE = 0x180D;
  private readonly HEART_RATE_MEASUREMENT = 0x2A37;
  private readonly BATTERY_SERVICE = 0x180F;
  private readonly BATTERY_LEVEL = 0x2A19;
  
  // Pulse Oximeter Service (SpO2)
  private readonly PULSE_OXIMETER_SERVICE = 0x1822;
  private readonly PLX_CONTINUOUS_MEASUREMENT = 0x2A5F;
  private readonly PLX_SPOT_CHECK_MEASUREMENT = 0x2A5E;
  
  // Common smart band service UUIDs (varies by manufacturer)
  private readonly FITNESS_MACHINE_SERVICE = 0x1826;
  private readonly USER_DATA_SERVICE = 0x181C;
  
  // Data smoothing
  private heartRateHistory: number[] = [];
  private spo2History: number[] = [];
  private readonly HISTORY_SIZE = 5;

  /**
   * Check if Web Bluetooth is supported in the browser
   */
  isBluetoothSupported(): boolean {
    return 'bluetooth' in navigator;
  }

  /**
   * Request and connect to a smart band/watch
   */
  async connectDevice(): Promise<BluetoothDeviceInfo> {
    if (!this.isBluetoothSupported()) {
      throw new Error('Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera.');
    }

    try {
      console.log('Requesting Bluetooth Device...');
      
      // Request device with optional services
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [this.HEART_RATE_SERVICE] },
          { services: [this.BATTERY_SERVICE] },
          { namePrefix: 'Mi Band' }, // Xiaomi Mi Band
          { namePrefix: 'Amazfit' }, // Amazfit devices
          { namePrefix: 'Fitbit' }, // Fitbit devices
          { namePrefix: 'Galaxy' }, // Samsung Galaxy Watch
          { namePrefix: 'Apple Watch' }, // Apple Watch
          { namePrefix: 'Garmin' }, // Garmin devices
          { namePrefix: 'Firebolt' }, // Firebolt devices
          { namePrefix: 'Fire-Bolt' }, // Firebolt (alternate naming)
          { namePrefix: 'FireBoltt' }, // FireBoltt (alternative spelling)
          { namePrefix: 'Cobalt' }, // Cobalt devices
          { namePrefix: 'Noise' }, // Noise smart watches
          { namePrefix: 'boAt' }, // boAt smart watches
          { namePrefix: 'Fire' }, // Generic Fire- branded devices
        ],
        optionalServices: [
          this.HEART_RATE_SERVICE,
          this.BATTERY_SERVICE,
          this.PULSE_OXIMETER_SERVICE,
          this.FITNESS_MACHINE_SERVICE,
          this.USER_DATA_SERVICE,
          'generic_access',
          'device_information',
        ]
      });

      console.log('Device selected:', this.device.name);

      // Connect to GATT Server
      this.server = await this.device.gatt!.connect();
      console.log('Connected to GATT Server');

      // Listen for disconnection
      this.device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));

      // Start monitoring available services
      await this.setupServices();

      return {
        id: this.device.id,
        name: this.device.name || 'Unknown Device',
        connected: true,
      };
    } catch (error) {
      console.error('Bluetooth connection error:', error);
      throw error;
    }
  }

  /**
   * Setup available services and start monitoring
   */
  private async setupServices() {
    if (!this.server) return;

    try {
      // Setup Heart Rate monitoring
      await this.setupHeartRateMonitoring();
    } catch (error) {
      console.log('Heart Rate service not available:', error);
    }

    try {
      // Setup Battery monitoring
      await this.setupBatteryMonitoring();
    } catch (error) {
      console.log('Battery service not available:', error);
    }

    try {
      // Setup SpO2 monitoring
      await this.setupSpO2Monitoring();
    } catch (error) {
      console.log('SpO2 service not available:', error);
    }

    // Periodic battery check
    setInterval(() => this.updateBatteryLevel(), 30000); // Every 30 seconds
  }

  /**
   * Setup Heart Rate monitoring
   */
  private async setupHeartRateMonitoring() {
    if (!this.server) return;

    const service = await this.server.getPrimaryService(this.HEART_RATE_SERVICE);
    const characteristic = await service.getCharacteristic(this.HEART_RATE_MEASUREMENT);
    
    this.characteristics.set('heartRate', characteristic);

    // Start notifications
    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', this.handleHeartRateChange.bind(this));
    
    console.log('Heart Rate monitoring started');
  }

  /**
   * Handle Heart Rate data
   */
  private handleHeartRateChange(event: Event) {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;
    
    if (value) {
      const rawHeartRate = value.getUint8(1); // Standard Heart Rate Measurement format
      
      // Apply smoothing to reduce noise
      this.heartRateHistory.push(rawHeartRate);
      if (this.heartRateHistory.length > this.HISTORY_SIZE) {
        this.heartRateHistory.shift();
      }
      
      const smoothedHeartRate = Math.round(
        this.heartRateHistory.reduce((a, b) => a + b, 0) / this.heartRateHistory.length
      );
      
      console.log('Heart Rate:', smoothedHeartRate, 'BPM (raw:', rawHeartRate, ')');
      
      this.notifyListeners({
        heartRate: smoothedHeartRate,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Setup Battery monitoring
   */
  private async setupBatteryMonitoring() {
    if (!this.server) return;

    const service = await this.server.getPrimaryService(this.BATTERY_SERVICE);
    const characteristic = await service.getCharacteristic(this.BATTERY_LEVEL);
    
    this.characteristics.set('battery', characteristic);

    // Start notifications
    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', this.handleBatteryChange.bind(this));
    
    console.log('Battery monitoring started');
  }

  /**
   * Handle Battery data
   */
  private handleBatteryChange(event: Event) {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;
    
    if (value) {
      const battery = value.getUint8(0); // Battery level percentage
      console.log('Battery Level:', battery, '%');
      
      this.notifyListeners({
        battery,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Setup SpO2 (Pulse Oximeter) monitoring
   */
  private async setupSpO2Monitoring() {
    if (!this.server) return;

    const service = await this.server.getPrimaryService(this.PULSE_OXIMETER_SERVICE);
    
    // Try continuous measurement first
    try {
      const characteristic = await service.getCharacteristic(this.PLX_CONTINUOUS_MEASUREMENT);
      this.characteristics.set('spo2', characteristic);
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', this.handleSpO2Change.bind(this));
      console.log('SpO2 continuous monitoring started');
      return;
    } catch {
      // Fall back to spot check
      const characteristic = await service.getCharacteristic(this.PLX_SPOT_CHECK_MEASUREMENT);
      this.characteristics.set('spo2', characteristic);
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', this.handleSpO2Change.bind(this));
      console.log('SpO2 spot-check monitoring started');
    }
  }

  /**
   * Handle SpO2 data
   */
  private handleSpO2Change(event: Event) {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;
    
    if (value && value.byteLength >= 3) {
      // PLX Continuous/Spot-Check Measurement format
      // Byte 0: flags, Bytes 1-2: SpO2 value
      const spo2 = value.getUint16(1, true); // SpO2 value
      
      // Apply smoothing and normalize to valid range
      const normalizedSpO2 = Math.min(100, Math.max(85, spo2));
      this.spo2History.push(normalizedSpO2);
      if (this.spo2History.length > this.HISTORY_SIZE) {
        this.spo2History.shift();
      }
      
      const smoothedSpO2 = Math.round(
        this.spo2History.reduce((a, b) => a + b, 0) / this.spo2History.length
      );
      
      console.log('SpO2:', smoothedSpO2, '% (raw:', spo2, ')');
      
      this.notifyListeners({
        bloodOxygen: smoothedSpO2,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Periodic battery update
   */
  private async updateBatteryLevel() {
    if (!this.isConnected()) return;
    
    const battery = await this.readBatteryLevel();
    if (battery !== null) {
      this.notifyListeners({
        battery,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Read current battery level
   */
  async readBatteryLevel(): Promise<number | null> {
    const characteristic = this.characteristics.get('battery');
    if (!characteristic) return null;

    try {
      const value = await characteristic.readValue();
      return value.getUint8(0);
    } catch (error) {
      console.error('Failed to read battery:', error);
      return null;
    }
  }

  /**
   * Disconnect from device
   */
  async disconnect() {
    if (this.device && this.device.gatt?.connected) {
      this.device.gatt.disconnect();
      console.log('Disconnected from device');
    }
    this.device = null;
    this.server = null;
    this.characteristics.clear();
  }

  /**
   * Handle disconnection event
   */
  private onDisconnected(event: Event) {
    console.log('Device disconnected:', event);
    this.server = null;
    this.characteristics.clear();
    
    // Notify listeners about disconnection
    this.notifyListeners({
      timestamp: new Date(),
    });
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.device?.gatt?.connected || false;
  }

  /**
   * Get connected device info
   */
  getDeviceInfo(): BluetoothDeviceInfo | null {
    if (!this.device) return null;
    
    return {
      id: this.device.id,
      name: this.device.name || 'Unknown Device',
      connected: this.isConnected(),
    };
  }

  /**
   * Subscribe to data updates
   */
  subscribe(callback: (data: BluetoothSmartBandData) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(data: BluetoothSmartBandData) {
    this.listeners.forEach(listener => listener(data));
  }

  /**
   * Get list of available services on connected device
   */
  async getAvailableServices(): Promise<string[]> {
    if (!this.server) return [];

    try {
      const services = await this.server.getPrimaryServices();
      return services.map((service: BluetoothRemoteGATTService) => service.uuid);
    } catch (error) {
      console.error('Failed to get services:', error);
      return [];
    }
  }
}

// Singleton instance
export const bluetoothManager = new BluetoothSmartBandManager();

// Helper function to check browser compatibility
export function checkBluetoothCompatibility(): {
  supported: boolean;
  message: string;
} {
  if (!('bluetooth' in navigator)) {
    return {
      supported: false,
      message: 'Web Bluetooth is not supported. Please use Chrome, Edge, or Opera browser on desktop or Android.',
    };
  }

  // Check if HTTPS (required for Web Bluetooth)
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    return {
      supported: false,
      message: 'Web Bluetooth requires HTTPS. Please use a secure connection.',
    };
  }

  return {
    supported: true,
    message: 'Web Bluetooth is supported! You can connect your smart band.',
  };
}
