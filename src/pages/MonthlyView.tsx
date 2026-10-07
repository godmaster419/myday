import React, { useState } from 'react';
import { Task } from '../types';
import { TaskItem } from '../components/TaskItem';
import { getMonthDates, getMonthName, isToday, formatShortDate, getToday } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';

interface MonthlyViewProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddNewTaskForDate: (date: string) => void;
  onCalendarSuccess?: (title: string) => void;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onToggleSubtask,
  onAddNewTaskForDate,
  onCalendarSuccess,
}) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(getToday());

  const weeks = getMonthDates(year, month);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getTasksForDate = (date: string) =>
    tasks.filter(t => t.date === date && t.type !== 'yearly' && t.type !== 'future');

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];
  const pendingTasks = selectedDateTasks.filter(t => !t.completed);
  const completedTasks = selectedDateTasks.filter(t => t.completed);

  return (
    <div className="fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-1">
          Monthly Calendar
        </p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-surface-900 dark:text-surface-100">
            {getMonthName(month)} {year}
          </h1>
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 hover:text-surface-800 dark:hover:text-surface-200 transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); setSelectedDate(getToday()); }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors cursor-pointer"
            >
              Current
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 hover:text-surface-800 dark:hover:text-surface-200 transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 p-2 sm:p-4 mb-6 shadow-xs">
        {/* Day name labels */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map(d => (
            <div key={d} className="py-1.5 text-center text-[11px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className="space-y-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((date, di) => {
                if (!date) {
                  return <div key={di} className="min-h-[46px] rounded-xl bg-transparent" />;
                }
                const dayNum = new Date(date + 'T00:00:00').getDate();
                const dayTasks = getTasksForDate(date);
                const hasPending = dayTasks.some(t => !t.completed);
                const hasCompleted = dayTasks.some(t => t.completed);
                const today = isToday(date);
                const isSelected = selectedDate === date;

                return (
                  <button
                    key={di}
                    onClick={() => setSelectedDate(date)}
                    className={`min-h-[46px] py-1 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-primary-600 text-white font-bold shadow-sm'
                        : today
                          ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 font-bold'
                          : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                    }`}
                  >
                    <span className="text-xs sm:text-sm">{dayNum}</span>
                    {dayTasks.length > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {hasPending && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-primary-500'}`} />
                        )}
                        {hasCompleted && !hasPending && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/80' : 'bg-emerald-500'}`} />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-200 dark:border-surface-800">
            <div>
              <h2 className="text-base font-bold text-surface-900 dark:text-surface-100">
                Tasks for {formatShortDate(selectedDate)}
              </h2>
              <p className="text-xs text-surface-400 dark:text-surface-500">
                {pendingTasks.length} pending, {completedTasks.length} completed
              </p>
            </div>
            <button
              onClick={() => onAddNewTaskForDate(selectedDate)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </button>
          </div>

          {pendingTasks.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
                Pending Tasks
              </p>
              {pendingTasks.map(task => (
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
          )}

          {completedTasks.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
                Completed Tasks
              </p>
              {completedTasks.map(task => (
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
          )}

          {selectedDateTasks.length === 0 && (
            <div className="text-center py-10 bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800">
              <Calendar className="w-8 h-8 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-surface-600 dark:text-surface-400">
                No tasks planned for {formatShortDate(selectedDate)}
              </p>
              <button
                onClick={() => onAddNewTaskForDate(selectedDate)}
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Plan a task for this date
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
