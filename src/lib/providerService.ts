import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  getDocs,
  query,
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import type { Provider } from '../types';

export const INITIAL_PROVIDERS: Provider[] = [
  {
    id: 'pro-ac-lahore-1',
    name: 'Muhammad Usman',
    businessName: 'Master Coolers & AC Solutions',
    category: 'AC & Cooling',
    city: 'Lahore',
    area: 'Gulberg & DHA',
    phone: '0300-8451920',
    whatsapp: '923008451920',
    experienceYears: '9+ Years',
    basePrice: 'Rs. 1,500',
    rating: '4.9',
    reviewCount: '54',
    isVerified: true,
    isEmergencyAvailable: true,
    description: 'Expert inverter & split AC repair, gas filling (R410/R32), deep jet chemical wash, and compressor replacements. 90-day service warranty.',
    photoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pro-elec-lahore-2',
    name: 'Tariq Mehmood',
    businessName: 'Tariq Electrician & Smart Wiring',
    category: 'Electrical',
    city: 'Lahore',
    area: 'Johar Town & Model Town',
    phone: '0321-4198273',
    whatsapp: '923214198273',
    experienceYears: '12+ Years',
    basePrice: 'Rs. 600',
    rating: '4.8',
    reviewCount: '48',
    isVerified: true,
    isEmergencyAvailable: true,
    description: 'Short circuit diagnosis, UPS & solar inverter wiring, breaker replacement, chandelier & LED lighting fixture installation. Fast arrival.',
    photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pro-plumb-isb-3',
    name: 'Rana Zulfiqar',
    businessName: 'Al-Madina Sanitary & Plumbing',
    category: 'Plumbing',
    city: 'Islamabad',
    area: 'F-7, G-11 & Blue Area',
    phone: '0333-5129841',
    whatsapp: '923335129841',
    experienceYears: '10+ Years',
    basePrice: 'Rs. 700',
    rating: '4.9',
    reviewCount: '63',
    isVerified: true,
    isEmergencyAvailable: true,
    description: 'Concealed pipe leakage detection, water motor repair, geyser installation (instant & storage), bathroom sanitary and mixer tap fitting.',
    photoUrl: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pro-carp-rwp-4',
    name: 'Haji Aslam',
    businessName: 'Aslam WoodCraft & Polish',
    category: 'Carpentry',
    city: 'Rawalpindi',
    area: 'Saddar & Bahria Town',
    phone: '0315-9988221',
    whatsapp: '923159988221',
    experienceYears: '15+ Years',
    basePrice: 'Rs. 800',
    rating: '4.8',
    reviewCount: '37',
    isVerified: true,
    isEmergencyAvailable: false,
    description: 'Custom wooden doors, wardrobe lock repairs, bed repair, kitchen cabinet hinges replacement, deco & spirit polish restoration.',
    photoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pro-paint-khi-5',
    name: 'Kamran Siddiqui',
    businessName: 'Karachi Master Painters',
    category: 'Painting & Design',
    city: 'Karachi',
    area: 'Clifton & DHA',
    phone: '0302-2345678',
    whatsapp: '923022345678',
    experienceYears: '8+ Years',
    basePrice: 'Rs. 1,000',
    rating: '4.9',
    reviewCount: '42',
    isVerified: true,
    isEmergencyAvailable: false,
    description: 'Weather sheet exterior coating, plastic emulsion, texture wall design, moisture seepage dampness treatment, and rockwall painting.',
    photoUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pro-auto-khi-6',
    name: 'Ustad Shaukat',
    businessName: 'Quick Roadside Auto Mechanics',
    category: 'Auto Repair',
    city: 'Karachi',
    area: 'Gulshan-e-Iqbal & PECHS',
    phone: '0345-8765432',
    whatsapp: '923458765432',
    experienceYears: '14+ Years',
    basePrice: 'Rs. 1,200',
    rating: '4.7',
    reviewCount: '31',
    isVerified: true,
    isEmergencyAvailable: true,
    description: 'On-site breakdown roadside assistance, battery jumpstart, car brake tuning, EFI computerized tuning, and engine oil inspection.',
    photoUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pro-clean-fsd-7',
    name: 'Bashir Ahmed',
    businessName: 'Pak Deep Clean Services',
    category: 'Cleaning',
    city: 'Faisalabad',
    area: 'Madina Town & Peoples Colony',
    phone: '0301-7654321',
    whatsapp: '923017654321',
    experienceYears: '6+ Years',
    basePrice: 'Rs. 1,800',
    rating: '4.9',
    reviewCount: '45',
    isVerified: true,
    isEmergencyAvailable: false,
    description: 'Complete home deep cleaning, water tank fumigation, sofa & carpet shampoo wash, kitchen grease removal with professional machines.',
    photoUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pro-cctv-isb-8',
    name: 'Farhan Ali',
    businessName: 'Falcon CCTV & Lock Security',
    category: 'Lock & Security',
    city: 'Islamabad',
    area: 'G-9, I-8 & Rawalpindi',
    phone: '0331-5554433',
    whatsapp: '923315554433',
    experienceYears: '7+ Years',
    basePrice: 'Rs. 900',
    rating: '4.9',
    reviewCount: '39',
    isVerified: true,
    isEmergencyAvailable: true,
    description: 'HD IP Camera installation, DVR/NVR cloud mobile viewing setup, emergency house lock opening, biometric smart door locks fitting.',
    photoUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date().toISOString(),
  }
];

/**
 * Initializes and seeds initial providers if database is empty
 */
export async function seedInitialProvidersIfNeeded(): Promise<void> {
  const collectionPath = 'providers';
  try {
    const snap = await getDocs(collection(db, collectionPath));
    if (snap.empty) {
      for (const pro of INITIAL_PROVIDERS) {
        await setDoc(doc(db, collectionPath, pro.id), pro);
      }
    }
  } catch (err) {
    console.warn('Initial seeding note:', err);
  }
}

/**
 * Subscribes to all providers in real-time
 */
export function subscribeProviders(
  onData: (providers: Provider[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const collectionPath = 'providers';
  const q = collection(db, collectionPath);

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        // Return initial static providers if database has none yet
        onData(INITIAL_PROVIDERS);
        return;
      }
      const items: Provider[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Provider);
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );

  return unsubscribe;
}

/**
 * Adds a new craftsman / provider
 */
export async function addProvider(providerData: Omit<Provider, 'id' | 'createdAt'>): Promise<Provider> {
  const id = 'pro_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const newProvider: Provider = {
    ...providerData,
    id,
    rating: providerData.rating || '5.0',
    reviewCount: providerData.reviewCount || '1',
    isVerified: true,
    createdAt: now,
  };

  const docPath = `providers/${id}`;
  try {
    await setDoc(doc(db, 'providers', id), newProvider);
    return newProvider;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}
