import React from 'react';
import { Mail, Phone, MapPin, Globe, Clock, ShieldCheck, UserCheck } from 'lucide-react';

interface ContactInfoCardsProps {
  currentLang: 'en' | 'ur';
}

export const ContactInfoCards: React.FC<ContactInfoCardsProps> = ({ currentLang }) => {
  const isUrdu = currentLang === 'ur';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Developer & Platform Lead Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0b3b38] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <UserCheck className="w-6 h-6 text-[#0b3b38]" />
        </div>
        <h3 className="text-base font-extrabold text-slate-800">
          {isUrdu ? 'پلیٹ فارم ڈویلپر' : 'Platform Engineering'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {isUrdu ? 'ڈویلپمنٹ اور اے آئی سسٹمز' : 'Built & Maintained by Shadman Akhtar'}
        </p>
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-semibold text-slate-800">Developer:</span>
            <span>Shadman Akhtar</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-semibold text-slate-800">Role:</span>
            <span>AI Engineer & Data Scientist</span>
          </div>
        </div>
      </div>

      {/* Official Contact & Direct Email */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-base font-extrabold text-slate-800">
          {isUrdu ? 'براہِ راست ای میل' : 'Direct Email Support'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {isUrdu ? 'کسی بھی سوال یا پارٹنرشپ کے لیے رابطہ کریں' : 'For business inquiries & assistance'}
        </p>
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
          <a
            href="mailto:akhtarshadman044@gmail.com"
            className="block font-semibold text-[#0b3b38] hover:underline truncate"
          >
            akhtarshadman044@gmail.com
          </a>
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Response within 2 hours</span>
          </div>
        </div>
      </div>

      {/* Live FIXER Platform */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Globe className="w-6 h-6" />
        </div>
        <h3 className="text-base font-extrabold text-slate-800">
          {isUrdu ? 'لائیو پلیٹ فارم' : 'Production Website'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {isUrdu ? 'آن ڈیمانڈ کاریگر اور ہنرمند سروسز' : 'Explore on-demand craftsmen & providers'}
        </p>
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
          <a
            href="https://fixer-pak.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-[#0b3b38] hover:underline"
          >
            fixer-pak.netlify.app ↗
          </a>
          <p className="text-slate-500">
            Lahore, Karachi, Islamabad & across Pakistan
          </p>
        </div>
      </div>
    </div>
  );
};
