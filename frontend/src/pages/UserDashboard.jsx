// import { useState, useEffect } from 'react';
// import { apiOrder } from '../api';
// import { Link } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { FiFileText, FiClock, FiArrowRight, FiPlus, FiBox } from 'react-icons/fi';
// import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// export default function UserDashboard() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     apiOrder.get('/user').then(res => {
//       setOrders(res.data);
//       setLoading(false);
//     }).catch(() => setLoading(false));
//   }, []);

//   const activeOrders = orders.filter(o => o.status !== 'Delivered');
//   const historyOrders = orders.filter(o => o.status === 'Delivered');
//   const totalSpent = orders.reduce((sum, o) => sum + o.amount, 0);

//   // Chart Data preparation
//   const statusCount = orders.reduce((acc, o) => {
//     acc[o.status] = (acc[o.status] || 0) + 1;
//     return acc;
//   }, {});
//   const pieData = Object.keys(statusCount).map(key => ({ name: key, value: statusCount[key] }));
//   const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

//   const timelineData = orders.slice().reverse().map(o => ({
//     date: new Date(o.createdAt).toLocaleDateString(),
//     amount: o.amount
//   }));

//   const StatCard = ({ title, value, sub }) => (
//     <div className="card-modern p-6">
//       <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">{title}</p>
//       <h3 className="text-4xl font-black text-gray-900">{value}</h3>
//       {sub && <p className="text-sm font-medium text-brand-600 mt-2">{sub}</p>}
//     </div>
//   );

//   return (
//     <div className="max-w-7xl mx-auto">
//       <div className="flex justify-between items-center mb-10">
//         <div>
//           <h1 className="text-4xl font-black tracking-tight text-gray-900">Analytics Dashboard</h1>
//           <p className="text-gray-500 mt-2 text-lg font-medium">Track your printing activity and expenses.</p>
//         </div>
//         <Link to="/upload" className="btn-primary shadow-xl hover:scale-105 py-3 px-6"><FiPlus className="mr-2"/> New Order</Link>
//       </div>

//       {loading ? (
//         <div className="flex justify-center p-20"><div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>
//       ) : orders.length === 0 ? (
//         <div className="card-modern py-24 text-center">
//           <FiBox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//           <h3 className="text-2xl font-bold text-gray-900">No data available</h3>
//           <p className="text-gray-500">Place your first order to view analytics.</p>
//         </div>
//       ) : (
//         <div className="space-y-8">
//           {/* Summary Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             <StatCard title="Total Orders" value={orders.length} />
//             <StatCard title="Active Jobs" value={activeOrders.length} sub="Currently processing" />
//             <StatCard title="Completed" value={historyOrders.length} />
//             <StatCard title="Total Spent" value={`₹${totalSpent}`} sub="Lifetime expenses" />
//           </div>

//           {/* Charts Row */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             <div className="card-modern p-6 lg:col-span-2 min-h-[350px] flex flex-col">
//               <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-widest">Spending Over Time</h3>
//               <div className="flex-1 w-full">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={timelineData}>
//                     <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
//                     <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
//                     <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
//                     <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={4} dot={{r: 4, fill: '#3b82f6', strokeWidth: 0}} activeDot={{r: 8}} />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
            
//             <div className="card-modern p-6 min-h-[350px] flex flex-col">
//               <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-widest">Status Distribution</h3>
//               <div className="flex-1 w-full flex items-center justify-center">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
//                       {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
//                     </Pie>
//                     <Tooltip contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//               <div className="flex flex-wrap justify-center gap-2 mt-4">
//                 {pieData.map((entry, index) => (
//                   <div key={entry.name} className="flex items-center text-xs font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
//                     <div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
//                     {entry.name}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Recent Orders Table */}
//           <div className="card-modern overflow-hidden">
//             <div className="p-6 border-b border-gray-100 bg-gray-50/50">
//               <h3 className="font-bold text-gray-900 text-sm uppercase tracking-widest">Recent Orders</h3>
//             </div>
//             <div className="divide-y divide-gray-100">
//               {orders.slice(0, 5).map(order => (
//                 <div key={order._id} className="p-6 flex flex-col md:flex-row justify-between items-center hover:bg-gray-50/50 transition-colors gap-4">
//                   <div className="flex items-center gap-4 w-full md:w-auto">
//                     <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600"><FiFileText className="w-5 h-5"/></div>
//                     <div>
//                       <p className="font-bold text-gray-900 text-lg uppercase">#{order._id.slice(-6)}</p>
//                       <p className="text-sm font-medium text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
//                     <span className="font-bold text-sm bg-gray-100 px-3 py-1 rounded-full">{order.status}</span>
//                     <span className="text-xl font-black text-gray-900">₹{order.amount}</span>
//                     <Link to={`/tracking/${order._id}`} className="text-brand-600 hover:text-brand-800 font-bold bg-brand-50 px-4 py-2 rounded-xl transition-colors">View</Link>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { apiOrder } from '../api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFileText, FiClock, FiArrowRight, FiPlus, FiBox } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function UserDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiOrder.get('/user')
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const activeOrders = orders.filter(o => o.status !== 'Delivered');
  const historyOrders = orders.filter(o => o.status === 'Delivered');
  const totalSpent = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

  // ===================== PIE CHART =====================
  const statusCount = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(statusCount).map(key => ({
    name: key,
    value: statusCount[key]
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  // ===================== FIXED LINE CHART =====================
  const grouped = {};

  orders.forEach(o => {
    const date = new Date(o.createdAt).toLocaleDateString();

    if (!grouped[date]) {
      grouped[date] = 0;
    }

    grouped[date] += (o.amount || 0);
  });

  const timelineData = Object.keys(grouped)
    .map(date => ({
      date,
      amount: grouped[date]
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // ===================== UI =====================
  const StatCard = ({ title, value, sub }) => (
    <div className="card-modern p-6">
      <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">{title}</p>
      <h3 className="text-4xl font-black text-gray-900">{value}</h3>
      {sub && <p className="text-sm font-medium text-brand-600 mt-2">{sub}</p>}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">Track your printing activity and expenses.</p>
        </div>
        <Link to="/upload" className="btn-primary shadow-xl hover:scale-105 py-3 px-6">
          <FiPlus className="mr-2"/> New Order
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="card-modern py-24 text-center">
          <FiBox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900">No data available</h3>
          <p className="text-gray-500">Place your first order to view analytics.</p>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Orders" value={orders.length} />
            <StatCard title="Active Jobs" value={activeOrders.length} sub="Currently processing" />
            <StatCard title="Completed" value={historyOrders.length} />
            <StatCard title="Total Spent" value={`₹${totalSpent}`} sub="Lifetime expenses" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card-modern p-6 lg:col-span-2 min-h-[350px] flex flex-col">
              <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-widest">
                Spending Over Time
              </h3>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                    <Tooltip />
                    <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={4} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-modern p-6 min-h-[350px] flex flex-col">
              <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-widest">
                Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={100}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card-modern overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-widest">
                Recent Orders
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {orders.slice(0, 5).map(order => (
                <div key={order._id} className="p-6 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">#{order._id.slice(-6)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span>{order.status}</span>
                    <span className="font-bold">₹{order.amount}</span>
                    <Link to={`/tracking/${order._id}`}>View</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}