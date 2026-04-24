import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUser } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiHome } from 'react-icons/fi';

export default function Register() {
  const [form, setForm] = useState({ 
    name: '', email: '', password: '', role: 'user', contactNumber: '',
    shopName: '', address: '', city: '', state: '', pincode: ''
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiUser.post('/auth/register', form);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'vendor' ? '/vendor-dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 pt-10 pb-20 min-h-[calc(100vh-80px)]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-modern w-full max-w-xl p-10 relative">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brand-500 to-purple-500"></div>
        <div className="text-center mb-8 mt-2">
          <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
          <p className="text-gray-500 mt-2 font-medium">Join PrintNow today</p>
        </div>
        
        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100 mb-4">
            {['user', 'vendor'].map(role => (
              <div key={role} onClick={() => setForm({...form, role})}
                className={`cursor-pointer text-center py-4 rounded-2xl border-2 font-semibold transition-all ${form.role === role ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                {role === 'user' ? 'Customer' : 'Print Vendor'}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FiUser className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 w-5 h-5" />
              <input required placeholder="Full Name" type="text" className="input-field pl-12" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="relative">
              <FiMail className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 w-5 h-5" />
              <input required placeholder="Email Address" type="email" className="input-field pl-12" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="relative md:col-span-2">
              <FiLock className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 w-5 h-5" />
              <input required placeholder="Password" type="password" className="input-field pl-12" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <div className="relative md:col-span-2">
              <FiPhone className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 w-5 h-5" />
              <input required placeholder="Contact Number" type="text" className="input-field pl-12" value={form.contactNumber} onChange={e => setForm({...form, contactNumber: e.target.value})} />
            </div>
          </div>

          {form.role === 'vendor' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-gray-100">
              <p className="font-bold text-gray-900 text-sm uppercase tracking-widest">Vendor Details</p>
              <div className="relative">
                <FiHome className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 w-5 h-5" />
                <input required placeholder="Shop / Business Name" type="text" className="input-field pl-12 bg-indigo-50/30" value={form.shopName} onChange={e => setForm({...form, shopName: e.target.value})} />
              </div>
              <div className="relative">
                <FiMapPin className="absolute top-4 left-4 text-gray-400 w-5 h-5" />
                <textarea required placeholder="Address Line" className="input-field pl-12 py-3 bg-indigo-50/30 min-h-[80px]" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <input required placeholder="City" type="text" className="input-field bg-indigo-50/30" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                <input required placeholder="State" type="text" className="input-field bg-indigo-50/30" value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
                <input required placeholder="Pincode" type="text" className="input-field bg-indigo-50/30" value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} />
              </div>
            </motion.div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg mt-6 shadow-xl">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        
        <p className="text-center mt-8 text-gray-500 font-medium">
          Already have an account? <Link to="/login" className="text-brand-600 hover:text-brand-700 font-bold">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}