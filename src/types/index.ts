export type TaskType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'future';
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type PriorityType = 'none' | 'low' | 'medium' | 'high';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  date: string; // ISO date string YYYY-MM-DD
  time?: string; // HH:MM
  priority?: PriorityType;
  completed: boolean;
  repeat: RepeatType;
  reminder: boolean;
  subtasks: SubTask[];
  createdAt: string;
  description?: string;
}

export interface AppSettings {
  theme: ThemeMode;
  notificationsEnabled: boolean;
  defaultReminderMinutes: number;
  calendarEventDurationMinutes: number;
}

export interface AppData {
  tasks: Task[];
  settings: AppSettings;
  version: number;
}

export type ActiveView = 'today' | 'weekly' | 'monthly' | 'yearly' | 'future' | 'settings' | 'completed';
