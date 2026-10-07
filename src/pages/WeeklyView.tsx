import React, { useState } from 'react';
import { Task } from '../types';
import { TaskItem } from '../components/TaskItem';
import { getWeekDates, getDayName, isToday, formatShortDate } from '../utils/dateUtils';
import { Plus, Calendar } from 'lucide-react';

interface WeeklyViewProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddNewTaskForDate: (date: string) => void;
  onCalendarSuccess?: (title: string) => void;
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onToggleSubtask,
  onAddNewTaskForDate,
  onCalendarSuccess,
}) => {
  const weekDates = getWeekDates();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const getTasksForDate = (date: string) =>
    tasks.filter(t => t.date === date && t.type !== 'yearly' && t.type !== 'future');

  return (
    <div className="fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-1">
          Weekly Planning
        </p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-surface-900 dark:text-surface-100">
              Monday → Sunday
            </h1>
            <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">
              Tasks planned across the current week
            </p>
          </div>
          {selectedDay && (
            <button
              onClick={() => onAddNewTaskForDate(selectedDay)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add to {getDayName(selectedDay).slice(0, 3)}
            </button>
          )}
        </div>
      </div>

      {/* Week day pills (horizontal scrollable bar) */}
      <div className="grid grid-cols-7 gap-1.5 mb-6 bg-surface-100 dark:bg-surface-850 p-1.5 rounded-2xl">
        {weekDates.map(date => {
          const dayTasks = getTasksForDate(date);
          const completedCount = dayTasks.filter(t => t.completed).length;
          const today = isToday(date);
          const isSelected = selectedDay === date;

          return (
            <button
              key={date}
              onClick={() => setSelectedDay(isSelected ? null : date)}
              className={`flex flex-col items-center py-2.5 px-1 rounded-xl transition-all cursor-pointer text-center relative ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-sm font-semibold'
                  : today
                    ? 'bg-white dark:bg-surface-800 text-primary-600 dark:text-primary-400 shadow-xs border border-primary-200 dark:border-primary-800'
                    : 'text-surface-700 dark:text-surface-300 hover:bg-white/60 dark:hover:bg-surface-800/60'
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-tight">
                {getDayName(date).slice(0, 3)}
              </span>
              <span className="text-sm font-extrabold mt-0.5">
                {new Date(date + 'T00:00:00').getDate()}
              </span>
              {dayTasks.length > 0 && (
                <span className={`text-[10px] mt-0.5 font-medium ${isSelected ? 'text-white/80' : 'text-surface-400'}`}>
                  {completedCount}/{dayTasks.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Day detail if selected */}
      {selectedDay ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-200 dark:border-surface-800">
            <div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100">
                {getDayName(selectedDay)}
              </h2>
              <p className="text-xs text-surface-400 dark:text-surface-500">
                {formatShortDate(selectedDay)} {isToday(selectedDay) && '· Today'}
              </p>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
            >
              Show all days
            </button>
          </div>

          {getTasksForDate(selectedDay).length > 0 ? (
            <div className="space-y-2">
              {getTasksForDate(selectedDay).map(task => (
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
          ) : (
            <div className="text-center py-12 bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800">
              <Calendar className="w-8 h-8 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                No tasks for {getDayName(selectedDay)}
              </p>
              <button
                onClick={() => onAddNewTaskForDate(selectedDay)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 text-xs font-semibold hover:bg-primary-100 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add task for this day
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Full week overview */
        <div className="space-y-5">
          {weekDates.map(date => {
            const dayTasks = getTasksForDate(date);
            const today = isToday(date);

            return (
              <div
                key={date}
                className={`p-4 rounded-2xl border transition-all ${
                  today
                    ? 'bg-primary-50/20 dark:bg-primary-950/10 border-primary-200 dark:border-primary-900/40'
                    : 'bg-white dark:bg-surface-850 border-surface-200 dark:border-surface-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-bold ${
                      today ? 'text-primary-600 dark:text-primary-400' : 'text-surface-800 dark:text-surface-200'
                    }`}>
                      {getDayName(date)}
                    </h3>
                    <span className="text-xs text-surface-400 dark:text-surface-500">
                      {formatShortDate(date)} {today && '· Today'}
                    </span>
                  </div>
                  <button
                    onClick={() => onAddNewTaskForDate(date)}
                    className="p-1 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
                    title={`Add task for ${getDayName(date)}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {dayTasks.length > 0 ? (
                  <div className="space-y-1.5">
                    {dayTasks.map(task => (
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
                ) : (
                  <p className="text-xs text-surface-400 dark:text-surface-600 italic py-1">
                    No tasks planned
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
