import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Globe, CheckCircle2, Circle, ExternalLink } from 'lucide-react';

const DeploymentPanel = ({ 
  projectName, setProjectName, repoUrl, setRepoUrl, 
  handleDeploy, isDeploying, steps, currentStep, 
  logs, logEndRef, setLogs, deployLink 
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
    {/* Left: Inputs & Status */}
    <div className="lg:col-span-5 space-y-8">
      <section className="bg-[#0f0f0f] border border-white/5 p-8 rounded-[32px] shadow-2xl">
        <h2 className="text-lg font-bold mb-8 text-white tracking-tight italic">Launch Configuration</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Project Identifier</label>
            <input 
              className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl focus:border-red-600/50 outline-none text-sm text-white transition-all" 
              placeholder="e.g. portfolio-v1" 
              value={projectName} 
              onChange={(e) => setProjectName(e.target.value)} 
              disabled={isDeploying} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Source Repository</label>
            <input 
              className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl focus:border-red-600/50 outline-none text-sm text-white transition-all" 
              placeholder="https://github.com/..." 
              value={repoUrl} 
              onChange={(e) => setRepoUrl(e.target.value)} 
              disabled={isDeploying} 
            />
          </div>
          <button 
            onClick={handleDeploy} 
            disabled={isDeploying} 
            className="w-full rounded-2xl bg-red-600 py-4 font-black tracking-widest text-white hover:bg-red-700 disabled:bg-slate-800 transition-all uppercase italic"
          >
            {isDeploying ? 'Engine Running...' : 'Ignite Deployment'}
          </button>
        </div>
      </section>

      {/* Stepper */}
      <section className="bg-[#0f0f0f] border border-white/5 p-8 rounded-[32px]">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Pipeline Status</h3>
           <span className="text-[10px] font-mono text-red-500 uppercase italic">{currentStep}/4 Complete</span>
        </div>
        <div className="space-y-5">
          {steps.map((step) => (
            <div key={step.id} className={`flex items-center gap-4 transition-all duration-500 ${currentStep >= step.id ? 'opacity-100' : 'opacity-20'}`}>
              {currentStep >= step.id ? <CheckCircle2 size={20} className="text-red-500" /> : <Circle size={20} className="text-slate-600" />}
              <span className={`text-sm font-bold tracking-tight ${currentStep === step.id ? 'text-white underline underline-offset-8 decoration-red-600' : 'text-slate-500'}`}>{step.label}</span>
              {currentStep === step.id && <div className="h-1 w-1 rounded-full bg-red-500 animate-ping ml-auto" />}
            </div>
          ))}
        </div>
      </section>
    </div>

    {/* Right: Terminal & Success Card */}
    <div className="lg:col-span-7 flex flex-col gap-8">
      <div className="bg-black border border-white/5 rounded-[32px] overflow-hidden flex flex-col h-full shadow-2xl min-h-[450px]">
        <div className="bg-[#0f0f0f] px-6 py-4 flex justify-between items-center border-b border-white/5">
          <div className="flex gap-2 text-slate-600 items-center">
            <Terminal size={14} />
            <span className="text-[10px] font-mono uppercase italic tracking-tighter">output.stream</span>
          </div>
          <button onClick={() => setLogs([])} className="text-[9px] font-black uppercase text-slate-600 hover:text-white">Clear Logs</button>
        </div>
        <div className="flex-1 p-8 font-mono text-[11px] overflow-y-auto space-y-3 custom-scrollbar">
          <AnimatePresence>
            {logs.length === 0 && <div className="text-slate-800 animate-pulse italic uppercase tracking-widest">{'>'} system idle. await instructions.</div>}
            {logs.map((log, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
                <span className="text-slate-800 w-4 select-none opacity-50">{i+1}</span>
                <span className={log.includes('❌') ? 'text-red-500' : 'text-slate-400'}>
                  <span className="text-red-600 mr-2 opacity-30 italic">#</span> {log}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={logEndRef} />
        </div>
      </div>

      <AnimatePresence>
        {deployLink && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-[1px] rounded-3xl">
            <div className="bg-[#0a0a0a] rounded-[23px] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-red-500/10 p-3 rounded-2xl border border-red-500/20"><Globe size={24} className="text-red-500" /></div>
                <div>
                  <h4 className="text-white font-bold tracking-tight italic uppercase">Mission Accomplished</h4>
                  <p className="text-[10px] font-mono text-slate-500 italic lowercase">{deployLink}</p>
                </div>
              </div>
              <a href={deployLink} target="_blank" className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-black text-xs hover:bg-red-600 hover:text-white transition-all uppercase italic">
                Visit Site <ExternalLink size={14} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);

export default DeploymentPanel;