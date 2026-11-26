import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-teal-900 to-slate-900 bg-clip-text text-transparent">
                HealthTwin<span className="text-teal-600 font-extrabold ml-0.5">AI</span>
              </span>
              <span className="text-[10px] tracking-wider font-semibold text-teal-600 uppercase -mt-1">
                Precision Wellness
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-teal-600 transition-colors">Home</Link>
            <a href="#features" className="hover:text-teal-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-teal-600 transition-colors">How It Works</a>
            <a href="#privacy" className="hover:text-teal-600 transition-colors">Privacy</a>
          </nav>

          {/* Auth CTA */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/app"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm transition-colors shadow-sm"
                >
                  <User className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="text-sm font-medium text-slate-500 hover:text-slate-800 px-3 py-2"
                >
                  Log out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-teal-700 px-3 py-2 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm transition-all shadow-sm shadow-teal-500/20 hover:shadow-md"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
