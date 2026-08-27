import { FieldValue, Timestamp } from 'firebase/firestore';

export interface DepartmentCounter {
  id: string;
  name: string;
  fullName: string;
  value: number;
  updatedAt?: Timestamp | FieldValue;
  updatedBy?: string;
}

export interface DepartmentMeta {
  id: string;
  name: string;
  fullName: string;
}

export const ALL_DEPARTMENTS: readonly DepartmentMeta[] = [
  { id: 'EE', name: 'EE', fullName: 'Electrical Engineering' },
  { id: 'CIS', name: 'CIS', fullName: 'Computer & Information Systems' },
  { id: 'ME', name: 'ME', fullName: 'Mechanical Engineering' },
  { id: 'MME', name: 'MME', fullName: 'Materials & Metallurgical Engineering' },
  { id: 'CHE', name: 'CHE', fullName: 'Chemical Engineering' },
  { id: 'DPAM', name: 'DPAM', fullName: 'Department of Physics & Applied Math' },
] as const;
...............................................................................................
Components Statisdtics.tsx
get from old chat


.....................................................................
src/components/CounterCard.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Minus, RotateCcw, Lock } from 'lucide-react';
import { DepartmentCounter } from '../types';

interface CounterCardProps {
  counter: DepartmentCounter;
  isAuthorized: boolean;
  onIncrement: (id: string) => Promise<void>;
  onDecrement: (id: string) => Promise<void>;
  onRequestReset: (id: string, name: string) => void;
  onRequireAuth: () => void;
}

export const CounterCard: React.FC<CounterCardProps> = ({
  counter,
  isAuthorized,
  onIncrement,
  onDecrement,
  onRequestReset,
  onRequireAuth,
}) => {
  const [animate, setAnimate] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 300);
    return () => clearTimeout(timer);
  }, [counter.value]);

  const handleAction = async (actionType: 'inc' | 'dec' | 'reset') => {
    if (!isAuthorized) {
      onRequireAuth();
      return;
    }

    try {
      setLoadingAction(actionType);
      if (actionType === 'inc') await onIncrement(counter.id);
      if (actionType === 'dec') await onDecrement(counter.id);
      if (actionType === 'reset') onRequestReset(counter.id, counter.name);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200/90 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-brand-purple/40 group">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink opacity-80 group-hover:opacity-100 transition-opacity" />

      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purple-dark bg-brand-purple/10 px-3 py-1 rounded-full">
              Dept
            </span>
            <h2 className="text-2xl font-black text-slate-800 mt-2 tracking-tight">
              {counter.name}
            </h2>
            <p className="text-xs font-medium text-slate-500 line-clamp-1" title={counter.fullName}>
              {counter.fullName}
            </p>
          </div>
          {!isAuthorized && (
            <span title="Login required to change values" className="text-slate-400 bg-slate-100 p-2 rounded-xl">
              <Lock size={16} />
            </span>
          )}
        </div>

        <div className="my-6 text-center py-4 bg-gradient-to-b from-slate-50 to-brand-grey/50 rounded-2xl border border-slate-100 shadow-inner">
          <div
            className={`text-6xl sm:text-7xl font-black tracking-tight text-slate-900 transition-transform duration-200 ${
              animate ? 'scale-110 text-brand-purple' : 'scale-100'
            }`}
          >
            {counter.value}
          </div>
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            Current Count
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => handleAction('inc')}
          disabled={loadingAction === 'inc'}
          aria-label={`Increment ${counter.name} token by 1`}
          className="w-full bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark active:scale-[0.98] text-white font-extrabold text-lg py-4 px-6 rounded-2xl shadow-lg shadow-brand-purple/25 flex items-center justify-center gap-2 transition duration-150 focus:outline-none focus:ring-4 focus:ring-brand-purple/30 disabled:opacity-60"
        >
          <Plus size={24} strokeWidth={3} />
          <span>+1 TOKEN</span>
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => handleAction('dec')}
            disabled={counter.value <= 0 || loadingAction === 'dec'}
            aria-label={`Decrement ${counter.name} token by 1`}
            className="w-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-sm py-3 px-3 rounded-xl flex items-center justify-center gap-1 transition duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <Minus size={16} strokeWidth={2.5} />
            <span>−1 Token</span>
          </button>

          <button
            onClick={() => handleAction('reset')}
            disabled={loadingAction === 'reset'}
            aria-label={`Reset ${counter.name} token counter`}
            className="w-full bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-600 font-bold text-sm py-3 px-3 rounded-xl flex items-center justify-center gap-1 transition duration-150 focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
