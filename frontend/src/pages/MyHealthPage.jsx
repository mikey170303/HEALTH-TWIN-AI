import React, { useState, useEffect } from 'react';
import {
  HeartPulse, PlusCircle, Filter, Download, Upload, Trash2, Edit2,
  Calendar, AlertCircle, CheckCircle2, Loader2, ArrowUpDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { healthRecordsAPI } from '../services/api';
import AddRecordModal from '../components/AddRecordModal';

export default function MyHealthPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const limit = 15;

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {
        skip: page * limit,
        limit: limit,
      };
      if (filterType) params.record_type = filterType;
      const res = await healthRecordsAPI.getAll(params);
      setRecords(res.data);
    } catch (err) {
      setError('Failed to load health records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, filterType]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this observation?')) return;
    try {
      await healthRecordsAPI.delete(id);
      fetchRecords();
    } catch (err) {
      alert('Failed to delete record.');
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportMessage(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await healthRecordsAPI.importCSV(formData);
      setImportMessage({
        type: 'success',
        text: `Imported ${res.data.imported_count} records. (${res.data.failed_count} skipped/invalid)`,
      });
      fetchRecords();
    } catch (err) {
      setImportMessage({
        type: 'error',
        text: err.response?.data?.detail || 'CSV upload failed. Verify file headers.',
      });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Health Records
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your physiological observations, import sensor exports, and inspect history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* CSV Import */}
          <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer shadow-xs transition-colors">
            {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <span>Import CSV</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCSVUpload}
              disabled={importing}
            />
          </label>

          {/* CSV Export */}
          <a
            href={healthRecordsAPI.exportCSVUrl()}
            target="_blank"
            rel="noreferrer"
            download
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>

          {/* Add Record Button */}
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Observation</span>
          </button>
        </div>
      </div>

      {/* Import Feedback */}
      {importMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
            importMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {importMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{importMessage.text}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Filter By Type:</span>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(0);
            }}
            className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="">All Metric Types</option>
            <option value="blood_pressure">Blood Pressure</option>
            <option value="heart_rate">Heart Rate</option>
            <option value="weight">Weight</option>
            <option value="sleep_duration">Sleep Duration</option>
            <option value="step_count">Step Count</option>
            <option value="blood_glucose">Blood Glucose</option>
            <option value="height">Height</option>
          </select>
        </div>

        <span className="text-xs text-slate-400">
          Showing {records.length} records on page {page + 1}
        </span>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            <span>Loading records from database...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Health Records Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              {filterType
                ? `No measurements found for '${filterType}'. Try clearing your filter.`
                : 'Start tracking by logging your blood pressure, sleep, or resting heart rate.'}
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              Add First Observation
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Metric Type</th>
                  <th className="py-3 px-4">Measurement Value</th>
                  <th className="py-3 px-4">Recorded Date</th>
                  <th className="py-3 px-4">Context Notes</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold capitalize text-slate-900">
                      {r.record_type.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {r.value_secondary
                        ? `${r.value_primary}/${r.value_secondary} ${r.unit}`
                        : `${r.value_primary} ${r.unit}`}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(r.recorded_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {r.notes || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium uppercase">
                        {r.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Delete observation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
          <span>Page {page + 1}</span>
          <button
            disabled={records.length < limit}
            onClick={() => setPage(page + 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AddRecordModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onRecordAdded={fetchRecords}
      />
    </div>
  );
}
