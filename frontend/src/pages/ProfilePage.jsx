import React, { useState, useEffect } from 'react';
import {
  User, Save, CheckCircle2, AlertCircle, Loader2, Scale,
  ShieldCheck, HeartPulse
} from 'lucide-react';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [age, setAge] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [currentWeightKg, setCurrentWeightKg] = useState('');
  const [preferredUnits, setPreferredUnits] = useState('metric');
  const [healthGoalsSummary, setHealthGoalsSummary] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [consentSensitiveData, setConsentSensitiveData] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await profileAPI.getProfile();
      const p = res.data;
      setProfile(p);
      setAge(p.age || '');
      setDateOfBirth(p.date_of_birth || '');
      setGender(p.gender || '');
      setHeightCm(p.height_cm || '');
      setCurrentWeightKg(p.current_weight_kg || '');
      setPreferredUnits(p.preferred_units || 'metric');
      setHealthGoalsSummary(p.health_goals_summary || '');
      setMedicalConditions(p.medical_conditions || '');
      setEmergencyContact(p.emergency_contact || '');
      setConsentSensitiveData(p.consent_sensitive_data || false);
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    setSuccess(false);

    try {
      const res = await profileAPI.updateProfile({
        age: age ? parseInt(age) : null,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        height_cm: heightCm ? parseFloat(heightCm) : null,
        current_weight_kg: currentWeightKg ? parseFloat(currentWeightKg) : null,
        preferred_units: preferredUnits,
        health_goals_summary: healthGoalsSummary || null,
        medical_conditions: medicalConditions || null,
        emergency_contact: emergencyContact || null,
        consent_sensitive_data: consentSensitiveData,
      });
      setProfile(res.data);
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
        <span>Loading health profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Health Profile & Biometrics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Maintain your core physiological measurements and unit preferences.
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Health profile successfully updated and synchronized.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* BMI Screening Card */}
      {profile?.bmi && (
        <div className="p-5 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900">{profile.bmi} kg/m²</span>
                <span className="text-xs font-semibold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                  {profile.bmi_category}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Calculated screening ratio from height ({profile.height_cm}cm) and weight ({profile.current_weight_kg}kg).
              </p>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 sm:text-right max-w-xs">
            *Screening measure only, not a clinical assessment of adiposity or cardiovascular risk.
          </span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
            <input
              type="number"
              min="1"
              max="130"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 42"
              className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Biological Sex</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Units</label>
            <select
              value={preferredUnits}
              onChange={(e) => setPreferredUnits(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white"
            >
              <option value="metric">Metric (kg, cm, mmHg)</option>
              <option value="imperial">Imperial (lbs, in)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Height (cm)</label>
            <input
              type="number"
              step="0.5"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="e.g. 176"
              className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={currentWeightKg}
              onChange={(e) => setCurrentWeightKg(e.target.value)}
              placeholder="e.g. 74.0"
              className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Emergency Contact Information (Optional)
          </label>
          <input
            type="text"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
            placeholder="Name & Contact Phone (e.g. Spouse / Family Physician)"
            className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Personal Health Goals & Focus
          </label>
          <textarea
            rows={2}
            value={healthGoalsSummary}
            onChange={(e) => setHealthGoalsSummary(e.target.value)}
            placeholder="e.g. Reduce resting pulse, improve sleep latency, maintain balanced blood pressure"
            className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Relevant Medical Context / Conditions (Voluntary)
          </label>
          <textarea
            rows={2}
            value={medicalConditions}
            onChange={(e) => setMedicalConditions(e.target.value)}
            placeholder="e.g. Mild hypertension under lifestyle management, seasonal allergies"
            className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={consentSensitiveData}
              onChange={(e) => setConsentSensitiveData(e.target.checked)}
              className="text-teal-600 focus:ring-teal-500 rounded border-slate-300"
            />
            <span>Sensitive health biometric processing consent granted</span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}
