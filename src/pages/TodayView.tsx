import React from 'react';
import { Task } from '../types';
import { TaskItem } from '../components/TaskItem';
import { ProgressBar } from '../components/ProgressBar';
import { formatDisplayDate, getToday } from '../utils/dateUtils';
import { CheckCircle2, Plus } from 'lucide-react';

interface TodayViewProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddNewTask?: () => void;
  onCalendarSuccess?: (title: string) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onToggleSubtask,
  onAddNewTask,
  onCalendarSuccess,
}) => {
  const today = getToday();
  const todayTasks = tasks.filter(t => t.date === today && t.type !== 'yearly' && t.type !== 'future');
  const pending = todayTasks.filter(t => !t.completed);
  const completed = todayTasks.filter(t => t.completed);
  const totalCount = todayTasks.length;
  const completedCount = completed.length;

  return (
    <div className="fade-in max-w-2xl mx-auto">
      {/* Top Banner & Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold tracking-wide text-primary-600 dark:text-primary-400">
            Today — {formatDisplayDate(today)}
          </p>
          {onAddNewTask && (
            <button
              onClick={onAddNewTask}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </button>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-surface-50 tracking-tight">
          My Day
        </h1>
        <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">
          Plan Your Day. Complete Your Goals.
        </p>
      </div>

      {/* Today's Progress */}
      {totalCount > 0 && (
        <div className="bg-white dark:bg-surface-850 p-4.5 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xs mb-6">
          <ProgressBar completed={completedCount} total={totalCount} label="Today's Progress" />
        </div>
      )}

      {/* Today's Tasks Section */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-surface-800 dark:text-surface-200">
              Today's Tasks
            </h2>
            <span className="text-xs font-medium text-surface-400 dark:text-surface-500">
              {pending.length} pending
            </span>
          </div>

          {pending.length > 0 ? (
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
          ) : totalCount > 0 ? (
            <div className="p-6 rounded-2xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200/60 dark:border-surface-700/60 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                All daily tasks completed!
              </p>
              <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">
                Great job staying productive today.
              </p>
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800">
              <span className="text-4xl mb-3 block">☀️</span>
              <h3 className="text-base font-bold text-surface-800 dark:text-surface-200 mb-1">
                No tasks planned for today
              </h3>
              <p className="text-xs text-surface-400 dark:text-surface-500 max-w-xs mx-auto mb-4">
                Organize your day with simple, actionable tasks.
              </p>
              {onAddNewTask && (
                <button
                  onClick={onAddNewTask}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  + Add Today's First Task
                </button>
              )}
            </div>
          )}
        </div>

        {/* Completed Tasks section for today */}
        {completed.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500">
                Completed ({completed.length})
              </h3>
            </div>
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
      </div>
    </div>
  );
};
