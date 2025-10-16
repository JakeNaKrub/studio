"use client";

import * as React from "react";
import { format, isSameDay, parseISO } from "date-fns";
import type { Reservation } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Building2 } from "lucide-react";

interface ReservationsCalendarProps {
  reservations: Reservation[];
}

export function ReservationsCalendar({ reservations }: ReservationsCalendarProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const reservationsByDay = React.useMemo(() => {
    return reservations.reduce((acc, reservation) => {
      const day = format(parseISO(reservation.date), "yyyy-MM-dd");
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(reservation);
      return acc;
    }, {} as Record<string, Reservation[]>);
  }, [reservations]);

  const selectedDayReservations = date
    ? reservationsByDay[format(date, "yyyy-MM-dd")] || []
    : [];

  const modifiers = {
    hasReservation: (day: Date) => {
      return !!reservationsByDay[format(day, "yyyy-MM-dd")];
    },
  };

  const modifiersStyles = {
    hasReservation: {
      fontWeight: "bold",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2">
        <CardContent className="p-0 md:p-6 flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            Schedule for {date ? format(date, "PPP") : "..."}
          </CardTitle>
           <CardDescription>
            {selectedDayReservations.length} reservation(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedDayReservations.length > 0 ? (
            <ul className="space-y-4">
              {selectedDayReservations
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((res) => (
                  <li key={res.id} className="p-4 rounded-lg border bg-card">
                    <p className="font-semibold">{res.meetingName}</p>
                    <p className="text-sm text-muted-foreground">
                      by {res.personName}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {res.startTime} - {res.endTime}
                        </span>
                      </div>
                      <Badge
                        variant={
                          res.roomSize === "large" ? "default" : "secondary"
                        }
                        className="capitalize flex items-center gap-1"
                      >
                        <Users className="h-3 w-3" /> {res.roomSize}
                      </Badge>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-48">
              <Building2 className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                No reservations for this day.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
