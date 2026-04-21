import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Shield, Mail, Calendar, Edit3, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Team } from './Team';

export function Settings() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = user?.role === 'ADMIN';
  const requestedTab = searchParams.get('tab');
  const activeTab = isAdmin && requestedTab === 'users' ? 'users' : 'account';

  const setActiveTab = (tab: 'account' | 'users') => {
    const nextParams = new URLSearchParams(searchParams);

    if (tab === 'account') {
      nextParams.delete('tab');
    } else {
      nextParams.set('tab', tab);
    }

    setSearchParams(nextParams);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div>
        <h2 className="text-3xl font-black tracking-tighter text-zinc-950 uppercase">Account Settings</h2>
        <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-2">Manage your professional identity and preferences</p>
      </div>

      <div className="bg-white border border-zinc-100 rounded-[40px] overflow-hidden shadow-sm">
        <div className="border-b border-zinc-100 px-6 py-5 md:px-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('account')}
              className={`inline-flex items-center gap-3 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'account'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-950'
              }`}
            >
              <User size={14} />
              Account
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('users')}
                className={`inline-flex items-center gap-3 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'users'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-950'
                }`}
              >
                <Users size={14} />
                Users
              </button>
            )}
          </div>
        </div>

        {activeTab === 'account' ? (
          <div className="p-12 space-y-12">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="w-32 h-32 bg-zinc-100 rounded-[40px] border-4 border-zinc-50 flex items-center justify-center text-4xl font-black text-zinc-300 shadow-inner">
                {user?.name.charAt(0)}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-black tracking-tight text-zinc-950">{user?.name}</h3>
                <p className="text-primary font-black uppercase tracking-[0.2em] text-xs mt-1">{user?.role} • Professional Access</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                  <button className="bg-zinc-950 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2">
                    <Edit3 size={14} />
                    Update Avatar
                  </button>
                  <button className="bg-zinc-100 text-zinc-500 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all">
                    Public Profile
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-zinc-50">
              <InfoBlock icon={Mail} label="Email Address" value={user?.email || ''} />
              <InfoBlock icon={Shield} label="Security Role" value={user?.role || ''} />
              <InfoBlock icon={User} label="Display Name" value={user?.name || ''} />
              <InfoBlock icon={Calendar} label="Member Since" value="April 2026" />
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-8">
            <Team embedded />
          </div>
        )}
      </div>

      <div className="bg-zinc-950 rounded-[40px] p-12 text-white overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -mr-48 -mt-48 animate-pulse" />
        <div className="relative z-10 space-y-6">
          <h4 className="text-2xl font-black tracking-tighter">System Intelligence</h4>
          <p className="text-white/40 font-bold text-sm max-w-xl">You are connected to FBR Flow PRO v2.4. All actions are audited and encrypted using enterprise-grade security protocols.</p>
          <div className="flex items-center gap-8 pt-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary">Status</span>
              <span className="text-lg font-black tracking-tight">Active</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary">Encryption</span>
              <span className="text-lg font-black tracking-tight">AES-256</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary">Nodes</span>
              <span className="text-lg font-black tracking-tight">Cloud-Secured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ icon: Icon, label, value }: any) {
  return (
    <div className="space-y-4 p-6 bg-zinc-50/50 rounded-3xl border border-zinc-50 group hover:border-primary/20 transition-all">
      <div className="flex items-center gap-3 text-zinc-400 group-hover:text-primary transition-colors">
        <Icon size={18} strokeWidth={2.5} />
        <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="text-sm font-black text-zinc-950 tracking-tight">{value}</p>
    </div>
  );
}
