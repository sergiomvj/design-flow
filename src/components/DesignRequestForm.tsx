import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
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
  Video,
  ArrowRight,
  ArrowLeft,
  Settings,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const steps = [
  { id: 1, title: 'Requester', icon: User },
  { id: 2, title: 'Project Type', icon: MousePointer2 },
  { id: 3, title: 'Description', icon: FileText },
  { id: 4, title: 'Technical', icon: Ruler },
  { id: 5, title: 'Files', icon: UploadCloud },
  { id: 6, title: 'Deadline', icon: Calendar },
  { id: 7, title: 'Approval', icon: ShieldCheck },
  { id: 8, title: 'Internal', icon: Settings },
  { id: 9, title: 'Confirm', icon: AlertCircle },
];

export function DesignRequestForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [designers, setDesigners] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    // Bloco 1: Requester
    company: '',
    requesterEmail: user?.email || '',
    phone: '',
    department: 'Marketing & Strategy',
    contactMethod: 'Secure Email',
    internalSalesRep: '',

    // Bloco 2: Project Type
    projectType: 'BRAND IDENTITY',
    category: 'Corporate',
    nature: 'New Design',
    objective: 'Brand Awareness / Market Presence',

    // Bloco 3: Description
    description: '',
    usage: '',
    mainMessage: '',
    headline: '',
    requiredText: '',
    mandatoryInfo: '',

    // Bloco 4: Technical
    dimensions: '',
    unit: 'Pixels (px)',
    material: 'High-Resolution PDF',
    quantity: 1,
    colors: '',
    brandGuidelines: '',
    finishing: '',

    // Bloco 5: Files
    logoUrl: '',
    fileUrls: '',
    photoUrls: '',
    referenceLinks: '',
    likes: '',
    dislikes: '',

    // Bloco 6: Deadline
    deadline: '',
    isRush: false,
    rushReason: '',
    eventDate: '',

    // Bloco 7: Approval
    approverName: '',
    approverContact: '',
    reviewerCount: 1,
    revisionCount: 1,
    additionalChargesAware: false,

    // Bloco 8: Internal
    priority: 'MEDIUM',
    internalNotes: '',
    designerId: '',

    // Bloco 9: Confirmation
    isConfirmed: false,
    briefingAware: false,
    validationAware: false,
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';
          setFormData({
            ...data,
            deadline: formatDate(data.deadline),
            eventDate: formatDate(data.eventDate),
            designerId: data.designerId || ''
          });
        }
      } catch (err) {
        console.error('Failed to load project for editing');
      }
    };

    const fetchDesigners = async () => {
      if (!token || !user) return;
      const canSeeDesigners = user.role === 'ADMIN';
      if (!canSeeDesigners) return;

      try {
        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const allUsers = await res.json();
          setDesigners(allUsers.filter((u: any) => u.role === 'DESIGNER'));
        }
      } catch (err) {
        console.error('Failed to fetch designers');
      }
    };

    if (token) {
      if (isEditing) {
        if (user?.role !== 'ADMIN') {
          navigate('/');
          return;
        }
        fetchProject();
      } else if (user && user.role !== 'ADMIN') {
        navigate('/');
        return;
      }
      fetchDesigners();
    }
  }, [id, isEditing, token, user?.id, user?.role, navigate]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 9));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = isEditing ? `/api/projects/${id}` : '/api/projects';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        navigate(isEditing ? `/projects/detail/${id}` : '/');
      } else {
        const errorData = await res.json();
        alert(`Failed to save project: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Network error or server unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 md:space-y-20 pb-32">
      {/* Progress Header */}
      <div className="bg-white p-4 md:p-6 rounded-[32px] border border-zinc-100 shadow-sm relative md:sticky md:top-24 z-20 scroll-smooth mb-8 md:mb-16">
        <div className="flex flex-wrap justify-center md:flex-nowrap md:justify-between items-center gap-x-6 gap-y-5 md:gap-0 px-2 md:px-4">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-1.5 group cursor-pointer" onClick={() => setCurrentStep(step.id)}>
              <div className={`
                w-8 h-8 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-300
                ${currentStep >= step.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200'}
              `}>
                <step.icon size={15} className="md:w-5 md:h-5" />
              </div>
              <span className={`text-[7px] md:text-[9px] font-black uppercase tracking-widest text-center leading-tight ${currentStep === step.id ? 'text-zinc-950' : 'text-zinc-400'}`}>
                {step.title.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6 md:space-y-8 px-4 md:px-0 pt-2"
        >
          {currentStep === 1 && (
            <Section icon={User} title="Requester Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Input label="COMPANY / CLIENT" value={formData.company} onChange={v => updateField('company', v)} />
                <Input label="BUSINESS EMAIL" value={formData.requesterEmail} onChange={v => updateField('requesterEmail', v)} type="email" />
                <Input label="PHONE / WHATSAPP" value={formData.phone} onChange={v => updateField('phone', v)} />
                <Input label="INTERNAL SALES REP" value={formData.internalSalesRep} onChange={v => updateField('internalSalesRep', v)} />
                <Select label="DEPARTMENT" options={['Marketing & Strategy', 'Product Development', 'Executive Office']} value={formData.department} onChange={v => updateField('department', v)} />
                <Select label="CONTACT METHOD" options={['Secure Email', 'Internal Messaging', 'Direct Dial']} value={formData.contactMethod} onChange={v => updateField('contactMethod', v)} />
              </div>
            </Section>
          )}

          {currentStep === 2 && (
            <Section icon={MousePointer2} title="Project Type">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                {['BRAND IDENTITY', 'DIGITAL UI', 'PRINT MEDIA', 'MOTION ASSETS'].map(type => (
                  <CardSelect
                    key={type}
                    label={type}
                    active={formData.projectType === type}
                    onClick={() => updateField('projectType', type)}
                    icon={type === 'BRAND IDENTITY' ? Briefcase : type === 'DIGITAL UI' ? Monitor : type === 'PRINT MEDIA' ? Printer : Video}
                  />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8">
                <Select label="NATURE" options={['New Design', 'Redesign', 'Adaptation', 'Revision']} value={formData.nature} onChange={v => updateField('nature', v)} />
                <Input label="PROJECT CATEGORY" value={formData.category} onChange={v => updateField('category', v)} />
              </div>
            </Section>
          )}

          {currentStep === 3 && (
            <Section icon={FileText} title="Project Description">
              <div className="space-y-4 md:space-y-6">
                <TextArea label="DETAILED PROJECT DESCRIPTION" value={formData.description} onChange={v => updateField('description', v)} />
                <Input label="WHERE WILL IT BE USED?" value={formData.usage} onChange={v => updateField('usage', v)} />
                <TextArea label="MAIN MESSAGE" value={formData.mainMessage} onChange={v => updateField('mainMessage', v)} rows={2} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <Input label="REQUIRED HEADLINE" value={formData.headline} onChange={v => updateField('headline', v)} />
                  <Input label="MANDATORY INFORMATION" value={formData.mandatoryInfo} onChange={v => updateField('mandatoryInfo', v)} />
                </div>
              </div>
            </Section>
          )}

          {currentStep === 4 && (
            <Section icon={Ruler} title="Technical Specifications">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <Input label="FINAL SIZE" value={formData.dimensions} onChange={v => updateField('dimensions', v)} />
                <Select label="UNIT" options={['Pixels (px)', 'Millimeters (mm)', 'Inches (in)']} value={formData.unit} onChange={v => updateField('unit', v)} />
                <Input label="QUANTITY" type="number" value={formData.quantity} onChange={v => updateField('quantity', v)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Select label="MATERIAL" options={['High-Resolution PDF', 'Vector (SVG)', 'Web Optimized']} value={formData.material} onChange={v => updateField('material', v)} />
                <Input label="DESIRED COLORS" value={formData.colors} onChange={v => updateField('colors', v)} />
              </div>
              <TextArea label="SPECIAL FINISHING DETAILS" value={formData.finishing} onChange={v => updateField('finishing', v)} rows={2} />
            </Section>
          )}

          {currentStep === 5 && (
            <Section icon={UploadCloud} title="References and Files">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <DropZone
                  label="UPLOAD FILES / ASSETS"
                  value={formData.fileUrls}
                  onChange={urls => updateField('fileUrls', urls)}
                />
                <DropZone
                  label="UPLOAD PHOTOS"
                  value={formData.photoUrls}
                  onChange={urls => updateField('photoUrls', urls)}
                />
                <Input label="REFERENCE LINKS" value={formData.referenceLinks} onChange={v => updateField('referenceLinks', v)} />
                <Input label="EXISTING LOGO (URL)" value={formData.logoUrl} onChange={v => updateField('logoUrl', v)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                <TextArea label="WHAT THE CLIENT LIKES" value={formData.likes} onChange={v => updateField('likes', v)} rows={2} />
                <TextArea label="WHAT CLIENT DOES NOT WANT" value={formData.dislikes} onChange={v => updateField('dislikes', v)} rows={2} />
              </div>
            </Section>
          )}

          {currentStep === 6 && (
            <Section icon={Calendar} title="Deadline and Priority">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Input label="IDEAL DELIVERY DATE" type="date" value={formData.deadline} onChange={v => updateField('deadline', v)} />
                <Input label="EVENT / INSTALLATION DATE" type="date" value={formData.eventDate} onChange={v => updateField('eventDate', v)} />
                <div className="flex items-center gap-4 p-4 md:p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <input type="checkbox" checked={formData.isRush} onChange={e => updateField('isRush', e.target.checked)} className="w-6 h-6 rounded-lg text-primary" />
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-600">Rush Job? (Express Fee)</span>
                </div>
                {formData.isRush && <Input label="REASON FOR RUSH" value={formData.rushReason} onChange={v => updateField('rushReason', v)} />}
              </div>
            </Section>
          )}

          {currentStep === 7 && (
            <Section icon={ShieldCheck} title="Approval Context">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Input label="APPROVER NAME" value={formData.approverName} onChange={v => updateField('approverName', v)} />
                <Input label="APPROVER CONTACT" value={formData.approverContact} onChange={v => updateField('approverContact', v)} />
                <Input label="NUMBER OF REVIEWERS" type="number" value={formData.reviewerCount} onChange={v => updateField('reviewerCount', parseInt(v))} />
                <Input label="INCLUDED REVISIONS" type="number" value={formData.revisionCount} onChange={v => updateField('revisionCount', parseInt(v))} />
              </div>
              <CheckBox
                label="ACKNOWLEDGMENT OF ADDITIONAL CHARGES AFTER APPROVAL"
                checked={formData.additionalChargesAware}
                onChange={v => updateField('additionalChargesAware', v)}
              />
            </Section>
          )}

          {currentStep === 8 && (
            <Section icon={Settings} title="Internal Control">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Select label="INTERNAL PRIORITY" options={['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']} value={formData.priority} onChange={v => updateField('priority', v)} />
                {user?.role === 'ADMIN' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-2">Assign Designer</label>
                    <select
                      value={formData.designerId}
                      onChange={e => updateField('designerId', e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-primary/20 p-4 rounded-2xl outline-none text-sm font-bold text-zinc-950 transition-all appearance-none"
                    >
                      <option value="">Unassigned</option>
                      {designers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="md:col-span-2">
                   <TextArea label="INTERNAL NOTES" value={formData.internalNotes} onChange={v => updateField('internalNotes', v)} rows={3} />
                </div>
              </div>
            </Section>
          )}

          {currentStep === 9 && (
            <Section icon={AlertCircle} title="Final Confirmation">
              <div className="space-y-3 md:space-y-4">
                <CheckBox label="INFORMATION CONFIRMED AND VERIFIED" checked={formData.isConfirmed} onChange={v => updateField('isConfirmed', v)} />
                <CheckBox label="AWARE OF DELAYS CAUSED BY INCOMPLETE BRIEFING" checked={formData.briefingAware} onChange={v => updateField('briefingAware', v)} />
                <CheckBox label="AUTHORIZATION TO START AFTER INTERNAL VALIDATION" checked={formData.validationAware} onChange={v => updateField('validationAware', v)} />
              </div>

              <div className="mt-8 md:mt-12 bg-primary/5 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-primary/20 flex flex-col items-center text-center gap-4 md:gap-6">
                <h4 className="text-lg md:text-xl font-black tracking-tighter text-zinc-950 uppercase">Ready to Production</h4>
                <p className="text-zinc-500 text-[11px] md:text-sm font-bold max-w-md">By submitting, you initiate the professional design workflow for this requisition.</p>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="signature-gradient w-full md:w-auto px-16 py-5 md:py-6 rounded-[20px] md:rounded-[24px] text-white font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : isEditing ? 'Update Requisition' : 'Submit Requisition'}
                  <Send size={18} />
                </button>
              </div>
            </Section>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center bg-white/90 backdrop-blur-md p-4 md:p-6 md:rounded-[32px] border-t md:border border-zinc-100 fixed bottom-0 md:bottom-8 left-0 md:left-1/2 md:-translate-x-1/2 w-full md:max-w-4xl shadow-2xl z-40">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2 md:gap-3 px-4 md:px-8 py-4 text-zinc-400 font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:text-zinc-950 disabled:opacity-20 transition-all"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        {currentStep < 9 && (
          <button
            onClick={nextStep}
            className="flex items-center gap-4 bg-zinc-950 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-zinc-800 transition-all group"
          >
            Next Stage
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: any) {
  return (
    <div className="bg-white border border-zinc-100 p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-sm space-y-8 md:space-y-10 relative overflow-hidden">
      <div className="flex items-center gap-4 md:gap-5">
        <div className="p-3 md:p-4 bg-primary/10 rounded-xl md:rounded-2xl text-primary">
          <Icon size={24} className="md:w-7 md:h-7" strokeWidth={2.5} />
        </div>
        <h3 className="text-xl md:text-2xl font-black tracking-tighter text-zinc-950">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-primary/20 p-4 rounded-2xl outline-none text-sm font-bold text-zinc-950 transition-all"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 4 }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-2">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-primary/20 p-4 rounded-2xl outline-none text-sm font-bold text-zinc-950 transition-all resize-none"
      />
    </div>
  );
}

function Select({ label, options, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-2">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-primary/20 p-4 rounded-2xl outline-none text-sm font-bold text-zinc-950 transition-all appearance-none"
      >
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function CardSelect({ label, active, onClick, icon: Icon }: any) {
  return (
    <div
      onClick={onClick}
      className={`
        p-6 rounded-[24px] flex flex-col items-center gap-4 cursor-pointer transition-all border-2
        ${active ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10' : 'border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-zinc-200'}
      `}
    >
      <Icon size={32} strokeWidth={active ? 2.5 : 2} />
      <span className="text-[9px] font-black uppercase tracking-widest text-center">{label}</span>
    </div>
  );
}

function DropZone({ label, value, onChange }: { label: string, value?: string, onChange?: (urls: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const newUrls = data.urls.join(',');
        const updatedValue = value ? `${value},${newUrls}` : newUrls;
        if (onChange) onChange(updatedValue);
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const fileCount = value ? value.split(',').filter(Boolean).length : 0;

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group relative ${
        uploading ? 'bg-zinc-50 border-primary' : 'border-zinc-200 hover:bg-zinc-50 hover:border-primary'
      }`}
    >
      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleUpload}
        disabled={uploading}
      />
      <UploadCloud size={32} className={`transition-colors ${uploading ? 'text-primary animate-bounce' : 'text-zinc-300 group-hover:text-primary'}`} />
      <div className="text-center">
        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-950 transition-colors block">
          {uploading ? 'Uploading...' : label}
        </span>
        {fileCount > 0 && (
          <span className="text-[8px] font-bold text-emerald-600 uppercase mt-1 block">
            {fileCount} files attached
          </span>
        )}
      </div>
    </div>
  );
}

function CheckBox({ label, checked, onChange }: any) {
  return (
    <label className="flex items-center gap-5 p-6 bg-zinc-50 rounded-[28px] border border-zinc-100 cursor-pointer hover:bg-zinc-100 transition-all group">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-7 h-7 rounded-xl border-zinc-300 text-primary focus:ring-primary focus:ring-offset-zinc-50 transition-all"
      />
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-950 leading-relaxed">{label}</span>
    </label>
  );
}
