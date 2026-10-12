import React from 'react';
import { 
  Wrench, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  Inbox, 
  Calendar, 
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import type { User } from '../lib/firebase';
import { isUserAdmin } from '../lib/inquiryService';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenMyInquiries: () => void;
  onOpenBookings: () => void;
  onOpenAddProvider: () => void;
  inquiryCount: number;
  bookingCount: number;
  currentLang: 'en' | 'ur';
  onToggleLang: (lang: 'en' | 'ur') => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogin,
  onLogout,
  onOpenMyInquiries,
  onOpenBookings,
  onOpenAddProvider,
  inquiryCount,
  bookingCount,
  currentLang,
  onToggleLang,
}) => {
  const isAdmin = isUserAdmin(user);
  const isUrdu = currentLang === 'ur';

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
                {isUrdu ? 'ہر ہنر۔ ایک کلک۔ حل۔' : 'Every skill. One click. Fixed.'}
              </p>
            </div>
          </a>
        </div>

        {/* Center / Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={onOpenAddProvider}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#ffca28] hover:bg-[#ffc107] text-[#0b3b38] font-black text-xs shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isUrdu ? '+ اپنا ہنر درج کریں' : '+ Add Your Service'}</span>
          </button>

          <button
            onClick={onOpenBookings}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-[#0b3b38] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>Bookings</span>
            {bookingCount > 0 && (
              <span className="bg-[#0b3b38] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {bookingCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Navigation & Auth Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Add Provider button */}
          <button
            onClick={onOpenAddProvider}
            className="lg:hidden p-2 rounded-lg bg-[#ffca28] text-[#0b3b38] font-bold text-xs"
            title="Add your service"
          >
            <PlusCircle className="w-4 h-4" />
          </button>

          {/* Bookings Tracker Button for Mobile & Desktop */}
          <button
            onClick={onOpenBookings}
            className="lg:hidden p-2 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold relative"
            title="View bookings"
          >
            <Calendar className="w-4 h-4 text-emerald-700" />
            {bookingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#0b3b38] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {bookingCount}
              </span>
            )}
          </button>

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
                title="View your inquiries"
              >
                <Inbox className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">
                  {isAdmin ? 'Inquiries' : 'My Inquiries'}
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

                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                    {user.displayName || user.email?.split('@')[0]}
                    {isAdmin && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold">
                        <ShieldCheck className="w-2.5 h-2.5" /> Admin
                      </span>
                    )}
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
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0b3b38] text-white hover:bg-[#12534e] text-xs font-bold shadow-sm transition-all hover:shadow cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Sign in with Google</span>
              <span className="sm:hidden">Sign in</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
