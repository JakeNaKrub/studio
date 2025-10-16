'use client';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  Firestore,
} from 'firebase/firestore';
import type { Reservation, ReservationData } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const RESERVATIONS_COLLECTION = 'reservations';

/**
 * Creates a new reservation document in Firestore.
 * @param firestore - The Firestore instance.
 * @param data - The reservation data to save.
 * @returns The newly created reservation with its ID.
 */
export async function createReservation(firestore: Firestore, data: ReservationData): Promise<Reservation> {
  const collectionRef = collection(firestore, RESERVATIONS_COLLECTION);
  const docRef = await addDoc(collectionRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: collectionRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      );
      // Re-throw to be caught by the calling function's try/catch
      throw error;
    });

  return { id: docRef.id, ...data };
}

/**
 * Updates an existing reservation document in Firestore.
 * @param firestore - The Firestore instance.
 * @param id - The ID of the reservation to update.
 * @param data - The partial data to update.
 * @returns The updated reservation.
 */
export async function updateReservation(firestore: Firestore, id: string, data: Partial<ReservationData>): Promise<Reservation> {
  const docRef = doc(firestore, RESERVATIONS_COLLECTION, id);
  await updateDoc(docRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      );
      throw error;
    });
  
  // To return the full updated object, we need to fetch it
  const updatedDoc = await getReservation(firestore, id);
  if (!updatedDoc) {
      throw new Error("Failed to fetch updated reservation.");
  }
  return updatedDoc;
}

/**
 * Deletes a reservation document from Firestore.
 * @param firestore - The Firestore instance.
 * @param id - The ID of the reservation to delete.
 */
export async function deleteReservation(firestore: Firestore, id: string): Promise<void> {
  const docRef = doc(firestore, RESERVATIONS_COLLECTION, id);
  await deleteDoc(docRef)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      );
      throw error;
    });
}

/**
 * Fetches a single reservation document.
 * @param firestore - The Firestore instance.
 * @param id - The ID of the reservation to fetch.
 * @returns The reservation object or null if not found.
 */
export async function getReservation(firestore: Firestore, id: string): Promise<Reservation | null> {
    const docRef = doc(firestore, RESERVATIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Reservation;
    } else {
        return null;
    }
}
