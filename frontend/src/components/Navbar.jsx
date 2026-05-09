import React from 'react';
import { Rocket, LogOut } from 'lucide-react';

const Navbar = ({ isDeploying, handleLogout }) => (
  <nav className="max-w-7xl mx-auto px-8 py-8 flex justify-between items-center border-b border-white/5">
    <div className="flex items-center gap-3">
      <div className="bg-gradient-to-br from-red-500 to-red-700 p-2 rounded-xl shadow-lg shadow-red-600/20">
        <Rocket size={24} className="text-white" strokeWidth={2.5} />
      </div>
      <span className="text-xl font-black tracking-tighter uppercase italic text-white">
        Beam<span className="text-red-600">.</span>Engine
      </span>
    </div>
    
    <div className="flex gap-6 items-center">
      <div className="hidden md:flex gap-4 items-center">
        <div className={`h-2 w-2 rounded-full ${isDeploying ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase italic">
          Cluster: Node-v22
        </span>
      </div>
      <button 
        onClick={handleLogout} 
        className="p-2 rounded-xl bg-white/5 hover:bg-red-600/10 text-slate-500 hover:text-red-500 transition-all"
      >
        <LogOut size={18} />
      </button>
    </div>
  </nav>
);

export default Navbar;