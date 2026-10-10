import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Info } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  accentColor?: 'brand' | 'cyan' | 'amber' | 'emerald' | 'rose' | 'purple';
  tooltip?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive,
  icon: Icon,
  accentColor = 'brand',
  tooltip,
}) => {
  const accentStyles = {
    brand: 'text-[#695CFF] bg-[#695CFF]/10 border-[#695CFF]/30 shadow-[0_0_15px_rgba(105,92,255,0.15)]',
    cyan: 'text-[#00F2FE] bg-[#00F2FE]/10 border-[#00F2FE]/30 shadow-[0_0_15px_rgba(0,242,254,0.15)]',
    amber: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    rose: 'text-rose-400 bg-rose-400/10 border-rose-400/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  };

  return (
    <div className="relative glass-card rounded-xl p-5 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>{title}</span>
            {tooltip && (
              <span title={tooltip} className="cursor-help text-slate-500 hover:text-slate-300">
                <Info size={12} />
              </span>
            )}
          </div>
          <div className="mt-2 text-2xl lg:text-3xl font-bold tracking-tight text-slate-50">
            {value}
          </div>
        </div>
        <div className={`p-3 rounded-xl border ${accentStyles[accentColor]}`}>
          <Icon size={22} />
        </div>
      </div>

      {(subtitle || change) && (
        <div className="mt-4 pt-3 border-t border-[#1E2D52]/60 flex items-center justify-between text-xs">
          {change && (
            <span
              className={`font-semibold px-2 py-0.5 rounded ${
                isPositive !== false
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {change}
            </span>
          )}
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
