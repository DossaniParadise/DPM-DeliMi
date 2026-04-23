import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { 
  Monitor, 
  LayoutDashboard
} from 'lucide-react';
import { motion } from 'motion/react';
import ScreenEditor from './Admin/ScreenEditor';
import QuickEdit from './Admin/QuickEdit';
import DashboardHome from './Admin/DashboardHome';

export default function Admin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col md:flex-row">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-64 bg-neutral-900 border-r border-white/5 flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <Monitor className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">DeliSign</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          <NavLink to="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-4 text-center">
            <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-mono">Development Mode</p>
            <p className="text-[9px] text-neutral-700 italic">No Auth Required</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="editor/:storeId/:screenId" element={<ScreenEditor />} />
          <Route path="quick-edit/:storeId/:screenId" element={<QuickEdit />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-white/5 p-4 flex justify-around">
         <Link to="/admin" className="text-neutral-400 hover:text-orange-500"><LayoutDashboard /></Link>
      </nav>
    </div>
  );
}

function NavLink({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  const active = window.location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active ? 'bg-orange-600/10 text-orange-500 font-bold' : 'text-neutral-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
      {active && <motion.div layoutId="nav-dot" className="w-1.5 h-1.5 bg-orange-600 rounded-full ml-auto" />}
    </Link>
  );
}

