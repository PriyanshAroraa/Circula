import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  Trash2,
  Bell,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Shield,
  Info,
  Palette
} from 'lucide-react';
import { storage } from '../utils/storage';

interface SettingsViewProps {
  onDataImported?: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onDataImported }) => {
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [exportStatus, setExportStatus] = useState<string>('');

  const handleExportData = () => {
    try {
      const data = storage.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `circula-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportStatus('Data exported successfully!');
      setTimeout(() => setExportStatus(''), 3000);
    } catch (error) {
      setExportStatus('Failed to export data');
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const success = storage.importData(data);
        if (success) {
          setExportStatus('Data imported successfully!');
          onDataImported?.();
        } else {
          setExportStatus('Failed to import data');
        }
        setTimeout(() => setExportStatus(''), 3000);
      } catch (error) {
        setExportStatus('Invalid file format');
        setTimeout(() => setExportStatus(''), 3000);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      storage.clearAll();
      setExportStatus('All data cleared');
      setTimeout(() => setExportStatus(''), 3000);
      onDataImported?.();
    }
  };

  const settingSections = [
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          label: 'Task Reminders',
          description: 'Get notified before tasks start',
          value: notifications,
          onChange: setNotifications,
          type: 'toggle' as const
        },
        {
          label: 'Sound Effects',
          description: 'Play sounds for interactions',
          value: soundEnabled,
          onChange: setSoundEnabled,
          type: 'toggle' as const
        }
      ]
    },
    {
      title: 'Appearance',
      icon: Palette,
      settings: [
        {
          label: 'Theme',
          description: 'Choose your preferred theme',
          value: theme,
          options: [
            { label: 'Dark', value: 'dark', icon: Moon },
            { label: 'Light', value: 'light', icon: Sun }
          ],
          onChange: setTheme,
          type: 'select' as const
        }
      ]
    },
    {
      title: 'Data Management',
      icon: Shield,
      settings: [
        {
          label: 'Export Data',
          description: 'Download your tasks and settings',
          action: handleExportData,
          type: 'action' as const,
          icon: Download
        },
        {
          label: 'Import Data',
          description: 'Restore from backup file',
          action: handleImportData,
          type: 'file' as const,
          icon: Upload
        },
        {
          label: 'Clear All Data',
          description: 'Remove all tasks and settings',
          action: handleClearData,
          type: 'danger' as const,
          icon: Trash2
        }
      ]
    },
    {
      title: 'About',
      icon: Info,
      settings: [
        {
          label: 'Version',
          description: 'Circula v1.0.0',
          type: 'info' as const
        },
        {
          label: 'Support',
          description: 'Get help and report issues',
          action: () => window.open('https://github.com/PriyanshAroraa/Circula---Visual-Time-Design-App', '_blank'),
          type: 'link' as const
        }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-32">
      <header>
        <h2 className="text-3xl font-bold mb-1">Settings</h2>
        <p className="text-neutral-500">Customize your Circula experience</p>
      </header>

      {exportStatus && (
        <div className={`p-4 rounded-xl border ${
          exportStatus.includes('success')
            ? 'bg-success/10 border-success/20 text-success'
            : 'bg-error/10 border-error/20 text-error'
        }`}>
          {exportStatus}
        </div>
      )}

      <div className="space-y-6">
        {settingSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-surface border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <section.icon size={20} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{section.title}</h3>
            </div>

            <div className="space-y-4">
              {section.settings.map((setting, settingIndex) => (
                <div key={settingIndex} className="flex items-center justify-between py-3 border-b border-neutral-800/50 last:border-b-0">
                  <div className="flex-1">
                    <div className="font-medium text-white">{setting.label}</div>
                    <div className="text-sm text-neutral-500">{setting.description}</div>
                  </div>

                  {setting.type === 'toggle' && (
                    <button
                      onClick={() => setting.onChange(!setting.value)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        setting.value ? 'bg-primary' : 'bg-neutral-600'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        setting.value ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  )}

                  {setting.type === 'select' && setting.options && (
                    <div className="flex gap-2">
                      {setting.options.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setting.onChange(option.value)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                            setting.value === option.value
                              ? 'bg-primary text-black'
                              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                          }`}
                        >
                          <option.icon size={16} />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {setting.type === 'action' && setting.action && (
                    <button
                      onClick={setting.action}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-white"
                    >
                      <setting.icon size={16} />
                      {setting.label}
                    </button>
                  )}

                  {setting.type === 'file' && setting.action && (
                    <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-white cursor-pointer">
                      <setting.icon size={16} />
                      {setting.label}
                      <input
                        type="file"
                        accept=".json"
                        onChange={setting.action}
                        className="hidden"
                      />
                    </label>
                  )}

                  {setting.type === 'danger' && setting.action && (
                    <button
                      onClick={setting.action}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors"
                    >
                      <setting.icon size={16} />
                      {setting.label}
                    </button>
                  )}

                  {setting.type === 'link' && setting.action && (
                    <button
                      onClick={setting.action}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-primary"
                    >
                      {setting.label}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-neutral-600 text-sm">
        Made with ❤️ for productive minds
      </div>
    </div>
  );
};

export default SettingsView;
