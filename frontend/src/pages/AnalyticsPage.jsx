import React, { useState, useEffect } from 'react';
import {
  LineChart as LineChartIcon, Calendar, ArrowUpRight, ArrowDownRight,
  Activity, HeartPulse, Moon, Scale, Footprints, AlertCircle, Loader2
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { dashboardAPI } from '../services/api';

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [trendsData, setTrendsData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [trendRes, sumRes] = await Promise.all([
        dashboardAPI.getTrends({ days }),
        dashboardAPI.getSummary(),
      ]);
      setTrendsData(trendRes.data);
      setSummaryData(sumRes.data);
    } catch (err) {
      setError('Unable to fetch analytics telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days]);

  const series = trendsData?.series || {};

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Health Analytics & Physiological Trends
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical longitudinal visualizations across your recorded vital signs and lifestyle metrics.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-xs text-xs">
          {[
            { label: '7 Days', val: 7 },
            { label: '30 Days', val: 30 },
            { label: '90 Days', val: 90 },
            { label: '1 Year', val: 365 },
          ].map((btn) => (
            <button
              key={btn.val}
              onClick={() => setDays(btn.val)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                days === btn.val
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          <span>Crunching physiological statistics...</span>
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          {summaryData && Object.keys(summaryData).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(summaryData).map(([metric, stats]) => (
                <div key={metric} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider capitalize">
                    {metric.replace(/_/g, ' ')}
                  </span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-slate-900">
                      {stats.latest} <span className="text-xs font-normal text-slate-500">{stats.unit}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Avg: {stats.average}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Min: {stats.min}</span>
                    <span>Max: {stats.max}</span>
                    <span>{stats.count} logs</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Blood Pressure Chart */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Blood Pressure Trajectory</h3>
                <p className="text-xs text-slate-400">Systolic (top) and Diastolic (bottom) readings in mmHg</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-50 text-rose-700">
                Arterial Hemodynamics
              </span>
            </div>

            {series.blood_pressure && series.blood_pressure.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series.blood_pressure}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#e11d48" strokeWidth={2.5} name="Systolic (mmHg)" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="value_secondary" stroke="#0ea5e9" strokeWidth={2.5} name="Diastolic (mmHg)" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs">
                <HeartPulse className="w-8 h-8 text-slate-300 mb-2" />
                <span>No blood pressure entries found in this {days}-day period.</span>
              </div>
            )}
          </div>

          {/* Sleep & Heart Rate 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sleep Duration Bar Chart */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Sleep Duration Consistency</h3>
                  <p className="text-xs text-slate-400">Nightly restorative sleep in hours</p>
                </div>
                <Moon className="w-4 h-4 text-indigo-500" />
              </div>

              {series.sleep_duration && series.sleep_duration.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={series.sleep_duration}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 14]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Hours of Sleep" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <Moon className="w-8 h-8 text-slate-300 mb-2" />
                  <span>No sleep logs recorded in this timeframe.</span>
                </div>
              )}
            </div>

            {/* Heart Rate Chart */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Resting Pulse Timeline</h3>
                  <p className="text-xs text-slate-400">Resting heart rate in beats per minute (bpm)</p>
                </div>
                <Activity className="w-4 h-4 text-teal-600" />
              </div>

              {series.heart_rate && series.heart_rate.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series.heart_rate}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2.5} name="Heart Rate (bpm)" dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <Activity className="w-8 h-8 text-slate-300 mb-2" />
                  <span>No pulse readings recorded in this timeframe.</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
