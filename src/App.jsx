import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Dashboard from './components/user/Dashboard';
import DashboardPanel from './components/admin/DashboardPanel';

const App = () => {
  return (
    <Router>
      <MainRoutes />
    </Router>
  );
};

const MainRoutes = () => {
  return (
    <>
      <div className="pt-19">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin" element={<DashboardPanel />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
