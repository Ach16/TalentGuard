import { useState, useEffect } from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  DollarSign,
  Clock,
  MapPin,
  Smile
} from 'lucide-react';
import { getEmployees, getEmployeeDetails, postWhatIf } from '../services/api';
import type { EmployeeBasic, EmployeeDetails, WhatIfChanges, WhatIfResponse } from '../types/api';
import { RiskBadge } from '../components/RiskBadge';

interface SimulatorProps {
  initialEmployeeId?: number | null;
}

export default function Simulator({ initialEmployeeId }: SimulatorProps) {
  const [employees, setEmployees] = useState<EmployeeBasic[]>([]);
  const [selectedId, setSelectedId] = useState<number | ''>(initialEmployeeId || '');
  const [details, setDetails] = useState<EmployeeDetails | null>(null);

  const [changes, setChanges] = useState<WhatIfChanges>({});
  const [incomeHike, setIncomeHike] = useState<number>(0);

  const [result, setResult] = useState<WhatIfResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEmployees()
      .then(setEmployees)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (initialEmployeeId) {
      setSelectedId(initialEmployeeId);
    }
  }, [initialEmployeeId]);

  useEffect(() => {
    if (!selectedId) {
      setDetails(null);
      setResult(null);
      setChanges({});
      setIncomeHike(0);
      return;
    }

    setLoading(true);
    setError(null);
    getEmployeeDetails(Number(selectedId))
      .then((data) => {
        setDetails(data);
        setChanges({});
        setIncomeHike(0);
        setResult(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const handleSimulate = async () => {
    if (!selectedId || !details) return;

    setLoading(true);
    setError(null);
    try {
      const currentIncome = details.MonthlyIncome;
      const newIncome = currentIncome * (1 + incomeHike / 100);

      const payloadChanges = { ...changes };
      if (incomeHike > 0) {
        payloadChanges.MonthlyIncome = newIncome;
      }

      const res = await postWhatIf({
        employee_id: Number(selectedId),
        changes: payloadChanges,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setChanges({});
    setIncomeHike(0);
    setResult(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#695CFF]/20 text-[#695CFF] border border-[#695CFF]/30">
            Interactive Scenario Analysis
          </span>
          <span className="text-xs text-slate-400 font-mono">Model Sensitivity Simulator</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-50 tracking-tight mt-1">
          What-If Retention Strategy Simulator
        </h1>
        <p className="text-sm text-slate-400">
          Simulate how hypothetical HR interventions (salary adjustments, overtime removal, travel changes) impact predicted attrition probability.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-start gap-3">
        <Sparkles size={18} className="flex-shrink-0 mt-0.5 text-[#695CFF]" />
        <div>
          <span className="font-bold">Model Sensitivity Rationale:</span> This simulator evaluates feature perturbation using the trained Logistic Regression model pipeline. It provides predictive sensitivity estimations, not causal proof of guaranteed retention.
        </div>
      </div>

      {/* Employee Selector Card */}
      <div className="glass-card rounded-2xl p-6 border border-[#1E2D52]">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          1. Select Employee Target
        </label>
        <div className="max-w-xl">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(Number(e.target.value) || '')}
            className="w-full bg-[#0B1020] border border-[#1E2D52] rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-[#695CFF]"
          >
            <option value="">-- Choose an employee from Watchlist / Sample --</option>
            {employees.map((emp) => (
              <option key={emp.EmployeeNumber} value={emp.EmployeeNumber}>
                Employee #{emp.EmployeeNumber} &mdash; Watchlist Predicted Risk: {(emp.risk * 100).toFixed(1)}%
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          Error: {error}
        </div>
      )}

      {/* Simulator Workspace */}
      {details && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel (7 Cols) */}
          <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-[#1E2D52] space-y-6">
            <div className="flex items-center justify-between border-b border-[#1E2D52] pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Sliders size={18} className="text-[#695CFF]" />
                  2. Modify Retention Parameters
                </h2>
                <p className="text-xs text-slate-400">Target Employee #{details.EmployeeNumber}</p>
              </div>
              <RiskBadge riskPct={details.MonthlyIncome ? 65 : 50} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Overtime */}
              <div className="p-4 rounded-xl bg-[#161F35] border border-[#1E2D52] space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-400" /> Overtime Requirement
                </label>
                <select
                  value={changes.OverTime || details.OverTime}
                  onChange={(e) => setChanges({ ...changes, OverTime: e.target.value })}
                  className="w-full bg-[#0B1020] border border-[#1E2D52] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#695CFF]"
                >
                  <option value="Yes">Yes (Mandatory Overtime)</option>
                  <option value="No">No (Overtime Exempt)</option>
                </select>
                <div className="text-[10px] text-slate-400">Baseline: {details.OverTime}</div>
              </div>

              {/* Business Travel */}
              <div className="p-4 rounded-xl bg-[#161F35] border border-[#1E2D52] space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MapPin size={14} className="text-cyan-400" /> Business Travel Load
                </label>
                <select
                  value={changes.BusinessTravel || details.BusinessTravel}
                  onChange={(e) => setChanges({ ...changes, BusinessTravel: e.target.value })}
                  className="w-full bg-[#0B1020] border border-[#1E2D52] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#695CFF]"
                >
                  <option value="Non-Travel">Non-Travel</option>
                  <option value="Travel_Rarely">Travel_Rarely</option>
                  <option value="Travel_Frequently">Travel_Frequently</option>
                </select>
                <div className="text-[10px] text-slate-400 truncate">Baseline: {details.BusinessTravel}</div>
              </div>

              {/* Job Satisfaction */}
              <div className="p-4 rounded-xl bg-[#161F35] border border-[#1E2D52] space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Smile size={14} className="text-purple-400" /> Target Job Satisfaction
                </label>
                <select
                  value={changes.JobSatisfaction || details.JobSatisfaction}
                  onChange={(e) => setChanges({ ...changes, JobSatisfaction: Number(e.target.value) })}
                  className="w-full bg-[#0B1020] border border-[#1E2D52] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#695CFF]"
                >
                  <option value={1}>1 - Low Satisfaction</option>
                  <option value={2}>2 - Medium Satisfaction</option>
                  <option value={3}>3 - High Satisfaction</option>
                  <option value={4}>4 - Very High Satisfaction</option>
                </select>
                <div className="text-[10px] text-slate-400">Baseline: Level {details.JobSatisfaction}</div>
              </div>

              {/* Monthly Income Hike */}
              <div className="p-4 rounded-xl bg-[#161F35] border border-[#1E2D52] space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <DollarSign size={14} className="text-emerald-400" /> Salary Increase
                  </span>
                  <span className="text-[#00F2FE]">+{incomeHike}% Hike</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={incomeHike}
                  onChange={(e) => setIncomeHike(Number(e.target.value))}
                  className="w-full accent-[#695CFF] cursor-pointer"
                />
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Current: ${details.MonthlyIncome.toLocaleString()}</span>
                  <span className="text-slate-200 font-semibold">
                    New: ${Math.round(details.MonthlyIncome * (1 + incomeHike / 100)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={handleSimulate}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#695CFF] to-[#5648ED] text-white py-3 px-5 rounded-xl font-bold text-xs shadow-[0_0_20px_rgba(105,92,255,0.3)] hover:shadow-[0_0_25px_rgba(105,92,255,0.5)] transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play size={16} />
                <span>{loading ? 'Re-evaluating Pipeline...' : 'Run What-If Simulation'}</span>
              </button>

              <button
                onClick={handleReset}
                className="px-4 py-3 rounded-xl bg-[#161F35] border border-[#1E2D52] text-slate-300 hover:text-slate-100 hover:bg-[#1E2D52] transition text-xs font-bold flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Results Display Panel (5 Cols) */}
          <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-[#1E2D52] flex flex-col justify-between space-y-6 bg-gradient-to-b from-[#161F35] to-[#11182B]">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-[#1E2D52] pb-4">
                <Sparkles size={18} className="text-emerald-400" />
                3. Simulation Outcome
              </h2>

              {result ? (
                <div className="mt-6 space-y-6 text-center">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E2D52]">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Original Model Risk</div>
                      <div className="text-2xl font-extrabold text-slate-200 mt-1">
                        {(result.prob_before * 100).toFixed(1)}%
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0B1020] border border-[#695CFF]/40 shadow-[0_0_15px_rgba(105,92,255,0.2)]">
                      <div className="text-[10px] font-bold text-[#695CFF] uppercase">Simulated New Risk</div>
                      <div className="text-2xl font-extrabold text-[#00F2FE] mt-1">
                        {(result.prob_after * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Impact Pill */}
                  <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E2D52] flex flex-col items-center justify-center space-y-2">
                    <span className="text-xs text-slate-400 font-semibold">Predicted Risk Change</span>
                    <span
                      className={`text-xl font-black px-4 py-1 rounded-full ${
                        result.delta_pct < 0
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : result.delta_pct > 0
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-slate-500/20 text-slate-300'
                      }`}
                    >
                      {result.delta_pct > 0 ? '+' : ''}
                      {result.delta_pct.toFixed(1)}% pt difference
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 leading-relaxed text-left p-3.5 rounded-xl bg-[#161F35] border border-[#1E2D52]">
                    <span className="text-slate-200 font-bold">Summary: </span>
                    {result.delta_pct < 0 ? (
                      <span>
                        Executing these parameter adjustments reduces predicted attrition probability by{' '}
                        <strong className="text-emerald-400">{Math.abs(result.delta_pct).toFixed(1)} percentage points</strong>.
                      </span>
                    ) : (
                      <span>No risk reduction predicted under current modified feature configuration.</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-12 text-center text-slate-500 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#1E2D52] flex items-center justify-center mx-auto text-slate-400">
                    <Sliders size={24} />
                  </div>
                  <p className="text-xs">Adjust sliders or controls and click "Run What-If Simulation" to observe predicted risk response.</p>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-[#0B1020] border border-[#1E2D52] text-[10px] text-slate-400">
              Note: Full-fit model probability re-evaluation.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
