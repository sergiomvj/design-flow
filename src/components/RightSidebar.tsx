import React from 'react';
import { ShieldCheck, UserCheck, Activity } from 'lucide-react';
import { HistoryItem } from '../types';

const history: HistoryItem[] = [
  { id: '1', title: 'Q4 Annual Report Refresh', dueDate: 'DUE IN 2 DAYS', status: 'IN PRODUCTION', statusColor: 'bg-emerald-500' },
  { id: '2', title: 'Social Media Campaign Assets', dueDate: 'AWAITING APPROVAL', status: 'REVIEWING', statusColor: 'bg-amber-500' },
  { id: '3', title: 'Billboard Concept: Midtown', dueDate: 'DRAFT SAVED', status: 'RECEIVED', statusColor: 'bg-primary' },
];

export function RightSidebar() {
  return (
    <div className="space-y-8 sticky top-24">
      {/* Internal Control Section */}
      <section className="bg-white border border-zinc-100 p-8 rounded-[32px] space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Internal Control</h3>
          <span className="bg-primary/10 text-primary text-[9px] px-2 py-1 rounded font-black uppercase tracking-tighter">System Only</span>
        </div>
        
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Assigned Designer</label>
            <select className="w-full bg-zinc-50 border border-zinc-100 p-4 text-xs rounded-2xl font-black focus:ring-1 focus:ring-primary outline-none text-zinc-950 appearance-none">
              <option>Elena Rodriguez</option>
              <option>Marcus Sterling</option>
              <option>Sarah Jenkins</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Job Number</label>
              <div className="bg-zinc-50 p-4 text-xs rounded-2xl font-black text-primary border border-primary/10">
                SR-2941-X
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Internal Priority</label>
              <select className="w-full bg-zinc-50 border border-zinc-100 p-4 text-xs rounded-2xl font-black focus:ring-1 focus:ring-primary outline-none text-zinc-950 appearance-none">
                <option>Tier 1 (High)</option>
                <option>Tier 2 (Mid)</option>
                <option>Tier 3 (Low)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Active History Section */}
      <section className="bg-white border border-zinc-100 p-8 rounded-[32px] shadow-sm">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">Active History</h3>
        
        <div className="space-y-8">
          {history.map((item) => (
            <div key={item.id} className="flex items-start gap-4 group cursor-pointer">
              <div className={`w-1.5 h-12 ${item.statusColor} rounded-full group-hover:scale-y-110 transition-all duration-500 opacity-80`} />
              <div className="flex-1 space-y-1.5">
                <p className="text-xs font-black leading-tight text-zinc-950 group-hover:text-primary transition-colors uppercase tracking-tight">{item.title}</p>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-none">{item.dueDate}</p>
                <div className="pt-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] px-3 py-1 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-10 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 border border-zinc-100 hover:bg-zinc-50 hover:text-primary hover:border-primary/20 rounded-[20px] transition-all">
          View All Ledger Items
        </button>
      </section>

      {/* Compliance Message */}
      <div className="bg-primary/5 p-8 rounded-[32px] border border-primary/10 relative overflow-hidden group">
        <div className="absolute -top-4 -right-4 p-2 opacity-5 scale-150 rotate-12 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
          <ShieldCheck size={120} className="text-primary" />
        </div>
        <div className="flex gap-4 items-start relative z-10">
          <div className="p-3 bg-white rounded-2xl text-primary shadow-sm border border-primary/5">
            <ShieldCheck size={20} />
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-black leading-tight text-zinc-950 uppercase tracking-[0.1em]">Sovereign Compliance</p>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-bold uppercase tracking-tight opacity-80">
              All submitted requests are encrypted and audited per ISO-27001 standards. Access is logged by user ID 4920.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
