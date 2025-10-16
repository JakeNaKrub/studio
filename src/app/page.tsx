import { getReservations } from "@/lib/actions";
import { ReservationsPage } from "@/components/reservations/reservations-page";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const reservations = await getReservations();

  return <ReservationsPage reservations={reservations} />;
}
