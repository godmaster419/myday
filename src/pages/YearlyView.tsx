import React from 'react';
import { Task } from '../types';
import { TaskItem } from '../components/TaskItem';
import { ProgressBar } from '../components/ProgressBar';
import { Plus, Target } from 'lucide-react';

interface YearlyViewProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddNewGoal?: () => void;
  onCalendarSuccess?: (title: string) => void;
}

export const YearlyView: React.FC<YearlyViewProps> = ({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onToggleSubtask,
  onAddNewGoal,
  onCalendarSuccess,
}) => {
  const currentYear = new Date().getFullYear();
  const yearlyTasks = tasks.filter(t => t.type === 'yearly');
  const completedCount = yearlyTasks.filter(t => t.completed).length;
  const pending = yearlyTasks.filter(t => !t.completed);
  const completed = yearlyTasks.filter(t => t.completed);

  return (
    <div className="fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-1">
          {currentYear} Milestones
        </p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-surface-900 dark:text-surface-100">
              Yearly Goals
            </h1>
            <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">
              Long-term achievements with actionable checklist steps
            </p>
          </div>
          {onAddNewGoal && (
            <button
              onClick={onAddNewGoal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Goal
            </button>
          )}
        </div>
      </div>

      {/* Overall Progress */}
      {yearlyTasks.length > 0 && (
        <div className="bg-white dark:bg-surface-850 p-4.5 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xs mb-6">
          <ProgressBar completed={completedCount} total={yearlyTasks.length} label="Yearly Goals Progress" />
        </div>
      )}

      {/* Active Goals */}
      {pending.length > 0 && (
        <div className="space-y-3 mb-6">
          <h2 className="text-sm font-bold text-surface-800 dark:text-surface-200">
            In Progress ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleSubtask={onToggleSubtask}
                onCalendarSuccess={onCalendarSuccess}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500">
            Achieved Goals ({completed.length})
          </h3>
          <div className="space-y-2">
            {completed.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleSubtask={onToggleSubtask}
                onCalendarSuccess={onCalendarSuccess}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {yearlyTasks.length === 0 && (
        <div className="text-center py-16 px-4 bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-surface-800 dark:text-surface-200 mb-1">
            No yearly goals set for {currentYear}
          </h3>
          <p className="text-xs text-surface-400 dark:text-surface-500 max-w-sm mx-auto mb-4">
            E.g. "Read 25 books", "Learn Python", "Run a 10k marathon". Add checklist steps to track progress step-by-step.
          </p>
          {onAddNewGoal && (
            <button
              onClick={onAddNewGoal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Set Your First Yearly Goal
            </button>
          )}
        </div>
      )}
    </div>
  );
};
