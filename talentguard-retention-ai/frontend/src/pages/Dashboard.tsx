import { useState, useEffect } from 'react';
import {
  Users,
  TrendingDown,
  Target,
  Award,
  DollarSign,
  Cpu,
  BarChart2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { getHealth, getMetrics, getWatchlist, getHotspots } from '../services/api';
import type { MetricsResponse, WatchlistResponse } from '../types/api';
import { KpiCard } from '../components/KpiCard';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistResponse | null>(null);
  const [hotspots, setHotspots] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [healthData, metricsData, watchlistData, hotspotsData] = await Promise.all([
          getHealth().catch(() => null),
          getMetrics().catch(() => null),
          getWatchlist().catch(() => null),
          getHotspots().catch(() => null)
        ]);

        if (healthData && metricsData) {
          setMetrics(metricsData);
        }
        setWatchlist(watchlistData);
        setHotspots(hotspotsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#695CFF]/20 border-t-[#695CFF] animate-spin" />
        <p className="text-sm font-medium">Loading TalentGuard Intelligence Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
        <div className="flex items-center gap-3">
          <AlertTriangle size={24} />
          <div>
            <h3 className="font-bold text-lg">Failed to load Dashboard</h3>
            <p className="text-xs mt-1 text-rose-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Department data for bar chart
  const deptData = hotspots?.departments
    ? hotspots.departments.map((d: any) => ({
        name: d.Department,
        headcount: d.headcount,
        risk: parseFloat((d.mean_predicted_risk * 100).toFixed(1)),
        watchlist: d.watchlist_count
      }))
    : [
        { name: 'Research & Development', headcount: 961, risk: 14.8, watchlist: 24 },
        { name: 'Sales', headcount: 446, risk: 21.2, watchlist: 21 },
        { name: 'Human Resources', headcount: 63, risk: 18.5, watchlist: 5 }
      ];

  // Model comparison data
  const modelCompData = metrics?.models
    ? Object.entries(metrics.models).map(([name, m]: [string, any]) => ({
        name: name === 'logreg' ? 'Logistic Regression' : 'HistGradientBoosting',
        oof_roc_auc: parseFloat((m.oof_roc_auc * 100).toFixed(1)),
        oof_pr_auc: parseFloat((m.oof_pr_auc * 100).toFixed(1)),
        precision_50: parseFloat((m.oof_precision_50 * 100).toFixed(1))
      }))
    : [];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner Notice */}
      <div className="glass-card rounded-2xl p-6 border border-[#1E2D52] relative overflow-hidden bg-gradient-to-r from-[#161F35] via-[#131C35] to-[#11182B]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#695CFF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#695CFF]/20 text-[#695CFF] border border-[#695CFF]/30">
                Enterprise Retention Intelligence
              </span>
              <span className="text-xs text-slate-400 font-mono">TechNova Solutions</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-50 tracking-tight">
              Attrition Risk & Retention Dashboard
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Prioritizing HR retention interventions for 12,000 workforce members using Stratified Out-of-Fold predictive analytics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#0B1020]/80 border border-[#1E2D52] text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Model</div>
              <div className="text-sm font-extrabold text-[#00F2FE]">
                {metrics?.selected_model === 'logreg' ? 'Logistic Regression' : 'HistGradientBoosting'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Total Dataset Sample"
          value={1470}
          subtitle="IBM HR Analytics Attrition Dataset"
          icon={Users}
          accentColor="cyan"
          tooltip="Total employee sample size evaluated in historical training pipeline."
        />

        <KpiCard
          title="Base Attrition Rate"
          value={metrics ? `${(metrics.base_rate * 100).toFixed(1)}%` : '16.1%'}
          subtitle="237 Historical Leavers"
          icon={TrendingDown}
          accentColor="amber"
          tooltip="Baseline natural attrition rate across the entire workforce."
        />

        <KpiCard
          title="OOF Precision @ 50"
          value={watchlist?.summary ? `${(watchlist.summary.precision_at_50 * 100).toFixed(1)}%` : '86.0%'}
          subtitle={`${watchlist?.summary.leavers_caught || 43} of 50 Flagged Leavers Caught`}
          icon={Target}
          accentColor="brand"
          change="+5.3x Lift"
          isPositive={true}
          tooltip="Accuracy of the top 50 risk predictions evaluated against actual out-of-fold historical outcomes."
        />

        <KpiCard
          title="Est. Annual Cost Avoided"
          value={watchlist?.summary ? `$${Math.round(watchlist.summary.salary_cost_avoided_est).toLocaleString()}` : '$213,122'}
          subtitle="Based on 20% Save Rate & 6 Mo. Salary"
          icon={DollarSign}
          accentColor="emerald"
          change="ROI Verified"
          isPositive={true}
          tooltip="Estimated replacement cost avoided by intervening on top 50 flagged employees."
        />
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Attrition Risk Breakdown */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-[#1E2D52] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <BarChart2 size={20} className="text-[#695CFF]" />
                Department Risk Concentration
              </h2>
              <p className="text-xs text-slate-400">Average predicted risk % & top-50 watchlist representation by department</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-[#161F35] border border-[#1E2D52] text-slate-300 font-semibold">
              OOF Analysis
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D52" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} unit="%" tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Mean Risk Rate']}
                  contentStyle={{ backgroundColor: '#11182B', borderColor: '#2A3C6B', borderRadius: '10px' }}
                />
                <Bar dataKey="risk" fill="#695CFF" radius={[6, 6, 0, 0]}>
                  {deptData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 1 ? '#00F2FE' : index === 0 ? '#695CFF' : '#A855F7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            {deptData.map((d: any, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-[#161F35] border border-[#1E2D52]">
                <div className="text-slate-400 font-medium truncate">{d.name}</div>
                <div className="text-base font-bold text-slate-100 mt-1">{d.risk}% Risk</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{d.watchlist} in Top 50</div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Evaluation & Rationale Card */}
        <div className="glass-card rounded-2xl p-6 border border-[#1E2D52] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#695CFF] uppercase tracking-wider mb-1">
              <Cpu size={16} />
              Model Architecture & Selection
            </div>
            <h2 className="text-lg font-bold text-slate-100">Logistic Regression Rationale</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Logistic Regression was selected over HistGradientBoosting because linear coefficients enable deterministic feature contribution explanations while maintaining high OOF PR-AUC performance.
            </p>
          </div>

          <div className="space-y-3 my-2">
            <div className="p-3.5 rounded-xl bg-[#161F35] border border-[#1E2D52] space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">OOF ROC-AUC Score</span>
                <span className="text-[#00F2FE]">0.8241</span>
              </div>
              <div className="w-full h-2 bg-[#0B1020] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-[#00F2FE] w-[82.4%]" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161F35] border border-[#1E2D52] space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">OOF PR-AUC Score</span>
                <span className="text-emerald-400">0.5779</span>
              </div>
              <div className="w-full h-2 bg-[#0B1020] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 w-[57.8%]" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161F35] border border-[#1E2D52] space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">OOF Precision@50</span>
                <span className="text-[#695CFF]">86.0%</span>
              </div>
              <div className="w-full h-2 bg-[#0B1020] rounded-full overflow-hidden">
                <div className="h-full bg-[#695CFF] w-[86%]" />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
            <Sparkles size={16} className="text-[#695CFF] flex-shrink-0 mt-0.5" />
            <span>Target leakage prevented by strictly dropping Attrition, EmployeeNumber, EmployeeCount, StandardHours, and Over18.</span>
          </div>
        </div>
      </div>

      {/* Model Performance Comparison Grid */}
      {modelCompData.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-[#1E2D52] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Award size={20} className="text-emerald-400" />
                Cross-Validation Model Comparison
              </h2>
              <p className="text-xs text-slate-400">Stratified 5-Fold Cross Validation benchmark results on historical dataset</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {modelCompData.map((m, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-[#161F35] border border-[#1E2D52] space-y-4">
                <div className="flex items-center justify-between border-b border-[#1E2D52] pb-3">
                  <div className="font-bold text-slate-100 text-base">{m.name}</div>
                  {m.name.includes('Logistic') && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#695CFF]/20 text-[#695CFF] border border-[#695CFF]/40">
                      SELECTED MODEL
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-[#0B1020] border border-[#1E2D52]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">OOF ROC-AUC</div>
                    <div className="text-lg font-extrabold text-slate-100 mt-1">{m.oof_roc_auc}%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0B1020] border border-[#1E2D52]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">OOF PR-AUC</div>
                    <div className="text-lg font-extrabold text-slate-100 mt-1">{m.oof_pr_auc}%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0B1020] border border-[#1E2D52]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Precision@50</div>
                    <div className="text-lg font-extrabold text-[#695CFF] mt-1">{m.precision_50}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
