import React from 'react';
import type { RiskSeverity } from '../../types';

interface RiskBadgeProps {
  severity: RiskSeverity | 'PENDING';
  showDot?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ severity, showDot = true }) => {
  const styles: Record<string, { label: string; text: string; dot: string; bg: string }> = {
    LOW: {
      label: 'Low Risk',
      text: 'text-emerald-700',
      dot: 'bg-emerald-600',
      bg: 'bg-emerald-50 border-emerald-200/60',
    },
    MEDIUM: {
      label: 'Medium Risk / Review',
      text: 'text-amber-800',
      dot: 'bg-amber-600',
      bg: 'bg-amber-50 border-amber-200/60',
    },
    HIGH: {
      label: 'High Risk',
      text: 'text-red-700',
      dot: 'bg-red-600',
      bg: 'bg-red-50 border-red-200/60',
    },
    POSITIVE: {
      label: 'Positive Signal',
      text: 'text-blue-700',
      dot: 'bg-blue-600',
      bg: 'bg-blue-50 border-blue-200/60',
    },
    PENDING: {
      label: 'Analysis Pending',
      text: 'text-slate-600',
      dot: 'bg-slate-400',
      bg: 'bg-slate-100 border-slate-200',
    },
  };

  const current = styles[severity] || styles.PENDING;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded border ${current.bg} ${current.text} tracking-tight whitespace-nowrap`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${current.dot} shrink-0`} />}
      {current.label}
    </span>
  );
};
