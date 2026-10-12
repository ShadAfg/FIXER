export interface Provider {
  id: string;
  userId?: string;
  name: string;
  businessName?: string;
  category: string;
  city: string;
  area: string;
  phone: string;
  whatsapp?: string;
  experienceYears?: string;
  basePrice?: string;
  rating: string;
  reviewCount: string;
  isVerified: boolean;
  isEmergencyAvailable: boolean;
  description: string;
  photoUrl?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  providerCategory: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  city: string;
  area?: string;
  preferredDate?: string;
  preferredTime?: string;
  jobDetails: string;
  isUrgent?: boolean;
  status: 'requested' | 'accepted' | 'declined' | 'completed';
  createdAt: string;
}

export interface Inquiry {
  id: string;
  userId?: string;
  userEmail?: string;
  name: string;
  email: string;
  phone?: string;
  category?: string;
  city?: string;
  subject?: string;
  message: string;
  status: 'pending' | 'in-review' | 'resolved';
  createdAt: string;
  emailConfirmationSent?: boolean;
}

export interface InquiryFormData {
  name: string;
  email: string;
  phone: string;
  category: string;
  city: string;
  subject: string;
  message: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  category?: string;
  city?: string;
  subject?: string;
  message?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface RateCard {
  category: string;
  icon: string;
  service: string;
  estimatedPrice: string;
  typicalDuration: string;
}
