'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Lock, Globe, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useSettings, useUpdateSettings } from '@/hooks/use-api';
import type { UserSettings } from '@/types';

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  
  const [localSettings, setLocalSettings] = useState<UserSettings>({
    notifications: {
      email: {
        jobMatches: false,
        applicationUpdates: false,
        weeklyDigest: false,
      },
      push: {
        jobMatches: false,
        applicationUpdates: false,
      },
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
    },
    preferences: {
      language: 'en',
      timezone: 'America/New_York',
      emailFrequency: 'daily',
    },
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await updateSettings.mutateAsync(localSettings);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('idle');
    }
  };

  const updateNotificationSetting = (
    category: 'email' | 'push',
    setting: string,
    value: boolean
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [category]: {
          ...prev.notifications?.[category],
          [setting]: value,
        },
      },
    }));
  };

  const updatePrivacySetting = (setting: string, value: boolean) => {
    setLocalSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [setting]: value,
      },
    }));
  };

  const updatePreference = (setting: string, value: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [setting]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient">Settings</h1>
            <p className="text-slate-600 mt-1">Manage your account preferences</p>
          </div>
          
          <Button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500"
          >
            {saveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
            {saveStatus === 'saved' && <CheckCircle2 className="h-4 w-4" />}
            {saveStatus === 'idle' && <Save className="h-4 w-4" />}
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
          </Button>
        </motion.div>

        {/* Notifications Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Notifications</h2>
                <p className="text-sm text-slate-600">Manage how you receive updates</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Email Notifications */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Email Notifications</h3>
                <div className="space-y-3">
                  <ToggleRow
                    label="New Job Matches"
                    description="Get notified when new jobs match your profile"
                    checked={localSettings.notifications?.email?.jobMatches ?? false}
                    onChange={(checked) => updateNotificationSetting('email', 'jobMatches', checked)}
                  />
                  <ToggleRow
                    label="Application Updates"
                    description="Receive updates on your job applications"
                    checked={localSettings.notifications?.email?.applicationUpdates ?? false}
                    onChange={(checked) => updateNotificationSetting('email', 'applicationUpdates', checked)}
                  />
                  <ToggleRow
                    label="Weekly Digest"
                    description="Get a weekly summary of your job search activity"
                    checked={localSettings.notifications?.email?.weeklyDigest ?? false}
                    onChange={(checked) => updateNotificationSetting('email', 'weeklyDigest', checked)}
                  />
                </div>
              </div>

              {/* Push Notifications */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Push Notifications</h3>
                <div className="space-y-3">
                  <ToggleRow
                    label="Job Matches"
                    description="Push notifications for new job matches"
                    checked={localSettings.notifications?.push?.jobMatches ?? false}
                    onChange={(checked) => updateNotificationSetting('push', 'jobMatches', checked)}
                  />
                  <ToggleRow
                    label="Application Updates"
                    description="Push notifications for application status changes"
                    checked={localSettings.notifications?.push?.applicationUpdates ?? false}
                    onChange={(checked) => updateNotificationSetting('push', 'applicationUpdates', checked)}
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Privacy Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Privacy</h2>
                <p className="text-sm text-slate-600">Control your profile visibility</p>
              </div>
            </div>

            <div className="space-y-3">
              <ToggleRow
                label="Profile Visible"
                description="Make your profile visible to potential employers"
                checked={localSettings.privacy?.profileVisible ?? true}
                onChange={(checked) => updatePrivacySetting('profileVisible', checked)}
              />
              <ToggleRow
                label="Show Email"
                description="Display your email address on your public profile"
                checked={localSettings.privacy?.showEmail ?? false}
                onChange={(checked) => updatePrivacySetting('showEmail', checked)}
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Preferences</h2>
                <p className="text-sm text-slate-600">Customize your experience</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Language
                </label>
                <select
                  value={localSettings.preferences?.language ?? 'en'}
                  onChange={(e) => updatePreference('language', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Timezone
                </label>
                <select
                  value={localSettings.preferences?.timezone ?? 'America/New_York'}
                  onChange={(e) => updatePreference('timezone', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Frequency
                </label>
                <select
                  value={localSettings.preferences?.emailFrequency ?? 'daily'}
                  onChange={(e) => updatePreference('emailFrequency', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="realtime">Real-time</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Digest</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

// Toggle Row Component
interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white/50 hover:bg-white/80 transition-colors">
      <div className="flex-1">
        <p className="font-medium text-slate-800">{label}</p>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-emerald-500' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
