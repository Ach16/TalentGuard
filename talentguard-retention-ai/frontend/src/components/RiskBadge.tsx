import React from 'react';

interface RiskBadgeProps {
  riskPct: number;
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ riskPct, showIcon = true }) => {
  let bgColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let dotColor = 'bg-emerald-400';
  let label = 'Low Risk';

  if (riskPct >= 70) {
    bgColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]';
    dotColor = 'bg-rose-500 animate-pulse';
    label = 'Critical Risk';
  } else if (riskPct >= 40) {
    bgColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    dotColor = 'bg-amber-400';
    label = 'Elevated Risk';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bgColor}`}>
      {showIcon && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {riskPct.toFixed(1)}% <span className="text-[10px] opacity-75">({label})</span>
    </span>
  );
};
