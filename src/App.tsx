import React, { useState, useEffect, useMemo } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  ProviderCard 
} from './components/ProviderCard';
import { 
  BookingModal 
} from './components/BookingModal';
import { 
  AddProviderModal 
} from './components/AddProviderModal';
import { 
  BookingsTrackerModal 
} from './components/BookingsTrackerModal';
import { 
  RateCardSection 
} from './components/RateCardSection';
import { 
  ContactForm 
} from './components/ContactForm';
import { 
  ContactInfoCards 
} from './components/ContactInfoCards';
import { 
  FAQSection 
} from './components/FAQSection';
import { 
  MyInquiriesModal 
} from './components/MyInquiriesModal';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged,
  type User 
} from './lib/firebase';
import { 
  subscribeToUserInquiries, 
  subscribeToAllInquiries, 
  isUserAdmin 
} from './lib/inquiryService';
import { 
  subscribeProviders, 
  seedInitialProvidersIfNeeded 
} from './lib/providerService';
import { 
  subscribeBookings 
} from './lib/bookingService';
import type { Provider, Booking, Inquiry } from './types';
import { 
  Search, 
  Filter, 
  MapPin, 
  Wrench, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  PlusCircle, 
  ExternalLink,
  PhoneCall
} from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'AC & Cooling',
  'Electrical',
  'Plumbing',
  'Carpentry',
  'Auto Repair',
  'Painting & Design',
  'Cleaning',
  'Lock & Security',
  'Construction'
];

