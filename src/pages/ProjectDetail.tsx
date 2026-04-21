import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText, 
  Layers, 
  Ruler, 
  ShieldCheck, 
  UploadCloud,
  User,
  AlertCircle,
  Printer
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { StatusProgress } from '../components/StatusProgress';
import { RequestStatus } from '../types';

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setProject(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch project');
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex animate-pulse flex-col gap-10">
        <div className="h-48 bg-zinc-100 rounded-[40px]"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="h-96 bg-zinc-100 rounded-[40px]"></div>
          <div className="h-96 bg-zinc-100 rounded-[40px]"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-6">
        <AlertCircle size={48} className="text-zinc-300" />
        <h2 className="text-xl font-black uppercase tracking-tighter">Project not found</h2>
        <button onClick={() => navigate(-1)} className="text-primary font-bold hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div className="flex justify-between items-center no-print">
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-zinc-400 hover:text-zinc-950 font-black text-xs uppercase tracking-widest transition-all">
          <ArrowLeft size={18} />
          Back to Pipeline
        </button>
        
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-3 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm"
        >
          <Printer size={18} />
          Export PDF
        </button>
      </div>

      {/* Header Info */}
      <div className="bg-white border border-zinc-100 p-8 md:p-12 rounded-[40px] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-[24px] flex items-center justify-center text-primary text-2xl font-black">
            {project.category.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-zinc-950">{project.category}</h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-[10px] md:text-sm font-black uppercase tracking-widest text-zinc-500">{project.company}</span>
              <span className="w-1.5 h-1.5 bg-zinc-200 rounded-full"></span>
              <span className="text-[10px] md:text-sm font-black uppercase tracking-widest text-primary">{project.projectType}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Created At</p>
          <p className="text-lg font-black text-zinc-950">{new Date(project.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <StatusProgress currentStatus={project.status as RequestStatus} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Main Briefing */}
          <section className="bg-white border border-zinc-100 p-8 md:p-12 rounded-[40px] space-y-10">
            <div className="flex items-center gap-4">
               <FileText size={24} className="text-primary" />
               <h3 className="text-xl font-black uppercase tracking-tight">Project Narrative</h3>
            </div>
            
            <div className="grid gap-8">
              <div>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3">Goal & Objective</p>
                <p className="text-lg font-bold text-zinc-900 leading-relaxed italic border-l-4 border-primary/20 pl-6">{project.objective}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3">Detailed Description</p>
                <p className="text-sm font-medium text-zinc-600 leading-relaxed">{project.description}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3">Brand Voice/Main Message</p>
                <p className="text-sm font-bold text-zinc-950">{project.mainMessage}</p>
              </div>
            </div>
          </section>

          {/* Technical Specs */}
          <section className="bg-white border border-zinc-100 p-8 md:p-12 rounded-[40px] space-y-10">
            <div className="flex items-center gap-4">
               <Ruler size={24} className="text-primary" />
               <h3 className="text-xl font-black uppercase tracking-tight">Technical Data</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <SpecItem label="Final Size" value={project.dimensions} subValue={project.unit} />
              <SpecItem label="Quantity" value={project.quantity} />
              <SpecItem label="Material" value={project.material} />
              <SpecItem label="Colors" value={project.colors} />
              <SpecItem label="Finishing" value={project.finishing || 'Standard'} />
              <SpecItem label="Rush Job" value={project.isRush ? 'YES' : 'NO'} subValue={project.rushReason} highlight={project.isRush} />
            </div>
          </section>
        </div>

        <div className="space-y-10">
          {/* Files */}
          <section className="bg-zinc-950 text-white p-8 md:p-10 rounded-[40px] space-y-8">
            <div className="flex items-center gap-3">
               <UploadCloud size={20} className="text-primary" />
               <h3 className="text-lg font-black uppercase tracking-tight">Assets & Media</h3>
            </div>
            
            <div className="space-y-4">
              <FileLink label="Uploaded Assets" urls={project.fileUrls} />
              <FileLink label="Uploaded Photos" urls={project.photoUrls} />
              <FileLink label="Customer Logo" urls={project.logoUrl} />
              <FileLink label="Reference Links" urls={project.referenceLinks} isExternal />
            </div>
          </section>

          {/* Stakeholders */}
          <section className="bg-white border border-zinc-100 p-8 md:p-10 rounded-[40px] space-y-8">
            <div className="flex items-center gap-3 text-zinc-950">
               <ShieldCheck size={20} className="text-primary" />
               <h3 className="text-lg font-black uppercase tracking-tight">Governance</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center font-black">{project.requester.name.charAt(0)}</div>
                <div>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Requester</p>
                  <p className="text-xs font-black text-zinc-950">{project.requester.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-black">
                  {project.designer ? project.designer.name.charAt(0) : '?'}
                </div>
                <div>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Designer Assigned</p>
                  <p className="text-xs font-black text-zinc-950">{project.designer ? project.designer.name : 'Waiting Assignment'}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SpecItem({ label, value, subValue, highlight }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{label}</p>
      <p className={`text-sm font-black ${highlight ? 'text-primary' : 'text-zinc-950'}`}>{value}</p>
      {subValue && <p className="text-[9px] font-bold text-zinc-400">{subValue}</p>}
    </div>
  );
}

function FileLink({ label, urls, isExternal }: any) {
  if (!urls) return null;
  const urlList = urls.split(',').filter(Boolean);
  if (urlList.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">{label}</p>
      <div className="flex flex-wrap gap-2">
        {urlList.map((url: string, i: number) => (
          <a 
            key={i}
            href={url.startsWith('http') ? url : `http://${url}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-bold text-white transition-all border border-white/5"
          >
            {isExternal ? `Link ${i+1}` : `File ${i+1}`}
            <ExternalLink size={10} />
          </a>
        ))}
      </div>
    </div>
  );
}
