import React, { useRef, useState } from 'react';
import { AppSettings, ThemeMode } from '../types';
import { exportData, importData, clearAllData } from '../services/storageService';
import { isNotificationSupported, getNotificationStatus, requestNotificationPermission } from '../services/notificationService';
import { getToday } from '../utils/dateUtils';
import { Sun, Moon, Monitor, Download, Upload, Trash2, Bell, Shield, Info, Calendar } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onReload: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onReload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [notifStatus, setNotifStatus] = useState(getNotificationStatus());

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myday-backup-${getToday()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importData(reader.result as string);
        setImportStatus('Data restored successfully!');
        onReload();
        setTimeout(() => setImportStatus(null), 3000);
      } catch {
        setImportStatus('Error: Invalid backup file format.');
        setTimeout(() => setImportStatus(null), 3500);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearAll = () => {
    if (confirmClear) {
      clearAllData();
      onReload();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
    }
  };

  const handleNotifPermission = async () => {
    await requestNotificationPermission();
    setNotifStatus(getNotificationStatus());
  };

  const themes: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <div className="fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-1">
          Preferences & Data
        </p>
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-surface-100">
          Settings
        </h1>
        <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">
          Configure appearance, calendar preferences, and manage your local data
        </p>
      </div>

      <div className="space-y-5">
        {/* Appearance */}
        <section className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-3 flex items-center gap-2">
            <Sun className="w-4 h-4 text-primary-500" />
            Appearance
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {themes.map(t => (
              <button
                key={t.value}
                onClick={() => onUpdateSettings({ theme: t.value })}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  settings.theme === t.value
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 border border-surface-200 dark:border-surface-700'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary-500" />
            Notifications
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-800 dark:text-surface-200">
                Browser Permission: <span className="capitalize font-semibold text-primary-600 dark:text-primary-400">{notifStatus}</span>
              </p>
              <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">
                {isNotificationSupported()
                  ? 'Receive timely reminders for scheduled tasks.'
                  : 'Notifications not supported on this browser. Use Calendar .ics files instead.'}
              </p>
            </div>
            {isNotificationSupported() && notifStatus !== 'granted' && (
              <button
                onClick={handleNotifPermission}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white transition-colors cursor-pointer"
              >
                Enable
              </button>
            )}
          </div>
        </section>

        {/* Calendar Settings */}
        <section className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-500" />
            Calendar Defaults
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                Default Event Duration
              </label>
              <select
                value={settings.calendarEventDurationMinutes}
                onChange={e => onUpdateSettings({ calendarEventDurationMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-800 dark:text-surface-200 text-xs font-medium cursor-pointer"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes (1 hour)</option>
                <option value={90}>90 minutes</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                Default Alarm / Reminder
              </label>
              <select
                value={settings.defaultReminderMinutes}
                onChange={e => onUpdateSettings({ defaultReminderMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-800 dark:text-surface-200 text-xs font-medium cursor-pointer"
              >
                <option value={5}>5 minutes before</option>
                <option value={10}>10 minutes before</option>
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
              </select>
            </div>
          </div>
        </section>

        {/* Data (Backup & Restore) */}
        <section className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-3 flex items-center gap-2">
            <Download className="w-4 h-4 text-primary-500" />
            Data & Backup
          </h2>
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export Backup (JSON)
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Import Backup (JSON)
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />

            {importStatus && (
              <p className={`text-xs font-semibold px-3 py-2 rounded-xl ${
                importStatus.includes('success')
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
              }`}>
                {importStatus}
              </p>
            )}

            <button
              onClick={handleClearAll}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                confirmClear
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-surface-50 dark:bg-surface-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border-surface-200 dark:border-surface-700'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {confirmClear ? 'Click again to confirm permanent wipe' : 'Delete All Data'}
            </button>
          </div>
        </section>

        {/* Privacy */}
        <section className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            Privacy
          </h2>
          <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
            Your tasks and goals are stored locally on your device. My Day does not require an account or send your personal task data to a server.
          </p>
        </section>

        {/* About */}
        <section className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary-500" />
            About
          </h2>
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-surface-900 dark:text-surface-100">My Day</p>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
              Plan Your Day. Complete Your Goals.
            </p>
            <p className="text-[11px] text-surface-400 dark:text-surface-500 pt-1">
              Version 1.0.0 · Progressive Web App (PWA)
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
