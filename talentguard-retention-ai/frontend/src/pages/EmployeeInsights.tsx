import { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { getWatchlist } from '../services/api';
import type { WatchlistResponse, WatchlistItem } from '../types/api';
import { RiskBadge } from '../components/RiskBadge';
import { EmployeeDetailDrawer } from '../components/EmployeeDetailDrawer';

interface EmployeeInsightsProps {
  onNavigateToSimulator?: (employeeId: number) => void;
}

export default function EmployeeInsights({ onNavigateToSimulator }: EmployeeInsightsProps) {
  const [watchlist, setWatchlist] = useState<WatchlistResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<WatchlistItem | null>(null);

  useEffect(() => {
    getWatchlist()
      .then(setWatchlist)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#695CFF]/20 border-t-[#695CFF] animate-spin" />
        <p className="text-sm font-medium">Loading Employee Profiles & Intelligence...</p>
      </div>
    );
  }

  const items = watchlist?.items || [];
  const filtered = items.filter(item => item.EmployeeNumber.toString().includes(searchTerm));

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#695CFF]/20 text-[#695CFF] border border-[#695CFF]/30">
            Localized Risk Profiles
          </span>
          <span className="text-xs text-slate-400 font-mono">Employee Intelligence Directory</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-50 tracking-tight mt-1">
          Employee Risk & Retention Insights
        </h1>
        <p className="text-sm text-slate-400">
          In-depth explanation cards detailing risk drivers, compensation context, and recommended retention strategies.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Filter employee profile by ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0B1020] border border-[#1E2D52] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#695CFF]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => {
          const reasonsList = item.reasons.split(' | ').filter(Boolean);
          return (
            <div
              key={item.EmployeeNumber}
              className="glass-card rounded-2xl p-5 border border-[#1E2D52] space-y-4 flex flex-col justify-between hover:border-[#695CFF]/50 transition duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#695CFF]/10 border border-[#695CFF]/30 flex items-center justify-center font-bold text-sm text-[#695CFF]">
                      #{item.EmployeeNumber}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-100">Employee #{item.EmployeeNumber}</div>
                      <div className="text-[10px] text-slate-400">Rank #{item.rank}</div>
                    </div>
                  </div>
                  <RiskBadge riskPct={item.risk_pct} />
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Top Contributors:</div>
                  <div className="flex flex-wrap gap-1">
                    {reasonsList.map((r, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-[#0B1020] border border-[#1E2D52] text-[10px] text-slate-300 font-medium">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0B1020] border border-[#1E2D52] text-xs space-y-1">
                  <div className="text-[10px] font-bold text-[#695CFF] uppercase">Recommended Action:</div>
                  <div className="text-slate-200 leading-snug">{item.action || 'Stay-interview recommended.'}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1E2D52] flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400">${item.MonthlyIncome.toLocaleString()}/mo</span>
                <button
                  onClick={() => setSelectedEmployee(item)}
                  className="px-3 py-1.5 rounded-lg bg-[#161F35] border border-[#1E2D52] text-slate-300 hover:text-slate-100 hover:border-[#695CFF] transition font-semibold flex items-center gap-1 text-[11px]"
                >
                  <Eye size={14} />
                  <span>Full Profile</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <EmployeeDetailDrawer
        item={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onNavigateToSimulator={onNavigateToSimulator}
      />
    </div>
  );
}
