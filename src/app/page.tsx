'use client'
import { ReservationsPage } from '@/components/reservations/reservations-page';
import { useMemoFirebase } from "@/firebase/provider";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection, useFirestore } from "@/firebase";
import type { Reservation } from "@/lib/types";

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <ReservationsPage reservations={reservations || []} />
    </div>
  );
}
