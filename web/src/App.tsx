import { useState, useEffect } from 'react';
import ResponderLogin from './pages/ResponderLogin';
import ResponderDashboard from './pages/ResponderDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [responderEmail, setResponderEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('responderToken');
    const email = localStorage.getItem('responderEmail');
    if (token && email) {
      setIsAuthenticated(true);
      setResponderEmail(email);
    }
  }, []);

  const handleLogin = (email: string, token: string) => {
    localStorage.setItem('responderToken', token);
    localStorage.setItem('responderEmail', email);
    setIsAuthenticated(true);
    setResponderEmail(email);
  };

  const handleLogout = () => {
    localStorage.removeItem('responderToken');
    localStorage.removeItem('responderEmail');
    setIsAuthenticated(false);
    setResponderEmail(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {isAuthenticated ? (
        <ResponderDashboard email={responderEmail!} onLogout={handleLogout} />
      ) : (
        <ResponderLogin onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
