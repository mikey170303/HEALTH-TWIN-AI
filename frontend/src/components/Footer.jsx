import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                HealthTwin<span className="text-teal-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your personal wellness intelligence platform. Monitoring physiological trends, evidence-informed predictions, and AI insights.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/app" className="hover:text-white transition-colors">Overview</Link></li>
              <li><Link to="/app/my-health" className="hover:text-white transition-colors">My Health Records</Link></li>
              <li><Link to="/app/analytics" className="hover:text-white transition-colors">Trend Analytics</Link></li>
              <li><Link to="/app/predictions" className="hover:text-white transition-colors">ML Predictions</Link></li>
              <li><Link to="/app/assistant" className="hover:text-white transition-colors">AI Health Assistant</Link></li>
            </ul>
          </div>

          {/* Privacy & Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-4">
              Security & Privacy
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Architecture</a></li>
              <li><span className="text-slate-400 cursor-default">Per-User Data Isolation</span></li>
              <li><span className="text-slate-400 cursor-default">Account Data Deletion</span></li>
              <li><span className="text-slate-400 cursor-default">Terms of Use</span></li>
            </ul>
          </div>

          {/* Medical Disclaimer */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-4">
              Important Medical Notice
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              HealthTwin AI is designed for informational, educational, and personal wellness monitoring purposes only. It is not an FDA-cleared diagnostic device, does not provide medical treatment, and should never replace consultation with a qualified medical professional.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} HealthTwin AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Built with precision & privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
