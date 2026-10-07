import React, { useState, useEffect } from 'react';
import { Task, TaskType, RepeatType, PriorityType, SubTask } from '../types';
import { X, Plus, Trash2, Calendar, Clock, Bell, Flag } from 'lucide-react';
import { generateId, getToday } from '../utils/dateUtils';

interface TaskFormProps {
  onSave: (
    title: string,
    type: TaskType,
    date: string,
    time?: string,
    priority?: PriorityType,
    repeat?: RepeatType,
    reminder?: boolean,
    description?: string,
    subtasks?: SubTask[],
  ) => void;
  onUpdate?: (id: string, updates: Partial<Task>) => void;
  onClose: () => void;
  editTask?: Task | null;
  defaultType?: TaskType;
  defaultDate?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  onSave,
  onUpdate,
  onClose,
  editTask,
  defaultType = 'daily',
  defaultDate,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>(defaultType);
  const [date, setDate] = useState(defaultDate || getToday());
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<PriorityType>('none');
  const [repeat, setRepeat] = useState<RepeatType>('none');
  const [reminder, setReminder] = useState(false);
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setType(editTask.type);
      setDate(editTask.date);
      setTime(editTask.time || '');
      setPriority(editTask.priority || 'none');
      setRepeat(editTask.repeat || 'none');
      setReminder(!!editTask.reminder);
      setDescription(editTask.description || '');
      setSubtasks(editTask.subtasks || []);
    } else if (defaultDate) {
      setDate(defaultDate);
    }
  }, [editTask, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editTask && onUpdate) {
      onUpdate(editTask.id, {
        title: title.trim(),
        type,
        date,
        time: time || undefined,
        priority,
        repeat,
        reminder,
        description: description.trim() || undefined,
        subtasks,
      });
    } else {
      onSave(
        title.trim(),
        type,
        date,
        time || undefined,
        priority,
        repeat,
        reminder,
        description.trim() || undefined,
        subtasks,
      );
    }
    onClose();
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks(prev => [...prev, { id: generateId(), title: newSubtask.trim(), completed: false }]);
    setNewSubtask('');
  };

  const removeSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  const typeOptions: { value: TaskType; label: string; emoji: string }[] = [
    { value: 'daily', label: 'Daily', emoji: '🏠' },
    { value: 'weekly', label: 'Weekly', emoji: '📅' },
    { value: 'monthly', label: 'Monthly', emoji: '🗓' },
    { value: 'yearly', label: 'Yearly', emoji: '🎯' },
    { value: 'future', label: 'Future', emoji: '🔮' },
  ];

  const priorityOptions: { value: PriorityType; label: string; color: string }[] = [
    { value: 'none', label: 'Normal', color: 'border-surface-300 dark:border-surface-600' },
    { value: 'low', label: 'Low', color: 'border-blue-400 text-blue-600 dark:text-blue-400' },
    { value: 'medium', label: 'Medium', color: 'border-amber-400 text-amber-600 dark:text-amber-400' },
    { value: 'high', label: 'High', color: 'border-red-400 text-red-600 dark:text-red-400' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="slide-up bg-white dark:bg-surface-900 w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto border border-surface-200 dark:border-surface-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-surface-100 dark:border-surface-800">
          <div>
            <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100">
              {editTask ? 'Edit Task' : 'Add Task'}
            </h2>
            <p className="text-xs text-surface-400 dark:text-surface-500">
              {editTask ? 'Make changes to your task' : 'Keep your day organized and clear'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {/* Task Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5">
              Task <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Complete lesson plan, Read 20 pages"
              className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/60 text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-[15px]"
              autoFocus
              required
            />
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5">
              Type
            </label>
            <div className="grid grid-cols-5 gap-1.5 bg-surface-100 dark:bg-surface-800 p-1 rounded-2xl">
              {typeOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`py-2 px-1 rounded-xl text-xs font-medium transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    type === opt.value
                      ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm font-semibold'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
                  }`}
                >
                  <span className="text-sm">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/60 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5">
                <Clock className="w-3.5 h-3.5" />
                Time <span className="text-surface-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/60 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5">
              <Flag className="w-3.5 h-3.5" />
              Priority <span className="text-surface-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="flex gap-2">
              {priorityOptions.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    priority === p.value
                      ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                      : 'bg-surface-50/50 dark:bg-surface-800/60 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300 dark:hover:border-surface-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Repeat */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5">
              Repeat
            </label>
            <select
              value={repeat}
              onChange={e => setRepeat(e.target.value as RepeatType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/60 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm cursor-pointer"
            >
              <option value="none">No repeat</option>
              <option value="daily">Every day</option>
              <option value="weekly">Every week</option>
              <option value="monthly">Every month</option>
              <option value="yearly">Every year</option>
            </select>
          </div>

          {/* Reminder Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-50/70 dark:bg-surface-800/40 border border-surface-200/70 dark:border-surface-700/60">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-primary-500" />
              <div>
                <p className="text-sm font-medium text-surface-800 dark:text-surface-200">Add Reminder</p>
                <p className="text-xs text-surface-400 dark:text-surface-500">Generates alarm in .ics calendar & notifications</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReminder(!reminder)}
              className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative shrink-0 ${
                reminder ? 'bg-primary-600' : 'bg-surface-300 dark:bg-surface-700'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  reminder ? 'left-5.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Checklist / Subtasks (especially for Yearly Goals or breaking down work) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5">
              Checklist Steps <span className="text-surface-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="space-y-2">
              {subtasks.map(sub => (
                <div key={sub.id} className="flex items-center gap-2">
                  <span className="flex-1 text-xs text-surface-700 dark:text-surface-300 bg-surface-100 dark:bg-surface-800 px-3 py-2 rounded-xl">
                    {sub.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSubtask(sub.id)}
                    className="p-1.5 text-surface-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSubtask();
                    }
                  }}
                  placeholder="e.g. Step 1: Read introduction..."
                  className="flex-1 px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/60 text-surface-900 dark:text-surface-100 placeholder-surface-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
                <button
                  type="button"
                  onClick={addSubtask}
                  className="px-3 py-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5">
              Note <span className="text-surface-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Additional details or links..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/60 text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-xs resize-none"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-700 active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-primary-600/20 transition-all cursor-pointer"
          >
            {editTask ? 'Save Changes' : 'Save Task'}
          </button>
        </form>
      </div>
    </div>
  );
};
