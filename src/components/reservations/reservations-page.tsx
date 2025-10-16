'use client';
import * as React from "react";
import type { Reservation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ReservationDialog } from "@/components/reservations/reservation-dialog";
import { ReservationsList } from "@/components/reservations/reservations-list";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface ReservationsPageProps {
  reservations: Reservation[];
}

export function ReservationsPage({ reservations }: ReservationsPageProps) {

  return (
    <div className="py-4 md:py-10">
      <div>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-headline">Reservations</h1>
            <p className="text-muted-foreground">Manage common room bookings</p>
          </div>
          <div>
            <ReservationDialog>
              <Button className="w-full">
                <PlusCircle className="mr-2" />
                Create Reservation
              </Button>
            </ReservationDialog>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">All Reservations</h2>
        </div>

        <Card>
            <CardContent className="p-0">
                <ReservationsList reservations={reservations} />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
