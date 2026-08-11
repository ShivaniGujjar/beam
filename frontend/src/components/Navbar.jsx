import React from 'react';
import { LogOut } from 'lucide-react';

// Same mark used on the landing page and auth screen: a small red square,
// not a gradient rocket badge. Status dot stays functional (yellow while
// deploying, red when idle/ready) rather than decorative.

const Navbar = ({ isDeploying, handleLogout }) => (
  <nav
    className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center border-b border-[#1C1C1F]"
    style={{ fontFamily: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif" }}
  >
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');
      .beam-mono { font-family: ui-monospace, 'IBM Plex Mono', Menlo, Consolas, monospace; }
    `}</style>

    <div className="flex items-center gap-2.5">
      <span className="w-2.5 h-2.5 bg-[#E8352B]" />
      <span className="text-base font-bold tracking-tight text-[#F2F1EE]">BEAM</span>
    </div>

    <div className="flex gap-6 items-center">
      <div className="hidden md:flex gap-2.5 items-center">
        <span className={`h-1.5 w-1.5 ${isDeploying ? 'bg-[#E8352B]' : 'bg-[#3DBE6C]'}`} />
        <span className="beam-mono text-[11px] tracking-[0.1em] text-[#8B8B90]">
          {isDeploying ? 'DEPLOYING' : 'NODE-V22'}
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="p-2 border border-[#1C1C1F] text-[#8B8B90] hover:text-[#E8352B] hover:border-[#E8352B]/40 transition-colors"
      >
        <LogOut size={16} />
      </button>
    </div>
  </nav>
);

export default Navbar;