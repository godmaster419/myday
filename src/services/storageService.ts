import { AppData, AppSettings, Task } from '../types';

const STORAGE_KEY = 'myday_data';
const DATA_VERSION = 1;

export const defaultSettings: AppSettings = {
  theme: 'system',
  notificationsEnabled: false,
  defaultReminderMinutes: 15,
  calendarEventDurationMinutes: 60,
};

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDefaultStarterTasks(): Task[] {
  const today = getTodayString();
  return [
    {
      id: 'task-1',
      title: 'Complete lesson plan',
      type: 'daily',
      date: today,
      completed: true,
      priority: 'high',
      time: '09:00',
      repeat: 'none',
      reminder: false,
      subtasks: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: 'Finish school work',
      type: 'daily',
      date: today,
      completed: false,
      priority: 'high',
      time: '11:30',
      repeat: 'none',
      reminder: true,
      subtasks: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      title: 'Exercise',
      type: 'daily',
      date: today,
      completed: false,
      priority: 'medium',
      time: '17:00',
      repeat: 'daily',
      reminder: false,
      subtasks: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'Read a book',
      type: 'daily',
      date: today,
      completed: false,
      priority: 'low',
      time: '20:30',
      repeat: 'none',
      reminder: false,
      subtasks: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-5',
      title: 'Plan tomorrow',
      type: 'daily',
      date: today,
      completed: false,
      priority: 'none',
      time: '21:45',
      repeat: 'daily',
      reminder: false,
      subtasks: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-6',
      title: 'Learn Python',
      type: 'yearly',
      date: today,
      completed: false,
      priority: 'high',
      repeat: 'none',
      reminder: false,
      subtasks: [
        { id: 'st-1', title: 'Learn basics', completed: true },
        { id: 'st-2', title: 'Learn variables', completed: true },
        { id: 'st-3', title: 'Learn functions', completed: false },
        { id: 'st-4', title: 'Build first project', completed: false },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-7',
      title: 'Complete 50 books this year',
      type: 'yearly',
      date: today,
      completed: false,
      priority: 'medium',
      repeat: 'none',
      reminder: false,
      subtasks: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-8',
      title: 'Buy a new laptop',
      type: 'future',
      date: today,
      completed: false,
      priority: 'medium',
      repeat: 'none',
      reminder: false,
      subtasks: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-9',
      title: 'Learn video editing',
      type: 'future',
      date: today,
      completed: false,
      priority: 'low',
      repeat: 'none',
      reminder: false,
      subtasks: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-10',
      title: 'Create an educational website',
      type: 'future',
      date: today,
      completed: false,
      priority: 'high',
      repeat: 'none',
      reminder: false,
      subtasks: [],
      createdAt: new Date().toISOString(),
    },
  ];
}

function getDefaultData(): AppData {
  return {
    tasks: getDefaultStarterTasks(),
    settings: defaultSettings,
    version: DATA_VERSION,
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultData();
      saveData(initial);
      return initial;
    }
    const data = JSON.parse(raw) as AppData;
    data.settings = { ...defaultSettings, ...(data.settings || {}) };
    if (!data.tasks || !Array.isArray(data.tasks)) data.tasks = [];
    return data;
  } catch {
    return getDefaultData();
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

export function saveTasks(tasks: Task[]): void {
  const data = loadData();
  data.tasks = tasks;
  saveData(data);
}

export function saveSettings(settings: AppSettings): void {
  const data = loadData();
  data.settings = settings;
  saveData(data);
}

export function exportData(): string {
  const data = loadData();
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): AppData {
  const data = JSON.parse(jsonString) as AppData;
  if (!data.tasks || !Array.isArray(data.tasks)) {
    throw new Error('Invalid data format: missing tasks array');
  }
  data.settings = { ...defaultSettings, ...(data.settings || {}) };
  data.version = DATA_VERSION;
  saveData(data);
  return data;
}

export function clearAllData(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    tasks: [],
    settings: defaultSettings,
    version: DATA_VERSION,
  }));
}
