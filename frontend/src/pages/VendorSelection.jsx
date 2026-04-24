import { useState, useEffect } from 'react';
import { apiVendor } from '../api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiStar, FiArrowRight, FiDollarSign, FiInfo } from 'react-icons/fi';

export default function VendorSelection() {
  const [vendors, setVendors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    apiVendor.get('/list').then(res => setVendors(res.data));
  }, []);

  const handleSelect = (vendor) => {
    localStorage.setItem('selectedVendor', vendor._id);
    localStorage.setItem('vendorPricing', JSON.stringify(vendor.pricing || {bw: 2, color: 5, minOrder: 0}));
    navigate('/checkout');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Select Print Vendor</h1>
        <p className="text-gray-500 mt-2 text-lg">Choose a trusted vendor and review their live pricing rates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor, i) => {
          const pricing = vendor.pricing || { bw: 2, color: 5, minOrder: 0 };
          return (
          <motion.div key={vendor._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} 
            className="card-modern cursor-pointer hover:border-brand-300 hover:shadow-xl transition-all duration-300 group flex flex-col"
            onClick={() => handleSelect(vendor)}
          >
            <div className="p-8 flex-1">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-glow">
                  {vendor.shopName ? vendor.shopName.charAt(0) : vendor.name.charAt(0)}
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pricing</span>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span className="bg-gray-100 px-2 py-1 rounded-lg">B&W: ₹{pricing.bw}</span>
                    <span className="bg-brand-50 text-brand-700 px-2 py-1 rounded-lg">Color: ₹{pricing.color}</span>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 truncate">{vendor.shopName || vendor.name}</h3>
              <p className="text-gray-500 font-medium flex items-center"><FiMapPin className="mr-2 text-gray-400"/> {vendor.city || 'Local Area'}</p>
            </div>
            
            <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center group-hover:bg-brand-50 transition-colors">
              <span className="flex items-center text-sm text-yellow-500 font-bold bg-yellow-50 px-3 py-1 rounded-full"><FiStar className="mr-1 fill-current"/> 4.8 / 5</span>
              <span className="text-brand-600 font-bold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                Select Vendor <FiArrowRight className="ml-1" />
              </span>
            </div>
          </motion.div>
        )})}
        {vendors.length === 0 && (
          <div className="col-span-full py-20 text-center card-modern">
            <p className="text-xl font-bold text-gray-400">No vendors available in your area.</p>
          </div>
        )}
      </div>
    </div>
  );
}