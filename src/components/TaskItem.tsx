import React, { useState } from 'react';
import { Task } from '../types';
import { Check, Calendar, Pencil, Trash2, Repeat, Clock, ArrowRightCircle } from 'lucide-react';
import { downloadICS } from '../services/calendarService';
import { formatShortDate } from '../utils/dateUtils';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onConvertToToday?: (id: string) => void;
  onCalendarSuccess?: (taskTitle: string) => void;
  showDate?: boolean;
}

const priorityStyles = {
  high: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
  medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  low: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  onToggleSubtask,
  onConvertToToday,
  onCalendarSuccess,
  showDate = false,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(task.id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const handleCalendar = () => {
    const success = downloadICS(task);
    if (success && onCalendarSuccess) {
      onCalendarSuccess(task.title);
    }
  };

  const completedSubs = task.subtasks.filter(s => s.completed).length;
  const totalSubs = task.subtasks.length;

  return (
    <div
      className={`task-item group rounded-2xl border px-4 py-3.5 mb-2.5 transition-all
        ${task.completed
          ? 'bg-surface-50/70 dark:bg-surface-800/40 border-surface-200 dark:border-surface-700/60 opacity-60'
          : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm'
        }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setConfirmDelete(false); }}
    >
      <div className="flex items-start gap-3.5">
        {/* Large, Easy-to-click Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer select-none active:scale-95
            ${task.completed
              ? 'bg-primary-600 border-primary-600 dark:bg-primary-500 dark:border-primary-500'
              : 'border-surface-300 dark:border-surface-500 hover:border-primary-500 dark:hover:border-primary-400 bg-transparent'
            }`}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed && (
            <Check className="w-4 h-4 text-white check-animate stroke-[3]" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-[15px] font-normal leading-snug transition-colors ${
            task.completed
              ? 'line-through text-surface-400 dark:text-surface-500'
              : 'text-surface-900 dark:text-surface-100'
          }`}>
            {task.title}
          </p>

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {showDate && (
              <span className="text-xs text-surface-400 dark:text-surface-500 font-medium">
                {formatShortDate(task.date)}
              </span>
            )}
            {task.time && (
              <span className="inline-flex items-center gap-1 text-xs text-surface-500 dark:text-surface-400 bg-surface-100 dark:bg-surface-700/60 px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3" />
                {task.time}
              </span>
            )}
            {task.priority && task.priority !== 'none' && (
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border capitalize ${priorityStyles[task.priority]}`}>
                {task.priority}
              </span>
            )}
            {task.repeat !== 'none' && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-md">
                <Repeat className="w-3 h-3" />
                {task.repeat}
              </span>
            )}
            {totalSubs > 0 && (
              <span className="text-xs text-surface-500 dark:text-surface-400 font-medium">
                {completedSubs}/{totalSubs} completed
              </span>
            )}
          </div>

          {/* Goal Checklist & Progress */}
          {totalSubs > 0 && (
            <div className="mt-3 space-y-2 pl-1 border-l-2 border-surface-200 dark:border-surface-700">
              <div className="w-full h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 dark:bg-primary-400 rounded-full transition-all duration-300"
                  style={{ width: `${(completedSubs / totalSubs) * 100}%` }}
                />
              </div>
              <div className="space-y-1.5 pt-1">
                {task.subtasks.map(sub => (
                  <div key={sub.id} className="flex items-center gap-2.5">
                    <button
                      onClick={() => onToggleSubtask?.(task.id, sub.id)}
                      className={`w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-all cursor-pointer
                        ${sub.completed
                          ? 'bg-primary-500 border-primary-500 text-white'
                          : 'border-surface-300 dark:border-surface-500 bg-white dark:bg-surface-800'
                        }`}
                    >
                      {sub.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <span className={`text-sm ${
                      sub.completed
                        ? 'line-through text-surface-400 dark:text-surface-500'
                        : 'text-surface-700 dark:text-surface-300'
                    }`}>
                      {sub.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {task.description && (
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-2 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className={`flex items-center gap-1 flex-shrink-0 transition-opacity ${
          showActions ? 'opacity-100' : 'opacity-0 md:opacity-0'
        } max-md:opacity-100`}>
          {/* Convert to Today button for Future tasks */}
          {task.type === 'future' && onConvertToToday && (
            <button
              onClick={() => onConvertToToday(task.id)}
              className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors cursor-pointer"
              title="Move to Today"
            >
              <ArrowRightCircle className="w-4 h-4" />
            </button>
          )}

          {/* Add to Calendar button */}
          <button
            onClick={handleCalendar}
            className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors cursor-pointer"
            title="Add to Calendar (.ics)"
          >
            <Calendar className="w-4 h-4" />
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors cursor-pointer"
            title="Edit task"
          >
            <Pencil className="w-4 h-4" />
          </button>

          {/* Delete with Confirmation */}
          <button
            onClick={handleDelete}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              confirmDelete
                ? 'text-white bg-red-600 px-2'
                : 'text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40'
            }`}
            title={confirmDelete ? 'Click again to confirm delete' : 'Delete task'}
          >
            {confirmDelete ? (
              <span className="text-xs font-semibold">Delete?</span>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
