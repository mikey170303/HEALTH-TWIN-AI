import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity, LayoutDashboard, HeartPulse, LineChart, Bot, Sparkles,
  Lightbulb, Target, History, User, Settings, LogOut, Menu, X, PlusCircle,
  Bell, ChevronDown, CheckCircle2, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AddRecordModal from '../components/AddRecordModal';

const navItems = [
  { name: 'Overview', to: '/app', icon: LayoutDashboard, end: true },
  { name: 'My Health', to: '/app/my-health', icon: HeartPulse },
  { name: 'Analytics', to: '/app/analytics', icon: LineChart },
  { name: 'AI Assistant', to: '/app/assistant', icon: Bot },
  { name: 'Predictions', to: '/app/predictions', icon: Sparkles },
  { name: 'Recommendations', to: '/app/recommendations', icon: Lightbulb },
  { name: 'Goals', to: '/app/goals', icon: Target },
  { name: 'Health History', to: '/app/history', icon: History },
  { name: 'Profile', to: '/app/profile', icon: User },
  { name: 'Settings', to: '/app/settings', icon: Settings },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                HealthTwin<span className="text-teal-600 font-extrabold">AI</span>
              </span>
              <span className="block text-[9px] uppercase tracking-wider font-semibold text-teal-600 -mt-1">
                Personal Twin
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Quick Add Record CTA */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Health Record</span>
          </button>
        </div>

        {/* User Mini Profile in Sidebar */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-600 hover:text-slate-900 p-1.5"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-base font-semibold text-slate-800 hidden sm:block">
              {navItems.find((i) => i.to === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-semibold transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record Metric</span>
            </button>

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {initial}
                </div>
                <span className="text-xs font-semibold hidden md:inline-block text-slate-700">
                  {user?.full_name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-40 text-xs">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-800 truncate">{user?.full_name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <NavLink
                      to="/app/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-600 hover:bg-slate-50"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>My Profile</span>
                    </NavLink>
                    <NavLink
                      to="/app/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-600 hover:bg-slate-50"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Account Settings</span>
                    </NavLink>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => { setProfileDropdownOpen(false); handleLogout(); }}
                      className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Add Record Modal */}
      <AddRecordModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onRecordAdded={() => {
          // Trigger custom event so any page on screen can refresh its data
          window.dispatchEvent(new CustomEvent('healthtwin-record-added'));
        }}
      />
    </div>
  );
}
