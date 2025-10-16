"use client";
import { useMemoFirebase } from "@/firebase/provider";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection, useFirestore } from "@/firebase";
import type { Reservation } from "@/lib/types";
import { ReservationsCalendar } from '@/components/reservations/reservations-calendar';

export default function CalendarPage() {
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
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold font-headline mb-2">Calendar View</h1>
      <p className="text-muted-foreground mb-8">
        Visualize all bookings and select a date to see its schedule.
      </p>
      <ReservationsCalendar reservations={reservations || []} />
    </div>
  );
}
