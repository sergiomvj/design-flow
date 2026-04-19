import React from 'react';
import { 
  User, 
  Compass,
  MousePointer2,
  FileText,
  Ruler,
  UploadCloud,
  Calendar,
  ShieldCheck,
  Send,
  Briefcase,
  Monitor,
  Printer,
  Video
} from 'lucide-react';

const objectives = [
  'Revenue Generation / Sales Enablement',
  'Brand Awareness / Market Presence'
];

const projectTypes = [
  { icon: Briefcase, label: 'BRAND IDENTITY', active: true },
  { icon: Monitor, label: 'DIGITAL UI', active: false },
  { icon: Printer, label: 'PRINT MEDIA', active: false },
  { icon: Video, label: 'MOTION ASSETS', active: false },
];

export function DesignRequestForm() {
  return (
    <div className="space-y-8">
      {/* Section 1: Requester */}
      <section className="bg-white border border-zinc-100 p-6 lg:p-10 rounded-[32px] space-y-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <User size={24} />
          </div>
          <h3 className="text-xl font-black tracking-tight text-zinc-950">Requester Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormGroup label="FULL NAME" value="Alexander Thorne" small />
          <FormGroup label="COMPANY ENTITY" value="Lumina Global Holdings" small />
          <FormGroup label="BUSINESS EMAIL" value="a.thorne@lumina.com" small />
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">DEPARTMENT</label>
            <select className="w-full bg-zinc-50 border border-zinc-100 focus:border-primary transition-all p-3 text-xs rounded-2xl outline-none font-bold text-zinc-950">
              <option>Marketing & Strategy</option>
              <option>Product Development</option>
              <option>Executive Office</option>
            </select>
          </div>
        </div>

        <div className="pt-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 block">PREFERRED CONTACT METHOD</label>
          <div className="flex flex-wrap gap-8">
            <RadioGroup options={['Secure Email', 'Internal Messaging', 'Direct Dial']} />
          </div>
        </div>
      </section>

      {/* Section 2: Project Scope */}
      <section className="bg-white border border-zinc-100 p-6 lg:p-10 rounded-[32px] space-y-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <MousePointer2 size={24} />
          </div>
          <h3 className="text-xl font-black tracking-tight text-zinc-950">Project Scope</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {projectTypes.map((type) => (
            <div 
              key={type.label}
              className={`p-6 rounded-[24px] flex flex-col items-center gap-3 cursor-pointer transition-all border-2 ${
                type.active 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-zinc-100 bg-zinc-100 text-zinc-400 hover:border-zinc-200'
              }`}
            >
              <type.icon size={28} strokeWidth={type.active ? 2.5 : 2} />
              <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">PRIMARY OBJECTIVE</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {objectives.map((obj, i) => (
              <label key={obj} className="flex items-center gap-3 p-5 bg-zinc-100 border border-zinc-100 rounded-[24px] cursor-pointer hover:bg-zinc-200 transition-colors">
                <input type="checkbox" defaultChecked={i === 0} className="w-6 h-6 rounded-lg border-zinc-300 bg-white text-primary focus:ring-primary focus:ring-offset-white" />
                <span className="text-sm font-bold text-zinc-600">{obj}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Narrative */}
      <section className="bg-white border border-zinc-100 p-6 lg:p-10 rounded-[32px] space-y-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <FileText size={24} />
          </div>
          <h3 className="text-xl font-black tracking-tight text-zinc-950">Narrative & Context</h3>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">DETAILED CREATIVE BRIEF</label>
            <textarea 
              rows={4}
              className="w-full bg-zinc-100 border border-zinc-200 focus:border-primary transition-all p-4 text-sm rounded-2xl outline-none font-bold text-zinc-950 min-h-[140px]"
              defaultValue="Seeking a refresh for our quarterly investor deck. The aesthetic must communicate absolute stability and forward-thinking precision. Use deep reds and metallic grays."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormGroup label="PRIMARY HEADLINES" isTextArea defaultValue="The Sovereign Shift: 2024 Outlook" />
            <FormGroup label="MAIN MESSAGE" isTextArea defaultValue="Stability in an Era of Change." />
          </div>
        </div>
      </section>

      {/* Section 4: Technical Specs */}
      <section className="bg-white border border-zinc-100 p-6 lg:p-10 rounded-[32px] space-y-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <Ruler size={24} />
          </div>
          <h3 className="text-xl font-black tracking-tight text-zinc-950">Technical Specifications</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormGroup label="CANVAS DIMENSIONS" value="1920x1080" />
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">UNIT TYPE</label>
            <select className="w-full bg-zinc-50 border border-zinc-100 focus:border-primary transition-all p-4 text-sm rounded-2xl outline-none font-bold text-zinc-950">
              <option>Pixels (px)</option>
              <option>Millimeters (mm)</option>
              <option>Inches (in)</option>
            </select>
          </div>
          <FormGroup label="TOTAL QUANTITY" type="number" defaultValue={1} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">MATERIAL / OUTPUT FORMAT</label>
            <select className="w-full bg-zinc-50 border border-zinc-100 focus:border-primary transition-all p-4 text-sm rounded-2xl outline-none font-bold text-zinc-950">
              <option>High-Resolution PDF</option>
              <option>Vector (SVG/EPS)</option>
              <option>Web-Optimized JPG</option>
            </select>
          </div>
          <FormGroup label="FINISHING DETAILS" placeholder="Foil stamp, matte UV, etc." />
        </div>
      </section>

      {/* Section 5: Files */}
      <section className="bg-white border border-zinc-100 p-6 lg:p-10 rounded-[32px] space-y-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <UploadCloud size={24} />
          </div>
          <h3 className="text-xl font-black tracking-tight text-zinc-950">References & Files</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FileDropZone icon="image" label="DRAG LOGOS & ASSETS" />
          <FileDropZone icon="link" label="ADD REFERENCE LINKS" />
        </div>
      </section>

      {/* Section 6: Timeline */}
      <section className="bg-white border border-zinc-100 p-6 lg:p-10 rounded-[32px] space-y-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <Calendar size={24} />
          </div>
          <h3 className="text-xl font-black tracking-tight text-zinc-950">Timeline & Priority</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormGroup label="REQUIRED DELIVERY" type="date" />
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">URGENCY LEVEL</label>
            <select className="w-full bg-zinc-50 border border-zinc-100 focus:border-primary transition-all p-4 text-sm rounded-2xl outline-none font-bold text-zinc-950">
              <option>Standard Flow</option>
              <option className="text-primary font-bold">Urgent (Express Fee)</option>
              <option>Critical / Overnight</option>
            </select>
          </div>
          <FormGroup label="EVENT DATE" type="date" />
        </div>
      </section>

      {/* Final Authorization */}
      <div className="bg-primary/5 p-8 lg:p-12 rounded-[40px] border border-primary/20 space-y-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -mr-32 -mt-32" />
        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-primary">Final Authorization</h3>
        <div className="space-y-4">
          <label className="flex items-start gap-5 cursor-pointer group">
            <input type="checkbox" className="mt-1 w-6 h-6 rounded-lg border-primary/20 bg-zinc-950 text-primary focus:ring-primary focus:ring-offset-zinc-900" />
            <span className="text-sm font-bold text-zinc-300 leading-relaxed uppercase tracking-tight">I certify that all technical specs provided are final and verified by the department lead.</span>
          </label>
          <label className="flex items-start gap-5 cursor-pointer group">
            <input type="checkbox" className="mt-1 w-6 h-6 rounded-lg border-primary/20 bg-zinc-950 text-primary focus:ring-primary focus:ring-offset-zinc-900" />
            <span className="text-sm font-bold text-zinc-300 leading-relaxed uppercase tracking-tight">I authorize the allocation of design resources for this request.</span>
          </label>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-end items-center gap-8">
          <button className="text-[11px] font-black uppercase tracking-[0.1em] text-zinc-500 hover:text-white transition-colors">
            Discard Requisition
          </button>
          <button className="signature-gradient px-12 py-5 rounded-[20px] shadow-2xl text-white text-[12px] font-black uppercase tracking-[0.15em] hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4">
            Submit to Control
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FormGroup({ label, value, defaultValue, type = "text", isTextArea = false, placeholder = "", small = false }: any) {
  return (
    <div className={small ? "space-y-1" : "space-y-2"}>
      <label className={`${small ? "text-[9px]" : "text-[10px]"} font-black uppercase tracking-widest text-zinc-400`}>{label}</label>
      {isTextArea ? (
        <textarea 
          rows={small ? 1 : 2}
          className={`w-full bg-zinc-50 border border-zinc-100 focus:border-primary transition-all ${small ? "p-3 text-xs" : "p-4 text-sm"} rounded-2xl outline-none font-bold text-zinc-950`}
          defaultValue={defaultValue || value}
        />
      ) : (
        <input 
          type={type}
          placeholder={placeholder}
          className={`w-full bg-zinc-50 border border-zinc-100 focus:border-primary transition-all ${small ? "p-3 text-xs" : "p-4 text-sm"} rounded-2xl outline-none font-bold text-zinc-950 placeholder:text-zinc-400`}
          defaultValue={defaultValue || value}
        />
      )}
    </div>
  );
}

function RadioGroup({ options }: { options: string[] }) {
  return (
    <div className="flex flex-wrap gap-10">
      {options.map((opt, i) => (
        <label key={opt} className="flex items-center gap-4 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input 
              type="radio" 
              name="contact" 
              defaultChecked={i === 0}
              className="peer w-6 h-6 border-zinc-300 bg-white text-primary focus:ring-primary focus:ring-offset-white" 
            />
          </div>
          <span className="text-xs font-black text-zinc-500 group-hover:text-zinc-950 transition-colors uppercase tracking-widest">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function FileDropZone({ icon, label }: { icon: string, label: string }) {
  return (
    <div className="border-2 border-dashed border-zinc-200 rounded-[32px] p-12 flex flex-col items-center justify-center gap-4 hover:bg-zinc-50 hover:border-primary transition-all cursor-pointer group">
      <div className="p-4 bg-zinc-100 rounded-2xl text-zinc-400 group-hover:text-primary group-hover:bg-primary/5 transition-all shadow-inner">
        {icon === 'image' ? <Monitor size={32} /> : <UploadCloud size={32} />}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-zinc-950">{label}</p>
    </div>
  );
}
