import { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Bell, 
  MapPin, 
  Users, 
  Clock, 
  LogOut, 
  Menu,
  X,
  Phone,
  Navigation,
  ZoomIn,
  ZoomOut,
  Map,
  List,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';

interface Props {
  email: string;
  onLogout: () => void;
}

interface Alert {
  id: string;
  type: 'medical' | 'fire' | 'police' | 'rescue';
  priority: 'high' | 'medium' | 'low';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  description: string;
  time: string;
  status: 'pending' | 'responding' | 'resolved';
  userName: string;
  userPhone: string;
}

declare global {
  interface Window {
    L: any;
  }
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'medical',
    priority: 'high',
    location: { lat: 14.5995, lng: 120.9842, address: '123 Main St, Manila' },
    description: 'Chest pain reported, elderly patient',
    time: '2 min ago',
    status: 'pending',
    userName: 'John Smith',
    userPhone: '+63 912 345 6789'
  },
  {
    id: '2',
    type: 'fire',
    priority: 'high',
    location: { lat: 14.6042, lng: 120.9822, address: '456 Oak Avenue, Quezon City' },
    description: 'Kitchen fire, smoke visible',
    time: '5 min ago',
    status: 'responding',
    userName: 'Sarah Johnson',
    userPhone: '+63 917 654 3210'
  },
  {
    id: '3',
    type: 'police',
    priority: 'medium',
    location: { lat: 14.5896, lng: 120.9762, address: '789 Park Road, Makati' },
    description: 'Suspicious activity reported',
    time: '12 min ago',
    status: 'pending',
    userName: 'Mike Brown',
    userPhone: '+63 918 111 2222'
  },
  {
    id: '4',
    type: 'rescue',
    priority: 'low',
    location: { lat: 14.6101, lng: 120.9912, address: '321 River Trail, Pasig' },
    description: 'Person requesting assistance',
    time: '25 min ago',
    status: 'resolved',
    userName: 'Emily Davis',
    userPhone: '+63 919 333 4444'
  },
];

