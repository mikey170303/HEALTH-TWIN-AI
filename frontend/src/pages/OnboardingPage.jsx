import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, ShieldCheck, Check, Sparkles, Loader2 } from 'lucide-react';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function OnboardingPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [age, setAge] = useState(user?.profile?.age || '');
  const [gender, setGender] = useState(user?.profile?.gender || 'not_specified');
  const [heightCm, setHeightCm] = useState(user?.profile?.height_cm || '');
  const [weightKg, setWeightKg] = useState(user?.profile?.current_weight_kg || '');
  const [units, setUnits] = useState(user?.profile?.preferred_units || 'metric');
  const [healthGoals, setHealthGoals] = useState(user?.profile?.health_goals_summary || '');
  const [consent, setConsent] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSave = async (skip = false) => {
    setLoading(true);
    try {
      await profileAPI.updateProfile({
        age: age ? parseInt(age) : null,
        gender: gender !== 'not_specified' ? gender : null,
        height_cm: heightCm ? parseFloat(heightCm) : null,
        current_weight_kg: weightKg ? parseFloat(weightKg) : null,
        preferred_units: units,
        health_goals_summary: healthGoals || null,
        consent_sensitive_data: consent,
        onboarding_completed: true,
      });
      await refreshUser();
      navigate('/app');
    } catch (e) {
      console.error(e);
      navigate('/app');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      {/* Step Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Activity className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Welcome to HealthTwin AI</h2>
        <p className="text-xs text-slate-500 mt-1">
          Let's initialize your baseline twin biometrics. You can update these anytime in your profile.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs flex items-center justify-center font-bold">1</span>
              <span>Physical Profile & Units</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="125"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 35"
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Biological Sex
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value="not_specified">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="e.g. 175"
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 72.5"
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Measurement Units
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="units"
                    checked={units === 'metric'}
                    onChange={() => setUnits('metric')}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span>Metric (kg, cm, mmHg)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="units"
                    checked={units === 'imperial'}
                    onChange={() => setUnits('imperial')}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span>Imperial (lbs, in)</span>
                </label>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs flex items-center justify-center font-bold">2</span>
              <span>Wellness Goals & Privacy Consent</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                What are your primary health focus areas? (Optional)
              </label>
              <textarea
                rows={3}
                value={healthGoals}
                onChange={(e) => setHealthGoals(e.target.value)}
                placeholder="e.g. Improve deep sleep duration, monitor blood pressure consistency, maintain healthy body mass ratio"
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800 block">Health Privacy Commitment</span>
                  Your entered biometric records are private to your authenticated user account. We never sell your health metrics.
                </div>
              </div>

              <label className="flex items-start gap-2 pt-1 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 text-teal-600 focus:ring-teal-500 rounded border-slate-300"
                />
                <span>I consent to storing voluntary health biometrics for personalized trend analysis.</span>
              </label>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Back
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  Skip for Now
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSave(false)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Complete Setup</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
