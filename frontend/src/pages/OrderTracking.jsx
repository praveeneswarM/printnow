import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiOrder, apiVendor, apiDoc } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiMessageCircle, FiPhoneCall, FiPackage, FiFile } from 'react-icons/fi';

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await apiOrder.get(`/${id}`);
        setOrder(res.data);
        
        if (res.data.vendorId && !vendor) {
          const vRes = await apiVendor.get(`/${res.data.vendorId}`);
          setVendor(vRes.data);
        }

        if (res.data.documentId && !documentUrl) {
          const dRes = await apiDoc.get(`/${res.data.documentId}`);
          if (dRes.data?.path) setDocumentUrl(`/uploads/${dRes.data.path.split('/').pop()}`);
        }
      } catch(e) {}
    };
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [id, vendor, documentUrl]);

  if (!order) return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>;

  const steps = ['Pending Payment', 'Confirmed', 'Printing', 'Ready', 'Delivered'];
  const currentStepIndex = steps.indexOf(order.status);
  
  // Vendor contact logic
  const isVendorAccepted = ['Printing', 'Ready', 'Delivered'].includes(order.status);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Track Order</h1>
          <p className="text-gray-500 font-mono mt-1 font-semibold text-lg">#{id.slice(-8).toUpperCase()}</p>
        </div>
        <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center shadow-sm">
          <FiPackage className="w-7 h-7" />
        </div>
      </div>

      <div className="card-modern p-10 mb-8 overflow-hidden">
        <h3 className="font-bold text-gray-900 mb-10 text-lg uppercase tracking-widest">Live Progress</h3>
        <div className="relative px-4">
          <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-100 -translate-y-1/2 rounded-full z-0"></div>
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${(Math.max(currentStepIndex, 0) / (steps.length - 1)) * 100}%` }} 
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-brand-400 to-brand-600 -translate-y-1/2 rounded-full z-0"
          ></motion.div>
          
          <div className="flex justify-between relative z-10">
            {steps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isActive = idx === currentStepIndex;
              return (
              <div key={idx} className="flex flex-col items-center">
                <motion.div 
                  initial={{ scale: 0.8 }} animate={{ scale: isCompleted || isActive ? 1 : 0.8 }}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-sm border-4 border-white transition-colors duration-500 ${isCompleted ? 'bg-brand-500 text-white shadow-lg' : isActive ? 'bg-white text-brand-600 border-brand-500 shadow-glow' : 'bg-gray-200 text-gray-400'}`}
                >
                  {isCompleted ? <FiCheck className="w-6 h-6" /> : isActive ? <div className="w-3 h-3 bg-brand-500 rounded-full animate-pulse" /> : idx + 1}
                </motion.div>
                <span className={`absolute mt-16 text-xs md:text-sm font-bold w-24 text-center ${isCompleted || isActive ? 'text-gray-900' : 'text-gray-400'}`}>{step}</span>
              </div>
            )})}
          </div>
        </div>
        <div className="h-16"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-5">
          <div className="card-modern p-6 h-full min-h-[400px] flex flex-col">
            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-widest flex items-center"><FiFile className="mr-2"/> Document Preview</h3>
            <div className="flex-1 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
              {documentUrl ? (
                <iframe src={`${documentUrl}#toolbar=0&navpanes=0`} className="w-full h-full border-none min-h-[400px]" title="PDF Preview" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 italic font-medium min-h-[400px]">Loading Preview...</div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-8">
          <div className="card-modern p-8">
            <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-widest border-b border-gray-100 pb-4">Vendor Details & Support</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Assigned To</p>
                <h4 className="text-2xl font-black text-gray-900 mb-1">{vendor?.shopName || vendor?.name || 'Loading...'}</h4>
                <p className="text-sm font-bold text-brand-600">{vendor?.city || 'Local Area'}</p>
              </div>
              <div className="flex gap-3 relative group">
                <button className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition shadow-sm border border-gray-200"><FiMessageCircle className="w-5 h-5"/></button>
                
                {isVendorAccepted ? (
                  <a href={`tel:${vendor?.contactNumber}`} className="w-12 h-12 bg-brand-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-500/30 hover:bg-brand-600 hover:scale-110 transition-all cursor-pointer">
                    <FiPhoneCall className="w-5 h-5"/>
                  </a>
                ) : (
                  <div className="relative flex flex-col items-center group cursor-not-allowed">
                    <div className="w-12 h-12 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center border border-gray-300">
                      <FiPhoneCall className="w-5 h-5"/>
                    </div>
                    <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 bg-gray-900 text-white text-xs font-bold p-3 rounded-xl text-center shadow-xl">
                      Contact available after vendor accepts the order
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="card-modern p-8">
            <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-widest border-b border-gray-100 pb-4">Exact Print Specifications</h3>
            <div className="grid grid-cols-2 gap-4 font-medium text-gray-600 mb-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Pages</span>
                <span className="text-gray-900 font-black text-xl">{order.settings.totalPagesToPrint || 1}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Copies</span>
                <span className="text-gray-900 font-black text-xl">{order.settings.copies}x</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Color Mode</span>
                <span className="text-gray-900 font-black text-xl">{order.settings.color}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Paper Size</span>
                <span className="text-gray-900 font-black text-xl">{order.settings.size}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between font-bold items-center">
              <span className="text-gray-900 text-lg uppercase">Total Charged</span>
              <span className="text-3xl font-black text-brand-600">₹{order.amount} <span className="text-sm text-gray-400 font-bold uppercase ml-2 bg-gray-100 px-2 py-1 rounded-lg">{order.paymentMethod}</span></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}