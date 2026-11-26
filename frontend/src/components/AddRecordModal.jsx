import React, { useState } from 'react';
import { X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { healthRecordsAPI } from '../services/api';

const RECORD_TYPES = [
  { id: 'blood_pressure', label: 'Blood Pressure', defaultUnit: 'mmHg', hasSecondary: true, secLabel: 'Diastolic' },
  { id: 'heart_rate', label: 'Heart Rate', defaultUnit: 'bpm' },
  { id: 'weight', label: 'Weight', defaultUnit: 'kg' },
  { id: 'sleep_duration', label: 'Sleep Duration', defaultUnit: 'hours' },
  { id: 'step_count', label: 'Step Count', defaultUnit: 'steps' },
  { id: 'blood_glucose', label: 'Blood Glucose', defaultUnit: 'mg/dL' },
  { id: 'height', label: 'Height', defaultUnit: 'cm' },
];

export default function AddRecordModal({ isOpen, onClose, onRecordAdded }) {
  const [recordType, setRecordType] = useState('blood_pressure');
  const [valuePrimary, setValuePrimary] = useState('');
  const [valueSecondary, setValueSecondary] = useState('');
  const [unit, setUnit] = useState('mmHg');
  const [notes, setNotes] = useState('');
  const [recordedAt, setRecordedAt] = useState(new Date().toISOString().slice(0, 16));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const currentTypeConfig = RECORD_TYPES.find((t) => t.id === recordType);

  const handleTypeChange = (newType) => {
    setRecordType(newType);
    const cfg = RECORD_TYPES.find((t) => t.id === newType);
    if (cfg) {
      setUnit(cfg.defaultUnit);
    }
    setValuePrimary('');
    setValueSecondary('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!valuePrimary || isNaN(Number(valuePrimary))) {
      setError('Please enter a valid numeric measurement.');
      setLoading(false);
      return;
    }

    if (currentTypeConfig?.hasSecondary && (!valueSecondary || isNaN(Number(valueSecondary)))) {
      setError('Please enter diastolic blood pressure reading.');
      setLoading(false);
      return;
    }

    try {
      await healthRecordsAPI.create({
        record_type: recordType,
        value_primary: parseFloat(valuePrimary),
        value_secondary: currentTypeConfig?.hasSecondary ? parseFloat(valueSecondary) : null,
        unit: unit,
        notes: notes.trim() || null,
        recorded_at: recordedAt ? new Date(recordedAt).toISOString() : new Date().toISOString(),
        source: 'manual',
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setValuePrimary('');
        setValueSecondary('');
        setNotes('');
        onRecordAdded && onRecordAdded();
        onClose();
      }, 700);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save health record. Check input values.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 text-base">Record Health Metric</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Observation successfully recorded!</span>
            </div>
          )}

          {/* Metric Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Measurement Type
            </label>
            <select
              value={recordType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              {RECORD_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {currentTypeConfig?.hasSecondary ? 'Systolic' : 'Value'}
              </label>
              <input
                type="number"
                step="any"
                required
                value={valuePrimary}
                onChange={(e) => setValuePrimary(e.target.value)}
                placeholder="e.g. 120"
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {currentTypeConfig?.hasSecondary ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Diastolic
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={valueSecondary}
                  onChange={(e) => setValueSecondary(e.target.value)}
                  placeholder="e.g. 80"
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Unit
                </label>
                <input
                  type="text"
                  required
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Date & Time Observed
            </label>
            <input
              type="datetime-local"
              value={recordedAt}
              onChange={(e) => setRecordedAt(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Context Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. After morning run, fasting, or post-meditation"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
