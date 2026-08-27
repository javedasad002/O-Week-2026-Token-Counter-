import React from 'react';
import { Layers, Activity, Clock } from 'lucide-react';
import { DepartmentCounter } from '../types';

interface StatisticsProps {
  counters: Record<string, DepartmentCounter>;
  lastUpdated: string;
}

export const Statistics: React.FC<StatisticsProps> = ({ counters, lastUpdated }) => {
  const totalTokens = Object.values(counters).reduce((acc, curr) => acc + (curr.value || 0), 0);
  const activeDepartments = Object.keys(counters).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Tokens Issued</p>
          <p className="text-3xl sm:text-4xl font-black text-brand-purple mt-1 tracking-tight">
            {totalTokens.toLocaleString()}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 flex items-center justify-center text-brand-purple">
          <Layers size={24} />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Counters</p>
          <p className="text-3xl sm:text-4xl font-black text-brand-blue mt-1 tracking-tight">
            {activeDepartments}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
          <Activity size={24} />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Last Database Sync</p>
          <p className="text-lg sm:text-xl font-bold text-slate-700 mt-2 truncate max-w-[180px]">
            {lastUpdated || 'Synchronized'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
          <Clock size={24} />
        </div>
      </div>
    </div>
  );
};
