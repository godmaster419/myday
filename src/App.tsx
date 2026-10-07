import React, { useState, useEffect, useMemo } from 'react';
import {
  Home, CalendarDays, CalendarRange, Target, Sparkles, Settings, Plus,
  CheckCircle2, Menu, X, ChevronRight, Download, Check
} from 'lucide-react';
import { ActiveView, Task, TaskType } from './types';
import { useAppData } from './hooks/useAppData';
import { getToday } from './utils/dateUtils';
import { SearchBar } from './components/SearchBar';
import { TaskForm } from './components/TaskForm';
import { ThemeToggle } from './components/ThemeToggle';
import { TodayView } from './pages/TodayView';
import { WeeklyView } from './pages/WeeklyView';
import { MonthlyView } from './pages/MonthlyView';
import { YearlyView } from './pages/YearlyView';
import { FutureView } from './pages/FutureView';
import { CompletedView } from './pages/CompletedView';
import { SettingsView } from './pages/SettingsView';

const navItems: { id: ActiveView; label: string; icon: React.ReactNode; emoji: string }[] = [
  { id: 'today', label: 'Today', icon: <Home className="w-5 h-5" />, emoji: '🏠' },
  { id: 'weekly', label: 'Weekly', icon: <CalendarDays className="w-5 h-5" />, emoji: '📅' },
  { id: 'monthly', label: 'Monthly', icon: <CalendarRange className="w-5 h-5" />, emoji: '🗓' },
  { id: 'yearly', label: 'Yearly', icon: <Target className="w-5 h-5" />, emoji: '🎯' },
  { id: 'future', label: 'Future', icon: <Sparkles className="w-5 h-5" />, emoji: '🔮' },
];

const viewToType: Record<string, TaskType> = {
  today: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  yearly: 'yearly',
  future: 'future',
};

