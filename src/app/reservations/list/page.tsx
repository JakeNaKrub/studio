import { getReservations } from "@/lib/actions";
import { ReservationsList } from "@/components/reservations/reservations-list";

export const dynamic = "force-dynamic";

export default async function ListPage() {
  const reservations = await getReservations();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold font-headline mb-2">All Reservations</h1>
      <p className="text-muted-foreground mb-8">
        Here is a complete list of all scheduled room bookings.
      </p>
      <ReservationsList reservations={reservations} />
    </div>
  );
}
