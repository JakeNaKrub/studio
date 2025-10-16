'use client';
import * as React from "react";
import type { Reservation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, List, Calendar as CalendarIcon } from "lucide-react";
import { ReservationDialog } from "@/components/reservations/reservation-dialog";
import { ReservationsCalendar } from "@/components/reservations/reservations-calendar";
import { ReservationsList } from "@/components/reservations/reservations-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface ReservationsPageProps {
  reservations: Reservation[];
}

export function ReservationsPage({ reservations }: ReservationsPageProps) {

  const upcomingReservations = React.useMemo(() => {
    return reservations
      .filter(r => new Date(r.date) > new Date())
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0,5);
  }, [reservations]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 py-4 md:py-10">
      <div className="lg:col-span-2">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-headline">Reservations</h1>
            <p className="text-muted-foreground">Manage common room bookings</p>
          </div>
          <div className="lg:hidden">
            <ReservationDialog>
              <Button className="w-full">
                <PlusCircle className="mr-2" />
                Create Reservation
              </Button>
            </ReservationDialog>
          </div>
        </div>

        <Tabs defaultValue="calendar" className="w-full">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">All Reservations</h2>
              <TabsList className="grid w-full grid-cols-2 md:w-[200px]">
                  <TabsTrigger value="calendar">
                  <CalendarIcon className="mr-2" />
                  Calendar
                  </TabsTrigger>
                  <TabsTrigger value="list">
                  <List className="mr-2" />
                  List
                  </TabsTrigger>
              </TabsList>
          </div>

          <TabsContent value="calendar">
              <ReservationsCalendar reservations={reservations} />
          </TabsContent>
          <TabsContent value="list">
              <Card>
                  <CardContent className="p-0">
                      <ReservationsList reservations={reservations} />
                  </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div>
      <div className="hidden lg:block lg:col-span-1">
        <div className="sticky top-24 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Actions</h2>
            <ReservationDialog>
              <Button className="w-full">
                <PlusCircle className="mr-2" />
                Create Reservation
              </Button>
            </ReservationDialog>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Upcoming Reservations</h3>
            <Card>
                <CardContent className="p-0">
                    <ReservationsList reservations={upcomingReservations} />
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
