import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, HeartPulse, Moon, Footprints, Droplets, Scale, Sparkles,
  ArrowRight, PlusCircle, LineChart, Bot, Lightbulb, Target, Clock,
  AlertCircle, ShieldCheck, ChevronRight, CheckCircle2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await dashboardAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      setError('Unable to load dashboard biometrics. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const handleRecordAdded = () => {
      fetchDashboard();
    };
    window.addEventListener('healthtwin-record-added', handleRecordAdded);
    return () => window.removeEventListener('healthtwin-record-added', handleRecordAdded);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 rounded-2xl w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  const latest = data?.latest_measurements || {};
  const bmi = data?.bmi_summary;
  const hasAnyData = data?.total_observations_count > 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {data?.user_name?.split(' ')[0] || 'Friend'} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Here is your live biometric twin snapshot and physiological trend overview.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/app/my-health"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Record</span>
          </Link>
          <Link
            to="/app/assistant"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors"
          >
            <Bot className="w-3.5 h-3.5 text-teal-600" />
            <span>Ask AI</span>
          </Link>
        </div>
      </div>

      {/* Empty State Banner if brand new account with 0 records */}
      {!hasAnyData && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Your Health Twin is Awaiting Initial Observations</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Log your first blood pressure, sleep duration, or weight measurement to initialize trend charts and predictive ML models.
              </p>
            </div>
          </div>
          <Link
            to="/app/my-health"
            className="shrink-0 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            Enter First Measurement
          </Link>
        </div>
      )}

      {/* Latest Health Measurements Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Latest Biometrics
          </h2>
          <Link to="/app/my-health" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Blood Pressure */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Blood Pressure</span>
              <HeartPulse className="w-4 h-4 text-rose-500" />
            </div>
            {latest.blood_pressure ? (
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {latest.blood_pressure.value_primary}/{latest.blood_pressure.value_secondary || '--'}
                  <span className="text-xs font-normal text-slate-500 ml-1">mmHg</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Recorded {new Date(latest.blood_pressure.recorded_at).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="py-2 text-xs text-slate-400 italic">No measurement logged</div>
            )}
          </div>

          {/* Heart Rate */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Heart Rate</span>
              <Activity className="w-4 h-4 text-rose-500" />
            </div>
            {latest.heart_rate ? (
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {latest.heart_rate.value_primary}
                  <span className="text-xs font-normal text-slate-500 ml-1">bpm</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Recorded {new Date(latest.heart_rate.recorded_at).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="py-2 text-xs text-slate-400 italic">No measurement logged</div>
            )}
          </div>

          {/* Sleep Duration */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Sleep Duration</span>
              <Moon className="w-4 h-4 text-indigo-500" />
            </div>
            {latest.sleep_duration ? (
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {latest.sleep_duration.value_primary}
                  <span className="text-xs font-normal text-slate-500 ml-1">hrs</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Recorded {new Date(latest.sleep_duration.recorded_at).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="py-2 text-xs text-slate-400 italic">No measurement logged</div>
            )}
          </div>

          {/* BMI Card */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">BMI Ratio</span>
              <Scale className="w-4 h-4 text-teal-600" />
            </div>
            {bmi ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-slate-900">{bmi.value}</p>
                  <span className="text-xs font-semibold text-emerald-600">{bmi.category}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Based on {bmi.weight_kg}kg / {bmi.height_cm}cm
                </p>
              </div>
            ) : (
              <div className="py-2 text-xs text-slate-400 italic">Add height & weight</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Sparkline Trends & AI/ML Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Trend Sparklines */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Biometric Trajectory</h3>
                <p className="text-xs text-slate-400">Observed physiological trends</p>
              </div>
              <Link to="/app/analytics" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                Interactive Analytics →
              </Link>
            </div>

            {data?.sparklines?.blood_pressure && data.sparklines.blood_pressure.length > 0 ? (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.sparklines.blood_pressure}>
                    <defs>
                      <linearGradient id="bpGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#bpGrad)" name="Systolic BP (mmHg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs">
                <LineChart className="w-8 h-8 text-slate-300 mb-2" />
                <span>Log 2+ observations to visualize historical trends</span>
              </div>
            )}
          </div>

          {/* Goal Progress Section */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Active Wellness Goals</h3>
              </div>
              <Link to="/app/goals" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                Manage Goals →
              </Link>
            </div>

            {data?.active_goals && data.active_goals.length > 0 ? (
              <div className="space-y-4">
                {data.active_goals.map((g) => (
                  <div key={g.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{g.title}</span>
                      <span className="text-slate-500">
                        {g.current_progress} / {g.target_value} {g.unit} ({g.progress_percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${g.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                <span>No active wellness goals configured yet.</span>
                <Link to="/app/goals" className="block text-teal-600 font-semibold mt-1">
                  Create your first milestone →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: ML Forecast & Evidence-Informed Recommendations */}
        <div className="space-y-6">
          {/* ML Model Forecast Card */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">ML Health Model</h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Inference Engine
              </span>
            </div>

            {data?.active_predictions && data.active_predictions.length > 0 ? (
              <div className="space-y-3">
                {data.active_predictions.slice(0, 2).map((p, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 capitalize">
                        {p.prediction_type.replace(/_/g, ' ')}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold text-[10px]">
                        {p.risk_level || 'Evaluated'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                      Confidence: {Math.round((p.confidence_score || 0.85) * 100)}% • Model {p.model_version}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">
                <p>Run your first ML forecast or screening</p>
                <Link
                  to="/app/predictions"
                  className="mt-2 inline-flex items-center gap-1 text-teal-600 font-semibold text-xs"
                >
                  <span>Open Predictions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Evidence-informed Recommendations Card */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Personal Insights</h3>
              </div>
              <Link to="/app/recommendations" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                All →
              </Link>
            </div>

            {data?.recent_recommendations && data.recent_recommendations.length > 0 ? (
              <div className="space-y-3">
                {data.recent_recommendations.slice(0, 3).map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-900 block mb-0.5">{r.title}</span>
                    <p className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed">
                      {r.explanation}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">
                Awaiting health records to synthesize personalized lifestyle suggestions.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
