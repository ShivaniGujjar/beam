import React, { useState } from 'react';
import { Layers, Globe, RefreshCw, Trash2, Check, X } from 'lucide-react';

// Closes out the system: same board, same borders, same restraint. Status
// pills keep functional color (green/amber) since that's information, not
// decoration — everything else stays on the neutral/red palette.
//
// handleDelete(item) is called once the person confirms — wire it up to
// your DELETE call, then presumably re-run fetchHistory() on success.

const DeleteButton = ({ item, onDelete }) => {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (deleting) {
    return (
      <button
        disabled
        className="beam-mono text-[10px] text-[#5B5B60] border border-[#1C1C1F] px-3 py-1.5 tracking-[0.05em] shrink-0"
      >
        DELETING…
      </button>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={async () => {
            setDeleting(true);
            try {
              await onDelete(item);
            } finally {
              setDeleting(false);
              setConfirming(false);
            }
          }}
          className="beam-mono text-[10px] text-white bg-[#E8352B] hover:bg-[#FF4438] px-3 py-1.5 tracking-[0.05em] transition-colors"
        >
          CONFIRM
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="beam-mono text-[10px] text-[#8B8B90] hover:text-[#F2F1EE] border border-[#1C1C1F] px-3 py-1.5 tracking-[0.05em] transition-colors"
        >
          CANCEL
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title="Delete deployment"
      className="p-1.5 border border-[#1C1C1F] text-[#8B8B90] hover:text-[#E8352B] hover:border-[#E8352B]/40 transition-colors shrink-0"
    >
      <Trash2 size={13} />
    </button>
  );
};

const History = ({ history, email, fetchHistory, handleDelete }) => (
  <section
    className="mt-20 space-y-7"
    style={{ fontFamily: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif" }}
  >
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');
      .beam-body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', ui-sans-serif, system-ui, sans-serif; }
      .beam-mono { font-family: ui-monospace, 'IBM Plex Mono', Menlo, Consolas, monospace; }
      @keyframes beam-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .beam-card { animation: beam-rise 0.25s ease-out; }
    `}</style>

    <div className="flex items-center justify-between border-b border-[#1C1C1F] pb-6">
      <div className="flex items-center gap-3">
        <div className="border border-[#1C1C1F] p-2">
          <Layers size={16} className="text-[#E8352B]" />
        </div>
        <div>
          <h3 className="text-base font-bold tracking-tight">Recent deploys</h3>
          <p className="beam-mono text-[11px] text-[#8B8B90] tracking-[0.08em] mt-1">{email}</p>
        </div>
      </div>
      <button
        onClick={fetchHistory}
        className="p-2 border border-[#1C1C1F] text-[#8B8B90] hover:text-[#E8352B] hover:border-[#E8352B]/40 transition-colors"
      >
        <RefreshCw size={15} />
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {history && history.map((item) => (
        <div
          key={item._id}
          className="beam-card bg-[#0D0D0E] border border-[#1C1C1F] hover:border-[#E8352B]/30 p-6 transition-colors"
        >
          <div className="flex justify-between items-start mb-6 gap-3">
            <div className="border border-[#1C1C1F] p-1.5 text-[#8B8B90] shrink-0">
              <Globe size={14} />
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`beam-mono text-[10px] px-2 py-0.5 tracking-[0.08em] shrink-0 ${
                  item.status === 'READY' ? 'text-[#3DBE6C]' : 'text-[#E0A63D]'
                }`}
              >
                {item.status}
              </span>
              <DeleteButton item={item} onDelete={handleDelete} />
            </div>
          </div>

          <h4 className="font-bold text-sm mb-1.5 truncate">{item.slug}</h4>
          <p className="beam-mono text-[11px] text-[#8B8B90] mb-6 truncate">{item.gitUrl}</p>

          <div className="flex items-center justify-between pt-4 border-t border-[#1C1C1F]">
            <span className="beam-mono text-[10px] text-[#5B5B60]">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
            <a
              href={`http://${item.slug}.localhost:8000`}
              target="_blank"
              rel="noreferrer"
              className="beam-mono text-[10px] text-[#F2F1EE] border border-[#1C1C1F] hover:bg-[#E8352B] hover:border-[#E8352B] px-3 py-1.5 tracking-[0.05em] transition-colors"
            >
              VIEW LIVE
            </a>
          </div>
        </div>
      ))}

      {(!history || history.length === 0) && (
        <p className="beam-body text-[#8B8B90] text-sm">No deployments yet.</p>
      )}
    </div>
  </section>
);

export default History;