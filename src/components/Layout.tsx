import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Settings,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  Inbox,
  LogOut,
  Search,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: PlusCircle, label: 'New Request', path: '/new-request' },
  { icon: Layers, label: 'Active Projects', path: '/projects/active' },
  { icon: Clock, label: 'Waiting Approval', path: '/projects/waiting' },
  { icon: Inbox, label: 'Production Queue', path: '/projects/production' },
  { icon: CheckCircle2, label: 'Completed Jobs', path: '/projects/completed' },
  { icon: Users, label: 'Team', path: '/team', roles: ['ADMIN'] },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavContent = () => (
    <>
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 signature-gradient rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/20">F</div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-zinc-950 leading-none">FBR Flow</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mt-1 font-black">Pro System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.roles && !item.roles.includes(user?.role || '')) return null;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300
                ${isActive 
                  ? 'bg-primary/5 text-primary font-black shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50 font-bold'}
              `}
            >
              <item.icon size={20} strokeWidth={2.5} />
              <span className="text-sm tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-zinc-100">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-6 py-4 text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-2xl font-bold text-sm"
        >
          <LogOut size={20} strokeWidth={2.5} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans overflow-x-hidden">
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-zinc-950/20 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-white z-50 flex flex-col shadow-2xl lg:hidden"
            >
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-8 right-6 p-2 text-zinc-400 hover:text-zinc-950 transition-colors"
              >
                <X size={24} />
              </button>
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-zinc-100 fixed h-screen">
        <NavContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 bg-[#fcfcfc] w-full min-w-0">
        {/* Topbar */}
        <header className="h-20 lg:h-24 bg-white/80 backdrop-blur-md border-b border-zinc-100 flex items-center justify-between px-4 md:px-8 lg:px-12 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 text-zinc-500 hover:text-zinc-950 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="relative w-full group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-zinc-100 border border-transparent focus:bg-white focus:border-primary/20 p-3 pl-12 rounded-2xl outline-none text-sm font-bold text-zinc-950 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <button className="relative p-2 text-zinc-400 hover:text-zinc-950 transition-colors">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-zinc-950 tracking-tight leading-none">{user?.name}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-primary mt-1">{user?.role}</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-zinc-100 rounded-xl lg:rounded-2xl border-2 border-zinc-50 flex items-center justify-center font-black text-zinc-400 overflow-hidden shadow-inner flex-shrink-0">
                {user?.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}

