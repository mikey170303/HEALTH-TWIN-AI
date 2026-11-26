import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings, Bell, Moon, Shield, Trash2, AlertTriangle,
  CheckCircle2, Loader2, Save
} from 'lucide-react';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [theme, setTheme] = useState('light');
  const [dataSharing, setDataSharing] = useState(false);

  // Deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await profileAPI.getSettings();
      setSettings(res.data);
      setEmailNotifs(res.data.email_notifications);
      setWeeklyReport(res.data.weekly_report);
      setTheme(res.data.theme);
      setDataSharing(res.data.data_sharing_consent);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await profileAPI.updateSettings({
        email_notifications: emailNotifs,
        weekly_report: weeklyReport,
        theme: theme,
        data_sharing_consent: dataSharing,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      await profileAPI.deleteAccount();
      alert('Your account and all associated health records have been permanently erased.');
      logout();
      navigate('/');
    } catch (err) {
      alert('Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
        <span>Loading account settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Application Settings & Privacy Controls
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure notification alerts, interface styling, and permanent data handling.
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
        {/* Notifications */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2.5 mb-2">
            <Bell className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Notification Preferences</h3>
          </div>

          <label className="flex items-start justify-between cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Biometric Alert Notifications</span>
              <span className="text-xs text-slate-400">Receive alerts if acute physiological spikes or severe anomalies occur.</span>
            </div>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
          </label>

          <label className="flex items-start justify-between cursor-pointer pt-2">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Weekly Health Digest</span>
              <span className="text-xs text-slate-400">Receive a weekly summary comparing sleep and blood pressure trends.</span>
            </div>
            <input
              type="checkbox"
              checked={weeklyReport}
              onChange={(e) => setWeeklyReport(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
          </label>
        </div>

        {/* Theme */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2.5 mb-2">
            <Moon className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Appearance & Theme</h3>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            {['light', 'dark', 'system'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`py-2 px-3 rounded-lg border font-semibold capitalize transition-all ${
                  theme === t
                    ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2.5 mb-2">
            <Shield className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Data Privacy & Research Sharing</h3>
          </div>

          <label className="flex items-start justify-between cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">De-Identified Statistical Research</span>
              <span className="text-xs text-slate-400">Allow fully anonymized biometric telemetry to improve community ML screening models.</span>
            </div>
            <input
              type="checkbox"
              checked={dataSharing}
              onChange={(e) => setDataSharing(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
          </label>
        </div>

        <div className="p-6 flex items-center justify-end bg-slate-50/50 rounded-b-2xl">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Account Deletion */}
      <div className="p-6 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-rose-600">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-sm font-bold">Danger Zone: Permanent Account Deletion</h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Permanently delete your account, credentials, and all recorded health measurements, predictions, and conversation history. This action cannot be reversed.
        </p>

        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Account & Data</span>
        </button>
      </div>

      {/* Deletion Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-rose-100 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-slate-900 text-base">Confirm Account Erasure</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will permanently delete your account profile, all blood pressure and biometric observations, ML model evaluations, and chat logs from the MySQL database.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type <span className="font-mono text-rose-600 font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full text-xs font-mono rounded-lg border border-slate-200 px-3 py-2 uppercase"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-40"
              >
                {deleting ? 'Erasing Data...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
