import React from 'react';
import { Task } from '../types';
import { TaskItem } from '../components/TaskItem';
import { Plus, Sparkles } from 'lucide-react';

interface FutureViewProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onConvertToToday: (id: string) => void;
  onAddNewFuturePlan?: () => void;
  onCalendarSuccess?: (title: string) => void;
}

export const FutureView: React.FC<FutureViewProps> = ({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onToggleSubtask,
  onConvertToToday,
  onAddNewFuturePlan,
  onCalendarSuccess,
}) => {
  const futureTasks = tasks.filter(t => t.type === 'future');
  const pending = futureTasks.filter(t => !t.completed);
  const completed = futureTasks.filter(t => t.completed);

  return (
    <div className="fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-1">
          Someday & Ahead
        </p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-surface-900 dark:text-surface-100">
              Future Plans
            </h1>
            <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">
              Things you want to achieve later. Convert to Today anytime with one click.
            </p>
          </div>
          {onAddNewFuturePlan && (
            <button
              onClick={onAddNewFuturePlan}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Plan
            </button>
          )}
        </div>
      </div>

      {/* Pending Future Plans */}
      {pending.length > 0 && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-surface-800 dark:text-surface-200">
              Planned for the Future ({pending.length})
            </h2>
            <span className="text-xs text-surface-400 dark:text-surface-500">
              Click arrow icon to move to Today
            </span>
          </div>
          <div className="space-y-2">
            {pending.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleSubtask={onToggleSubtask}
                onConvertToToday={onConvertToToday}
                onCalendarSuccess={onCalendarSuccess}
                showDate
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Future Plans */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500">
            Completed Future Plans ({completed.length})
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
                showDate
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {futureTasks.length === 0 && (
        <div className="text-center py-16 px-4 bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-surface-800 dark:text-surface-200 mb-1">
            No future plans added yet
          </h3>
          <p className="text-xs text-surface-400 dark:text-surface-500 max-w-sm mx-auto mb-4">
            E.g. "Buy a new laptop", "Learn video editing", "Travel to Japan". Keep your vision clear.
          </p>
          {onAddNewFuturePlan && (
            <button
              onClick={onAddNewFuturePlan}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Add a Future Plan
            </button>
          )}
        </div>
      )}
    </div>
  );
};
