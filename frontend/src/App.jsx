import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Stats from './pages/Stats';
import Config from './pages/Config';
import Login from './pages/Login';
import { RunProvider } from './RunContext';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <BrowserRouter>
      <RunProvider onRefetch={() => setRefreshKey(k => k + 1)}>
        <div className="min-h-screen">
          <Routes key={refreshKey}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/config" element={<Config />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </RunProvider>
    </BrowserRouter>
  );
}

export default App;