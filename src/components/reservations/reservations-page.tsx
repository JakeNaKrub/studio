"use client";
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
import { useMobile } from "@/hooks/use-mobile";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ReservationsPageProps {
  reservations: Reservation[];
}

export function ReservationsPage({ reservations }: ReservationsPageProps) {
  const isMobile = useMobile();

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        {!isMobile && (
          <div>
            <h1 className="text-3xl font-bold font-headline">Reservations</h1>
            <p className="text-muted-foreground">Manage common room bookings</p>
          </div>
        )}
        <ReservationDialog>
          <Button>
            <PlusCircle className="mr-2" />
            Create Reservation
          </Button>
        </ReservationDialog>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">All Reservations</h2>
            {isMobile ? (
              <ScrollArea className="w-48 whitespace-nowrap">
                <TabsList>
                    <TabsTrigger value="calendar">
                    <CalendarIcon className="mr-2" />
                    Calendar
                    </TabsTrigger>
                    <TabsTrigger value="list">
                    <List className="mr-2" />
                    List
                    </TabsTrigger>
                </TabsList>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            ) : (
              <TabsList>
                  <TabsTrigger value="calendar">
                  <CalendarIcon className="mr-2" />
                  Calendar
                  </TabsTrigger>
                  <TabsTrigger value="list">
                  <List className="mr-2" />
                  List
                  </TabsTrigger>
              </TabsList>
            )}
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
  );
}
