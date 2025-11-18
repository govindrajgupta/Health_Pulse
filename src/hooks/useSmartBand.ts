import { useState, useEffect } from 'react';
import { SmartBandData, smartBand } from '../lib/smartBandSimulator';
import { hybridSmartBand } from '../lib/hybridSmartBand';

export function useSmartBand() {
  const [data, setData] = useState<SmartBandData>(hybridSmartBand.getCurrentData());
  const [isSimulating, setIsSimulating] = useState(false);
  const [dataSource, setDataSource] = useState<'simulation' | 'bluetooth'>('simulation');

  useEffect(() => {
    // Subscribe to real-time updates (works for both simulation and Bluetooth)
    const unsubscribe = hybridSmartBand.subscribe((newData) => {
      setData(newData);
    });

    // Subscribe to state changes (to know if using Bluetooth)
    const unsubscribeState = hybridSmartBand.subscribeToState((state) => {
      setDataSource(state.dataSource);
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
    dataSource,
    startSimulation,
    stopSimulation,
    toggleConnection,
    getHistoricalData,
    getTodayHourlyData,
    getProgress,
    resetDailyStats,
    isUsingBluetooth,
  };
}
