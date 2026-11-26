import React, { useState, useEffect } from 'react';
import {
  Lightbulb, CheckCircle2, Bookmark, EyeOff, ShieldCheck,
  Tag, Clock, AlertCircle, Loader2, Sparkles
} from 'lucide-react';
import { recommendationsAPI } from '../services/api';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchRecommendations = async () => {
    try {
      const res = await recommendationsAPI.getAll();
      setRecommendations(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleToggleComplete = async (rec) => {
    try {
      await recommendationsAPI.update(rec.id, { is_completed: !rec.is_completed });
      setRecommendations((prev) =>
        prev.map((r) => (r.id === rec.id ? { ...r, is_completed: !r.is_completed } : r))
      );
    } catch (e) {
      alert('Failed to update recommendation.');
    }
  };

  const handleToggleSave = async (rec) => {
    try {
      await recommendationsAPI.update(rec.id, { is_saved: !rec.is_saved });
      setRecommendations((prev) =>
        prev.map((r) => (r.id === rec.id ? { ...r, is_saved: !r.is_saved } : r))
      );
    } catch (e) {
      alert('Failed to save recommendation.');
    }
  };

  const handleDismiss = async (recId) => {
    try {
      await recommendationsAPI.update(recId, { is_dismissed: true });
      setRecommendations((prev) => prev.filter((r) => r.id !== recId));
    } catch (e) {
      alert('Failed to dismiss recommendation.');
    }
  };

  const filteredRecs = recommendations.filter((r) => {
    if (filter === 'saved') return r.is_saved;
    if (filter === 'completed') return r.is_completed;
    if (filter === 'active') return !r.is_completed;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Personalized Evidence-Informed Recommendations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Targeted lifestyle and physiological insights synthesized dynamically from your recorded metrics.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-xs text-xs">
          {['all', 'active', 'saved', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                filter === f
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          <span>Synthesizing lifestyle recommendations...</span>
        </div>
      ) : filteredRecs.length === 0 ? (
        <div className="p-16 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
          <Lightbulb className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Recommendations in this Filter</h3>
          <p className="text-xs text-slate-400 mt-1">
            Log your blood pressure, sleep, and physical activity in My Health to trigger tailored suggestions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRecs.map((rec) => (
            <div
              key={rec.id}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between shadow-xs ${
                rec.is_completed
                  ? 'bg-slate-50/80 border-slate-200 opacity-75'
                  : 'bg-white border-slate-200 hover:border-teal-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold uppercase tracking-wider">
                    {rec.category.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      onClick={() => handleToggleSave(rec)}
                      title={rec.is_saved ? 'Unsave' : 'Save'}
                      className={`p-1 rounded hover:bg-slate-100 ${rec.is_saved ? 'text-amber-500' : ''}`}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => handleDismiss(rec.id)}
                      title="Dismiss"
                      className="p-1 rounded hover:bg-slate-100 hover:text-rose-500"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className={`text-base font-bold text-slate-900 ${rec.is_completed ? 'line-through text-slate-400' : ''}`}>
                  {rec.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {rec.explanation}
                </p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                  <span className="font-semibold text-slate-800 block text-[11px]">Underlying Physiological Rationale:</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{rec.reason}</p>
                  {rec.supporting_data && (
                    <p className="text-[10px] text-teal-700 font-medium pt-1">
                      Supporting Data: {rec.supporting_data}
                    </p>
                  )}
                </div>

                {rec.action_text && (
                  <div className="text-xs font-semibold text-teal-800 bg-teal-50/60 p-2.5 rounded-lg border border-teal-100/50">
                    Suggested Action: {rec.action_text}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleComplete(rec)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    rec.is_completed
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{rec.is_completed ? 'Completed' : 'Mark as Applied'}</span>
                </button>

                <span className="text-[10px] text-slate-400">
                  {new Date(rec.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
