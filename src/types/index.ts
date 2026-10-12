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