export default function App() {
  const {
    tasks, settings, getEffectiveTasks,
    addTask, updateTask, deleteTask, toggleTask, toggleSubtask,
    convertFutureToToday, updateSettings, reloadData,
  } = useAppData();

  const [activeView, setActiveView] = useState<ActiveView>('today');
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [defaultDateForForm, setDefaultDateForForm] = useState<string | undefined>(undefined);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.setAttribute('data-theme', 'system');
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const applyTheme = (isDark: boolean) => {
        if (isDark) root.classList.add('dark');
        else root.classList.remove('dark');
      };
      applyTheme(mq.matches);
      const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  // Register PWA service worker and capture install prompt
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        reg.update().catch(() => {});
      }).catch(() => {});
    }
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const effectiveTasks = useMemo(() => getEffectiveTasks(tasks), [tasks, getEffectiveTasks]);

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setDefaultDateForForm(undefined);
    setShowForm(true);
  };

  const handleSearchSelect = (task: Task) => {
    if (task.type === 'yearly') setActiveView('yearly');
    else if (task.type === 'future') setActiveView('future');
    else setActiveView('today');
    handleEdit(task);
  };

  const handleAddNewTask = (date?: string) => {
    setEditTask(null);
    setDefaultDateForForm(date);
    setShowForm(true);
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      showToast('My Day added to your device!');
    }
  };

  const todayCount = useMemo(() => {
    const today = getToday();
    return effectiveTasks.filter(t => t.date === today && !t.completed && t.type !== 'yearly' && t.type !== 'future').length;
  }, [effectiveTasks]);

  const renderView = () => {
    switch (activeView) {
      case 'today':
        return (
          <TodayView
            tasks={effectiveTasks}
            onToggle={toggleTask}
            onEdit={handleEdit}
            onDelete={deleteTask}
            onToggleSubtask={toggleSubtask}
            onAddNewTask={() => handleAddNewTask()}
            onCalendarSuccess={(title) => showToast(`Calendar file downloaded for "${title}". Open to add to your calendar.`)}
          />
        );
      case 'weekly':
        return (
          <WeeklyView
            tasks={effectiveTasks}
            onToggle={toggleTask}
            onEdit={handleEdit}
            onDelete={deleteTask}
            onToggleSubtask={toggleSubtask}
            onAddNewTaskForDate={(d) => handleAddNewTask(d)}
            onCalendarSuccess={(title) => showToast(`Calendar file downloaded for "${title}".`)}
          />
        );
      case 'monthly':
        return (
          <MonthlyView
            tasks={effectiveTasks}
            onToggle={toggleTask}
            onEdit={handleEdit}
            onDelete={deleteTask}
            onToggleSubtask={toggleSubtask}
            onAddNewTaskForDate={(d) => handleAddNewTask(d)}
            onCalendarSuccess={(title) => showToast(`Calendar file downloaded for "${title}".`)}
          />
        );
      case 'yearly':
        return (
          <YearlyView
            tasks={effectiveTasks}
            onToggle={toggleTask}
            onEdit={handleEdit}
            onDelete={deleteTask}
            onToggleSubtask={toggleSubtask}
            onAddNewGoal={() => handleAddNewTask()}
            onCalendarSuccess={(title) => showToast(`Calendar file downloaded for "${title}".`)}
          />
        );
      case 'future':
        return (
          <FutureView
            tasks={effectiveTasks}
            onToggle={toggleTask}
            onEdit={handleEdit}
            onDelete={deleteTask}
            onToggleSubtask={toggleSubtask}
            onConvertToToday={(id) => {
              convertFutureToToday(id);
              showToast('Moved to Today!');
            }}
            onAddNewFuturePlan={() => handleAddNewTask()}
            onCalendarSuccess={(title) => showToast(`Calendar file downloaded for "${title}".`)}
          />
        );
      case 'completed':
        return (
          <CompletedView
            tasks={effectiveTasks}
            onToggle={toggleTask}
            onEdit={handleEdit}
            onDelete={deleteTask}
            onToggleSubtask={toggleSubtask}
            onCalendarSuccess={(title) => showToast(`Calendar file downloaded for "${title}".`)}
          />
        );
      case 'settings':
        return (
          <SettingsView
            settings={settings}
            onUpdateSettings={updateSettings}
            onReload={reloadData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-surface-950 text-surface-900 dark:text-surface-100 transition-colors selection:bg-primary-200 selection:text-primary-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 slide-up bg-surface-900 text-white dark:bg-white dark:text-surface-900 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold max-w-sm border border-surface-700/30">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Desktop Sidebar (Section 22) */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-white/90 dark:bg-surface-900/95 backdrop-blur-md border-r border-surface-200/80 dark:border-surface-800 z-30 shadow-xs">
        {/* Brand Header */}
        <div className="p-6 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-700 via-primary-600 to-amber-600 flex items-center justify-center shadow-sm shadow-primary-900/10">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="3" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <polyline points="9,14 11,16 15,12" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-surface-900 dark:text-surface-50">
                My Day
              </h1>
              <p className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 tracking-wide uppercase">
                Plan Your Day
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 shadow-xs'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.id === 'today' && todayCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/60 text-primary-600 dark:text-primary-300">
                    {todayCount}
                  </span>
                )}
              </button>
            );
          })}

          <div className="h-px bg-surface-100 dark:border-surface-800 my-3" />

          {/* Completed Archive */}
          <button
            onClick={() => setActiveView('completed')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'completed'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
            }`}
          >
            <CheckCircle2 className={`w-5 h-5 ${activeView === 'completed' ? 'text-emerald-600' : 'text-surface-400'}`} />
            <span>Completed</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setActiveView('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'settings'
                ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
            }`}
          >
            <Settings className={`w-5 h-5 ${activeView === 'settings' ? 'text-primary-600' : 'text-surface-400'}`} />
            <span>Settings</span>
          </button>
        </nav>

        {/* Theme Switcher in Desktop Sidebar */}
        <div className="p-3 border-t border-surface-200/60 dark:border-surface-800">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500">
              Theme Mode
            </span>
            <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 capitalize">
              {settings.theme === 'light' ? 'Cream Light' : settings.theme === 'dark' ? 'Warm Dark' : 'System Auto'}
            </span>
          </div>
          <ThemeToggle
            currentTheme={settings.theme}
            onThemeChange={(t) => updateSettings({ theme: t })}
            variant="segmented"
          />
        </div>

        {/* PWA Install prompt in desktop sidebar if available */}
        {deferredPrompt && (
          <div className="px-4 py-2">
            <button
              onClick={handleInstallApp}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-surface-100 dark:bg-surface-800 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-surface-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Install My Day
            </button>
          </div>
        )}

        {/* Desktop Primary Action */}
        <div className="p-4 border-t border-surface-100 dark:border-surface-800">
          <button
            onClick={() => handleAddNewTask()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-semibold text-sm shadow-md shadow-primary-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Add Task
          </button>
        </div>
      </aside>

      {/* Mobile Header (Section 21) */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white/90 dark:bg-surface-900/90 backdrop-blur-md border-b border-surface-200/80 dark:border-surface-800 z-30">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-700 via-primary-600 to-amber-600 flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="3" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <polyline points="9,14 11,16 15,12" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-extrabold text-surface-900 dark:text-surface-100 leading-none">
                My Day
              </h1>
              <p className="text-[9px] font-semibold text-primary-600 dark:text-primary-400 leading-tight">
                Plan Your Day
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle
              currentTheme={settings.theme}
              onThemeChange={(t) => updateSettings({ theme: t })}
              variant="compact"
            />
            <SearchBar tasks={effectiveTasks} onSelectTask={handleSearchSelect} />
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="p-2 rounded-xl text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
              aria-label="Navigation menu"
            >
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown Modal */}
      {mobileMenu && (
        <div className="md:hidden fixed inset-0 z-40 pt-14" onClick={() => setMobileMenu(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xs" />
          <div
            className="relative slide-up bg-white dark:bg-surface-900 mx-3 mt-2 rounded-3xl shadow-2xl overflow-hidden border border-surface-200 dark:border-surface-800 p-2 space-y-1"
            onClick={e => e.stopPropagation()}
          >
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id); setMobileMenu(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeView === item.id
                    ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400'
                    : 'text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{item.emoji}</span>
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-surface-300 dark:text-surface-600" />
              </button>
            ))}

            <div className="h-px bg-surface-100 dark:bg-surface-800 my-1" />

            <button
              onClick={() => { setActiveView('completed'); setMobileMenu(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-colors cursor-pointer ${
                activeView === 'completed'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">✅</span>
                <span>Completed Tasks</span>
              </div>
              <ChevronRight className="w-4 h-4 text-surface-300 dark:text-surface-600" />
            </button>

            <button
              onClick={() => { setActiveView('settings'); setMobileMenu(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-colors cursor-pointer ${
                activeView === 'settings'
                  ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400'
                  : 'text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">⚙️</span>
                <span>Settings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-surface-300 dark:text-surface-600" />
            </button>

            {/* Mobile Menu Theme Switcher */}
            <div className="p-3 bg-surface-50 dark:bg-surface-850 rounded-2xl border border-surface-200/80 dark:border-surface-800 my-1">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-surface-500">Theme</span>
                <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400">
                  {settings.theme === 'light' ? 'Cream Light' : settings.theme === 'dark' ? 'Warm Dark' : 'System Auto'}
                </span>
              </div>
              <ThemeToggle
                currentTheme={settings.theme}
                onThemeChange={(t) => updateSettings({ theme: t })}
                variant="segmented"
              />
            </div>

            {deferredPrompt && (
              <button
                onClick={() => { handleInstallApp(); setMobileMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50/60 dark:bg-primary-950/30 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Install My Day App</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation (Section 21) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-surface-900/90 backdrop-blur-md border-t border-surface-200/80 dark:border-surface-800 z-30 pb-safe">
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.slice(0, 4).map(item => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400 font-bold'
                    : 'text-surface-400 dark:text-surface-500 font-medium'
                }`}
              >
                {item.icon}
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}

          {/* Prominent floating Add Button */}
          <button
            onClick={() => handleAddNewTask()}
            className="w-12 h-12 -mt-6 rounded-2xl bg-primary-600 hover:bg-primary-700 active:scale-95 text-white shadow-lg shadow-primary-600/30 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Add task"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="md:ml-64 pt-18 md:pt-4 pb-28 md:pb-12 min-h-screen">
        {/* Desktop Top Bar with Search & Theme Toggle */}
        <div className="hidden md:flex items-center justify-between px-8 py-3 mb-2 border-b border-surface-200/60 dark:border-surface-800/60 max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-surface-500 dark:text-surface-400">
            Plan Your Day. Complete Your Goals.
          </p>
          <div className="flex items-center gap-2.5">
            <ThemeToggle
              currentTheme={settings.theme}
              onThemeChange={(t) => updateSettings({ theme: t })}
              variant="compact"
            />
            <SearchBar tasks={effectiveTasks} onSelectTask={handleSearchSelect} />
          </div>
        </div>

        {/* View Component */}
        <div className="px-4 sm:px-8 py-2 max-w-4xl mx-auto">
          {renderView()}
        </div>
      </main>

      {/* Add / Edit Task Modal */}
      {showForm && (
        <TaskForm
          onSave={addTask}
          onUpdate={updateTask}
          onClose={() => { setShowForm(false); setEditTask(null); setDefaultDateForForm(undefined); }}
          editTask={editTask}
          defaultDate={defaultDateForForm}
          defaultType={viewToType[activeView] || 'daily'}
        />
      )}
    </div>
  );
}
