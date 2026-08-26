import React from 'react';
import { User } from 'firebase/auth';

interface HeaderProps {
  user: User | null;
  isOnline: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export default function Header({ user, isOnline, onOpenLogin, onLogout }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-[#0B3D5C] via-[#4A3A8C] to-[#471F73] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/20">
              <span className="text-xl">🎟️</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight">
                  O'Week 2026 Token Counter
                </h1>
                <span className="bg-white/20 text-[#EEF1F2] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Official Orientation
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="text-xs text-[#B6CDD8] font-medium">
                  {isOnline ? 'Live Firestore Sync' : 'Offline Mode'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                <div className="text-right">
                  <span className="block text-xs font-bold text-white">Authorized Staff</span>
                  <span className="block text-[11px] text-[#B6CDD8] max-w-[140px] truncate">
                    {user.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-2.5 py-1 text-xs font-bold bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-4 py-2 text-xs font-bold bg-white text-[#0B3D5C] hover:bg-[#EEF1F2] rounded-lg shadow transition-colors"
              >
                Staff Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
