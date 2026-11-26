import React, { useState, useEffect } from 'react';
import {
  Sparkles, Cpu, AlertTriangle, CheckCircle2, TrendingUp,
  Info, Loader2, ShieldCheck, ArrowRight, RefreshCw, BarChart2
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area
} from 'recharts';
import { predictionsAPI } from '../services/api';

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningModel, setRunningModel] = useState(false);
  const [activeTab, setActiveTab] = useState('cvd_risk_assessment');
  const [weightHorizon, setWeightHorizon] = useState(30);
  const [latestResult, setLatestResult] = useState(null);
  const [error, setError] = useState('');

  const fetchPredictions = async () => {
    try {
      const res = await predictionsAPI.getAll();
      setPredictions(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const handleRunPrediction = async () => {
    setRunningModel(true);
    setError('');
    try {
      const res = await predictionsAPI.generate({
        prediction_type: activeTab,
        horizon_days: activeTab === 'weight_forecast' ? weightHorizon : 30,
      });
      setLatestResult(res.data);
      fetchPredictions();
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Inference engine was unable to execute with current data.'
      );
    } finally {
      setRunningModel(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
          <Cpu className="w-3.5 h-3.5 text-teal-600" />
          <span>Scikit-Learn ML Inference Service v1.2</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Machine-Learning Health Predictions & Forecasts
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Executable statistical models trained on clinical cohorts to provide prospective forecasts and screening alerts.
        </p>
      </div>

      {/* Model Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => { setActiveTab('cvd_risk_assessment'); setError(''); }}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'cvd_risk_assessment'
              ? 'bg-teal-50/60 border-teal-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-sm text-slate-900">Cardiovascular Screening</span>
            <span className="text-[10px] font-semibold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
              Random Forest
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Estimates 10-year statistical risk based on age, BP, BMI, and glucose distributions.
          </p>
        </button>

        <button
          onClick={() => { setActiveTab('weight_forecast'); setError(''); }}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'weight_forecast'
              ? 'bg-teal-50/60 border-teal-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-sm text-slate-900">Weight Trajectory</span>
            <span className="text-[10px] font-semibold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
              OLS + 95% CI
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Longitudinal trend line forecast with standard error confidence boundaries.
          </p>
        </button>

        <button
          onClick={() => { setActiveTab('anomaly_detection'); setError(''); }}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'anomaly_detection'
              ? 'bg-teal-50/60 border-teal-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-sm text-slate-900">Biometric Outlier Detection</span>
            <span className="text-[10px] font-semibold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
              Isolation Forest
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Identifies sudden physiological deviations in blood pressure and heart rate.
          </p>
        </button>
      </div>

      {/* Model Execution Sandbox */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 capitalize">
              Execute {activeTab.replace(/_/g, ' ')}
            </h3>
            <p className="text-xs text-slate-400">
              Evaluates against your latest stored biometric records in MySQL.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'weight_forecast' && (
              <select
                value={weightHorizon}
                onChange={(e) => setWeightHorizon(parseInt(e.target.value))}
                className="text-xs rounded-lg border border-slate-200 px-3 py-2 bg-slate-50"
              >
                <option value={30}>30 Days Horizon</option>
                <option value={60}>60 Days Horizon</option>
                <option value={90}>90 Days Horizon</option>
              </select>
            )}

            <button
              onClick={handleRunPrediction}
              disabled={runningModel}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50"
            >
              {runningModel ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculating Inference...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Model Inference</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Model Notice:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Live Result Display */}
        {latestResult && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                Inference Result Generated
              </span>
              <span className="text-[11px] text-slate-400">
                Model {latestResult.model_version} • Confidence: {Math.round((latestResult.confidence_score || 0.85) * 100)}%
              </span>
            </div>

            {/* CVD Risk Assessment Result */}
            {latestResult.prediction_type === 'cvd_risk_assessment' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl text-center min-w-32 ${
                    latestResult.risk_level === 'Low'
                      ? 'bg-emerald-100 text-emerald-800'
                      : latestResult.risk_level === 'Moderate'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    <span className="text-[10px] font-semibold uppercase tracking-wider block">Calculated Risk</span>
                    <span className="text-2xl font-black">{latestResult.risk_level}</span>
                    <span className="text-xs font-bold block mt-0.5">{latestResult.predicted_value}% Prob.</span>
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    <p className="font-semibold text-slate-800 mb-1">Risk Factor Synthesis:</p>
                    <p>Based on your latest recorded biometrics (systolic BP, resting pulse, BMI, and age).</p>
                  </div>
                </div>
              </div>
            )}

            {/* Weight Forecast Chart */}
            {latestResult.prediction_type === 'weight_forecast' && latestResult.forecast_points && (
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-slate-500">Projected Weight ({latestResult.horizon_days}d):</span>
                  <span className="text-xl font-bold text-slate-900">{latestResult.predicted_value} kg</span>
                  <span className="text-xs text-teal-600 font-medium">({latestResult.risk_level} trajectory)</span>
                </div>

                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={latestResult.forecast_points}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                      <Line type="monotone" dataKey="predicted_weight" stroke="#0d9488" strokeWidth={2.5} name="Forecast (kg)" dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="upper_bound" stroke="#cbd5e1" strokeDasharray="3 3" name="Upper 95% Bound" />
                      <Line type="monotone" dataKey="lower_bound" stroke="#cbd5e1" strokeDasharray="3 3" name="Lower 95% Bound" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Anomaly Detection Result */}
            {latestResult.prediction_type === 'anomaly_detection' && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-800">
                  {latestResult.current_value === 0
                    ? 'No acute statistical anomalies detected in recent telemetry.'
                    : `Identified ${latestResult.current_value} physiological outlier(s) in recent logs.`}
                </p>
                {latestResult.factors?.anomalies?.map((a, i) => (
                  <div key={i} className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    <span className="font-bold">{a.metric}: {a.value}</span> — {a.message}
                  </div>
                ))}
              </div>
            )}

            {/* Regulatory & Clinical Disclaimer */}
            <div className="p-3 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-700 block mb-0.5">Scientific Limitations:</span>
              {latestResult.limitations}
            </div>
          </div>
        )}
      </div>

      {/* Past Predictions History */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Historical Model Executions</h3>
        {predictions.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No past model inferences stored yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predictions.map((p) => (
              <div key={p.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 capitalize">
                    {p.prediction_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-slate-600">
                  <span>Output: </span>
                  <span className="font-semibold text-slate-900">{p.predicted_value} ({p.risk_level})</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  Model {p.model_version} • Horizon: {p.horizon_days}d
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
