import React from 'react';
import { ALL_DEPARTMENTS, DepartmentCounter } from '../types';

interface StatisticsProps {
  counters: Record<string, DepartmentCounter>;
  activeCount: number;
}

export default function Statistics({ counters, activeCount }: StatisticsProps): React.ReactElement {
  // Calculate total across all six defined departments in Firestore
  const totalTokens = ALL_DEPARTMENTS.reduce((sum, dept) => {
    return sum + (counters[dept.id]?.value || 0);
  }, 0);

  // Find the leading department
  let highestDept = '-';
  let highestVal = -1;

  ALL_DEPARTMENTS.forEach((dept) => {
    const val = counters[dept.id]?.value || 0;
    if (val > highestVal) {
      highestVal = val;
      highestDept = dept.name;
    }
  });

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-[#B6CDD8]/40">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C63A5] mb-4">
        Live Orientation Statistics
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Tokens (All 6 departments) */}
        <div className="bg-[#EEF1F2]/60 p-4 rounded-lg border border-[#B6CDD8]/30">
          <span className="block text-xs font-medium text-[#5C63A5]">
            Total Tokens Issued (All Departments)
          </span>
          <span className="text-2xl font-black text-[#0B3D5C]">
            {totalTokens.toLocaleString()}
          </span>
        </div>

        {/* Active Display Count */}
        <div className="bg-[#EEF1F2]/60 p-4 rounded-lg border border-[#B6CDD8]/30">
          <span className="block text-xs font-medium text-[#5C63A5]">
            Active Counters
          </span>
          <span className="text-2xl font-black text-[#4A3A8C]">
            {activeCount} / 6
          </span>
        </div>

        {/* Leading Department */}
        <div className="bg-[#EEF1F2]/60 p-4 rounded-lg border border-[#B6CDD8]/30">
          <span className="block text-xs font-medium text-[#5C63A5]">
            Leading Department
          </span>
          <span className="text-2xl font-black text-[#471F73]">
            {highestVal > 0 ? `${highestDept} (${highestVal})` : 'None yet'}
          </span>
        </div>
      </div>
    </div>
  );
}
