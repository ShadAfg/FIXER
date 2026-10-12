import React from 'react';
import { Wrench, LogIn, LogOut, CheckCircle2, ShieldCheck, Inbox } from 'lucide-react';
import type { User } from '../lib/firebase';
import { isUserAdmin } from '../lib/inquiryService';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenMyInquiries: () => void;
  inquiryCount: number;
  currentLang: 'en' | 'ur';
  onToggleLang: (lang: 'en' | 'ur') => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogin,
  onLogout,
  onOpenMyInquiries,
  inquiryCount,
  currentLang,
  onToggleLang,
}) => {
  const isAdmin = isUserAdmin(user);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-teal-900/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <a
            href="https://fixer-pak.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group"
            title="Visit live FIXER site"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0b3b38] flex items-center justify-center text-amber-400 shadow-md group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black tracking-tight text-[#0b3b38]">FIXER</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse"></span>
              </div>
              <p className="text-[11px] font-semibold text-emerald-800 tracking-wider uppercase -mt-1 hidden sm:block">
                {currentLang === 'ur' ? 'ہر ہنر۔ ایک کلک۔ حل۔' : 'Every skill. One click. Fixed.'}
              </p>
            </div>
          </a>
        </div>

        {/* Right Navigation & Auth Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => onToggleLang('en')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                currentLang === 'en'
                  ? 'bg-white text-[#0b3b38] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onToggleLang('ur')}
              className={`px-2.5 py-1 rounded-md font-['Noto_Nastaliq_Urdu',sans-serif] transition-all ${
                currentLang === 'ur'
                  ? 'bg-white text-[#0b3b38] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              اردو
            </button>
          </div>

          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenMyInquiries}
                className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0b3b38]/5 text-[#0b3b38] hover:bg-[#0b3b38]/10 transition-colors border border-teal-900/10 cursor-pointer"
                title="View your submitted inquiries"
              >
                <Inbox className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">
                  {isAdmin ? 'All Inquiries' : 'My Inquiries'}
                </span>
                {inquiryCount > 0 && (
                  <span className="bg-amber-500 text-teal-950 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full shadow-xs">
                    {inquiryCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-teal-700/20 shadow-xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-teal-800 text-amber-300 flex items-center justify-center font-bold text-xs">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}

                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                    {user.displayName || user.email?.split('@')[0]}
                    {isAdmin && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold">
                        <ShieldCheck className="w-2.5 h-2.5" /> Admin
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                    {user.email}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0b3b38] text-white hover:bg-[#12534e] text-xs font-bold shadow-sm transition-all hover:shadow cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>Sign in with Google</span>
            </button>
          )}

          {/* External site link */}
          <a
            href="https://fixer-pak.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-[#0b3b38] hover:text-teal-700 underline underline-offset-2 ml-1"
          >
            Visit fixer-pak.netlify.app ↗
          </a>
        </div>
      </div>
    </header>
  );
};
