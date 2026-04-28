import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  MoreVertical,
  Layers,
  Edit,
  Printer,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  status: string;
  category: string;
  projectType: string;
  company: string;
  createdAt: string;
  nature: string;
}

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  waitingApproval: number;
  inProduction: number;
  completedProjects: number;
}

export function Dashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    waitingApproval: 0,
    inProduction: 0,
    completedProjects: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, statsRes] = await Promise.all([
          fetch('/api/projects', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (projectsRes.ok) {
          setProjects(await projectsRes.json());
        }

        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
      } catch {
        console.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, [token]);

  const handlePrintProject = (projectId: string) => {
    window.open(`/projects/detail/${projectId}?autoprint=1`, '_blank', 'noopener,noreferrer');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return 'bg-zinc-100 text-zinc-500';
      case 'IN_CREATION':
        return 'bg-blue-50 text-blue-500';
      case 'WAITING_APPROVAL':
        return 'bg-amber-50 text-amber-500';
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-500';
      case 'IN_PRODUCTION':
        return 'bg-purple-50 text-purple-500';
      case 'COMPLETED':
        return 'bg-zinc-900 text-white';
      default:
        return 'bg-zinc-100 text-zinc-500';
    }
  };

  if (loading) {
    return (
      <div className="flex animate-pulse flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-zinc-100 rounded-[32px]"></div>)}
        </div>
        <div className="h-[400px] bg-zinc-100 rounded-[32px]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-zinc-950 uppercase">Intelligent Overview</h2>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-[9px] md:text-xs mt-1 md:mt-2">Operational health and project throughput</p>
        </div>
        <button className="signature-gradient w-full sm:w-auto p-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:scale-105 transition-all">
          Generate Report
          <BarChart3 size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard icon={Layers} label="Active Pipeline" value={String(stats.activeProjects)} trend={String(stats.totalProjects)} color="primary" />
        <StatCard icon={Clock} label="Waiting Approval" value={String(stats.waitingApproval)} trend={String(stats.waitingApproval)} color="amber" />
        <StatCard icon={AlertCircle} label="In Production" value={String(stats.inProduction)} trend={String(stats.inProduction)} color="rose" />
        <StatCard icon={CheckCircle2} label="Completed Jobs" value={String(stats.completedProjects)} trend={String(stats.completedProjects)} color="emerald" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        <div className="xl:col-span-2 bg-white border border-zinc-100 rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-black tracking-tight text-zinc-950">Production Status</h3>
            <button onClick={() => navigate('/projects/active')} className="text-primary font-black text-[10px] md:text-xs uppercase tracking-widest hover:underline">View All</button>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-50">
                  <th className="pb-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">Project Context</th>
                  <th className="pb-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">Nature</th>
                  <th className="pb-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                  <th className="pb-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">Timeline</th>
                  <th className="pb-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {projects.slice(0, 8).map((project) => (
                  <tr key={project.id} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 md:py-5">
                      <div>
                        <p className="text-xs md:text-sm font-black text-zinc-950 tracking-tight">{project.category}</p>
                        <p className="text-[10px] md:text-xs font-bold text-zinc-400">{project.company}</p>
                      </div>
                    </td>
                    <td className="py-4 md:py-5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-100 px-3 py-1 rounded-lg">
                        {project.nature}
                      </span>
                    </td>
                    <td className="py-4 md:py-5">
                      <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="py-4 md:py-5 text-[10px] md:text-xs font-bold text-zinc-500">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 md:py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/projects/detail/${project.id}`)}
                          className="p-2 text-zinc-300 hover:text-primary transition-colors flex items-center gap-2 text-[9px] font-black uppercase tracking-widest"
                        >
                          <span className="hidden sm:inline">Details</span>
                          <ArrowUpRight size={18} />
                        </button>
                        
                        {user?.role === 'ADMIN' && (
                          <button 
                            onClick={() => navigate(`/projects/edit/${project.id}`)}
                            className="p-2 text-zinc-300 hover:text-zinc-950 transition-colors flex items-center gap-2 text-[9px] font-black uppercase tracking-widest"
                          >
                            <span className="hidden sm:inline">Edit</span>
                            <Edit size={18} />
                          </button>
                        )}

                        <button
                          onClick={() => handlePrintProject(project.id)}
                          className="p-2 text-zinc-300 hover:text-zinc-950 transition-colors flex items-center gap-2 text-[9px] font-black uppercase tracking-widest"
                          title="Print project"
                          aria-label={`Print project ${project.category}`}
                        >
                          <span className="hidden sm:inline">Print</span>
                          <Printer size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          {user?.role === 'ADMIN' && (
            <div className="signature-gradient rounded-[24px] md:rounded-[32px] p-6 md:p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <h4 className="text-lg md:text-xl font-black tracking-tight mb-2 uppercase">New Requisition</h4>
              <p className="text-white/60 text-[11px] font-bold mb-8 leading-relaxed">Centralize your briefing and ensure architectural precision in every design piece.</p>
              <button onClick={() => navigate('/new-request')} className="w-full bg-white text-zinc-950 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                Start Request
                <ArrowUpRight size={18} />
              </button>
            </div>
          )}

          <div className="bg-zinc-950 rounded-[24px] md:rounded-[32px] p-6 md:p-8 text-zinc-400 border border-white/5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6">Internal Messages</h4>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex-shrink-0" />
                  <div>
                    <p className="text-white text-[11px] font-bold">Feedback received for Job #{40 + i}</p>
                    <p className="text-[10px] mt-1 opacity-50 uppercase tracking-tight">System Notification | 2h ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, color }: any) {
  const colorMap: Record<string, string> = {
    primary: 'text-primary bg-primary/10',
    amber: 'text-amber-500 bg-amber-50',
    emerald: 'text-emerald-500 bg-emerald-50',
    rose: 'text-rose-500 bg-rose-50',
  };

  return (
    <div className="bg-white border border-zinc-100 p-8 rounded-[32px] shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
        <span className="text-[10px] font-black px-2 py-1 rounded-lg text-zinc-500 bg-zinc-100">
          {trend}
        </span>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{label}</p>
        <p className="text-2xl font-black text-zinc-950 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
