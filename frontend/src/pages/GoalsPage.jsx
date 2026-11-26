import React, { useState, useEffect } from 'react';
import {
  Target, PlusCircle, CheckCircle2, Clock, Trash2, Edit2,
  TrendingUp, Award, AlertCircle, Loader2, X
} from 'lucide-react';
import { goalsAPI } from '../services/api';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('sleep');
  const [targetValue, setTargetValue] = useState('');
  const [currentProgress, setCurrentProgress] = useState('0');
  const [unit, setUnit] = useState('hours');
  const [targetDate, setTargetDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchGoals = async () => {
    try {
      const res = await goalsAPI.getAll();
      setGoals(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const openCreateModal = () => {
    setEditingGoal(null);
    setTitle('');
    setDescription('');
    setCategory('sleep');
    setTargetValue('');
    setCurrentProgress('0');
    setUnit('hours');
    setTargetDate('');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (g) => {
    setEditingGoal(g);
    setTitle(g.title);
    setDescription(g.description || '');
    setCategory(g.category);
    setTargetValue(g.target_value.toString());
    setCurrentProgress(g.current_progress.toString());
    setUnit(g.unit);
    setTargetDate(g.target_date ? g.target_date.slice(0, 10) : '');
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editingGoal) {
        await goalsAPI.update(editingGoal.id, {
          title,
          description,
          category,
          target_value: parseFloat(targetValue),
          current_progress: parseFloat(currentProgress),
          unit,
          target_date: targetDate ? new Date(targetDate).toISOString() : null,
        });
      } else {
        await goalsAPI.create({
          title,
          description,
          category,
          target_value: parseFloat(targetValue),
          current_progress: parseFloat(currentProgress),
          unit,
          target_date: targetDate ? new Date(targetDate).toISOString() : null,
        });
      }
      setModalOpen(false);
      fetchGoals();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save health goal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this wellness goal?')) return;
    try {
      await goalsAPI.delete(id);
      fetchGoals();
    } catch (e) {
      alert('Failed to delete goal.');
    }
  };

  const handleUpdateProgress = async (g, newProg) => {
    try {
      await goalsAPI.update(g.id, { current_progress: newProg });
      fetchGoals();
    } catch (e) {
      alert('Failed to update progress.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Wellness Goals & Habit Milestones
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Set quantitative health targets for sleep, blood pressure, daily movement, and body composition.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Goal Target</span>
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          <span>Loading goals...</span>
        </div>
      ) : goals.length === 0 ? (
        <div className="p-16 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
          <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Goals Created Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Setting incremental targets (e.g. 8 hours of sleep or 8,000 steps) improves behavioral consistency.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs"
          >
            Create Your First Target
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map((g) => (
            <div
              key={g.id}
              className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold uppercase tracking-wider">
                    {g.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(g)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{g.title}</h3>
                {g.description && (
                  <p className="text-xs text-slate-500 mt-1">{g.description}</p>
                )}

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      Progress: {g.current_progress} / {g.target_value} {g.unit}
                    </span>
                    <span className="font-bold text-teal-700">{g.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        g.status === 'completed' || g.progress_percentage >= 100
                          ? 'bg-emerald-500'
                          : 'bg-teal-600'
                      }`}
                      style={{ width: `${g.progress_percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Progress quick-update controls */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  {g.target_date
                    ? `Due: ${new Date(g.target_date).toLocaleDateString()}`
                    : 'Ongoing Target'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateProgress(g, Math.max(0, g.current_progress - 1))}
                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs"
                    title="Decrease"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleUpdateProgress(g, g.current_progress + 1)}
                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs"
                    title="Increase"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Goal Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-base">
                {editingGoal ? 'Edit Goal Target' : 'Create Wellness Goal'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Consistent 8-Hour Sleep Target"
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white"
                  >
                    <option value="sleep">Sleep</option>
                    <option value="activity">Physical Activity</option>
                    <option value="vitals">Vitals (BP/HR)</option>
                    <option value="weight">Weight Wellness</option>
                    <option value="habit">General Habit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="hours, steps, kg"
                    className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Value</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="e.g. 8"
                    className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Progress</label>
                  <input
                    type="number"
                    step="any"
                    value={currentProgress}
                    onChange={(e) => setCurrentProgress(e.target.value)}
                    placeholder="e.g. 6.5"
                    className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date (Optional)</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Goal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
