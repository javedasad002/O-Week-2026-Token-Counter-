import React from 'react';
import { DepartmentCounter } from '../types';

interface CounterCardProps {
  counter: DepartmentCounter;
  isAuthenticated: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onRequestReset: () => void;
  onRequireLogin: () => void;
}

export default function CounterCard({
  counter,
  isAuthenticated,
  onIncrement,
  onDecrement,
  onRequestReset,
  onRequireLogin,
}: CounterCardProps): React.ReactElement {
  const handleAction = (action: () => void) => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }
    action();
  };

  const isZeroOrLess = counter.value <= 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#B6CDD8]/50 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-[#0B3D5C] to-[#4A3A8C] p-4 text-white">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-2xl font-black tracking-tight">{counter.name}</span>
            <p className="text-xs text-[#B6CDD8] font-medium mt-0.5 line-clamp-1">
              {counter.fullName}
            </p>
          </div>
          {!isAuthenticated && (
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-semibold text-[#EEF1F2]">
              Read-Only
            </span>
          )}
        </div>
      </div>

      {/* Main Counter Display */}
      <div className="p-6 text-center">
        <span className="text-6xl font-black text-[#0B3D5C] tracking-tight block">
          {counter.value}
        </span>
        <span className="text-xs text-[#5C63A5] font-semibold uppercase tracking-wider mt-1 block">
          Tokens Issued
        </span>
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-[#EEF1F2]/40 border-t border-[#B6CDD8]/30 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleAction(onIncrement)}
            className="w-full py-2.5 bg-[#4A3A8C] hover:bg-[#471F73] text-white text-sm font-bold rounded-lg transition-colors shadow-sm active:scale-[0.98]"
          >
            +1 TOKEN
          </button>
          <button
            type="button"
            onClick={() => handleAction(onDecrement)}
            disabled={isZeroOrLess}
            className={`w-full py-2.5 border text-sm font-bold rounded-lg transition-colors active:scale-[0.98] ${
              isZeroOrLess
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                : 'bg-white border-[#B6CDD8] hover:bg-[#EEF1F2] text-[#0B3D5C]'
            }`}
          >
            −1 Token
          </button>
        </div>

        <button
          type="button"
          onClick={() => handleAction(onRequestReset)}
          className="w-full py-1.5 text-xs text-red-600 hover:text-red-700 font-semibold hover:bg-red-50 rounded transition-colors"
        >
          Reset Counter
        </button>
      </div>
    </div>
  );
}
