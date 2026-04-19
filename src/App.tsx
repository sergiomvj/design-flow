/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { StatusProgress } from './components/StatusProgress';
import { DesignRequestForm } from './components/DesignRequestForm';
import { RightSidebar } from './components/RightSidebar';
import { CommentSection } from './components/CommentSection';
import { Metric, UserRole } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Compass, User, Bell, Send, Menu, Search, Filter } from 'lucide-react';

type Tab = 'home' | 'explore' | 'profile';

const metrics: Metric[] = [
  { label: 'ACTIVE QUEUE', value: 12, highlight: true },
  { label: 'AWAITING APPROVAL', value: 4 },
  { label: 'DELIVERED TODAY', value: 8 },
  { label: 'REVISIONS', value: 3 },
  { label: 'TEAM ACTIVE', value: 6 },
  { label: 'AVG TURNAROUND', value: '2.4D' },
];

export default function App() {
  const [activeTab, setActiveTab] = React.useState<Tab>('home');
  const [user] = React.useState({
    id: 'admin-1',
    name: 'Elena Rodriguez',
    role: 'designer' as UserRole
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <motion.div 
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-10"
          >
            {/* Dashboard Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-px w-8 bg-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">System Command</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-zinc-950">New Requisition</h2>
                <p className="text-zinc-500 max-w-xl text-xs lg:text-sm font-bold leading-relaxed uppercase tracking-tight opacity-80">
                  Initiate a formal design entry. Ensure all technical parameters are defined for optimal architectural integrity and production velocity.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button className="px-8 py-3 bg-zinc-100 text-zinc-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-zinc-200 hover:text-zinc-950 transition-all border border-zinc-200">
                  View Archive
                </button>
                <button className="px-8 py-3 signature-gradient text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-[0_10px_30px_rgba(139,0,0,0.2)] hover:scale-105 transition-all">
                  Save Ledger
                </button>
              </div>
            </header>

            <StatusProgress currentStatus="REVIEW" />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 items-start">
              <div className="xl:col-span-8 space-y-10">
                <StatCards metrics={metrics} />
                <DesignRequestForm />
                <CommentSection requestId="SR-2941-X" currentUser={user} />
              </div>

              <div className="xl:col-span-4 sticky top-24">
                <RightSidebar />
              </div>
            </div>
          </motion.div>
        );
      case 'explore':
        return (
          <motion.div 
            key="explore"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-black tracking-tighter text-zinc-950">Explore Nodes</h2>
              <div className="flex gap-4">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input className="bg-zinc-100 border border-zinc-200 pl-10 pr-4 py-3 rounded-2xl text-xs font-bold text-zinc-900 outline-none w-64" placeholder="QUERY NODES..." />
                </div>
                <button className="p-3 bg-zinc-100 rounded-2xl border border-zinc-200 text-zinc-400 hover:text-zinc-900 transition-colors">
                  <Filter size={20} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bento-card group h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Node #{1200 + i}</span>
                    <span className="bg-zinc-100 text-[9px] px-2 py-1 rounded-md font-bold uppercase tracking-widest text-zinc-500">Active</span>
                  </div>
                  <h4 className="text-lg font-black text-zinc-950 mt-1 group-hover:text-primary transition-colors uppercase tracking-tight">Project Node Genesis</h4>
                  <p className="text-xs text-zinc-500 mt-2 font-bold uppercase tracking-tight opacity-70">Design architecture analysis for global reach.</p>
                  <div className="mt-auto pt-6 flex justify-between items-center border-t border-zinc-100">
                    <div className="flex -space-x-2">
                       {[1,2,3].map(m => (
                         <div key={m} className="w-6 h-6 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-[8px] font-bold text-zinc-500 overflow-hidden">
                           <img src={`https://picsum.photos/seed/${m + i}/50/50`} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                         </div>
                       ))}
                    </div>
                    <button className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-primary">Inspect</button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 'profile':
        return (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto space-y-12 py-10"
          >
            <div className="flex items-center gap-8">
              <div className="w-32 h-32 rounded-[40px] signature-gradient p-1 shadow-2xl">
                <div className="w-full h-full rounded-[38px] bg-white flex items-center justify-center text-5xl font-black text-zinc-950">ER</div>
              </div>
              <div>
                <h2 className="text-5xl font-black tracking-tighter text-zinc-950 uppercase">{user.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">{user.role}</span>
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Employee #4029</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-zinc-100">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Security Clearance</span>
                <p className="text-xl font-black text-zinc-950 uppercase tracking-tight">Level 4 - Architectural Authority</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Current Status</span>
                <p className="text-xl font-black text-emerald-600 uppercase tracking-tight">System Online</p>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-surface font-sans text-zinc-950 flex transition-colors duration-500">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 p-6 lg:p-10 pt-24 pb-32 lg:pb-10 min-w-0">
          <div className="max-w-[1400px] mx-auto overflow-hidden">
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-xl px-2 py-2 rounded-[32px] flex items-center gap-2 shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-black/5">
        <TabButton icon={<Home size={20} />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <TabButton icon={<Compass size={20} />} label="Explore" active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} />
        <TabButton icon={<User size={20} />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </nav>
    </div>
  );
}

function TabButton({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`relative px-6 py-4 rounded-[24px] flex items-center gap-3 transition-all duration-300 group ${
        active ? 'bg-zinc-100 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-800'
      }`}
    >
      <div className={`${active ? 'text-primary' : 'text-zinc-400 group-hover:text-zinc-800'} transition-colors duration-300`}>
        {icon}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest overflow-hidden transition-all duration-300 ${active ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="tab-bg"
          className="absolute inset-0 bg-primary/5 rounded-[24px] -z-10"
        />
      )}
    </button>
  );
}


