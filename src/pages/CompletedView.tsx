import React, { useState } from 'react';
import { Task } from '../types';
import { TaskItem } from '../components/TaskItem';
import { CheckCircle2, Trash2 } from 'lucide-react';

interface CompletedViewProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onCalendarSuccess?: (title: string) => void;
}

export const CompletedView: React.FC<CompletedViewProps> = ({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onToggleSubtask,
  onCalendarSuccess,
}) => {
  const completedTasks = tasks.filter(t => t.completed);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const handleClearAllCompleted = () => {
    if (confirmClearAll) {
      completedTasks.forEach(t => onDelete(t.id));
      setConfirmClearAll(false);
    } else {
      setConfirmClearAll(true);
      setTimeout(() => setConfirmClearAll(false), 3000);
    }
  };

  return (
    <div className="fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
          Activity Archive
        </p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-surface-900 dark:text-surface-100">
              Completed Tasks
            </h1>
            <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">
              {completedTasks.length} {completedTasks.length === 1 ? 'task' : 'tasks'} finished. Uncheck any task to restore it.
            </p>
          </div>
          {completedTasks.length > 0 && (
            <button
              onClick={handleClearAllCompleted}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                confirmClearAll
                  ? 'bg-red-600 text-white'
                  : 'bg-surface-100 dark:bg-surface-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {confirmClearAll ? 'Confirm clear all?' : 'Clear all'}
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {completedTasks.length > 0 ? (
        <div className="space-y-2">
          {completedTasks.map(task => (
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
      ) : (
        <div className="text-center py-16 px-4 bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-surface-800 dark:text-surface-200 mb-1">
            No completed tasks yet
          </h3>
          <p className="text-xs text-surface-400 dark:text-surface-500 max-w-xs mx-auto">
            When you complete tasks across Today, Weekly, or Goals, they will be archived here.
          </p>
        </div>
      )}
    </div>
  );
};
