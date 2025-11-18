import React, { useState, useEffect } from 'react';
import { Bluetooth, BluetoothOff, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { checkBluetoothCompatibility } from '../../lib/bluetoothManager';
import { hybridSmartBand } from '../../lib/hybridSmartBand';

const BluetoothConnect: React.FC = () => {
  const [compatibility] = useState(checkBluetoothCompatibility());
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState<{
    dataSource: 'simulation' | 'bluetooth';
    bluetoothDevice: string | null;
  }>({
    dataSource: 'simulation',
    bluetoothDevice: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = hybridSmartBand.subscribeToState((state) => {
      setConnectionState({
        dataSource: state.dataSource,
        bluetoothDevice: state.bluetoothDevice,
      });
      setIsConnecting(state.isConnecting);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleConnect = async () => {
    setError(null);
    setIsConnecting(true);

    const result = await hybridSmartBand.connectBluetoothDevice();

    if (result.success) {
      setError(null);
      console.log('Connected to:', result.deviceName);
    } else {
      setError(result.error || 'Failed to connect');
    }
  };

  const handleDisconnect = async () => {
    await hybridSmartBand.disconnectBluetoothDevice();
    setError(null);
  };

  if (!compatibility.supported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">Bluetooth Not Supported</h3>
            <p className="text-sm text-yellow-700">{compatibility.message}</p>
            <p className="text-xs text-yellow-600 mt-2">
              Using simulated data instead. For real device connection, use Chrome, Edge, or Opera on desktop/Android.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isBluetoothConnected = connectionState.dataSource === 'bluetooth' && connectionState.bluetoothDevice;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isBluetoothConnected ? (
            <Bluetooth className="text-blue-600" size={24} />
          ) : (
            <BluetoothOff className="text-slate-400" size={24} />
          )}
          <div>
            <h3 className="font-semibold text-slate-800">
              {isBluetoothConnected ? 'Real Device Connected' : 'Connect Smart Band'}
            </h3>
            <p className="text-sm text-slate-600">
              {isBluetoothConnected
                ? `Using data from: ${connectionState.bluetoothDevice}`
                : 'Connect your smart band via Bluetooth'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-xs text-blue-600 hover:text-blue-700 underline"
        >
          {showInstructions ? 'Hide' : 'Show'} Instructions
        </button>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-900 mb-2">How to Connect Your Smart Band:</h4>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Make sure your smart band/watch is charged and nearby</li>
            <li>Enable Bluetooth on your smart band</li>
            <li>Click "Connect Device" below</li>
            <li>Select your device from the popup list</li>
            <li>Wait for connection to establish</li>
          </ol>
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Supported devices:</strong> Most smart bands/watches with standard Bluetooth LE (BLE) support,
              including Firebolt (Cobalt, Ninja, etc.), Noise ColorFit, boAt, Xiaomi Mi Band, Fitbit, Amazfit, Samsung Galaxy Watch, Garmin, and more.
            </p>
            <p className="text-xs text-blue-600 mt-2">
              <strong>💡 Firebolt users:</strong> Disconnect from phone app first for best results. See FIREBOLT_GUIDE.md for details.
            </p>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-sm text-red-800 font-medium">Connection Failed</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {isBluetoothConnected && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
            <div className="flex-1">
              <p className="text-sm text-green-800 font-medium">Connected Successfully</p>
              <p className="text-xs text-green-700 mt-1">
                Receiving real-time data from your smart band
              </p>
            </div>
          </div>
        )}

        {/* Current Mode Indicator */}
        <div className={`rounded-lg p-3 ${
          isBluetoothConnected 
            ? 'bg-blue-50 border border-blue-200' 
            : 'bg-slate-50 border border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">
                Current Data Source:
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {isBluetoothConnected 
                  ? '🔵 Real Bluetooth Device'
                  : '🟡 Simulated Data'}
              </p>
            </div>
            {isConnecting && (
              <Loader className="text-blue-600 animate-spin" size={20} />
            )}
          </div>
        </div>

        {/* Connection Buttons */}
        {isBluetoothConnected ? (
          <button
            onClick={handleDisconnect}
            disabled={isConnecting}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <BluetoothOff size={18} />
            Disconnect Device
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
            >
              {isConnecting ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Connecting...
                </>
              ) : (
                <>
                  <Bluetooth size={18} />
                  Connect Real Watch
                </>
              )}
            </button>
            <button
              onClick={() => hybridSmartBand.startSimulation()}
              disabled={isConnecting}
              className="w-full px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              Use Demo Mode
            </button>
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500">
          💡 <strong>Note:</strong> Web Bluetooth requires HTTPS and works best in Chrome, Edge, or Opera.
          Not all smart bands expose all data via Bluetooth. Common data includes heart rate, battery, and steps.
        </p>
      </div>
    </div>
  );
};

export default BluetoothConnect;
