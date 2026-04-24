import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUser } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock } from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiUser.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'vendor' ? '/vendor-dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 pt-10 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-modern w-full max-w-md p-10 relative">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brand-500 to-purple-500"></div>
        <div className="text-center mb-10 mt-2">
          <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 mt-2 font-medium">Log in to manage your documents</p>
        </div>
        
        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold text-center border border-red-100">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <FiMail className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 w-5 h-5" />
            <input type="email" required placeholder="Email address" className="input-field pl-12" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="relative">
            <FiLock className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 w-5 h-5" />
            <input type="password" required placeholder="Password" className="input-field pl-12" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg mt-2">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p className="text-center mt-8 text-gray-500 font-medium">
          Don't have an account? <Link to="/register" className="text-brand-600 hover:text-brand-700">Register</Link>
        </p>
      </motion.div>
    </div>
  );
}