import { useState, useEffect } from 'react';
import { apiVendor, apiDoc } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiPrinter, FiSave, FiSettings, FiEye, FiDownload, FiXCircle, FiTrendingUp, FiShoppingBag, FiClock, FiDollarSign } from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend } from 'recharts';

export default function VendorDashboard() {
  const [orders, setOrders] = useState([]);
  const [pricing, setPricing] = useState({ bw: 2, color: 5, minOrder: 0 });
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingSuccess, setPricingSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Document Preview State
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchOrders = () => {
    apiVendor.get('/orders').then(res => {
      setOrders(res.data);
      setLoading(false);
    });
  };

  const fetchPricing = () => {
    apiVendor.get('/me/pricing').then(res => setPricing(res.data));
  };

  useEffect(() => {
    fetchOrders();
    fetchPricing();
  }, []);

  const handlePricingSave = async (e) => {
    e.preventDefault();
    setPricingSaving(true);
    try {
      await apiVendor.put('/pricing', pricing);
      setPricingSuccess(true);
      setTimeout(() => setPricingSuccess(false), 3000);
    } catch(e) { alert("Failed to save pricing"); }
    setPricingSaving(false);
  };

  const updateStatus = async (id, status) => {
    await apiVendor.put(`/orders/${id}/status`, { status });
    fetchOrders();
  };

  const handleDocumentAccess = async (docId, action, originalName) => {
    try {
      setIsDownloading(true);
      const response = await apiDoc.get(`/${docId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      
      if (action === 'preview') {
        setPreviewUrl(url);
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', originalName || `document_${docId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (e) {
      alert("Unauthorized or file not found.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Metrics & Analytics
  const incoming = orders.filter(o => o.status === 'Confirmed');
  const inProgress = orders.filter(o => ['Printing', 'Ready'].includes(o.status));
  
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => ['Pending Payment', 'Confirmed'].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === 'Delivered').length;
  const totalEarnings = orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + o.amount, 0);

  // Time-series Data
  const trendData = [...orders].reverse().reduce((acc, o) => {
    const d = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const last = acc[acc.length - 1];
    if (last && last.date === d) {
      last.orders += 1;
    } else {
      acc.push({ date: d, orders: 1 });
    }
    return acc;
  }, []);

  // Pie Chart Data
  const statusCount = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.keys(statusCount).map(key => ({ name: key, value: statusCount[key] }));
  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  const StatCard = ({ title, value, icon, color }) => (
    <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-gray-900">{value}</h3>
      </div>
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 relative pb-20">
      
      {/* PDF Preview Modal */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 flex items-center"><FiEye className="mr-2"/> Document Preview</h3>
                <button onClick={() => setPreviewUrl(null)} className="text-gray-500 hover:text-red-500 transition-colors"><FiXCircle className="w-8 h-8"/></button>
              </div>
              <iframe src={`${previewUrl}#toolbar=0`} className="w-full flex-1 border-none bg-gray-100" title="PDF Viewer" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Vendor Analytics Hub</h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">Deep insights and live operational queue.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <>
          {/* Summary Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Received" value={totalOrders} icon={<FiShoppingBag className="w-6 h-6"/>} color="bg-blue-50 text-blue-600" />
            <StatCard title="Pending Review" value={pendingOrders} icon={<FiClock className="w-6 h-6"/>} color="bg-orange-50 text-orange-600" />
            <StatCard title="Completed" value={completedOrders} icon={<FiPrinter className="w-6 h-6"/>} color="bg-green-50 text-green-600" />
            <StatCard title="Total Earnings" value={`₹${totalEarnings}`} icon={<FiDollarSign className="w-6 h-6"/>} color="bg-brand-50 text-brand-600" />
          </motion.div>

          {/* Advanced Analytics Charts */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center"><FiTrendingUp className="mr-2 text-brand-500"/> Orders Over Time</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="date" tick={{fontSize: 12, fill: '#6b7280'}} tickLine={false} axisLine={false} />
                      <YAxis tick={{fontSize: 12, fill: '#6b7280'}} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                      <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center"><FiTrendingUp className="mr-2 text-indigo-500"/> Orders Per Day</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="date" tick={{fontSize: 12, fill: '#6b7280'}} tickLine={false} axisLine={false} />
                      <YAxis tick={{fontSize: 12, fill: '#6b7280'}} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                      <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col h-full">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">Status Distribution</h3>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#4b5563' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Pricing Controls */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="card-modern p-6 bg-gradient-to-br from-gray-900 to-indigo-900 text-white relative overflow-hidden h-fit">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <h3 className="font-bold text-gray-100 mb-6 text-sm uppercase tracking-widest flex items-center"><FiSettings className="mr-2 text-brand-400"/> Live Pricing Grid</h3>
              <form onSubmit={handlePricingSave} className="space-y-4 relative z-10">
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                  <span className="font-semibold text-sm">B&W Rate</span>
                  <div className="flex items-center"><span className="text-gray-400 mr-2">₹</span><input type="number" min="0" required value={pricing.bw} onChange={e=>setPricing({...pricing, bw: Number(e.target.value)})} className="w-16 bg-transparent text-white font-bold text-right outline-none" /></div>
                </div>
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                  <span className="font-semibold text-sm">Color Rate</span>
                  <div className="flex items-center"><span className="text-gray-400 mr-2">₹</span><input type="number" min="0" required value={pricing.color} onChange={e=>setPricing({...pricing, color: Number(e.target.value)})} className="w-16 bg-transparent text-white font-bold text-right outline-none" /></div>
                </div>
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                  <span className="font-semibold text-sm">Min Order</span>
                  <div className="flex items-center"><span className="text-gray-400 mr-2">₹</span><input type="number" min="0" required value={pricing.minOrder} onChange={e=>setPricing({...pricing, minOrder: Number(e.target.value)})} className="w-16 bg-transparent text-white font-bold text-right outline-none" /></div>
                </div>
                <button type="submit" disabled={pricingSaving} className="w-full bg-brand-500 text-white font-bold py-4 rounded-xl hover:bg-brand-600 transition-colors flex justify-center items-center shadow-lg shadow-brand-500/30 mt-6">
                  {pricingSaving ? 'Syncing...' : <><FiSave className="mr-2"/> Deploy Pricing</>}
                </button>
                {pricingSuccess && <p className="text-center text-green-400 text-sm font-bold mt-2">Rates Live Updated!</p>}
              </form>
            </motion.div>

            {/* Actionable Orders Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 space-y-6">
              
              {/* Incoming Needs Action */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-widest flex items-center justify-between">
                  <span className="flex items-center"><span className="w-3 h-3 bg-orange-500 rounded-full mr-2 animate-pulse"/> Needs Review</span> 
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full">{incoming.length}</span>
                </h3>
                <div className="space-y-4">
                  {incoming.length === 0 ? <p className="text-gray-400 font-bold italic py-4">All caught up!</p> : incoming.map(order => (
                    <div key={order._id} className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="font-black text-xl text-gray-900">₹{order.amount} <span className="text-xs text-brand-600 font-bold uppercase ml-2 bg-brand-50 px-2 py-1 rounded-md">{order.settings.color}</span></p>
                        <p className="text-sm font-medium text-gray-500 mt-1">{order.settings.copies} Copies • {order.settings.totalPagesToPrint} Pages</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="flex gap-2 w-full sm:w-auto justify-center">
                          <button onClick={() => handleDocumentAccess(order.documentId, 'preview', 'doc')} disabled={isDownloading} className="w-12 h-12 bg-white text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-50 shadow-sm border border-gray-200 transition" title="Preview"><FiEye className="w-5 h-5"/></button>
                          <button onClick={() => handleDocumentAccess(order.documentId, 'download', 'print_document.pdf')} disabled={isDownloading} className="w-12 h-12 bg-white text-green-600 rounded-xl flex items-center justify-center hover:bg-green-50 shadow-sm border border-gray-200 transition" title="Download"><FiDownload className="w-5 h-5"/></button>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button onClick={() => updateStatus(order._id, 'Printing')} className="flex-1 sm:flex-none btn-primary py-2 px-6 flex justify-center items-center text-sm"><FiCheck className="mr-1"/> Accept</button>
                          <button onClick={() => updateStatus(order._id, 'Rejected')} className="flex-1 sm:flex-none bg-red-50 text-red-600 hover:bg-red-100 font-bold py-2 px-4 rounded-xl flex justify-center items-center transition-colors text-sm"><FiX className="mr-1"/> Reject</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Print Queue */}
              <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6">
                <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-widest flex items-center justify-between">
                  <span className="flex items-center"><span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"/> Active Print Queue</span> 
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">{inProgress.length}</span>
                </h3>
                <div className="space-y-4">
                  {inProgress.length === 0 ? <p className="text-gray-400 font-bold italic py-4">Queue is empty.</p> : inProgress.map(order => (
                    <div key={order._id} className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="font-black text-lg text-gray-900">#{order._id.slice(-6).toUpperCase()}</p>
                        <p className="text-sm font-bold text-indigo-600 mt-1 uppercase">{order.status}</p>
                      </div>
                      <div className="flex gap-3 w-full sm:w-auto">
                        <div className="flex gap-2">
                          <button onClick={() => handleDocumentAccess(order.documentId, 'preview', 'doc')} disabled={isDownloading} className="w-12 h-12 bg-white text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-100 shadow-sm transition"><FiEye className="w-5 h-5"/></button>
                          <button onClick={() => handleDocumentAccess(order.documentId, 'download', 'print_document.pdf')} disabled={isDownloading} className="w-12 h-12 bg-white text-green-600 rounded-xl flex items-center justify-center hover:bg-green-100 shadow-sm transition"><FiDownload className="w-5 h-5"/></button>
                        </div>
                        <button 
                          onClick={() => updateStatus(order._id, order.status === 'Printing' ? 'Ready' : 'Delivered')}
                          className="flex-1 sm:flex-none btn-primary py-2 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30 text-sm whitespace-nowrap"
                        >
                          {order.status === 'Printing' ? 'Mark Ready' : 'Mark Delivered'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}

