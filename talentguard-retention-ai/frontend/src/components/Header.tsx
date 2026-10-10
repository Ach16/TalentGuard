import { RefreshCw, User } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function Header({
  title = 'Executive Overview',
  subtitle = 'AI-Driven Employee Retention Intelligence Platform',
  onRefresh,
  loading = false,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-[#11182B]/90 backdrop-blur-md border-b border-[#1E2D52] px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl bg-[#161F35] border border-[#1E2D52] text-slate-300 hover:text-slate-100 hover:border-[#695CFF]/40 transition text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
            title="Refresh API Data"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-[#695CFF]' : ''} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        )}

        <div className="h-6 w-px bg-[#1E2D52]" />

        {/* User Badge */}
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-200">TechNova HR Analytics</div>
            <div className="text-[10px] text-[#00F2FE] font-medium">Enterprise HR Lead</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#695CFF] to-purple-600 p-0.5 shadow-[0_0_12px_rgba(105,92,255,0.3)]">
            <div className="w-full h-full bg-[#11182B] rounded-[10px] flex items-center justify-center text-slate-100">
              <User size={16} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
