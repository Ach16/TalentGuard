import { useState, useEffect } from 'react';
import {
  Download,
  Search,
  Filter,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { getWatchlist, getWatchlistDownloadUrl } from '../services/api';
import type { WatchlistResponse, WatchlistItem } from '../types/api';
import { RiskBadge } from '../components/RiskBadge';
import { EmployeeDetailDrawer } from '../components/EmployeeDetailDrawer';

interface WatchListProps {
  onNavigateToSimulator?: (employeeId: number) => void;
}

export default function WatchList({ onNavigateToSimulator }: WatchListProps) {
  const [data, setData] = useState<WatchlistResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'critical' | 'elevated'>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<WatchlistItem | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const result = await getWatchlist();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#695CFF]/20 border-t-[#695CFF] animate-spin" />
        <p className="text-sm font-medium">Loading Top-50 Retention Watch List...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
        <div className="flex items-center gap-3">
          <AlertTriangle size={24} />
          <div>
            <h3 className="font-bold text-lg">Failed to load Watchlist</h3>
            <p className="text-xs mt-1 text-rose-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const filteredItems = data.items.filter((item) => {
    const matchesSearch = item.EmployeeNumber.toString().includes(searchTerm);
    if (riskFilter === 'critical') return matchesSearch && item.risk_pct >= 70;
    if (riskFilter === 'elevated') return matchesSearch && item.risk_pct >= 40 && item.risk_pct < 70;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
              Prioritized Interventions
            </span>
            <span className="text-xs text-slate-400 font-mono">50 Slot Capacity</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-50 tracking-tight mt-1">
            Top-50 Retention Watch List
          </h1>
          <p className="text-sm text-slate-400">
            Employees ranked by predicted attrition risk using Stratified Out-of-Fold Logistic Regression.
          </p>
        </div>

        <a
          href={getWatchlistDownloadUrl()}
          download
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#695CFF] to-[#5648ED] text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-[0_0_20px_rgba(105,92,255,0.3)] hover:shadow-[0_0_25px_rgba(105,92,255,0.5)] transition"
        >
          <Download size={16} />
          <span>Export Watchlist CSV</span>
        </a>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 border border-[#1E2D52]">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">OOF Precision @ 50</div>
          <div className="text-2xl font-extrabold text-slate-50 mt-1">{(data.summary.precision_at_50 * 100).toFixed(1)}%</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium">{data.summary.leavers_caught} of 50 Leavers Caught</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-[#1E2D52]">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Base Attrition Rate</div>
          <div className="text-2xl font-extrabold text-slate-50 mt-1">{(data.summary.base_rate * 100).toFixed(1)}%</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">16.1% Workforce Baseline</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-[#1E2D52]">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Model Lift Over Random</div>
          <div className="text-2xl font-extrabold text-[#695CFF] mt-1">{data.summary.lift.toFixed(1)}x</div>
          <div className="text-[11px] text-[#695CFF] mt-1 font-medium">Precision Lift Factor</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-[#1E2D52]">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Est. Cost Avoided</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            ${Math.round(data.summary.salary_cost_avoided_est).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Based on 20% Save Rate</div>
        </div>
      </div>

      {/* Caution Note */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
        <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-amber-400" />
        <div>
          <span className="font-bold">Human-in-the-Loop Rationale:</span> Predictions are statistical risk rankings to optimize HR capacity. They do not constitute performance reviews or definitive employee judgments.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl border border-[#1E2D52] overflow-hidden">
        <div className="p-4 border-b border-[#1E2D52] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#161F35]/50">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B1020] border border-[#1E2D52] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#695CFF]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Filter size={14} /> Filter Risk:
            </span>
            <button
              onClick={() => setRiskFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                riskFilter === 'all'
                  ? 'bg-[#695CFF] text-white'
                  : 'bg-[#0B1020] text-slate-400 hover:text-slate-200 border border-[#1E2D52]'
              }`}
            >
              All (50)
            </button>
            <button
              onClick={() => setRiskFilter('critical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                riskFilter === 'critical'
                  ? 'bg-rose-500 text-white'
                  : 'bg-[#0B1020] text-slate-400 hover:text-slate-200 border border-[#1E2D52]'
              }`}
            >
              Critical (&ge;70%)
            </button>
            <button
              onClick={() => setRiskFilter('elevated')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                riskFilter === 'elevated'
                  ? 'bg-amber-500 text-white'
                  : 'bg-[#0B1020] text-slate-400 hover:text-slate-200 border border-[#1E2D52]'
              }`}
            >
              Elevated (&lt;70%)
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B1020]/80 border-b border-[#1E2D52] text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center">Rank</th>
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Risk %</th>
                <th className="py-3.5 px-4">Monthly Salary</th>
                <th className="py-3.5 px-4">Top Risk Factors</th>
                <th className="py-3.5 px-4">Recommended Intervention</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2D52]/60 text-xs">
              {filteredItems.map((item: WatchlistItem) => {
                const reasonsList = item.reasons.split(' | ').filter(Boolean);
                return (
                  <tr
                    key={item.EmployeeNumber}
                    onClick={() => setSelectedEmployee(item)}
                    className="hover:bg-[#161F35]/80 transition cursor-pointer group"
                  >
                    <td className="py-4 px-4 text-center font-bold text-slate-400">
                      <span className="w-6 h-6 rounded-full bg-[#1E2D52] inline-flex items-center justify-center text-[11px]">
                        #{item.rank}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-100 group-hover:text-[#695CFF] transition">
                      #{item.EmployeeNumber}
                    </td>
                    <td className="py-4 px-4">
                      <RiskBadge riskPct={item.risk_pct} />
                    </td>
                    <td className="py-4 px-4 font-mono font-medium text-slate-300">
                      ${item.MonthlyIncome.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {reasonsList.map((r, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-[#161F35] border border-[#1E2D52] text-[10px] text-slate-300 font-medium"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-200 max-w-xs truncate">
                      {item.action ? (
                        <span className="text-slate-100">{item.action}</span>
                      ) : (
                        <span className="text-slate-500 italic">Stay-interview recommended</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEmployee(item);
                        }}
                        className="p-1.5 rounded-lg bg-[#161F35] border border-[#1E2D52] text-slate-400 hover:text-slate-100 hover:border-[#695CFF] transition inline-flex items-center gap-1 text-[11px]"
                      >
                        <Eye size={14} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                    No employee records match the search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-Drawer Modal for Inspecting Employee */}
      <EmployeeDetailDrawer
        item={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onNavigateToSimulator={onNavigateToSimulator}
      />
    </div>
  );
}
