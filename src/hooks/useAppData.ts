import { useState, useEffect, useCallback } from 'react';
import { Task, AppSettings, TaskType, RepeatType, PriorityType, SubTask } from '../types';
import { loadData, saveTasks, saveSettings, defaultSettings } from '../services/storageService';
import { generateId, getToday, formatDate, parseDate } from '../utils/dateUtils';

export function useAppData() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // Load on mount
  useEffect(() => {
    const data = loadData();
    setTasks(data.tasks);
    setSettings(data.settings);
  }, []);

  // Generate recurring task occurrences
  const getEffectiveTasks = useCallback((baseTasks: Task[]): Task[] => {
    const today = getToday();
    const result: Task[] = [...baseTasks];
    const existingIds = new Set(baseTasks.map(t => t.id));

    baseTasks.forEach(task => {
      if (!task.repeat || task.repeat === 'none') return;

      const baseDate = parseDate(task.date);
      const todayDate = parseDate(today);

      // Generate occurrences up to 30 days ahead
      const maxFuture = new Date(todayDate);
      maxFuture.setDate(maxFuture.getDate() + 30);

      let current = new Date(baseDate);
      // Advance by one step first
      if (task.repeat === 'daily') {
        current.setDate(current.getDate() + 1);
      } else if (task.repeat === 'weekly') {
        current.setDate(current.getDate() + 7);
      } else if (task.repeat === 'monthly') {
        current.setMonth(current.getMonth() + 1);
      } else if (task.repeat === 'yearly') {
        current.setFullYear(current.getFullYear() + 1);
      }

      while (current <= maxFuture) {
        const dateStr = formatDate(current);
        if (dateStr !== task.date) {
          const recurId = `${task.id}_${dateStr}`;
          if (!existingIds.has(recurId)) {
            result.push({
              ...task,
              id: recurId,
              date: dateStr,
              completed: false,
              subtasks: task.subtasks.map(st => ({ ...st, id: generateId(), completed: false })),
            });
            existingIds.add(recurId);
          }
        }
        if (task.repeat === 'daily') {
          current.setDate(current.getDate() + 1);
        } else if (task.repeat === 'weekly') {
          current.setDate(current.getDate() + 7);
        } else if (task.repeat === 'monthly') {
          current.setMonth(current.getMonth() + 1);
        } else if (task.repeat === 'yearly') {
          current.setFullYear(current.getFullYear() + 1);
        } else {
          break;
        }
      }
    });

    return result;
  }, []);

  const addTask = useCallback((
    title: string,
    type: TaskType,
    date: string,
    time?: string,
    priority: PriorityType = 'none',
    repeat: RepeatType = 'none',
    reminder: boolean = false,
    description?: string,
    subtasks: SubTask[] = [],
  ) => {
    const newTask: Task = {
      id: generateId(),
      title,
      type,
      date: date || getToday(),
      time: time || undefined,
      priority,
      completed: false,
      repeat,
      reminder,
      subtasks,
      createdAt: new Date().toISOString(),
      description,
    };
    setTasks(prev => {
      const updated = [...prev, newTask];
      saveTasks(updated);
      return updated;
    });
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const exists = prev.some(t => t.id === id);
      if (!exists && id.includes('_')) {
        const lastUnderscore = id.lastIndexOf('_');
        const parentId = id.substring(0, lastUnderscore);
        const dateStr = id.substring(lastUnderscore + 1);
        const parent = prev.find(t => t.id === parentId);
        if (parent) {
          const materializedTask: Task = {
            ...parent,
            ...updates,
            id,
            date: updates.date || dateStr,
            repeat: 'none',
          };
          const updated = [...prev, materializedTask];
          saveTasks(updated);
          return updated;
        }
      }
      const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      saveTasks(updated);
      return updated;
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const updated = prev.filter(t => t.id !== id && !t.id.startsWith(id + '_'));
      saveTasks(updated);
      return updated;
    });
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => {
      const exists = prev.some(t => t.id === id);
      if (!exists && id.includes('_')) {
        const lastUnderscore = id.lastIndexOf('_');
        const parentId = id.substring(0, lastUnderscore);
        const dateStr = id.substring(lastUnderscore + 1);
        const parent = prev.find(t => t.id === parentId);
        if (parent) {
          const materializedTask: Task = {
            ...parent,
            id,
            date: dateStr,
            completed: true,
            repeat: 'none',
            subtasks: parent.subtasks.map(st => ({ ...st, id: generateId(), completed: false })),
          };
          const updated = [...prev, materializedTask];
          saveTasks(updated);
          return updated;
        }
      }
      const updated = prev.map(t => {
        if (t.id === id) {
          return { ...t, completed: !t.completed };
        }
        return t;
      });
      saveTasks(updated);
      return updated;
    });
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => {
      let list = prev;
      const exists = prev.some(t => t.id === taskId);
      if (!exists && taskId.includes('_')) {
        const lastUnderscore = taskId.lastIndexOf('_');
        const parentId = taskId.substring(0, lastUnderscore);
        const dateStr = taskId.substring(lastUnderscore + 1);
        const parent = prev.find(t => t.id === parentId);
        if (parent) {
          const materialized: Task = {
            ...parent,
            id: taskId,
            date: dateStr,
            repeat: 'none',
            subtasks: parent.subtasks.map(st => ({ ...st })),
          };
          list = [...prev, materialized];
        }
      }
      const updated = list.map(t => {
        if (t.id === taskId) {
          const newSubtasks = t.subtasks.map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          const allCompleted = newSubtasks.length > 0 && newSubtasks.every(st => st.completed);
          return {
            ...t,
            subtasks: newSubtasks,
            completed: allCompleted ? true : t.completed,
          };
        }
        return t;
      });
      saveTasks(updated);
      return updated;
    });
  }, []);

  const convertFutureToToday = useCallback((id: string) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === id) {
          return {
            ...t,
            type: 'daily' as TaskType,
            date: getToday(),
          };
        }
        return t;
      });
      saveTasks(updated);
      return updated;
    });
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const reloadData = useCallback(() => {
    const data = loadData();
    setTasks(data.tasks);
    setSettings(data.settings);
  }, []);

  return {
    tasks,
    settings,
    getEffectiveTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    toggleSubtask,
    convertFutureToToday,
    updateSettings,
    reloadData,
  };
}
