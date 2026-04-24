import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiFilePlus, FiLogOut, FiPrinter, FiList } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const vendorLinks = [
    { name: 'Incoming Orders', path: '/vendor-dashboard', icon: FiList }
  ];

  const userLinks = [
    { name: 'My Orders', path: '/dashboard', icon: FiHome },
    { name: 'New Print', path: '/upload', icon: FiFilePlus }
  ];

  const links = user?.role === 'vendor' ? vendorLinks : userLinks;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-100 z-10 pt-6">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-glow">
            <FiPrinter className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-gray-900">PrintNow</span>
        </div>

        <div className="px-6 mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Account</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg">
              {user?.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {links.map(link => {
            const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
            return (
              <Link key={link.name} to={link.path} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all ${isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <link.icon className={`w-5 h-5 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                {link.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl font-medium transition-colors">
            <FiLogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <FiPrinter className="text-brand-600 w-6 h-6" />
            <span className="font-bold text-xl">PrintNow</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
            {user?.name.charAt(0)}
          </div>
        </header>

        <div className="p-4 md:p-10 max-w-6xl mx-auto pb-24 md:pb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex justify-around p-3 z-50 pb-safe">
        {links.map(link => {
          const isActive = location.pathname === link.path;
          return (
            <Link key={link.name} to={link.path} className={`flex flex-col items-center p-2 ${isActive ? 'text-brand-600' : 'text-gray-400'}`}>
              <link.icon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{link.name}</span>
            </Link>
          )
        })}
        <button onClick={logout} className="flex flex-col items-center p-2 text-red-400">
          <FiLogOut className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}