"use client";

import { useMemoFirebase } from "@/firebase/provider";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection, useFirestore } from "@/firebase";
import { ReservationsPage } from "@/components/reservations/reservations-page";
import type { Reservation } from "@/lib/types";

export default function Dashboard() {
  const firestore = useFirestore();

  const reservationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "reservations"), orderBy("date", "desc"));
  }, [firestore]);

  const { data: reservations, isLoading } = useCollection<Reservation>(reservationsQuery);

  if (isLoading) {
    return <div>Loading reservations...</div>
  }

  return <ReservationsPage reservations={reservations || []} />;
}
