import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, ArrowRight, Globe, Zap, GitBranch, Server } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  const features = [
    {
      icon: <Zap className="text-red-500" size={20} />,
      title: "Push Code, Get Link",
      desc: "Paste your GitHub URL and let BEAM handle npm installs, static builds, and deployment setups automatically."
    },
    {
      icon: <Terminal className="text-red-500" size={20} />,
      title: "Live Build Terminal",
      desc: "Watch your build logs stream in real-time as your code compiles, so you know exactly what’s happening."
    },
    {
      icon: <Globe className="text-red-500" size={20} />,
      title: "Instant Live URLs",
      desc: "Every deployment gets its own clean link immediately served through our isolated storage proxy."
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-red-600 selection:text-white">
      
      {/* Header */}
      <header className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
          <span className="font-bold text-lg text-white italic tracking-wider">BEAM</span>
        </div>
        <button 
          onClick={onGetStarted}
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
        >
          Sign In
        </button>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-16 px-8 max-w-5xl mx-auto text-center">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="space-y-6 max-w-3xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3.5 py-1 rounded-full text-xs font-mono text-red-500"
          >
            Instant Web Hosting
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-4xl sm:text-6xl font-black text-white italic tracking-tight uppercase leading-tight"
          >
            Deploy React Apps <br />
            <span className="text-red-500">Without The Hassle.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed"
          >
            Drop your GitHub repository link and watch BEAM clone, build, and host your frontend project in under a minute.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="pt-2 flex justify-center"
          >
            <button 
              onClick={onGetStarted}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-7 py-3.5 rounded-2xl flex items-center gap-2 transition-all text-xs tracking-wider uppercase italic shadow-lg shadow-red-600/25 group"
            >
              Deploy Your Project <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Process Flow Box */}
      <section className="max-w-4xl mx-auto px-8 pb-16">
        <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <span className="text-[10px] font-mono text-slate-600">how-it-works</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-black/50 p-4 rounded-xl border border-white/5 flex items-start gap-3">
              <GitBranch className="text-red-500 mt-0.5 shrink-0" size={16} />
              <div>
                <span className="text-white font-bold block">1. Connect Repo</span>
                <span className="text-slate-500 text-[11px]">Paste GitHub link</span>
              </div>
            </div>
            <div className="bg-black/50 p-4 rounded-xl border border-white/5 flex items-start gap-3">
              <Server className="text-red-500 mt-0.5 shrink-0" size={16} />
              <div>
                <span className="text-white font-bold block">2. Auto Build</span>
                <span className="text-slate-500 text-[11px]">Compile assets live</span>
              </div>
            </div>
            <div className="bg-black/50 p-4 rounded-xl border border-white/5 flex items-start gap-3">
              <Globe className="text-red-500 mt-0.5 shrink-0" size={16} />
              <div>
                <span className="text-white font-bold block">3. Live Link</span>
                <span className="text-slate-500 text-[11px]">Get public deployment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 py-12 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div 
              key={i}
              className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl space-y-3"
            >
              <div className="bg-black p-2.5 rounded-lg border border-white/5 w-fit">
                {f.icon}
              </div>
              <h3 className="text-white font-bold italic uppercase tracking-tight text-sm">{f.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default LandingPage;