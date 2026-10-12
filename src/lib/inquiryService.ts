import { 
  collection, 
  doc, 
  setDoc, 
  query, 
  where, 
  onSnapshot, 
  updateDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, type User } from './firebase';
import type { Inquiry, InquiryFormData } from '../types';

export const ADMIN_EMAIL = 'akhtarshadman044@gmail.com';

export function isUserAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  return user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/**
 * Creates and submits an inquiry to Firestore
 */
export async function submitInquiry(
  formData: InquiryFormData,
  currentUser: User | null
): Promise<Inquiry> {
  const inquiryId = 'inq_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const now = new Date().toISOString();

  const payload: Inquiry = {
    id: inquiryId,
    name: formData.name.trim(),
    email: formData.email.trim().toLowerCase(),
    phone: formData.phone.trim() || undefined,
    category: formData.category || 'General Inquiry',
    city: formData.city || 'Not Specified',
    subject: formData.subject.trim() || 'General Inquiry',
    message: formData.message.trim(),
    status: 'pending',
    createdAt: now,
  };

  if (currentUser) {
    payload.userId = currentUser.uid;
    payload.userEmail = currentUser.email || undefined;
  } else {
    payload.userId = 'guest';
  }

  const docPath = `inquiries/${inquiryId}`;
  try {
    const docRef = doc(db, 'inquiries', inquiryId);
    await setDoc(docRef, payload);

    // Automatically trigger email confirmation service
    try {
      const emailRes = await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryId: payload.id,
          name: payload.name,
          email: payload.email,
          category: payload.category,
          city: payload.city,
          subject: payload.subject,
          message: payload.message,
        }),
      });
      if (emailRes.ok) {
        payload.emailConfirmationSent = true;
      }
    } catch (emailErr) {
      console.warn('[Email Confirmation Service] Notification dispatch notice:', emailErr);
    }

    return payload;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

/**
 * Real-time listener for current user's submitted inquiries
 */
export function subscribeToUserInquiries(
  userId: string,
  onData: (inquiries: Inquiry[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const collectionPath = 'inquiries';
  const q = query(collection(db, collectionPath), where('userId', '==', userId));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const items: Inquiry[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Inquiry);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
 * Real-time listener for Admin (all inquiries)
 */
export function subscribeToAllInquiries(
  onData: (inquiries: Inquiry[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const collectionPath = 'inquiries';
  const colRef = collection(db, collectionPath);

  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      const items: Inquiry[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Inquiry);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
 * Update status of an inquiry (Admin only)
 */
export async function updateInquiryStatus(
  inquiryId: string,
  newStatus: 'pending' | 'in-review' | 'resolved'
): Promise<void> {
  const docPath = `inquiries/${inquiryId}`;
  try {
    const docRef = doc(db, 'inquiries', inquiryId);
    await updateDoc(docRef, { status: newStatus });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, docPath);
  }
}
