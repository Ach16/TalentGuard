import React, { useState, useEffect } from 'react';
import { X, User, AlertTriangle, CheckCircle, Sliders, Briefcase, DollarSign, Clock, MapPin, Award } from 'lucide-react';
import { getEmployeeDetails } from '../services/api';
import type { EmployeeDetails, WatchlistItem } from '../types/api';
import { RiskBadge } from './RiskBadge';

interface EmployeeDetailDrawerProps {
  item: WatchlistItem | null;
  onClose: () => void;
  onNavigateToSimulator?: (employeeId: number) => void;
}

export const EmployeeDetailDrawer: React.FC<EmployeeDetailDrawerProps> = ({
  item,
  onClose,
  onNavigateToSimulator,
}) => {
  const [details, setDetails] = useState<EmployeeDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item) {
      setDetails(null);
      return;
    }

    setLoading(true);
    setError(null);
    getEmployeeDetails(item.EmployeeNumber)
      .then(setDetails)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [item]);

  if (!item) return null;

  const reasonsList = item.reasons.split(' | ').filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end transition-opacity duration-300">
      <div
        className="w-full max-w-xl bg-[#11182B] border-l border-[#1E2D52] h-full overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#1E2D52] flex items-center justify-between bg-[#161F35]/80 sticky top-0 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#695CFF]/10 border border-[#695CFF]/30 flex items-center justify-center text-[#695CFF] font-bold text-lg">
              #{item.EmployeeNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">Employee #{item.EmployeeNumber}</h2>
                <RiskBadge riskPct={item.risk_pct} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Rank #{item.rank} in Top-50 Attrition Watchlist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1E2D52] transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Risk Indicator Card */}
          <div className="glass-card rounded-xl p-5 border border-[#1E2D52]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attrition Probability</span>
              <span className="text-2xl font-extrabold text-[#695CFF]">{item.risk_pct.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-[#0B1020] rounded-full overflow-hidden p-0.5 border border-[#1E2D52]">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  item.risk_pct >= 70
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                    : 'bg-gradient-to-r from-indigo-500 to-amber-500'
                }`}
                style={{ width: `${Math.min(item.risk_pct, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
              <span>Evaluated using Stratified Out-of-Fold Logistic Regression model predictions.</span>
            </p>
          </div>

          {/* Top Contributing Factors */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Award size={16} className="text-[#695CFF]" />
              Top Risk Contributors
            </h3>
            <div className="space-y-2">
              {reasonsList.map((reason, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-[#161F35] border border-[#1E2D52] flex items-center gap-3 text-slate-200 text-sm font-medium"
                >
                  <span className="w-6 h-6 rounded-full bg-[#695CFF]/20 text-[#695CFF] font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Retention Action */}
          <div className="glass-card rounded-xl p-5 border border-indigo-500/30 bg-gradient-to-br from-[#161F35] to-[#131C35]">
            <div className="flex items-center gap-2 text-[#695CFF] font-semibold text-sm mb-2">
              <CheckCircle size={18} />
              <span>Recommended HR Intervention</span>
            </div>
            <p className="text-slate-100 text-sm leading-relaxed font-medium">
              {item.action || 'Schedule stay-interview to evaluate career satisfaction & workload.'}
            </p>
          </div>

          {/* Employee Context / Attributes */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Briefcase size={16} className="text-cyan-400" />
              Employee Attributes & Profile
            </h3>

            {loading && <div className="text-xs text-slate-400 py-4">Loading employee attributes...</div>}
            {error && <div className="text-xs text-rose-400 py-2">Error loading details: {error}</div>}

            {details && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg bg-[#161F35] border border-[#1E2D52]">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <DollarSign size={14} className="text-emerald-400" />
                    <span>Monthly Income</span>
                  </div>
                  <div className="text-lg font-bold text-slate-100">${details.MonthlyIncome.toLocaleString()}</div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#161F35] border border-[#1E2D52]">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Clock size={14} className="text-amber-400" />
                    <span>Overtime Status</span>
                  </div>
                  <div className="text-lg font-bold text-slate-100">{details.OverTime}</div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#161F35] border border-[#1E2D52]">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <MapPin size={14} className="text-cyan-400" />
                    <span>Business Travel</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-100 truncate">{details.BusinessTravel}</div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#161F35] border border-[#1E2D52]">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <User size={14} className="text-purple-400" />
                    <span>Job Satisfaction</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-100">{details.JobSatisfaction} / 4</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer / Simulator Action */}
        <div className="p-6 border-t border-[#1E2D52] bg-[#161F35]/90 sticky bottom-0 backdrop-blur flex items-center gap-3">
          {onNavigateToSimulator && (
            <button
              onClick={() => {
                onClose();
                onNavigateToSimulator(item.EmployeeNumber);
              }}
              className="w-full bg-gradient-to-r from-[#695CFF] to-[#5648ED] text-white py-3 px-4 rounded-xl font-semibold hover:shadow-[0_0_20px_rgba(105,92,255,0.4)] transition flex items-center justify-center gap-2"
            >
              <Sliders size={18} />
              <span>Simulate Retention Strategy</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
