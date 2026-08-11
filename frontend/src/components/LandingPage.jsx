import React from 'react';
import { Terminal, Radio, Globe, ArrowRight } from 'lucide-react';

// ---------------------------------------------------------------------------
// BEAM — signature idea: a circuit/trace diagram (repo -> build -> live),
// since the product is literally routing your code from a source to a
// live destination. Rendered as thin right-angle traces on a dark board,
// like a schematic — not a glowing terminal. Red is used in exactly three
// places: the trace, the logo mark, and the primary button. Everything
// else stays quiet on purpose.
// ---------------------------------------------------------------------------

const steps = [
  {
    n: '01',
    label: 'CLONE',
    title: 'Paste the URL',
    desc: 'Drop in a GitHub repository link. Nothing to configure first.',
  },
  {
    n: '02',
    label: 'BUILD',
    title: 'Watch it build',
    desc: 'Dependencies install and assets compile — streamed to you as it happens.',
  },
  {
    n: '03',
    label: 'LIVE',
    title: 'Get your link',
    desc: 'A public URL, served the instant the build finishes.',
  },
];

const features = [
  {
    icon: <Terminal size={17} />,
    title: 'Automatic builds',
    desc: 'Cloning, dependency install, and static builds run themselves — no build.yml to write.',
  },
  {
    icon: <Radio size={17} />,
    title: 'Live build stream',
    desc: "Every line of build output shows up in your dashboard the moment it's written, not after.",
  },
  {
    icon: <Globe size={17} />,
    title: 'Instant live links',
    desc: 'A dedicated public URL, served through our reverse proxy the second the build passes.',
  },
];

// A thin right-angle trace connecting three pads: repo -> build -> live.
const BeamTrace = () => (
  <svg viewBox="0 0 400 320" className="w-full h-auto overflow-visible" fill="none">
    {/* faint board grid */}
    {Array.from({ length: 11 }).map((_, i) => (
      <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="320" stroke="#1C1C1F" strokeWidth="1" />
    ))}
    {Array.from({ length: 9 }).map((_, i) => (
      <line key={`h${i}`} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="#1C1C1F" strokeWidth="1" />
    ))}

    {/* trace: repo (top-left) -> build (mid-right) -> live (bottom-left) */}
    <path
      d="M 60 50 H 180 V 150 H 340 V 270 H 220"
      stroke="#E8352B"
      strokeWidth="1.5"
      strokeLinecap="square"
    />

    {/* pads — label sits on its own line below/above the pad, centered on it,
        so there's no risk of text running off the board on either side */}
    <g>
      <rect x="52" y="42" width="16" height="16" fill="#0A0A0B" stroke="#E8352B" strokeWidth="1.5" />
      <text
        x="60"
        y="68"
        fill="#F2F1EE"
        fontSize="12"
        fontFamily="ui-monospace, monospace"
        letterSpacing="0.5"
        textAnchor="middle"
      >
        repo
      </text>
    </g>
    <g>
      <rect x="332" y="142" width="16" height="16" fill="#0A0A0B" stroke="#E8352B" strokeWidth="1.5" />
      <text
        x="340"
        y="126"
        fill="#F2F1EE"
        fontSize="12"
        fontFamily="ui-monospace, monospace"
        letterSpacing="0.5"
        textAnchor="middle"
      >
        build
      </text>
    </g>
    <g>
      <rect x="212" y="262" width="16" height="16" fill="#E8352B" stroke="#E8352B" strokeWidth="1.5" />
      <text
        x="220"
        y="296"
        fill="#E8352B"
        fontSize="12"
        fontFamily="ui-monospace, monospace"
        letterSpacing="0.5"
        textAnchor="middle"
      >
        live
      </text>
    </g>
  </svg>
);

const LandingPage = ({ onGetStarted }) => {
  return (
    <div
      className="min-h-screen bg-[#0A0A0B] text-[#F2F1EE]"
      style={{ fontFamily: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');
        .beam-body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .beam-mono { font-family: ui-monospace, 'IBM Plex Mono', Menlo, Consolas, monospace; }
      `}</style>

      {/* Navbar */}
      <header className="max-w-6xl mx-auto px-8 py-7 flex justify-between items-center border-b border-[#1C1C1F]">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 bg-[#E8352B]" />
          <span className="font-bold text-base tracking-tight">BEAM</span>
        </div>
        <div className="flex items-center gap-7 beam-body text-sm">
          <button onClick={onGetStarted} className="text-[#8B8B90] hover:text-[#F2F1EE] transition-colors">
            Sign in
          </button>
          <button
            onClick={onGetStarted}
            className="bg-[#E8352B] hover:bg-[#FF4438] text-white font-medium px-4 py-2 transition-colors"
          >
            Get started
          </button>
        </div>
      </header>

      {/* Hero — asymmetric: copy left, trace diagram right */}
      <section className="max-w-6xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
        <div>
          <p className="beam-mono text-xs text-[#8B8B90] tracking-[0.15em] mb-5">DEPLOYMENT, ROUTED</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08] mb-6">
            From repo to live URL,
            <br />
            with one <span className="text-[#E8352B]">straight line.</span>
          </h1>
          <p className="beam-body text-[#8B8B90] text-base leading-relaxed mb-9 max-w-md">
            BEAM clones, builds, and hosts your React project. Paste a GitHub
            link and get a working deployment before you've refilled your
            coffee.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-[#E8352B] hover:bg-[#FF4438] text-white font-medium px-6 py-3.5 inline-flex items-center gap-2 transition-colors beam-body text-sm group"
          >
            Deploy your first project
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="border border-[#1C1C1F] bg-[#0D0D0E] p-8">
          <BeamTrace />
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-8 pb-24 border-t border-[#1C1C1F] pt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((s) => (
            <div key={s.n}>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="beam-mono text-xs text-[#E8352B]">{s.n}</span>
                <span className="beam-mono text-xs text-[#8B8B90] tracking-[0.15em]">{s.label}</span>
              </div>
              <h3 className="font-bold text-lg mb-2">{s.title}</h3>
              <p className="beam-body text-[#8B8B90] text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature list */}
      <section className="max-w-6xl mx-auto px-8 pb-28 border-t border-[#1C1C1F] pt-16">
        <div className="space-y-0">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-5 py-6 border-b border-[#1C1C1F]"
            >
              <div className="text-[#E8352B] mt-0.5 shrink-0">{f.icon}</div>
              <div>
                <h3 className="font-bold text-base mb-1.5">{f.title}</h3>
                <p className="beam-body text-[#8B8B90] text-sm leading-relaxed max-w-lg">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;