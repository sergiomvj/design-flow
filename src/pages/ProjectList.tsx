import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, Filter, MoreVertical, ExternalLink, Clock } from 'lucide-react';

interface Project {
  id: string;
  status: string;
  category: string;
  company: string;
  nature: string;
  createdAt: string;
  requester?: { name: string };
  designer?: { name: string };
}

export function ProjectList() {
  const { status } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const res = await fetch('/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const allProjects = await res.json();
          if (status === 'active') {
            setProjects(allProjects.filter((p: Project) => ['RECEIVED', 'IN_CREATION', 'WAITING_APPROVAL'].includes(p.status)));
          } else if (status === 'waiting') {
            setProjects(allProjects.filter((p: Project) => p.status === 'WAITING_APPROVAL'));
          } else if (status === 'production') {
            setProjects(allProjects.filter((p: Project) => p.status === 'IN_PRODUCTION'));
          } else if (status === 'completed') {
            setProjects(allProjects.filter((p: Project) => p.status === 'COMPLETED'));
          } else {
            setProjects(allProjects);
          }
        }
      } catch (err) {
        console.error('Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [status, token]);

  const getStatusLabel = (s: string) => s.replace('_', ' ');

  return (
    <div className="space-y-6 md:space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-zinc-950 uppercase">
            {status ? `${status} Projects` : 'All Projects'}
          </h2>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] md:text-xs mt-1 md:mt-2">
            {projects.length} artifacts identified in current view
          </p>
        </div>
      </div>

      <div className="bg-white border border-zinc-100 rounded-[24px] md:rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-4 md:p-8 border-b border-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 bg-zinc-50 px-5 py-3 rounded-2xl w-full sm:max-w-sm border border-zinc-100 focus-within:bg-white focus-within:border-primary/20 transition-all">
            <Search size={18} className="text-zinc-400" />
            <input type="text" placeholder="Filter current list..." className="bg-transparent outline-none text-sm font-bold text-zinc-950 w-full" />
          </div>
          <button className="flex items-center justify-center gap-3 px-6 py-3 w-full sm:w-auto bg-zinc-50 text-zinc-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-zinc-100 transition-all">
            <Filter size={18} />
            Filters
          </button>
        </div>

        {loading ? (
             <div className="p-12 md:p-24 flex flex-col items-center justify-center gap-4 animate-pulse">
             <div className="w-12 h-12 bg-zinc-100 rounded-full"></div>
             <div className="h-4 w-32 bg-zinc-50 rounded"></div>
           </div>
        ) : projects.length === 0 ? (
          <div className="p-12 md:p-24 flex flex-col items-center justify-center text-center gap-6">
            <div className="w-16 md:w-20 h-16 md:h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200">
              <Clock size={40} />
            </div>
            <div>
              <p className="text-zinc-950 font-black text-lg">No projects found</p>
              <p className="text-zinc-400 text-sm font-bold mt-1">Try adjusting your filters or status selection.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-zinc-50/50">
                  <th className="px-6 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">Request Data</th>
                  <th className="px-6 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">Nature</th>
                  <th className="px-6 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">Requester</th>
                  <th className="px-6 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                  <th className="px-6 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {projects.map((p) => (
                  <tr key={p.id} className="group hover:bg-zinc-50/30 transition-colors">
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-black text-xs">
                          {p.category.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-zinc-950 tracking-tight">{p.category}</p>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{p.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6">
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{p.nature}</span>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-8 md:h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400 font-black text-[10px] uppercase">
                          {p.requester?.name.charAt(0) || '?'}
                        </div>
                        <span className="text-sm font-bold text-zinc-600 tracking-tight">{p.requester?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6">
                       <div className={`
                         inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em]
                         ${p.status === 'COMPLETED' ? 'bg-zinc-950 text-white' : 'bg-primary/10 text-primary'}
                       `}>
                         {getStatusLabel(p.status)}
                       </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                      <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`/projects/detail/${p.id}`)}
                          className="p-2 text-zinc-400 hover:text-primary transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                        >
                          <span className="hidden sm:inline">Details</span>
                          <ExternalLink size={18} />
                        </button>
                        <button className="p-2 text-zinc-400 hover:text-zinc-950 transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Clock({ size, ...props }: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
