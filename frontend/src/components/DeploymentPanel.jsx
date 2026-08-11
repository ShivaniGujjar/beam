import React from 'react';
import { Terminal, Globe, CheckCircle2, Circle, ExternalLink } from 'lucide-react';

// Same system as the landing page and auth screen: near-black board, thin
// neutral borders, sharp corners, Space Grotesk for display type, mono only
// for small labels. The pipeline stepper reuses the landing page's pad/trace
// motif at a small scale, so the three screens read as one product.

const DeploymentPanel = ({
  projectName, setProjectName, repoUrl, setRepoUrl,
  handleDeploy, isDeploying, steps, currentStep,
  logs, logEndRef, setLogs, deployLink,
}) => (
  <div
    className="grid grid-cols-1 lg:grid-cols-12 gap-8"
    style={{ fontFamily: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif" }}
  >
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');
      .beam-body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', ui-sans-serif, system-ui, sans-serif; }
      .beam-mono { font-family: ui-monospace, 'IBM Plex Mono', Menlo, Consolas, monospace; }
      .beam-input:focus { border-color: #E8352B; }
      @keyframes beam-fade-in { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: translateX(0); } }
      .beam-log-line { animation: beam-fade-in 0.15s ease-out; }
    `}</style>

    {/* Left: inputs & status */}
    <div className="lg:col-span-5 space-y-6">
      <section className="bg-[#0D0D0E] border border-[#1C1C1F] p-7">
        <h2 className="text-base font-bold mb-7 tracking-tight">Launch configuration</h2>
        <div className="space-y-5">
          <div>
            <label className="beam-mono text-[11px] text-[#8B8B90] tracking-[0.1em] block mb-2">
              PROJECT NAME
            </label>
            <input
              className="beam-input beam-body w-full bg-[#0A0A0B] border border-[#1C1C1F] p-3.5 text-sm text-[#F2F1EE] placeholder:text-[#5B5B60] outline-none transition-colors"
              placeholder="e.g. portfolio-v1"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={isDeploying}
            />
          </div>
          <div>
            <label className="beam-mono text-[11px] text-[#8B8B90] tracking-[0.1em] block mb-2">
              REPOSITORY URL
            </label>
            <input
              className="beam-input beam-body w-full bg-[#0A0A0B] border border-[#1C1C1F] p-3.5 text-sm text-[#F2F1EE] placeholder:text-[#5B5B60] outline-none transition-colors"
              placeholder="https://github.com/..."
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={isDeploying}
            />
          </div>
          <button
            onClick={handleDeploy}
            disabled={isDeploying}
            className="w-full bg-[#E8352B] hover:bg-[#FF4438] disabled:bg-[#232326] disabled:text-[#5B5B60] py-3.5 font-medium text-white text-sm transition-colors beam-body"
          >
            {isDeploying ? 'Deploying…' : 'Deploy'}
          </button>
        </div>
      </section>

      {/* Stepper — small trace/pad motif, same language as the hero diagram */}
      <section className="bg-[#0D0D0E] border border-[#1C1C1F] p-7">
        <div className="flex justify-between items-center mb-6">
          <h3 className="beam-mono text-xs text-[#8B8B90] tracking-[0.15em]">PIPELINE STATUS</h3>
          <span className="beam-mono text-xs text-[#E8352B]">{currentStep}/{steps.length}</span>
        </div>
        <div>
          {steps.map((step, i) => {
            const complete = currentStep >= step.id;
            const active = currentStep === step.id;
            return (
              <div key={step.id} className="flex items-start gap-3.5">
                <div className="flex flex-col items-center">
                  {complete ? (
                    <CheckCircle2 size={16} className="text-[#E8352B]" />
                  ) : (
                    <Circle size={16} className="text-[#3A3A3E]" />
                  )}
                  {i < steps.length - 1 && (
                    <div className={`w-px flex-1 min-h-[22px] ${complete ? 'bg-[#E8352B]/40' : 'bg-[#1C1C1F]'}`} />
                  )}
                </div>
                <div className="pb-6 -mt-0.5">
                  <span
                    className={`text-sm beam-body transition-colors ${
                      active ? 'text-[#F2F1EE] font-medium' : complete ? 'text-[#8B8B90]' : 'text-[#5B5B60]'
                    }`}
                  >
                    {step.label}
                  </span>
                  {active && (
                    <span className="beam-mono text-[10px] text-[#E8352B] block mt-1 tracking-wide">
                      in progress
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>

    {/* Right: log stream & result */}
    <div className="lg:col-span-7 flex flex-col gap-6">
      <div className="bg-[#0A0A0B] border border-[#1C1C1F] flex flex-col h-full min-h-[420px]">
        <div className="bg-[#0D0D0E] px-5 py-3.5 flex justify-between items-center border-b border-[#1C1C1F]">
          <div className="flex gap-2 text-[#8B8B90] items-center">
            <Terminal size={13} />
            <span className="beam-mono text-[11px] tracking-[0.1em]">OUTPUT</span>
          </div>
          <button
            onClick={() => setLogs([])}
            className="beam-mono text-[10px] text-[#8B8B90] hover:text-[#F2F1EE] tracking-[0.1em] transition-colors"
          >
            CLEAR
          </button>
        </div>
        <div className="flex-1 p-6 beam-mono text-[12px] leading-6 overflow-y-auto">
          {logs.length === 0 && (
            <div className="text-[#5B5B60]">$ awaiting deployment…</div>
          )}
          {logs.map((log, i) => (
            <div key={i} className="beam-log-line flex gap-3">
              <span className="text-[#3A3A3E] w-4 select-none shrink-0">{i + 1}</span>
              <span className={log.includes('❌') ? 'text-[#E8352B]' : 'text-[#B8B8BC]'}>{log}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>

      {deployLink && (
        <div className="border border-[#1C1C1F] bg-[#0D0D0E] p-6 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="border border-[#E8352B]/30 p-2.5">
              <Globe size={20} className="text-[#E8352B]" />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-tight">Deployment live</h4>
              <p className="beam-mono text-[11px] text-[#8B8B90] mt-1">{deployLink}</p>
            </div>
          </div>
          <a
            href={deployLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-[#E8352B] hover:bg-[#FF4438] text-white px-5 py-2.5 text-xs font-medium transition-colors beam-body shrink-0"
          >
            Visit site <ExternalLink size={13} />
          </a>
        </div>
      )}
    </div>
  </div>
);

export default DeploymentPanel;