import React, { useState } from 'react';
import { Download, FileText, Calendar, CheckCircle } from 'lucide-react';
import { SmartBandData } from '../../lib/smartBandSimulator';

interface DataExportProps {
  currentData: SmartBandData;
  historicalData: Array<{
    date: string;
    steps: number;
    calories: number;
    heartRate: number;
    sleep: number;
    distance: number;
  }>;
}

const DataExport: React.FC<DataExportProps> = ({ currentData, historicalData }) => {
  const [exportSuccess, setExportSuccess] = useState(false);

  const exportToJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      currentData: {
        ...currentData,
        timestamp: currentData.timestamp.toISOString(),
      },
      historicalData,
      summary: {
        totalDays: historicalData.length,
        avgSteps: Math.round(historicalData.reduce((sum, d) => sum + d.steps, 0) / historicalData.length),
        avgHeartRate: Math.round(historicalData.reduce((sum, d) => sum + d.heartRate, 0) / historicalData.length),
        totalDistance: historicalData.reduce((sum, d) => sum + d.distance, 0).toFixed(2),
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Steps', 'Calories', 'Heart Rate', 'Sleep (min)', 'Distance (km)'];
    const rows = historicalData.map(d => [
      d.date,
      d.steps,
      d.calories,
      d.heartRate,
      d.sleep,
      d.distance,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Download className="text-blue-600" size={20} />
        <h3 className="font-semibold text-slate-800">Export Health Data</h3>
      </div>

      {exportSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle size={20} />
          <span className="text-sm font-medium">Data exported successfully!</span>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={exportToJSON}
          className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group"
        >
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" size={20} />
            <div className="text-left">
              <p className="font-medium text-slate-800 text-sm">Export as JSON</p>
              <p className="text-xs text-slate-600">Complete data with metadata</p>
            </div>
          </div>
          <Download className="text-blue-600 group-hover:translate-y-0.5 transition-transform" size={16} />
        </button>

        <button
          onClick={exportToCSV}
          className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Calendar className="text-green-600" size={20} />
            <div className="text-left">
              <p className="font-medium text-slate-800 text-sm">Export as CSV</p>
              <p className="text-xs text-slate-600">Compatible with Excel & Sheets</p>
            </div>
          </div>
          <Download className="text-green-600 group-hover:translate-y-0.5 transition-transform" size={16} />
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-start gap-2 text-xs text-slate-600">
          <span>📊</span>
          <p>
            Export includes {historicalData.length} days of historical data and current real-time metrics.
            Files are saved locally to your device.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataExport;
