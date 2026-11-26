import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ArrowRight, ShieldCheck, HeartPulse, Sparkles, LineChart,
  Bot, Lock, CheckCircle2, TrendingUp, Layers, Cpu, Award, Target
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Next-Generation Personalized Healthcare</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Your Health. Your Data.{' '}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Your AI Twin.
              </span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              HealthTwin AI integrates your biometric measurements, analyzes physiological trends, generates empirical ML forecasts, and delivers tailored AI insights—securely isolated to your individual account.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-base shadow-lg shadow-teal-600/25 transition-all hover:scale-[1.02]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-base border border-slate-200 transition-colors"
              >
                <span>Explore Features</span>
              </a>
            </div>
          </div>

          {/* Interactive Healthcare Dashboard Preview Card */}
          <div className="max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 sm:p-6 lg:p-8 relative">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  HT
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Personal Health Twin Dashboard</h3>
                  <p className="text-xs text-slate-400">Live biometrics • Isolated encrypted telemetry</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Twin Synced
                </span>
              </div>
            </div>

            {/* Metric Preview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-400 font-medium">Blood Pressure</span>
                <p className="text-xl font-bold text-slate-900 mt-1">118/76 <span className="text-xs font-normal text-slate-500">mmHg</span></p>
                <span className="inline-block mt-2 text-[11px] font-medium text-emerald-600">Optimal Range</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-400 font-medium">Resting Pulse</span>
                <p className="text-xl font-bold text-slate-900 mt-1">68 <span className="text-xs font-normal text-slate-500">bpm</span></p>
                <span className="inline-block mt-2 text-[11px] font-medium text-emerald-600">Stable Baseline</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-400 font-medium">Sleep Duration</span>
                <p className="text-xl font-bold text-slate-900 mt-1">7.8 <span className="text-xs font-normal text-slate-500">hrs</span></p>
                <span className="inline-block mt-2 text-[11px] font-medium text-teal-600">+45 min weekly avg</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-400 font-medium">ML Risk Screening</span>
                <p className="text-xl font-bold text-slate-900 mt-1">Low <span className="text-xs font-normal text-slate-500">(12%)</span></p>
                <span className="inline-block mt-2 text-[11px] font-medium text-teal-600">RF Classifier v1.2</span>
              </div>
            </div>

            {/* AI Assistant Callout Preview */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 flex items-start gap-3">
              <Bot className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 leading-relaxed">
                <span className="font-semibold text-teal-900">HealthTwin AI Assistant:</span> "Your resting blood pressure has decreased by 4% over the past 3 weeks correlating with regular 7.5+ hour sleep cycles. Continue maintaining sodium intake below 2,300 mg/day."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Capabilities</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Designed for Complete Wellness Intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Personalized Health Dashboard</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Real-time tracking of weight, blood pressure, resting heart rate, sleep duration, physical activity, and blood glucose.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <LineChart className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Health Trend Analytics</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Interactive charts, multi-parameter historical comparisons, weekly moving averages, and exportable CSV health records.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Real Machine Learning Engine</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Trained Scikit-learn Random Forest cardiovascular risk screening, Isolation Forest anomaly alerts, and regression forecasting.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI Health Assistant</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Conversational health companion grounded strictly in your personal biometric records, providing evidence-informed wellness guidance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Targeted Goals & Progress</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Set incremental milestones for sleep consistency, blood pressure moderation, daily step targets, and weight wellness.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Secure Individual Accounts</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                JWT authentication, Argon2/bcrypt password hashing, strict SQL per-user isolation, and permanent complete account deletion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Methodology</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How HealthTwin AI Works
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up with secure individual credentials and set your unit preferences.' },
              { step: '02', title: 'Enter Health Info', desc: 'Log blood pressure, pulse, sleep, weight, or upload historical CSV records.' },
              { step: '03', title: 'Understand Trends', desc: 'Visualize multi-week biometrics, moving averages, and physiological correlations.' },
              { step: '04', title: 'Receive AI Insights', desc: 'Engage with the AI assistant for evidence-based lifestyle reflection.' },
              { step: '05', title: 'Track Progress', desc: 'Achieve wellness milestones and export data for your family physician.' },
            ].map((s, idx) => (
              <div key={idx} className="relative p-6 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-2xl font-black text-teal-500/30 block mb-2">{s.step}</span>
                <h4 className="text-base font-bold text-slate-800 mb-1.5">{s.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section id="privacy" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-6 shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
            Strict Per-User Privacy & Data Ownership
          </h2>
          <p className="text-base text-slate-600 leading-relaxed mb-8">
            Health information is sensitive personal data. Every database record is cryptographically bound to your unique account identifier. User A cannot access, query, or view User B's metrics. You retain absolute ownership with one-click full data deletion at any time.
          </p>
          <div className="inline-flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Password Hashing</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Scoped SQL Queries</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-600" /> CSV Export & Deletion</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
