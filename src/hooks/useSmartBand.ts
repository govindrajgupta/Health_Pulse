import { useState, useEffect } from 'react';
import { SmartBandData, smartBand } from '../lib/smartBandSimulator';
import { hybridSmartBand } from '../lib/hybridSmartBand';
import { checkBluetoothCompatibility } from '../lib/bluetoothManager';

export function useSmartBand() {
  const [data, setData] = useState<SmartBandData>(hybridSmartBand.getCurrentData());
  const [isSimulating, setIsSimulating] = useState(false);
  const [dataSource, setDataSource] = useState<'simulation' | 'bluetooth'>('simulation');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to real-time updates (works for both simulation and Bluetooth)
    const unsubscribe = hybridSmartBand.subscribe((newData) => {
      setData(newData);
    });

    // Subscribe to state changes (to know if using Bluetooth)
    const unsubscribeState = hybridSmartBand.subscribeToState((state) => {
      setDataSource(state.dataSource);
      setIsConnecting(state.isConnecting);
    });

    return () => {
      unsubscribe();
      unsubscribeState();
    };
  }, []);

  const startSimulation = () => {
    hybridSmartBand.startSimulation(); // Update every 2 seconds
    setIsSimulating(true);
  };

  const stopSimulation = () => {
    hybridSmartBand.stopSimulation();
    setIsSimulating(false);
  };

  /**
   * Connect via Bluetooth — opens the browser's native Bluetooth device picker.
   * Returns success/failure so UI can react.
   */
  const connectBluetooth = async (): Promise<{ success: boolean; error?: string }> => {
    setConnectionError(null);
    setIsConnecting(true);

    const compat = checkBluetoothCompatibility();
    if (!compat.supported) {
      const msg = compat.message;
      setConnectionError(msg);
      setIsConnecting(false);
      return { success: false, error: msg };
    }

    const result = await hybridSmartBand.connectBluetoothDevice();
    setIsConnecting(false);

    if (result.success) {
      setConnectionError(null);
      return { success: true };
    } else {
      setConnectionError(result.error || 'Failed to connect');
      return { success: false, error: result.error };
    }
  };

  /**
   * Start Demo Mode — uses simulated sensor data without a real device.
   */
  const startDemoMode = () => {
    setConnectionError(null);
    hybridSmartBand.startSimulation();
    setIsSimulating(true);
  };

  /**
   * Disconnect from Bluetooth device.
   */
  const disconnectDevice = async () => {
    await hybridSmartBand.disconnectBluetoothDevice();
    setConnectionError(null);
  };

  // Legacy toggle — kept for backward compat but prefer the new methods
  const toggleConnection = () => {
    smartBand.toggleConnection();
  };

  const getHistoricalData = (days: number = 7) => {
    return hybridSmartBand.getHistoricalData(days);
  };

  const getTodayHourlyData = () => {
    return smartBand.generateTodayHourlyData();
  };

  const getProgress = () => {
    return hybridSmartBand.getProgress();
  };

  const resetDailyStats = () => {
    smartBand.resetDailyStats();
  };

  const isUsingBluetooth = () => {
    return hybridSmartBand.isUsingBluetooth();
  };

  return {
    data,
    isSimulating,
    isConnecting,
    connectionError,
    dataSource,
    startSimulation,
    stopSimulation,
    connectBluetooth,
    startDemoMode,
    disconnectDevice,
    toggleConnection,
    getHistoricalData,
    getTodayHourlyData,
    getProgress,
    resetDailyStats,
    isUsingBluetooth,
  };
}
