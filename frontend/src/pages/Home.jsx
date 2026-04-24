import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiUploadCloud, FiSettings, FiTruck, FiArrowRight } from 'react-icons/fi';

export default function Home() {
  const stagger = { animate: { transition: { staggerChildren: 0.1 } } };
  const fadeUp = { hidden: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } };

  return (
    <motion.div initial="hidden" animate="animate" variants={stagger} className="w-full pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-[30%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-200/50 blur-[100px]" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-200/50 blur-[100px]" />
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div variants={fadeUp} className="inline-block mb-6 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 font-semibold text-sm">
            ✨ The new way to print documents
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-extrabold tracking-tight text-gray-900 mb-8 leading-[1.1]">
            Print anything, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">anywhere.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your PDFs, customize your print settings, and have them delivered directly to your doorstep by trusted local vendors.
          </motion.p>
          <motion.div variants={fadeUp} className="flex justify-center gap-4">
            <Link to="/upload" className="btn-primary text-lg px-8 py-4">
              Start Printing <FiArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6">
        <motion.div variants={stagger} className="grid md:grid-cols-3 gap-8">
          {[
            { icon: FiUploadCloud, color: 'bg-blue-100 text-blue-600', title: 'Seamless Uploads', desc: 'Drag and drop your PDF files instantly into our secure cloud storage.' },
            { icon: FiSettings, color: 'bg-purple-100 text-purple-600', title: 'Smart Configuration', desc: 'Select color modes, paper size, and copies with an intuitive interface.' },
            { icon: FiTruck, color: 'bg-emerald-100 text-emerald-600', title: 'Real-time Tracking', desc: 'Watch your order progress from the printer straight to your hands.' }
          ].map((f, i) => (
            <motion.div key={i} variants={fadeUp} whileHover={{ y: -8 }} className="card-modern p-10 text-center md:text-left transition-all group cursor-default">
              <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-6 mx-auto md:mx-0 group-hover:scale-110 transition-transform`}>
                <f.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{f.title}</h3>
              <p className="text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </motion.div>
  );
}