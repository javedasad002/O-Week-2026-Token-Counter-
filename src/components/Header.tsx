import React from 'react';
import {
  LogIn,
  LogOut,
  Wifi,
  WifiOff,
  ShieldCheck,
  User,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  isOnline: boolean;
  currentUser: FirebaseUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  currentUser,
  onOpenLogin,
  onLogout,
}) => {
  return (
    <header className="bg-gradient-to-r from-brand-purple via-brand-purple-dark to-brand-blue text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-white/20 text-white font-bold text-xs uppercase px-2.5 py-1 rounded-full tracking-wider backdrop-blur-sm border border-white/20">
                Official Orientation
              </span>

              <div
                role="status"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-colors ${
                  isOnline
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                    : 'bg-rose-500/20 text-rose-200 border border-rose-400/30 animate-pulse'
                }`}
              >
                {isOnline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block mr-1" />
                    <Wifi size={13} className="text-emerald-300" />
                    <span>Live Sync</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={13} className="text-rose-300" />
                    <span>Offline / Reconnecting</span>
                  </>
                )}
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-brand-pink-light">
              O'Week 2026 Token Counter
            </h1>

            <p className="text-brand-light-blue text-sm sm:text-base font-medium mt-0.5">
              Department Token Management & Live Audience System
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto bg-white/10 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
            {currentUser ? (
              <div className="flex items-center gap-3 pl-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-pink/30 flex items-center justify-center text-white border border-brand-pink/50">
                    <User size={16} />
                  </div>

                  <div className="text-left leading-tight pr-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-white/70 font-medium">
                        Authorized Staff
                      </span>
                      <ShieldCheck
                        size={12}
                        className="text-emerald-400"
                      />
                    </div>

                    <span className="text-xs font-semibold text-white max-w-[150px] truncate block">
                      {currentUser.email}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="bg-white/15 hover:bg-rose-500/80 text-white font-medium text-xs py-2 px-3 rounded-xl transition duration-200 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-rose-400 active:scale-95"
                  title="Logout"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/80 px-2 font-medium">
                  Read-Only View
                </span>

                <button
                  onClick={onOpenLogin}
                  className="bg-white hover:bg-brand-light-blue text-brand-purple-dark font-bold text-xs py-2 px-4 rounded-xl shadow-md transition duration-200 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-white active:scale-95"
                >
                  <LogIn size={14} />
                  <span>Staff Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
