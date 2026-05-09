import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Mail, Lock, UserPlus } from 'lucide-react';

const Auth = ({ authMode, setAuthMode, email, setEmail, password, setPassword, authError, handleAuth }) => (
  <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans">
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/10 blur-[120px] pointer-events-none" />
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-[#0f0f0f] border border-white/5 p-10 rounded-[32px] shadow-2xl">
      <div className="flex flex-col items-center mb-8">
        <div className="bg-red-600 p-3 rounded-2xl mb-4 shadow-lg shadow-red-600/20">
          <Rocket size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">Beam Engine</h1>
        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-2">{authMode} to continue</p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-4 text-slate-600" size={18} />
          <input type="email" placeholder="Email" required className="w-full bg-black/40 border border-white/5 p-4 pl-12 rounded-2xl focus:border-red-600/50 outline-none text-sm text-white" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-4 text-slate-600" size={18} />
          <input type="password" placeholder="Password" required className="w-full bg-black/40 border border-white/5 p-4 pl-12 rounded-2xl focus:border-red-600/50 outline-none text-sm text-white" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {authError && <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-1">{authError}</p>}
        <button type="submit" className="w-full bg-red-600 py-4 rounded-2xl font-black tracking-widest text-white hover:bg-red-700 transition-all uppercase italic">
          {authMode === 'login' ? 'Ignite Session' : 'Create Account'}
        </button>
      </form>

      <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="w-full mt-6 text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest flex items-center justify-center gap-2">
        {authMode === 'login' ? <><UserPlus size={14}/> Need an account?</> : <><Lock size={14}/> Already have an account?</>}
      </button>
    </motion.div>
  </div>
);

export default Auth;