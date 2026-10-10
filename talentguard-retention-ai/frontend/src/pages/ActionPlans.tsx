import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { getActionDrafts } from '../services/api';
import type { ActionDraft } from '../types/api';

export default function ActionPlans() {
  const [drafts, setDrafts] = useState<ActionDraft[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActionDrafts()
      .then(setDrafts)
      .catch(() => setDrafts(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
        <p className="text-sm font-medium">Loading Retention Action Drafts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Human-in-the-Loop Workflow
          </span>
          <span className="text-xs text-slate-400 font-mono">Stage 3 Action Drafts</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-50 tracking-tight mt-1">
          Retention Action Outreach Plans
        </h1>
        <p className="text-sm text-slate-400">
          Pre-generated retention support emails for HR managers targeting the top 10 watch-list employees.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
        <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-amber-400" />
        <div>
          <span className="font-bold">Human Approval Policy:</span> Drafts require manager review. All items remain in status <strong className="text-amber-400">PENDING_APPROVAL</strong>. No emails are sent automatically.
        </div>
      </div>

      {drafts ? (
        <div className="grid grid-cols-1 gap-6">
          {drafts.map((draft, idx) => (
            <div key={draft.employee_id} className="glass-card rounded-2xl border border-[#1E2D52] overflow-hidden space-y-4">
              <div className="bg-[#161F35] px-6 py-4 border-b border-[#1E2D52] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#695CFF]/20 text-[#695CFF] font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">Retention Outreach Plan: Employee #{draft.employee_id}</h3>
                    <p className="text-[11px] text-slate-400">Target Risk: {draft.risk_pct.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    {draft.status}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#0B1020] border border-[#1E2D52]">
                  <div><span className="text-slate-400 font-bold">Recipient:</span> <span className="text-slate-200 font-mono">{draft.to}</span></div>
                  <div><span className="text-slate-400 font-bold">Recommended Action:</span> <span className="text-[#00F2FE]">{draft.recommended_action}</span></div>
                  <div className="sm:col-span-2"><span className="text-slate-400 font-bold">Subject:</span> <span className="text-slate-100 font-mono">{draft.subject}</span></div>
                </div>

                <div className="p-5 rounded-xl bg-[#0B1020] border border-[#1E2D52] text-slate-200 font-mono leading-relaxed whitespace-pre-wrap">
                  {draft.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-slate-500 text-sm py-12">No action drafts generated. Run `python -m src.extras.run_analytics`.</div>
      )}
    </div>
  );
}
