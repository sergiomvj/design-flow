import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Search, Users, Shield, Mail, Zap, MoreHorizontal } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export function Team() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeam() {
      // In a real app we might need an /api/users endpoint
      // For now we'll simulate fetching if the endpoint doesn't exist 
      // or use a generic projects list to infer users if needed.
      // But let's assume we have /api/auth/team or similar.
      try {
        const res = await fetch('/api/auth/team', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setUsers(await res.json());
        } else {
          // Fallback static for demo if endpoint not ready
          setUsers([
            { id: '1', name: 'Alexander Thorne', email: 'a.thorne@lumina.com', role: 'ADMIN', createdAt: '2026-04-10' },
            { id: '2', name: 'Sarah Chen', email: 's.chen@design.com', role: 'DESIGNER', createdAt: '2026-04-12' },
            { id: '3', name: 'Marcus Rodriguez', email: 'm.rodriguez@client.com', role: 'CLIENT', createdAt: '2026-04-15' },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch team');
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, [token]);

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-zinc-950 uppercase">Network Team</h2>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-2">Manage access levels and professional roles</p>
        </div>
        <button className="signature-gradient px-8 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 hover:scale-105 transition-all">
          Invite Professional
          <Zap size={18} />
        </button>
      </div>

      <div className="bg-white border border-zinc-100 rounded-[40px] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-zinc-50 flex items-center gap-4 bg-zinc-50/50">
          <div className="relative flex-1 max-w-md group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" />
            <input type="text" placeholder="Search by name, role or email..." className="w-full bg-white border border-zinc-100 p-3 pl-12 rounded-2xl outline-none text-sm font-bold text-zinc-950 transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-x divide-y divide-zinc-50">
          {users.map((u) => (
            <div key={u.id} className="p-10 hover:bg-zinc-50/50 transition-colors group relative">
              <button className="absolute top-8 right-8 text-zinc-300 hover:text-zinc-950 transition-colors opacity-0 group-hover:opacity-100">
                <MoreHorizontal size={20} />
              </button>
              
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-zinc-100 rounded-[28px] flex items-center justify-center text-2xl font-black text-zinc-300 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  {u.name.charAt(0)}
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-lg font-black tracking-tight text-zinc-950">{u.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-[0.1em] text-[9px]">
                    <Shield size={10} />
                    {u.role}
                  </div>
                </div>

                <div className="space-y-4 pt-4 w-full">
                  <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-transparent group-hover:border-zinc-100 transition-all">
                    <Mail size={16} className="text-zinc-300" />
                    <span className="text-xs font-bold text-zinc-500 truncate">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-transparent group-hover:border-zinc-100 transition-all">
                     <Users size={16} className="text-zinc-300" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Since {new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
