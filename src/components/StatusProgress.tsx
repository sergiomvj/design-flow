import React from 'react';
import { RequestStatus } from '../types';

const steps: { label: RequestStatus; display: string }[] = [
  { label: 'RECEIVED', display: 'Received' },
  { label: 'CREATING', display: 'Creating' },
  { label: 'REVIEW', display: 'Review' },
  { label: 'APPROVAL', display: 'Approval' },
  { label: 'PRODUCTION', display: 'Production' },
  { label: 'COMPLETED', display: 'Completed' },
];

interface StatusProgressProps {
  currentStatus: RequestStatus;
}

export function StatusProgress({ currentStatus }: StatusProgressProps) {
  const currentIndex = steps.findIndex(s => s.label === currentStatus);

  return (
    <div className="bg-white border border-zinc-100 p-8 rounded-[32px] shadow-sm overflow-hidden relative mb-12">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
      
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-xl font-black text-zinc-950 tracking-tight uppercase leading-none">Status Flow</h3>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Real-time ledger tracking</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
          <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active System</span>
        </div>
      </div>

      <div className="relative pt-2">
        <div className="flex justify-between relative z-10">
          {steps.map((step, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <div key={step.label} className="flex flex-col items-center gap-3 group relative">
                <div 
                  className={`w-12 h-12 rounded-[18px] flex items-center justify-center font-black text-xs transition-all duration-500 border-2 ${
                    isActive 
                      ? 'signature-gradient border-white/20 text-white scale-110 shadow-lg' 
                      : isCompleted 
                        ? 'bg-primary/10 border-primary/20 text-primary' 
                        : 'bg-zinc-50 border-zinc-100 text-zinc-300'
                  }`}
                >
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                <div className="text-center">
                  <span className={`text-[9px] font-black tracking-widest uppercase whitespace-nowrap transition-colors duration-500 block ${
                    isActive ? 'text-primary' : isCompleted ? 'text-zinc-600' : 'text-zinc-300'
                  }`}>
                    {step.display}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Connection Line */}
        <div className="absolute top-8 left-0 w-full h-[2px] bg-zinc-100 -z-0">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-out shadow-sm" 
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
