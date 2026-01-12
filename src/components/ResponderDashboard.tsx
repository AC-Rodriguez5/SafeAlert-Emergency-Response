import { useState, useEffect } from 'react';
import { AlertList } from './AlertList';
import { AlertMap } from './AlertMap';
import { AlertStats } from './AlertStats';
import { List, Map, BarChart3, Settings } from 'lucide-react';
interface Props {
  onLogout?: () => void;
}
import type { Alert } from '../types';

export function ResponderDashboard({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'stats' | 'settings'>('map');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');

  // Load alerts from localStorage (simulating real-time data)
  useEffect(() => {
    const loadAlerts = () => {
      const savedAlerts = localStorage.getItem('alert_history');
      if (savedAlerts) {
        setAlerts(JSON.parse(savedAlerts));
      }
    };

    loadAlerts();
    
    // Simulate real-time updates by polling localStorage
    const interval = setInterval(loadAlerts, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = (alertId: string, status: Alert['status']) => {
    const updatedAlerts = alerts.map(alert =>
      alert.id === alertId ? { ...alert, status } : alert
    );
    
    setAlerts(updatedAlerts);
    localStorage.setItem('alert_history', JSON.stringify(updatedAlerts));
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.status === filter);

  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  };

  const tabs = [
    { id: 'map', label: 'Map View', icon: Map },
    { id: 'list', label: 'Alert List', icon: List },
    { id: 'stats', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1>Emergency Response Dashboard</h1>
              <p className="text-gray-600">Monitor and respond to emergency alerts</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        {activeTab === 'map' && <AlertMap alerts={alerts} onUpdateStatus={handleUpdateStatus} />}
        {activeTab === 'list' && <AlertList alerts={alerts} onUpdateStatus={handleUpdateStatus} />}
        {activeTab === 'stats' && <AlertStats alerts={alerts} />}
        {activeTab === 'settings' && (
          <div className="p-4 bg-white rounded-lg">
            <h2 className="mb-4">Settings</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="mb-2">About</h3>
                <p className="text-gray-600">Responder tools and settings</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="mb-2">Data</h3>
                <p className="text-gray-600">Total alerts: {alerts.length}</p>
              </div>
            </div>
            <div className="mt-4">
              <button onClick={onLogout} className="w-full bg-red-600 text-white py-2 rounded">Logout</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}