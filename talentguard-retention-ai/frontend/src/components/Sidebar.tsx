import {
  LayoutDashboard,
  ShieldAlert,
  UserCheck,
  Sliders,
  BarChart3,
  FileText,
  Cpu,
  Activity,
  ChevronRight,
  Shield
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard, tag: null },
    { id: 'watchlist', label: 'Attrition Watchlist', icon: ShieldAlert, tag: 'Top 50' },
    { id: 'employee-insights', label: 'Employee Insights', icon: UserCheck, tag: null },
    { id: 'simulator', label: 'What-If Simulator', icon: Sliders, tag: 'Interactive' },
    { id: 'analytics', label: 'Analytics & Fairness', icon: BarChart3, tag: 'Stage 3' },
    { id: 'action-plans', label: 'Retention Action Plans', icon: FileText, tag: 'Drafts' },
    { id: 'model-performance', label: 'Model Performance', icon: Cpu, tag: null },
  ];

  return (
    <aside className="w-64 bg-[#11182B] border-r border-[#1E2D52] hidden md:flex md:flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#1E2D52]/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#695CFF] to-[#00F2FE] p-0.5 shadow-[0_0_20px_rgba(105,92,255,0.3)] flex items-center justify-center">
          <div className="w-full h-full bg-[#0B1020] rounded-[10px] flex items-center justify-center text-[#00F2FE]">
            <Shield size={20} />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-lg font-bold text-slate-50 tracking-tight">TalentGuard</h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#695CFF]/20 text-[#695CFF] font-extrabold border border-[#695CFF]/30">
              AI
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Retention Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Intelligence Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-[#695CFF]/20 to-[#695CFF]/5 text-slate-100 border border-[#695CFF]/40 shadow-[0_0_15px_rgba(105,92,255,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#161F35]/70 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  className={`transition-colors ${
                    isActive ? 'text-[#695CFF]' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.tag ? (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-[#695CFF] text-white'
                      : 'bg-[#1E2D52] text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {item.tag}
                </span>
              ) : isActive ? (
                <ChevronRight size={14} className="text-[#695CFF]" />
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-[#1E2D52]/80 bg-[#0B1020]/50">
        <div className="p-3 rounded-xl bg-[#161F35] border border-[#1E2D52] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Activity size={12} className="text-emerald-400 animate-pulse" />
              Engine Status
            </span>
            <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              Online
            </span>
          </div>
          <div className="text-[11px] text-slate-300 font-mono truncate">
            Model: <span className="text-[#00F2FE]">LogisticRegression</span>
          </div>
          <div className="text-[10px] text-slate-400">
            TechNova Solutions Enterprise
          </div>
        </div>
      </div>
    </aside>
  );
}