const CITIES = [
  'All Cities',
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Gujranwala'
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [urgentOnly, setUrgentOnly] = useState(false);

  // Modals
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState<Provider | null>(null);
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [isInquiriesOpen, setIsInquiriesOpen] = useState(false);

  const [currentLang, setCurrentLang] = useState<'en' | 'ur'>('en');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Monitor Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Initialize and subscribe to Firestore providers
  useEffect(() => {
    seedInitialProvidersIfNeeded();
    const unsubscribe = subscribeProviders((data) => {
      setProviders(data);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore bookings in real-time
  useEffect(() => {
    const unsubscribe = subscribeBookings((data) => {
      setBookings(data);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore inquiries in real-time
  useEffect(() => {
    if (!user) {
      setInquiries([]);
      return;
    }

    const isAdmin = isUserAdmin(user);
    if (isAdmin) {
      const unsubscribe = subscribeToAllInquiries((data) => {
        setInquiries(data);
      });
      return () => unsubscribe();
    } else {
      const unsubscribe = subscribeToUserInquiries(user.uid, (data) => {
        setInquiries(data);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('Signed in successfully with Google!');
    } catch (err) {
      console.error('Google sign-in error:', err);
      showToast('Sign-in cancelled or failed.');
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
      showToast('Signed out.');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filtered providers list
  const filteredProviders = useMemo(() => {
    return providers.filter((pro) => {
      // Category filter
      if (selectedCategory !== 'All Categories' && pro.category !== selectedCategory) {
        return false;
      }
      // City filter
      if (selectedCity !== 'All Cities' && pro.city !== selectedCity) {
        return false;
      }
      // Urgent filter
      if (urgentOnly && !pro.isEmergencyAvailable) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          pro.name.toLowerCase().includes(q) ||
          (pro.businessName && pro.businessName.toLowerCase().includes(q)) ||
          pro.category.toLowerCase().includes(q) ||
          pro.city.toLowerCase().includes(q) ||
          pro.area.toLowerCase().includes(q) ||
          pro.description.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [providers, selectedCategory, selectedCity, urgentOnly, searchQuery]);

  const isUrdu = currentLang === 'ur';

  return (
    <div
      className={`min-h-screen bg-[#fafcfb] text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] ${
        isUrdu ? 'rtl' : 'ltr'
      }`}
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b3b38] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-amber-400/30 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        user={user}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
        onOpenMyInquiries={() => setIsInquiriesOpen(true)}
        onOpenBookings={() => setIsBookingsOpen(true)}
        onOpenAddProvider={() => setIsAddProviderOpen(true)}
        inquiryCount={inquiries.length}
        bookingCount={bookings.length}
        currentLang={currentLang}
        onToggleLang={setCurrentLang}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-950 via-[#0b3b38] to-[#0d4743] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isUrdu ? 'پاکستان کا مستند سروس مارکیٹ پلیس' : 'Pakistan’s Trusted On-Demand Service Platform'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            {isUrdu ? (
              <>
                ہر ہنر۔ ایک کلک۔ <span className="text-amber-400">حل!</span>
              </>
            ) : (
              <>
                Every skill. One click.{' '}
                <span className="text-amber-400 underline decoration-amber-400/40 decoration-wavy underline-offset-8">
                  Fixed.
                </span>
              </>
            )}
          </h1>

          <p className="max-w-2xl mx-auto text-teal-100/90 text-sm sm:text-lg leading-relaxed">
            {isUrdu
              ? 'لاہور، کراچی اور اسلام آباد میں تصدیق شدہ الیکٹریشنز، اے سی مکینک، پلمبر اور کارپنٹرز سے فوری رابطہ کریں۔ واٹس ایپ اور آن لائن بکنگ دستیاب ہے۔'
              : 'Connect with verified electricians, AC repairmen, plumbers, carpenters, and painters across Pakistan. Direct WhatsApp chat and live cloud bookings.'}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl sm:rounded-full p-2 shadow-2xl flex flex-col sm:flex-row items-center gap-2 text-slate-800">
            <div className="flex-1 flex items-center gap-2.5 px-4 w-full">
              <Search className="w-5 h-5 text-teal-800 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isUrdu
                    ? 'آپ کو کیا ٹھیک کروانا ہے؟ (مثال: اے سی، پلمبر، الیکٹریشن)'
                    : 'What do you need fixed? (e.g. AC Repair, Electrician, Plumber)'
                }
                className="w-full py-2.5 bg-transparent text-sm focus:outline-hidden placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={() => {
                const el = document.getElementById('providers-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl sm:rounded-full bg-[#ffca28] hover:bg-[#ffc107] text-[#0b3b38] font-black text-sm shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              {isUrdu ? 'کاریگر تلاش کریں →' : 'Find a Pro →'}
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs">
            <div className="flex items-center gap-2 text-teal-200">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span><strong>100%</strong> CNIC & Skill Verified</span>
            </div>
            <div className="flex items-center gap-2 text-teal-200">
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>Direct WhatsApp & Call</span>
            </div>
            <div className="flex items-center gap-2 text-teal-200">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Fast Emergency Arrival</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-8 mb-20 relative z-20 space-y-12">
        {/* Filter and Category Bar Card */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md space-y-4">
          {/* Top Filter Controls: Category, City, Urgent Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Category Select */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-hidden focus:border-teal-700 cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Select */}
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-hidden focus:border-teal-700 cursor-pointer"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right: Urgent 24/7 Filter Toggle */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={urgentOnly}
                  onChange={(e) => setUrgentOnly(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                  <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {isUrdu ? 'صرف ہنگامی کاریگر' : '24/7 Emergency Available'}
                </span>
              </label>

              <button
                onClick={() => setIsAddProviderOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 font-bold text-xs hover:bg-teal-100 transition-colors border border-teal-200 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'اپنا ہنر درج کریں' : 'Join as Provider'}</span>
              </button>
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0b3b38] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* Providers Directory Grid */}
        <section id="providers-section" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-[#0b3b38]">
                  {isUrdu ? 'مستند کاریگر اور سروس فراہم کنندگان' : 'Verified Service Providers'}
                </h2>
                <span className="bg-amber-400 text-teal-950 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                  {filteredProviders.length} Pro{filteredProviders.length === 1 ? '' : 's'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {selectedCategory !== 'All Categories' ? selectedCategory : 'All Trades'} in{' '}
                {selectedCity !== 'All Cities' ? selectedCity : 'Pakistan'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBookingsOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                View Bookings Tracker ({bookings.length})
              </button>
            </div>
          </div>

          {filteredProviders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl mx-auto flex items-center justify-center">
                <Wrench className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Providers Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We haven't found any providers in {selectedCity} for {selectedCategory} yet. Be the first skilled worker to register!
              </p>
              <button
                onClick={() => setIsAddProviderOpen(true)}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#ffca28] text-[#0b3b38] font-black text-xs shadow-md hover:bg-[#ffc107] cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Register as First Provider</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProviders.map((pro) => (
                <ProviderCard
                  key={pro.id}
                  provider={pro}
                  onBook={(p) => setSelectedProviderForBooking(p)}
                  currentLang={currentLang}
                />
              ))}
            </div>
          )}
        </section>

        {/* Standard Market Rate Card Section */}
        <RateCardSection currentLang={currentLang} />

        {/* The Direct Contact & Inquiry Form */}
        <section id="contact-inquiry">
          <ContactForm
            user={user}
            onLogin={handleGoogleLogin}
            onSuccessSubmission={(inq) => showToast(`Inquiry #${inq.id} recorded!`)}
            currentLang={currentLang}
          />
        </section>

        {/* Contact Info Channels (Developer attribution & channels) */}
        <ContactInfoCards currentLang={currentLang} />

        {/* FAQ Section */}
        <FAQSection currentLang={currentLang} />
      </main>

      {/* Modals */}
      <BookingModal
        provider={selectedProviderForBooking}
        onClose={() => setSelectedProviderForBooking(null)}
        onBookingSuccess={(bk) => showToast(`Booking #${bk.id} recorded in Firestore!`)}
        currentLang={currentLang}
      />

      <AddProviderModal
        isOpen={isAddProviderOpen}
        onClose={() => setIsAddProviderOpen(false)}
        onProviderAdded={(p) => showToast(`Provider ${p.name} registered in Firestore!`)}
        currentLang={currentLang}
      />

      <BookingsTrackerModal
        isOpen={isBookingsOpen}
        onClose={() => setIsBookingsOpen(false)}
        bookings={bookings}
        currentUser={user}
        currentLang={currentLang}
      />

      <MyInquiriesModal
        isOpen={isInquiriesOpen}
        onClose={() => setIsInquiriesOpen(false)}
        inquiries={inquiries}
        user={user}
        currentLang={currentLang}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-14 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0b3b38] flex items-center justify-center text-amber-400 font-black">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-white text-base">
                FIXER <span className="text-amber-400">Pakistan</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Every skill. One click. Fixed.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 font-medium">
            <a
              href="https://fixer-pak.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors inline-flex items-center gap-1"
            >
              Live Production Site <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => setIsAddProviderOpen(true)}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              + Register as Craftsman
            </button>
            <button
              onClick={() => setIsBookingsOpen(true)}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Bookings ({bookings.length})
            </button>
            <a
              href="mailto:akhtarshadman044@gmail.com"
              className="hover:text-white transition-colors"
            >
              Contact Developer
            </a>
          </div>

          <div className="text-center md:text-right text-slate-500">
            <p>
              Engineered by{' '}
              <strong className="text-slate-300 font-semibold">Shadman Akhtar</strong>
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              AI Engineer & Data Scientist • Pakistan
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
