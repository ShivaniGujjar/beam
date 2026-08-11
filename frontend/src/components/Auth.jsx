import React from 'react';
import { Mail, Lock, UserPlus } from 'lucide-react';

// Same system as the landing page: near-black board, thin neutral borders,
// sharp corners, Space Grotesk for display type, mono only for tiny labels.
// Red shows up in exactly three places here too: the mark, the focus state,
// and the primary button — same restraint as the landing page.

const Auth = ({ authMode, setAuthMode, email, setEmail, password, setPassword, authError, handleAuth }) => {
  const isLogin = authMode === 'login';

  return (
    <div
      className="min-h-screen bg-[#0A0A0B] text-[#F2F1EE] flex items-center justify-center p-6"
      style={{ fontFamily: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');
        .beam-body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .beam-mono { font-family: ui-monospace, 'IBM Plex Mono', Menlo, Consolas, monospace; }
        .beam-input:focus { border-color: #E8352B; }
      `}</style>

      <div className="w-full max-w-sm">
        {/* mark, consistent with the landing nav */}
        <div className="flex items-center gap-2.5 mb-10">
          <span className="w-2.5 h-2.5 bg-[#E8352B]" />
          <span className="font-bold text-base tracking-tight">BEAM</span>
        </div>

        <div className="border border-[#1C1C1F] bg-[#0D0D0E] p-8">
          <p className="beam-mono text-xs text-[#8B8B90] tracking-[0.15em] mb-2">
            {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </p>
          <h1 className="text-2xl font-bold tracking-tight mb-8">
            {isLogin ? 'Welcome back.' : 'Set up your account.'}
          </h1>

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="beam-mono text-[11px] text-[#8B8B90] tracking-[0.1em] block mb-2">
                EMAIL
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B8B90]" size={16} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="beam-input beam-body w-full bg-[#0A0A0B] border border-[#1C1C1F] py-3 pl-10 pr-3.5 text-sm text-[#F2F1EE] placeholder:text-[#5B5B60] outline-none transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="beam-mono text-[11px] text-[#8B8B90] tracking-[0.1em] block mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B8B90]" size={16} />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  className="beam-input beam-body w-full bg-[#0A0A0B] border border-[#1C1C1F] py-3 pl-10 pr-3.5 text-sm text-[#F2F1EE] placeholder:text-[#5B5B60] outline-none transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {authError && (
              <p className="beam-mono text-[11px] text-[#E8352B] tracking-wide">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-[#E8352B] hover:bg-[#FF4438] py-3.5 font-medium text-white text-sm transition-colors beam-body"
            >
              {isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <button
            onClick={() => setAuthMode(isLogin ? 'signup' : 'login')}
            className="w-full mt-6 beam-mono text-[11px] text-[#8B8B90] hover:text-[#F2F1EE] tracking-[0.1em] transition-colors flex items-center justify-center gap-2"
          >
            {isLogin ? (
              <>
                <UserPlus size={13} /> NEED AN ACCOUNT?
              </>
            ) : (
              <>
                <Lock size={13} /> ALREADY HAVE AN ACCOUNT?
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;