export default function ResponderDashboard({ email, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'analytics'>('map');
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const tabs = [
    { id: 'map', label: 'Map View', icon: Map },
    { id: 'list', label: 'Alert List', icon: List },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ] as const;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medical': return '#DC2626';
      case 'fire': return '#EA580C';
      case 'police': return '#2563EB';
      case 'rescue': return '#059669';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medical': return '🏥';
      case 'fire': return '🔥';
      case 'police': return '🚔';
      case 'rescue': return '🆘';
      default: return '📍';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'responding': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Load Leaflet
  useEffect(() => {
    if (window.L) {
      setMapLoaded(true);
      return;
    }

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssLink);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || activeTab !== 'map') return;

    // Clean up existing map if container changed
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = window.L.map(mapRef.current).setView([14.5995, 120.9842], 13);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Cleanup on unmount or tab change
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded, activeTab]);

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || activeTab !== 'map') return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    alerts.forEach(alert => {
      const color = getTypeColor(alert.type);
      const isSelected = selectedAlert?.id === alert.id;
      const isPending = alert.status === 'pending';

      const iconHtml = `
        <div style="position: relative;">
          ${isPending ? `
            <div style="
              position: absolute;
              width: 50px;
              height: 50px;
              background: ${color};
              opacity: 0.3;
              border-radius: 50%;
              animation: pulse 2s infinite;
              top: -13px;
              left: -13px;
            "></div>
          ` : ''}
          <div style="
            width: ${isSelected ? '32px' : '24px'};
            height: ${isSelected ? '32px' : '24px'};
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '16px' : '12px'};
          ">${getTypeIcon(alert.type)}</div>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(0.5); opacity: 0.3; }
            50% { transform: scale(1.2); opacity: 0.1; }
            100% { transform: scale(0.5); opacity: 0.3; }
          }
        </style>
      `;

      const icon = window.L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = window.L.marker([alert.location.lat, alert.location.lng], { icon })
        .addTo(mapInstanceRef.current);

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">
            ${alert.type.toUpperCase()} Emergency
          </div>
          <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
            ${alert.description}
          </div>
          <div style="font-size: 11px; color: #888;">
            📍 ${alert.location.address}<br/>
            👤 ${alert.userName}<br/>
            📞 ${alert.userPhone}
          </div>
        </div>
      `);

      marker.on('click', () => setSelectedAlert(alert));

      if (isSelected) {
        marker.openPopup();
        mapInstanceRef.current.setView([alert.location.lat, alert.location.lng], 15);
      }

      markersRef.current.push(marker);
    });
  }, [alerts, selectedAlert, mapLoaded, activeTab]);

  const handleRespond = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: 'responding' as const } : a
    ));
  };

  const handleResolve = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: 'resolved' as const } : a
    ));
  };

  const stats = {
    total: alerts.length,
    pending: alerts.filter(a => a.status === 'pending').length,
    responding: alerts.filter(a => a.status === 'responding').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Emergency Response Dashboard</h1>
                <p className="text-sm text-gray-600">Monitor and respond to emergency alerts</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {email[0].toUpperCase()}
                </div>
                <span className="text-sm text-gray-700">{email}</span>
              </div>
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
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
      {activeTab === 'map' ? (
        <div className="flex h-[calc(100vh-140px)]">
          {/* Sidebar - Alerts List */}
          <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden flex-shrink-0`}>
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-800 text-sm">Emergency Alerts</h2>
                <p className="text-xs text-gray-500">{alerts.length} total alerts</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${
                      selectedAlert?.id === alert.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                        style={{ backgroundColor: getTypeColor(alert.type) }}
                      >
                        {getTypeIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded border ${getPriorityBadge(alert.priority)}`}>
                            {alert.priority.toUpperCase()}
                          </span>
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusBadge(alert.status)}`} />
                        </div>
                        <p className="text-xs font-medium text-gray-800 truncate">{alert.description}</p>
                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          {/* Map */}
          <div className="flex-1 relative bg-white overflow-hidden">
            <div ref={mapRef} className="absolute inset-0" />
              
              {/* Map Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
                <button 
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
                <button 
                  onClick={() => mapInstanceRef.current?.zoomIn()}
                  className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
                >
                  <ZoomIn className="w-5 h-5 text-gray-600" />
                </button>
                <button 
                  onClick={() => mapInstanceRef.current?.zoomOut()}
                  className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
                >
                  <ZoomOut className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Selected Alert Panel */}
              {selectedAlert && (
                <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl z-[1000] overflow-hidden">
                  <div className="p-4 text-white" style={{ backgroundColor: getTypeColor(selectedAlert.type) }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getTypeIcon(selectedAlert.type)}</span>
                        <div>
                          <h3 className="font-bold capitalize">{selectedAlert.type} Emergency</h3>
                          <p className="text-sm opacity-90">{selectedAlert.time}</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedAlert(null)} className="p-1 hover:bg-white/20 rounded">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-gray-700">{selectedAlert.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedAlert.location.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{selectedAlert.userName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{selectedAlert.userPhone}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200 flex gap-2">
                      {selectedAlert.status === 'pending' && (
                        <button 
                          onClick={() => handleRespond(selectedAlert.id)}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                        >
                          Respond Now
                        </button>
                      )}
                      {selectedAlert.status === 'responding' && (
                        <button 
                          onClick={() => handleResolve(selectedAlert.id)}
                          className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition"
                        >
                          Mark Resolved
                        </button>
                      )}
                      {selectedAlert.status === 'resolved' && (
                        <div className="flex-1 py-2 bg-green-50 text-green-700 text-sm text-center rounded-lg">
                          ✓ Resolved
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
              <p className="text-xs font-medium text-gray-600 mb-2">Alert Types</p>
              <div className="space-y-1">
                {[
                  { type: 'medical', label: 'Medical' },
                  { type: 'fire', label: 'Fire' },
                  { type: 'police', label: 'Police' },
                  { type: 'rescue', label: 'Rescue' },
                ].map(item => (
                  <div key={item.type} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getTypeColor(item.type) }} />
                    <span className="text-xs text-gray-600">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto p-4">
        {/* Alert List View */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">All Alerts</h2>
              <p className="text-sm text-gray-500">Complete list of emergency alerts</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reporter</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {alerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: getTypeColor(alert.type) }}
                          >
                            {getTypeIcon(alert.type)}
                          </div>
                          <span className="capitalize font-medium text-gray-800">{alert.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{alert.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{alert.location.address}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="text-gray-800">{alert.userName}</p>
                          <p className="text-gray-500 text-xs">{alert.userPhone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                          alert.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          alert.status === 'responding' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {alert.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{alert.time}</td>
                      <td className="px-4 py-3">
                        {alert.status === 'pending' && (
                          <button 
                            onClick={() => handleRespond(alert.id)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Respond
                          </button>
                        )}
                        {alert.status === 'responding' && (
                          <button 
                            onClick={() => handleResolve(alert.id)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Resolve
                          </button>
                        )}
                        {alert.status === 'resolved' && (
                          <span className="text-green-600 text-xs">✓ Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics View */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Alerts</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Navigation className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Responding</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.responding}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Resolved</p>
                    <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Alert Types Distribution */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Alerts by Type</h3>
                <div className="space-y-4">
                  {['medical', 'fire', 'police', 'rescue'].map(type => {
                    const count = alerts.filter(a => a.type === type).length;
                    const percentage = alerts.length > 0 ? (count / alerts.length) * 100 : 0;
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize text-gray-700">{type}</span>
                          <span className="text-gray-500">{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: getTypeColor(type)
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Distribution */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Alerts by Status</h3>
                <div className="space-y-4">
                  {[
                    { status: 'pending', color: '#EAB308', label: 'Pending' },
                    { status: 'responding', color: '#2563EB', label: 'Responding' },
                    { status: 'resolved', color: '#16A34A', label: 'Resolved' },
                  ].map(item => {
                    const count = alerts.filter(a => a.status === item.status).length;
                    const percentage = alerts.length > 0 ? (count / alerts.length) * 100 : 0;
                    return (
                      <div key={item.status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{item.label}</span>
                          <span className="text-gray-500">{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: item.color
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {alerts.slice(0, 5).map(alert => (
                  <div key={alert.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: getTypeColor(alert.type) }}
                    >
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{alert.description}</p>
                      <p className="text-xs text-gray-500">{alert.location.address}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        alert.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        alert.status === 'responding' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {alert.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  );
}
