'use client';
import { useMemoFirebase } from "@/firebase/provider";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection, useFirestore } from "@/firebase";
import type { Reservation } from "@/lib/types";
import { ReservationsPage } from '@/components/reservations/reservations-page';

export default function Home() {
  const firestore = useFirestore();

  const reservationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "reservations"), orderBy("date", "desc"));
  }, [firestore]);

  const { data: reservations, isLoading } = useCollection<Reservation>(reservationsQuery);

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <ReservationsPage reservations={reservations || []} />
    </div>
  );
}
