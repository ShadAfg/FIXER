import React, { useState, useEffect } from 'react';
import { 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Wrench, 
  MessageSquare, 
  Sparkles, 
  LogIn, 
  Clock, 
  ArrowRight,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import type { User } from '../lib/firebase';
import type { Inquiry, InquiryFormData, FormErrors } from '../types';
import { submitInquiry } from '../lib/inquiryService';

interface ContactFormProps {
  user: User | null;
  onLogin: () => void;
  onSuccessSubmission?: (inquiry: Inquiry) => void;
  currentLang: 'en' | 'ur';
}

const CATEGORIES = [
  'AC & Cooling',
  'Electrical',
  'Plumbing',
  'Carpentry',
  'Auto Repair',
  'Painting & Design',
  'Cleaning',
  'Lock & Security',
  'Construction',
  'Agriculture & Farming',
  'Packers & Movers',
  'Other / General Support'
];

const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Gujranwala',
  'Sialkot',
  'Quetta',
  'Hyderabad',
  'Other / Nationwide'
];

const QUICK_SUBJECTS = [
  'Emergency Technician Needed',
  'Booking Price Estimate',
  'Register as Service Provider',
  'App Feedback or Bug Report',
  'Partnership / Business Inquiry'
];

export const ContactForm: React.FC<ContactFormProps> = ({
  user,
  onLogin,
  onSuccessSubmission,
  currentLang,
}) => {
  const [formData, setFormData] = useState<InquiryFormData>({
    name: '',
    email: '',
    phone: '',
    category: 'AC & Cooling',
    city: 'Lahore',
    subject: 'Emergency Technician Needed',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedInquiry, setSubmittedInquiry] = useState<Inquiry | null>(null);

  // Auto-fill when Google user logs in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.displayName || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // Validation function
  const validateField = (field: keyof InquiryFormData, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Full name is required.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        if (value.trim().length > 100) return 'Name cannot exceed 100 characters.';
        return undefined;

      case 'email':
        if (!value.trim()) return 'Email address is required.';
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value.trim())) return 'Please enter a valid email address.';
        if (value.trim().length > 150) return 'Email is too long.';
        return undefined;

      case 'phone':
        if (value.trim()) {
          const phoneClean = value.replace(/[\s-]/g, '');
          if (!/^[+]?[0-9]{7,15}$/.test(phoneClean)) {
            return 'Please enter a valid phone number (e.g., 0300-1234567 or +923001234567).';
          }
        }
        return undefined;

      case 'message':
        if (!value.trim()) return 'Please describe your inquiry or project details.';
        if (value.trim().length < 10) return 'Message is too short (min 10 characters).';
        if (value.trim().length > 3000) return 'Message cannot exceed 3,000 characters.';
        return undefined;

      default:
        return undefined;
    }
  };

  const handleBlur = (field: keyof InquiryFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: keyof InquiryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const validateAll = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (['name', 'email', 'phone', 'message'] as (keyof InquiryFormData)[]).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      phone: true,
      category: true,
      city: true,
      subject: true,
      message: true,
    });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitInquiry(formData, user);
      setSubmittedInquiry(result);
      if (onSuccessSubmission) {
        onSuccessSubmission(result);
      }
    } catch (err: unknown) {
      console.error('Failed to submit inquiry:', err);
      setSubmitError(
        err instanceof Error
          ? 'Unable to record your message. Please check your connection and try again.'
          : 'An unexpected error occurred.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedInquiry(null);
    setFormData({
      name: user?.displayName || '',
      email: user?.email || '',
      phone: '',
      category: 'AC & Cooling',
      city: 'Lahore',
      subject: 'Emergency Technician Needed',
      message: '',
    });
    setErrors({});
    setTouched({});
    setSubmitError(null);
  };

  const isUrdu = currentLang === 'ur';

  // If successfully submitted, render confirmation view
  if (submittedInquiry) {
    return (
      <div className="bg-white rounded-3xl border border-teal-900/10 shadow-xl p-8 sm:p-12 max-w-3xl mx-auto overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
            {isUrdu ? 'درخواست موصول ہو گئی ہے' : 'Inquiry Saved to Firestore'}
          </span>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0b3b38]">
            {isUrdu ? 'شکریہ! آپ کی درخواست موصول ہو گئی ہے' : 'Thank You! Your Inquiry Has Been Sent'}
          </h3>

          <p className="text-slate-600 max-w-lg mx-auto text-sm sm:text-base">
            {isUrdu
              ? 'ہم نے آپ کی ای میل پر تصدیقی پیغام بھیج دیا ہے۔ فکسر سپورٹ ٹیم آپ سے جلد از جلد رابطہ کرے گی۔'
              : 'Our team has received your request. An email confirmation has been dispatched to your email address.'}
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold rounded-full">
            <Mail className="w-3.5 h-3.5 text-teal-600" />
            <span>Confirmation sent to: <strong>{submittedInquiry.email}</strong></span>
          </div>
        </div>

        {/* Reference details receipt card */}
        <div className="mt-8 bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-left space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Reference ID</span>
              <p className="font-mono text-xs sm:text-sm font-semibold text-[#0b3b38] select-all">
                {submittedInquiry.id}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Status:</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                ● Pending Review
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Customer:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{submittedInquiry.name}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Email:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{submittedInquiry.email}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Category & Location:</span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {submittedInquiry.category} ({submittedInquiry.city})
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Topic:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{submittedInquiry.subject}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-xs">
            <span className="text-slate-400 font-medium">Message:</span>
            <p className="text-slate-700 italic mt-1 bg-white p-3 rounded-lg border border-slate-200/70 whitespace-pre-wrap">
              "{submittedInquiry.message}"
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleResetForm}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors text-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Send Another Inquiry</span>
          </button>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Hello FIXER Pakistan, I submitted inquiry #${submittedInquiry.id} regarding ${submittedInquiry.category}. Name: ${submittedInquiry.name}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white font-bold hover:bg-[#20ba59] transition-colors text-sm shadow-md cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Follow up via WhatsApp</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-teal-900/10 shadow-xl overflow-hidden relative">
      {/* Top Banner & Header info */}
      <div className="bg-gradient-to-r from-[#0b3b38] to-[#134e4a] text-white p-6 sm:p-10 relative">
        <div className="absolute top-4 right-4 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-medium text-amber-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FIXER Pakistan Support</span>
        </div>

        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-teal-950 font-extrabold text-xs uppercase tracking-wider mb-3">
            {isUrdu ? 'براہِ راست رابطہ' : 'Direct Inquiry'}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            {isUrdu ? 'ہمیں اپنی ضرورت یا سوال بتائیں' : 'Send an Inquiry to FIXER'}
          </h2>
          <p className="mt-2 text-teal-100 text-sm sm:text-base leading-relaxed">
            {isUrdu
              ? 'کارپنٹر، الیکٹریشن، پلمبر، اے سی اور دیگر ہنرمندوں سے متعلق کسی بھی مدد یا سوال کے لیے فارم پر کریں۔'
              : 'Need a technician, pricing quote, or have a question about FIXER? Fill out the form below and we will get back to you promptly.'}
          </p>
        </div>

        {/* User Auth Info Bar */}
        <div className="mt-6 pt-4 border-t border-teal-700/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          {user ? (
            <div className="flex items-center gap-2 text-emerald-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>
                Connected as: <strong className="text-white">{user.displayName || user.email}</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-teal-200">
                Tip: Sign in with Google to keep track of your inquiry replies.
              </span>
              <button
                type="button"
                onClick={onLogin}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-400 text-teal-950 font-bold hover:bg-amber-300 transition-colors shadow-xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Quick Sign In</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-10 space-y-6">
        {submitError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Submission Failed</p>
              <p className="text-xs text-red-700 mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        {/* Quick Topic Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            {isUrdu ? 'موضوع منتخب کریں' : 'Inquiry Topic / Reason'}
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK_SUBJECTS.map((sub) => {
              const isSelected = formData.subject === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => handleChange('subject', sub)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0b3b38] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>

        {/* Name and Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label htmlFor="inquiry-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {isUrdu ? 'آپ کا نام *' : 'Full Name *'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                id="inquiry-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="e.g. Shadman Akhtar"
                maxLength={100}
                required
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-hidden ${
                  touched.name && errors.name
                    ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-slate-300 focus:border-[#0b3b38] focus:ring-2 focus:ring-teal-900/10'
                }`}
              />
            </div>
            {touched.name && errors.name && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="inquiry-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {isUrdu ? 'ای میل ایڈریس *' : 'Email Address *'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="inquiry-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="e.g. akhtarshadman044@gmail.com"
                maxLength={150}
                required
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-hidden ${
                  touched.email && errors.email
                    ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-slate-300 focus:border-[#0b3b38] focus:ring-2 focus:ring-teal-900/10'
                }`}
              />
            </div>
            {touched.email && errors.email && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>
        </div>

        {/* Phone, Category, and City Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Phone / WhatsApp */}
          <div>
            <label htmlFor="inquiry-phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {isUrdu ? 'فون یا واٹس ایپ نمبر' : 'Phone / WhatsApp (Optional)'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="inquiry-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                placeholder="0300-1234567"
                maxLength={30}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-hidden ${
                  touched.phone && errors.phone
                    ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-slate-300 focus:border-[#0b3b38] focus:ring-2 focus:ring-teal-900/10'
                }`}
              />
            </div>
            {touched.phone && errors.phone && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>

          {/* Service Category */}
          <div>
            <label htmlFor="inquiry-category" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {isUrdu ? 'سروس کیٹیگری' : 'Service Category'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Wrench className="w-4 h-4" />
              </div>
              <select
                id="inquiry-category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full pl-10 pr-8 py-3 rounded-xl border border-slate-300 bg-white text-sm focus:border-[#0b3b38] focus:ring-2 focus:ring-teal-900/10 focus:outline-hidden appearance-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* City / Area */}
          <div>
            <label htmlFor="inquiry-city" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {isUrdu ? 'شہر / علاقہ' : 'City / Location'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <select
                id="inquiry-city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full pl-10 pr-8 py-3 rounded-xl border border-slate-300 bg-white text-sm focus:border-[#0b3b38] focus:ring-2 focus:ring-teal-900/10 focus:outline-hidden appearance-none cursor-pointer"
              >
                {PAKISTAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Message Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="inquiry-message" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isUrdu ? 'تفصیل / پیغام *' : 'Inquiry Message / Job Details *'}
            </label>
            <span
              className={`text-[11px] font-mono ${
                formData.message.length > 2800
                  ? 'text-red-600 font-bold'
                  : 'text-slate-400'
              }`}
            >
              {formData.message.length} / 3000
            </span>
          </div>
          <textarea
            id="inquiry-message"
            rows={5}
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            onBlur={() => handleBlur('message')}
            placeholder={
              isUrdu
                ? 'اپنا مسئلہ یا کام تفصیل سے لکھیں (کم از کم 10 حروف)...'
                : 'Please describe the job or question (e.g., My AC in Johar Town Lahore is making a strange sound and leaking water. Need technician inspection tomorrow morning)...'
            }
            maxLength={3000}
            required
            className={`w-full p-4 rounded-xl border text-sm transition-all focus:outline-hidden resize-y ${
              touched.message && errors.message
                ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-slate-300 focus:border-[#0b3b38] focus:ring-2 focus:ring-teal-900/10'
            }`}
          />
          {touched.message && errors.message && (
            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.message}</span>
            </p>
          )}
        </div>

        {/* Submit & Guarantees */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Average response time: <strong>under 2 hours</strong></span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-md cursor-pointer ${
              isSubmitting
                ? 'bg-slate-400 text-white cursor-not-allowed'
                : 'bg-[#ffca28] hover:bg-[#ffc107] text-[#0b3b38] hover:shadow-lg hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0b3b38] border-t-transparent rounded-full animate-spin" />
                <span>Recording to Firestore...</span>
              </>
            ) : (
              <>
                <span>{isUrdu ? 'پیغام بھیجیں' : 'Send Inquiry'}</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
