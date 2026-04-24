import { useState, useCallback } from 'react';
import { apiDoc } from '../api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFile, FiCheckCircle, FiRefreshCw, FiArrowRight } from 'react-icons/fi';

export default function UploadDocument() {
  const [file, setFile] = useState(null);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const navigate = useNavigate();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true);
    else if (e.type === "dragleave") setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files[0].type === 'application/pdf') {
        processFile(e.dataTransfer.files[0]);
      } else {
        alert("Only PDF allowed");
      }
    }
  }, []);

  const processFile = async (selectedFile) => {
    setFile(selectedFile);
    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const res = await apiDoc.post('/upload', formData);
      setUploadedDoc(res.data);
      localStorage.setItem('currentDoc', JSON.stringify(res.data));
    } catch (e) {
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadedDoc(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Upload Document</h1>
        <p className="text-gray-500 mt-2 text-lg">Securely upload and preview your PDF before printing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upload Zone */}
        <div className="flex flex-col h-full">
          {!uploadedDoc ? (
            <motion.div 
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              whileHover={{ scale: 1.01 }}
              className={`flex-1 relative border-3 border-dashed rounded-[2.5rem] p-12 text-center cursor-pointer transition-all duration-300 min-h-[400px] flex flex-col justify-center ${isDragActive ? 'border-brand-500 bg-brand-50' : 'border-gray-300 bg-white hover:border-brand-400 shadow-soft'}`}
            >
              <input type="file" accept="application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={e => e.target.files[0] && processFile(e.target.files[0])} />
              <div className="flex flex-col items-center pointer-events-none">
                <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mb-6">
                  <FiUploadCloud className="w-10 h-10 text-brand-600" />
                </div>
                {loading ? (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-xl font-bold text-gray-900">Uploading Securely...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-900">Click or drag PDF here</p>
                    <p className="text-gray-500 mt-2 font-medium">Maximum file size 50MB</p>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="card-modern p-10 flex flex-col h-full justify-between bg-gradient-to-br from-green-50 to-emerald-50/20 border-green-100">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white shadow-md rounded-full flex items-center justify-center mb-6 text-green-500 relative">
                  <FiFile className="w-10 h-10" />
                  <FiCheckCircle className="absolute bottom-2 right-2 w-6 h-6 bg-white rounded-full text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 truncate w-full px-4">{file.name}</h3>
                <span className="text-gray-500 font-bold bg-white px-4 py-1.5 rounded-full shadow-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              
              <div className="space-y-4 mt-10">
                <button onClick={() => navigate('/print-settings')} className="btn-primary w-full py-5 text-lg shadow-xl shadow-brand-500/30">
                  Continue to Settings <FiArrowRight className="ml-2" />
                </button>
                <button onClick={resetUpload} className="w-full py-4 text-gray-500 hover:text-gray-900 font-bold flex items-center justify-center transition-colors">
                  <FiRefreshCw className="mr-2" /> Replace Document
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Zone */}
        <div className="card-modern overflow-hidden bg-gray-100 flex items-center justify-center min-h-[500px] border border-gray-200">
          {uploadedDoc ? (
            <iframe 
              src={`http://document-service:5002/${uploadedDoc.path}#toolbar=0`} 
              className="w-full h-full border-none"
              title="PDF Preview"
            />
          ) : (
            <div className="text-center p-10">
              <FiFile className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-400">Live Preview</p>
              <p className="text-gray-500 mt-2 text-sm font-medium">Your document preview will appear here</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}