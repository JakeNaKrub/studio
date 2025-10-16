import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, List, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ReservationDialog } from '@/components/reservations/reservation-dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Dashboard() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-background');

  return (
    <div className="flex flex-col">
      <section className="relative w-full h-64 md:h-80 lg:h-96">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            data-ai-hint={heroImage.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-center text-primary-foreground p-4">
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">
            CommonRoom Reservation
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-primary-foreground/90">
            Effortlessly book a space for your meetings and events.
          </p>
          <div className="mt-8">
            <ReservationDialog>
              <Button size="lg">
                <PlusCircle className="mr-2" />
                Create New Reservation
              </Button>
            </ReservationDialog>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-12 px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2">
          <Link href="/reservations/list">
            <Card className="h-full transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <List className="h-10 w-10 text-primary" />
                <div>
                  <CardTitle className="text-2xl font-bold">List View</CardTitle>
                  <CardDescription>View all upcoming reservations</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  Get a comprehensive overview of all scheduled meetings in a
                  clear, sortable list format. Perfect for quick checks and
                  management.
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/reservations/calendar">
            <Card className="h-full transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <CalendarDays className="h-10 w-10 text-primary" />
                <div>
                  <CardTitle className="text-2xl font-bold">Calendar View</CardTitle>
                  <CardDescription>Visualize bookings by date</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  See reservations on a monthly calendar. Easily spot available
                  dates and plan your next event with a visual layout of the schedule.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
