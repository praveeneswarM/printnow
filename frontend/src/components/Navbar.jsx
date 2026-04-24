import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPrinter } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
            <FiPrinter className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900">PrintNow</span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <Link to={user.role === 'vendor' ? '/vendor-dashboard' : '/dashboard'} className="btn-primary py-2.5 px-5">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-brand-600 font-medium px-4 py-2 transition-colors">Login</Link>
              <Link to="/register" className="btn-primary py-2.5 px-5">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}