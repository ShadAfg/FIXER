import React from 'react';
import { 
  Star, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  Phone, 
  Calendar, 
  MessageCircle,
  Clock,
  Tag
} from 'lucide-react';
import type { Provider } from '../types';

interface ProviderCardProps {
  provider: Provider;
  onBook: (provider: Provider) => void;
  currentLang: 'en' | 'ur';
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onBook,
  currentLang,
}) => {
  const isUrdu = currentLang === 'ur';

  // Construct pre-filled WhatsApp message
  const whatsappNumber = provider.whatsapp || provider.phone.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(
    isUrdu
      ? `السلام علیکم! میں نے آپ کا پروفائل FIXER پر دیکھا ہے۔ مجھے ${provider.category} سے متعلق کام ہے۔ کیا آپ دستیاب ہیں؟`
      : `Assalam-o-Alaikum ${provider.name}, I found your profile on FIXER Pakistan for ${provider.category} in ${provider.city}. Are you available for a job?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber.startsWith('92') ? whatsappNumber : '92' + whatsappNumber.replace(/^0/, '')}?text=${encodedMsg}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between group hover:border-teal-700/40 relative overflow-hidden">
      {/* Emergency Strip */}
      {provider.isEmergencyAvailable && (
        <div className="absolute top-0 right-0 bg-amber-400 text-teal-950 font-black text-[10px] uppercase px-3 py-0.5 rounded-bl-lg flex items-center gap-1 shadow-xs">
          <Zap className="w-3 h-3 fill-teal-950" />
          <span>{isUrdu ? 'ہنگامی سروس دستیاب' : '24/7 Urgent'}</span>
        </div>
      )}

      <div>
        {/* Header: Photo, Name, Rating */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={provider.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80'}
              alt={provider.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-xs group-hover:scale-105 transition-transform"
            />
            {provider.isVerified && (
              <div 
                title="Verified Craftsman"
                className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-900/10">
                {provider.category}
              </span>
              {provider.experienceYears && (
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {provider.experienceYears}
                </span>
              )}
            </div>

            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mt-1 truncate">
              {provider.businessName || provider.name}
            </h3>

            {provider.businessName && (
              <p className="text-xs text-slate-500 truncate -mt-0.5">{provider.name}</p>
            )}

            {/* Ratings & Price */}
            <div className="flex items-center gap-3 mt-1.5 text-xs">
              <div className="flex items-center gap-1 font-bold text-slate-800">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{provider.rating}</span>
                <span className="text-slate-400 font-normal">({provider.reviewCount})</span>
              </div>

              {provider.basePrice && (
                <div className="flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200/60">
                  <Tag className="w-3 h-3 text-emerald-600" />
                  <span>{provider.basePrice}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location & Description */}
        <div className="mt-3.5 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium mb-2">
            <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <span className="font-bold text-slate-800">{provider.city}</span>
            {provider.area && (
              <>
                <span className="text-slate-300">•</span>
                <span className="truncate">{provider.area}</span>
              </>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
            {provider.description}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        {/* WhatsApp Direct Chat */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#25D366] text-white hover:bg-[#20ba59] font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>{isUrdu ? 'واٹس ایپ' : 'WhatsApp'}</span>
        </a>

        {/* Direct Booking Modal Button */}
        <button
          onClick={() => onBook(provider)}
          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0b3b38] text-white hover:bg-[#12534e] font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>{isUrdu ? 'بکنگ کریں' : 'Book Pro'}</span>
        </button>
      </div>
    </div>
  );
};
