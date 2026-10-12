import React from 'react';
import { 
  Tag, 
  Wind, 
  Zap, 
  Droplet, 
  Hammer, 
  Sparkles, 
  Wrench, 
  Paintbrush, 
  ShieldCheck 
} from 'lucide-react';

interface RateCardSectionProps {
  currentLang: 'en' | 'ur';
}

const RATES = [
  {
    icon: Wind,
    category: 'AC & Cooling',
    service: 'General AC Service & Chemical Jet Wash',
    estimatedPrice: 'Rs. 1,500 – 2,500',
    typicalDuration: '45–60 mins',
  },
  {
    icon: Wind,
    category: 'AC & Cooling',
    service: 'Refrigerant Gas Refill (R410/R32/R22)',
    estimatedPrice: 'Rs. 3,500 – 5,500',
    typicalDuration: '1 hour',
  },
  {
    icon: Zap,
    category: 'Electrical',
    service: 'Electrician Home Inspection / Visit Fee',
    estimatedPrice: 'Rs. 500 – 800',
    typicalDuration: '30 mins',
  },
  {
    icon: Zap,
    category: 'Electrical',
    service: 'Breaker / Switchboard / Chandelier Wiring',
    estimatedPrice: 'Rs. 800 – 1,800',
    typicalDuration: '1–2 hours',
  },
  {
    icon: Droplet,
    category: 'Plumbing',
    service: 'Tap / Mixer / Shower Leakage Repair',
    estimatedPrice: 'Rs. 600 – 1,200',
    typicalDuration: '30–45 mins',
  },
  {
    icon: Droplet,
    category: 'Plumbing',
    service: 'Geyser & Water Motor Installation',
    estimatedPrice: 'Rs. 1,500 – 3,000',
    typicalDuration: '1–2 hours',
  },
  {
    icon: Hammer,
    category: 'Carpentry',
    service: 'Door Lock / Handle / Hinge Replacement',
    estimatedPrice: 'Rs. 700 – 1,400',
    typicalDuration: '45 mins',
  },
  {
    icon: Paintbrush,
    category: 'Painting',
    service: 'Interior Wall Touch-up & Seepage Sealing',
    estimatedPrice: 'Rs. 25–45 / sq ft',
    typicalDuration: 'Custom',
  },
];

export const RateCardSection: React.FC<RateCardSectionProps> = ({ currentLang }) => {
  const isUrdu = currentLang === 'ur';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
            <Tag className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isUrdu ? 'شفاف ریٹس' : 'Fair Market Pricing'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0b3b38]">
            {isUrdu ? 'سروسز کے متوقع چارجز (ریٹ لسٹ)' : 'Standard Service Rate Card'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            {isUrdu
              ? 'پاکستان کے بڑے شہروں میں مستند کاریگروں کے اوسط مارکیٹ ریٹس کا تخمینہ۔ حتمی قیمت کام کی نوعیت پر منحصر ہو سکتی ہے۔'
              : 'Estimated transparent rates across Lahore, Karachi, and Islamabad to ensure fair pricing with no hidden charges.'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Pay directly to craftsman after satisfactory completion</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {RATES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-teal-700/30 hover:bg-white hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-teal-100/50 flex items-center justify-center text-teal-800">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-800 leading-snug min-h-[36px]">
                  {item.service}
                </h4>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Estimated:</span>
                  <span className="text-sm font-black text-emerald-800">{item.estimatedPrice}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">{item.typicalDuration}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
