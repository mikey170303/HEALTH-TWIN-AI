import React, { useState, useEffect } from 'react';
import {
  History, Calendar, Filter, Download, HeartPulse, Moon,
  Scale, Activity, Droplets, Footprints, Loader2
} from 'lucide-react';
import { healthRecordsAPI } from '../services/api';

export default function HealthHistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = { limit: 200 };
      if (filterType) params.record_type = filterType;
      if (startDate) params.start_date = new Date(startDate).toISOString();
      if (endDate) params.end_date = new Date(endDate).toISOString();
      const res = await healthRecordsAPI.getAll(params);
      setRecords(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterType, startDate, endDate]);

  const getIconForType = (type) => {
    switch (type) {
      case 'blood_pressure': return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case 'heart_rate': return <Activity className="w-4 h-4 text-rose-500" />;
      case 'sleep_duration': return <Moon className="w-4 h-4 text-indigo-500" />;
      case 'weight': return <Scale className="w-4 h-4 text-teal-600" />;
      case 'step_count': return <Footprints className="w-4 h-4 text-emerald-600" />;
      case 'blood_glucose': return <Droplets className="w-4 h-4 text-amber-500" />;
      default: return <History className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Comprehensive Health History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-grade longitudinal observation timeline of all recorded measurements.
          </p>
        </div>

        <a
          href={healthRecordsAPI.exportCSVUrl()}
          download
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Clinical CSV</span>
        </a>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 bg-slate-50"
          >
            <option value="">All Types</option>
            <option value="blood_pressure">Blood Pressure</option>
            <option value="heart_rate">Heart Rate</option>
            <option value="weight">Weight</option>
            <option value="sleep_duration">Sleep Duration</option>
            <option value="step_count">Step Count</option>
            <option value="blood_glucose">Blood Glucose</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1 bg-slate-50"
          />
        </div>

        {(filterType || startDate || endDate) && (
          <button
            onClick={() => { setFilterType(''); setStartDate(''); setEndDate(''); }}
            className="text-teal-600 font-semibold hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Timeline View */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          <span>Loading historical audit log...</span>
        </div>
      ) : records.length === 0 ? (
        <div className="p-16 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
          No historical health records found matching your criteria.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="relative border-l border-slate-200 ml-4 space-y-6">
            {records.map((r) => (
              <div key={r.id} className="relative pl-6">
                <div className="absolute -left-3 top-1 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                  {getIconForType(r.record_type)}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 capitalize">
                        {r.record_type.replace(/_/g, ' ')}:
                      </span>
                      <span className="text-sm font-semibold text-teal-700">
                        {r.value_secondary
                          ? `${r.value_primary}/${r.value_secondary} ${r.unit}`
                          : `${r.value_primary} ${r.unit}`}
                      </span>
                    </div>
                    {r.notes && (
                      <p className="text-xs text-slate-500 mt-0.5">Note: {r.notes}</p>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-slate-400 shrink-0">
                    <p>{new Date(r.recorded_at).toLocaleDateString()}</p>
                    <p>{new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
