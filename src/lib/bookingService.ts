import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import type { Booking } from '../types';

/**
 * Creates and submits a booking to Firestore
 */
export async function createBooking(
  data: Omit<Booking, 'id' | 'createdAt' | 'status'>
): Promise<Booking> {
  const id = 'bk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const payload: Booking = {
    ...data,
    id,
    status: 'requested',
    createdAt: now,
  };

  const docPath = `bookings/${id}`;
  try {
    await setDoc(doc(db, 'bookings', id), payload);
    return payload;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

/**
 * Listens to all bookings in real time
 */
export function subscribeBookings(
  onData: (bookings: Booking[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const collectionPath = 'bookings';
  const colRef = collection(db, collectionPath);

  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      const items: Booking[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Booking);
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
 * Updates status of a booking request
 */
export async function updateBookingStatus(
  bookingId: string,
  newStatus: Booking['status']
): Promise<void> {
  const docPath = `bookings/${bookingId}`;
  try {
    const docRef = doc(db, 'bookings', bookingId);
    await updateDoc(docRef, { status: newStatus });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, docPath);
  }
}
