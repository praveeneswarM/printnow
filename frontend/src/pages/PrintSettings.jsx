import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiArrowRight, FiFileText, FiLayers, FiAlertCircle } from 'react-icons/fi';

export default function PrintSettings() {
  const navigate = useNavigate();
  const document = JSON.parse(localStorage.getItem('currentDoc') || '{}');
  const maxPages = document.pageCount || 1;

  const [settings, setSettings] = useState({ color: 'B&W', copies: 1, size: 'A4' });
  const [selectionMode, setSelectionMode] = useState('all');
  const [customRange, setCustomRange] = useState('');
  const [error, setError] = useState('');

  const parsePageRange = (rangeStr) => {
    if (!rangeStr.trim()) return [];
    const pages = new Set();
    const parts = rangeStr.split(',');
    for (let part of parts) {
      part = part.trim();
      if (!part) continue;
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (isNaN(start) || isNaN(end) || start < 1 || end > maxPages || start > end) return null;
        for (let i = start; i <= end; i++) pages.add(i);
      } else {
        const num = parseInt(part);
        if (isNaN(num) || num < 1 || num > maxPages) return null;
        pages.add(num);
      }
    }
    return Array.from(pages).sort((a,b)=>a-b);
  };

  const selectedPagesList = selectionMode === 'all' 
    ? Array.from({length: maxPages}, (_, i) => i + 1) 
    : parsePageRange(customRange);

  useEffect(() => {
    if (selectionMode === 'custom') {
      if (selectedPagesList === null) setError(`Invalid range. Must be between 1 and ${maxPages}. Format: 1-5, 8`);
      else if (selectedPagesList.length === 0) setError(`Please enter a valid page range.`);
      else setError('');
    } else {
      setError('');
    }
  }, [customRange, selectionMode, maxPages]);

  const totalPagesToPrint = selectedPagesList ? selectedPagesList.length : 0;

  const handleNext = () => {
    if (totalPagesToPrint === 0 || error) return;
    localStorage.setItem('printSettings', JSON.stringify({
      ...settings,
      totalPagesToPrint,
      selectionMode,
      customRange: selectionMode === 'custom' ? customRange : 'All'
    }));
    navigate('/vendor-selection');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Print Settings</h1>
        <p className="text-gray-500 mt-2 text-lg flex items-center justify-center gap-2">
          <FiFileText className="text-brand-500"/> {document.originalName} 
          <span className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-sm font-bold ml-2">{maxPages} Pages Detected</span>
        </p>
      </div>
      
      <div className="card-modern p-10 space-y-12">
        
        {/* Page Selection UI */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center"><FiLayers className="mr-2"/> Page Selection</h3>
          <div className="grid grid-cols-2 gap-4">
            <div onClick={() => setSelectionMode('all')} className={`cursor-pointer p-5 rounded-2xl border-2 font-bold text-lg transition-all text-center ${selectionMode === 'all' ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
              Print All Pages
            </div>
            <div onClick={() => setSelectionMode('custom')} className={`cursor-pointer p-5 rounded-2xl border-2 font-bold text-lg transition-all text-center ${selectionMode === 'custom' ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
              Custom Range
            </div>
          </div>
          
          {selectionMode === 'custom' && (
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-2">Enter Page Ranges (e.g. 1-5, 8, 11-13)</label>
              <input 
                type="text" 
                value={customRange} 
                onChange={e => setCustomRange(e.target.value)} 
                className={`input-field bg-white ${error ? 'border-red-400 focus:ring-red-500/10 focus:border-red-500' : ''}`}
                placeholder={`1-${maxPages}`}
              />
              {error && <p className="text-red-500 text-sm font-bold flex items-center mt-2"><FiAlertCircle className="mr-1"/> {error}</p>}
            </div>
          )}

          <div className="flex items-center justify-between bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <span className="font-bold text-gray-600">Total Selected Pages:</span>
            <span className="text-2xl font-black text-indigo-600">{totalPagesToPrint}</span>
          </div>
        </div>

        {/* Existing Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-gray-100 pt-10">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Color Mode</h3>
            <div className="grid grid-cols-2 gap-4">
              {['B&W', 'Color'].map(type => (
                <div key={type} onClick={() => setSettings({...settings, color: type})}
                  className={`cursor-pointer p-5 rounded-2xl border-2 font-bold text-lg transition-all text-center ${settings.color === type ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm' : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'}`}>
                  {type}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Paper Size</h3>
            <div className="grid grid-cols-3 gap-4">
              {['A4', 'A3', 'Legal'].map(size => (
                <div key={size} onClick={() => setSettings({...settings, size})}
                  className={`cursor-pointer p-4 rounded-2xl border-2 font-bold transition-all text-center ${settings.size === size ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm' : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'}`}>
                  {size}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 border-t border-gray-100 pt-10">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Number of Copies</h3>
          <div className="flex items-center justify-center space-x-6">
            <button onClick={() => setSettings({...settings, copies: Math.max(1, settings.copies - 1)})} className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors shadow-sm">
              <FiMinus className="w-6 h-6" />
            </button>
            <span className="text-5xl font-black w-20 text-center text-gray-900">{settings.copies}</span>
            <button onClick={() => setSettings({...settings, copies: settings.copies + 1})} className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors shadow-sm">
              <FiPlus className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100">
          <button 
            onClick={handleNext} 
            disabled={totalPagesToPrint === 0 || error}
            className="btn-primary w-full py-5 text-xl font-bold shadow-xl flex items-center justify-center"
          >
            Review Pricing & Vendors <FiArrowRight className="ml-2 w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}