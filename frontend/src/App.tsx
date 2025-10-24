import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Repositories from './pages/Repositories';
import Login from './pages/Login';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-slate-900 text-white">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/repositories" element={<Repositories />} />
            <Route path="/analytics/:id" element={<Analytics />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
