import { useState, useEffect } from 'react';
import {
  DollarSign,
  ShieldCheck,
  Building2,
  FileText,
  AlertTriangle,
  Info,
  Briefcase,
  Users,
  Award,
  Mail
} from 'lucide-react';
import { getExpectedLoss, getFairness, getHotspots, getActionDrafts } from '../services/api';
import type { ExpectedLossResponse, ActionDraft } from '../types/api';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<'loss' | 'fairness' | 'hotspots' | 'drafts'>('loss');

  const [lossData, setLossData] = useState<ExpectedLossResponse | null>(null);
  const [fairnessData, setFairnessData] = useState<any>(null);
  const [hotspotsData, setHotspotsData] = useState<any>(null);
  const [draftsData, setDraftsData] = useState<ActionDraft[] | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllAnalytics() {
      try {
        setLoading(true);
        const [loss, fairness, hotspots, drafts] = await Promise.all([
          getExpectedLoss().catch(() => null),
          getFairness().catch(() => null),
          getHotspots().catch(() => null),
          getActionDrafts().catch(() => null),
        ]);

        setLossData(loss);
        setFairnessData(fairness);
        setHotspotsData(hotspots);
        setDraftsData(drafts);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAllAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#695CFF]/20 border-t-[#695CFF] animate-spin" />
        <p className="text-sm font-medium">Loading Stage 3 Advanced Intelligence Modules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
        <div className="flex items-center gap-3">
          <AlertTriangle size={24} />
          <div>
            <h3 className="font-bold text-lg">Failed to load Analytics</h3>
            <p className="text-xs mt-1 text-rose-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/30">
            Stage 3 Advanced Intelligence
          </span>
          <span className="text-xs text-slate-400 font-mono">Business Analytics & Auditing</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-50 tracking-tight mt-1">
          Advanced HR Analytics & Intelligence
        </h1>
        <p className="text-sm text-slate-400">
          Financial loss exposure prioritization, demographic fairness auditing, departmental hotspots, and retention outreach action drafts.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#1E2D52] pb-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab('loss')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'loss'
              ? 'border-[#695CFF] text-[#695CFF] bg-[#695CFF]/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign size={16} />
          <span>Expected Loss Prioritization</span>
        </button>

        <button
          onClick={() => setActiveTab('fairness')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'fairness'
              ? 'border-[#00F2FE] text-[#00F2FE] bg-[#00F2FE]/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck size={16} />
          <span>Fairness Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('hotspots')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'hotspots'
              ? 'border-amber-400 text-amber-400 bg-amber-400/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 size={16} />
          <span>Risk Hotspots</span>
        </button>

        <button
          onClick={() => setActiveTab('drafts')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'drafts'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-400/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText size={16} />
          <span>Retention Action Drafts</span>
        </button>
      </div>

      {/* TAB 1: EXPECTED LOSS */}
      {activeTab === 'loss' && (
        <div className="space-y-6">
          {lossData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="glass-card rounded-xl p-5 border border-[#1E2D52]">
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Risk Watchlist Overlap</div>
                  <div className="text-3xl font-extrabold text-[#695CFF] mt-2">
                    {lossData.overlap_with_risk_top50} / 50
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Employees present in both pure risk Top-50 and expected financial loss Top-50.
                  </p>
                </div>

                <div className="glass-card rounded-xl p-5 border border-[#1E2D52]">
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Salary Replacement Factor</div>
                  <div className="text-3xl font-extrabold text-[#00F2FE] mt-2">
                    {lossData.assumptions.months_salary_cost} Months
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Standard HR replacement cost multiplier benchmark.</p>
                </div>

                <div className="glass-card rounded-xl p-5 border border-[#1E2D52] flex flex-col justify-between">
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Prioritization Metric</div>
                  <div className="text-sm font-bold text-slate-100 mt-2 font-mono">
                    Score = Risk &times; MonthlyIncome &times; 6.0
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Relative financial exposure ranking.</p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
                <Info size={18} className="flex-shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <span className="font-bold">Financial Disclaimer:</span> {lossData.assumptions.disclaimer}
                </div>
              </div>

              {/* Expected Loss Table */}
              <div className="glass-card rounded-2xl border border-[#1E2D52] overflow-hidden">
                <div className="p-4 border-b border-[#1E2D52] font-bold text-slate-100 text-sm flex items-center gap-2">
                  <DollarSign size={16} className="text-[#695CFF]" />
                  Top Employees Ranked by Financial Exposure (Expected Loss)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0B1020]/80 border-b border-[#1E2D52] text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3.5 px-4 text-center">Rank</th>
                        <th className="py-3.5 px-4">Employee ID</th>
                        <th className="py-3.5 px-4">Predicted Risk</th>
                        <th className="py-3.5 px-4">Monthly Salary</th>
                        <th className="py-3.5 px-4 text-right">Expected Loss Exposure</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2D52]/60 text-xs">
                      {lossData.items.slice(0, 15).map((item) => (
                        <tr key={item.EmployeeNumber} className="hover:bg-[#161F35]/80 transition">
                          <td className="py-3.5 px-4 text-center font-bold text-slate-400">#{item.rank_by_loss}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-100">#{item.EmployeeNumber}</td>
                          <td className="py-3.5 px-4 font-semibold text-[#00F2FE]">{(item.risk * 100).toFixed(1)}%</td>
                          <td className="py-3.5 px-4 font-mono text-slate-300">${item.MonthlyIncome.toLocaleString()}</td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                            ${Math.round(item.expected_loss_score).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-slate-500 text-sm py-8">Expected Loss data unavailable. Run `python -m src.extras.run_analytics`.</div>
          )}
        </div>
      )}

      {/* TAB 2: FAIRNESS AUDIT */}
      {activeTab === 'fairness' && (
        <div className="space-y-6">
          {fairnessData ? (
            <>
              {/* Disclaimer */}
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-start gap-3">
                <Info size={18} className="flex-shrink-0 mt-0.5 text-blue-400" />
                <div>
                  <span className="font-bold">Diagnostic Monitor Rationale:</span> {fairnessData.disclaimer}
                </div>
              </div>

              {/* Group Analysis Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(fairnessData.groups).map(([colName, groups]: [string, any]) => (
                  <div key={colName} className="glass-card rounded-2xl p-5 border border-[#1E2D52] space-y-4">
                    <h3 className="font-bold text-slate-100 text-sm border-b border-[#1E2D52] pb-3 flex items-center gap-2">
                      <Users size={16} className="text-[#00F2FE]" />
                      {colName} Audit
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(groups).map(([groupName, stats]: [string, any]) => (
                        <div key={groupName} className="p-3 rounded-xl bg-[#0B1020] border border-[#1E2D52] text-xs space-y-1.5">
                          <div className="flex justify-between font-bold text-slate-200">
                            <span>{groupName}</span>
                            <span className="text-slate-400">Headcount: {stats.headcount}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#1E2D52]/60">
                            <span className="text-slate-400">Avg Risk:</span>
                            <span className="text-right font-bold text-[#695CFF]">{(stats.average_predicted_risk * 100).toFixed(1)}%</span>
                            <span className="text-slate-400">Observed Rate:</span>
                            <span className="text-right font-bold text-slate-300">{(stats.observed_attrition_rate * 100).toFixed(1)}%</span>
                            {stats.risk_ratio_vs_ref !== undefined && (
                              <>
                                <span className="text-slate-400">Risk Ratio vs Ref:</span>
                                <span className="text-right font-bold text-[#00F2FE]">{stats.risk_ratio_vs_ref.toFixed(2)}x</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Model Performance With vs Without Demographics */}
              {fairnessData.model_comparison && (
                <div className="glass-card rounded-2xl p-6 border border-[#1E2D52] space-y-4">
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    <Award size={18} className="text-purple-400" />
                    Model Performance Impact: Including vs. Excluding Demographics
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#161F35] border border-[#1E2D52]">
                      <div className="text-xs font-bold text-slate-300">Full Pipeline (With Demographics)</div>
                      <div className="text-2xl font-extrabold text-[#695CFF] mt-2">
                        ROC-AUC: {(fairnessData.model_comparison.with_demographics.roc_auc * 100).toFixed(2)}%
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        PR-AUC: {(fairnessData.model_comparison.with_demographics.pr_auc * 100).toFixed(2)}%
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#161F35] border border-[#1E2D52]">
                      <div className="text-xs font-bold text-slate-300">Demographic-Excluded Pipeline</div>
                      <div className="text-2xl font-extrabold text-[#00F2FE] mt-2">
                        ROC-AUC: {(fairnessData.model_comparison.without_demographics.roc_auc * 100).toFixed(2)}%
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        PR-AUC: {(fairnessData.model_comparison.without_demographics.pr_auc * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-slate-500 text-sm py-8">Fairness audit data unavailable.</div>
          )}
        </div>
      )}

      {/* TAB 3: HOTSPOTS */}
      {activeTab === 'hotspots' && (
        <div className="space-y-6">
          {hotspotsData ? (
            <>
              {/* Department Hotspots */}
              <div className="glass-card rounded-2xl border border-[#1E2D52] overflow-hidden">
                <div className="p-4 border-b border-[#1E2D52] font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Building2 size={16} className="text-amber-400" />
                  Department Attrition Hotspots
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#0B1020]/80 border-b border-[#1E2D52] text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3.5 px-4">Department</th>
                        <th className="py-3.5 px-4">Total Headcount</th>
                        <th className="py-3.5 px-4">Observed Attrition Rate</th>
                        <th className="py-3.5 px-4">Mean Predicted Risk</th>
                        <th className="py-3.5 px-4 text-right">Top-50 Watchlist Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2D52]/60">
                      {hotspotsData.departments.map((d: any) => (
                        <tr key={d.Department} className="hover:bg-[#161F35]/80 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-100">{d.Department}</td>
                          <td className="py-3.5 px-4 text-slate-300">{d.headcount}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-300">{(d.observed_attrition_rate * 100).toFixed(1)}%</td>
                          <td className="py-3.5 px-4 font-bold text-amber-400">{(d.mean_predicted_risk * 100).toFixed(1)}%</td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-[#695CFF]">{d.watchlist_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Job Role Hotspots */}
              <div className="glass-card rounded-2xl border border-[#1E2D52] overflow-hidden">
                <div className="p-4 border-b border-[#1E2D52] font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Briefcase size={16} className="text-cyan-400" />
                  Job Role Risk Breakdown
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#0B1020]/80 border-b border-[#1E2D52] text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3.5 px-4">Job Role</th>
                        <th className="py-3.5 px-4">Headcount</th>
                        <th className="py-3.5 px-4">Observed Attrition Rate</th>
                        <th className="py-3.5 px-4">Mean Predicted Risk</th>
                        <th className="py-3.5 px-4 text-right">Watchlist Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2D52]/60">
                      {hotspotsData.roles.map((r: any) => (
                        <tr key={r.JobRole} className="hover:bg-[#161F35]/80 transition">
                          <td className="py-3 px-4 font-bold text-slate-100">{r.JobRole}</td>
                          <td className="py-3 px-4 text-slate-300">{r.headcount}</td>
                          <td className="py-3 px-4 font-semibold text-slate-300">{(r.observed_attrition_rate * 100).toFixed(1)}%</td>
                          <td className="py-3 px-4 font-bold text-amber-400">{(r.mean_predicted_risk * 100).toFixed(1)}%</td>
                          <td className="py-3 px-4 text-right font-bold text-[#695CFF]">{r.watchlist_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-slate-500 text-sm py-8">Hotspots data unavailable.</div>
          )}
        </div>
      )}

      {/* TAB 4: ACTION DRAFTS */}
      {activeTab === 'drafts' && (
        <div className="space-y-6">
          {draftsData ? (
            <>
              {/* Notice */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
                <Mail size={18} className="flex-shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <span className="font-bold">Human Oversight Control:</span> Retention outreach drafts are pre-formatted for HR review with status <strong className="text-amber-400">PENDING_APPROVAL</strong>. No external emails are automatically executed.
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {draftsData.map((draft, idx) => (
                  <div key={draft.employee_id} className="glass-card rounded-2xl border border-[#1E2D52] overflow-hidden space-y-3">
                    <div className="bg-[#161F35] px-5 py-3 border-b border-[#1E2D52] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#695CFF]/20 text-[#695CFF] font-bold text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-slate-100 text-sm">
                          Retention Strategy Draft: Employee #{draft.employee_id}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        {draft.status}
                      </span>
                    </div>

                    <div className="p-5 space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 font-mono">
                        <div><strong className="text-slate-400 font-sans">To:</strong> {draft.to}</div>
                        <div><strong className="text-slate-400 font-sans">Risk Level:</strong> {draft.risk_pct.toFixed(1)}%</div>
                        <div className="sm:col-span-2"><strong className="text-slate-400 font-sans">Subject:</strong> {draft.subject}</div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E2D52] text-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                        {draft.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-slate-500 text-sm py-8">Action drafts unavailable.</div>
          )}
        </div>
      )}
    </div>
  );
}
