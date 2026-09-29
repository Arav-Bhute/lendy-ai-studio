import React, { useState } from 'react';
import { HelpCircle, Calculator } from 'lucide-react';
import type { MetricDetail } from '../../types';

interface MetricCardProps {
  label: string;
  metric: MetricDetail;
  accent?: 'default' | 'positive' | 'warning' | 'danger';
  subLabel?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  metric,
  accent = 'default',
  subLabel,
}) => {
  const [showFormula, setShowFormula] = useState(false);

  const borderAccents = {
    default: 'border-slate-200 hover:border-slate-300',
    positive: 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300',
    warning: 'border-amber-200 bg-amber-50/20 hover:border-amber-300',
    danger: 'border-red-200 bg-red-50/20 hover:border-red-300',
  };

  return (
    <div
      className={`p-4 rounded-lg bg-white border ${borderAccents[accent]} transition-all flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
          <span className="truncate">{label}</span>
          <button
            type="button"
            onClick={() => setShowFormula(!showFormula)}
            className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer p-0.5"
            title="Inspect deterministic calculation formula"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-xl font-bold text-slate-900 font-mono tracking-tight tabular-nums">
          {metric.formatted}
        </div>

        {subLabel && (
          <div className="text-[11px] text-slate-500 mt-0.5 truncate">
            {subLabel}
          </div>
        )}
      </div>

      {showFormula ? (
        <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600 animate-fadeIn">
          <div className="flex items-center gap-1 font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
            <Calculator className="w-3 h-3 shrink-0" />
            <span className="truncate">{metric.formula}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-600 leading-tight">
            {metric.explanation}
          </p>
        </div>
      ) : (
        <div className="mt-2 text-[11px] text-slate-400 truncate">
          {metric.formula}
        </div>
      )}
    </div>
  );
};
