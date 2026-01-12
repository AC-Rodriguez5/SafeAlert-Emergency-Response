import { useState } from 'react';
import { UserDashboard } from './components/UserDashboard';
import { ResponderDashboard } from './components/ResponderDashboard';
import { SystemArchitecture } from './components/SystemArchitecture';
import { Info, X } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'user' | 'responder'>('user');
  const [showArchitecture, setShowArchitecture] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* View Toggle */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-red-600">SafeAlert System</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowArchitecture(!showArchitecture)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                {showArchitecture ? (
                  <>
                    <X className="w-5 h-5" />
                    Close
                  </>
                ) : (
                  <>
                    <Info className="w-5 h-5" />
                    Architecture
                  </>
                )}
              </button>
              <button
                onClick={() => setView('user')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === 'user'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                User View
              </button>
              <button
                onClick={() => setView('responder')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === 'responder'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Responder View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {showArchitecture ? (
        <SystemArchitecture />
      ) : (
        <>
          {view === 'user' ? <UserDashboard /> : <ResponderDashboard />}
        </>
      )}
    </div>
  );
}