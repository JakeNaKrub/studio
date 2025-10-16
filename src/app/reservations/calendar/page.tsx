import { getReservations } from '@/lib/actions';
import { ReservationsCalendar } from '@/components/reservations/reservations-calendar';

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const reservations = await getReservations();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold font-headline mb-2">Calendar View</h1>
      <p className="text-muted-foreground mb-8">
        Visualize all bookings and select a date to see its schedule.
      </p>
      <ReservationsCalendar reservations={reservations} />
    </div>
  );
}
