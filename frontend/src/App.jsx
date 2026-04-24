import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import VendorDashboard from './pages/VendorDashboard';
import UploadDocument from './pages/UploadDocument';
import PrintSettings from './pages/PrintSettings';
import VendorSelection from './pages/VendorSelection';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import { AnimatePresence } from 'framer-motion';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<><Navbar /><div className="pt-20"><Home /></div></>} />
        <Route path="/login" element={<><Navbar /><div className="pt-20"><Login /></div></>} />
        <Route path="/register" element={<><Navbar /><div className="pt-20"><Register /></div></>} />
        
        {/* User Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute role="user"><DashboardLayout><UserDashboard /></DashboardLayout></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute role="user"><DashboardLayout><UploadDocument /></DashboardLayout></ProtectedRoute>} />
        <Route path="/print-settings" element={<ProtectedRoute role="user"><DashboardLayout><PrintSettings /></DashboardLayout></ProtectedRoute>} />
        <Route path="/vendor-selection" element={<ProtectedRoute role="user"><DashboardLayout><VendorSelection /></DashboardLayout></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute role="user"><DashboardLayout><Checkout /></DashboardLayout></ProtectedRoute>} />
        <Route path="/tracking/:id" element={<ProtectedRoute role="user"><DashboardLayout><OrderTracking /></DashboardLayout></ProtectedRoute>} />
        
        {/* Vendor Protected Routes */}
        <Route path="/vendor-dashboard" element={<ProtectedRoute role="vendor"><DashboardLayout><VendorDashboard /></DashboardLayout></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;