import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Zap,
  MessageCircle,
  FileText
} from 'lucide-react';
import type { Provider, Booking } from '../types';
import { createBooking } from '../lib/bookingService';

interface BookingModalProps {
  provider: Provider | null;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
  currentLang: 'en' | 'ur';
}

export const BookingModal: React.FC<BookingModalProps> = ({
  provider,
  onClose,
  onBookingSuccess,
  currentLang,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [area, setArea] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning (9 AM - 1 PM)');
  const [jobDetails, setJobDetails] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  if (!provider) return null;

  const isUrdu = currentLang === 'ur';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || customerName.trim().length < 2) {
      setError('Please provide your name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 7) {
      setError('Please provide a valid phone or WhatsApp number.');
      return;
    }
    if (!jobDetails.trim() || jobDetails.trim().length < 5) {
      setError('Please describe what needs to be fixed.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newBooking = await createBooking({
        providerId: provider.id,
        providerName: provider.businessName || provider.name,
        providerCategory: provider.category,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: customerPhone.trim(),
        city: provider.city,
        area: area.trim() || provider.area,
        preferredDate: preferredDate || new Date().toISOString().split('T')[0],
        preferredTime,
        jobDetails: jobDetails.trim(),
        isUrgent,
      });

      setConfirmedBooking(newBooking);
      onBookingSuccess(newBooking);
    } catch (err: unknown) {
      console.error('Failed to create booking:', err);
      setError('Unable to save booking to Firestore. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#0b3b38] to-[#134e4a] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={provider.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80'}
              alt={provider.name}
              className="w-12 h-12 rounded-xl object-cover border border-white/20 shadow-xs"
            />
            <div>
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                {isUrdu ? 'بکنگ فارم' : 'Book Professional'}
              </span>
              <h3 className="text-lg font-bold truncate max-w-xs sm:max-w-sm">
                {provider.businessName || provider.name}
              </h3>
              <p className="text-xs text-teal-200">
                {provider.category} • {provider.city}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmation Screen */}
        {confirmedBooking ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
              Saved in Firestore Database
            </span>

            <h3 className="text-2xl font-extrabold text-[#0b3b38]">
              {isUrdu ? 'آپ کی بکنگ درج ہو گئی ہے!' : 'Booking Request Sent!'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Your request has been saved for <strong>{provider.businessName || provider.name}</strong>. Reference: <code className="font-mono text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded">#{confirmedBooking.id}</code>
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <strong className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Requested (Pending Provider)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="text-slate-800 font-semibold">{provider.city} ({confirmedBooking.area || provider.area})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contact:</span>
                <span className="text-slate-800 font-semibold">{confirmedBooking.customerPhone}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/${provider.whatsapp || provider.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Assalam-o-Alaikum ${provider.name}, I just booked your service on FIXER! Booking ID: #${confirmedBooking.id}. Details: ${confirmedBooking.jobDetails}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] text-white font-bold text-xs shadow-md hover:bg-[#20ba59] transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Notify via WhatsApp</span>
              </a>

              <button
                onClick={onClose}
                className="py-3 px-6 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Emergency Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {isUrdu ? 'ہنگامی ضرورت (فوری کاریگر)' : 'Urgent Emergency Job?'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Technician will prioritize your booking for arrival within 1–2 hours.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Shadman Akhtar"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Phone / WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>
            </div>

            {/* Area & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Address / Specific Area *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder={`e.g. ${provider.area || 'Johar Town, Block G'}`}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Preferred Time Slot
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-hidden focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                >
                  <option>Morning (9 AM - 1 PM)</option>
                  <option>Afternoon (1 PM - 5 PM)</option>
                  <option>Evening (5 PM - 9 PM)</option>
                  <option>As Soon As Possible (ASAP)</option>
                </select>
              </div>
            </div>

            {/* Job Details */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Job Details & Issue Description *
              </label>
              <textarea
                rows={3}
                required
                value={jobDetails}
                onChange={(e) => setJobDetails(e.target.value)}
                placeholder="Describe what needs to be repaired or installed..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#ffca28] hover:bg-[#ffc107] text-[#0b3b38] shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Saving to Firestore...' : 'Confirm Booking Request →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
