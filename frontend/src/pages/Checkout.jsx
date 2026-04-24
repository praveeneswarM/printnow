import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiOrder } from '../api';
import { FiCreditCard, FiDollarSign, FiFileText, FiInfo, FiLayers } from 'react-icons/fi';

export default function Checkout() {
  const [method, setMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const settings = JSON.parse(localStorage.getItem('printSettings'));
  const docData = JSON.parse(localStorage.getItem('currentDoc'));
  const vendorId = localStorage.getItem('selectedVendor');
  const pricing = JSON.parse(localStorage.getItem('vendorPricing') || '{"bw":2,"color":5,"minOrder":0}');

  // Dynamic Pricing Calculation
  const isColor = settings?.color === 'Color';
  const pagePrice = isColor ? pricing.color : pricing.bw;
  const pagesToPrint = settings?.totalPagesToPrint || 1;
  
  const pagesCost = pagesToPrint * pagePrice;
  const subtotal = pagesCost * settings?.copies;
  
  const isMinimumApplied = subtotal < pricing.minOrder;
  const price = isMinimumApplied ? pricing.minOrder : subtotal;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
  }, []);

  const handleOnlinePayment = async (orderIdToVerify) => {
    try {
      const { data: rzpOrder } = await apiOrder.post('/payment/create-order', { amount: price });
      const options = {
        key: 'rzp_test_SgxwwTh05ycq20',
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'PrintNow',
        description: 'Document Print Order',
        order_id: rzpOrder.id,
        handler: async function (response) {
          try {
            await apiOrder.post('/payment/verify', { ...response, orderId: orderIdToVerify });
            navigate(`/tracking/${orderIdToVerify}`);
          } catch(e) {
            alert('Payment verification failed');
            setLoading(false);
          }
        },
        prefill: { name: 'Customer', email: 'customer@printnow.com' },
        theme: { color: '#3b82f6' }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        alert('Payment failed or cancelled.');
        setLoading(false);
      });
      rzp.open();
    } catch (e) {
      alert('Error initiating payment');
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const payload = { vendorId, documentId: docData._id, settings, paymentMethod: method };
      const res = await apiOrder.post('/create', payload);
      
      if (method === 'Online') {
        handleOnlinePayment(res.data._id);
      } else {
        navigate(`/tracking/${res.data._id}`);
      }
    } catch (e) {
      alert('Order failed');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-10 tracking-tight">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <div className="card-modern p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><FiFileText className="text-brand-500" /> Exact Pricing Breakdown</h3>
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
              
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-500 font-medium">Document</span> 
                <span className="font-bold text-gray-900 truncate max-w-[200px]">{docData?.originalName}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-500 font-medium">Pages Selected</span> 
                <span className="font-bold text-gray-900 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg">{pagesToPrint} Pages ({settings.selectionMode})</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-500 font-medium">Paper & Copies</span> 
                <span className="font-bold text-gray-900">{settings?.color}, {settings?.size} • {settings?.copies}x Copies</span>
              </div>
              
              {/* Intensive Breakdown details */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mt-4 space-y-3">
                <div className="flex justify-between items-center text-sm font-semibold text-gray-600">
                  <span>Base Rate ({settings?.color})</span>
                  <span>₹{pagePrice} / page</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold text-gray-600">
                  <span>Selected Pages</span>
                  <span>× {pagesToPrint}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold text-gray-600 border-b border-gray-100 pb-3">
                  <span>Copies multiplier</span>
                  <span>× {settings?.copies}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-black pt-1 text-gray-900">
                  <span>Calculated Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {isMinimumApplied && (
                  <div className="flex justify-between items-center text-sm font-bold text-orange-600 bg-orange-50 p-3 rounded-xl mt-3 border border-orange-100">
                    <span className="flex items-center"><FiInfo className="mr-2"/> Minimum Order Threshold Applied</span>
                    <span>₹{pricing.minOrder}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-6">
                <span className="text-gray-900 font-bold text-xl uppercase tracking-widest">Total Amount</span>
                <span className="text-5xl font-black text-brand-600">₹{price}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="card-modern p-8 sticky top-24">
            <h3 className="text-xl font-bold mb-6">Payment Method</h3>
            <div className="space-y-4 mb-8">
              <button onClick={() => setMethod('COD')} className={`w-full flex items-center p-5 rounded-2xl border-2 transition-all text-left ${method === 'COD' ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${method==='COD' ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400'}`}><FiDollarSign className="w-6 h-6"/></div>
                <div>
                  <span className="block font-bold text-gray-900 text-lg">Cash on Delivery</span>
                  <span className="block text-sm text-gray-500 font-medium">Pay when it arrives</span>
                </div>
              </button>
              <button onClick={() => setMethod('Online')} className={`w-full flex items-center p-5 rounded-2xl border-2 transition-all text-left ${method === 'Online' ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${method==='Online' ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400'}`}><FiCreditCard className="w-6 h-6"/></div>
                <div>
                  <span className="block font-bold text-gray-900 text-lg">Pay Online</span>
                  <span className="block text-sm text-gray-500 font-medium">Credit card or UPI</span>
                </div>
              </button>
            </div>

            <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary w-full py-5 text-xl font-bold shadow-xl shadow-brand-500/30 flex items-center justify-center transition-all hover:-translate-y-1">
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                `Pay ₹${price} & Place Order`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}