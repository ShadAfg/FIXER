import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQSectionProps {
  currentLang: 'en' | 'ur';
}

const FAQS_EN = [
  {
    q: 'How fast will someone respond to my inquiry?',
    a: 'Our support desk and local area coordinators review every inquiry within 2 hours during normal working hours (9 AM - 9 PM PKT). For emergency repairs, mention "Emergency" in the subject for expedited routing.',
  },
  {
    q: 'Can I register as a skilled technician or service provider?',
    a: 'Yes! Select "Register as Service Provider" in the inquiry topic. Please mention your specific trade (plumbing, electrical, AC repair, carpentry), your city/area, and years of experience. We will get in touch to verify your profile.',
  },
  {
    q: 'Which cities in Pakistan are currently covered by FIXER?',
    a: 'FIXER connects customers across major metropolitan cities including Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, and Peshawar, with active expansion across Punjab, Sindh, and KPK.',
  },
  {
    q: 'Is submitting an inquiry completely free?',
    a: 'Yes, submitting an inquiry, asking for estimates, or asking questions through this form is 100% free with no commitment.',
  },
];

const FAQS_UR = [
  {
    q: 'درخواست بھیجنے کے بعد کتنا وقت لگے گا؟',
    a: 'ہماری سپورٹ ٹیم معمول کے اوقات (صبح 9 تا رات 9 بجے) کے دوران 2 گھنٹے کے اندر جواب دیتی ہے۔ ہنگامی کام کے لیے "Emergency" منتخب کریں۔',
  },
  {
    q: 'کیا میں بطور ہنرمند یا کاریگر رجسٹریشن کروا سکتا ہوں؟',
    a: 'جی بالکل! موضوع میں "Register as Service Provider" منتخب کریں اور اپنا ہنر، شہر اور تجربہ درج کریں۔ ہم تصدیق کے لیے آپ سے رابطہ کریں گے۔',
  },
  {
    q: 'فکسر کن شہروں میں کام کر رہا ہے؟',
    a: 'فکسر فی الوقت لاہور، کراچی، اسلام آباد، راولپنڈی، فیصل آباد، ملتان، اور پشاور سمیت پاکستان کے بڑے شہروں میں خدمات فراہم کر رہا ہے۔',
  },
  {
    q: 'کیا سوال یا انکوائری بھیجنے کا کوئی خرچ ہے؟',
    a: 'نہیں! فکسر فارم کے ذریعے رابطہ اور کوٹیشن معلوم کرنا بالکل مفت ہے۔',
  },
];

export const FAQSection: React.FC<FAQSectionProps> = ({ currentLang }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const isUrdu = currentLang === 'ur';
  const faqs = isUrdu ? FAQS_UR : FAQS_EN;

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="bg-slate-50/70 rounded-3xl p-6 sm:p-10 border border-slate-200/80">
      <div className="flex items-center gap-2 mb-2 text-[#0b3b38]">
        <HelpCircle className="w-5 h-5 text-amber-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          {isUrdu ? 'اکثر پوچھے گئے سوالات' : 'Frequently Asked Questions'}
        </span>
      </div>

      <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-6">
        {isUrdu ? 'عام معلومات اور رہنمائی' : 'Need Quick Answers?'}
      </h3>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-slate-800 text-sm hover:text-[#0b3b38] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                    isOpen ? 'rotate-180 text-[#0b3b38]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
