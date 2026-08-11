import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Globe, RefreshCw } from 'lucide-react';

const PROXY_BASE_URL = 'https://proxy-server-beam.onrender.com';

const History = ({ history, email, fetchHistory }) => (
  <section className="mt-24 space-y-8">
    <div className="flex items-center justify-between border-b border-white/5 pb-6">
      <div className="flex items-center gap-3">
        <div className="bg-red-600/10 p-2 rounded-lg border border-red-600/20">
          <Layers size={18} className="text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white italic tracking-tighter uppercase">Recent Beams</h3>
          <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase italic">Registry / {email}</p>
        </div>
      </div>
      <button onClick={fetchHistory} className="p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-red-500 transition-colors">
        <RefreshCw size={18} />
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {history && history.map((item) => (
          <motion.div 
            key={item._id} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-[#0f0f0f] border border-white/5 p-6 rounded-[28px] hover:border-red-600/30 transition-all group relative"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="bg-black/40 p-2 rounded-lg border border-white/5 text-slate-500 group-hover:text-red-500 transition-colors">
                <Globe size={16} />
              </div>
              <span className={`text-[9px] px-2 py-1 rounded-full font-black uppercase tracking-tighter ${item.status === 'READY' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                {item.status}
              </span>
            </div>
            
            <h4 className="text-white font-bold text-base mb-1 truncate italic uppercase tracking-tight">
              {item.slug}
            </h4>
            
            <p className="text-[10px] text-slate-600 font-mono mb-6 truncate italic">{item.gitUrl}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
               <span className="text-[9px] text-slate-700 font-mono uppercase">
                 {new Date(item.createdAt).toLocaleDateString()}
               </span>
               
               <a 
                 href={`${PROXY_BASE_URL}/${item.slug}/index.html`} 
                 target="_blank" 
                 rel="noreferrer"
                 className="text-[9px] font-black text-white bg-red-600/5 hover:bg-red-600 px-4 py-2 rounded-xl transition-all uppercase italic"
               >
                 View Live
               </a>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {(!history || history.length === 0) && (
        <p className="text-slate-600 text-xs italic">No active beams found in registry.</p>
      )}
    </div>
  </section>
);

export default History;