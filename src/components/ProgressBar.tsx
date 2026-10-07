import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total, label }) => {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mb-5">
      {label && (
        <p className="text-sm font-medium text-surface-500 dark:text-surface-400 mb-1.5">{label}</p>
      )}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full progress-fill transition-all duration-500 ease-out"
            style={{
              width: `${pct}%`,
              background: pct === 100
                ? 'linear-gradient(90deg, #10B981, #059669)'
                : 'linear-gradient(90deg, #6366F1, #818CF8)',
            }}
          />
        </div>
        <span className="text-sm font-semibold text-surface-600 dark:text-surface-300 tabular-nums min-w-[60px] text-right">
          {completed}/{total}
          <span className="text-surface-400 dark:text-surface-500 font-normal ml-1">{pct}%</span>
        </span>
      </div>
    </div>
  );
};
