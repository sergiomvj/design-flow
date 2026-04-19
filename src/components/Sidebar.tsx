import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Settings,
  Compass,
  User
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'home' },
  { icon: PlusCircle, label: 'New Request', id: 'home' },
  { icon: Compass, label: 'Explore', id: 'explore' },
  { icon: User, label: 'Profile', id: 'profile' },
  { icon: Settings, label: 'System Settings', id: 'profile' },
];

export function Sidebar({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: any) => void }) {
  return (
    <aside className="hidden lg:flex h-screen w-64 fixed left-0 top-0 z-40 bg-white flex-col py-8 font-sans font-medium border-r border-zinc-100">
      <div className="px-8 mb-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 signature-gradient rounded flex items-center justify-center text-white font-black text-xs">F</div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-zinc-950 leading-none">FBRSigns</h1>
            <p className="text-[9px] uppercase tracking-widest text-zinc-400 mt-1 font-bold">Design Flow</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-4 py-3 pl-8 transition-colors ${
              activeTab === item.id 
                ? 'text-primary font-bold border-l-4 border-primary bg-zinc-50' 
                : 'text-zinc-500 hover:text-primary hover:bg-zinc-50'
            }`}
          >
            <item.icon size={20} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-6 mt-auto">
        <button onClick={() => onTabChange('home')} className="w-full signature-gradient text-white py-3 rounded-xl font-bold text-sm shadow-xl hover:opacity-90 active:scale-95 transition-all">
          New Entry
        </button>
      </div>
    </aside>
  );
}
