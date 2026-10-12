import React, { useState } from 'react';
import { 
  X, 
  Wrench, 
  User, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Briefcase,
  Zap,
  Tag
} from 'lucide-react';
import type { Provider } from '../types';
import { addProvider } from '../lib/providerService';

interface AddProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProviderAdded: (provider: Provider) => void;
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
  'Other'
];

const CITIES = [
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
  'Other'
];

export const AddProviderModal: React.FC<AddProviderModalProps> = ({
  isOpen,
  onClose,
  onProviderAdded,
  currentLang,
}) => {
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('AC & Cooling');
  const [city, setCity] = useState('Lahore');
  const [area, setArea] = useState('');
  const [phone, setPhone] = useState('');
  const [experienceYears, setExperienceYears] = useState('5+ Years');
  const [basePrice, setBasePrice] = useState('Rs. 1,000');
  const [description, setDescription] = useState('');
  const [isEmergencyAvailable, setIsEmergencyAvailable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const isUrdu = currentLang === 'ur';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError('Please provide your name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setError('Please provide a valid phone number.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError('Please provide a brief description of your services (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      const newPro = await addProvider({
        name: name.trim(),
        businessName: businessName.trim() || undefined,
        category,
        city,
        area: area.trim() || 'Central',
        phone: phone.trim(),
        whatsapp: phone.trim().replace(/[^0-9]/g, ''),
        experienceYears,
        basePrice: basePrice.trim() || 'Rs. 1,000',
        rating: '5.0',
        reviewCount: '1',
        isVerified: true,
        isEmergencyAvailable,
        description: description.trim(),
        photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
      });

      setSuccess(true);
      onProviderAdded(newPro);
    } catch (err: unknown) {
      console.error('Failed to add provider:', err);
      setError('Could not save provider to Firestore. Please try again.');
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
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-teal-950 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {isUrdu ? 'بطور کاریگر رجسٹریشن' : 'Register Your Service on FIXER'}
              </h3>
              <p className="text-xs text-teal-200">
                Join our network of verified local service providers in Pakistan
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

        {/* Content */}
        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#0b3b38]">
              {isUrdu ? 'مبارک ہو! آپ کا پروفائل شامل ہو گیا ہے' : 'Listing Published!'}
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your profile is now saved live in Firestore. Customers in <strong>{city}</strong> can find and book your <strong>{category}</strong> services immediately.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#0b3b38] text-white font-bold text-xs hover:bg-[#12534e] transition-colors cursor-pointer"
            >
              View Directory
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ustad Imran"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Business / Workshop Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Imran AC Solutions"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-teal-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Service Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-hidden focus:border-teal-700"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Primary City *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-hidden focus:border-teal-700"
                >
                  {CITIES.map((ci) => (
                    <option key={ci} value={ci}>{ci}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Areas Served
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. DHA, Gulberg"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Starting Rate
                </label>
                <input
                  type="text"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="Rs. 1,000"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-teal-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Description of Experience & Tools *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention your experience, equipment, and warranties offered..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-teal-700"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="emergencyCheckbox"
                checked={isEmergencyAvailable}
                onChange={(e) => setIsEmergencyAvailable(e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
              <label htmlFor="emergencyCheckbox" className="text-xs text-slate-700 cursor-pointer">
                Available for 24/7 Emergency Repairs
              </label>
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
                {isSubmitting ? 'Registering...' : 'Register as Provider →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
