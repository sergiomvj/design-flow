import React from 'react';
import { Metric } from '../types';

interface StatCardsProps {
  metrics: Metric[];
}

export function StatCards({ metrics }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {metrics.map((metric) => (
        <div 
          key={metric.label} 
          className="bg-white border border-zinc-100 rounded-[32px] p-8 transition-all duration-300 hover:bg-zinc-50 group relative overflow-hidden shadow-sm"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 group-hover:text-primary transition-colors">
            {metric.label}
          </p>
          <div className="flex items-baseline gap-1">
            <p className={`text-4xl font-black tracking-tighter ${metric.label === 'ACTIVE QUEUE' ? 'text-primary' : 'text-zinc-950'}`}>
              {metric.value.toString().padStart(2, '0')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
