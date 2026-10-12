import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
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
import type { Inquiry } from './types';
import { 
  Wrench, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Heart,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ur'>('en');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Monitor Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
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
    } catch (err: unknown) {
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

  const handleSuccessSubmission = (newInquiry: Inquiry) => {
    showToast(`Inquiry #${newInquiry.id} successfully recorded!`);
    // If not signed in, still add to local list so user sees it in modal during session
    if (!user) {
      setInquiries((prev) => [newInquiry, ...prev]);
    }
  };

  const isUrdu = currentLang === 'ur';

  return (
    <div
      className={`min-h-screen bg-[#fafcfb] text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] ${
        isUrdu ? 'rtl' : 'ltr'
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b3b38] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-amber-400/30 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Header */}
      <Header
        user={user}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
        onOpenMyInquiries={() => setIsModalOpen(true)}
        inquiryCount={inquiries.length}
        currentLang={currentLang}
        onToggleLang={setCurrentLang}
      />

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-950 via-[#0b3b38] to-[#0d4743] text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isUrdu
                ? 'فکسر پاکستان — سروس اور تکنیکی رہنمائی'
                : 'Official Contact Portal for fixer-pak.netlify.app'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            {isUrdu ? (
              <>
                کوئی بھی مسئلہ ہو؟ <span className="text-amber-400">فکسر</span> سے رابطہ کریں
              </>
            ) : (
              <>
                Need Something Fixed?{' '}
                <span className="text-amber-400 underline decoration-amber-400/40 decoration-wavy underline-offset-8">
                  Get In Touch.
                </span>
              </>
            )}
          </h1>

          <p className="max-w-2xl mx-auto text-teal-100/90 text-sm sm:text-lg leading-relaxed font-normal">
            {isUrdu
              ? 'لاہور، کراچی، اسلام آباد اور پورے پاکستان میں ہنر مند کاریگروں سے متعلق سوالات، رجسٹریشن یا مدد کے لیے فوری انکوائری بھیجیں۔'
              : 'Directly connect with FIXER. Whether you need an electrician, AC technician, plumber, carpenter, or want to list your craft as a service provider.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 text-teal-200">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Verified Local Craftsmen
            </span>
            <span className="inline-flex items-center gap-1.5 text-teal-200">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              Direct Firestore Data Sync
            </span>
            <span className="inline-flex items-center gap-1.5 text-teal-200">
              <Wrench className="w-4 h-4 text-amber-400" />
              Over 10+ Trades Covered
            </span>
          </div>
        </div>
      </section>

      {/* Main Form Container (Overlapping Hero) */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-10 mb-16 relative z-20 space-y-12">
        {/* The Core Contact Form */}
        <ContactForm
          user={user}
          onLogin={handleGoogleLogin}
          onSuccessSubmission={handleSuccessSubmission}
          currentLang={currentLang}
        />

        {/* Contact Info Channels */}
        <ContactInfoCards currentLang={currentLang} />

        {/* Frequently Asked Questions */}
        <FAQSection currentLang={currentLang} />
      </main>

      {/* Inquiries Modal / Drawer */}
      <MyInquiriesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        inquiries={inquiries}
        user={user}
        currentLang={currentLang}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0b3b38] flex items-center justify-center text-amber-400 font-black">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm">
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
              Main Website <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="mailto:akhtarshadman044@gmail.com"
              className="hover:text-white transition-colors"
            >
              Contact Developer
            </a>
            {user && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="hover:text-amber-400 transition-colors font-bold cursor-pointer"
              >
                View Inquiries ({inquiries.length})
              </button>
            )}
          </div>

          <div className="text-center md:text-right text-slate-500">
            <p>
              Created by{' '}
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
