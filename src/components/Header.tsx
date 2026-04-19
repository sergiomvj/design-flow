import React from 'react';
import { Search, Bell, History, GitBranch, Star, ThumbsUp, ThumbsDown } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] h-16 z-30 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 lg:px-10 border-b border-zinc-100">
      <div className="flex items-center gap-6">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3 text-zinc-400" />
          <input
            type="text"
            placeholder="SEARCH REGISTRY..."
            className="bg-zinc-100 border border-zinc-200 rounded-full pl-10 pr-4 py-2 text-[10px] font-bold tracking-widest uppercase focus:ring-1 focus:ring-primary w-40 lg:w-64 placeholder:text-zinc-400 text-zinc-900"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-2 lg:gap-4 text-zinc-400">
          <button className="hover:text-primary transition-colors p-1"><Star size={18} /></button>
          <button className="hover:text-primary transition-colors p-1"><ThumbsUp size={18} /></button>
          <button className="hover:text-primary transition-colors p-1"><ThumbsDown size={18} /></button>
          <div className="h-4 w-px bg-zinc-200 mx-2" />
          <button className="hover:text-primary transition-colors p-1"><Bell size={18} /></button>
        </div>
        
        <div className="flex items-center gap-3 pl-4 border-l border-zinc-200">
          <div className="hidden sm:block text-right">
            <p className="text-[10px] font-black uppercase tracking-tight leading-none text-zinc-950">Elena Rodriguez</p>
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Designer</p>
          </div>
          <div className="w-8 h-8 rounded-full signature-gradient border border-zinc-200 p-[1px]">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[10px] font-black text-zinc-950">ER</div>
          </div>
        </div>
      </div>
    </header>
  );
}
